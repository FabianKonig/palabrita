// Setzt Bilder (mit Zeitstempeln) und Ton zu einem MP4 zusammen: 1080 x 1920, 30 B/s, H.264/AAC.
// Aufruf (aus dem Repo-Wurzelordner): node scripts/video/07-zusammenbau.cjs
// AUDIO_ONLY=1 baut nur die Tonspur und das MP4 neu (Bild bleibt, z. B. nach Änderung der Lautstärke).
const fs = require("node:fs");
const { execSync, execFileSync } = require("node:child_process");
const { work } = require("./lib/paths.cjs");

const TL = JSON.parse(fs.readFileSync(work("build", "timeline.json"), "utf8"));
const R = JSON.parse(fs.readFileSync(work("build", "frames.json"), "utf8"));
const total = TL.total;
const sh = (cmd) => execSync(cmd, { stdio: "inherit" });

if (!process.env.AUDIO_ONLY) {
  // Bildliste mit Dauern: das letzte Bild vor dem Start gilt ab t=0.
  let fr = R.frames
    .map((f) => ({ t: f.w - R.T0, f: f.f }))
    .sort((a, b) => a.t - b.t);
  const before = fr.filter((x) => x.t <= 0);
  const after = fr.filter((x) => x.t > 0);
  const first = before.length ? before[before.length - 1] : after.shift();
  fr = [{ t: 0, f: first.f }, ...after].filter((x) => x.t < total);
  let list = "";
  for (let i = 0; i < fr.length; i++) {
    const end = i + 1 < fr.length ? fr[i + 1].t : total;
    list += `file '${fr[i].f}'\nduration ${Math.max(0.001, end - fr[i].t).toFixed(4)}\n`;
  }
  list += `file '${fr[fr.length - 1].f}'\n`;
  fs.writeFileSync(work("build", "list.txt"), list);
  sh(
    `ffmpeg -v error -y -f concat -safe 0 -i "${work("build", "list.txt")}" -vf "fps=30,scale=1080:1920:flags=lanczos:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xf3f6f5,format=yuv420p" -r 30 -c:v libx264 -crf 19 -preset medium -t ${total} "${work("build", "video_silent.mp4")}"`,
  );
  console.log("Video ohne Ton fertig:", fr.length, "Bilder");
}

// Ton: Sprecherclips an den Szenenstart legen, Musik zuschneiden, unter dem Sprecher absenken, mischen.
const inputs = TL.scenes
  .map((s) => `-i "${work("audio", `s${s.i}.wav`)}"`)
  .join(" ");
const delays = TL.scenes
  .map(
    (s, k) =>
      `[${k + 1}:a]adelay=${Math.round(s.A * 1000)}|${Math.round(s.A * 1000)},apad=whole_dur=${total}[n${s.i}]`,
  )
  .join(";");
const nin = TL.scenes.map((s) => `[n${s.i}]`).join("");
const fo = (total - 3.2).toFixed(2);
const fc =
  `${delays};${nin}amix=inputs=9:normalize=0:duration=longest,aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:${total},asplit=2[narr][narrsc];` +
  `[0:a]atrim=0:${total},asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=stereo,afade=t=in:d=0.6,afade=t=out:st=${fo}:d=3.2,volume=0.42[mus];` +
  `[mus][narrsc]sidechaincompress=threshold=0.012:ratio=14:attack=12:release=500:makeup=1[duck];` +
  `[duck][narr]amix=inputs=2:weights=0.9 1.45:normalize=0,loudnorm=I=-16:TP=-1.5[out]`;
sh(
  `ffmpeg -v error -y -i "${work("music", "vibrant-momentum.mp3")}" ${inputs} -filter_complex "${fc}" -map "[out]" -c:a aac -b:a 192k -t ${total} "${work("build", "audio_mix.m4a")}"`,
);
const out = work("build", "palabrita_erklaervideo.mp4");
// Namensnennung der Musik (CC BY 4.0) reist in den Metadaten der MP4-Datei mit (docs/ERKLAERVIDEO.md).
const MUSIK =
  "Musik: „Vibrant Momentum (Energetic Track for Engaging Content)“ von LolaMoore (https://freesound.org/people/LolaMoore/sounds/762602), " +
  "Lizenz CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Für das Video gekürzt, ein- und ausgeblendet und in der Lautstärke angepasst.";
execFileSync(
  "ffmpeg",
  [
    "-v",
    "error",
    "-y",
    "-i",
    work("build", "video_silent.mp4"),
    "-i",
    work("build", "audio_mix.m4a"),
    "-c:v",
    "copy",
    "-c:a",
    "copy",
    "-shortest",
    "-movflags",
    "+faststart",
    "-metadata",
    "title=Palabrita – Erklärvideo",
    "-metadata",
    "copyright=Musik: LolaMoore, CC BY 4.0",
    "-metadata",
    "comment=" + MUSIK,
    out,
  ],
  { stdio: "inherit" },
);
// Vorschaubild für den Player (poster): ein Bild aus dem Video, standardmäßig bei 8,6 s (Szene 2).
const poster = work("build", "palabrita_erklaervideo_poster.jpg");
execFileSync(
  "ffmpeg",
  [
    "-v",
    "error",
    "-y",
    "-ss",
    process.env.POSTER_T ?? "8.6",
    "-i",
    out,
    "-frames:v",
    "1",
    "-vf",
    "scale=540:-2",
    "-q:v",
    "4",
    poster,
  ],
  { stdio: "inherit" },
);
console.log(out);
console.log(poster);
console.log(
  execSync(
    `ffprobe -v error -show_entries format=duration,size:format_tags=title,copyright,comment:stream=codec_name,width,height -of default=nw=1 "${out}"`,
  ).toString(),
);
