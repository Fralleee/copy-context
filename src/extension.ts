import * as vscode from "vscode";
import { copyStructure } from "./features/copy-structure/copy-structure";
import { copyCode } from "./features/copy-code/copy-code";
import { initializeConfig } from "./config";
import { updateFiltersForWorkspace } from "./shared/filter";

export async function activate(context: vscode.ExtensionContext) {
	initializeConfig(context);
	await updateFiltersForWorkspace();

	context.subscriptions.push(
		vscode.workspace.onDidChangeWorkspaceFolders(() => {
			updateFiltersForWorkspace();
		}),
	);

	const copyCodeCommand = vscode.commands.registerCommand(
		"extension.copyCode",
		async (uri: vscode.Uri, uris?: vscode.Uri[]) => {
			try {
				const allUris = uris && uris.length > 0 ? uris : [uri];
				await copyCode(allUris);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to copy code context: ${error}`);
			}
		},
	);

	const copyStructureCommand = vscode.commands.registerCommand(
		"extension.copyStructure",
		async (uri: vscode.Uri) => {
			try {
				await copyStructure(uri);
			} catch (error) {
				vscode.window.showErrorMessage(
					`Failed to copy folder structure: ${error}`,
				);
			}
		},
	);

	context.subscriptions.push(copyCodeCommand);
	context.subscriptions.push(copyStructureCommand);
}

export function deactivate() {}
