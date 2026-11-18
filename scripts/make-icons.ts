import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/**
 * Renders the PWA icons from public/icons/logo.svg.
 * Usage: npx tsx scripts/make-icons.ts (the PNGs are committed, run only after logo changes).
 */
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "icons");
mkdirSync(out, { recursive: true });

const svg = readFileSync(join(out, "logo.svg"), "utf8");
// Maskable/Apple icons are full-bleed: the OS applies its own mask.
const fullBleed = svg.replace('rx="96"', 'rx="0"');

const jobs: [string, string, number][] = [
  ["icon-192.png", svg, 192],
  ["icon-512.png", svg, 512],
  ["icon-maskable-512.png", fullBleed, 512],
  ["apple-touch-icon.png", fullBleed, 180],
];

for (const [name, source, size] of jobs) {
  await sharp(Buffer.from(source))
    .resize(size, size)
    .png()
    .toFile(join(out, name));
  console.log("geschrieben:", name);
}
