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
          expect(q[1], `${name} Bild ${i}: Wurzel zu tief`).toBeLessThan(g[1] + achse * 0.5);
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

describe('Der Straehnenzeichner', () => {
  const wurzeln: [number, number, number][] = [
    [0, -9, 1],
    [-1, -9, -1],
  ];

  it('zieht je Straehne zwei Zuege: erst den Saum, dann das Haar', () => {
    const { ctx, zuege } = notizblock();
    drawHaar(ctx, 'blocking', wurzeln, 4, { saum: '#0e1116' });
    expect(zuege.length).toBe(4);
    expect(zuege[0].farbe).toBe('#0e1116');
    expect(zuege[1].farbe).not.toBe('#0e1116');
  });

  it('laesst den Saum breiter ausfallen als das Haar — sonst traegt er nichts', () => {
    const { ctx, zuege } = notizblock();
    drawHaar(ctx, 'blocking', [wurzeln[0]], 4, { saum: '#0e1116' });
    const s = kasten(zuege[0].punkte);
    const h = kasten(zuege[1].punkte);
    expect(s.r - s.l).toBeGreaterThan(h.r - h.l);
    expect(s.u - s.o).toBeGreaterThan(h.u - h.o);
  });

  it('zeichnet ohne Saumton nur das Haar', () => {
    const { ctx, zuege } = notizblock();
    drawHaar(ctx, 'blocking', wurzeln, 4);
    expect(zuege.length).toBe(2);
  });

  /**
   * Die Aussenrichtung entscheidet die Seite — und zwar allein sie.
   *
   * Zwei Wurzeln an derselben Stelle, nur mit umgekehrtem Vorzeichen: Die eine
   * muss nach rechts ausschwingen, die andere nach links. Wer stattdessen die
   * Mitte der Wurzelreihe nimmt, faellt hier durch, denn die ist fuer beide
   * dieselbe.
   */
  it('schwingt nach der gebackenen Aussenrichtung aus, nicht nach der Reihenmitte', () => {
    const rechts = notizblock();
    drawHaar(rechts.ctx, 'blocking', [[0, -9, 1]], 4);
    const links = notizblock();
    drawHaar(links.ctx, 'blocking', [[0, -9, -1]], 4);
    expect(kasten(rechts.zuege[0].punkte).r).toBeGreaterThan(2);
    expect(kasten(links.zuege[0].punkte).l).toBeLessThan(-2);
  });

  /**
   * Beim Fallen bleibt das Haar oben stehen. Das ist der Witz der Figur und
   * zugleich die einzige Stelle, an der eine Straehne ueber ihre Wurzel
   * hinausragt.
   */
  it('laesst das Haar beim Fallen nach oben nachhaengen', () => {
    const stehen = notizblock();
    drawHaar(stehen.ctx, 'blocking', [[0, -9, 1]], 4);
    const fallen = notizblock();
    drawHaar(fallen.ctx, 'falling', [[0, -9, 1]], 4);
    expect(kasten(fallen.zuege[0].punkte).u).toBeLessThan(kasten(stehen.zuege[0].punkte).u);
  });

  /**
   * Nackenhaar faellt nach hinten — aber nur so weit, wie die Pose gedreht ist.
   *
   * Von vorn gesehen liegt es hinter dem Kopf und ist im Bild gar nicht
   * versetzt. Ohne diese Verkuerzung bekaeme der Blocker mit acht Grad
   * denselben Zopf wie der Gehende mit sechsundvierzig, und die Figur spraenge
   * beim Posenwechsel.
   */
  it('laesst eine Wurzel am Hinterkopf nur bei gedrehter Pose nach hinten fallen', () => {
    const frontal = notizblock();
    drawHaar(frontal.ctx, 'blocking', [[0, -9, 0]], 4, { dreh: 0 });
    const gedreht = notizblock();
    drawHaar(gedreht.ctx, 'blocking', [[0, -9, 0]], 4, { dreh: 46 });
    expect(kasten(gedreht.zuege[0].punkte).l).toBeLessThan(kasten(frontal.zuege[0].punkte).l - 2);
  });

  /**
   * Das Haar ist die Fallanzeige.
   *
   * Vorher galt je Pose ein fester Nachlauf, und ein Hopser vom Absatz sah
   * damit aus wie ein Sturz in den Tod. Die Auskunft liegt aber schon in der
   * Simulation: `fallDist` zaehlt die gefallenen Pixel. Zwischen SCHREI_AB —
   * dort faengt die Figur an zu schreien — und FALL_DEATH_PX richtet sich das
   * Haar auf, sodass Auge und Ohr dasselbe sagen.
   */
  it('richtet das Haar mit der Fallhoehe auf', () => {
    // Gemessen wird die SPITZE, nicht der Kasten von oben: Die Straehne haengt
    // nach unten, und ein Nachlauf nach oben zieht ihre Spitze herauf. Die
    // obere Kante sitzt an der Wurzel und bewegt sich fast gar nicht — der
    // erste Anlauf dieser Pruefung hat genau dort gemessen und 0,01 Pixel
    // Unterschied gefunden.
    const spitze = (sturz: number) => {
      const n = notizblock();
      drawHaar(n.ctx, 'falling', [[0, -9, 1]], 4, { sturz });
      return kasten(n.zuege[0].punkte).u;
    };
    const kurz = spitze(SCHREI_AB);
    const mittel = spitze((SCHREI_AB + FALL_DEATH_PX) / 2);
    const toedlich = spitze(FALL_DEATH_PX);
    // Kleineres y ist weiter oben.
    expect(mittel, 'halber Sturz hebt nicht').toBeLessThan(kurz);
    expect(toedlich, 'toedlicher Sturz hebt nicht weiter').toBeLessThan(mittel);
    // Und den Unterschied muss man sehen koennen: die Lesegrenze des Projekts
    // sind 0,9 logische Pixel, bei vier Bildpunkten je logischem Pixel also 3,6.
    expect(kurz - toedlich, 'Unterschied unter der Lesegrenze').toBeGreaterThan(3.6);
  });

  it('steigert das Haar nicht weiter, wenn der Sturz schon toedlich ist', () => {
    const spitze = (sturz: number) => {
      const n = notizblock();
      drawHaar(n.ctx, 'falling', [[0, -9, 1]], 4, { sturz });
      return kasten(n.zuege[0].punkte).u;
    };
    expect(spitze(FALL_DEATH_PX * 3)).toBeCloseTo(spitze(FALL_DEATH_PX), 5);
  });

  /**
   * Unter dem Schirm sinkt die Figur langsam und beliebig weit. Ein Haar, das
   * dabei mitwuechse, stuende nach zwei Sekunden senkrecht.
   */
  it('laesst das Schweben von der Fallhoehe unberuehrt', () => {
    const spitze = (sturz: number) => {
      const n = notizblock();
      drawHaar(n.ctx, 'floating', [[0, -9, 1]], 4, { sturz });
      return kasten(n.zuege[0].punkte).u;
    };
    expect(spitze(200)).toBeCloseTo(spitze(0), 5);
  });

  /**
   * Die beiden Anstoesse aus `ansicht.ts` legen sich auf den Nachlauf. Ihr
   * Vorzeichen kommt fertig von dort; der Zeichner sagt nur, wieviel Weg es
   * bedeutet.
   */
  it('laesst den Nachschlag das Haar durchsacken', () => {
    const tief = (prall: number) => {
      const n = notizblock();
      drawHaar(n.ctx, 'blocking', [[0, -9, 1]], 4, { prall });
      return kasten(n.zuege[0].punkte).u;
    };
    expect(tief(0.6), 'sackt nicht durch').toBeGreaterThan(tief(0));
    expect(tief(-0.6), 'federt nicht zurueck').toBeLessThan(tief(0));
    // Die Lesegrenze des Projekts sind 0,9 logische Pixel; bei vier
    // Bildpunkten je logischem Pixel also 3,6 Bildpunkte.
    expect(tief(0.6) - tief(0), 'Ausschlag unter der Lesegrenze').toBeGreaterThan(3.6);
  });

  it('laesst das Haar beim Umdrehen nach vorn schwingen', () => {
    const vorn = (wende: number) => {
      const n = notizblock();
      drawHaar(n.ctx, 'blocking', [[0, -9, 1]], 4, { wende });
      return kasten(n.zuege[0].punkte).r;
    };
    expect(vorn(0.7), 'schwingt nicht nach vorn').toBeGreaterThan(vorn(0));
    expect(vorn(0.7) - vorn(0), 'Ausschlag unter der Lesegrenze').toBeGreaterThan(3.6);
  });

  it('zeichnet nichts, wenn das Blatt keine Wurzeln kennt', () => {
    const { ctx, zuege } = notizblock();
    drawHaar(ctx, 'walking', [], 4, { saum: '#0e1116' });
    expect(zuege.length).toBe(0);
  });
});
