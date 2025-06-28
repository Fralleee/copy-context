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

interface FolderInfo {
	fsPath: string;
	relPath: string;
	folderName: string;
	tree: FileTreeNode[];
	totalNodes: number;
}

export async function copyStructure(
	uris: vscode.Uri[],
	outputChannel?: vscode.OutputChannel,
) {
	const folderFsPaths = new Set<string>();
	for (let uri of uris) {
		const stat = await vscode.workspace.fs.stat(uri);
		if (stat.type !== vscode.FileType.Directory) {
			uri = vscode.Uri.file(path.dirname(uri.fsPath));
		}
		folderFsPaths.add(uri.fsPath);
	}

	const filterContext = await makeFilterContext();
	const folderInfos: FolderInfo[] = [];

	for (const fsPath of folderFsPaths) {
		const folderUri = vscode.Uri.file(fsPath);
		const wsFolder = vscode.workspace.getWorkspaceFolder(folderUri);
		const rootPath = wsFolder?.uri.fsPath || fsPath;
		const relPath =
			path.relative(rootPath, fsPath).split(path.sep).join("/") || "/";
		const folderName = path.basename(fsPath);
		const tree = await fileTree(fsPath, rootPath, filterContext);
		const totalNodes = countNodes(tree);

		folderInfos.push({ folderName, fsPath, relPath, totalNodes, tree });
	}

	const grandTotal = folderInfos.reduce(
		(sum, folderInfo) => sum + folderInfo.totalNodes,
		0,
	);
	let processed = 0;
	const sections: string[] = [];

	await vscode.window.withProgress(
		{
			cancellable: true,
			location: vscode.ProgressLocation.Notification,
			title: `Copying ${folderInfos.length} folder structure(s)…`,
		},
		async (progress, token) => {
			for (const info of folderInfos) {
				const lines = await buildAsciiLines(info.tree, "", token, () => {
					processed++;
					progress.report({
						increment: 100 / grandTotal,
						message: `${processed} / ${Math.max(grandTotal, 1)} nodes`,
					});
				});

				const block = [
					"```plaintext",
					`📁 ${info.relPath}`,
					...lines,
					"```",
				].join("\n");
				sections.push(block);
			}
		},
	);

	const output = sections.join("\n\n");
	await vscode.env.clipboard.writeText(output);
	vscode.window.setStatusBarMessage(
		`Copied ${folderInfos.length} folder structure(s)!`,
		3000,
	);

	outputChannel?.appendLine(
		`Copied ${folderInfos.length} folder structure(s) successfully.`,
	);
}
