"""Erzeugt neue Stimm-Kandidaten mit Qwen3-TTS VoiceDesign (nur nötig, wenn der Referenzclip fehlt).

VoiceDesign würfelt bei jedem Aufruf eine neue Stimme. Die Kandidaten (Satz von Szene 1) anhören,
einen auswählen und als $VIDEO_WORK/ref/stimme_2a_Szene1.wav ablegen.

Aufruf (aus dem Repo-Wurzelordner): .venv/bin/python scripts/video/01-stimme-wuerfeln.py [Anzahl]
"""
import json, os, sys, time
from pathlib import Path

import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

ROOT = Path(__file__).resolve().parents[2]
WORK = Path(os.environ.get("VIDEO_WORK", ROOT / ".video-work"))
TEXT = json.loads((Path(__file__).parent / "sprechertext.json").read_text(encoding="utf-8"))["scenes"]["s1"]

# Beschreibung, aus der die Stimme "2a" entstand (Nutzer-Favorit, 2026-11-20)
INSTRUCT = (
    "A young adult man in his mid twenties with a clear, slightly deeper voice. Very upbeat, fast-paced and "
    "playful, like a charismatic host of a modern app commercial or a popular YouTube explainer. Smiling, "
    "cheeky and energetic, never sleepy or monotone. Natural Mexican Spanish pronunciation for the Spanish words."
)

count = int(sys.argv[1]) if len(sys.argv) > 1 else 6
torch.set_num_threads(os.cpu_count() or 4)
out = WORK / "kandidaten"
out.mkdir(parents=True, exist_ok=True)
model = Qwen3TTSModel.from_pretrained(
    "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32
)
for i in range(1, count + 1):
    t0 = time.time()
    wavs, sr = model.generate_voice_design(text=TEXT, instruct=INSTRUCT, language="German")
    path = out / f"kandidat_{i}.wav"
    sf.write(path, wavs[0], sr)
    print(path, round(len(wavs[0]) / sr, 1), "s Audio in", round(time.time() - t0), "s", flush=True)
