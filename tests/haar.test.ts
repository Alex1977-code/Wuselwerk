import { describe, expect, it } from 'vitest';
import { drawHaar } from '../src/render/haar';
import wuselwerkerBlatt from '../src/art/wuselwerker.atlas.json';
import { FALL_DEATH_PX, SCHREI_AB } from '../src/core/constants';
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
  /** Eine Kette, die senkrecht herunterhaengt. */
  const RUHIG: [number, number][] = [
    [0, 2.1],
    [0, 4.2],
    [0, 6.3],
  ];
  const S = 4;

  /** Alle gezeichneten Punkte eines Laufs. */
  function alles(lage: Parameters<typeof drawHaar>[4], pose = 'blocking') {
    const { ctx, zuege } = notizblock();
    drawHaar(ctx, pose, WURZELN, S, lage);
    return zuege.flatMap((z) => z.punkte);
  }

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
   * Im Sturz richtet sich die Masse auf, und zwar mit der Fallhoehe.
   *
   * Die beiden Marken sind dieselben, die der Ton benutzt: Bei SCHREI_AB faengt
   * die Figur an zu schreien, bei FALL_DEATH_PX ist es vorbei. Damit sagen Auge
   * und Ohr dasselbe, und der Spieler sieht einem Sturz an, ob er noch gut
   * ausgeht — eine Auskunft, die er sonst nur hoeren koennte.
   */
  it('richtet die Masse mit der Fallhoehe auf', () => {
    const tief = (h: number) =>
      Math.max(...alles({ kette: RUHIG, sturz: h }, 'falling').map((q) => q[1]));
    const knapp = tief(SCHREI_AB + 1);
    const weit = tief(FALL_DEATH_PX - 1);
    expect(weit).toBeLessThan(knapp - S * 0.5);
  });

  it('steigert die Masse nicht weiter, wenn der Sturz schon toedlich ist', () => {
    const tief = (h: number) =>
      Math.max(...alles({ kette: RUHIG, sturz: h }, 'falling').map((q) => q[1]));
    expect(tief(FALL_DEATH_PX * 3)).toBeCloseTo(tief(FALL_DEATH_PX), 3);
  });

  /**
   * Und das Schweben bleibt davon unberuehrt.
   *
   * Unter dem Schirm sinkt die Figur langsam und beliebig weit; ein Haar, das
   * dabei mitwuechse, stuende nach zwei Sekunden senkrecht nach oben.
   */
  it('laesst das Schweben von der Fallhoehe unberuehrt', () => {
    const tief = (h: number) =>
      Math.max(...alles({ kette: RUHIG, sturz: h }, 'floating').map((q) => q[1]));
    expect(tief(2)).toBeCloseTo(tief(FALL_DEATH_PX), 3);
  });

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

