import * as vscode from "vscode";
import path from "node:path";
import { fileTree, type FileTreeNode } from "../../shared/file-tree";
import { buildAsciiLines } from "./build-ascii-lines";

function countNodes(nodes: FileTreeNode[]): number {
	let count = 0;
	for (const node of nodes) {
		count++;
		if (node.isDirectory && node.children) {
			count += countNodes(node.children);
		}
	}
	return count;
}

export async function copyStructure(uri: vscode.Uri) {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		vscode.window.showErrorMessage("No workspace folder found.");
		return;
	}

	const config = vscode.workspace.getConfiguration("copyContext");
	const excludeGlobs: string[] = config.get("excludeGlobs") || [];
	const folderName = path.basename(uri.fsPath);
	const tree = await fileTree(
		uri.fsPath,
		workspaceFolders[0].uri.fsPath,
		["**"],
		excludeGlobs,
		true,
	);

	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: "Copying folder structure...",
			cancellable: true,
		},
		async (progress, token) => {
			const totalNodes = countNodes(tree);
			let processedNodes = 0;

			const updateProgress = () => {
				processedNodes++;
				progress.report({
					increment: 100 / totalNodes,
					message: `${processedNodes} of ${totalNodes} nodes processed`,
				});
			};

			const lines = await buildAsciiLines(tree, "", token, updateProgress);
			const output = [
				"# Project Structure",
				`Name: ${folderName}`,
				"",
				...lines,
			].join("\n");

			await vscode.env.clipboard.writeText(output);
			vscode.window.setStatusBarMessage("Folder structure copied!", 3000);

			const outputChannel = vscode.window.createOutputChannel("CopyStructure");
			outputChannel.show(true);
			outputChannel.appendLine(
				"Copy Code Context: Folder structure copy complete.",
			);
		},
	);
}
