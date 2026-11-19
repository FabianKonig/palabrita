/** Spanischer Slogan, gemeinsam genutzt von Markenkopf und Begrüßung. */
export const TAGLINE_ES = "Tu app de vocabulario de español";

const FLAG_COLORS = ["var(--turquoise)", "var(--yellow)", "var(--magenta)"];
const FLAGS = 7;
const WIDTH = 320;

/** Wimpel wie Papel picado, an einer durchhängenden Schnur. */
function Bunting() {
  // Schnur: quadratische Bézierkurve von (0,4) über (160,14) nach (320,4).
  const y = (t: number) => 4 * (1 - t) ** 2 + 28 * t * (1 - t) + 4 * t * t;
  const flags = Array.from({ length: FLAGS }, (_, i) => {
    const t = (i + 0.5) / FLAGS;
    const x = WIDTH * t;
    const top = y(t);
    return { x, top, color: FLAG_COLORS[i % FLAG_COLORS.length] };
  });
  return (
    <svg
      className="wordmark-bunting"
      viewBox={`0 0 ${WIDTH} 40`}
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="wordmark-string"
        d={`M0 4 Q${WIDTH / 2} 14 ${WIDTH} 4`}
        fill="none"
      />
      {flags.map((f) => (
        <path
          key={f.x}
          d={`M${f.x - 14} ${f.top} L${f.x + 14} ${f.top} L${f.x} ${f.top + 26} Z`}
          style={{ fill: f.color }}
        />
      ))}
    </svg>
  );
}

/** Mäanderband (Greca) als Trennlinie unter dem Namen. */
function Greca() {
  return (
    <svg
      className="wordmark-greca"
      viewBox="0 0 160 12"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 10 H4 V2 H12 V10 H16 M16 10 H20 V2 H28 V10 H32 M32 10 H36 V2 H44 V10 H48 M48 10 H52 V2 H60 V10 H64 M64 10 H68 V2 H76 V10 H80 M80 10 H84 V2 H92 V10 H96 M96 10 H100 V2 H108 V10 H112 M112 10 H116 V2 H124 V10 H128 M128 10 H132 V2 H140 V10 H144 M144 10 H148 V2 H156 V10 H160"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Wortmarke „Palabrita“: Wimpel, Name, Greca. Alle Maße sind in `em` festgelegt,
 * damit sie überall gleich aussieht (Markenkopf und Begrüßungskarte).
 * `asHeading` macht den Namen zur Hauptüberschrift; dann ist die Hülle ein `div`.
 */
export function Wordmark({ asHeading = false }: { asHeading?: boolean }) {
  const Wrap = asHeading ? "div" : "span";
  const Name = asHeading ? "h1" : "span";
  return (
    <Wrap className="wordmark">
      <Bunting />
      <Name className="wordmark-name">Palabrita</Name>
      <Greca />
    </Wrap>
  );
}

/** Rotes Herz als SVG, damit die Farbe überall gleich ist (kein Emoji, kein Textzeichen). */
function Heart() {
  return (
    <svg className="heart" viewBox="0 0 24 24" role="img" aria-label="Herz">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

/** Widmung „Con ♥ de Fabian König“ (bzw. „Mit ♥ von …“), das Herz ersetzt „Liebe“. */
export function Credit({ lead, tail }: { lead: string; tail: string }) {
  return (
    <span className="credit">
      {lead} <Heart /> {tail}
    </span>
  );
}

/** Kleines Markenzeichen: drei Wimpel an kurzer Schnur, ohne Schriftzug (für Seitenköpfe und Leisten). */
export function Mark() {
  // Schnur: Bézierkurve von (0,3) über (30,10) nach (60,3).
  const y = (t: number) => 3 * (1 - t) ** 2 + 20 * t * (1 - t) + 3 * t * t;
  const flags = [0, 1, 2].map((i) => {
    const t = (2 * i + 1) / 6;
    return { x: 60 * t, top: y(t), color: FLAG_COLORS[i] };
  });
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 60 26"
      aria-hidden="true"
      focusable="false"
    >
      <path className="wordmark-string" d="M0 3 Q30 10 60 3" fill="none" />
      {flags.map((f) => (
        <path
          key={f.x}
          d={`M${f.x - 6} ${f.top} L${f.x + 6} ${f.top} L${f.x} ${f.top + 12} Z`}
          style={{ fill: f.color }}
        />
      ))}
    </svg>
  );
}

/** Markenkopf im Tab „Mehr“: Wortmarke, Slogan und Widmung. */
export function Brand() {
  return (
    <header className="brand">
      <Wordmark asHeading />
      <p className="brand-tagline">{TAGLINE_ES}</p>
      <Credit lead="Con" tail="de Fabian König" />
    </header>
  );
}
