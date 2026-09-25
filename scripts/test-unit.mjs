import { readdir } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testRoot = path.join(projectRoot, "web", "js");

async function findTestFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedResults = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findTestFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".test.js") ? [entryPath] : [];
  }));
  return nestedResults.flat();
}

const testFiles = await findTestFiles(testRoot);
if (testFiles.length === 0) throw new Error("No frontend unit tests were found.");

const result = spawnSync(process.execPath, ["--test", ...testFiles], {
  cwd: projectRoot,
  stdio: "inherit",
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);