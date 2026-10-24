import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const roots = ["README.md", "docs", "examples"];
const markdownFiles = [];

async function collect(target) {
  const absolute = path.join(root, target);
  let info;
  try { info = await stat(absolute); }
  catch { return; }
  if (info.isFile()) {
    if (target.toLowerCase().endsWith(".md")) markdownFiles.push(absolute);
    return;
  }
  if (!info.isDirectory()) return;
  for (const entry of await readdir(absolute, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name.startsWith(".")) continue;
    const child = path.join(absolute, entry.name);
    if (entry.isDirectory()) await collect(path.relative(root, child));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) markdownFiles.push(child);
  }
}

for (const target of roots) await collect(target);
const failures = [];
const linkPattern = /!?(?:\[[^\]]*\])\(([^)]+)\)|<((?:\.\.?\/)[^>]+)>/g;

for (const file of [...new Set(markdownFiles)]) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(linkPattern)) {
    const raw = (match[1] ?? match[2] ?? "").trim().replace(/^<|>$/g, "");
    if (!raw || raw.startsWith("#") || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(raw)) continue;
    const destination = raw.split("#", 1)[0].split("?", 1)[0];
    if (!destination) continue;
    const decoded = decodeURIComponent(destination);
    const resolved = path.resolve(path.dirname(file), decoded);
    if (!resolved.startsWith(root + path.sep) && resolved !== root) {
      failures.push(`${path.relative(root, file)}: link escapes repository: ${raw}`);
      continue;
    }
    try {
      await stat(resolved);
    } catch {
      failures.push(`${path.relative(root, file)}: missing local link: ${raw}`);
    }
  }
}

if (failures.length) {
  console.error("Documentation link check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Documentation link check passed for ${new Set(markdownFiles).size} Markdown files.`);
}
