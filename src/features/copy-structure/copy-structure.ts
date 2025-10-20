import path from "node:path";
import * as vscode from "vscode";
import { getSettings } from "../../config";
import { type FileTreeNode, fileTree } from "../../shared/file-tree";
import {
	type FilterContext,
	makeFilterContext,
} from "../../shared/make-filter-context";
import { buildAsciiLines } from "./build-ascii-lines";

const PROGRESS_CHUNK = 10;

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

async function buildFilteredTree(
	dirPath: string,
	rootPath: string,
	filterContext: FilterContext,
	selectedPaths: Set<string>,
): Promise<FileTreeNode[]> {
	const fullTree = await fileTree(dirPath, rootPath, filterContext);

	function filterNodes(nodes: FileTreeNode[]): FileTreeNode[] {
		const filtered: FileTreeNode[] = [];

		for (const node of nodes) {
			if (node.isDirectory && node.children) {
				const filteredChildren = filterNodes(node.children);
				if (filteredChildren.length > 0) {
					filtered.push({ ...node, children: filteredChildren });
				}
			} else if (!node.isDirectory && selectedPaths.has(node.fullPath)) {
				filtered.push(node);
			}
		}

		return filtered;
	}

	return filterNodes(fullTree);
}

export async function copyStructure(
	uris: vscode.Uri[],
	outputChannel?: vscode.OutputChannel,
) {
	const filterContext = await makeFilterContext();
	const folderInfos: FolderInfo[] = [];
	const itemsByFolder = new Map<string, vscode.Uri[]>();

	for (const uri of uris) {
		const stat = await vscode.workspace.fs.stat(uri);

		if (stat.type === vscode.FileType.Directory) {
			const key = uri.fsPath;
			const items = itemsByFolder.get(key) ?? [];
			items.push(uri);
			itemsByFolder.set(key, items);
		} else {
			const parentDir = path.dirname(uri.fsPath);
			const items = itemsByFolder.get(parentDir) ?? [];
			items.push(uri);
			itemsByFolder.set(parentDir, items);
		}
	}

	for (const [folderPath, items] of itemsByFolder) {
		const folderUri = vscode.Uri.file(folderPath);
		const wsFolder = vscode.workspace.getWorkspaceFolder(folderUri);
		const rootPath = wsFolder?.uri.fsPath || folderPath;
		const allDirs = await Promise.all(
			items.map(async (uri) => {
				const stat = await vscode.workspace.fs.stat(uri);
				return stat.type === vscode.FileType.Directory;
			}),
		);

		let tree: FileTreeNode[];
		if (allDirs.every((isDir) => isDir)) {
			tree = await fileTree(folderPath, rootPath, filterContext);
		} else {
			const selectedPaths = new Set(items.map((uri) => uri.fsPath));
			tree = await buildFilteredTree(
				folderPath,
				rootPath,
				filterContext,
				selectedPaths,
			);
		}

		const relPath =
			path.relative(rootPath, folderPath).split(path.sep).join("/") || "/";
		const folderName = path.basename(folderPath);
		const totalNodes = countNodes(tree);

		if (totalNodes > 0) {
			folderInfos.push({
				folderName,
				fsPath: folderPath,
				relPath,
				totalNodes,
				tree,
			});
		}
	}

	const grandTotal = folderInfos.reduce(
		(sum, folderInfo) => sum + folderInfo.totalNodes,
		0,
	);
	let processed = 0;
	let pending = 0;
	const sections: string[] = [];

	const { includeEmojis } = getSettings();

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
					pending++;
					if (pending >= PROGRESS_CHUNK || processed === grandTotal) {
						progress.report({
							increment: (pending / grandTotal) * 100,
							message: `${processed} / ${grandTotal} nodes`,
						});
						pending = 0;
					}
				});

				const folderIcon = includeEmojis ? "📁 " : "";
				const block = [
					"```plaintext",
					`${folderIcon}${info.relPath}`,
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
