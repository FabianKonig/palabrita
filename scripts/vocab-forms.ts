import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { adjectiveForms } from "../src/domain/adjectiveForms";
import { conjugate, TENSES } from "../src/domain/conjugation";
import { findDuplicate } from "../src/domain/findDuplicate";
import type { Vocab } from "../src/domain/types";

/**
 * Hilfsskript für den Skill `vokabeln-hinzufuegen` (.claude/skills/).
 * Gibt die von Palabrita berechneten Formen aus, zum Abgleich mit Wiktionary.
 *
 *   npx tsx scripts/vocab-forms.ts --next-id
 *       nächste freie ID
 *   npx tsx scripts/vocab-forms.ts <datei.json|vNNNN> ...
 *       Formen von Einträgen: entweder eine JSON-Datei mit einem Array von
 *       Entwürfen (gleiches Format wie public/vocab/*.json) oder bestehende IDs.
 *       Zeigt außerdem Dubletten gegen den Bestand.
 */
const dir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "vocab",
);

function loadAll(): Vocab[] {
  const index = JSON.parse(readFileSync(join(dir, "index.json"), "utf8")) as {
    topics: { file: string }[];
  };
  return index.topics.flatMap(
    ({ file }) => JSON.parse(readFileSync(join(dir, file), "utf8")) as Vocab[],
  );
}

const PERSON_LABEL: Record<string, string> = {
  "1s": "yo",
  "2s": "tú",
  "3s": "él/ella/usted",
  "1p": "nosotros",
  "2p": "vosotros",
  "3p": "ellos/ustedes",
};

function mark(f: { form: string; irregular: boolean }): string {
  return f.irregular ? `${f.form}*` : f.form;
}

function printEntry(v: Vocab, all: Vocab[], isDraft: boolean): void {
  console.log(
    `\n=== ${v.id ?? "(ohne ID)"}  ${v.es}  [${v.pos}]  ${v.de.join(" / ")}`,
  );
  if (isDraft) {
    const dup = findDuplicate(all, v.es, v.pos);
    if (dup.exact)
      console.log(
        `  !! DUBLETTE: ${dup.exact.id} (${dup.exact.es}, ${dup.exact.pos})`,
      );
    for (const s of dup.similar)
      console.log(`  ?  ähnlich: ${s.id} (${s.es}, ${s.pos})`);
  }
  if (v.pos === "verb") {
    const c = conjugate(v);
    console.log(`  Notation: ${c.notation}   Regelmäßigkeit: ${c.regularity}`);
    console.log("  (* = weicht vom regelmäßigen Muster ab)");
    for (const t of TENSES) {
      const forms = c.tenses[t];
      console.log(`  ${t}:`);
      for (const f of forms)
        console.log(`    ${PERSON_LABEL[f.person].padEnd(14)} ${mark(f)}`);
    }
    console.log(`  participio: ${mark(c.participio)}`);
    console.log(`  gerundio:   ${mark(c.gerundio)}`);
  } else if (v.pos === "adj") {
    const a = adjectiveForms(v);
    console.log(`  m: ${v.es}   f: ${a.f}   m.pl: ${a.pl}   f.pl: ${a.fpl}`);
  } else if (v.pos === "noun") {
    console.log(`  Artikel/Genus: ${v.es} (${v.gender})   Plural: ${v.plural}`);
  }
}

const args = process.argv.slice(2);
const all = loadAll();

if (args.includes("--next-id") || args.length === 0) {
  const max = Math.max(...all.map((v) => Number(v.id.slice(1))));
  console.log(`Nächste freie ID: v${String(max + 1).padStart(4, "0")}`);
  console.log(`Einträge im Bestand: ${all.length}`);
  if (args.length === 0)
    console.log("Aufruf siehe Kopf von scripts/vocab-forms.ts");
} else {
  for (const arg of args) {
    if (/^v\d{4}$/.test(arg)) {
      const v = all.find((x) => x.id === arg);
      if (v) printEntry(v, all, false);
      else console.log(`\n=== ${arg}: nicht gefunden`);
    } else {
      const drafts = JSON.parse(readFileSync(arg, "utf8")) as Vocab[];
      for (const v of drafts) printEntry(v, all, true);
    }
  }
}
