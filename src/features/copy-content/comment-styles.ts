export type CommentStyle = {
	line?: string;
	block?: [string, string];
	plain?: boolean;
};

export const commentStyles: Record<string, CommentStyle> = {
	// hash comments
	bash: { line: "#" },
	// slash comments
	c: { line: "//" },

	// semicolon comments
	clojure: { line: ";" },
	cpp: { line: "//" },
	cs: { line: "//" },
	csharp: { line: "//" },

	// block comments
	css: { block: ["/*", "*/"] },
	docker: { line: "#" },
	dockerfile: { line: "#" },
	dotenv: { line: "#" },
	fish: { line: "#" },
	go: { line: "//" },
	gradle: { line: "#" },
	haskell: { line: "--" },

	// html comments
	html: { block: ["<!--", "-->"] },
	ini: { line: "#" },
	java: { line: "//" },
	js: { line: "//" },
	jsx: { line: "//" },
	kotlin: { line: "//" },
	less: { block: ["/*", "*/"] },
	lisp: { line: ";" },
	lua: { line: "--" },
	makefile: { line: "#" },
	markdown: { block: ["<!--", "-->"] },
	nginx: { line: "#" },
	objectivec: { line: "//" },
	ocaml: { block: ["(*", "*)"] },
	perl: { line: "#" },
	php: { line: "//" },

	plaintext: { plain: true },
	powershell: { line: "#" },
	properties: { line: "#" },
	python: { line: "#" },
	r: { line: "#" },
	raku: { line: "#" },
	ruby: { line: "#" },
	rust: { line: "//" },
	sass: { block: ["/*", "*/"] },
	scala: { line: "//" },
	scss: { block: ["/*", "*/"] },

	// dash comments
	sql: { line: "--" },
	svelte: { block: ["<!--", "-->"] },
	svg: { block: ["<!--", "-->"] },
	swift: { line: "//" },
	terraform: { line: "#" },
	toml: { line: "#" },
	ts: { line: "//" },
	tsx: { line: "//" },

	// apostrophe comments
	vb: { line: "'" },
	vue: { line: "//" },
	xml: { block: ["<!--", "-->"] },
	yaml: { line: "#" },
	zig: { line: "//" },
};
