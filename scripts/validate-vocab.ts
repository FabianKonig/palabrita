import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateIndex, validateVocab, type VocabFile } from "./validateVocab";

/** Usage: npm run validate:vocab [-- --final] */
const final = process.argv.includes("--final");
const dir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "vocab",
);

const index = JSON.parse(readFileSync(join(dir, "index.json"), "utf8")) as {
  topics: { file: string }[];
};
const files: VocabFile[] = [...new Set(index.topics.map((t) => t.file))].map(
  (file) => ({ file, data: JSON.parse(readFileSync(join(dir, file), "utf8")) }),
);

const report = validateVocab(files, { final });
const errors = [...validateIndex(index), ...report.errors];

console.log(`Einträge: ${report.total}`);
for (const [k, n] of Object.entries(report.counts)) console.log(`  ${k}: ${n}`);
if (report.warnings.length) {
  console.log(`\nWarnungen (${report.warnings.length}):`);
  for (const w of report.warnings) console.log("  - " + w);
}
if (errors.length) {
  console.error(`\nFehler (${errors.length}):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log("\nOK");
