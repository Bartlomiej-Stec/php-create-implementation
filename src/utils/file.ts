import * as vscode from 'vscode';
import * as fs from 'fs';
const path = require('path');

const replaceFile = async (content: string): Promise<void> => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw new Error('No active editor found!');
    }

    const edit = new vscode.WorkspaceEdit();
    const documentUri = editor.document.uri;

    try {
        const fullRange = new vscode.Range(
            editor.document.positionAt(0),
            editor.document.positionAt(editor.document.getText().length)
        );

        edit.replace(documentUri, fullRange, content);
        await vscode.workspace.applyEdit(edit);

        await editor.document.save();

        vscode.window.showInformationMessage(`File has been updated successfully!`);
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(`Error replacing file content: ${err.message}`);
        } else {
            throw new Error('An unknown error occurred while replacing file content.');
        }
    }
};

const createFile = async (name: string, content: string): Promise<void> => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw new Error('No active editor found!');
    }

    const currentFileUri = editor.document.uri;
    const currentFilePath = currentFileUri.fsPath;

    const newFileName = `${name}.php`;
    const newFilePath = path.join(path.dirname(currentFilePath), newFileName);

    const newFileUri = vscode.Uri.file(newFilePath);

    try {
        const fileExists = await vscode.workspace.fs.stat(newFileUri).then(
            () => true,
            () => false
        );

        if (fileExists) {
            vscode.window.showErrorMessage(`File already exists: ${newFileName}`);
            return;
        }

        await vscode.workspace.fs.writeFile(newFileUri, Buffer.from(content));
        vscode.window.showInformationMessage(`Created new file: ${newFileName}`);

        const document = await vscode.workspace.openTextDocument(newFileUri);
        await vscode.window.showTextDocument(document);
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(`Error creating file: ${err.message}`);
        } else {
            throw new Error('An unknown error occurred while creating the file.');
        }
    }
};


const getFileContent = (path: string): string => {
    try {
        const content = fs.readFileSync(path, 'utf-8');
        return content;
    } catch (error) {
        throw new Error(`Error reading file at ${path}`);
    }
};

export { replaceFile, createFile, getFileContent };