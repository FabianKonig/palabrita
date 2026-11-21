// Sucht einen orderSeed, der im Thema "transport" die Kartenfolge camión (v0196), zwei einfache A1-Wörter
// und als vierte Karte volar (v0180) ergibt. Die Reihenfolge neuer Karten ist deterministisch
// (position() in src/domain/queue.ts: FNV-1a über "orderSeed|vocabId" plus fmix32).
// Aufruf (aus dem Repo-Wurzelordner): node scripts/video/seed-suchen.cjs
// Ergebnis: 125947 (camión, taxi, avión, volar). Der Wert steht als SEED in lib/effects.cjs.
const fs = require("node:fs");
const path = require("node:path");
const { VOCAB } = require("./lib/paths.cjs");

const t = JSON.parse(
  fs.readFileSync(path.join(VOCAB, "transport.json"), "utf8"),
);
const list = Array.isArray(t) ? t : t.vocab || t.entries;
const ids = list.map((v) => v.id).sort();

function position(vocabId, seed) {
  const text = `${seed}|${vocabId}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

// autobús, taxi, tren, avión, aeropuerto, estación
const nice = new Set(["v0005", "v0185", "v0188", "v0186", "v0187", "v0190"]);
const found = [];
for (let seed = 1; seed < 6_000_000 && found.length < 5; seed++) {
  const pos = ids
    .map((id) => [position(id, seed), id])
    .sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1));
  if (
    pos[0][1] === "v0196" &&
    nice.has(pos[1][1]) &&
    nice.has(pos[2][1]) &&
    pos[3][1] === "v0180"
  )
    found.push([
      seed,
      pos
        .slice(0, 4)
        .map((p) => p[1])
        .join(","),
    ]);
}
console.log(JSON.stringify(found));
