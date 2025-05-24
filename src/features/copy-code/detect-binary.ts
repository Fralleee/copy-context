import fs from "node:fs/promises";
import { fromFile } from "file-type";

export async function detectBinary(fullPath: string): Promise<boolean> {
	const ft = await fromFile(fullPath);
	if (ft) {
		return !ft.mime.startsWith("text/");
	}

	const itb = await import("istextorbinary");
	return !itb.isText(fullPath, await fs.readFile(fullPath));
}
