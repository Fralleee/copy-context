import type * as vscode from "vscode";
import type { FileTreeNode } from "../../shared/file-tree";

export async function buildAsciiLines(
	nodes: FileTreeNode[],
	prefix: string,
	token: vscode.CancellationToken,
	progressCallback: () => void,
): Promise<string[]> {
	const lines: string[] = [];
	for (let i = 0; i < nodes.length; i++) {
		if (token.isCancellationRequested) {
			throw new Error("Operation cancelled");
		}

		const node = nodes[i];
		const isLast = i === nodes.length - 1;
		const branch = isLast ? "└──" : "├──";
		const icon = node.isDirectory ? "📁" : "📄";
		lines.push(`${prefix}${branch} ${icon} ${node.name}`);
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
