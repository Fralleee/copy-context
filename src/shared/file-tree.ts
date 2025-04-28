import * as path from "node:path";
import { readdir } from "node:fs/promises";
import type { Dirent } from "node:fs";
import { shouldIncludePath } from "./filter";
import type { FilterContext } from "./make-filter-context";

export interface FileTreeNode {
	name: string;
	fullPath: string;
	relativePath: string;
	isDirectory: boolean;
	children?: FileTreeNode[];
}

export async function fileTree(
	dirPath: string,
	rootPath: string,
	filterContext: FilterContext,
): Promise<FileTreeNode[]> {
	let dirents: Dirent[];
	try {
		dirents = await readdir(dirPath, { withFileTypes: true });
	} catch {
		return [];
	}

	const results: FileTreeNode[] = [];
	const folders = dirents
		.filter((d) => d.isDirectory())
		.sort((a, b) => a.name.localeCompare(b.name));
	const files = dirents
		.filter((d) => d.isFile())
		.sort((a, b) => a.name.localeCompare(b.name));
	const sorted = [...folders, ...files];

	for (const entry of sorted) {
		const entryFullPath = path.join(dirPath, entry.name);
		const relPath = path.relative(rootPath, entryFullPath);

		if (entry.isDirectory()) {
			if (!shouldIncludePath(relPath, filterContext)) {
				continue;
			}

			const children = await fileTree(entryFullPath, rootPath, filterContext);
			if (children.length > 0) {
				results.push({
					name: entry.name,
					fullPath: entryFullPath,
					relativePath: relPath,
					isDirectory: true,
					children,
				});
			}
		} else {
			if (!shouldIncludePath(relPath, filterContext)) {
				continue;
			}
			results.push({
				name: entry.name,
				fullPath: entryFullPath,
				relativePath: relPath,
				isDirectory: false,
			});
		}
	}

	return results;
}
