import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  conjugate,
  type Conjugation,
  type FormInfo,
  TENSE_LABEL,
} from "../domain/conjugation";
import { hasSlot, type FormSlot } from "../domain/forms";
import type { Person, Tense, Vocab } from "../domain/types";
import { FROM_APP_STATE } from "../features/legend/Legend";

const PERSON_LABEL: Record<Person, string> = {
  "1s": "yo",
  "2s": "tú",
  "3s": "él/ella/usted",
  "1p": "nosotros",
  "2p": "vosotros",
  "3p": "ustedes/ellos",
};

const REGULARITY_LABEL: Record<Conjugation["regularity"], string> = {
  regular: "regelmäßig",
  orthographic: "Rechtschreibänderung",
  "yo-irregular": "unregelmäßig in der 1. Person",
  "stem-change": "Stammwechsel",
  irregular: "unregelmäßig",
};

function Form({ info, hit = false }: { info: FormInfo; hit?: boolean }) {
  const cls = ["form", info.irregular && "irr", hit && "form-hit"]
    .filter(Boolean)
    .join(" ");
  return <span className={cls}>{info.form}</span>;
}

/** Conjugation table of a verb: all persons per tense, irregular forms highlighted. */
export function VerbTable({
  vocab,
  legendLink = true,
  highlight,
}: {
  vocab: Vocab;
  /** Link to the legend; hidden where leaving the page would be harmful. */
  legendLink?: boolean;
  /** Forms marked as hits (background and bold), see SPEC §3.3a. Without: no marking. */
  highlight?: readonly FormSlot[];
}) {
  const result = useMemo(() => {
    try {
      return conjugate(vocab);
    } catch {
      return null;
    }
  }, [vocab]);

  if (!result) {
    return (
      <p className="notice">
        Die Formen dieses Verbs konnten nicht erzeugt werden.
      </p>
    );
  }

  const kind = /(ar|er|ir|ír)(se)?$/.exec(vocab.es)?.[1]?.replace("ír", "ir");
  const regularLabel =
    result.regularity === "regular" && kind
      ? `regelmäßig (-${kind})`
      : REGULARITY_LABEL[result.regularity];

  return (
    <section className="verb" aria-label="Verbformen">
      <h2>Formen</h2>
      <p className="verb-meta">
        <strong>{result.notation}</strong>{" "}
        {legendLink && (
          <>
            <Link
              to="/legend"
              state={FROM_APP_STATE}
              className="info"
              aria-label="Was bedeutet die Klammer?"
              title="Was bedeutet die Klammer?"
            >
              ⓘ
            </Link>{" "}
          </>
        )}
        <span
          className={`badge${result.regularity === "regular" ? "" : " badge-irr"}`}
        >
          {regularLabel}
        </span>
      </p>

      {(Object.keys(TENSE_LABEL) as Tense[]).map((tense) => (
        <div className="tense" key={tense}>
          <h3>{TENSE_LABEL[tense]}</h3>
          <table className="forms">
            <tbody>
              {result.tenses[tense].map(({ person, form, irregular }) => (
                <tr key={person}>
                  <th scope="row">{PERSON_LABEL[person]}</th>
                  <td>
                    <Form
                      info={{ form, irregular }}
                      hit={hasSlot(highlight, { kind: "verb", tense, person })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="tense">
        <h3>Partizip und Gerundio</h3>
        <table className="forms">
          <tbody>
            <tr>
              <th scope="row">Participio</th>
              <td>
                <Form
                  info={result.participio}
                  hit={hasSlot(highlight, {
                    kind: "verb",
                    tense: "participio",
                  })}
                />
              </td>
            </tr>
            <tr>
              <th scope="row">Gerundio</th>
              <td>
                <Form
                  info={result.gerundio}
                  hit={hasSlot(highlight, { kind: "verb", tense: "gerundio" })}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="muted legend-hint">
        <span className="form irr">Farbig</span> = weicht vom regelmäßigen
        Muster ab.
      </p>
    </section>
  );
}
