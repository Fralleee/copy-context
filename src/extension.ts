import * as vscode from "vscode";
import { copyCode } from "./features/copy-content/copy-content";
import { copyTree } from "./features/copy-tree/copy-tree";
import { copySelection } from "./features/copy-content/copy-selection";
import { initAnalytics, shutdown, track } from "./monitoring/analytics";

export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel("CopyContext");
	initAnalytics(context, outputChannel);

	const copyCodeCommand = vscode.commands.registerCommand(
		"extension.copyCode",
		async (uri: vscode.Uri, uris?: vscode.Uri[]) => {
			try {
				const allUris = uris && uris.length > 0 ? uris : [uri];
				await copyCode(allUris, outputChannel);
				track("copy_code", {
					command: "context_menu",
					file_count: allUris.length,
				});
			} catch (error) {
				track("error", { error, operation: "copy_code_context_menu" });
				vscode.window.showErrorMessage(`Failed to copy context: ${error}`);
			}
		},
	);

	const copyCodeThisTab = vscode.commands.registerCommand(
		"extension.copyCode.thisTab",
		async (uri?: vscode.Uri) => {
			let targetUri: vscode.Uri;

			if (uri && uri.scheme === "file") {
				targetUri = uri;
			} else {
				const activeEditor = vscode.window.activeTextEditor;
				if (!activeEditor) {
					vscode.window.showErrorMessage("No active tab to copy.");
					return;
				}

				targetUri = activeEditor.document.uri;
				if (targetUri.scheme !== "file") {
					vscode.window.showErrorMessage("Can only copy saved files.");
					return;
				}
			}

			try {
				await copyCode([targetUri], outputChannel);
				track("copy_code", { command: "this_tab_context" });
			} catch (error) {
				track("error", { error, operation: "copy_code_this_tab_context" });
				vscode.window.showErrorMessage(`Failed to copy context: ${error}`);
			}
		},
	);

	const copyCodeAllTabs = vscode.commands.registerCommand(
		"extension.copyCode.allTabs",
		async () => {
			try {
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

				const distinctUris = Array.from(
					new Set(fileUris.map((u) => u.toString())),
				).map((s) => vscode.Uri.parse(s));
				await copyCode(distinctUris, outputChannel);
				track("copy_code", {
					command: "all_tabs",
					file_count: fileUris.length,
				});
			} catch (error) {
				track("error", { error, operation: "copy_code_all_tabs" });
				vscode.window.showErrorMessage(
					`Failed to copy context from all tabs: ${error}`,
				);
			}
		},
	);

	const copyTreeCommand = vscode.commands.registerCommand(
		"extension.copyTree",
		async (uri: vscode.Uri, uris?: vscode.Uri[]) => {
			try {
				const selected = uris && uris.length > 0 ? uris : [uri];
				await copyTree(selected, outputChannel);
				track("copy_tree");
			} catch (error) {
				track("error", { error, operation: "copy_tree" });
				vscode.window.showErrorMessage(`Failed to copy folder tree: ${error}`);
			}
		},
	);

	const copySelectionCommand = vscode.commands.registerCommand(
		"extension.copySelection",
		async () => {
			try {
				await copySelection(outputChannel);
			} catch (error) {
				track("error", { error, operation: "copy_selection" });
				vscode.window.showErrorMessage(`Failed to copy selection: ${error}`);
			}
		},
	);

	context.subscriptions.push(copyCodeCommand);
	context.subscriptions.push(copyCodeThisTab);
	context.subscriptions.push(copyCodeAllTabs);
	context.subscriptions.push(copyTreeCommand);
	context.subscriptions.push(copySelectionCommand);
	context.subscriptions.push(outputChannel);
}

export async function deactivate() {
	await shutdown();
}
