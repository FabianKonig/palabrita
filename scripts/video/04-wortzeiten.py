"""Wortzeiten je Szenenclip (Whisper), Grundlage für Tipps und Einblendungen.

Whisper schreibt spanische Wörter deutsch ("Kamion", "Podemos"), deshalb sucht 05-zeitplan.cjs nach Anfangsbuchstaben.
Aufruf (aus dem Repo-Wurzelordner): .venv/bin/python scripts/video/04-wortzeiten.py
Ergebnis: $VIDEO_WORK/build/words.json
"""
import json, os, warnings
from pathlib import Path

import librosa
from transformers import pipeline

warnings.filterwarnings("ignore")
ROOT = Path(__file__).resolve().parents[2]
WORK = Path(os.environ.get("VIDEO_WORK", ROOT / ".video-work"))
(WORK / "build").mkdir(parents=True, exist_ok=True)

asr = pipeline("automatic-speech-recognition", model="openai/whisper-small", device="cpu")
out = {}
for i in range(1, 10):
    y, sr = librosa.load(str(WORK / "audio" / f"s{i}.wav"), sr=16000)
    r = asr(
        {"raw": y, "sampling_rate": sr},
        return_timestamps="word",
        generate_kwargs={"language": "de", "task": "transcribe"},
    )
    out[f"s{i}"] = [{"w": c["text"].strip(), "t0": c["timestamp"][0], "t1": c["timestamp"][1]} for c in r["chunks"]]
    print(i, " ".join(f"{c['w']}@{c['t0']:.1f}" for c in out[f"s{i}"])[:300], flush=True)
(WORK / "build" / "words.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
