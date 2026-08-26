import { describe, expect, it } from 'vitest';
import { paletteFor } from '../src/render/palette';
import type { ThemeId } from '../src/levels/types';

/**
 * Der Saum um die Figur — und warum er eine Zusage braucht.
 *
 * Der Befund kam aus einer Messung, nicht aus einem Eindruck: Das Haar der
 * Figur (#3851B6) steht in Rostwerk mit einem WCAG-Kontrast von **1,05** vor
 * dem Himmel und in der Kristallklamm mit **1,11**. Ein Kontrast von 1,0
 * bedeutet gleiche Helligkeit — die Figur ist dort nicht schwach zu sehen,
 * sondern gar nicht. Der gruene Koerper trifft es genauso; das ist also kein
 * Haarproblem, sondern eines der Figur vor ihrer Welt.
 *
 * Ein Farbwechsel waere die falsche Antwort gewesen: Er repariert eine Welt
 * und bezahlt sie mit sechs anderen. Ein Saum repariert alle auf einmal.
 *
 * Zwei Toene reichen: dunkel dort, wo der Hintergrund hell ist, hell in den
 * beiden nachtblauen Welten. Die Aufteilung ist gerechnet und nicht geraten —
 * ein dunkler Saum in der Kristallklamm brachte 1,27, also schlechter als
 * keiner.
 *
 * Dieser Test haelt die Rechnung fest. Wer eine Palette anfasst, faellt hier
 * durch, ehe eine Welt still unsichtbar wird.
 */

/**
 * Warum der Saum nicht durch schoenere Paletten zu ersetzen ist.
 *
 * Die naheliegende Frage kam am 25.08.2026: Wenn die Figur vor zwei
 * Hintergruenden verschwindet, warum aendert man dann nicht die beiden
 * Hintergruende? Sie ist berechtigt — und anders als ein Farbwechsel an der
 * FIGUR repariert sie die Welten einzeln, ohne die anderen zu bezahlen. Zwei
 * Paletten sind daraufhin auch wirklich geaendert worden (siehe unten).
 *
 * Sie loest das Problem aber nicht allgemein, und das ist gerechnet. Die
 * Figur hat drei Toene, und ihre Leuchtdichten liegen weit auseinander:
 *
 *   Haar   #3851B6   L 0,101
 *   Tunika #545d20   L 0,098
 *   Haut   #b6854c   L 0,272
 *
 * Jeder Ton sperrt ein Band von Hintergrund-Leuchtdichten, in dem er zu wenig
 * Kontrast hat. Die drei Baender ueberlappen und verschmelzen zu einem
 * einzigen breiten:
 *
 *   Zielkontrast 1,5   brauchbar ist L <= 0,049  oder  L >= 0,434
 *   Zielkontrast 1,8   brauchbar ist L <= 0,032  oder  L >= 0,530
 *
 * Ein Hintergrund muss also SEHR DUNKEL oder ZIEMLICH HELL sein; die ganze
 * Mitte ist gesperrt. Damit sind drei Sachen entschieden:
 *
 * 1. Ein Himmel ist ein Verlauf. Selbst wenn oben und unten beide sicher
 *    liegen, laeuft er dazwischen durch das Sperrband. Ganz ohne Saum geht
 *    es also nicht, solange die Figur einen Verlauf hinter sich hat.
 * 2. In welche Richtung eine Palette ausweicht, entscheidet der SAUM der
 *    Welt und nicht der kuerzere Weg. Rostwerks Himmel abzudunkeln haette
 *    ihn dem eigenen, fast schwarzen Saum entgegengeschoben — gemessen fiel
 *    dessen Kontrast dabei von 2,34 auf 1,71 und damit unter die Schranke.
 *    Aufgehellt statt abgedunkelt steht er bei 8,98.
 * 3. Die Kristallklamm durfte umgekehrt abdunkeln, weil ihr Saum hell ist.
 *
 * Gemessen, schlechtester Kontrast der drei Figurentoene:
 *
 *   RUST     skyTop   #4d4f5e -> #adb1d0    1,14 -> 1,55
 *   RUST     skyMid   #8a7f83 -> #c2b3b8    1,18 -> 1,62
 *   CRYSTAL  earth    #4a5788 -> #313a5d    1,00 -> 1,56
 *   CRYSTAL  pebble   #7c86ab -> #363b4e    1,10 -> 1,57
 *
 * Offen bleiben vier weitere Paare unter 1,3: Sonnenhang-Fels gegen die Haut
 * (1,20), Kristall-Fels gegen die Tunika (1,23), Rostwerk-Fels gegen die
 * Tunika (1,03) und Magma-Horizont gegen die Haut (1,15). Sie stehen hier,
 * damit sie nicht vergessen werden.
 */
const THEMEN: ThemeId[] = [
  'grass',
  'crystal',
  'rust',
  'frost',
  'magma',
  'sonnenhang',
  'wipfel',
] as ThemeId[];

/** Relative Leuchtdichte nach WCAG 2.1. */
function leuchte(hex: string): number {
  const h = hex.replace('#', '');
  const teile = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const linear = teile.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function kontrast(a: string, b: string): number {
  const la = leuchte(a);
  const lb = leuchte(b);
  const hell = Math.max(la, lb);
  const dunkel = Math.min(la, lb);
  return (hell + 0.05) / (dunkel + 0.05);
}

/** Die Farben, vor denen die Figur steht: Himmel in drei Stufen und Fels. */
function hintergruende(theme: ThemeId): string[] {
  const p = paletteFor(theme);
  const fels = `#${p.rock.toString(16).padStart(6, '0')}`;
  return [p.skyTop, p.skyMid, p.skyBottom, fels];
}

/** Das Erdreich — der Hintergrund, sobald eine Figur IM Boden arbeitet. */
function erde(theme: ThemeId): string {
  return `#${paletteFor(theme).earth.toString(16).padStart(6, '0')}`;
}

describe('Saum', () => {
  it('jede Welt hat einen', () => {
    for (const t of THEMEN) {
      expect(paletteFor(t).saum, t).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  /**
   * Die eigentliche Zusage. 1,8 ist bewusst niedriger angesetzt als die 3,0
   * der Schriftregeln: Ein Saum ist keine Schrift, er muss nicht gelesen,
   * sondern nur gesehen werden. Gemessen liegt die schlechteste Welt bei 2,34
   * — die Grenze hat also Luft, und wer sie reisst, hat wirklich etwas
   * kaputtgemacht.
   */
  it('hebt sich in jeder Welt vom Hintergrund ab', () => {
    for (const t of THEMEN) {
      const saum = paletteFor(t).saum;
      for (const bg of hintergruende(t)) {
        expect(kontrast(saum, bg), `${t}: Saum ${saum} vor ${bg}`).toBeGreaterThanOrEqual(1.8);
      }
    }
  });

  /**
   * Der Fall, den dieser Test bis zum Bau von Welt 7 uebersehen hat.
   *
   * Geprueft wurden Himmel und Fels — also der Hintergrund einer Figur, die
   * auf der Oberflaeche laeuft. Ein Wusel steckt aber die halbe Spielzeit IM
   * Boden: im Rammstollen, im Graeberschacht, in der Baggerschraege, in
   * jeder vorgeschnittenen Tuerkammer. Dort ist sein Hintergrund die ERDE,
   * und dort ist es am schlimmsten. Gemessen, Kontrast Haar gegen Erde:
   * Kristallklamm 1,00 — gleiche Helligkeit, die Figur ist rechnerisch nicht
   * da. Grasland 1,02, Wipfelweide 1,05, Rostwerk 1,09, Sonnenhang 1,11.
   * Sechs von sieben Welten liegen unter 1,3.
   *
   * Der Saum traegt das heute ueberall (2,60 bis 6,16; die schlechteste ist
   * die Wipfelweide). Die Schranke steht deshalb bei 2,2: Sie haelt den
   * Bestand mit Luft und faellt, sobald jemand eine Erde aufhellt, ohne den
   * Saum mitzudenken.
   */
  it('traegt auch im Erdreich, wo die Figur im Stollen steckt', () => {
    for (const t of THEMEN) {
      const saum = paletteFor(t).saum;
      expect(kontrast(saum, erde(t)), `${t}: Saum ${saum} vor Erde ${erde(t)}`).toBeGreaterThanOrEqual(2.2);
    }
  });

  /**
   * Und die Gegenprobe, die den Grund festhaelt: OHNE Saum ist es in zwei
   * Welten wirklich so schlimm. Faellt dieser Test eines Tages um, weil die
   * Paletten heller geworden sind, darf der Saum wieder zur Debatte stehen —
   * vorher nicht.
   */
  it('waere ohne ihn in Rostwerk und Kristallklamm unsichtbar', () => {
    const HAAR = '#3851B6';
    const schlimmste = (t: ThemeId) => Math.min(...hintergruende(t).map((b) => kontrast(HAAR, b)));
    expect(schlimmste('rust' as ThemeId)).toBeLessThan(1.2);
    expect(schlimmste('crystal' as ThemeId)).toBeLessThan(1.2);
  });
});
