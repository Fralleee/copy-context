import path from "node:path";
import type { BinaryMetadata } from "./binary-metadata";

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

function guessLanguageFromExtension(ext: string): string {
	return languageMap[ext] || "plaintext";
}

export function formatAsMarkdown(
	relativePath: string,
	content: string,
): string {
	const ext = path.extname(relativePath).replace(".", "").toLowerCase();
	const lang = guessLanguageFromExtension(ext);
	return `\`\`\`${lang}\n// ${relativePath}\n${content}\n\`\`\`\n\n`;
}

export function formatBinaryAsMarkdown(
	relativePath: string,
	meta: BinaryMetadata,
): string {
	const lines: string[] = [];

	const sizeKB = (meta.size / 1024).toFixed(1);
	lines.push(`- **size:** ${sizeKB} KB (${meta.size.toLocaleString()} bytes)`);

	if (meta.mime) {
		lines.push(`- **mime:** ${meta.mime}`);
	}

	return `\`\`\`\n// ${relativePath}\n${lines.join("\n")}\n\`\`\`\n\n`;
}
