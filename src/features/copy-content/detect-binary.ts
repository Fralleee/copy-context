import path from "node:path";
import { fromFile } from "file-type";
import { languageMap } from "./language-map";

// Known binary extensions that should always be treated as binary
const KNOWN_BINARY_EXTENSIONS = new Set([
	"png",
	"jpg",
	"jpeg",
	"gif",
	"bmp",
	"ico",
	"webp",
	"avif",
	"tiff",
	"tif",
	"svg", // SVG is text but often treated as binary asset
	"mp3",
	"mp4",
	"wav",
	"ogg",
	"webm",
	"avi",
	"mov",
	"mkv",
	"flac",
	"aac",
	"pdf",
	"doc",
	"docx",
	"xls",
	"xlsx",
	"ppt",
	"pptx",
	"zip",
	"tar",
	"gz",
	"rar",
	"7z",
	"bz2",
	"xz",
	"exe",
	"dll",
	"so",
	"dylib",
	"bin",
	"dat",
	"woff",
	"woff2",
	"ttf",
	"otf",
	"eot",
	"class",
	"jar",
	"pyc",
	"pyo",
	"o",
	"a",
	"lib",
	"node",
	"wasm",
]);

export async function detectBinary(fullPath: string): Promise<boolean> {
	const ext = path.extname(fullPath).replace(".", "").toLowerCase();
	const basename = path.basename(fullPath);

	// 1️⃣ Priority 1: Known text extensions (from languageMap) → not binary
	if (languageMap[ext] || languageMap[basename]) {
		return false;
	}

	// 2️⃣ Priority 2: Known binary extensions → is binary
	if (KNOWN_BINARY_EXTENSIONS.has(ext)) {
		return true;
	}

	// 3️⃣ Priority 3: Content-based detection using istextorbinary
	const itb = await import("istextorbinary");
	if (!itb.isText(fullPath, undefined)) {
		return true;
	}

	// 4️⃣ Priority 4: Magic bytes detection (lowest priority)
	const ft = await fromFile(fullPath);
	if (ft) {
		return !ft.mime.startsWith("text/");
	}

	return false;
}
