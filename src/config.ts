import * as vscode from "vscode";

export function getSettings() {
	const config = vscode.workspace.getConfiguration("copyContext");
	return {
		enableAnalytics: config.get<boolean>("enableAnalytics", true),
		excludeGlobs: config.get<string[]>("excludeGlobs", []),
		includeEmojis: config.get<boolean>("includeEmojis", true),
		includeGlobs: config.get<string[]>("includeGlobs", []),
		maxContentSize: config.get<number>("maxContentSize", 500_000),
		respectGitIgnore: config.get<boolean>("respectGitIgnore", false),
		respectVSCodeExplorerExclude: config.get<boolean>(
			"respectVSCodeExplorerExclude",
			true,
		),
	};
}
