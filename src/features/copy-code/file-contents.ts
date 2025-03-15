import fs from "node:fs/promises";
import type { FileTreeNode } from "../../shared/file-tree";
import { formatAsMarkdown } from "./markdown";
import type * as vscode from "vscode";

export async function fileContents(
	nodes: FileTreeNode[],
	visitedFiles: Set<string>,
	maxContentSize: number,
	addSizeCallback: (size: number) => void,
	token: vscode.CancellationToken,
	progressCallback: () => void,
): Promise<string> {
	let result = "";
	for (const node of nodes) {
		if (token.isCancellationRequested) {
			throw new Error("Operation cancelled");
		}

		if (node.isDirectory && node.children) {
			result += await fileContents(
				node.children,
				visitedFiles,
				maxContentSize,
				addSizeCallback,
				token,
				progressCallback,
			);
		} else if (!node.isDirectory) {
			if (!visitedFiles.has(node.relativePath)) {
				visitedFiles.add(node.relativePath);
				const content = await fs.readFile(node.fullPath, "utf-8");
				addSizeCallback(content.length);
				result += formatAsMarkdown(node.relativePath, content);
				progressCallback();
			}
		}
	}
	return result;
}
