import * as vscode from "vscode";
import fs from "node:fs/promises";
import path from "node:path";
import { shouldIncludeFile } from "../../shared/file-matching";
import { fileTree } from "../../shared/file-tree";
import { formatAsMarkdown } from "./markdown";
import { fileContents } from "./file-contents";

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

	const outputs = await Promise.all(
		uris.map(async (uri) => {
			const stat = await vscode.workspace.fs.stat(uri);
			if (stat.type === vscode.FileType.Directory) {
				const tree = await fileTree(
					uri.fsPath,
					rootPath,
					includeGlobs,
					excludeGlobs,
					true,
				);
				return await fileContents(tree, visitedFiles, maxContentSize, (sz) => {
					totalSize += sz;
					if (totalSize > maxContentSize) {
						throw new Error(
							`Exceeded maximum content size of ${maxContentSize} bytes`,
						);
					}
				});
			}

			const relPath = path.relative(rootPath, uri.fsPath);
			if (!shouldIncludeFile(relPath, includeGlobs, excludeGlobs)) {
				return "";
			}
			if (!visitedFiles.has(relPath)) {
				visitedFiles.add(relPath);
				const fileContent = await fs.readFile(uri.fsPath, "utf-8");
				totalSize += fileContent.length;
				if (totalSize > maxContentSize) {
					throw new Error(
						`Exceeded maximum content size of ${maxContentSize} bytes`,
					);
				}
				return formatAsMarkdown(relPath, fileContent);
			}
			return "";
		}),
	);

	const output = outputs.join("");
	await vscode.env.clipboard.writeText(output.trim());
	vscode.window.setStatusBarMessage("Code context copied!", 3000);
}
