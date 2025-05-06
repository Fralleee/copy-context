import * as vscode from "vscode";
import path from "node:path";
import { fileTree, type FileTreeNode } from "../../shared/file-tree";
import { fileContents } from "./file-contents";
import { getSettings } from "../../config";
import {
	type FilterContext,
	makeFilterContext,
} from "../../shared/make-filter-context";
import { shouldIncludePath } from "../../shared/filter";

type Directory = {
	type: "directory";
	uri: vscode.Uri;
	tree: FileTreeNode[];
	fileCount: number;
	rootPath: string;
};

type File = {
	type: "file";
	uri: vscode.Uri;
	rootPath: string;
};

type Item = Directory | File;

export async function copyCode(uris: vscode.Uri[]) {
	const filterContext = await makeFilterContext();
	const { maxContentSize } = getSettings();
	const visitedFiles = new Set<string>();
	let totalSize = 0;

	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: "Copying code context...",
			cancellable: true,
		},
		async (progress, token) => {
			const { items, totalFiles } = await collectCopyItems(uris, filterContext);

			let processedCount = 0;
			const updateProgress = () =>
				progress.report({
					increment: (1 / totalFiles) * 100,
					message: `${++processedCount} of ${totalFiles} files processed`,
				});

			let output = "";

			for (const item of items) {
				if (token.isCancellationRequested) {
					throw new Error("Operation cancelled");
				}

				let nodes: FileTreeNode[];
				if (item.type === "directory") {
					nodes = item.tree;
				} else {
					const relPath = path
						.relative(item.rootPath, item.uri.fsPath)
						.split(path.sep)
						.join("/");

					nodes = [
						{
							name: path.basename(item.uri.fsPath),
							fullPath: item.uri.fsPath,
							relativePath: relPath,
							isDirectory: false,
						},
					];
				}

				output += await fileContents(
					nodes,
					visitedFiles,
					maxContentSize,

					(sz) => {
						totalSize += sz;
						if (totalSize > maxContentSize) {
							throw new Error(
								`Exceeded maximum content size of ${maxContentSize} bytes`,
							);
						}
					},
					token,
					updateProgress,
				);
			}

			const outputChannel = vscode.window.createOutputChannel("CopyContext");
			outputChannel.appendLine(
				`Copy Code Context: Finished processing ${totalFiles} files.`,
			);

			await vscode.env.clipboard.writeText(output.trim());
			vscode.window.setStatusBarMessage("Code context copied!", 3000);
		},
	);
}

async function collectCopyItems(
	uris: vscode.Uri[],
	filterContext: FilterContext,
): Promise<{ items: Item[]; totalFiles: number }> {
	const items: Item[] = [];
	let totalFiles = 0;

	for (const uri of uris) {
		const ws = vscode.workspace.getWorkspaceFolder(uri);
		const rootPath = ws?.uri.fsPath ?? uri.fsPath;
		const relPath = path
			.relative(rootPath, uri.fsPath)
			.split(path.sep)
			.join("/");

		if (!shouldIncludePath(relPath, filterContext)) {
			continue;
		}

		const stat = await vscode.workspace.fs.stat(uri);
		if (stat.type === vscode.FileType.Directory) {
			const tree = await fileTree(uri.fsPath, rootPath, filterContext);
			const fileCount = countFiles(tree);
			if (fileCount > 0) {
				totalFiles += fileCount;
				items.push({ type: "directory", uri, tree, fileCount, rootPath });
			}
		} else {
			totalFiles++;
			items.push({ type: "file", uri, rootPath });
		}
	}

	return { items, totalFiles };
}

function countFiles(nodes: FileTreeNode[]): number {
	return nodes.reduce((acc, node) => {
		if (node.isDirectory && node.children) {
			return acc + countFiles(node.children);
		}
		return acc + (node.isDirectory ? 0 : 1);
	}, 0);
}
