import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { replaceFile, createFile, getFileContent } from '../utils/file';

suite('File Utilities Test Suite', function () {
    this.timeout(5000);

    let document: vscode.TextDocument;
    const tempDir = path.join(__dirname, 'testTemp');
    const testFileName = 'testFile.txt'; 
    const testFilePath = path.join(tempDir, testFileName); 

    setup(async () => {
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const initialContent = 'This is a test file content.';
        fs.writeFileSync(testFilePath, initialContent);

        document = await vscode.workspace.openTextDocument(testFilePath);
        await vscode.window.showTextDocument(document);
    });

    teardown(async () => {
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

        await new Promise(resolve => setTimeout(resolve, 100));

        if (fs.existsSync(tempDir)) {
            fs.rmdirSync(tempDir, { recursive: true });
        }
    });

    test('replaceFile updates the file content', async () => {
        const newContent = 'Updated content';
        await replaceFile(newContent);

        const updatedText = document.getText();
        assert.strictEqual(updatedText, newContent, 'The file content should be updated');
    });

    test('createFile creates a new PHP file', async () => {
        const newFileName = 'testFile';
        const content = '<?php\n echo "Hello World";\n?>';

        await createFile(newFileName, content);
        const newFileUri = vscode.Uri.file(path.join(tempDir, `${newFileName}.php`));
        const fileStat = await vscode.workspace.fs.stat(newFileUri);

        assert.strictEqual(fileStat.type, vscode.FileType.File, 'The new file should exist');

        const fileContent = await vscode.workspace.fs.readFile(newFileUri);
        assert.strictEqual(fileContent.toString(), content, 'The new file should have the correct content');
    });

    test('getFileContent reads a file correctly', async () => {
        const content = getFileContent(testFilePath);
        
        assert.strictEqual(content, 'This is a test file content.', 'File content should match the expected content');
    });
});