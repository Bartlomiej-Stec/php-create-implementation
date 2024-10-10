import * as vscode from 'vscode';
import { ParsedCode } from './../interfaces/ParsedCode';
import { findFilePathsByNamespaces } from '../utils/filePath';
import { Implementation } from '../interfaces/Implementation';
import { Expression } from '../interfaces/Expression';
import { applyTemplate } from '../utils/templateUtils';
import { classTemplate } from '../utils/templates';
import { createFile } from '../utils/file';
import { parsePhpFile } from '../utils/codeParser';
import { ClassMethod } from './../interfaces/ClassMethod';
import {
    replaceFile, getFileContent
} from '../utils/file';
import {
    getMissingUseStatements,
    generateUseStatementString,
    findNamespaceFromString
} from '../utils/namespaces';
import {
    generateMissingImplementations
} from '../utils/implementationGenerator';

const config = vscode.workspace.getConfiguration('php-create-implementation');
const methodsPsr12 = config.get('curlyBracketSameLine') === false;

const convertName = (name: string, expressions: Expression[]) => {
    const suffix: string = config.get('implementedClassSuffix') || 'Service';
    const prefix: string = config.get('implementedClassPrefix') || '';
    expressions.forEach((expression: Expression) => {
        const regex = new RegExp(expression.regex, 'g');
        name = name.replace(regex, expression.replacement);
    });
    if (prefix !== '') {
        name = name.charAt(0).toUpperCase() + name.slice(1);
    }
    return prefix + name + suffix;
};


const getMethodsToImplement = (methods: ClassMethod[], implementedMethods: string[]): ClassMethod[] => {
    return methods.filter(method => !implementedMethods.includes(method.name) && !method.hasImplementation);
};


const insertTextAtPosition = (code: string, position: number, text: string) => {
    return code.slice(0, position) + text + code.slice(position);
};

const createImplementation = (implementation: Implementation): void => {
    const name: string = convertName(implementation.codeInfo.name, implementation.expressions);
    const missingUseStatements = getMissingUseStatements(implementation.codeInfo.methods, [], implementation.codeInfo.useStatements);
    const content: string = applyTemplate(classTemplate, {
        className: name,
        implementType: implementation.type === 'abstract' ? 'extends' : 'implements',
        parent: implementation.codeInfo.name,
        namespace: implementation.codeInfo.namespace ? `namespace ${implementation.codeInfo.namespace};` : '',
        useStatements: generateUseStatementString(missingUseStatements),
        methods: generateMissingImplementations(implementation.codeInfo.methods, methodsPsr12),
    });
    createFile(name, content);
};

const completeImplementation = (codeInfo: ParsedCode, fileCode: string, implementedStructures: string[]) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw new Error('No active editor found!');
    }
    const namespaces: string[] = [];
    implementedStructures.forEach((implementedStructure: string) => {
        const namespace = findNamespaceFromString(codeInfo.useStatements, implementedStructure);
        if(namespace.name === '' && !codeInfo.namespace){
            return;
        }
        const namespacePath = namespace.name === '' ? codeInfo.namespace + '\\' + implementedStructure : namespace.name;
        namespaces.push(namespacePath);
    });
    const currentFilePath = editor.document.uri.fsPath;
    findFilePathsByNamespaces(namespaces, currentFilePath)
        .then(filePaths => {
            let code: string = fileCode;
            filePaths.forEach(filePath => {
                const fileContent = getFileContent(filePath);
                const parentParsedCode: ParsedCode[] = parsePhpFile(fileContent);

                if (parentParsedCode.length === 0) {
                    throw new Error('Parent file content is not valid PHP');
                }

                const methodsToImplement = getMethodsToImplement(parentParsedCode[0].methods, codeInfo.methods.map(method => method.name));
                if (methodsToImplement.length > 0) {
                    const methodsString = generateMissingImplementations(methodsToImplement, methodsPsr12);
                    const addedText = `\n${methodsString}`;
                    code = insertTextAtPosition(code, codeInfo.endPosition-1 >= 0 ? codeInfo.endPosition-1 : 0, addedText);
                    codeInfo.endPosition += (addedText.length);
                }
                const missingUseStatements = getMissingUseStatements(parentParsedCode[0].methods, codeInfo.useStatements, parentParsedCode[0].useStatements);
                if (missingUseStatements.length > 0) {
                    const useStatementsString = generateUseStatementString(missingUseStatements);
                    const addedText = `\n${useStatementsString}`;
                    const position = codeInfo.statementsEnd ? codeInfo.statementsEnd+1 : codeInfo.startPosition-1;
                    code = insertTextAtPosition(code, position, addedText);
                    if(codeInfo.statementsEnd){
                        codeInfo.statementsEnd += addedText.length;
                    }
                    codeInfo.startPosition += addedText.length;
                    codeInfo.endPosition += addedText.length;
                }
            });

            if (fileCode !== code) {
                replaceFile(code);
            }
            else{
                throw new Error('All methods are already implemented');
            }

            if (filePaths.length === 0) {
                throw new Error('Parent file not found');
            }
        })
        .catch(err => {
            vscode.window.showErrorMessage(err.message);
        });
};

const generateInterfaceImplementation = (codeInfo: ParsedCode): void => {
    createImplementation(
        {
            codeInfo: codeInfo,
            expressions: config.get('expressionsNameFromInterface') || [],
            type: 'interface'
        }
    );
};

const generate = (): void => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw new Error('No active editor found!');
    }
    const fileCode: string = editor.document.getText();
    const parsedCode: ParsedCode[] = parsePhpFile(fileCode);
    if (parsedCode.length === 0) {
        throw new Error('There is nothing to implement');
    }
    
    parsedCode.forEach((codeInfo: ParsedCode) => {
        if (codeInfo.isInterface) {
            generateInterfaceImplementation(codeInfo);
        }

        if (codeInfo.implements.length > 0) {
            completeImplementation(codeInfo, fileCode, codeInfo.implements);
        }

        if (codeInfo.isAbstract) {
            createImplementation(
                {
                    codeInfo: codeInfo,
                    expressions: config.get('expressionsNameFromAbstract') || [],
                    type: 'abstract'
                }
            );
        }

        if (codeInfo.extends) {
            completeImplementation(codeInfo, fileCode, [codeInfo.extends]);
        }

    });

};

const implementAll = () => {
    try {
        generate();
    } catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(error.message);
        } else {
            vscode.window.showErrorMessage('An unexpected error occurred.');
        }
    }
};

export { implementAll };