import { describe, expect, it } from 'vitest';
import { drawHaar } from '../src/render/haar';
import { ketteRuhe } from '../src/render/haarkette';
import wuselwerkerBlatt from '../src/art/wuselwerker.atlas.json';
import { readFileSync, readdirSync } from 'node:fs';
import type { AtlasManifest } from '../src/render/atlas';

/**
 * Die gezeichneten Straehnen — die zweite Haelfte der Frisur.
 *
 * Die erste steckt im Blatt: eine auf eine Ellipse gestutzte Haarmasse, die
 * den Kopf frei laesst. Kurz allein war nie das Ziel; die Laenge kommt vom
 * Zeichner. Warum sie nicht auch aus dem Modell kommen kann, steht im Kopf von
 * `src/render/haar.ts` und ist gemessen: Die Figur wird beim Backen waagerecht
 * auf 0,64 gestaucht, und was am Modell seitlich haengt, verschwindet dadurch
 * hinter dem eigenen Kopf.
 *
 * Zwei Dinge haelt dieser Lauf fest.
 *
 * **Das Blatt liefert, was der Zeichner braucht.** Drei Zahlen je Wurzel, und
 * die dritte ist die wichtige: wohin „aussen" im BILD zeigt. Der Zeichner kann
 * sie nicht erraten — er sieht eine Punktreihe und muesste ihre Mitte fuer den
 * Kopf halten, was bei gedrehtem Kopf falsch ist. Eine Straehne schwaenge dann
 * zur falschen Seite ueber das Gesicht.
 *
 * **Der Zeichner haelt sich an sie.** Geprueft mit einem Notizblock statt
 * einer Leinwand: Der Zeichner ruft nur `beginPath`, `moveTo`, `lineTo`,
 * `closePath` und `fill`, und alles davon laesst sich aufschreiben.
 */

const BLATT = wuselwerkerBlatt as unknown as AtlasManifest;

/** Wieviele Straehnenansaetze die Figur bestellt. */
const SOLL_WURZELN = (
  JSON.parse(readFileSync('art-src/wuselwerker/figur.json', 'utf8')) as { haarWurzeln: number }
).haarWurzeln;

/** Die Posentabellen als Quelle — dort steht, wie weit der Haarknochen schwingt. */
const POSEN_ROH: Record<string, { frames: { winkel?: Record<string, number[]> }[] }> = {};
for (const datei of readdirSync('art-src/wuselwerker/posen')) {
  if (!datei.endsWith('.json')) continue;
  POSEN_ROH[datei.replace(/\.json$/, '')] = JSON.parse(
    readFileSync(`art-src/wuselwerker/posen/${datei}`, 'utf8'),
  );
}

/** Eine Leinwand, die nichts malt, sondern mitschreibt. */
function notizblock(): {
  ctx: CanvasRenderingContext2D;
  zuege: { farbe: string; punkte: [number, number][] }[];
} {
  const zuege: { farbe: string; punkte: [number, number][] }[] = [];
  let punkte: [number, number][] = [];
  const ctx = {
    fillStyle: '',
    beginPath() {
      punkte = [];
    },
    moveTo(x: number, y: number) {
      punkte.push([x, y]);
    },
    lineTo(x: number, y: number) {
      punkte.push([x, y]);
    },
    closePath() {},
    // Die Masse besteht aus Kreisen und den Vierecken dazwischen. Ein Kreis
    // wird als sein Huellquadrat mitgeschrieben — fuer alles, was hier
    // gemessen wird (Lage, Breite, Richtung), reicht das genau.
    arc(x: number, y: number, r: number) {
      punkte.push([x - r, y - r], [x + r, y + r]);
    },
    save() {},
    restore() {},
    translate() {},
    fill() {
      zuege.push({ farbe: String(ctx.fillStyle), punkte: punkte.slice() });
    },
  } as unknown as CanvasRenderingContext2D;
  return { ctx, zuege: zuege };
}

/** Der Kasten um einen Zug. */
function kasten(punkte: [number, number][]) {
  const xs = punkte.map((p) => p[0]);
  const ys = punkte.map((p) => p[1]);
  return { l: Math.min(...xs), r: Math.max(...xs), o: Math.min(...ys), u: Math.max(...ys) };
}

describe('Das Blatt und die Haarfrage', () => {
  /**
   * Das Blatt haelt sich an den Schalter.
   *
   * Es gibt seit dem 22.08.2026 zwei Arten, der Figur Haar zu geben, und die
   * Zahl `haarWurzeln` in `figur.json` sagt, welche gilt:
   *
   *   > 0  Der Backvorgang misst je Einzelbild so viele Straehnenansaetze und
   *        legt sie ins Blatt; `drawHaar` zieht daraus lange Straehnen HINTER
   *        die Figur.
   *   = 0  Kein Ansatz im Blatt, kein Strich. Das Haar sitzt dann ganz am
   *        Kopf und bewegt sich ueber den Knochen `HaarSchwung` mit der Pose.
   *
   * Beides halb zu tun ist der Fehler, den diese Pruefung verhindert: Ein
   * Blatt mit Wurzeln bei `haarWurzeln: 0` zeichnet Straehnen, die niemand
   * bestellt hat, und ein Blatt ohne Wurzeln bei einer Zahl groesser null
   * laesst den Zeichner still nichts tun, waehrend das Haar am Kopf auf die
   * kurze Kappe gestutzt bleibt.
   */
  it('traegt genau dann Wurzeln, wenn die Figur welche bestellt', () => {
    expect(SOLL_WURZELN, 'mehr Wurzeln als die Lesegrenze hergibt').toBeLessThanOrEqual(5);
    expect(SOLL_WURZELN, 'negative Wurzelzahl').toBeGreaterThanOrEqual(0);
    for (const [name, clip] of Object.entries(BLATT.clips)) {
      if (SOLL_WURZELN === 0) {
        expect(clip.haar, `${name}: Wurzeln im Blatt, obwohl keine bestellt sind`).toBeUndefined();
        continue;
      }
      expect(clip.haar, `${name}: keine Wurzeln im Blatt`).toBeDefined();
      expect(clip.haar!.length, `${name}: Bildzahl`).toBe(clip.holds.length);
      clip.haar!.forEach((satz, i) => {
        expect(satz.length, `${name} Bild ${i}: Wurzelzahl`).toBe(SOLL_WURZELN);
        for (const q of satz) expect(q.length, `${name} Bild ${i}: Zahlen je Wurzel`).toBe(3);
        for (const q of satz) {
          expect(
            Math.abs(q[2]),
            `${name} Bild ${i}: Aussenrichtung ausserhalb`,
          ).toBeLessThanOrEqual(1.001);
        }
      });
    }
  });

  /**
   * Wenn Wurzeln da sind, sitzen sie am KOPF und nicht am Rumpf.
   *
   * Der erste Anlauf hat je Bildspalte die tiefste Haarecke genommen und
   * landete damit auf dem Pony; der zweite hat je Winkelfach die tiefste
   * genommen und rutschte in die Bildmitte, weil der untere Pol einer Schale
   * fuer alle Richtungen derselbe Ort ist. Erst der Rand — die Ecke mit dem
   * groessten Winkel zur Hochachse — laeuft wirklich um den Kopf.
   *
   * Die Schranke stand bis zum 25.08.2026 bei einer halben Kopfachse und ist
   * an den Zwischenbildern zerbrochen: Wo die Figur den Kopf SENKT, wandert
   * der Haarrand mit, und das ist keine Fehlmessung, sondern Anatomie.
   * Gemessen ueber alle 471 Wurzeln des Blattes liegen 35 tiefer als eine
   * halbe Achse, die tiefste bei 0,894 — allesamt im Buddeln und im Hieven,
   * wo der Kopf nach unten sieht.
   *
   * Eine ganze Kopfachse ist deshalb die neue Schranke, und sie faengt
   * weiterhin, was sie fangen soll: Eine Wurzel am RUMPF laege gut zwei
   * Achsen unter dem Gesichtspunkt, denn der Gesichtspunkt steht rund acht
   * logische Pixel ueber dem Boden und die Brust bei vier.
   */
  it('setzt vorhandene Wurzeln in Kopfhoehe und nicht am Rumpf', () => {
    for (const [name, clip] of Object.entries(BLATT.clips)) {
      if (!clip.haar) continue;
      clip.haar.forEach((satz, i) => {
        const g = clip.anchors![i] ?? clip.anchors![0];
        const st = clip.stirn![i] ?? clip.stirn![0];
        const achse = Math.hypot(st[0] - g[0], st[1] - g[1]);
        for (const q of satz) {
          // Kleineres y ist weiter oben.
          expect(q[1], `${name} Bild ${i}: Wurzel zu tief`).toBeLessThan(g[1] + achse);
        }
      });
    }
  });

  /**
   * Wenn das Haar am Kopf sitzt, muss es sich dort auch bewegen.
   *
   * Das ist die Zusage, die an die Stelle der gezeichneten Straehnen tritt,
   * und sie ist noetig, weil man ihr Fehlen nicht sieht: Ein Blatt mit
   * unbewegtem Haar sieht Bild fuer Bild richtig aus, und erst in Bewegung
   * merkt man, dass die Frisur auf dem Kopf klebt.
   *
   * Gemessen am Blatt vom 22.08.2026, Weg der Haarspitze ueber die Bilder
   * einer Pose, gegen den Kopfpunkt gerechnet:
   *
   *   Gehen    HaarSchwung spannt 63,4 Grad   ->  Spitze wandert 1,49 lp
   *   Rammen                      64,8              1,46 lp
   *   Bauen                       22,8              1,27 lp
   *   Sperren                      0,0              0,07 lp
   *
   * Die Lesegrenze ist 0,9 lp. Verlangt wird die Spanne an der QUELLE und
   * nicht am Blatt, weil ein Test kein Bild dekodieren soll — und zwanzig
   * Grad, weil das der kleinste Wert ist, der oben noch ueber die Lesegrenze
   * kommt.
   *
   * Ausgenommen sind die beiden Posen, die absichtlich stillstehen: Der
   * Blocker ist der Fels, der sich nicht ruehrt — das ist seine ganze
   * Aussage —, und `spaehen` ist das Warten vor dem Start.
   */
  it('laesst das Haar am Kopf sich mit der Pose bewegen', () => {
    const STILL = new Set(['blocking', 'spaehen']);
    for (const [name, pose] of Object.entries(POSEN_ROH)) {
      if (STILL.has(name)) continue;
      const w = pose.frames
        .map((f) => f.winkel?.HaarSchwung?.[0])
        .filter((v): v is number => typeof v === 'number');
      expect(w.length, `${name}: keine HaarSchwung-Winkel`).toBe(pose.frames.length);
      const spanne = Math.max(...w) - Math.min(...w);
      expect(
        spanne,
        `${name}: HaarSchwung spannt nur ${spanne.toFixed(1)} Grad — das Haar klebt am Kopf`,
      ).toBeGreaterThanOrEqual(20);
    }
  });
});

describe('Der Haarzeichner — eine Masse, keine Faeden', () => {
  const WURZELN: [number, number, number][] = [
    [1.0, -8.0, 0.9],
    [0.0, -8.2, -0.2],
    [-1.0, -8.0, -0.9],
  ];
  /**
   * Eine Kette, die senkrecht herunterhaengt.
   *
   * Geholt und nicht abgeschrieben. Hier stand bis zum 27.08.2026 eine
   * Zahlenreihe, und sie war beim ersten Nachziehen der Gliedlaenge falsch:
   * Die Kette schrumpfte von 6,3 auf 3,6 lp, die Reihe blieb — und der Test,
   * der die Ruhelage gegen ihre eigene Vorlage prueft, verglich zwei
   * verschiedene Frisuren.
   */
  const RUHIG = ketteRuhe('blocking') as [number, number][];
  const S = 4;

  /** Alle gezeichneten Punkte eines Laufs. */
  function alles(lage: Parameters<typeof drawHaar>[4], pose = 'blocking') {
    const { ctx, zuege } = notizblock();
    drawHaar(ctx, pose, WURZELN, S, lage);
    return zuege.flatMap((z) => z.punkte);
  }

  /**
   * Im Ruhestand haengt der Schopf hinter dem RUECKEN, nicht hinter dem Rumpf.
   *
   * Das ist der Fehler, den nur ein Bild gezeigt hat und keine Zahl: Nach dem
   * Kuerzen der Kette meldete die Musterkarte 0,0 Prozent Haarflaeche neben dem
   * Umriss — dreizehn Posen lang unsichtbar. Der Grund war Geometrie. Im
   * Gangbild spannt der Rumpf von -1,52 bis +2,43 lp um die Figurmitte, die
   * Mitte der drei gebackenen Wurzeln liegt aber bei +0,36, also VOR der
   * Rueckenkante; eine von dort senkrecht haengende Kette faellt vollstaendig
   * hinter den Koerper. Im Spiel fiel es nicht auf, weil die Laufbewegung die
   * Masse zuruecklegt — aber ein Sperrer steht still.
   *
   * Geprueft wird darum ohne jede Bewegung: die Ruhekette, eine Pose von der
   * Seite, und die Frage, ob ueberhaupt Farbe hinter der Rueckenkante liegt.
   */
  it('legt den Schopf auch im Stand hinter die Rueckenkante', () => {
    // Die Wurzelmitte der Probewurzeln liegt bei x = 0; die Rueckenkante des
    // Rumpfes liegt im Gangbild 1,88 lp dahinter (+0,36 bis -1,52).
    const RUECKEN = -1.88 * S;
    const punkte = alles({ kette: ketteRuhe('walking') as [number, number][], dreh: 46 }, 'walking');
    const weit = Math.min(...punkte.map((q) => q[0]));
    expect(
      weit,
      `hinterster Punkt bei ${(weit / S).toFixed(2)} lp — der Ruecken liegt bei -1,88`,
    ).toBeLessThan(RUECKEN);
  });

  /**
   * Von vorn rahmt das Haar das Gesicht — auf BEIDEN Seiten.
   *
   * Der zweite Fehler aus derselben Musterkarte. Bei den vier Posen, in denen
   * der Spieler der Figur ins Gesicht sieht — Sperren, Spaehen, Retten,
   * Sterben — verkuerzen sich Nacken- und Rueckversatz mit dem Sinus der
   * Posendrehung auf fast nichts. Die Masse fiel senkrecht hinter den Kopf,
   * und uebrig blieben zwei Zipfel am Schaedelrand: Die Figur sah aus, als
   * traege sie Ohrenschuetzer.
   */
  it('rahmt von vorn das Gesicht auf beiden Seiten', () => {
    const punkte = alles({ kette: RUHIG, dreh: 8 }, 'blocking');
    const links = Math.min(...punkte.map((q) => q[0]));
    const rechts = Math.max(...punkte.map((q) => q[0]));
    expect(links, 'nichts links vom Kopf').toBeLessThan(-1.0 * S);
    expect(rechts, 'nichts rechts vom Kopf').toBeGreaterThan(1.0 * S);
  });

  /**
   * Und im Profil fallen die beiden wieder zusammen.
   *
   * Geprueft wird nicht die absolute Breite — die enthaelt den Rueckstrich der
   * Pose und darf breiter sein als der Kopf, denn eine wehende Maehne ist es
   * auch. Geprueft wird die Aussage, die der erste Anlauf verletzt hat: Wer
   * sich zur Seite dreht, bekommt keine BREITEREN Haare. Mit dem reinen
   * Kosinus stand die Figur im Profil unter zwei getrennten Massen und war
   * breiter als von vorn.
   */
  it('wird im Profil nicht breiter als von vorn', () => {
    const spanne = (dreh: number, pose: string) => {
      const p = alles({ kette: ketteRuhe(pose) as [number, number][], dreh }, pose);
      return (Math.max(...p.map((q) => q[0])) - Math.min(...p.map((q) => q[0]))) / S;
    };
    const vorn = spanne(8, 'blocking');
    const seite = spanne(46, 'walking');
    expect(seite, `Profil ${seite.toFixed(2)} lp, von vorn ${vorn.toFixed(2)} lp`).toBeLessThan(
      vorn,
    );
  });

  it('zeichnet nichts, wenn das Blatt keine Wurzeln kennt', () => {
    const { ctx, zuege } = notizblock();
    drawHaar(ctx, 'walking', [], S, { kette: RUHIG });
    expect(zuege.length).toBe(0);
  });

  /**
   * Ohne Kette haengt das Haar in Ruhe — und zwar sichtbar.
   *
   * Die Weltkarte und die Profilauswahl zeichnen dieselbe Figur ohne
   * Simulation und damit ohne Gedaechtnis. Ohne diese Ruhelage traegen sie
   * gar kein Haar, und die Figur haette dort eine andere Frisur als im Spiel —
   * ein Fehler, den niemand bemerkt, weil beide Bilder fuer sich stimmig
   * aussehen.
   */
  it('haengt auch ohne Kette in Ruhe, fuer Karte und Profil', () => {
    const ohne = alles({});
    const mit = alles({ kette: RUHIG });
    expect(ohne.length).toBeGreaterThan(0);
    const tief = (p: [number, number][]) => Math.max(...p.map((q) => q[1]));
    expect(tief(ohne)).toBeCloseTo(tief(mit), 1);
  });

  /**
   * Die Kette bestimmt die Form, nicht der Zeichner.
   *
   * Das ist der ganze Umbau vom 26.08.2026 in einer Zusage: Frueher stand die
   * Bewegung in einer Tabelle mit dreizehn festen Versaetzen, jetzt kommt sie
   * aus einer Feder-Daempfer-Kette in `ansicht.ts`. Wenn diese Pruefung
   * durchfaellt, zeichnet der Zeichner wieder sein eigenes Ding.
   */
  it('folgt der Kette: eine nach vorn gelegte Kette legt die Masse nach vorn', () => {
    const vorn = alles({ kette: [[1.5, 1.5], [3.0, 3.0], [4.5, 4.5]] });
    const zurueck = alles({ kette: [[-1.5, 1.5], [-3.0, 3.0], [-4.5, 4.5]] });
    const mitte = (p: [number, number][]) => p.reduce((s, q) => s + q[0], 0) / p.length;
    expect(mitte(vorn)).toBeGreaterThan(mitte(zurueck) + S);
  });

  /**
   * Die Masse wird zur Spitze hin schmaler.
   *
   * Celestes vier Kleckse schrumpfen von voll auf ein Viertel, und der Grund
   * ist derselbe wie hier: Eine Masse mit gleichbleibender Dicke ist ein Rohr.
   * Gemessen wird die Breite des ersten gegen die des letzten Zuges.
   */
  it('laeuft von der Wurzel zur Spitze schmaler zu', () => {
    const { ctx, zuege } = notizblock();
    drawHaar(ctx, 'blocking', WURZELN, S, { kette: RUHIG });
    const breite = (z: { punkte: [number, number][] }) => {
      const k = kasten(z.punkte);
      return k.r - k.l;
    };
    expect(breite(zuege[0])).toBeGreaterThan(breite(zuege[zuege.length - 1]));
  });

  /**
   * Der Sturz steht nicht mehr hier.
   *
   * Bis zum 27.08.2026 hat der Zeichner die Masse mit der Fallhoehe selbst
   * hochgelegt — ein fester Versatz nach oben. Das ist jetzt eine KRAFT in
   * `haarkette.ts`: Auftrieb, der mit der Fallhoehe waechst. Geprueft wird es
   * darum in `ansicht.test.ts`, wo die Kette laeuft. Der Zeichner bekommt sie
   * fertig und rechnet nichts mehr daran.
   */

  /**
   * Die Masse schrumpft mit der Pose.
   *
   * `saving` schrumpft die Figur beim Entschweben auf die Haelfte, `dying`
   * staucht sie. Was in festen Pixeln daranhaengt, bliebe dabei stehen und
   * stuende zuletzt groesser da als die ganze Figur — genau so sah der erste
   * Lauf der alten Fassung aus.
   */
  it('schrumpft mit der Kopfachse der Pose', () => {
    const gross = alles({ kette: RUHIG, achse: 1.83 });
    const klein = alles({ kette: RUHIG, achse: 0.92 });
    const hoch = (p: [number, number][]) => Math.max(...p.map((q) => q[1]));
    expect(hoch(klein)).toBeLessThan(hoch(gross) * 0.75);
  });
});

