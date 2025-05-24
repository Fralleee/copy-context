import path from "node:path";
import { getSettings } from "../../config";
import type { BinaryMetadata } from "./binary-metadata";

const languageMap: { [ext: string]: string } = {
	c: "c",
	cc: "cpp",
	cjs: "javascript",
	coffee: "coffeescript",
	cpp: "cpp",
	cs: "csharp",
	cshtml: "razor",
	css: "css",
	cxx: "cpp",
	erl: "erlang",
	ex: "elixir",
	exs: "elixir",
	fs: "fsharp",
	fsi: "fsharp",
	fsx: "fsharp",
	go: "go",
	h: "cpp",
	hpp: "cpp",
	hs: "haskell",
	html: "html",
	java: "java",
	js: "javascript",
	json: "json",
	jsonc: "jsonc",
	jsx: "javascriptreact",
	kt: "kotlin",
	kts: "kotlin",
	less: "less",
	lua: "lua",
	m: "objective-c",
	md: "markdown",
	mjs: "javascript",
	mm: "objective-cpp",
	php: "php",
	pl: "perl",
	pm: "perl",
	ps1: "powershell",
	py: "python",
	r: "r",
	rb: "ruby",
	rs: "rust",
	scala: "scala",
	scss: "scss",
	sh: "shellscript",
	sql: "sql",
	svelte: "svelte",
	swift: "swift",
	ts: "typescript",
	tsx: "typescriptreact",
	vue: "vue",
	xml: "xml",
	yaml: "yaml",
	yml: "yaml",
};

function guessLanguageFromExtension(ext: string): string {
	return languageMap[ext] || "plaintext";
}

export function formatCodeAsMarkdown(
	relativePath: string,
	content: string,
): string {
	const ext = path.extname(relativePath).replace(".", "").toLowerCase();
	const language = guessLanguageFromExtension(ext);

	return applyTemplate({ content, language, path: relativePath });
}

export function formatBinaryAsMarkdown(
	relativePath: string,
	meta: BinaryMetadata,
): string {
	const lines: string[] = [];

	const sizeKB = (meta.size / 1024).toFixed(1);
	lines.push(`- size: ${sizeKB} KB (${meta.size.toLocaleString()} bytes)`);

	if (meta.mime) {
		lines.push(`- mime: ${meta.mime}`);
	}

	return applyTemplate({
		content: lines.join("\n"),
		language: "text",
		path: relativePath,
	});
}

export function applyTemplate(vars: {
	language: string;
	path: string;
	content: string;
}) {
	const template = getSettings().template.replace(/\\n/g, "\n");
	const filled = template
		.replace(/\{path\}/g, vars.path)
		.replace(/\{content\}/g, vars.content);

	const result = `\`\`\`${vars.language}\n${filled}\n\`\`\`\n\n`;
	return result;
}
