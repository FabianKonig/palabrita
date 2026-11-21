#!/bin/bash
# Lädt die Vorschau-MP3 von "Vibrant Momentum" (LolaMoore, Freesound 762602, CC BY 4.0).
# Namensnennung nötig, Lizenz vor Verwendung auf https://freesound.org/people/LolaMoore/sounds/762602 prüfen.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WORK="${VIDEO_WORK:-$ROOT/.video-work}"
mkdir -p "$WORK/music"
curl -fsSL -o "$WORK/music/vibrant-momentum.mp3" \
  "https://cdn.freesound.org/previews/762/762602_16085454-hq.mp3"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$WORK/music/vibrant-momentum.mp3"
