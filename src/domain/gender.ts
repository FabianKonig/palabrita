import type { Vocab } from "./types";

/** Genus-Bezeichnungen für Nomen (Badge in der Lernkarte und Detailseite, SPEC §14.1). */
export const GENDER_LABEL: Record<NonNullable<Vocab["gender"]>, string> = {
  m: "maskulin",
  f: "feminin",
  "m/f": "maskulin/feminin",
};
