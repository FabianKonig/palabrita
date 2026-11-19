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
  // 3b. Reihenfolge nach Trefferqualität: ganze deutsche Einträge „Auto“ vor „el autobús“.
  await setInput('input[type="search"]', "Auto");
  await sleep(300);
  const autoHits = await evaluate<string[]>(
    `[...document.querySelectorAll(".vocab-list .es")].slice(0, 3).map((e) => e.textContent)`,
  );
  check(
    "Suche „Auto“: ganze Treffer (carro, coche) vor Teiltreffer (autobús)",
    autoHits.join("|") === "el carro|el coche|el autobús",
    autoHits.join("|"),
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
    `document.querySelector(".session-count")?.textContent ?? ""`,
  );
  check(
    "Nach 3 Bewertungen steht „3 Geübt“",
    /^3\s*Geübt$/.test(progress),
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

  // 8d2. Legend opened from the verb detail goes "← Zurück" to the verb, directly it says "← Mehr".
  await clickText("ⓘ", "a");
  await waitFor(`document.querySelector("dt")`, "Legende aus der Verbtabelle");
  check(
    "Legende aus der Verbtabelle: „← Zurück“ führt zum Verb",
    /← Zurück/.test(await text()),
  );
  await clickText("← Zurück", ".screen .back");
  await waitFor(`document.querySelector(".verb")`, "Verb nach Zurück");
  check(
    "Zurück aus der Legende zeigt wieder das Verb",
    /poder \(o → ue/.test(await text()),
  );
  await send("Page.navigate", { url: `${BASE}#/legend` });
  await waitFor(`document.querySelector("dt")`, "Legende direkt");
  check("Legende direkt geöffnet: „← Mehr“", /← Mehr/.test(await text()));

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
    `Niveau A1: Verzeichnis zeigt trotzdem alle Wörter (mindestens ${TOTAL_VOCAB})`,
    Number(a1) >= TOTAL_VOCAB,
    `${a1} Einträge`,
  );
  check(
    "Niveau A1: Niveau-Dropdown im Verzeichnis bietet weiter A1, A2, B1",
    (await evaluate<string>(
      `[...document.querySelector('select[aria-label="Niveau"]').options].map((o) => o.value).join(",")`,
    )) === ",A1,A2,B1",
  );
  // Detailseite eines Worts über dem Niveau: öffnet mit Hinweis.
  await setInput('input[type="search"]', "agradecer");
  await sleep(300);
  await evaluate(`document.querySelector(".vocab-list a").click()`);
  await waitFor(`location.hash.startsWith("#/dictionary/")`, "Detailseite B1");
  await sleep(300);
  check(
    "Niveau A1: Detailseite eines B1-Worts öffnet mit Hinweis „Liegt über deinem Niveau“",
    /agradecer/.test(await text()) &&
      /Liegt über deinem Niveau \(A1\), wird derzeit nicht gelernt/.test(
        await text(),
      ),
  );
  // Lernen-Seite: bei A1 nur noch „A1“, ausgewählt und deaktiviert.
  await send("Page.navigate", { url: BASE });
  await waitFor(
    `document.querySelector(".settings-form select")`,
    "Lernen-Seite",
  );
  const lvl = await evaluate<string>(`(() => {
    const sel = [...document.querySelectorAll(".settings-form select")]
      .find((s) => s.closest("label")?.textContent.startsWith("Niveau"));
    return JSON.stringify({
      options: [...sel.options].map((o) => o.value).join(","),
      value: sel.value,
      disabled: sel.disabled,
    });
  })()`);
  check(
    "Niveau A1: Lernen-Seite zeigt nur „A1“, ausgewählt und deaktiviert",
    lvl === '{"options":"A1","value":"A1","disabled":true}',
    lvl,
  );
  await send("Page.navigate", { url: `${BASE}#/settings` });
  await waitFor(`document.querySelector(".setting select")`, "Einstellungen");
  await setInput(`select:has(option[value="A1"])`, "B1");
  await sleep(400);

  // 8e2. Lernen tab: the direction is chosen here and applies to the session only.
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
    "Lernen: Richtung ist nur für die Sitzung (nach Neuladen wieder Beide)",
    (await evaluate<string>(
      `document.querySelector('select:has(option[value="es-de"])').value`,
    )) === "both",
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
  const sections = await evaluate<number>(
    `document.querySelectorAll(".dict-section").length`,
  );
  const headings = await evaluate<number>(
    `document.querySelectorAll(".dict-section h2").length`,
  );
  check(
    "Verzeichnis: ein Abschnitt ohne Überschrift (Suche steht oben)",
    sections === 1 && headings === 0,
    `Abschnitte: ${sections}, Überschriften: ${headings}`,
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
  // Suchtext und Filter wirken zusammen: Die Suche läuft innerhalb der gefilterten Liste.
  // Die Statuszeile nennt alle aktiven Kriterien, „Filter löschen“ setzt nur die Dropdowns zurück.
  await setInput('input[type="search"]', "a");
  await setInput('select[aria-label="Niveau"]', "A1");
  await sleep(300);
  const combinedJson = await evaluate<string>(`JSON.stringify({
    q: document.querySelector('input[type="search"]').value,
    level: document.querySelector('select[aria-label="Niveau"]').value,
    status: document.querySelector(".dict-status")?.textContent ?? "",
  })`);
  const combined = JSON.parse(combinedJson) as {
    q: string;
    level: string;
    status: string;
  };
  check(
    "Verzeichnis: Suche und Filter wirken zusammen, Statuszeile nennt beides",
    combined.q === "a" &&
      combined.level === "A1" &&
      combined.status.includes("A1") &&
      combined.status.includes("„a“") &&
      !(await evaluate<boolean>(
        `!!document.querySelector(".dict-status strong")`,
      )),
    combinedJson,
  );
  await clickText("Filter löschen", ".dict-status button");
  await sleep(300);
  const clearedJson = await evaluate<string>(`JSON.stringify({
    q: document.querySelector('input[type="search"]').value,
    level: document.querySelector('select[aria-label="Niveau"]').value,
    status: document.querySelector(".dict-status")?.textContent ?? "",
  })`);
  const cleared = JSON.parse(clearedJson) as {
    q: string;
    level: string;
    status: string;
  };
  check(
    "Verzeichnis: „Filter löschen“ setzt nur die Dropdowns zurück, der Suchtext bleibt",
    cleared.q === "a" &&
      cleared.level === "" &&
      !cleared.status.includes("A1") &&
      cleared.status.includes("„a“"),
    clearedJson,
  );
  // Nur noch Suchtext: „Filter löschen“ ist weiter da und leert das Suchfeld.
  const searchOnlyBefore = await evaluate<boolean>(
    `!!document.querySelector(".dict-status button")`,
  );
  await clickText("Filter löschen", ".dict-status button");
  await sleep(300);
  const searchOnlyJson = await evaluate<string>(`JSON.stringify({
    q: document.querySelector('input[type="search"]').value,
    status: document.querySelector(".dict-status")?.textContent ?? "",
  })`);
  const searchOnly = JSON.parse(searchOnlyJson) as {
    q: string;
    status: string;
  };
  check(
    "Verzeichnis: bei reinem Suchtext leert „Filter löschen“ das Suchfeld",
    searchOnlyBefore && searchOnly.q === "" && searchOnly.status === "",
    searchOnlyJson,
  );
  // Das X am Suchfeld leert den Suchtext nur, sobald einer da ist.
  await setInput('input[type="search"]', "a");
  await sleep(300);
  const xShown = await evaluate<boolean>(
    `!!document.querySelector(".search-clear")`,
  );
  await evaluate(`document.querySelector(".search-clear").click()`);
  await sleep(300);
  const xCleared = await evaluate<boolean>(
    `document.querySelector('input[type="search"]').value === "" && !document.querySelector(".search-clear")`,
  );
  check(
    "Verzeichnis: X im Suchfeld erscheint bei Suchtext und leert ihn",
    xShown && xCleared,
    `${xShown} / ${xCleared}`,
  );
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
    backState.q === "a" && backState.level === "",
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
      return Math.abs(s.y - 1500) < 5 && s.q === "a" && s.level === "";
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

  // 8e6. Logo oben rechts steht auf jeder Seite an derselben Stelle, außer „Mehr“.
  // Sitzung, Zusammenfassung und „Für heute geschafft“ haben das Logo oben mittig (8j, 8k).
  // Gemessen relativ zur Inhaltsspalte (.screen), damit Scrollleisten keine Rolle spielen.
  // Neue Seiten hier ergänzen.
  const cornerRoutes = [
    "",
    "dictionary",
    "stats",
    "settings",
    "legend",
    "imprint",
    "privacy",
  ];
  const cornerPositions: string[] = [];
  for (const route of cornerRoutes) {
    await send("Page.navigate", { url: `${BASE}#/${route}` });
    await waitFor(
      `!!document.querySelector(".corner-logo") && !!document.querySelector(".screen h1")`,
      `Logo auf #/${route}`,
    );
    await sleep(200);
    cornerPositions.push(
      await evaluate<string>(`(() => {
        const s = document.querySelector(".screen").getBoundingClientRect();
        const r = document.querySelector(".corner-logo").getBoundingClientRect();
        return Math.round(r.top - s.top) + "," + Math.round(s.right - r.right);
      })()`),
    );
  }
  check(
    "Logo oben rechts steht auf allen Seiten an derselben Stelle",
    cornerPositions.every((p) => p === cornerPositions[0]),
    cornerPositions.join(" | "),
  );

  // 8e7. Version steht unter „Mehr“ (nach den Einträgen), nicht mehr unter Einstellungen.

  await send("Page.navigate", { url: `${BASE}#/more` });
  await waitFor(`document.querySelector(".link-list")`, "Mehr");
  check(
    "Mehr: Version steht unter Einstellungen, Legende, Datenschutz und Impressum",
    await evaluate<boolean>(`(() => {
      const list = document.querySelector(".link-list");
      const v = document.querySelector(".app-version");
      return !!v && /^Version: /.test(v.textContent)
        && !!(list.compareDocumentPosition(v) & Node.DOCUMENT_POSITION_FOLLOWING)
        && [...list.querySelectorAll("a")].map((a) => a.textContent).join("|") === "Einstellungen|Legende|Datenschutz|Impressum";
    })()`),
  );
  await send("Page.navigate", { url: `${BASE}#/settings` });
  await waitFor(`document.querySelector(".setting select")`, "Einstellungen");
  check(
    "Einstellungen: keine Versionszeile mehr",
    !(await evaluate<boolean>(`!!document.querySelector(".app-version")`)),
  );

  // 8e8. Formsuche (SPEC §3.3a, §14.3): gebeugte Formen finden die Grundform, die Detailseite
  // hebt die gefundene Form hervor. Läuft in Handy-Breite, damit Umbruch und Touch-Ziele zählen.
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 800,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send("Page.navigate", { url: `${BASE}#/dictionary` });
  await waitFor(
    `document.querySelector(".vocab-list")`,
    "Verzeichnis (Formsuche)",
  );
  await setInput('select[aria-label="Wortart"]', "verb");
  await setInput('input[type="search"]', "podemos");
  await waitFor(
    `document.querySelector(".vocab-list .form-word")`,
    "Formzeile podemos",
  );
  const formRow = await evaluate<string>(`(() => {
    const a = document.querySelector(".vocab-list a");
    return JSON.stringify({
      word: a.querySelector(".form-word")?.textContent,
      base: a.querySelector(".form-base")?.textContent,
      label: a.querySelector(".form-label")?.textContent,
      aria: a.getAttribute("aria-label"),
      height: Math.round(a.getBoundingClientRect().height),
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      lines: a.querySelectorAll(":scope > span").length,
    });
  })()`);
  const fr = JSON.parse(formRow) as Record<string, unknown>;
  check(
    "Formsuche: „podemos“ zeigt die Zeile „podemos → poder“ mit „1. Pl. Presente“",
    fr.word === "podemos" &&
      fr.base === "poder" &&
      fr.label === "1. Pl. Presente" &&
      fr.aria === "podemos, Form von poder, 1. Pl. Presente",
    formRow,
  );
  check(
    "Formsuche: Zeile ist ein Touch-Ziel ≥ 48 px, drei Zeilen, kein horizontales Scrollen",
    (fr.height as number) >= 48 && fr.lines === 3 && fr.overflow === false,
    formRow,
  );

  // Antippen: Detailseite von poder, die Zelle „podemos“ ist hervorgehoben und sichtbar.
  await evaluate(`document.querySelector(".vocab-list a").click()`);
  await waitFor(
    `location.hash.startsWith("#/dictionary/")`,
    "Detailseite poder",
  );
  await waitFor(`document.querySelector(".form-hit")`, "Hervorhebung");
  await sleep(300);
  const hit = await evaluate<string>(`(() => {
    const hits = [...document.querySelectorAll(".form-hit")];
    const el = hits[0];
    const r = el?.getBoundingClientRect();
    const cs = el && getComputedStyle(el);
    return JSON.stringify({
      texts: hits.map((h) => h.textContent),
      weight: cs && Number(cs.fontWeight),
      bg: cs?.backgroundColor,
      visible: !!r && r.top >= 0 && r.bottom <= window.innerHeight,
      title: document.querySelector("h1")?.textContent,
    });
  })()`);
  const h = JSON.parse(hit) as {
    texts: string[];
    weight: number;
    bg: string;
    visible: boolean;
    title: string;
  };
  check(
    "Formsuche: Detailseite von poder, Zelle „podemos“ ist hervorgehoben (Hintergrund und Fettdruck)",
    h.title === "poder" &&
      h.texts.join() === "podemos" &&
      h.weight >= 700 &&
      h.bg !== "rgba(0, 0, 0, 0)",
    hit,
  );
  check(
    "Formsuche: die hervorgehobene Zelle ist sichtbar (gescrollt)",
    h.visible,
    hit,
  );

  // Zurück: Suchtext und Filter sind erhalten.
  await send("Runtime.evaluate", { expression: "history.back()" });
  await waitFor(
    `document.querySelector(".vocab-list")`,
    "Zurück zur Formsuche",
  );
  await sleep(300);
  const backForm = await evaluate<string>(`JSON.stringify({
    q: document.querySelector('input[type="search"]').value,
    pos: document.querySelector('select[aria-label="Wortart"]').value,
    word: document.querySelector(".vocab-list .form-word")?.textContent,
  })`);
  check(
    "Formsuche: Zurück behält Suchtext und Filter",
    backForm === '{"q":"podemos","pos":"verb","word":"podemos"}',
    backForm,
  );

  // Ein direkter Aufruf der URL (kein Router-Zustand) zeigt keine Hervorhebung.
  const detailHash = await evaluate<string>(
    `document.querySelector(".vocab-list a").getAttribute("href")`,
  );
  await send("Page.navigate", { url: `${BASE}#/stats` });
  await waitFor(
    `/Statistik/.test(document.body.innerText)`,
    "Statistik (Formsuche)",
  );
  await send("Page.navigate", { url: `${BASE}${detailHash}` });
  await waitFor(`document.querySelector(".verb")`, "poder direkt");
  await sleep(200);
  check(
    "Formsuche: direkter Aufruf der Detailseite zeigt keine Hervorhebung",
    (await evaluate<number>(
      `document.querySelectorAll(".form-hit").length`,
    )) === 0,
  );

  // „vamos“: zwei Zeilen (ir, irse); bei ir sind beide Zellen hervorgehoben.
  await send("Page.navigate", { url: `${BASE}#/dictionary` });
  await waitFor(`document.querySelector(".vocab-list")`, "Verzeichnis (vamos)");
  await setInput('select[aria-label="Wortart"]', "");
  await setInput('input[type="search"]', "vamos");
  await waitFor(`document.querySelector(".vocab-list .form-word")`, "vamos");
  const vamos = await evaluate<string>(`JSON.stringify(
    [...document.querySelectorAll(".vocab-list li")].map((li) => li.querySelector(".form-base")?.textContent + ": " + li.querySelector(".form-label")?.textContent)
  )`);
  check(
    "Formsuche: „vamos“ zeigt ir und irse, je eine Zeile",
    vamos ===
      '["ir: 1. Pl. Presente · 1. Pl. Imperativo","irse: 1. Pl. Presente"]',
    vamos,
  );
  await evaluate(`document.querySelector(".vocab-list a").click()`);
  await waitFor(`document.querySelector(".form-hit")`, "Hervorhebung ir");
  check(
    "Formsuche: bei „vamos“ sind beide Zellen von ir hervorgehoben",
    (await evaluate<number>(
      `document.querySelectorAll(".form-hit").length`,
    )) === 2,
  );

  // Nomen und Adjektiv: Pluralzeile bzw. Zeile „Formen“.
  await send("Runtime.evaluate", { expression: "history.back()" });
  await waitFor(`document.querySelector(".vocab-list")`, "Zurück (Nomen)");
  await setInput('input[type="search"]', "canciones");
  await waitFor(
    `document.querySelector(".vocab-list .form-word")`,
    "canciones",
  );
  const noun = await evaluate<string>(`(() => {
    const a = document.querySelector(".vocab-list a");
    return a.querySelector(".form-word").textContent + " → " + a.querySelector(".form-base").textContent + " | " + a.querySelector(".form-label").textContent;
  })()`);
  check(
    "Formsuche: „canciones“ → la canción, Plural",
    noun === "canciones → la canción | Plural",
    noun,
  );
  await evaluate(`document.querySelector(".vocab-list a").click()`);
  await waitFor(`document.querySelector(".form-hit")`, "Hervorhebung Plural");
  check(
    "Formsuche: bei Nomen ist die Pluralzeile hervorgehoben",
    (
      await evaluate<string>(
        `document.querySelector(".form-hit").parentElement.textContent`,
      )
    ).startsWith("Plural:"),
  );

  await send("Runtime.evaluate", { expression: "history.back()" });
  await waitFor(`document.querySelector(".vocab-list")`, "Zurück (Adjektiv)");
  await setInput('input[type="search"]', "buenas");
  await waitFor(`document.querySelector(".vocab-list .form-word")`, "buenas");
  const adjRow = await evaluate<string>(
    `document.querySelector(".vocab-list .form-base").textContent + " | " + document.querySelector(".vocab-list .form-label").textContent`,
  );
  check(
    "Formsuche: „buenas“ → bueno, f. Pl.",
    adjRow === "bueno | f. Pl.",
    adjRow,
  );
  await evaluate(`document.querySelector(".vocab-list a").click()`);
  await waitFor(`document.querySelector(".form-hit")`, "Hervorhebung Adjektiv");
  const adjLine = await evaluate<string>(`(() => {
    const p = document.querySelector(".form-hit").closest("p");
    return p.textContent + " || " + document.querySelector(".form-hit").textContent;
  })()`);
  check(
    "Formsuche: Adjektiv-Detailseite zeigt die Zeile „Formen“, die gefundene Form ist hervorgehoben",
    adjLine ===
      "Formen: feminin buena · Plural buenos · feminin Plural buenas || buenas",
    adjLine,
  );

  // Adjektiv ohne Suche: die Zeile „Formen“ steht auch ohne adj-Feld in den Daten.
  await send("Page.navigate", { url: `${BASE}#/dictionary` });
  await waitFor(`document.querySelector(".vocab-list")`, "Verzeichnis (rojo)");
  await setInput('input[type="search"]', "rojo");
  await waitFor(`document.querySelector(".vocab-list a")`, "rojo");
  await evaluate(`document.querySelector(".vocab-list a").click()`);
  await waitFor(`/Formen:/.test(document.body.innerText)`, "Formen rojo");
  check(
    "Formsuche: Adjektiv-Detailseite zeigt die Formen immer (rojo), ohne Hervorhebung",
    /Formen: feminin roja · Plural rojos · feminin Plural rojas/.test(
      await text(),
    ) &&
      (await evaluate<number>(
        `document.querySelectorAll(".form-hit").length`,
      )) === 0,
  );
  await send("Emulation.clearDeviceMetricsOverride");

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

  // 8h2. Bottom sheet on a phone: a downward swipe closes it, a short pull snaps back.
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 800,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true });
  const touch = (type: string, y: number) =>
    send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x: 195, y }],
    });
  const swipe = async (from: number, to: number, steps = 8, pause = 20) => {
    await touch("touchStart", from);
    for (let i = 1; i <= steps; i++) {
      await touch("touchMove", from + ((to - from) * i) / steps);
      if (pause) await sleep(pause);
    }
    await touch("touchEnd", to);
  };
  const openSheet = async () => {
    await clickText("Konjugation", "button");
    return waitFor(`document.querySelector('[role="dialog"] .verb')`, "Sheet");
  };
  const sheetOpened = openSheet();
  const gripVisible = await evaluate<boolean>(
    `getComputedStyle(document.querySelector(".overlay-grip")).display !== "none"`,
  );
  await sheetOpened;
  const sheetTop = await evaluate<number>(
    `document.querySelector(".overlay-sheet").getBoundingClientRect().top`,
  );
  await swipe(sheetTop + 40, sheetTop + 90); // short, slow pull: snaps back
  await sleep(400);
  const stayedOpen = await evaluate<boolean>(
    `!!document.querySelector('[role="dialog"]') && getComputedStyle(document.querySelector(".overlay-sheet")).transform === "none"`,
  );
  await swipe(sheetTop + 40, sheetTop + 400); // far pull: closes
  const swipeClosed = await waitFor(
    `!document.querySelector('[role="dialog"]')`,
    "Sheet per Wischen geschlossen",
  );
  const hashAfterSwipe = await evaluate<string>("location.hash");
  const frontAfterSwipe = await frontWord();
  check(
    "Bottom-Sheet: kurzer Zug federt zurück, Wischen nach unten schließt, Sitzung bleibt",
    gripVisible &&
      stayedOpen &&
      swipeClosed &&
      /^(#\/?)?$/.test(hashAfterSwipe) &&
      frontAfterSwipe === frontNow,
    JSON.stringify({
      gripVisible,
      stayedOpen,
      swipeClosed,
      hashAfterSwipe,
      frontAfterSwipe,
    }),
  );

  // 8h3. More gesture cases: flick, scrolled content, tablet width.
  const dialogGone = () =>
    waitFor(`!document.querySelector('[role="dialog"]')`, "Sheet geschlossen");
  const sheetTopNow = () =>
    evaluate<number>(
      `document.querySelector(".overlay-sheet").getBoundingClientRect().top`,
    );
  const sheetIdle = () =>
    evaluate<boolean>(
      `!!document.querySelector('[role="dialog"]') && getComputedStyle(document.querySelector(".overlay-sheet")).transform === "none"`,
    );

  // Flick: a fast pull closes without reaching 30 % of the height (the emulated touch events
  // arrive only every 30 to 50 ms, so the path is longer than a real flick, yet still short of 30 %).
  await openSheet();
  const flickTop = await sheetTopNow();
  const sheetHeight = await evaluate<number>(
    `document.querySelector(".overlay-sheet")?.offsetHeight ?? 0`,
  );
  await swipe(flickTop + 40, flickTop + 220, 3, 0);
  const flickDy = 220 - 40 - (220 - 40) / 3;
  const flickClosed = await dialogGone();
  check(
    "Bottom-Sheet: schneller kurzer Wisch (Flick) schließt",
    flickClosed && flickDy < sheetHeight * 0.3,
    JSON.stringify({ flickClosed, flickDy, sheetHeight }),
  );

  // Scrolled content: the sheet scrolls instead of being dragged.
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 420,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await openSheet();
  const scrollable = await evaluate<boolean>(
    `(() => { const e = document.querySelector(".overlay-sheet"); return e.scrollHeight > e.clientHeight; })()`,
  );
  await evaluate(`document.querySelector(".overlay-sheet").scrollTop = 150`);
  const scrolledTop = await sheetTopNow();
  await swipe(scrolledTop + 60, scrolledTop + 200);
  await sleep(400);
  const scrolledStayed = await sheetIdle();
  check(
    "Bottom-Sheet: bei gescrolltem Inhalt wird gescrollt statt gezogen, Sheet bleibt offen",
    scrollable && scrolledStayed,
    JSON.stringify({ scrollable, scrolledStayed }),
  );
  await clickText("Schließen", "button");
  await dialogGone();

  // Tablet width: no grip, no gesture.
  await send("Emulation.setDeviceMetricsOverride", {
    width: 800,
    height: 800,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await openSheet();
  const gripHidden = await evaluate<boolean>(
    `getComputedStyle(document.querySelector(".overlay-grip")).display === "none"`,
  );
  const wideTop = await sheetTopNow();
  await swipe(wideTop + 40, wideTop + 400);
  await sleep(400);
  const wideStayed = await sheetIdle();
  check(
    "Bottom-Sheet: ab 700 px keine Griffleiste und keine Wischgeste",
    gripHidden && wideStayed,
    JSON.stringify({ gripHidden, wideStayed }),
  );
  await clickText("Schließen", "button");
  await dialogGone();
  await send("Emulation.setTouchEmulationEnabled", { enabled: false });
  await send("Emulation.clearDeviceMetricsOverride");

  // 8i. Learning steps 1 / 10 min (SPEC 11, check 8). Start: one card in the review phase
  // (not due, rated yesterday), so it neither comes up nor locks its partner.
  await send("Page.navigate", { url: `${BASE}#/` });
  await idb(`store.clear(); store.put({
    vocabId: "v0001", dir: "de-es", due: Date.now() + 10 * 86400000,
    interval: 10, ease: 2.5, reps: 3, lapses: 0,
    lastReviewed: Date.now() - 86400000,
    introduced: Date.now() - 20 * 86400000, state: "learning",
  });`);
  await evaluate("window.__timeOffset = 0");
  await startSession();
  const cardA = await frontWord();
  await evaluate(
    `[...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Umdrehen")?.click()`,
  );
  await waitFor(`document.querySelector(".grade-good")`, "Bewertung");
  const newPreview = await evaluate<string>(
    `[...document.querySelectorAll(".grade small")].map((s) => s.textContent).join("|")`,
  );
  check(
    "Neue Karte: Vorschau „1 Min“ / „10 Min“",
    newPreview === "1 Min|10 Min",
    newPreview,
  );
  await rate("Nochmal");
  const cardB = await frontWord();
  // 2 Min später ist A (Schritt 0, 1 Min) fällig und kommt vor der nächsten neuen Karte.
  await evaluate("window.__timeOffset = 2 * 60 * 1000");
  await rate("Gewusst"); // B
  const cardC = await frontWord();
  check(
    "Nochmal: Karte kommt nach 1 Min (Zeitsprung) wieder, vor neuen Karten",
    cardA !== "" && cardB !== cardA && cardC === cardA,
    `A=${cardA} B=${cardB} C=${cardC}`,
  );
  await evaluate("window.__timeOffset = 0");

  // 8j. "Beenden" shows the summary, reloading keeps the progress (check 5).
  const cardsBefore = Number(
    await idb(`store.count().onsuccess = (e) => { out = e.target.result; };`),
  );
  // Abstand des Logos zur Mitte der Inhaltsspalte und zur Oberkante: gleich in Sitzung und Zusammenfassung.
  const logoPos = `(() => {
    const s = document.querySelector(".screen").getBoundingClientRect();
    const r = document.querySelector(".session-bar .logo").getBoundingClientRect();
    return Math.round(r.left + r.width / 2 - (s.left + s.width / 2)) + "," + Math.round(r.top - s.top);
  })()`;
  const logoBefore = await evaluate<string>(logoPos);
  await clickText("Beenden", "button");
  const summaryOk = await waitFor(
    `/Sitzung beendet/.test(document.body.innerText)`,
    "Zusammenfassung",
  );
  const summary = await text();
  // Vor dem Neuladen zählen: nur „Beenden“, kein „Weiterlernen“ (SPEC 14.1).
  const summaryButtons = await evaluate<string[]>(
    `[...document.querySelectorAll(".screen button")].map((b) => b.textContent.trim())`,
  );
  const logoAfter = await evaluate<string>(logoPos);
  check(
    "Zusammenfassung: Logo steht an derselben Stelle wie in der Sitzung",
    logoAfter === logoBefore,
    `Sitzung ${logoBefore} | Zusammenfassung ${logoAfter}`,
  );
  await evaluate("location.reload()");
  await sleep(1000);
  const cardsAfter = Number(
    await idb(`store.count().onsuccess = (e) => { out = e.target.result; };`),
  );
  check(
    "Beenden: Zusammenfassung, Neuladen behält den Fortschritt",
    summaryOk &&
      /2\s+Karten geübt/.test(summary) &&
      JSON.stringify(summaryButtons) === JSON.stringify(["Beenden"]) &&
      cardsBefore >= 3 &&
      cardsAfter === cardsBefore,
    `${cardsBefore} -> ${cardsAfter} Karten, Buttons: ${JSON.stringify(summaryButtons)}`,
  );

  // 8k. "Für heute geschafft" and "10 weitere neue Karten" (SPEC 3.1, 12.2, 14.1).
  // Start: 19 cards introduced and rated today (not due, ids without vocabulary, they only
  // count for the daily limit). The 20th new card reaches the limit; it comes back at once
  // (stage 3, nothing else left) and graduates, then the session is done.
  await evaluate("window.__timeOffset = 0");
  await send("Page.navigate", { url: `${BASE}#/` });
  await idb(`store.clear();
    for (let i = 0; i < 19; i++) store.put({
      vocabId: "x" + String(i).padStart(4, "0"), dir: "de-es",
      due: Date.now() + 3 * 86400000, interval: 1, ease: 2.5, reps: 1, lapses: 0,
      lastReviewed: Date.now() - 60000, introduced: Date.now() - 60000, state: "learning",
    });`);
  await startSession();
  const doneLogoBefore = await evaluate<string>(logoPos);
  const limitCard = await frontWord();
  await rate("Gewusst");
  const limitCardAgain = await frontWord();
  await rate("Gewusst");
  const doneOk = await waitFor(
    `document.querySelector(".screen h1")?.textContent === "Für heute geschafft"`,
    "Für heute geschafft",
  );
  const doneText = await text();
  const doneButtons = await evaluate<string[]>(
    `[...document.querySelectorAll(".screen button")].map((b) => b.textContent.trim())`,
  );
  check(
    "Limit erreicht: „Für heute geschafft“ mit Kacheln, Satz und beiden Buttons",
    doneOk &&
      limitCard !== "" &&
      limitCardAgain === limitCard &&
      /2\s+Karten geübt/.test(doneText) &&
      /Das Limit für neue Karten ist erreicht\./.test(doneText) &&
      JSON.stringify(doneButtons) ===
        JSON.stringify(["10 weitere neue Karten", "Beenden"]),
    `Karte ${limitCard}/${limitCardAgain}, Buttons: ${JSON.stringify(doneButtons)}`,
  );
  const doneLogoAfter = await evaluate<string>(logoPos);
  check(
    "Für heute geschafft: Logo oben mittig wie in der Sitzung, ohne Ecken-Logo und Tab-Leiste",
    doneLogoAfter === doneLogoBefore &&
      (await evaluate<boolean>(`(() => {
        const corner = document.querySelector(".corner-logo");
        const tabs = document.querySelector(".tabbar");
        return (!corner || getComputedStyle(corner).display === "none")
          && (!tabs || getComputedStyle(tabs).display === "none");
      })()`)),
    `Sitzung ${doneLogoBefore} | Für heute geschafft ${doneLogoAfter}`,
  );
  await clickText("10 weitere neue Karten", "button");
  const moreOk = await waitFor(
    `!!document.querySelector(".flashcard")`,
    "Karte nach „10 weitere“",
  );
  const moreCard = await frontWord();
  const moreCount = await evaluate<string>(
    `document.querySelector(".session-count-num")?.textContent ?? ""`,
  );
  check(
    "10 weitere neue Karten: die Sitzung läuft mit einer neuen Karte und demselben Zähler weiter",
    moreOk && moreCard !== "" && moreCard !== limitCard && moreCount === "2",
    `${moreCard}, Geübt ${moreCount}`,
  );

  // 8e9. Genus-Badge auf der spanischen Seite (SPEC §14.1): Nomen zeigen es zwischen Singular
  // und Plural. Richtung ES→DE, damit die spanische Seite vorn liegt.
  await send("Page.navigate", { url: `${BASE}#/` });
  await idb(`store.clear()`);
  await startSession(async () => {
    await setInput(`select:has(option[value="noun"])`, "noun");
    await setInput(`select:has(option[value="es-de"])`, "es-de");
  });
  const genderCard = await evaluate<{
    parts: string[];
    gender: string;
    word: string;
  }>(`(() => {
    const card = document.querySelector(".flashcard");
    const parts = [...card.querySelectorAll(":scope > span")]
      .map(s => s.className)
      .filter(c => c !== "dir" && c !== "hint");
    return {
      parts,
      gender: card.querySelector(".gender")?.textContent ?? "",
      word: card.querySelector(".word")?.textContent ?? "",
    };
  })()`);
  check(
    "Nomen-Karte (ES→DE): Genus-Badge steht zwischen Singular und Plural",
    ["maskulin", "feminin", "maskulin/feminin"].includes(genderCard.gender) &&
      genderCard.parts[0] === "word" &&
      genderCard.parts[1] === "gender" &&
      (genderCard.parts.length === 2 || genderCard.parts[2] === "plural"),
    `${genderCard.word} / ${genderCard.gender} / ${genderCard.parts.join(",")}`,
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
    `Offline: ${TOTAL_VOCAB} Einträge`,
    new RegExp(`${TOTAL_VOCAB} Einträge`).test(await text()),
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
