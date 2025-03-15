import * as vscode from "vscode";
import fs from "node:fs/promises";
import path from "node:path";
import { shouldIncludeFile } from "../../shared/file-matching";
import { fileTree, type FileTreeNode } from "../../shared/file-tree";
import { formatAsMarkdown } from "./markdown";
import { fileContents } from "./file-contents";

type Directory = {
	type: "directory";
	uri: vscode.Uri;
	tree: FileTreeNode[];
	fileCount: number;
};

type File = {
	type: "file";
	uri: vscode.Uri;
};

type Item = Directory | File;

export async function copyCode(uris: vscode.Uri[]) {
	const config = vscode.workspace.getConfiguration("copyContext");
	const includeGlobs: string[] = config.get("includeGlobs") ?? [];
	const excludeGlobs: string[] = config.get("excludeGlobs") ?? [];
	const maxContentSize: number = config.get("maxContentSize") ?? 500000;

	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		vscode.window.showErrorMessage("No workspace folder found.");
		return;
	}
	const rootPath = workspaceFolders[0].uri.fsPath;
	const visitedFiles = new Set<string>();
	let totalSize = 0;

	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: "Copying code context...",
			cancellable: true,
		},
		async (progress, token) => {
			function countFiles(nodes: FileTreeNode[]): number {
				return nodes.reduce((acc, node) => {
					if (node.isDirectory && node.children) {
						return acc + countFiles(node.children);
					}
					if (!node.isDirectory) {
						return acc + 1;
					}
					return acc;
				}, 0);
			}

			const items: Item[] = [];
			let totalFiles = 0;
			for (const uri of uris) {
				const stat = await vscode.workspace.fs.stat(uri);
				if (stat.type === vscode.FileType.Directory) {
					const tree = await fileTree(
						uri.fsPath,
						rootPath,
						includeGlobs,
						excludeGlobs,
					);
					const fileCount = countFiles(tree);
					totalFiles += fileCount;
					items.push({ type: "directory", uri, tree, fileCount });
				} else {
					totalFiles += 1;
					items.push({ type: "file", uri });
				}
			}

			let processedCount = 0;
			function updateProgress() {
				processedCount++;
				progress.report({
					increment: (1 / totalFiles) * 100,
					message: `${processedCount} of ${totalFiles} files processed`,
				});
			}

			let output = "";
			for (const item of items) {
				if (token.isCancellationRequested) {
					throw new Error("Operation cancelled");
				}

				if (item.type === "directory") {
					output += await fileContents(
						item.tree,
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
				} else {
					const relPath = path.relative(rootPath, item.uri.fsPath);
					if (!shouldIncludeFile(relPath, includeGlobs, excludeGlobs)) {
						continue;
					}
					if (!visitedFiles.has(relPath)) {
						visitedFiles.add(relPath);
						const fileContent = await fs.readFile(item.uri.fsPath, "utf-8");
						totalSize += fileContent.length;
						if (totalSize > maxContentSize) {
							throw new Error(
								`Exceeded maximum content size of ${maxContentSize} bytes`,
							);
						}
						output += formatAsMarkdown(relPath, fileContent);
						updateProgress();
					}
				}
			}

			const outputChannel = vscode.window.createOutputChannel("CopyContext");
			outputChannel.show(true);
			outputChannel.appendLine(
				`Copy Code Context: Finished processing ${totalFiles} files.`,
			);

			await vscode.env.clipboard.writeText(output.trim());
			vscode.window.setStatusBarMessage("Code context copied!", 3000);
		},
	);
}
