// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PSBuildTaskProvider } from './psbuildTaskProvider';

// Globals
let psbuildTaskProvider: vscode.Disposable | undefined;
// const powershellExtension = vscode.extensions.getExtension('ms-vscode.powershell')?.exports;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Build Command
	let buildCommand = vscode.commands.registerCommand('psbuild.build', () => {
		const folders = vscode.workspace.workspaceFolders;
		if (folders !== undefined) {
			var path = folders[0].uri.fsPath;
			vscode.commands.executeCommand(
				"PowerShell.RunCode",
				false,
				"Invoke-RSMBuild", ["-Task build", `-Path ${path}`]
			);
		}
	});
	context.subscriptions.push(buildCommand);

	let importCommand = vscode.commands.registerCommand('psbuild.import', () => {
		const folders = vscode.workspace.workspaceFolders;
		if (folders !== undefined) {
			var path = folders[0].uri.fsPath;
			vscode.commands.executeCommand(
				"PowerShell.RunCode",
				false,
				"Invoke-RSMBuild", ["-Task build", "-Import", `-Path ${path}`]
			);
		}
	});
	context.subscriptions.push(importCommand);


	// Setup Task Provider

	// Don't setup tasks if we aren't in a folder or workspace
	const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
	if (!workspaceRoot) {
		return;
	}
	// Register the tasks
	psbuildTaskProvider = vscode.tasks.registerTaskProvider(PSBuildTaskProvider.PSBuildType, new PSBuildTaskProvider(workspaceRoot));
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (psbuildTaskProvider) {
		psbuildTaskProvider.dispose();
	}
}
