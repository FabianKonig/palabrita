import type { Tense } from "../types";

/** Names of the tenses, as the conjugation table and the form search show them. */
export const TENSE_LABEL: Record<Tense, string> = {
  presente: "Presente",
  indefinido: "Pretérito indefinido",
  imperfecto: "Imperfecto",
  futuro: "Futuro",
  imperativo: "Imperativo",
};
