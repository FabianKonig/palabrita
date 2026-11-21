"""Erzeugt die Sprecherclips der Szenen mit der geklonten Stimme (Qwen3-TTS Base).

Referenz: $VIDEO_WORK/ref/stimme_2a_Szene1.wav (nicht im Repo, beim Nutzer erfragen) mit dem Text von Szene 1.
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
ap.add_argument("--ref", default=str(WORK / "ref" / "stimme_2a_Szene1.wav"))
args = ap.parse_args()

if not Path(args.ref).exists():
    raise SystemExit(f"Referenzclip fehlt: {args.ref}. Beim Nutzer erfragen oder mit 01-stimme-wuerfeln.py neu wählen.")

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
