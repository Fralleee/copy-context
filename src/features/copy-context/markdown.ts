import path from "node:path";
import { getSettings } from "../../config";
import type { BinaryMetadata } from "./binary-metadata";

const languageMap: { [ext: string]: string } = {
	babelrc: "json",
	bash: "bash",
	bat: "batch",
	CODEOWNERS: "plaintext",
	CONTRIBUTING: "markdown",
	c: "c",
	cc: "cpp",
	cfg: "ini",
	cjs: "js",
	clj: "clojure",
	cljs: "clojure",
	cmd: "batch",
	coffee: "coffeescript",
	conf: "conf",
	cpp: "cpp",
	cs: "csharp",
	cshtml: "razor",
	css: "css",
	csv: "csv",
	cxx: "cpp",
	dart: "dart",
	diff: "diff",
	dockerfile: "dockerfile",
	dockerignore: "docker",
	editorconfig: "editorconfig",
	edn: "clojure",
	elm: "elm",
	env: "dotenv",
	erb: "erb",
	erl: "erlang",
	eslintrc: "json",
	ex: "elixir",
	exs: "elixir",
	fish: "fish",
	fs: "fsharp",
	fsi: "fsharp",
	fsx: "fsharp",
	gitattributes: "git",
	gitconfig: "git",
	gitignore: "git",
	go: "go",
	gql: "graphql",
	gradle: "gradle",
	graphql: "graphql",
	groovy: "groovy",
	h: "c",
	hcl: "hcl",
	hpp: "cpp",
	hs: "haskell",
	htaccess: "apache",
	htm: "html",
	html: "html",
	hxx: "cpp",
	ini: "ini",
	ipynb: "python",
	java: "java",
	js: "js",
	json: "json",
	jsonc: "jsonc",
	jsx: "jsx",
	kt: "kotlin",
	kts: "kotlin",
	LICENSE: "plaintext",
	less: "less",
	lhs: "haskell",
	lisp: "lisp",
	log: "log",
	lua: "lua",
	m: "objectivec",
	makefile: "makefile",
	markdown: "markdown",
	md: "markdown",
	mjs: "js",
	mk: "makefile",
	ml: "ocaml",
	mli: "ocaml",
	mm: "objectivec",
	mts: "js",
	nginx: "nginx",
	patch: "diff",
	php: "php",
	phtml: "php",
	pl: "perl",
	pm: "perl",
	prettierrc: "json",
	properties: "properties",
	ps1: "powershell",
	py: "python",
	pyi: "python",
	Rakefile: "ruby",
	README: "markdown",
	r: "r",
	raku: "raku",
	rb: "ruby",
	rmd: "r",
	rs: "rust",
	sass: "scss",
	scala: "scala",
	scss: "scss",
	sh: "bash",
	sol: "solidity",
	sql: "sql",
	stylelintrc: "json",
	svelte: "svelte",
	svg: "svg",
	swift: "swift",
	tex: "latex",
	tf: "terraform",
	toml: "toml",
	ts: "ts",
	tsv: "tsv",
	tsx: "tsx",
	txt: "plaintext",
	vb: "vb",
	vue: "vue",
	xml: "xml",
	yaml: "yaml",
	yml: "yaml",
	zig: "zig",
	zsh: "bash",
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
		language: "plaintext",
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
