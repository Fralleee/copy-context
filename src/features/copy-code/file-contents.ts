import fs from "node:fs/promises";
import type { FileTreeNode } from "../../shared/file-tree";
import { formatAsMarkdown } from "./markdown";

export async function fileContents(
	nodes: FileTreeNode[],
	visitedFiles: Set<string>,
	maxContentSize: number,
	addSizeCallback: (size: number) => void,
): Promise<string> {
	const promises = nodes.map(async (node) => {
		if (node.isDirectory && node.children) {
			return await fileContents(
				node.children,
				visitedFiles,
				maxContentSize,
				addSizeCallback,
			);
		}

		if (!visitedFiles.has(node.relativePath)) {
			visitedFiles.add(node.relativePath);
			const content = await fs.readFile(node.fullPath, "utf-8");
			addSizeCallback(content.length);
			return formatAsMarkdown(node.relativePath, content);
		}

		return "";
	});

	const results = await Promise.all(promises);
	return results.join("");
}
