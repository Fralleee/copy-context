import * as vscode from "vscode";
import { copyStructure } from "./features/copy-structure/copy-structure";
import { copyCode } from "./features/copy-code/copy-code";

export function activate(context: vscode.ExtensionContext) {
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

	const copyCodeThisTab = vscode.commands.registerCommand(
		"extension.copyCode.thisTab",
		async (uri: vscode.Uri) => {
			if (!uri) {
				vscode.window.showErrorMessage("No tab URI provided.");
				return;
			}
			await copyCode([uri]);
		},
	);

	const copyCodeAllTabs = vscode.commands.registerCommand(
		"extension.copyCode.allTabs",
		async () => {
			const allTabs = vscode.window.tabGroups.all.flatMap((g) => g.tabs);
			const fileUris = allTabs
				.map((tab) => {
					const input = tab.input as { uri: vscode.Uri | undefined };
					return input?.uri as vscode.Uri | undefined;
				})
				.filter((u): u is vscode.Uri => !!u && u.scheme === "file");

			if (!fileUris.length) {
				return vscode.window.showErrorMessage("No open file tabs to copy.");
			}

			await copyCode(
				Array.from(new Set(fileUris.map((u) => u.toString()))).map((s) =>
					vscode.Uri.parse(s),
				),
			);
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
	context.subscriptions.push(copyCodeThisTab);
	context.subscriptions.push(copyCodeAllTabs);
	context.subscriptions.push(copyStructureCommand);
}

export function deactivate() {}
