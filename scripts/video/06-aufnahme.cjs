// Nimmt die App in Handy-Ansicht (412 x 732, 9:16) auf und führt dabei alle Aktionen nach dem Zeitplan aus.
// Voraussetzungen: App gebaut und gestartet (npm run build; npm run preview -- --port 4173),
// Ergebnis von 05-zeitplan.cjs vorhanden, Playwright mit Chromium (global oder NODE_PATH).
// Aufruf (aus dem Repo-Wurzelordner): NODE_PATH=$(npm root -g) node scripts/video/06-aufnahme.cjs
// Ergebnis: $VIDEO_WORK/build/frames/*.jpg und frames.json (Zeitstempel je Bild)
const { chromium } = require("playwright");
const fs = require("node:fs");
const C = require("./lib/effects.cjs");
const { work, BASE } = require("./lib/paths.cjs");

const TL = JSON.parse(fs.readFileSync(work("build", "timeline.json"), "utf8"));
const S = Object.fromEntries(TL.scenes.map((s) => [s.i, s]));
const A = TL.anchors;
const W = 412;
const H = 732; // 412 x 732 ergibt bei Skalierung 1080/412 genau 9:16
const FR = work("build", "frames");
fs.rmSync(FR, { recursive: true, force: true });
fs.mkdirSync(FR, { recursive: true });

(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1080 / W,
    locale: "de-DE",
  });
  await ctx.addInitScript(C.speechMock);
  const p = await ctx.newPage();
  await p.goto(BASE);
  await p.waitForTimeout(800);
  await C.seedDb(p, C.makeCards(Date.now()));

  // Bildaufnahme per Screencast; jedes Bild mit Zeitstempel (Sekunden seit 1970).
  const cdp = await ctx.newCDPSession(p);
  const frames = [];
  cdp.on("Page.screencastFrame", async (ev) => {
    const f = `${FR}/f${String(frames.length).padStart(6, "0")}.jpg`;
    fs.writeFileSync(f, Buffer.from(ev.data, "base64"));
    frames.push({ w: ev.metadata.timestamp, f });
    cdp
      .send("Page.screencastFrameAck", { sessionId: ev.sessionId })
      .catch(() => {});
  });
  await cdp.send("Page.startScreencast", {
    format: "jpeg",
    quality: 92,
    maxWidth: 1080,
    maxHeight: 1920,
    everyNthFrame: 2,
  });

  await p.reload({ waitUntil: "load" }); // die Begrüßungskarte erscheint, weil welcomeSeen nicht gesetzt ist
  const T0 = Date.now() / 1000;
  const wait = async (t) => {
    const ms = (T0 + t - Date.now() / 1000) * 1000;
    if (ms > 0) await p.waitForTimeout(ms);
  };
  await p.evaluate(C.fxInstall, C.FX_CSS);
  const log = (m) =>
    console.log((Date.now() / 1000 - T0).toFixed(2).padStart(6), m);

  const center = async (loc) => {
    const b = await loc.boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };
  /** Tipp: erst der Tipp-Punkt, 140 ms später der echte Klick. */
  const tap = async (loc) => {
    const c = await center(loc);
    await p.evaluate(([x, y]) => window.fxTap(x, y), [c.x, c.y]);
    await p.waitForTimeout(140);
    await p.mouse.click(c.x, c.y);
  };
  const pulseEl = (fn, ms) =>
    p.evaluate(
      ([src, ms]) => {
        const el = new Function("return (" + src + ")()")();
        if (el) window.fxPulse(el, ms);
      },
      [fn, ms],
    );
  const tab = (name) =>
    p
      .locator('nav[aria-label="Hauptnavigation"]')
      .getByText(name, { exact: true });
  const umdrehen = () =>
    p.getByRole("button", { name: "Umdrehen", exact: true });
  const gewusst = () => p.getByRole("button", { name: /^Gewusst/ });
  const rows = (i) =>
    `() => { const l=[...document.querySelectorAll('section[aria-label=Wortliste] li')].filter(e=>/→/.test(e.textContent)); return l[${i}]; }`;

  // ---------- Szene 1: Begrüßungskarte ----------
  const s1 = S[1];
  log("Szene 1");
  await wait(s1.A + 1.3);
  await tap(p.locator(".welcome-card"));
  await wait(s1.A + 4.0);
  await tap(p.locator(".welcome-card"));

  // ---------- Szene 2: Lernen-Seite, Thema wählen, Starten ----------
  const s2 = S[2];
  await wait(s2.S + 0.1);
  log("Szene 2");
  await p.evaluate(() =>
    window.fxOv(
      "o1",
      '<span class="big">800+</span><span class="sm">Wörter. <b>Mexiko &amp; Guatemala</b></span>',
      2800,
      true,
    ),
  );
  await wait(s2.S + 3.1);
  await tap(p.getByRole("button", { name: /^Thema:/ }));
  await wait(s2.S + 4.4);
  await tap(p.getByRole("radio", { name: /Transport/ }));
  await wait(s2.S + 6.3);
  await tap(p.getByRole("button", { name: "Starten" }));

  // ---------- Szene 3: Karte camión ----------
  const s3 = S[3];
  await wait(s3.S + 0.45);
  log("Szene 3");
  await tap(umdrehen());
  await wait(s3.A + A.s3_camion - 0.15);
  await tap(p.locator(".speak").first());
  await wait(s3.A + A.s3_mexiko - 0.2);
  await pulseEl(
    "() => [...document.querySelectorAll('.badge')].find(e => /Mexiko/.test(e.textContent))",
    3600,
  );

  // ---------- Szene 4: bewerten, zwei weitere Karten ----------
  const s4 = S[4];
  await wait(s4.S + 0.3);
  log("Szene 4");
  await pulseEl("() => document.querySelector('.grades')", 1600);
  await wait(s4.S + 2.1);
  await tap(gewusst());
  await wait(s4.S + 3.2);
  await tap(umdrehen());
  await wait(s4.S + 4.2);
  await tap(gewusst());
  await wait(s4.S + 5.2);
  await tap(umdrehen());
  await wait(s4.S + 6.2);
  await tap(gewusst());

  // ---------- Szene 5: Konjugation (volar) ----------
  const s5 = S[5];
  await wait(s5.S + 0.5);
  log("Szene 5");
  await tap(umdrehen());
  await wait(s5.S + 1.5);
  await tap(p.getByRole("button", { name: "Konjugation" }));
  await wait(s5.S + 2.8);
  await p.mouse.move(206, 450);
  await p.mouse.wheel(0, 260);
  await wait(s5.S + 3.8);
  await p.mouse.wheel(0, 260);

  // ---------- Szene 6: Formsuche ----------
  const s6 = S[6];
  await wait(s6.S + 0.2);
  log("Szene 6");
  await p.evaluate(() => {
    location.hash = "#/dictionary"; // harter Schnitt: in der Sitzung gibt es keine Tab-Leiste
  });
  await wait(s6.A + A.s6_tipp - 1.3);
  const box = p.locator("input[type=search]").first();
  await tap(box);
  await wait(s6.A + A.s6_tipp - 0.1);
  await box.pressSequentially("fue", { delay: 220 });
  await wait(s6.A + A.s6_sehr - 0.6);
  await p.evaluate(() => window.scrollTo({ top: 250, behavior: "smooth" }));
  await wait(s6.A + A.s6_sehr + 0.2);
  await pulseEl(rows(0), 2200);
  await pulseEl(rows(1), 2200);
  await wait(s6.A + A.s6_gebeugte - 0.1);
  await p.evaluate(() =>
    window.fxOv(
      "o2",
      '<div class="pill">Findet auch <em>gebeugte Formen</em></div><div class="tag">podemos → poder ✓</div>',
      3100,
    ),
  );
  await wait(s6.A + A.s6_und - 1.0);
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await p.waitForTimeout(500);
  await tap(p.getByRole("button", { name: "Suchtext löschen" }));
  await wait(s6.A + A.s6_podemos1 - 0.2);
  await box.pressSequentially("podemos", { delay: 120 });
  await wait(s6.A + A.s6_poder + 0.15);
  await tap(
    p
      .locator("section[aria-label=Wortliste] li")
      .filter({ hasText: "→" })
      .first(),
  );
  await wait(s6.A + A.s6_last - 0.12); // genau beim letzten "Podemos!"
  await p.evaluate(() =>
    window.fxOv(
      "o3",
      '<div class="q"><span class="spark">✨</span>„Ja, wir <i>können</i> das!“</div>',
      1600,
      true,
    ),
  );

  // ---------- Szene 7: Statistik ----------
  const s7 = S[7];
  await wait(s7.S + 0.3);
  log("Szene 7");
  await tap(tab("Statistik"));

  // ---------- Szene 8: Mehr, offline ----------
  const s8 = S[8];
  await wait(s8.S + 0.3);
  log("Szene 8");
  await tap(tab("Mehr"));
  await wait(s8.A + 0.3);
  await p.evaluate(() =>
    window.fxHtml(
      '<svg class="phone" viewBox="0 0 120 120"><rect x="34" y="6" width="52" height="96" rx="10" fill="#12201e"/><rect x="40" y="16" width="40" height="72" rx="4" fill="#d5f0ea"/><circle cx="60" cy="95" r="3" fill="#fff"/><g transform="translate(60 52) rotate(45)" fill="#0f766e"><path d="M0 -26 C3 -26 4 -22 4 -18 L4 -6 L22 6 L22 12 L4 8 L4 18 L10 22 L10 26 L0 24 L-10 26 L-10 22 L-4 18 L-4 8 L-22 12 L-22 6 L-4 -6 L-4 -18 C-4 -22 -3 -26 0 -26Z"/></g><line x1="30" y1="14" x2="92" y2="92" stroke="#be185d" stroke-width="6" stroke-linecap="round"/></svg>',
      1900,
    ),
  );
  await wait(s8.A + A.s8_offline - 0.1);
  await p.evaluate(() => {
    const box = document.createElement("div");
    box.className = "ov o4";
    document.getElementById("fx").appendChild(box);
    window.__chips = box;
    box.innerHTML = '<div class="chip"><span class="ic">✈</span>Offline</div>';
  });
  await wait(s8.A + A.s8_kein - 0.1);
  await p.evaluate(() => {
    window.__chips.insertAdjacentHTML(
      "beforeend",
      '<div class="chip"><span class="ic">✓</span>Ohne Konto</div>',
    );
  });
  await wait(s8.A + A.s8_tracking - 0.1);
  await p.evaluate(() => {
    window.__chips.insertAdjacentHTML(
      "beforeend",
      '<div class="chip"><span class="ic">✓</span>Ohne Tracking</div>',
    );
  });
  await wait(s8.A + 4.4);
  await p.evaluate(() => {
    const b = window.__chips;
    b.classList.add("out");
    setTimeout(() => b.remove(), 250);
  });

  // ---------- Szene 9: Abspann (Markenkopf der Seite "Mehr", vergrößert) ----------
  const s9 = S[9];
  await wait(s9.S);
  log("Szene 9");
  await p.evaluate(() => {
    const st = document.createElement("style");
    st.textContent = `
      .link-list,.reset-progress,.app-version,.credit,.tabbar{transition:opacity .45s;opacity:0!important}
      header.brand{transition:transform .8s cubic-bezier(.2,.8,.2,1);transform:translateY(235px) scale(1.3)}`;
    document.head.appendChild(st);
  });
  await wait(TL.total);
  await cdp.send("Page.stopScreencast");
  fs.writeFileSync(
    work("build", "frames.json"),
    JSON.stringify({ T0, tEnd: Date.now() / 1000, frames }),
  );
  console.log("Bilder:", frames.length);
  await br.close();
})().catch((e) => {
  console.error(String(e.stack).split("\n").slice(0, 6).join("\n"));
  process.exit(1);
});
