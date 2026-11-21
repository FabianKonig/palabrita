#!/bin/bash
# Szenenclips aufbereiten: Stille am Rand abschneiden, lange Pausen kürzen, Tempo 1,25, Lautheit angleichen.
# Ergebnis: $VIDEO_WORK/audio/sN.wav (44,1 kHz, mono)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WORK="${VIDEO_WORK:-$ROOT/.video-work}"
MODE="${1:-xvec}"
TEMPO="${TEMPO:-1.25}"
mkdir -p "$WORK/audio"
for i in 1 2 3 4 5 6 7 8 9; do
  ffmpeg -v error -y -i "$WORK/clone/${MODE}_s$i.wav" -af "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=stop_periods=-1:stop_duration=0.55:stop_silence=0.3:stop_threshold=-42dB,atempo=$TEMPO,loudnorm=I=-18:TP=-2" -ar 44100 -ac 1 "$WORK/audio/s$i.wav"
  printf "s$i %.2f s\n" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$WORK/audio/s$i.wav")"
done
