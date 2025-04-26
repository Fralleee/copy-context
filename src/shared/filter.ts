// src/shared/filter.ts
import { workspace, type WorkspaceFolder } from "vscode";
import ignore from "ignore";
import fs from "node:fs/promises";
import path from "node:path";
import minimatch from "minimatch";
import { getSettings } from "../config";

let gitIgnore: ignore.Ignore | null = null;
let vscodeExcludeGlobs: string[] = [];

export async function initFilters(workspaceFolder: WorkspaceFolder) {
	const { respectGitIgnore, respectVSCodeExplorerExclude } = getSettings();

	if (respectGitIgnore) {
		const ig = ignore();
		try {
			const content = await fs.readFile(
				path.join(workspaceFolder.uri.fsPath, ".gitignore"),
				"utf8",
			);
			ig.add(content);
		} catch {
			// no .gitignore or unreadable
		}
		gitIgnore = ig;
	} else {
		gitIgnore = null;
	}

	if (respectVSCodeExplorerExclude) {
		const filesExclude = workspace
			.getConfiguration("files", workspaceFolder.uri)
			.get<Record<string, boolean>>("exclude", {});
		vscodeExcludeGlobs = Object.entries(filesExclude || {})
			.filter(([, hidden]) => hidden)
			.map(([pattern]) => pattern);
	} else {
		vscodeExcludeGlobs = [];
	}
}

export async function updateFiltersForWorkspace() {
	const folders = workspace.workspaceFolders;
	if (folders && folders.length > 0) {
		await initFilters(folders[0]);
	} else {
		gitIgnore = null;
		vscodeExcludeGlobs = [];
	}
}

export function shouldIncludePath(relPath: string): boolean {
	const { includeGlobs, excludeGlobs } = getSettings();

	if (excludeGlobs.some((g) => minimatch(relPath, g, { dot: true }))) {
		return false;
	}

	if (includeGlobs.some((g) => minimatch(relPath, g, { dot: true }))) {
		return true;
	}

	if (gitIgnore?.ignores(relPath)) {
		return false;
	}

	if (vscodeExcludeGlobs.some((g) => minimatch(relPath, g, { dot: true }))) {
		return false;
	}

	return true;
}
