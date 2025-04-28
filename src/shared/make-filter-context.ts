import * as vscode from "vscode";
import { workspace } from "vscode";
import ignore, { type Ignore } from "ignore";
import fs from "node:fs/promises";
import path from "node:path";
import { getSettings } from "../config";

export interface FilterContext {
	includeGlobs: string[];
	excludeGlobs: string[];
	gitIgnore: Ignore | null;
	vscodeExcludes: string[];
}

export async function makeFilterContext(): Promise<FilterContext> {
	const folders = vscode.workspace.workspaceFolders;
	const folder = folders && folders.length > 0 ? folders[0] : null;
	const {
		includeGlobs,
		excludeGlobs,
		respectGitIgnore,
		respectVSCodeExplorerExclude,
	} = getSettings();

	if (!folder) {
		return {
			includeGlobs,
			excludeGlobs,
			gitIgnore: null,
			vscodeExcludes: [],
		};
	}

	let gitIgnore: ignore.Ignore | null = null;
	if (respectGitIgnore) {
		gitIgnore = ignore();
		try {
			const ig = await fs.readFile(
				path.join(folder.uri.fsPath, ".gitignore"),
				"utf8",
			);
			gitIgnore.add(ig);
		} catch {}
	}

	let vscodeExcludes: string[] = [];
	if (respectVSCodeExplorerExclude) {
		const fe = workspace
			.getConfiguration("files", folder.uri)
			.get<Record<string, boolean>>("exclude", {});
		vscodeExcludes = Object.entries(fe || {})
			.filter(([, hidden]) => hidden)
			.map(([pattern]) => pattern);
	}

	return {
		includeGlobs,
		excludeGlobs,
		gitIgnore,
		vscodeExcludes,
	};
}
