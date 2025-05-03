import fs from "node:fs/promises";
import type { FileTreeNode } from "../../shared/file-tree";
import { formatAsMarkdown, formatBinaryAsMarkdown } from "./markdown";
import type * as vscode from "vscode";
import { detectBinary } from "./detect-binary";
import { fromFile } from "file-type";
import type { BinaryMetadata } from "./binary-metadata";

async function getFileMetadata(fullPath: string): Promise<BinaryMetadata> {
	const stat = await fs.stat(fullPath);
	const meta: BinaryMetadata = { size: stat.size };

	try {
		const ft = await fromFile(fullPath);
		if (ft?.mime) {
			meta.mime = ft.mime;
		}
	} catch {}

	return meta;
}

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

				try {
					const isBinary = await detectBinary(node.fullPath);
					if (isBinary) {
						const { size, mime } = await getFileMetadata(node.fullPath);
						result += formatBinaryAsMarkdown(node.relativePath, { size, mime });
					} else {
						const content = await fs.readFile(node.fullPath, "utf-8");
						addSizeCallback(Buffer.byteLength(content, "utf-8"));
						result += formatAsMarkdown(node.relativePath, content);
					}
				} catch (err) {
					result += `\`\`\`\n// ${node.relativePath}\n- **Failed reading file metadata:** ${err}\n\`\`\`\n\n`;
				}

				progressCallback();
			}
		}
	}
	return result;
}
