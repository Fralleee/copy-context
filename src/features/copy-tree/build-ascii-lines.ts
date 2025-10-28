import type * as vscode from "vscode";
import { getSettings } from "../../config";
import type { FileTreeNode } from "../../shared/file-tree";

export async function buildAsciiLines(
	nodes: FileTreeNode[],
	prefix: string,
	token: vscode.CancellationToken,
	progressCallback: () => void,
): Promise<string[]> {
	const { includeEmojis } = getSettings();
	const lines: string[] = [];
	for (let i = 0; i < nodes.length; i++) {
		if (token.isCancellationRequested) {
			throw new Error("Operation cancelled");
		}

		const node = nodes[i];
		const isLast = i === nodes.length - 1;
		const branch = isLast ? "└──" : "├──";
		const icon = includeEmojis ? (node.isDirectory ? "📁" : "📄") : "";
		const iconSpace = includeEmojis ? " " : "";
		lines.push(`${prefix}${branch}${iconSpace}${icon}${iconSpace}${node.name}`);
		progressCallback();

		if (node.isDirectory && node.children) {
			const newPrefix = prefix + (isLast ? "    " : "│   ");
			const childLines = await buildAsciiLines(
				node.children,
				newPrefix,
				token,
				progressCallback,
			);
			lines.push(...childLines);
		}
	}
	return lines;
}
