import fs from "node:fs/promises";
import { fromFile } from "file-type";
import type * as vscode from "vscode";
import type { FileTreeNode } from "../../shared/file-tree";
import type { BinaryMetadata } from "./binary-metadata";
import { detectBinary } from "./detect-binary";
import {
	applyTemplate,
	formatBinaryAsMarkdown,
	formatCodeAsMarkdown,
} from "./markdown";

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
	pathOutsideCodeBlock: boolean,
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
				pathOutsideCodeBlock,
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
						result += formatBinaryAsMarkdown(
							node.relativePath,
							{ mime, size },
							pathOutsideCodeBlock,
						);
					} else {
						const content = await fs.readFile(node.fullPath, "utf-8");
						addSizeCallback(Buffer.byteLength(content, "utf-8"));
						result += formatCodeAsMarkdown(
							node.relativePath,
							content,
							pathOutsideCodeBlock,
						);
					}
				} catch (err) {
					const content = `- Failed reading file metadata: ${err}`;
					result += applyTemplate({
						content,
						language: "plaintext",
						path: node.relativePath,
						pathOutsideCodeBlock,
					});
				}

				progressCallback();
			}
		}
	}
	return result;
}
