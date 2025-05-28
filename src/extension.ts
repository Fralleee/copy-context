import * as vscode from "vscode";
import { copyCode } from "./features/copy-code/copy-code";
import { copyStructure } from "./features/copy-structure/copy-structure";
import { initAnalytics, shutdown, track } from "./monitoring/analytics";

export function activate(context: vscode.ExtensionContext) {
	initAnalytics(context);

	const copyCodeCommand = vscode.commands.registerCommand(
		"extension.copyCode",
		async (uri: vscode.Uri, uris?: vscode.Uri[]) => {
			try {
				const allUris = uris && uris.length > 0 ? uris : [uri];
				await copyCode(allUris);
				track("copy_code", {
					command: "context_menu",
					file_count: allUris.length,
				});
			} catch (error) {
				track("error", { operation: "copy_code_context_menu" });
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
				await copyCode([targetUri]);
				track("copy_code", { command: "this_tab_context" });
			} catch (error) {
				track("error", { operation: "copy_code_this_tab_context" });
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

				await copyCode(
					Array.from(new Set(fileUris.map((u) => u.toString()))).map((s) =>
						vscode.Uri.parse(s),
					),
				);
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

	const copyStructureCommand = vscode.commands.registerCommand(
		"extension.copyStructure",
		async (uri: vscode.Uri) => {
			try {
				await copyStructure(uri);
				track("copy_structure");
			} catch (error) {
				track("error", { operation: "copy_structure" });
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

export async function deactivate() {
	await shutdown();
}
