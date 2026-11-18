import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../../hooks/useAppData";
import {
  draftFromVocab,
  vocabFromDraft,
  WordForm,
  type Draft,
} from "./WordForm";

/** Edit form for a user word (static words cannot be edited). */
export function EditWord() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { vocab, saveWord } = useAppData();
  const entry = vocab.get(id);

  if (!entry || entry.origin !== "user")
    return <Navigate to="/dictionary" replace />;

  async function submit(d: Draft) {
    if (!entry) return;
    await saveWord(vocabFromDraft(d, entry.id, entry.createdAt));
    navigate(`/dictionary/${encodeURIComponent(entry.id)}`);
  }

  return (
    <div className="screen">
      <Link to={`/dictionary/${encodeURIComponent(id)}`} className="back">
        ← Abbrechen
      </Link>
      <h1>Wort bearbeiten</h1>
      <WordForm
        initial={draftFromVocab(entry)}
        editingId={entry.id}
        submitLabel="Speichern"
        onSubmit={submit}
      />
    </div>
  );
}
