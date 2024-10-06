import * as vscode from 'vscode';
import { implementAll } from './commands/implementAll';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('php-create-implementation.implementAll', () => implementAll());
	context.subscriptions.push(disposable);
}

export function deactivate() { }