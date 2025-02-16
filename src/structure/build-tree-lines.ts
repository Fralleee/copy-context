import * as fs from "fs/promises";
import * as path from "path";

export async function buildTreeLines(
  dirPath: string,
  prefix: string
): Promise<string[]> {
  const lines: string[] = [];

  let entries = await fs.readdir(dirPath, { withFileTypes: true });
  entries = entries.filter((entry) => !entry.name.startsWith("."));

  const folders = entries
    .filter((e) => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));
  const files = entries
    .filter((e) => e.isFile())
    .sort((a, b) => a.name.localeCompare(b.name));

  const sortedEntries = [...folders, ...files];
  const total = sortedEntries.length;

  for (let i = 0; i < total; i++) {
    const entry = sortedEntries[i];
    const isLast = i === total - 1;
    const branch = isLast ? "└──" : "├──";
    const icon = entry.isDirectory() ? "📁" : "📄";
    const childPath = path.join(dirPath, entry.name);

    lines.push(`${prefix}${branch} ${icon} ${entry.name}`);
    if (entry.isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      const childLines = await buildTreeLines(childPath, newPrefix);
      lines.push(...childLines);
    }
  }

  return lines;
}
