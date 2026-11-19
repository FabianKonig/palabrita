import type { ReactNode } from "react";
import type { FormSlot } from "../domain/forms";
import type { Vocab } from "../domain/types";
import { GermanText } from "./Flashcard";
import { Speaker } from "./Speaker";
import { VerbTable } from "./VerbTable";

/** Headword with speaker button and all German meanings. */
export function WordHead({
  vocab,
  titleId,
}: {
  vocab: Vocab;
  titleId?: string;
}) {
  return (
    <>
      <div className="detail-head">
        <h1 id={titleId}>{vocab.es}</h1>
        <Speaker es={vocab.es} />
      </div>
      <p className="detail-de">
        <GermanText de={vocab.de} />
      </p>
    </>
  );
}

/**
 * Shared verb view of the dictionary detail page and the study overlay:
 * head, optional extra content (children), then the conjugation table.
 */
export function VerbDetail({
  vocab,
  titleId,
  legendLink = true,
  highlight,
  children,
}: {
  vocab: Vocab;
  titleId?: string;
  /** False inside the study overlay: leaving the session via the link would lose it. */
  legendLink?: boolean;
  /** Forms to mark in the table (from a form hit in the dictionary), see SPEC §3.3a. */
  highlight?: readonly FormSlot[];
  children?: ReactNode;
}) {
  return (
    <>
      <WordHead vocab={vocab} titleId={titleId} />
      {children}
      <VerbTable vocab={vocab} legendLink={legendLink} highlight={highlight} />
    </>
  );
}
