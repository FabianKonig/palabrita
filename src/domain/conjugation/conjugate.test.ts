import { describe, expect, it } from "vitest";
import type { VerbData } from "../types";
import { conjugate } from "./conjugate";
import { attachClitic, stressedIndex } from "./accent";

/** Expected forms: six persons (imperative: tú, usted, nosotros, vosotros, ustedes). */
interface Ref {
  es: string;
  verb: VerbData;
  presente: string;
  indefinido: string;
  imperfecto: string;
  futuro: string;
  imperativo: string;
  participio: string;
  gerundio: string;
}

const verb = (tags: VerbData["tags"] = [], overrides?: VerbData["overrides"]) =>
  ({ tags, reflexive: false, overrides }) satisfies VerbData;

const REFERENCE: Ref[] = [
  {
    es: "hablar",
    verb: verb(),
    presente: "hablo hablas habla hablamos habláis hablan",
    indefinido: "hablé hablaste habló hablamos hablasteis hablaron",
    imperfecto: "hablaba hablabas hablaba hablábamos hablabais hablaban",
    futuro: "hablaré hablarás hablará hablaremos hablaréis hablarán",
    imperativo: "habla hable hablemos hablad hablen",
    participio: "hablado",
    gerundio: "hablando",
  },
  {
    es: "comer",
    verb: verb(),
    presente: "como comes come comemos coméis comen",
    indefinido: "comí comiste comió comimos comisteis comieron",
    imperfecto: "comía comías comía comíamos comíais comían",
    futuro: "comeré comerás comerá comeremos comeréis comerán",
    imperativo: "come coma comamos comed coman",
    participio: "comido",
    gerundio: "comiendo",
  },
  {
    es: "vivir",
    verb: verb(),
    presente: "vivo vives vive vivimos vivís viven",
    indefinido: "viví viviste vivió vivimos vivisteis vivieron",
    imperfecto: "vivía vivías vivía vivíamos vivíais vivían",
    futuro: "viviré vivirás vivirá viviremos viviréis vivirán",
    imperativo: "vive viva vivamos vivid vivan",
    participio: "vivido",
    gerundio: "viviendo",
  },
  {
    es: "poder",
    verb: verb(["ue"], {
      indefinido: {
        "1s": "pude",
        "2s": "pudiste",
        "3s": "pudo",
        "1p": "pudimos",
        "2p": "pudisteis",
        "3p": "pudieron",
      },
      futuro: { stem: "podr" },
      gerundio: "pudiendo",
    }),
    presente: "puedo puedes puede podemos podéis pueden",
    indefinido: "pude pudiste pudo pudimos pudisteis pudieron",
    imperfecto: "podía podías podía podíamos podíais podían",
    futuro: "podré podrás podrá podremos podréis podrán",
    imperativo: "puede pueda podamos poded puedan",
    participio: "podido",
    gerundio: "pudiendo",
  },
  {
    es: "pedir",
    verb: verb(["i"]),
    presente: "pido pides pide pedimos pedís piden",
    indefinido: "pedí pediste pidió pedimos pedisteis pidieron",
    imperfecto: "pedía pedías pedía pedíamos pedíais pedían",
    futuro: "pediré pedirás pedirá pediremos pediréis pedirán",
    imperativo: "pide pida pidamos pedid pidan",
    participio: "pedido",
    gerundio: "pidiendo",
  },
  {
    es: "sentir",
    verb: verb(["ie-i"]),
    presente: "siento sientes siente sentimos sentís sienten",
    indefinido: "sentí sentiste sintió sentimos sentisteis sintieron",
    imperfecto: "sentía sentías sentía sentíamos sentíais sentían",
    futuro: "sentiré sentirás sentirá sentiremos sentiréis sentirán",
    imperativo: "siente sienta sintamos sentid sientan",
    participio: "sentido",
    gerundio: "sintiendo",
  },
  {
    es: "dormir",
    verb: verb(["ue-u"]),
    presente: "duermo duermes duerme dormimos dormís duermen",
    indefinido: "dormí dormiste durmió dormimos dormisteis durmieron",
    imperfecto: "dormía dormías dormía dormíamos dormíais dormían",
    futuro: "dormiré dormirás dormirá dormiremos dormiréis dormirán",
    imperativo: "duerme duerma durmamos dormid duerman",
    participio: "dormido",
    gerundio: "durmiendo",
  },
  {
    es: "tener",
    verb: verb(["go", "ie"], {
      indefinido: {
        "1s": "tuve",
        "2s": "tuviste",
        "3s": "tuvo",
        "1p": "tuvimos",
        "2p": "tuvisteis",
        "3p": "tuvieron",
      },
      futuro: { stem: "tendr" },
      imperativo: { "2s": "ten" },
    }),
    presente: "tengo tienes tiene tenemos tenéis tienen",
    indefinido: "tuve tuviste tuvo tuvimos tuvisteis tuvieron",
    imperfecto: "tenía tenías tenía teníamos teníais tenían",
    futuro: "tendré tendrás tendrá tendremos tendréis tendrán",
    imperativo: "ten tenga tengamos tened tengan",
    participio: "tenido",
    gerundio: "teniendo",
  },
  {
    es: "conocer",
    verb: verb(["zco"]),
    presente: "conozco conoces conoce conocemos conocéis conocen",
    indefinido: "conocí conociste conoció conocimos conocisteis conocieron",
    imperfecto: "conocía conocías conocía conocíamos conocíais conocían",
    futuro: "conoceré conocerás conocerá conoceremos conoceréis conocerán",
    imperativo: "conoce conozca conozcamos conoced conozcan",
    participio: "conocido",
    gerundio: "conociendo",
  },
  {
    es: "construir",
    verb: verb(["y"]),
    presente: "construyo construyes construye construimos construís construyen",
    indefinido:
      "construí construiste construyó construimos construisteis construyeron",
    imperfecto:
      "construía construías construía construíamos construíais construían",
    futuro:
      "construiré construirás construirá construiremos construiréis construirán",
    imperativo: "construye construya construyamos construid construyan",
    participio: "construido",
    gerundio: "construyendo",
  },
  {
    es: "dar",
    verb: verb(["oy"], {
      presente: { "2p": "dais" },
      indefinido: {
        "1s": "di",
        "2s": "diste",
        "3s": "dio",
        "1p": "dimos",
        "2p": "disteis",
        "3p": "dieron",
      },
    }),
    presente: "doy das da damos dais dan",
    indefinido: "di diste dio dimos disteis dieron",
    imperfecto: "daba dabas daba dábamos dabais daban",
    futuro: "daré darás dará daremos daréis darán",
    imperativo: "da dé demos dad den",
    participio: "dado",
    gerundio: "dando",
  },
  {
    es: "ser",
    verb: verb(["irr"], {
      presente: {
        "1s": "soy",
        "2s": "eres",
        "3s": "es",
        "1p": "somos",
        "2p": "sois",
        "3p": "son",
      },
      indefinido: {
        "1s": "fui",
        "2s": "fuiste",
        "3s": "fue",
        "1p": "fuimos",
        "2p": "fuisteis",
        "3p": "fueron",
      },
      imperfecto: {
        "1s": "era",
        "2s": "eras",
        "3s": "era",
        "1p": "éramos",
        "2p": "erais",
        "3p": "eran",
      },
      imperativo: { "2s": "sé", "3s": "sea", "1p": "seamos", "3p": "sean" },
    }),
    presente: "soy eres es somos sois son",
    indefinido: "fui fuiste fue fuimos fuisteis fueron",
    imperfecto: "era eras era éramos erais eran",
    futuro: "seré serás será seremos seréis serán",
    imperativo: "sé sea seamos sed sean",
    participio: "sido",
    gerundio: "siendo",
  },
  {
    es: "ir",
    verb: verb(["irr"], {
      presente: {
        "1s": "voy",
        "2s": "vas",
        "3s": "va",
        "1p": "vamos",
        "2p": "vais",
        "3p": "van",
      },
      indefinido: {
        "1s": "fui",
        "2s": "fuiste",
        "3s": "fue",
        "1p": "fuimos",
        "2p": "fuisteis",
        "3p": "fueron",
      },
      imperfecto: {
        "1s": "iba",
        "2s": "ibas",
        "3s": "iba",
        "1p": "íbamos",
        "2p": "ibais",
        "3p": "iban",
      },
      imperativo: { "2s": "ve", "3s": "vaya", "1p": "vamos", "3p": "vayan" },
      gerundio: "yendo",
    }),
    presente: "voy vas va vamos vais van",
    indefinido: "fui fuiste fue fuimos fuisteis fueron",
    imperfecto: "iba ibas iba íbamos ibais iban",
    futuro: "iré irás irá iremos iréis irán",
    imperativo: "ve vaya vamos id vayan",
    participio: "ido",
    gerundio: "yendo",
  },
  {
    es: "buscar",
    verb: verb(),
    presente: "busco buscas busca buscamos buscáis buscan",
    indefinido: "busqué buscaste buscó buscamos buscasteis buscaron",
    imperfecto: "buscaba buscabas buscaba buscábamos buscabais buscaban",
    futuro: "buscaré buscarás buscará buscaremos buscaréis buscarán",
    imperativo: "busca busque busquemos buscad busquen",
    participio: "buscado",
    gerundio: "buscando",
  },
  {
    es: "empezar",
    verb: verb(["ie"]),
    presente: "empiezo empiezas empieza empezamos empezáis empiezan",
    indefinido: "empecé empezaste empezó empezamos empezasteis empezaron",
    imperfecto: "empezaba empezabas empezaba empezábamos empezabais empezaban",
    futuro: "empezaré empezarás empezará empezaremos empezaréis empezarán",
    imperativo: "empieza empiece empecemos empezad empiecen",
    participio: "empezado",
    gerundio: "empezando",
  },
  {
    es: "llegar",
    verb: verb(),
    presente: "llego llegas llega llegamos llegáis llegan",
    indefinido: "llegué llegaste llegó llegamos llegasteis llegaron",
    imperfecto: "llegaba llegabas llegaba llegábamos llegabais llegaban",
    futuro: "llegaré llegarás llegará llegaremos llegaréis llegarán",
    imperativo: "llega llegue lleguemos llegad lleguen",
    participio: "llegado",
    gerundio: "llegando",
  },
];

const forms = (list: { form: string }[]) => list.map((f) => f.form).join(" ");

describe("conjugate: reference verbs", () => {
  for (const ref of REFERENCE) {
    describe(ref.es, () => {
      const c = conjugate({ es: ref.es, verb: ref.verb });
      for (const tense of [
        "presente",
        "indefinido",
        "imperfecto",
        "futuro",
        "imperativo",
      ] as const) {
        it(tense, () => {
          expect(forms(c.tenses[tense])).toBe(ref[tense]);
        });
      }
      it("participio and gerundio", () => {
        expect(c.participio.form).toBe(ref.participio);
        expect(c.gerundio.form).toBe(ref.gerundio);
      });
    });
  }
});

describe("conjugate: other verbs", () => {
  it("leer: hiatus accents and y", () => {
    const c = conjugate({ es: "leer", verb: verb() });
    expect(forms(c.tenses.indefinido)).toBe(
      "leí leíste leyó leímos leísteis leyeron",
    );
    expect(c.gerundio.form).toBe("leyendo");
    expect(c.participio.form).toBe("leído");
    expect(c.regularity).toBe("orthographic");
  });

  it("seguir (i): gu → g", () => {
    const c = conjugate({ es: "seguir", verb: verb(["i"]) });
    expect(forms(c.tenses.presente)).toBe(
      "sigo sigues sigue seguimos seguís siguen",
    );
    expect(c.tenses.indefinido[2].form).toBe("siguió");
    expect(forms(c.tenses.imperativo)).toBe("sigue siga sigamos seguid sigan");
    expect(c.notation).toBe("seguir (e → i, gu → g)");
  });

  it("coger, vencer, averiguar, jugar", () => {
    expect(
      conjugate({ es: "coger", verb: verb() }).tenses.presente[0].form,
    ).toBe("cojo");
    expect(
      forms(conjugate({ es: "vencer", verb: verb() }).tenses.imperativo),
    ).toBe("vence venza venzamos venced venzan");
    expect(
      conjugate({ es: "averiguar", verb: verb() }).tenses.indefinido[0].form,
    ).toBe("averigüé");
    const jugar = conjugate({ es: "jugar", verb: verb(["ue"]) });
    expect(forms(jugar.tenses.presente)).toBe(
      "juego juegas juega jugamos jugáis juegan",
    );
    expect(jugar.tenses.indefinido[0].form).toBe("jugué");
  });

  it("hacer (go) and decir (go, i)", () => {
    expect(
      conjugate({ es: "hacer", verb: verb(["go"]) }).tenses.presente[0].form,
    ).toBe("hago");
    expect(
      forms(
        conjugate({ es: "decir", verb: verb(["go", "i"]) }).tenses.presente,
      ),
    ).toBe("digo dices dice decimos decís dicen");
  });

  it("estar (oy)", () => {
    const c = conjugate({
      es: "estar",
      verb: verb(["oy"], {
        presente: { "2s": "estás", "3s": "está", "3p": "están" },
      }),
    });
    expect(forms(c.tenses.presente)).toBe(
      "estoy estás está estamos estáis están",
    );
    // the imperative does not derive from presente overrides
    expect(forms(c.tenses.imperativo)).toBe("esta esté estemos estad estén");
  });
});

describe("conjugate: reflexive verbs", () => {
  it("llamarse", () => {
    const c = conjugate({
      es: "llamarse",
      verb: { tags: [], reflexive: true },
    });
    expect(forms(c.tenses.presente)).toBe(
      "me llamo te llamas se llama nos llamamos os llamáis se llaman",
    );
    expect(forms(c.tenses.indefinido)).toBe(
      "me llamé te llamaste se llamó nos llamamos os llamasteis se llamaron",
    );
    expect(forms(c.tenses.imperativo)).toBe(
      "llámate llámese llamémonos llamaos llámense",
    );
    expect(c.participio.form).toBe("llamado");
    expect(c.infinitive).toBe("llamarse");
  });

  it("levantarse, vestirse (i), irse", () => {
    expect(
      forms(
        conjugate({ es: "levantarse", verb: { tags: [], reflexive: true } })
          .tenses.imperativo,
      ),
    ).toBe("levántate levántese levantémonos levantaos levántense");
    const vestirse = conjugate({
      es: "vestirse",
      verb: { tags: ["i"], reflexive: true },
    });
    expect(forms(vestirse.tenses.presente)).toBe(
      "me visto te vistes se viste nos vestimos os vestís se visten",
    );
    expect(forms(vestirse.tenses.imperativo)).toBe(
      "vístete vístase vistámonos vestíos vístanse",
    );
    const irse = conjugate({
      es: "irse",
      verb: {
        tags: ["irr"],
        reflexive: true,
        overrides: {
          imperativo: {
            "2s": "ve",
            "3s": "vaya",
            "1p": "vamos",
            "3p": "vayan",
          },
        },
      },
    });
    expect(forms(irse.tenses.imperativo)).toBe(
      "vete váyase vámonos idos váyanse",
    );
  });
});

describe("conjugate: irregularity marking", () => {
  const marked = (es: string, v: VerbData, tense: "presente" | "indefinido") =>
    conjugate({ es, verb: v })
      .tenses[tense].map((f) => (f.irregular ? "x" : "."))
      .join("");

  it("marks only the stressed forms for a stem change", () => {
    expect(marked("poder", verb(["ue"]), "presente")).toBe("xxx..x");
  });
  it("marks only yo for go/zco/oy", () => {
    expect(marked("hacer", verb(["go"]), "presente")).toBe("x.....");
    expect(marked("conocer", verb(["zco"]), "presente")).toBe("x.....");
  });
  it("marks spelling changes", () => {
    expect(marked("buscar", verb(), "indefinido")).toBe("x.....");
  });
  it("marks third persons of -ir stem changes in the indefinido", () => {
    expect(marked("pedir", verb(["i"]), "indefinido")).toBe("..x..x");
  });
  it("does not mark regular verbs; marks gerundio and participio", () => {
    const c = conjugate({ es: "hablar", verb: verb() });
    expect(
      Object.values(c.tenses)
        .flat()
        .some((f) => f.irregular),
    ).toBe(false);
    expect(c.gerundio.irregular || c.participio.irregular).toBe(false);
    expect(
      conjugate({ es: "dormir", verb: verb(["ue-u"]) }).gerundio.irregular,
    ).toBe(true);
  });
  it("does not mark an override equal to the regular form", () => {
    const c = conjugate({
      es: "hablar",
      verb: verb([], { presente: { "1s": "hablo" } }),
    });
    expect(c.tenses.presente[0].irregular).toBe(false);
  });
  it("marks reflexive verbs by the bare form", () => {
    const c = conjugate({
      es: "dormirse",
      verb: { tags: ["ue-u"], reflexive: true },
    });
    expect(c.tenses.presente.map((f) => f.irregular)).toEqual([
      true,
      true,
      true,
      false,
      false,
      true,
    ]);
  });
});

describe("conjugate: notation, regularity, types", () => {
  const info = (es: string, v: VerbData) => {
    const c = conjugate({ es, verb: v });
    return { n: c.notation, r: c.regularity, t: c.types };
  };
  it("regular", () => {
    expect(info("hablar", verb())).toEqual({
      n: "hablar",
      r: "regular",
      t: [],
    });
  });
  it("stem change", () => {
    expect(info("pedir", verb(["i"]))).toEqual({
      n: "pedir (e → i)",
      r: "stem-change",
      t: ["stem-change"],
    });
    expect(info("sentir", verb(["ie-i"])).n).toBe("sentir (e → ie, e → i)");
    expect(info("dormir", verb(["ue-u"])).n).toBe("dormir (o → ue, o → u)");
    expect(info("construir", verb(["y"])).n).toBe("construir (i → y)");
  });
  it("yo-irregular", () => {
    expect(info("conocer", verb(["zco"]))).toEqual({
      n: "conocer (-zco)",
      r: "yo-irregular",
      t: ["yo-irregular"],
    });
  });
  it("orthographic", () => {
    expect(info("buscar", verb())).toEqual({
      n: "buscar (c → qu)",
      r: "orthographic",
      t: ["orthographic"],
    });
    expect(info("empezar", verb(["ie"])).n).toBe("empezar (e → ie, z → c)");
    expect(info("llegar", verb()).n).toBe("llegar (g → gu)");
    expect(info("coger", verb()).n).toBe("coger (g → j)");
  });
  it("mixed forms: tener", () => {
    const tener = conjugate({
      es: "tener",
      verb: verb(["go", "ie"], {
        indefinido: { "1s": "tuve" },
        futuro: { stem: "tendr" },
      }),
    });
    expect(tener.notation).toBe("tener (e → ie, -go, Pretérito/Futuro irr.)");
    expect(tener.regularity).toBe("irregular");
    expect(tener.types).toEqual(["stem-change", "yo-irregular", "strong-stem"]);
  });
  it("annotation is the bracket part of the notation, empty for regular verbs", () => {
    expect(conjugate({ es: "querer", verb: verb(["ie"]) }).annotation).toBe(
      "(e → ie)",
    );
    expect(conjugate({ es: "llegar", verb: verb() }).annotation).toBe(
      "(g → gu)",
    );
    expect(conjugate({ es: "hablar", verb: verb() }).annotation).toBe("");
  });
  it("irr tag is irregular; imperative/participle overrides alone are not", () => {
    expect(info("ser", verb(["irr"])).r).toBe("irregular");
    expect(info("ser", verb(["irr"])).n).toBe("ser (irr.)");
    const only = conjugate({
      es: "hacer",
      verb: verb(["go"], { imperativo: { "2s": "haz" }, participio: "hecho" }),
    });
    expect(only.regularity).toBe("yo-irregular");
    expect(only.participio).toEqual({ form: "hecho", irregular: true });
  });
  it("withOverrides: false yields the tag-generated forms", () => {
    const c = conjugate(
      {
        es: "tener",
        verb: verb(["go", "ie"], { imperativo: { "2s": "ten" } }),
      },
      { withOverrides: false },
    );
    expect(c.tenses.imperativo[0].form).toBe("tiene");
  });
  it("rejects non-infinitives", () => {
    expect(() => conjugate({ es: "casa", verb: null })).toThrow();
  });
});

describe("accent helpers", () => {
  it("finds the stressed vowel", () => {
    expect(stressedIndex("habla")).toBe(1);
    expect(stressedIndex("hablar")).toBe(4);
    expect(stressedIndex("hablé")).toBe(4);
    expect(stressedIndex("guerra")).toBe(2);
    expect(stressedIndex("seguid")).toBe(4);
  });
  it("adds the written accent only when needed", () => {
    expect(attachClitic("llama", "te")).toBe("llámate");
    expect(attachClitic("pon", "te")).toBe("ponte");
    expect(attachClitic("di", "me")).toBe("dime");
    expect(attachClitic("llamad", "os", 1)).toBe("llamaos");
    expect(attachClitic("vestid", "os", 1)).toBe("vestíos");
  });
});

describe("conjugate: textbook notation (annotation labels)", () => {
  const labels = (
    es: string,
    tags: VerbData["tags"] = [],
    overrides?: VerbData["overrides"],
  ) => conjugate({ es, verb: verb(tags, overrides) }).labels;

  it("writes stem changes as vowel arrows, not as bare tags", () => {
    expect(labels("querer", ["ie"])).toEqual(["e → ie"]);
    expect(labels("poder", ["ue"])).toEqual(["o → ue"]);
    expect(labels("jugar", ["ue"])).toEqual(["u → ue", "g → gu"]);
    expect(labels("pedir", ["i"])).toEqual(["e → i"]);
    expect(labels("sentir", ["ie-i"])).toEqual(["e → ie, e → i"]);
    expect(labels("dormir", ["ue-u"])).toEqual(["o → ue, o → u"]);
  });

  it("writes yo-form irregularities with a leading hyphen", () => {
    expect(labels("hacer", ["go"])).toEqual(["-go"]);
    expect(labels("conocer", ["zco"])).toEqual(["-zco"]);
    expect(labels("dar", ["oy"])).toEqual(["-oy"]);
  });

  it("writes -uir verbs as i → y", () => {
    expect(labels("construir", ["y"])).toEqual(["i → y"]);
  });

  it("marks irregular pretérito and futuro stems", () => {
    expect(labels("saber", [], { indefinido: { "1s": "supe" } })).toEqual([
      "Pretérito irr.",
    ]);
    expect(labels("caber", [], { futuro: { stem: "cabr" } })).toEqual([
      "Futuro irr.",
    ]);
    expect(
      labels("poner", ["go"], {
        indefinido: { "1s": "puse" },
        futuro: { stem: "pondr" },
      }),
    ).toEqual(["-go", "Pretérito/Futuro irr."]);
  });

  it("does not add pretérito/futuro labels to verbs already marked irr.", () => {
    expect(labels("ser", ["irr"], { indefinido: { "1s": "fui" } })).toEqual([
      "irr.",
    ]);
  });

  it("tener: all its irregularities appear in the notation, not only (go)", () => {
    const c = conjugate({
      es: "tener",
      verb: verb(["go", "ie"], {
        indefinido: {
          "1s": "tuve",
          "2s": "tuviste",
          "3s": "tuvo",
          "1p": "tuvimos",
          "2p": "tuvisteis",
          "3p": "tuvieron",
        },
        futuro: { stem: "tendr" },
      }),
    });
    expect(c.labels).toEqual(["e → ie", "-go", "Pretérito/Futuro irr."]);
    expect(c.notation).toBe("tener (e → ie, -go, Pretérito/Futuro irr.)");
    const presente = c.tenses.presente.map((f) => f.form);
    expect(presente).toEqual([
      "tengo",
      "tienes",
      "tiene",
      "tenemos",
      "tenéis",
      "tienen",
    ]);
  });

  it("orders labels: vowel change, yo form, spelling", () => {
    expect(labels("empezar", ["ie"])).toEqual(["e → ie", "z → c"]);
    expect(labels("seguir", ["i"])).toEqual(["e → i", "gu → g"]);
  });

  it("regular verbs have no labels and an empty annotation", () => {
    const c = conjugate({ es: "hablar", verb: verb() });
    expect(c.labels).toEqual([]);
    expect(c.annotation).toBe("");
  });
});
