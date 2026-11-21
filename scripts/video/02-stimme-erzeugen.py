"""Erzeugt die Sprecherclips der Szenen mit der geklonten Stimme (Qwen3-TTS Base).

Referenz: scripts/video/ref/stimme_2a_Szene1.wav (im Repo, 24 kHz, mono, 6,8 s) mit dem Text von Szene 1. Liegt eine Datei
gleichen Namens in $VIDEO_WORK/ref/, hat sie Vorrang (z. B. für eine neu gewählte Stimme).
Modus "nur Stimmcharakter" (x_vector_only_mode=True) ist freigegeben; "icl" nutzt zusätzlich Referenzclip und -text.

Aufruf (aus dem Repo-Wurzelordner):
  .venv/bin/python scripts/video/02-stimme-erzeugen.py [--modus xvec|icl] [--szenen s1 s3 ...]
Ergebnis: $VIDEO_WORK/clone/xvec_sN.wav (bzw. icl_sN.wav)
"""
import argparse, json, os, time
from pathlib import Path

import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

ROOT = Path(__file__).resolve().parents[2]
WORK = Path(os.environ.get("VIDEO_WORK", ROOT / ".video-work"))
CFG = json.loads((Path(__file__).parent / "sprechertext.json").read_text(encoding="utf-8"))

ap = argparse.ArgumentParser()
ap.add_argument("--modus", choices=["xvec", "icl"], default="xvec")
ap.add_argument("--szenen", nargs="*", default=list(CFG["scenes"]))
REPO_REF = Path(__file__).parent / "ref" / "stimme_2a_Szene1.wav"
WORK_REF = WORK / "ref" / "stimme_2a_Szene1.wav"
ap.add_argument("--ref", default=str(WORK_REF if WORK_REF.exists() else REPO_REF))
args = ap.parse_args()

if not Path(args.ref).exists():
    raise SystemExit(f"Referenzclip fehlt: {args.ref}. Neu wählen mit 01-stimme-wuerfeln.py und mit dem Nutzer abstimmen.")

torch.set_num_threads(os.cpu_count() or 4)
out = WORK / "clone"
out.mkdir(parents=True, exist_ok=True)
model = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cpu", dtype=torch.float32)
prompt = model.create_voice_clone_prompt(
    ref_audio=args.ref, ref_text=CFG["ref_text"], x_vector_only_mode=(args.modus == "xvec")
)
for key in args.szenen:
    t0 = time.time()
    wavs, sr = model.generate_voice_clone(text=CFG["scenes"][key], language="German", voice_clone_prompt=prompt)
    path = out / f"{args.modus}_{key}.wav"
    sf.write(path, wavs[0], sr)
    print(path, round(len(wavs[0]) / sr, 1), "s Audio in", round(time.time() - t0), "s", flush=True)
