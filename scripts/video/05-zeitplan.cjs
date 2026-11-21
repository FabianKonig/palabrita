// Zeitplan aus den echten Längen der Sprecherclips und den Wortzeiten.
// Aufruf (aus dem Repo-Wurzelordner): node scripts/video/05-zeitplan.cjs
// Ergebnis: $VIDEO_WORK/build/timeline.json
const fs = require("node:fs");
const { execSync } = require("node:child_process");
const { work } = require("./lib/paths.cjs");

const dur = (f) =>
  parseFloat(
    execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${f}"`,
    ).toString(),
  );
const words = JSON.parse(fs.readFileSync(work("build", "words.json"), "utf8"));

const L = 0.4; // Vorlauf des Sprechers in jeder Szene (s)
const tail = {
  1: 0.6,
  3: 0.5,
  4: 0.35,
  5: 0.5,
  6: 0.7,
  7: 0.2,
  8: 0.4,
  9: 0.8,
};
const minD = { 1: 6.0, 2: 7.4, 4: 7.6, 5: 5.3, 7: 4.0, 8: 5.2, 9: 3.8 };

const scenes = [];
let S = 0;
for (let i = 1; i <= 9; i++) {
  const d = dur(work("audio", `s${i}.wav`));
  const D = Math.max(minD[i] || 0, L + d + (tail[i] || 0.5));
  scenes.push({ i, S, A: S + L, audio: d, D });
  S += D;
}

/** Zeit (s, relativ zum Clipanfang) des n-ten Worts, das auf das Muster passt. */
const find = (sc, re, nth = 0) => {
  const hit = words["s" + sc].filter((x) => re.test(x.w.toLowerCase()));
  return hit[nth] ? hit[nth].t0 : null;
};
const last = (sc) => words["s" + sc][words["s" + sc].length - 1].t0;
const anchors = {
  s3_camion: find(3, /^kam/),
  s3_mexiko: find(3, /^mexiko/),
  s6_tipp: find(6, /^tipp/),
  s6_sehr: find(6, /^sehr|^ser/),
  s6_gebeugte: find(6, /^gebeugte/),
  s6_und: find(6, /^und/, 2),
  s6_podemos1: find(6, /^podemos/, 0),
  s6_poder: find(6, /^pod/, 1),
  s6_last: last(6), // das letzte "Podemos!" der Szene 6
  s8_offline: find(8, /^offline/),
  s8_kein: find(8, /^kein/, 0),
  s8_tracking: find(8, /^tracking/),
};
const missing = Object.entries(anchors).filter(([, v]) => v === null);
if (missing.length)
  console.warn("Anker nicht gefunden:", missing.map(([k]) => k).join(", "));

fs.writeFileSync(
  work("build", "timeline.json"),
  JSON.stringify({ scenes, anchors, total: S }, null, 1),
);
console.log("Gesamtlänge", S.toFixed(1), "s (Grenze 70 s)");
scenes.forEach((s) =>
  console.log(
    `s${s.i} Start ${s.S.toFixed(2)} Dauer ${s.D.toFixed(2)} Audio ${s.audio.toFixed(2)}`,
  ),
);
console.log(JSON.stringify(anchors));
