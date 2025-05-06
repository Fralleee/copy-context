import * as vscode from "vscode";

export function getSettings() {
	const config = vscode.workspace.getConfiguration("copyContext");
	return {
		includeGlobs: config.get<string[]>("includeGlobs", []),
		excludeGlobs: config.get<string[]>("excludeGlobs", []),
		respectGitIgnore: config.get<boolean>("respectGitIgnore", false),
		respectVSCodeExplorerExclude: config.get<boolean>(
			"respectVSCodeExplorerExclude",
			true,
		),
		maxContentSize: config.get<number>("maxContentSize", 500_000),
		template: config.get<string>("template") || "```${language}\n// ${path}\n${content}\n```\n\n",
	};
}
