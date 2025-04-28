import * as vscode from "vscode";

export function getSettings() {
	const config = vscode.workspace.getConfiguration("copyContext");
	return {
		includeGlobs: config.get<string[]>("includeGlobs", []),
		excludeGlobs: config.get<string[]>("excludeGlobs", []),
		respectGitIgnore: config.get<boolean>("respectGitIgnore", true),
		respectVSCodeExplorerExclude: config.get<boolean>(
			"respectVSCodeExplorerExclude",
			true,
		),
		maxContentSize: config.get<number>("maxContentSize", 500_000),
	};
}
