/** Text actually spoken for a Spanish entry (SPEC §13). */
export function speechText(es: string): string {
  return es
    .replace(/\([^)]*\)/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.split("/")[0])
    .filter(Boolean)
    .join(" ");
}

/** Preference: es-MX, es-US, any es-*, then any lang starting with "es". */
export function pickVoice<T extends { lang: string }>(
  voices: readonly T[],
): T | null {
  const norm = (v: T) => v.lang.replace("_", "-").toLowerCase();
  return (
    voices.find((v) => norm(v) === "es-mx") ??
    voices.find((v) => norm(v) === "es-us") ??
    voices.find((v) => norm(v).startsWith("es-")) ??
    voices.find((v) => norm(v).startsWith("es")) ??
    null
  );
}
