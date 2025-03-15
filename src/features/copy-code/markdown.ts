import path from "node:path";

const languageMap: { [ext: string]: string } = {
	js: "javascript",
	cjs: "javascript",
	mjs: "javascript",
	jsx: "javascriptreact",
	ts: "typescript",
	tsx: "typescriptreact",
	html: "html",
	css: "css",
	scss: "scss",
	less: "less",
	md: "markdown",
	json: "json",
	yaml: "yaml",
	yml: "yaml",
	xml: "xml",
	c: "c",
	cpp: "cpp",
	cc: "cpp",
	cxx: "cpp",
	h: "cpp",
	hpp: "cpp",
	cs: "csharp",
	java: "java",
	py: "python",
	rb: "ruby",
	php: "php",
	go: "go",
	rs: "rust",
	swift: "swift",
	kt: "kotlin",
	kts: "kotlin",
	sh: "shellscript",
	ps1: "powershell",
	sql: "sql",
	scala: "scala",
	hs: "haskell",
	pl: "perl",
	pm: "perl",
	lua: "lua",
	erl: "erlang",
	ex: "elixir",
	exs: "elixir",
	r: "r",
	cshtml: "razor",
	m: "objective-c",
	mm: "objective-cpp",
	coffee: "coffeescript",
	fs: "fsharp",
	fsi: "fsharp",
	fsx: "fsharp",
	vue: "vue",
	svelte: "svelte",
	jsonc: "jsonc",
};

export function formatAsMarkdown(
	relativePath: string,
	content: string,
): string {
	const ext = path.extname(relativePath).replace(".", "").toLowerCase();
	const lang = guessLanguageFromExtension(ext);
	return `### ${relativePath}\n\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
}

export function guessLanguageFromExtension(ext: string): string {
	return languageMap[ext] || "plaintext";
}
