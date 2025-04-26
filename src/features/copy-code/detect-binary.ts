import { isText } from "istextorbinary";
import { fileTypeFromFile } from "file-type";
import fs from "node:fs/promises";

export async function detectBinary(fullPath: string): Promise<boolean> {
	const ft = await fileTypeFromFile(fullPath);
	if (ft) {
		return !ft.mime.startsWith("text/");
	}

	return !(await isText(fullPath, await fs.readFile(fullPath)));
}
