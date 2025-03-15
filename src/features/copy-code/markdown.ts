import path from "node:path";

export function formatAsMarkdown(
	relativePath: string,
	content: string,
): string {
	const ext = path.extname(relativePath).replace(".", "").toLowerCase();
	const lang = guessLanguageFromExtension(ext);

	return `### ${relativePath}\n\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
}

export function guessLanguageFromExtension(ext: string): string {
	switch (ext) {
		case "js":
		case "cjs":
		case "mjs":
			return "javascript";
		case "ts":
			return "typescript";
		case "jsx":
			return "javascriptreact";
		case "tsx":
			return "typescriptreact";
		case "json":
			return "json";
		case "css":
			return "css";
		case "html":
			return "html";
		default:
			return "";
	}
}
