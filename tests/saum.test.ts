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
