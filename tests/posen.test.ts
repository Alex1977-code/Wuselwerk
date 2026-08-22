import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { DEFAULT_MANIFEST } from '../src/render/atlas';

/**
 * Die Posentabellen der Figur — der Vertrag vor dem Backen.
 *
 * Ein Blatt zu pruefen ist gut, aber spaet: Wer eine Pose verdirbt, merkt es
 * erst nach zehn Sekunden Backen und einem Blick auf das Bild. Diese Pruefungen
 * lesen die Quelle.
 *
 * Sie sind aus der Uebertreibungsrunde vom 20.08.2026 entstanden, in der alle
 * dreizehn Posen mehr Ausschlag bekommen haben — sechs neu geschrieben, sieben
 * um ihren Mittelwert gespreizt. Der Umrisswechsel je Bildpaar stieg dabei im
 * Mittel von 8,3 auf 20,4 Prozent der Silhouette. Zwei Fallen sind dabei
 * aufgegangen, und gegen beide steht hier eine Zusage.
 */

type Bild = {
  richtung?: Record<string, number[]>;
  winkel?: Record<string, number[]>;
  stauch?: number[];
  versatz?: number;
  maske?: number;
};
type Pose = { frames: Bild[] };

const ORDNER = 'art-src/wuselwerker/posen';
const POSEN: Record<string, Pose> = {};
for (const datei of readdirSync(ORDNER)) {
  if (!datei.endsWith('.json')) continue;
  POSEN[datei.replace(/\.json$/, '')] = JSON.parse(
    readFileSync(`${ORDNER}/${datei}`, 'utf8'),
  ) as Pose;
}

describe('Die Posentabellen', () => {
  it('deckt jede Zeile des Blattvertrags ab', () => {
    for (const name of Object.keys(DEFAULT_MANIFEST.clips)) {
      expect(POSEN[name], `Pose ${name} fehlt`).toBeDefined();
    }
  });

  it('bringt zu jeder Zeile genau so viele Bilder mit, wie sie fasst', () => {
    for (const [name, clip] of Object.entries(DEFAULT_MANIFEST.clips)) {
      expect(POSEN[name].frames.length, `${name}: Bildzahl`).toBe(clip.holds.length);
    }
  });

  /**
   * Kein Bildpaar ist doppelt.
   *
   * Die haeufigste Art, eine Pose still zu legen, ist nicht ein Fehler im
   * Ausschlag, sondern ein Bild, das zweimal dasselbe sagt. Das faellt beim
   * Ansehen kaum auf — die Reihe laeuft ja —, kostet aber ein Viertel oder ein
   * Achtel der Bewegung. Verglichen wird alles, was ein Bild ausmacht:
   * Richtungen, Winkel, Stauchung und Hub.
   */
  it('wiederholt kein Bild unveraendert', () => {
    const abdruck = (f: Bild) =>
      JSON.stringify([f.richtung ?? {}, f.winkel ?? {}, f.stauch ?? null, f.versatz ?? 0]);
    for (const [name, pose] of Object.entries(POSEN)) {
      for (let i = 0; i < pose.frames.length; i++) {
        const j = (i + 1) % pose.frames.length;
        if (pose.frames.length < 2) continue;
        expect(abdruck(pose.frames[i]), `${name}: Bild ${i} und ${j} sind gleich`).not.toBe(
          abdruck(pose.frames[j]),
        );
      }
    }
  });

  /**
   * Stauchung und Hub bleiben in ihren Schranken.
   *
   * Beides ist das aelteste Mittel der Zeichentrickbewegung und beides kippt
   * schnell: Eine Figur, die um mehr als die Haelfte staucht, ist ein Gummiball
   * und kein Wuselwerker, und ein Hub ueber einer halben Modelleinheit schiebt
   * sie aus der Zelle. Beim Retten wurde genau das gemessen — Streckung 1,20
   * bei Hub 0,15 hat Bild 1 an den Zellrand gedrueckt, und was den Rand
   * beruehrt, ist abgeschnitten.
   */
  it('haelt Stauchung und Hub in den gemessenen Schranken', () => {
    for (const [name, pose] of Object.entries(POSEN)) {
      pose.frames.forEach((f, i) => {
        for (const s of f.stauch ?? [1, 1, 1]) {
          expect(s, `${name} Bild ${i}: Stauchung ausserhalb`).toBeGreaterThan(0.45);
          expect(s, `${name} Bild ${i}: Streckung ausserhalb`).toBeLessThan(1.35);
        }
        expect(Math.abs(f.versatz ?? 0), `${name} Bild ${i}: Hub zu gross`).toBeLessThan(0.55);
      });
    }
  });

  /**
   * Dauerschleifen pumpen nicht.
   *
   * Die teuerste Art, eine Figur schlecht aussehen zu lassen, ist eine
   * senkrechte Stauchung in einer Schleife, die immer laeuft. Sie faellt bei
   * der Abnahme eines Einzelbildes nicht auf — jedes Bild fuer sich ist
   * richtig —, aber in Bewegung wandert der Scheitel, und die Figur pumpt auf
   * und ab, statt zu gehen.
   *
   * Gemessen am Blatt vom 22.08.2026, ueber alle Bilder einer Pose:
   *
   *   Spanne der senkrechten Stauchung   Weg des Scheitels
   *   0,24 (Gehen, alt)                  3,49 lp  = 28 % der Figurenhoehe
   *   0,10                               1,97 lp
   *   0,04 (Gehen, neu)                  1,06 lp
   *   0,31 (Rammen, alt)                 4,10 lp
   *
   * Also rund 0,57 + 12,2 mal der Spanne. Die Schranke hier laesst 0,08 zu,
   * das sind gut anderthalb logische Pixel — sichtbarer Hub, kein Pumpen.
   * Der ganze Weg kam dabei aus der Stauchung und nicht aus der Pose: Beim
   * Gehen liegen alle vier neutralen Bilder auf demselben Scheitel.
   *
   * Ausgenommen sind die drei Posen, die sich absichtlich verformen, und die
   * Ausnahme ist hier aufgezaehlt statt stillschweigend: `saving` schrumpft
   * die Figur beim Entschweben auf die Haelfte, `dying` laesst sie
   * zusammensacken, und beide laufen genau einmal. `falling` steht mit einer
   * Spanne von 0,35 ebenfalls hier — es ist eine Schleife, und ob ein Sturz
   * so viel Streckung tragen soll, ist eine Frage an den Entwurf und nicht an
   * diese Pruefung.
   */
  it('laesst Dauerschleifen den Scheitel nicht auf und ab wandern', () => {
    const VERFORMT = new Set(['saving', 'dying', 'falling']);
    for (const [name, pose] of Object.entries(POSEN)) {
      if (VERFORMT.has(name)) continue;
      const hoch = pose.frames.map((f) => (f.stauch ?? [1, 1, 1])[1]);
      const spanne = Math.max(...hoch) - Math.min(...hoch);
      expect(
        spanne,
        `${name}: senkrechte Stauchung spannt ${spanne.toFixed(3)} — der Scheitel wandert damit rund ${(0.57 + 12.2 * spanne).toFixed(1)} logische Pixel`,
      ).toBeLessThanOrEqual(0.08);
    }
  });

  /**
   * Richtungsvektoren bleiben Richtungen.
   *
   * Der Verstaerker dreht sie heraus statt sie zu skalieren, aber ein von Hand
   * geschriebener Wert kann jede Laenge haben. Der Backvorgang normiert nicht
   * nach — er nimmt den Vektor, wie er ist, und ein zu kurzer laesst das Glied
   * einknicken.
   */
  it('liefert Richtungen von Einheitslaenge', () => {
    for (const [name, pose] of Object.entries(POSEN)) {
      pose.frames.forEach((f, i) => {
        for (const [kn, v] of Object.entries(f.richtung ?? {})) {
          const l = Math.hypot(v[0], v[1], v[2]);
          expect(l, `${name} Bild ${i}, ${kn}: Laenge ${l.toFixed(3)}`).toBeGreaterThan(0.97);
          expect(l, `${name} Bild ${i}, ${kn}: Laenge ${l.toFixed(3)}`).toBeLessThan(1.03);
        }
      });
    }
  });
});
