// Gemeinsame Pfade für alle Video-Skripte (Node). Aufruf immer aus dem Repo-Wurzelordner.
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..", "..");
/** Arbeitsordner für alles Erzeugte (Audio, Bilder, Video). Steht in .gitignore, nie einchecken. */
const WORK = process.env.VIDEO_WORK
  ? path.resolve(process.env.VIDEO_WORK)
  : path.join(ROOT, ".video-work");

module.exports = {
  ROOT,
  WORK,
  VOCAB: path.join(ROOT, "public", "vocab"),
  work: (...parts) => path.join(WORK, ...parts),
  /** Adresse der laufenden App (npm run preview -- --port 4173). */
  BASE: process.env.VIDEO_BASE ?? "http://localhost:4173/#/",
};
