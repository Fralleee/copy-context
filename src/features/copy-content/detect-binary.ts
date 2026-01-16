import path from "node:path";
import { fromFile } from "file-type";
import { languageMap } from "./language-map";

function getExtension(filePath: string): string {
	const ext = path.extname(filePath).slice(1).toLowerCase();
	if (!ext) {
		return path.basename(filePath).toLowerCase();
	}
	return ext;
}

export async function detectBinary(
	fullPath: string,
	additionalTextExtensions: string[] = [],
): Promise<boolean> {
	const ext = getExtension(fullPath);

	// Layer 1: Check built-in known text extensions
	if (ext in languageMap) {
		return false;
	}

	// Layer 2: Check user-configured text extensions
	if (additionalTextExtensions.includes(ext)) {
		return false;
	}

	// Layer 3: Check for known binary formats via magic numbers
	const ft = await fromFile(fullPath);
	if (ft) {
		return !ft.mime.startsWith("text/");
	}

	// Layer 4: Fall back to content-based detection
	const itb = await import("istextorbinary");
	return !itb.isText(fullPath, undefined);
}
