// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import path from 'path';
import fs from 'fs';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
async function touchSvgFile() {
	// The code you place here will be executed every time your command is executed
	// Display a message box to the user
	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}
	let ws = vscode.workspace.getWorkspaceFolder(editor?.document.uri);
	if (!ws) {
		return;
	}

	// Touch(=create=write) an drawio.svg file
	let conf = vscode.workspace.getConfiguration("touch-drawio-svg");
	// get imgDir default value from package.json
	let imgDir:string = conf.get("img-dir")??"";
	let newFileUri = ws.uri;
	let newFileContent = new Uint8Array();
	try {
		// Check if new file is already exist
		for (let id = 0;; id++) {
			let newFileName = `temp_${id}.drawio.svg`;
			newFileUri = vscode.Uri.joinPath(ws.uri, imgDir, newFileName);
			// let ret = await vscode.workspace.findFiles(newFileUri.fsPath);
			if (!fs.existsSync(newFileUri.fsPath)) {
				// passed
				break;
			}
		}
		vscode.workspace.fs.writeFile(newFileUri, newFileContent);	
	} catch (error) {
		console.error("[Error] failed to write a drawio.svg file from touch-drawio-svg extension!")
	}
	vscode.window.showInformationMessage(`write new file: ${newFileUri} from touch-drawio-svg!`);

	// append a drawio.svg markdown link to active editor
	editor.edit((e)=>{
		if (ws && editor) {
			let currentPos = editor.selection.end;
			let parentDir = path.dirname(editor.document.uri.fsPath);
			let relative_path_from_this_editor_doc = path.relative(parentDir, newFileUri.path);
			e.insert(currentPos, `![](${relative_path_from_this_editor_doc})`)
		}
	})
}

export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "touch-drawio-svg" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('touch-drawio-svg.create-new-drawio-svg', touchSvgFile);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
