import { promises as fs } from 'fs';
import path from 'path';

async function findComposerJsonFiles(vendorDir: string): Promise<string[]> {
    let composerFiles: string[] = [];

    const items = await fs.readdir(vendorDir, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            const libraryDir = path.join(vendorDir, item.name);

            const directComposerPath = path.join(libraryDir, 'composer.json');
            try {
                const stat = await fs.stat(directComposerPath);
                if (stat.isFile()) {
                    composerFiles.push(directComposerPath);
                }
            } catch (err) {
            }

            const subItems = await fs.readdir(libraryDir, { withFileTypes: true });
            for (const subItem of subItems) {
                if (subItem.isDirectory()) {
                    const subComposerPath = path.join(libraryDir, subItem.name, 'composer.json');
                    try {
                        const stat = await fs.stat(subComposerPath);
                        if (stat.isFile()) {
                            composerFiles.push(subComposerPath);
                        }
                    } catch (err) {
                    }
                }
            }
        }
    }

    return composerFiles;
}

async function findFilePathsByNamespaces(namespaces: string[], currentFilePath: string): Promise<string[]> {
    const resolvedPaths: string[] = [];

    let dir = path.dirname(currentFilePath);
    while (dir !== path.parse(dir).root) {
        try {
            const stat = await fs.stat(path.join(dir, 'composer.json'));
            if (stat.isFile()) {
                break;
            }
        } catch (err) {
        }
        dir = path.dirname(dir);
    }

    const composerPath = path.join(dir, 'composer.json');
    const composerContent = await fs.readFile(composerPath, 'utf-8');

    const composerJson = JSON.parse(composerContent);

    const projectAutoload = extractAutoload(composerJson);

    for (const namespace of namespaces) {
        let filePath = await resolveFilePath(namespace, projectAutoload, dir);
        if (filePath) {
            resolvedPaths.push(filePath);
        }
    }

    const vendorDir = path.join(dir, 'vendor');

    try {
        const composerFiles = await findComposerJsonFiles(vendorDir);

        for (const libraryComposerPath of composerFiles) {
            try {
                const libraryContent = await fs.readFile(libraryComposerPath, 'utf-8');
                const libraryJson = JSON.parse(libraryContent);
                const libraryAutoload = extractAutoload(libraryJson);
                for (const namespace of namespaces) {
                    const filePath = await resolveFilePath(namespace, libraryAutoload, path.dirname(libraryComposerPath));
                    if (filePath) {
                        resolvedPaths.push(filePath);
                    }
                }
            } catch (err) {
                console.error(`Error reading or processing ${libraryComposerPath}:`, err);
            }
        }
    } catch (err) {
        console.error('Error reading vendor directory:', err);
    }

    return resolvedPaths;
}

async function resolveFilePath(namespace: string, autoload: Record<string, string>, baseDir: string): Promise<string | null> {
    for (const [namespacePrefix, directory] of Object.entries(autoload)) {
        if (namespace.startsWith(namespacePrefix)) {
            const relativePath = namespace.replace(namespacePrefix, '').replace(/\\/g, '/');
            const className = relativePath.split('\\').join('/');
            const filePath = path.join(baseDir, directory, `${className}.php`);
            
            const fileExists = await fs.stat(filePath).catch(() => false);
            if (fileExists) {
                return filePath;
            }
        }
    }
    return null;
}

function extractAutoload(composerJson: any): Record<string, string> {
    const autoload = composerJson.autoload || {};
    const autoloadDev = composerJson['autoload-dev'] || {};
    
    return {
        ...autoload['psr-4'],
        ...autoloadDev['psr-4']
    };
}

export { findFilePathsByNamespaces };
