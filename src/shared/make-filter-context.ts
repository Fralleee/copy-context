import fs from "node:fs/promises";
import path from "node:path";
import ignore, { type Ignore } from "ignore";
import { type WorkspaceFolder, workspace } from "vscode";
import {
	type CommandType,
	getCommandSpecificGlobs,
	getSettings,
} from "../config";

export interface FilterContext {
	includeGlobs: string[];
	excludeGlobs: string[];
	gitIgnore: Ignore | null;
	vscodeExcludes: string[];
}

export async function makeFilterContext(
	command?: CommandType,
): Promise<FilterContext> {
	const { respectGitIgnore, respectVSCodeExplorerExclude } = getSettings();

	// Get globs - either command-specific or global
	const { includeGlobs, excludeGlobs } = command
		? getCommandSpecificGlobs(command)
		: {
				excludeGlobs: getSettings().excludeGlobs,
				includeGlobs: getSettings().includeGlobs,
			};

	const folder: WorkspaceFolder | undefined = workspace.workspaceFolders?.[0];
	const filesConfig = workspace.getConfiguration("files", folder?.uri);
	const allExcludes = filesConfig.get<Record<string, boolean>>("exclude", {});
	const vscodeExcludes = respectVSCodeExplorerExclude
		? Object.entries(allExcludes)
				.filter(([, hidden]) => hidden)
				.map(([pattern]) => pattern)
		: [];

	let gitIgnore: Ignore | null = null;
	if (folder && respectGitIgnore) {
		gitIgnore = ignore();
		try {
			const text = await fs.readFile(
				path.join(folder.uri.fsPath, ".gitignore"),
				"utf8",
			);
			gitIgnore.add(text);
		} catch {
			// .gitignore file not found
		}
	}

	return {
		excludeGlobs,
		gitIgnore,
		includeGlobs,
		vscodeExcludes,
	};
}
