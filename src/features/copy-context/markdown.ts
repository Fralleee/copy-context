import path from "node:path";
import { getSettings } from "../../config";
import type { BinaryMetadata } from "./binary-metadata";
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
	const template = getSettings().template.replace(/\\n/g, "\n");
	const filled = template
		.replace(/\{path\}/g, vars.path)
		.replace(/\{content\}/g, vars.content);

	const result = `\`\`\`${vars.language}\n${filled}\n\`\`\`\n\n`;
	return result;
}
