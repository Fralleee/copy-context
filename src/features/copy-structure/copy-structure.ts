import path from "node:path";
import * as vscode from "vscode";
import { type FileTreeNode, fileTree } from "../../shared/file-tree";
import { makeFilterContext } from "../../shared/make-filter-context";
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
	const stat = await vscode.workspace.fs.stat(uri);
	if (stat.type !== vscode.FileType.Directory) {
		uri = vscode.Uri.file(path.dirname(uri.fsPath));
	}

	const filterContext = await makeFilterContext();
	const folder = vscode.workspace.getWorkspaceFolder(uri);
	const rootPath = folder?.uri.fsPath || uri.fsPath;
	const relPath = path.relative(rootPath, uri.fsPath).split(path.sep).join("/");
	const folderName = path.basename(uri.fsPath);
	const tree = await fileTree(uri.fsPath, rootPath, filterContext);

	await vscode.window.withProgress(
		{
			cancellable: true,
			location: vscode.ProgressLocation.Notification,
			title: "Copying folder structure...",
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
				"```text",
				`📁 ${relPath || folderName}`,
				...lines,
				"```",
			].join("\n");

			await vscode.env.clipboard.writeText(output);
			vscode.window.setStatusBarMessage("Folder structure copied!", 3000);

			const outputChannel = vscode.window.createOutputChannel("CopyStructure");
			outputChannel.appendLine("Copy Context: Folder structure copy complete.");
		},
	);
}
