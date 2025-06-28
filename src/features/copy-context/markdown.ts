import path from "node:path";
import type { BinaryMetadata } from "./binary-metadata";
import { type CommentStyle, commentStyles } from "./comment-styles";
import { languageMap } from "./language-map";

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
	const header = headerForLanguage(vars.language, vars.path);
	const result = `\`\`\`${vars.language}\n${header}\n${vars.content}\n\`\`\`\n\n`;
	return result;
}

const defaultStyle: CommentStyle = { line: "//" };

function headerForLanguage(language: string, filePath: string): string {
	const style = commentStyles[language] || defaultStyle;

	if (style.plain) {
		return filePath;
	}

	if (style.line) {
		return `${style.line} ${filePath}`;
	}

	if (style.block) {
		return `${style.block[0]} ${filePath} ${style.block[1]}`;
	}

	return `// ${filePath}`;
}
