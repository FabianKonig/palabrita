/** Explanations of the verb notation shown on the legend page (SPEC §5.1). */
export const NOTATIONS: { mark: string; meaning: string; example: string }[] = [
  {
    mark: "(e → ie)",
    meaning:
      "Stammwechsel: Der Stammvokal e wird in den betonten Formen zu ie (Präsens: yo, tú, él/usted, ellos/ustedes), nicht bei nosotros und vosotros.",
    example: "querer: quiero, quieres, quiere, queremos, queréis, quieren",
  },
  {
    mark: "(o → ue)",
    meaning:
      "Stammwechsel o → ue, gleiche Formen wie bei e → ie. Bei jugar gilt (u → ue).",
    example: "poder: puedo, puedes, puede, podemos, podéis, pueden",
  },
  {
    mark: "(u → ue)",
    meaning: "Nur jugar: u → ue in den betonten Formen.",
    example: "jugar: juego, juegas, juega, jugamos, jugáis, juegan",
  },
  {
    mark: "(e → i)",
    meaning:
      "Stammwechsel e → i bei Verben auf -ir. Im Präsens in den betonten Formen, zusätzlich im Pretérito (3. Person) und im Gerundio.",
    example: "pedir: pido, pides, pide, pedimos; pidió, pidieron; pidiendo",
  },
  {
    mark: "(e → ie, e → i)",
    meaning:
      "Doppelter Stammwechsel bei -ir-Verben: e → ie im Präsens (betonte Formen), e → i im Pretérito (3. Person), im Gerundio und im Subjuntivo bei nosotros/vosotros.",
    example: "sentir: siento, sentimos; sintió, sintieron; sintiendo",
  },
  {
    mark: "(o → ue, o → u)",
    meaning:
      "Doppelter Stammwechsel bei -ir-Verben: o → ue im Präsens (betonte Formen), o → u im Pretérito (3. Person) und im Gerundio.",
    example: "dormir: duermo, dormimos; durmió, durmieron; durmiendo",
  },
  {
    mark: "(-go)",
    meaning:
      "Die 1. Person Singular im Präsens bekommt -g-. Die übrigen Präsensformen folgen der Regel (oder dem Stammwechsel, falls angegeben). Der Subjuntivo und der Imperativ (usted, ustedes) bauen auf der yo-Form auf.",
    example: "hacer: hago, haces; salir: salgo, sales; poner: pongo, pones",
  },
  {
    mark: "(-zco)",
    meaning:
      "Die 1. Person Singular im Präsens endet auf -zco (Verben auf -cer/-cir nach Vokal). Subjuntivo und Imperativ (usted, ustedes) bauen darauf auf.",
    example: "conocer: conozco, conoces; traducir: traduzco",
  },
  {
    mark: "(-oy)",
    meaning:
      "Die 1. Person Singular im Präsens endet auf -oy. Subjuntivo mit Akzent (dé, esté).",
    example: "dar: doy, das; estar: estoy, estás",
  },
  {
    mark: "(i → y)",
    meaning:
      "Verben auf -uir: Zwischen Vokalen wird i zu y, im Präsens in den betonten Formen und im Pretérito (3. Person) und Gerundio.",
    example: "construir: construyo, construimos; construyó; construyendo",
  },
  {
    mark: "(Pretérito irr.), (Futuro irr.), (Pretérito/Futuro irr.)",
    meaning:
      "Unregelmäßiger Stamm im Pretérito indefinido bzw. im Futuro, unabhängig vom Präsens. Die abweichenden Formen sind in der Tabelle farbig markiert.",
    example: "tener: tuve, tuviste; tendré, tendrás",
  },
  {
    mark: "(c → qu), (z → c), (g → gu), (gu → gü), (g → j), (gu → g), (c → z)",
    meaning:
      "Rechtschreibänderung, damit der Laut erhalten bleibt. Nicht wirklich unregelmäßig. Betrifft nur Formen, bei denen sonst die Aussprache kippen würde (z. B. vor e).",
    example:
      "buscar: busqué; empezar: empecé; llegar: llegué; averiguar: averigüé; coger: cojo; seguir: sigo; vencer: venzo",
  },
  {
    mark: "(irr.)",
    meaning: "Stark unregelmäßig, die Formen weichen deutlich ab.",
    example: "ser, ir, haber",
  },
  {
    mark: "Kombinationen, z. B. (e → ie, -go)",
    meaning:
      "Mehrere Angaben stehen nacheinander: erst Stammwechsel, dann Besonderheit der yo-Form, dann Rechtschreibung. Jede Angabe gilt für sich.",
    example:
      "tener (e → ie, -go, Pretérito/Futuro irr.): tengo, tienes, tiene, tenemos; tuve; tendré",
  },
];
