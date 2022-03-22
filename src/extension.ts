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

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "psbuild" is now active!');
	// const powershellExtension = vscode.extensions.getExtension<IPowerShellExtensionClient>("ms-vscode.PowerShell");
	// const powerShellExtensionClient = powershellExtension!.exports as IPowerShellExtensionClient;

	// let psExtUUID = powershellExtension.registerExternalExtension(
	// 	'RobOwens.psbuild',
	// 	'v1'
	// );
	// powershellExtension.waitUntilStarted(psExtUUID);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('psbuild.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		// Run the build task registered
		vscode.commands.executeCommand("PowerShell.InvokeRegisteredEditorCommand", { commandName: 'Build' })
		console.log(vscode.extensions.getExtension('ms-vscode.powershell'));
		// console.log(psExtUUID);
		// console.log(powershellExtension.getPowerShellVersionDetails(psExtUUID));
	});
	context.subscriptions.push(disposable);

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
