import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * End-to-end smoke test in a real (headless) Edge/Chrome, driven via the DevTools protocol.
 * Needs a running build: `npm run build && npx vite preview --port 4173`.
 * Usage: npx tsx scripts/browser-smoke.ts [baseUrl]
 */
const BASE = process.argv[2] ?? "http://localhost:4173/";
const PORT = 9333;
/** SMOKE_BROWSER overrides the lookup; otherwise Edge/Chrome on Windows, Chromium/Chrome on Linux. */
const BROWSER = [
  process.env.SMOKE_BROWSER ?? "",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/opt/pw-browsers/chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].find((p) => p && existsSync(p));

if (!BROWSER) throw new Error("Kein Edge/Chrome gefunden");

/** Gesamtzahl der Vokabeln laut `public/vocab`, damit der Test nicht bei jeder neuen Vokabel bricht. */
const TOTAL_VOCAB = (() => {
  const dir = fileURLToPath(new URL("../public/vocab/", import.meta.url));
  const index = JSON.parse(readFileSync(join(dir, "index.json"), "utf8")) as {
    topics: { file: string }[];
  };
  return index.topics.reduce(
    (sum, t) =>
      sum +
      (JSON.parse(readFileSync(join(dir, t.file), "utf8")) as unknown[]).length,
    0,
  );
})();

const results: { name: string; ok: boolean; info: string }[] = [];
function check(name: string, ok: boolean, info = "") {
  results.push({ name, ok, info });
  console.log(
    `${ok ? "OK  " : "FAIL"} ${name}${info ? "  (" + info + ")" : ""}`,
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const profile = mkdtempSync(join(tmpdir(), "palabrita-smoke-"));
const proc = spawn(
  BROWSER,
  [
    "--headless=new",
    "--disable-gpu",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    ...(process.platform === "linux" ? ["--no-sandbox"] : []),
    "about:blank",
  ],
  { stdio: "ignore" },
);

async function connect(): Promise<WebSocket> {
  for (let i = 0; i < 50; i++) {
    try {
      const list = (await (
        await fetch(`http://127.0.0.1:${PORT}/json`)
      ).json()) as { type: string; webSocketDebuggerUrl: string }[];
      const page = list.find((t) => t.type === "page");
      if (page) {
        const ws = new WebSocket(page.webSocketDebuggerUrl);
        await new Promise((res, rej) => {
          ws.onopen = () => res(null);
          ws.onerror = () => rej(new Error("ws"));
        });
        return ws;
      }
    } catch {
      /* browser not ready yet */
    }
    await sleep(300);
  }
  throw new Error("Browser nicht erreichbar");
}

let ws: WebSocket | undefined;
let id = 0;
const pending = new Map<number, (v: CdpReply) => void>();

/** Shape of the DevTools replies we read. */
interface CdpReply {
  result?: {
    result?: { value?: unknown };
    exceptionDetails?: { exception?: { description?: string } };
  };
}

function send(method: string, params: object = {}): Promise<CdpReply> {
  const myId = ++id;
  return new Promise((resolve) => {
    pending.set(myId, resolve);
    ws?.send(JSON.stringify({ id: myId, method, params }));
  });
}

async function evaluate<T = unknown>(expr: string): Promise<T> {
  const r = await send("Runtime.evaluate", {
    expression: expr,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.result?.exceptionDetails)
    throw new Error(
      JSON.stringify(r.result.exceptionDetails.exception?.description),
    );
  return r.result?.result?.value as T;
}

async function waitFor(expr: string, label: string, timeout = 10000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try {
      if (await evaluate<boolean>(`Boolean(${expr})`)) return true;
    } catch {
      /* page navigating */
    }
    await sleep(150);
  }
  console.log("  Timeout beim Warten auf:", label);
  return false;
}

const text = () => evaluate<string>("document.body.innerText");

const clickText = (label: string, tag = "button, a") =>
  evaluate<boolean>(`(() => {
    const el = [...document.querySelectorAll(${JSON.stringify(tag)})]
      .find((e) => e.textContent.trim().startsWith(${JSON.stringify(label)}));
    if (!el) return false;
    el.click();
    return true;
  })()`);

const setInput = (selector: string, value: string) =>
  evaluate<boolean>(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
    return true;
  })()`);

/** Reveals the current card if needed and rates it. */
async function rate(label: "Nochmal" | "Gewusst") {
  await evaluate(`(() => {
    if (!document.querySelector(".grade-good")) {
      [...document.querySelectorAll("button")]
        .find((b) => b.textContent.trim() === "Umdrehen")?.click();
    }
  })()`);
  await waitFor(`document.querySelector(".grade-good")`, "Bewertung");
  await clickText(label, "button");
  await sleep(250);
}

const frontWord = () =>
  evaluate<string>(
    `document.querySelector(".flashcard .word")?.textContent ?? ""`,
  );

async function startSession(setup?: () => Promise<void>) {
  await send("Page.navigate", { url: BASE });
  await waitFor(
    `[...document.querySelectorAll("button")].some(b => b.textContent.trim() === "Starten")`,
    "Starten",
  );
  await setup?.();
  await clickText("Starten", "button");
  await waitFor(`document.querySelector(".flashcard")`, "Karte");
}

/** Raw IndexedDB access for test setup (the app itself stays untouched). */
const idb = (body: string) =>
  evaluate<unknown>(`new Promise((resolve, reject) => {
    const open = indexedDB.open("palabrita");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction("cards", "readwrite");
      const store = tx.objectStore("cards");
      let out;
      ${body}
      tx.oncomplete = () => { db.close(); resolve(out); };
      tx.onerror = () => reject(tx.error);
    };
  })`);

async function main() {
  ws = await connect();
  ws.onmessage = (m) => {
    const msg = JSON.parse(String(m.data)) as CdpReply & { id?: number };
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)!(msg);
      pending.delete(msg.id);
    }
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  // Clock offset: Date.now() is shifted by window.__timeOffset (ms), set from the test.
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `window.__timeOffset = 0;
      const realNow = Date.now.bind(Date);
      Date.now = () => realNow() + window.__timeOffset;`,
  });

  // 1. The Lernen screen (start page) loads vocabulary and settings.
  await send("Page.navigate", { url: BASE });
  check(
    "Lernen-Seite lädt",
    await waitFor(
      `document.querySelector("h1")?.textContent === "Lernen"`,
      "h1",
    ),
  );
  const home = await text();
  check(
    "Lernen-Seite ohne Zähler und Serie",
    !/Fällig|Neu verfügbar|Serie/.test(home),
  );

  // 1b. Erststart-Begrüßung: erscheint einmal, zwei Tipps schließen sie und merken es sich.
  check(
    "Begrüßung erscheint beim ersten Start",
    await waitFor(`!!document.querySelector(".welcome-card")`, "Begrüßung"),
  );
  await evaluate(`document.querySelector(".welcome-card").click()`);
  await evaluate(`document.querySelector(".welcome-card").click()`);
  check(
    "Begrüßung schließt nach zwei Tipps und wird gemerkt",
    await waitFor(
      `!document.querySelector(".welcome-backdrop") && localStorage.getItem("palabrita.welcomeSeen") === "1"`,
      "Begrüßung geschlossen",
    ),
  );

  // 2. Dictionary shows all words.
  await send("Page.navigate", { url: `${BASE}#/dictionary` });
  const dictOk = await waitFor(
    `/${TOTAL_VOCAB} Einträge/.test(document.body.innerText)`,
    `${TOTAL_VOCAB} Einträge`,
  );
  check(`Verzeichnis zeigt ${TOTAL_VOCAB} Einträge`, dictOk);

  // 3. Dictionary search finds a word via its German translation.
  await setInput('input[type="search"]', "Bohne");
  await sleep(300);
  check(
    "Suche über deutsche Übersetzung findet frijol",
    /el frijol/.test(await text()),
  );

  // 4. Study session: setup, flip twice, grade 3 cards.
  await startSession();
  check("Sitzung startet mit Karte", true);

  // 4a. Flip twice: the front appears again, the rating buttons stay visible.
  const front = await frontWord();
  await evaluate(`document.querySelector(".flashcard").click()`);
  await waitFor(`document.querySelector(".flashcard.flipped")`, "Rückseite");
  const back = await frontWord();
  const hintBack = await evaluate<boolean>(
    `/Tippen zum Umdrehen/.test(document.querySelector(".flashcard").innerText)`,
  );
  await evaluate(`document.querySelector(".flashcard").click()`);
  await waitFor(`!document.querySelector(".flashcard.flipped")`, "Vorderseite");
  const frontAgain = await frontWord();
  check(
    "Karte zweimal umdrehen: Vorderseite erscheint wieder, Buttons bleiben",
    front !== "" &&
      back !== front &&
      frontAgain === front &&
      hintBack &&
      (await evaluate<boolean>(
        `!!document.querySelector(".grade-good") && !!document.querySelector(".grade-again")`,
      )),
    `${front} / ${back}`,
  );

  for (let i = 0; i < 3; i++) await rate("Gewusst");
  const progress = await evaluate<string>(
    `document.querySelector(".progress")?.textContent ?? ""`,
  );
  check(
    "Nach 3 Bewertungen steht „Geübt: 3“",
    /Geübt: 3/.test(progress),
    progress,
  );

  // 5. Progress survives a reload.
  await send("Page.navigate", { url: BASE });
  await evaluate("location.reload()");
  await waitFor(
    `[...document.querySelectorAll("button")].some(b => b.textContent.trim() === "Starten")`,
    "Starten nach Neuladen",
  );

  // 6. Settings: dark theme is applied.
  await send("Page.navigate", { url: `${BASE}#/settings` });
  await waitFor(`document.querySelector(".setting select")`, "Einstellungen");
  await evaluate(
    `(() => { const s=[...document.querySelectorAll("select")].find(x=>[...x.options].some(o=>o.value==="dark")); return !!s; })()`,
  );
  await setInput(`select:has(option[value="dark"])`, "dark");
  await sleep(300);
  check(
    "Theme dunkel wird angewendet",
    (await evaluate<string>("document.documentElement.dataset.theme ?? ''")) ===
      "dark",
  );
  await setInput(`select:has(option[value="dark"])`, "system");

  // 7. Stats screen.
  await send("Page.navigate", { url: `${BASE}#/stats` });
  check(
    "Statistik zeigt Reifegrade",
    await waitFor(`/Lernend/.test(document.body.innerText)`, "Statistik"),
  );
  const statsText = await text();
  check(
    "Statistik: 3 Karten lernend",
    /Lernend\s*\n?\s*3/.test(statsText) ||
      /Lernend[\s\S]{0,6}3/.test(statsText),
  );

  // 8. Add a word by hand (works without network), then keep it after reload.
  await send("Page.navigate", { url: `${BASE}#/add` });
  await waitFor(
    `document.querySelector('input[aria-label="Spanisches Wort"]')`,
    "Add",
  );
  await setInput('input[aria-label="Spanisches Wort"]', "la quesadilla");
  await clickText("selbst eintragen", "button");
  await waitFor(
    `document.querySelector('input[aria-label="Deutsch 1"]')`,
    "Formular",
  );
  await setInput('input[aria-label="Deutsch 1"]', "Quesadilla");
  await clickText("Zur Vokabelliste hinzufügen", "button");
  const added = await waitFor(
    `location.hash.startsWith("#/dictionary/u")`,
    "Detailseite eigenes Wort",
  );
  check(
    "Eigenes Wort wird angelegt (ID u…)",
    added,
    await evaluate<string>("location.hash"),
  );
  await evaluate("location.reload()");
  await waitFor(`document.querySelector("h1")`, "h1");
  await sleep(500);
  check("Eigenes Wort bleibt nach Neuladen", /quesadilla/.test(await text()));

  // 8b. Legend explains the verb notation.
  await send("Page.navigate", { url: `${BASE}#/legend` });
  await waitFor(
    `/Was bedeutet/.test(document.body.innerText) || document.querySelector("dt")`,
    "Legende",
  );
  const legend = await text();
  check(
    "Legende erklärt (e → ie), (o → ue), (e → i), (-go), (-zco)",
    ["(e → ie)", "(o → ue)", "(e → i)", "(-go)", "(-zco)"].every((n) =>
      legend.includes(n),
    ),
  );

  // 8c. Several German words on one entry are all shown.
  await send("Page.navigate", { url: `${BASE}#/dictionary` });
  await waitFor(`document.querySelector('input[type="search"]')`, "Suche");
  await setInput('input[type="search"]', "carro");
  await sleep(300);
  check(
    "Mehrere deutsche Wörter werden alle gezeigt",
    /Auto\s*·\s*Wagen/.test(await text()),
    (await text()).match(/el carro[^\n]*/)?.[0],
  );

  // 8d. Verb detail: notation and conjugation table.
  await setInput('input[type="search"]', "poder");
  await sleep(300);
  await clickText("poder", "a");
  await waitFor(`document.querySelector(".verb")`, "Verbtabelle");
  const verb = await text();
  check("Verb: Notation poder (ue)", /poder \(o → ue/.test(verb));
  check(
    "Verb: Formen puedo, pude, podré",
    ["puedo", "pude", "podré"].every((f) => verb.includes(f)),
  );

  // 8e. Settings are kept after a reload. The direction is chosen on the Lernen tab only.
  await send("Page.navigate", { url: `${BASE}#/settings` });
  await waitFor(`document.querySelector(".setting select")`, "Einstellungen");
  check(
    "Einstellungen: keine Richtungs-Auswahl mehr",
    !(await evaluate<boolean>(
      `!!document.querySelector('select:has(option[value="es-de"])')`,
    )) && !/Richtung/.test(await text()),
  );
  check(
    "Einstellungen: kein „Automatisch vorlesen“ mehr",
    !/Automatisch vorlesen/.test(await text()),
  );
  await setInput(`select:has(option[value="A1"])`, "A1");
  await sleep(400);
  await evaluate("location.reload()");
  await waitFor(
    `document.querySelector('select:has(option[value="A1"])')`,
    "Einstellungen nach Reload",
  );
  await sleep(400);
  const kept = await evaluate<string>(
    `document.querySelector('select:has(option[value="A1"])').value`,
  );
  check("Einstellungen bleiben nach Neuladen", kept === "A1", kept);
  check(
    "Einstellungen: kein Feld „Neue pro Tag“",
    !/Neue (Karten )?pro Tag/.test(await text()) &&
      !(await evaluate<boolean>(
        `!!document.querySelector('input[type="number"]')`,
      )),
  );
  await send("Page.navigate", { url: `${BASE}#/dictionary` });
  await waitFor(`/Einträge/.test(document.body.innerText)`, "Verzeichnis A1");
  const a1 = await evaluate<string>(
    `document.body.innerText.match(/(\\d+) Einträge/)?.[1] ?? ""`,
  );
  check(
    `Niveau A1 blendet höhere Niveaus aus (weniger als ${TOTAL_VOCAB})`,
    Number(a1) > 0 && Number(a1) < TOTAL_VOCAB,
    `${a1} Einträge`,
  );
  await send("Page.navigate", { url: `${BASE}#/settings` });
  await waitFor(`document.querySelector(".setting select")`, "Einstellungen");
  await setInput(`select:has(option[value="A1"])`, "B1");
  await sleep(400);

  // 8e2. Lernen tab: the direction is chosen here and remembered.
  await send("Page.navigate", { url: BASE });
  await waitFor(
    `document.querySelector('select:has(option[value="es-de"])')`,
    "Richtung im Lernen-Tab",
  );
  check(
    "Lernen: Richtung wählbar (3 Optionen)",
    (await evaluate<number>(
      `document.querySelector('select:has(option[value="es-de"])').options.length`,
    )) === 3,
  );
  await setInput(`select:has(option[value="es-de"])`, "es-de");
  await sleep(400);
  await evaluate("location.reload()");
  await waitFor(
    `document.querySelector('select:has(option[value="es-de"])')`,
    "Lernen nach Reload",
  );
  await sleep(400);
  check(
    "Lernen: Richtung bleibt nach Neuladen",
    (await evaluate<string>(
      `document.querySelector('select:has(option[value="es-de"])').value`,
    )) === "es-de",
  );
  await setInput(`select:has(option[value="es-de"])`, "both");
  await sleep(400);
  const topicsOrder = await evaluate<string[]>(
    `[...document.querySelectorAll(".settings-form select")[0].options].map((o) => o.textContent)`,
  );
  check(
    "Lernen: Grundwortschatz steht direkt nach „Alle Themen“",
    topicsOrder[0] === "Alle Themen" && /^Grundwortschatz/.test(topicsOrder[1]),
    topicsOrder.slice(0, 3).join(" | "),
  );
  await send("Page.navigate", { url: `${BASE}#/` });
  await waitFor(`document.querySelector(".settings-form")`, "Lernen");
  await setInput(`.settings-form select:has(option[value="es-de"])`, "both");

  // 8e3. Dictionary: sections, topic order, filters and scroll survive a detail visit
  // and are reset when switching tabs.
  await send("Page.navigate", { url: `${BASE}#/dictionary` });
  await waitFor(`/Einträge/.test(document.body.innerText)`, "Verzeichnis");
  const sections = await evaluate<string[]>(
    `[...document.querySelectorAll(".dict-section h2")].map((h) => h.textContent)`,
  );
  check(
    "Verzeichnis: nur ein Abschnitt „Wörter“ (Suche oben)",
    sections.join("|") === "Wörter",
    sections.join("|"),
  );
  check(
    "Verzeichnis: „Neues Wort hinzufügen“ steht am Ende der Liste",
    await evaluate<boolean>(`(() => {
      const btn = document.querySelector(".dict-add");
      return !!btn && btn.textContent === "Neues Wort hinzufügen"
        && btn.closest(".dict-section").lastElementChild === btn;
    })()`),
  );
  const dictTopics = await evaluate<string[]>(
    `[...document.querySelector('select[aria-label="Thema"]').options].map((o) => o.textContent)`,
  );
  check(
    "Verzeichnis: Grundwortschatz steht direkt nach „Alle Themen“",
    dictTopics[0] === "Alle Themen" && /^Grundwortschatz/.test(dictTopics[1]),
    dictTopics.slice(0, 3).join(" | "),
  );
  check(
    "Dropdowns haben eigenen Pfeil mit Abstand (appearance none, padding)",
    await evaluate<boolean>(`(() => {
      const s = getComputedStyle(document.querySelector("select.field"));
      return s.appearance === "none" && parseFloat(s.paddingRight) >= 40
        && s.backgroundImage.startsWith("url(");
    })()`),
  );
  await setInput('select[aria-label="Niveau"]', "A1");
  await setInput('input[type="search"]', "a");
  await sleep(300);
  await evaluate("window.scrollTo(0, 1500)");
  await sleep(300);
  const clicked = await evaluate<string>(`(() => {
    const a = [...document.querySelectorAll(".vocab-list a")]
      .find((e) => e.getBoundingClientRect().top > 100);
    const es = a.querySelector(".es").textContent;
    a.click();
    return es;
  })()`);
  await waitFor(`location.hash.startsWith("#/dictionary/")`, "Detailseite");
  await send("Runtime.evaluate", { expression: "history.back()" });
  await waitFor(`document.querySelector(".vocab-list")`, "Zurück zur Liste");
  await sleep(400);
  const backJson = await evaluate<string>(`JSON.stringify({
    q: document.querySelector('input[type="search"]').value,
    level: document.querySelector('select[aria-label="Niveau"]').value,
    y: Math.round(window.scrollY),
  })`);
  const backState = JSON.parse(backJson) as {
    q: string;
    level: string;
    y: number;
  };
  check(
    "Verzeichnis: Suche und Filter bleiben nach Detailansicht und Zurück",
    backState.q === "a" && backState.level === "A1",
    backJson,
  );
  check(
    "Verzeichnis: Scrollposition bleibt nach Detailansicht und Zurück",
    Math.abs(backState.y - 1500) < 5,
    `${backState.y} (angeklickt: ${clicked})`,
  );

  // Leaving a detail page by the tab „Verzeichnis“ or the „← Verzeichnis“ link works like
  // the back button: the list keeps its scroll position, search and filters. The race
  // behind a reset to 0 hits most visits, so each path is repeated to make a miss unlikely.
  const leaveDetail: [string, () => Promise<boolean>][] = [
    ["Tab", () => clickText("Verzeichnis", ".tabbar a")],
    ["← Verzeichnis", () => clickText("← Verzeichnis", ".screen a.back")],
  ];
  for (const [label, leave] of leaveDetail) {
    const rounds: string[] = [];
    for (let round = 0; round < 5; round++) {
      await evaluate("window.scrollTo(0, 1500)");
      await sleep(300);
      await evaluate(`(() => {
        const a = [...document.querySelectorAll(".vocab-list a")]
          .find((e) => e.getBoundingClientRect().top > 100);
        a.click();
      })()`);
      await waitFor(`location.hash.startsWith("#/dictionary/")`, "Detailseite");
      await sleep(300);
      await leave();
      await waitFor(
        `location.hash === "#/dictionary" && document.querySelector(".vocab-list")`,
        "Verzeichnis nach Detailansicht",
      );
      await sleep(400);
      rounds.push(
        await evaluate<string>(`JSON.stringify({
          q: document.querySelector('input[type="search"]').value,
          level: document.querySelector('select[aria-label="Niveau"]').value,
          y: Math.round(window.scrollY),
        })`),
      );
    }
    const ok = rounds.every((r) => {
      const s = JSON.parse(r) as { q: string; level: string; y: number };
      return Math.abs(s.y - 1500) < 5 && s.q === "a" && s.level === "A1";
    });
    check(
      `Verzeichnis: ${label} aus der Detailansicht startet an gleicher Stelle wie Zurück`,
      ok,
      rounds.join(" | "),
    );
  }

  await send("Page.navigate", { url: `${BASE}#/stats` });
  await waitFor(`/Statistik/.test(document.body.innerText)`, "Statistik");
  await clickText("Verzeichnis", "a");
  await waitFor(`document.querySelector(".vocab-list")`, "Verzeichnis neu");
  await sleep(300);
  const reset = await evaluate<string>(`JSON.stringify({
    q: document.querySelector('input[type="search"]').value,
    level: document.querySelector('select[aria-label="Niveau"]').value,
    y: Math.round(window.scrollY),
  })`);
  check(
    "Verzeichnis: Tabwechsel setzt Suche, Filter und Scrollposition zurück",
    reset === '{"q":"","level":"","y":0}',
    reset,
  );
  check(
    "Dunkelmodus: grauer Hintergrund statt fast Schwarz",
    await evaluate<boolean>(`(() => {
      const root = document.documentElement;
      const before = root.dataset.theme;
      root.dataset.theme = "dark";
      const [r, g, b] = getComputedStyle(document.body).backgroundColor
        .match(/\\d+/g).map(Number);
      if (before === undefined) delete root.dataset.theme; else root.dataset.theme = before;
      return Math.max(r, g, b) > 30;
    })()`),
  );

  // 8e4. Tiles: the German text gets the full tile width, not a narrow column
  // (regression: spanish and german side by side broke the german into 2-3 characters per line).
  await setInput('input[type="search"]', "construy");
  await sleep(300);
  const tile = await evaluate<string>(`(() => {
    const a = document.querySelector(".vocab-list a");
    if (!a) return "";
    const w = (el) => el.getBoundingClientRect().width;
    return JSON.stringify({
      tile: Math.round(w(a)),
      de: Math.round(w(a.querySelector(".de"))),
      es: a.querySelector(".es").textContent,
    });
  })()`);
  const tileInfo = tile
    ? (JSON.parse(tile) as { tile: number; de: number; es: string })
    : null;
  check(
    "Verzeichnis: deutsche Übersetzung nimmt volle Kachelbreite ein",
    !!tileInfo && tileInfo.de >= tileInfo.tile * 0.8,
    tile || "keine Kachel",
  );

  // 8e5. A detail page opened from the bottom of a long list starts at the top.
  // (Regression: the window kept the list's scroll position, so a long verb opened at its end.)
  await setInput('input[type="search"]', "");
  await setInput('select[aria-label="Wortart"]', "verb");
  await sleep(300);
  await evaluate("window.scrollTo(0, document.documentElement.scrollHeight)");
  await sleep(300);
  const listY = Math.round(await evaluate<number>("window.scrollY"));
  await evaluate(`(() => {
    const links = document.querySelectorAll(".vocab-list a");
    links[links.length - 1].click();
  })()`);
  await waitFor(
    `location.hash.startsWith("#/dictionary/")`,
    "Verb-Detailseite",
  );
  await sleep(400);
  const detail = JSON.parse(
    await evaluate<string>(`JSON.stringify({
      y: Math.round(window.scrollY),
      scrollable: document.documentElement.scrollHeight - window.innerHeight,
    })`),
  ) as { y: number; scrollable: number };
  check(
    "Detailansicht startet oben, auch wenn die Liste unten angeklickt wurde",
    listY > 0 && detail.scrollable > 200 && detail.y === 0,
    `Liste y=${listY}, Detail y=${detail.y}, scrollbar ${detail.scrollable}px`,
  );
  await setInput('select[aria-label="Wortart"]', "");
  await send("Page.navigate", { url: `${BASE}#/dictionary` });
  await waitFor(`document.querySelector(".vocab-list")`, "Verzeichnis");

  // 8e4. Version steht unter „Mehr“ (nach Einstellungen und Legende), nicht mehr unter Einstellungen.
  await send("Page.navigate", { url: `${BASE}#/more` });
  await waitFor(`document.querySelector(".link-list")`, "Mehr");
  check(
    "Mehr: Version steht unter Einstellungen und Legende",
    await evaluate<boolean>(`(() => {
      const list = document.querySelector(".link-list");
      const v = document.querySelector(".app-version");
      return !!v && /^Version: /.test(v.textContent)
        && !!(list.compareDocumentPosition(v) & Node.DOCUMENT_POSITION_FOLLOWING)
        && [...list.querySelectorAll("a")].map((a) => a.textContent).join("|") === "Einstellungen|Legende";
    })()`),
  );
  await send("Page.navigate", { url: `${BASE}#/settings` });
  await waitFor(`document.querySelector(".setting select")`, "Einstellungen");
  check(
    "Einstellungen: keine Versionszeile mehr",
    !(await evaluate<boolean>(`!!document.querySelector(".app-version")`)),
  );

  // 8e5. „Neues Wort hinzufügen“ am Ende der Liste übernimmt den Suchtext.
  await send("Page.navigate", { url: `${BASE}#/dictionary` });
  await waitFor(`document.querySelector(".vocab-list")`, "Verzeichnis");
  await setInput('input[type="search"]', "gato");
  await sleep(300);
  check(
    "Verzeichnis: Button „Neues Wort hinzufügen“ ist letztes Element der Liste",
    await evaluate<boolean>(`(() => {
      const btn = document.querySelector(".dict-add");
      return !!btn && btn.textContent === "Neues Wort hinzufügen"
        && btn.closest(".dict-section").lastElementChild === btn;
    })()`),
  );
  await evaluate(`document.querySelector(".dict-add").click()`);
  await waitFor(
    `location.hash === "#/add?q=gato"`,
    "Hinzufügen-Seite mit Suchtext",
  );
  check(
    "Verzeichnis: Button übernimmt Suchtext ins Feld",
    await evaluate<boolean>(
      `document.querySelector('input[aria-label="Spanisches Wort"]').value === "gato"`,
    ),
  );
  // Suchtext wieder leeren, sonst zählt der Offline-Test nur die Treffer.
  await send("Page.navigate", { url: `${BASE}#/dictionary` });
  await waitFor(`document.querySelector('input[type="search"]')`, "Suche");
  await setInput('input[type="search"]', "");
  await sleep(300);

  // 8f. Real lookup on de.wiktionary.org (needs network).
  await send("Page.navigate", { url: `${BASE}#/add` });
  await waitFor(
    `document.querySelector('input[aria-label="Spanisches Wort"]')`,
    "Add",
  );
  await setInput('input[aria-label="Spanisches Wort"]', "casa");
  await clickText("Nachschlagen", "button");
  const found = await waitFor(
    `document.querySelector('input[value="la casa"]')`,
    "Treffer casa",
    15000,
  );
  check("Wortsuche findet casa (Formular mit „la casa“)", found);
  await setInput('input[aria-label="Spanisches Wort"]', "puedo");
  await clickText("Nachschlagen", "button");
  const base = await waitFor(
    `/poder nachschlagen/.test(document.body.innerText)`,
    "Grundform poder",
    15000,
  );
  check("Wortsuche bietet für puedo die Grundform poder an", base);

  // 8g. Speech button on the detail page (voice availability depends on the machine).
  await send("Page.navigate", { url: `${BASE}#/dictionary` });
  await waitFor(`document.querySelector('input[type="search"]')`, "Suche");
  await setInput('input[type="search"]', "hablar");
  await sleep(300);
  await clickText("hablar", "a");
  await waitFor(`document.querySelector(".verb")`, "Detail hablar");
  check(
    "Aussprache-Button ist vorhanden",
    await evaluate<boolean>(
      `!!document.querySelector('button[aria-label*="Aussprache"], button[aria-label*="anhören"], .speak')`,
    ),
  );

  // 8h. Verb overlay (check 2): "Konjugation" only after revealing, Escape closes,
  // the session stays on the same card.
  await startSession(async () => {
    await setInput(`select:has(option[value="verb"])`, "verb");
  });
  const verbCard = await frontWord();
  const conjBefore = await evaluate<boolean>(
    `[...document.querySelectorAll("button")].some(b => b.textContent.trim() === "Konjugation")`,
  );
  await clickText("Umdrehen", "button");
  await waitFor(
    `[...document.querySelectorAll("button")].some(b => b.textContent.trim() === "Konjugation")`,
    "Konjugation-Button",
  );
  await clickText("Konjugation", "button");
  const dialogOpen = await waitFor(
    `document.querySelector('[role="dialog"][aria-modal="true"] .verb')`,
    "Overlay mit Tabelle",
  );
  const frontBeforeEscape = await frontWord();
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });
  const dialogClosed = await waitFor(
    `!document.querySelector('[role="dialog"]')`,
    "Overlay geschlossen",
  );
  const hashNow = await evaluate<string>("location.hash");
  const frontNow = await frontWord();
  check(
    "Verb: „Konjugation“ erst nach dem Aufdecken, Overlay zeigt Tabelle, Escape schließt, gleiche Karte",
    !conjBefore &&
      dialogOpen &&
      dialogClosed &&
      frontBeforeEscape !== "" &&
      frontNow === frontBeforeEscape &&
      /^(#\/?)?$/.test(hashNow),
    JSON.stringify({
      conjBefore,
      dialogOpen,
      dialogClosed,
      verbCard,
      frontBeforeEscape,
      frontNow,
      hashNow,
    }),
  );

  // 8i. Wait for the first-card check on a clean database, then the 5-minute rule (check 4).
  // Start: one card in the review phase (not due), so "Nochmal" is not shown again at once (stage 4).
  await send("Page.navigate", { url: `${BASE}#/` });
  await idb(`store.clear(); store.put({
    vocabId: "v0001", dir: "de-es", due: Date.now() + 10 * 86400000,
    interval: 10, ease: 2.5, reps: 3, lapses: 0,
    lastReviewed: Date.now() - 86400000, state: "learning",
  });`);
  await evaluate("window.__timeOffset = 0");
  await startSession();
  const cardA = await frontWord();
  await rate("Nochmal");
  const cardB = await frontWord();
  await evaluate("window.__timeOffset = 6 * 60 * 1000");
  await rate("Gewusst"); // B
  const cardC = await frontWord();
  check(
    "Nochmal: Karte kommt nach 5 Min (Zeitsprung) wieder, vor neuen Karten",
    cardA !== "" && cardB !== cardA && cardC === cardA,
    `A=${cardA} B=${cardB} C=${cardC}`,
  );
  await evaluate("window.__timeOffset = 0");

  // 8j. "Beenden" shows the summary, reloading keeps the progress (check 5).
  const cardsBefore = Number(
    await idb(`store.count().onsuccess = (e) => { out = e.target.result; };`),
  );
  await clickText("Beenden", "button");
  const summaryOk = await waitFor(
    `/Sitzung beendet/.test(document.body.innerText)`,
    "Zusammenfassung",
  );
  const summary = await text();
  await evaluate("location.reload()");
  await sleep(1000);
  const cardsAfter = Number(
    await idb(`store.count().onsuccess = (e) => { out = e.target.result; };`),
  );
  check(
    "Beenden: Zusammenfassung, Neuladen behält den Fortschritt",
    summaryOk &&
      /2 Karten geübt/.test(summary) &&
      /Weiterlernen/.test(summary) &&
      cardsBefore >= 3 &&
      cardsAfter === cardsBefore,
    `${cardsBefore} -> ${cardsAfter} Karten`,
  );

  // 8k. Endless session (SPEC 3.1, 12.1): more than MAX_LEARNING (15) new cards in a row,
  // never "Fertig für heute", no waiting counter.
  await startSession();
  const RATED = 20;
  for (let i = 0; i < RATED; i++) await rate("Gewusst");
  const endless = await text();
  check(
    `Endlose Sitzung: ${RATED} Bewertungen ohne „Fertig für heute“ und ohne Wartezähler`,
    !/Fertig für heute/.test(endless) &&
      !/Jetzt zeigen|Warte/.test(endless) &&
      new RegExp(`Geübt: ${RATED}`).test(endless) &&
      (await evaluate<boolean>(`!!document.querySelector(".flashcard")`)),
  );

  // 9. Service worker active, then offline reload still works.
  const swReady = await waitFor(
    `navigator.serviceWorker.getRegistration().then(r => !!(r && r.active))`,
    "Service Worker",
    15000,
  );
  check("Service Worker ist aktiv", swReady);
  await evaluate("location.reload()");
  await sleep(1500);
  const controlled = await evaluate<boolean>(
    "!!navigator.serviceWorker.controller",
  );
  check("Seite wird vom Service Worker kontrolliert", controlled);
  await send("Network.emulateNetworkConditions", {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
  });
  await send("Page.navigate", { url: `${BASE}#/dictionary` });
  await evaluate("location.reload()").catch(() => undefined);
  const offlineOk = await waitFor(
    `/Einträge/.test(document.body.innerText)`,
    "Verzeichnis offline",
    15000,
  );
  check("Offline: App lädt und zeigt das Verzeichnis", offlineOk);
  check(
    `Offline: ${TOTAL_VOCAB + 1} Einträge (alle + eigenes Wort)`,
    new RegExp(`${TOTAL_VOCAB + 1} Einträge`).test(await text()),
  );
}

try {
  await main();
} catch (e) {
  check(
    "Testlauf ohne Ausnahme",
    false,
    e instanceof Error ? e.message : String(e),
  );
} finally {
  proc.kill();
  ws?.close();
}
const failed = results.filter((r) => !r.ok).length;
console.log(
  `\n${results.length - failed}/${results.length} Prüfungen bestanden`,
);
process.exit(failed ? 1 : 0);
