// Bausteine für die Aufnahme: Lernstand, Sprachausgabe-Attrappe, Effektebene (Tipp-Punkte,
// Hervorhebungen, Einblendungen). CSS der Einblendungen: docs/ERKLAERVIDEO.md, "Einblendungen: Gestaltung".
const fs = require("node:fs");
const path = require("node:path");
const { VOCAB } = require("./paths.cjs");

/** Ergibt im Thema "transport" die Kartenfolge camión, taxi, avión, volar (siehe seed-suchen.cjs). */
const SEED = 125947;

/** Vorbereiteter Lernstand: Karten aus anderen Themen, nichts aus "transport". */
function makeCards(now) {
  const DAY = 86400000;
  const files = [
    "grundwortschatz",
    "begruessung",
    "zahlen-zeit",
    "essen",
    "smalltalk",
    "orte",
  ];
  const ids = [];
  for (const f of files) {
    const p = path.join(VOCAB, f + ".json");
    if (!fs.existsSync(p)) continue;
    const a = JSON.parse(fs.readFileSync(p, "utf8"));
    const list = Array.isArray(a) ? a : a.vocab || a.entries;
    for (const v of list) if (v.level === "A1") ids.push(v.id);
  }
  const mk = (vocabId, dir, state, i) => ({
    vocabId,
    dir,
    due: state === "mature" ? now + (3 + (i % 17)) * DAY : now + 2 * DAY,
    interval: state === "mature" ? 12 + (i % 20) : 1,
    ease: 2.5,
    reps: state === "mature" ? 4 : 1,
    lapses: 0,
    lastReviewed: now - (2 + (i % 8)) * DAY,
    introduced: now - (12 + (i % 10)) * DAY,
    state,
    ...(state === "learning" ? { step: 1 } : {}),
  });
  const cards = [];
  ids.slice(0, 120).forEach((id, i) => {
    cards.push(mk(id, "de-es", i < 80 ? "mature" : "learning", i));
    if (i < 90)
      cards.push(mk(id, "es-de", i < 55 ? "mature" : "learning", i + 3));
  });
  return cards;
}

/** Schreibt Einstellungen und Karten direkt in die IndexedDB der App (Version 1), danach Seite neu laden. */
async function seedDb(page, cards) {
  await page.evaluate(
    async ({ seed, cards }) => {
      const db = await new Promise((res, rej) => {
        const r = indexedDB.open("palabrita", 1);
        r.onupgradeneeded = () => {
          const d = r.result;
          if (!d.objectStoreNames.contains("settings"))
            d.createObjectStore("settings");
          if (!d.objectStoreNames.contains("cards"))
            d.createObjectStore("cards", { keyPath: ["vocabId", "dir"] });
        };
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      const tx = db.transaction(["settings", "cards"], "readwrite");
      tx.objectStore("settings").put(
        {
          maxLevel: "B1",
          theme: "light",
          orderSeed: seed,
          startedAt: Date.now(),
        },
        "main",
      );
      tx.objectStore("cards").clear();
      for (const c of cards) tx.objectStore("cards").put(c);
      await new Promise((res, rej) => {
        tx.oncomplete = res;
        tx.onerror = () => rej(tx.error);
      });
      db.close();
    },
    { seed: SEED, cards },
  );
}

/** Sprachausgabe-Attrappe (Init-Skript): spanische Stimme vorhanden, spricht nichts. Der Ton kommt aus der Tonspur. */
function speechMock() {
  const fake = {
    lang: "es-MX",
    name: "Mock",
    default: true,
    localService: true,
    voiceURI: "mock",
  };
  const synth = window.speechSynthesis;
  synth.getVoices = () => [fake];
  synth.speak = () => {};
  synth.cancel = () => {};
  window.SpeechSynthesisUtterance = function (t) {
    this.text = t;
  };
}

const FX_CSS = `
#fx{position:fixed;inset:0;pointer-events:none;z-index:2147483000;overflow:hidden;font-family:"Inter Display","Inter",system-ui,sans-serif}
:root{--tq:#0f766e;--mg:#be185d;--yl:#f5b800}
.tapdot{position:absolute;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;background:rgba(255,255,255,.6);border:3px solid rgba(18,32,30,.4);box-shadow:0 0 0 6px rgba(15,118,110,.28);animation:tapdot .6s ease-out forwards}
@keyframes tapdot{0%{transform:scale(.4);opacity:0}25%{opacity:1}100%{transform:scale(1.3);opacity:0}}
.pulse{position:absolute;border:4px solid var(--mg);border-radius:18px;box-shadow:0 0 0 5px rgba(190,24,93,.18);animation:pulse .7s ease-in-out infinite alternate}
@keyframes pulse{from{scale:1;opacity:.95}to{scale:1.03;opacity:.5}}
.dim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,20,18,0) 40%,rgba(8,20,18,.55) 100%);animation:fadein .25s both}
@keyframes fadein{from{opacity:0}to{opacity:1}}
.ov{position:absolute;left:18px;right:18px;color:#fff;font-weight:900;letter-spacing:-.02em;line-height:1.02;animation:ovin .32s cubic-bezier(.2,1.5,.4,1) both}
.ov.out,.dim.out{animation:ovout .2s ease-in both}
@keyframes ovin{from{translate:0 26px;scale:.82;opacity:0}to{translate:0 0;scale:1;opacity:1}}
@keyframes ovout{from{translate:0 0;scale:1;opacity:1}to{translate:0 10px;scale:.94;opacity:0}}
.o1{bottom:70px;transform:rotate(-2deg)}
.o1 .big{font-size:84px;background:linear-gradient(95deg,#fff 10%,#ffe27a 90%);-webkit-background-clip:text;color:transparent;filter:drop-shadow(0 6px 0 rgba(15,118,110,.9)) drop-shadow(0 14px 22px rgba(0,0,0,.35));display:block}
.o1 .sm{font-size:32px;margin-top:2px;text-shadow:0 3px 16px rgba(0,0,0,.45);display:block}
.o1 .sm b{background:var(--yl);color:#12201e;padding:0 10px;border-radius:10px;display:inline-block;transform:rotate(1.5deg);margin-left:6px}
.o2{bottom:150px;display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.pill{background:linear-gradient(100deg,var(--tq),#0b5f59);padding:16px 22px 18px;border-radius:22px;font-size:40px;box-shadow:0 12px 30px rgba(0,0,0,.35),0 0 0 3px rgba(255,255,255,.9) inset;transform:rotate(-1.5deg)}
.pill em{font-style:normal;color:#ffe27a}
.tag{font-size:20px;font-weight:800;background:#fff;color:var(--mg);padding:6px 12px;border-radius:999px;letter-spacing:0;box-shadow:0 6px 16px rgba(0,0,0,.25);transform:rotate(2deg);margin-left:14px}
.o3{bottom:210px;text-align:center;transform:rotate(-3deg)}
.o3 .q{display:inline-block;font-size:68px;color:#fff;background:linear-gradient(100deg,var(--mg),#e11d74);padding:14px 26px 18px;border-radius:26px;box-shadow:0 14px 34px rgba(0,0,0,.4);line-height:1.04;position:relative}
.o3 .q i{font-style:normal;color:#ffe27a}
.o3 .spark{position:absolute;right:-12px;top:-26px;font-size:46px;transform:rotate(14deg)}
.o4{bottom:118px;display:flex;flex-direction:column;gap:12px;align-items:flex-start;animation:none}
.chip{display:inline-flex;gap:10px;align-items:center;font-size:30px;background:rgba(255,255,255,.96);color:#12201e;padding:12px 20px;border-radius:999px;box-shadow:0 10px 26px rgba(0,0,0,.25);letter-spacing:-.01em;transform:rotate(-1deg);animation:ovin .32s cubic-bezier(.2,1.5,.4,1) both}
.chip .ic{width:34px;height:34px;border-radius:50%;background:var(--tq);color:#fff;display:grid;place-items:center;font-size:20px}
.chip:nth-child(2){transform:rotate(1deg);margin-left:20px}.chip:nth-child(3){margin-left:6px}
.phone{position:absolute;left:50%;top:250px;margin-left:-55px;width:110px;animation:ovin .35s cubic-bezier(.2,1.5,.4,1) both;filter:drop-shadow(0 10px 20px rgba(0,0,0,.3))}
`;

/** Läuft im Browser: legt die Effektebene #fx an und die Funktionen fxTap, fxPulse, fxOv, fxHtml. */
function fxInstall(css) {
  if (document.getElementById("fx")) return;
  const st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);
  const fx = document.createElement("div");
  fx.id = "fx";
  document.body.appendChild(fx);
  const kill = (el, ms, out) =>
    setTimeout(() => {
      if (out) {
        el.classList.add("out");
        setTimeout(() => el.remove(), 220);
      } else el.remove();
    }, ms);
  window.fxTap = (x, y) => {
    const d = document.createElement("div");
    d.className = "tapdot";
    d.style.left = x + "px";
    d.style.top = y + "px";
    fx.appendChild(d);
    kill(d, 700);
  };
  window.fxPulse = (sel, ms, pad = 6) => {
    const el = typeof sel === "string" ? document.querySelector(sel) : sel;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const d = document.createElement("div");
    d.className = "pulse";
    Object.assign(d.style, {
      left: r.left - pad + "px",
      top: r.top - pad + "px",
      width: r.width + 2 * pad + "px",
      height: r.height + 2 * pad + "px",
    });
    fx.appendChild(d);
    kill(d, ms);
  };
  window.fxOv = (cls, html, ms, dim) => {
    const els = [];
    if (dim) {
      const m = document.createElement("div");
      m.className = "dim";
      fx.appendChild(m);
      els.push(m);
    }
    const o = document.createElement("div");
    o.className = "ov " + cls;
    o.innerHTML = html;
    fx.appendChild(o);
    els.push(o);
    els.forEach((e) => kill(e, ms, true));
  };
  window.fxHtml = (html, ms) => {
    const w = document.createElement("div");
    w.innerHTML = html;
    const e = w.firstElementChild;
    fx.appendChild(e);
    kill(e, ms, true);
  };
}

module.exports = { SEED, makeCards, seedDb, speechMock, FX_CSS, fxInstall };
