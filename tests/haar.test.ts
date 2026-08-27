import { describe, expect, it } from 'vitest';
import wuselwerkerBlatt from '../src/art/wuselwerker.atlas.json';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import type { AtlasManifest } from '../src/render/atlas';

/**
 * Das Haar des Wuselwerkers — und zwar das gebackene, denn ein anderes gibt es
 * nicht mehr.
 *
 * ## Was hier zu Ende gegangen ist
 *
 * Bis zum 27.08.2026 hatte diese Figur zwei Frisuren: eine im Blatt und eine,
 * die der Zeichner zur Laufzeit danebenmalte, weil die gebackene kurz ist. Die
 * gemalte ist ausgebaut. Sie war ein Vollton neben einer aus einem 3D-Modell
 * gerenderten Figur, und das ist ein Unterschied, den man messen kann:
 * 6105 Toene und 142 Helligkeitsstufen im Blatt gegen 246 Toene und 9 Stufen
 * im Zeichner, wobei die 246 reine Kantenglaettung waren.
 *
 * Vier Anlaeufe haben versucht, diese Masse durch Form zu retten — Zacken,
 * Straehnen, Kranz, zuletzt eine Feder-Daempfer-Kette nach Celestes Bauart.
 * Alle vier sind an derselben Sache gescheitert: Nicht die Form war falsch,
 * sondern das Material.
 *
 * ## Was bleibt
 *
 * Das Blatt liefert das Haar allein, mit demselben Licht wie den Rest der
 * Figur, vom Koerper korrekt verdeckt und pro Einzelbild ueber den Knochen
 * `HaarSchwung` bewegt. Drei Dinge haelt dieser Lauf fest:
 *
 * 1. **Das Blatt traegt Haarwurzeln, wenn die Figur welche bestellt** — sie
 *    sind heute Messpunkte des Modells, nicht mehr Eingabe eines Zeichners.
 * 2. **Der Haarknochen schwingt** — sonst waere die Frisur ein Helm, der jede
 *    Pose unveraendert mitmacht.
 * 3. **Das gebackene Haar ist schattiert** — die Pruefung, die gefehlt hat.
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

/**
 * Das Haar muss SCHATTIERT sein — die Pruefung, die diesem Projekt gefehlt hat.
 *
 * ## Wofuer sie da ist
 *
 * Vom 26. bis zum 27.08.2026 hing an der Figur eine gezeichnete Haarmasse: eine
 * Kette ueberlappender Kreise, gefuellt mit EINEM Hexwert. Die Rueckmeldung
 * dazu lautete „das sieht aus als haette ein kleinkind mit einem stift einen
 * blauen strich gezogen", und sie war messbar richtig. Nebeneinandergestellt:
 *
 *     gebackener Schopf im Blatt   6105 Toene   Helligkeitsspanne 142 von 255
 *     gezeichnete Masse im Spiel    246 Toene   Spanne 9
 *
 * Die 246 waren ausschliesslich Kantenglaettung. Ein Sechzehntel des Tonumfangs
 * direkt neben einer aus einem 3D-Modell gebackenen Figur — das ist der
 * Fremdkoerper, und keine Formaenderung heilt ihn. Der Zeichner ist deshalb
 * ausgebaut; das Haar kommt nur noch aus dem Blatt, wo dasselbe Licht es
 * beleuchtet wie den Rest der Figur.
 *
 * ## Warum ueber den Messbericht und nicht ueber das Blatt
 *
 * Weil hier kein Bilddecoder laeuft. `scripts/haar-messen.mjs` misst das Blatt
 * im Browser und schreibt `art-src/wuselwerker/blatt-mess.json`. Dieser Lauf
 * liest den Bericht — und prueft ZUERST, ob er zum heutigen Blatt gehoert.
 *
 * Das ist keine Formalie, sondern die Luecke, durch die dieser ganze Fehler
 * gelaufen ist: Der Bericht trug schon immer die Pruefsumme des Blattes, aber
 * niemand hat sie je verglichen. Am 27.08.2026 stand darin `9ab1500b...`,
 * waehrend das Blatt seit drei Backlaeufen `0cf4fb68...` hiess. Jede Zahl, die
 * daraus zitiert wurde, war die eines Bildes, das es nicht mehr gab.
 */
describe('Das gebackene Haar traegt Schattierung, keinen Vollton', () => {
  const bericht = JSON.parse(
    readFileSync('art-src/wuselwerker/blatt-mess.json', 'utf8'),
  ) as {
    sha256: string;
    farben: { haarpunkteBlatt: number; haartoeneBlatt: number; haarVolltonAnteil: number };
  };

  /**
   * Zuerst: gehoert der Bericht ueberhaupt zu diesem Blatt?
   *
   * Ohne diese Zeile sind alle folgenden wertlos. Wer das Blatt neu backt, muss
   * `node scripts/haar-messen.mjs` nachziehen — sonst faellt hier auf, dass die
   * Messung von einem anderen Bild stammt.
   */
  it('ist am heutigen Blatt gemessen, nicht an einem alten', () => {
    const jetzt = createHash('sha256')
      .update(readFileSync('src/art/wuselwerker.webp'))
      .digest('hex');
    expect(
      bericht.sha256,
      'blatt-mess.json ist veraltet — node scripts/haar-messen.mjs neu laufen lassen',
    ).toBe(jetzt);
  });

  it('traegt tausende Haartoene', () => {
    const { haarpunkteBlatt, haartoeneBlatt } = bericht.farben;
    expect(haarpunkteBlatt, 'kaum Haar im Blatt').toBeGreaterThan(10000);
    // Gemessen am Blatt vom 27.08.2026: 53539 Punkte, 8433 Toene. Die Schranke
    // liegt mit reichlich Luft darunter — sie soll einen Rueckfall auf Vollton
    // fangen, nicht jede Neubackung zum Ereignis machen.
    expect(
      haartoeneBlatt,
      `nur ${haartoeneBlatt} Haartoene — das waere Vollton, keine Schattierung`,
    ).toBeGreaterThan(1000);
  });

  /**
   * Und kein einzelner Ton darf die Masse beherrschen.
   *
   * Die Tonzahl allein genuegt nicht: Eine flache Flaeche mit weichem Rand
   * haette auch tausend Toene, alle in der Kantenglaettung. Entscheidend ist,
   * dass kein Ton den Loewenanteil traegt. Gemessen deckt der haeufigste 0,49
   * Prozent der Haarflaeche.
   */
  it('wird von keinem einzelnen Ton beherrscht', () => {
    const anteil = bericht.farben.haarVolltonAnteil;
    expect(
      anteil,
      `haeufigster Ton deckt ${(anteil * 100).toFixed(2)} Prozent der Haarflaeche`,
    ).toBeLessThan(0.05);
  });
});
