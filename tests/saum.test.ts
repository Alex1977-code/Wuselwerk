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

/**
 * Alles, wovor eine Figur stehen kann — nicht nur Himmel und Fels.
 *
 * `hintergruende` oben nennt vier Farben und ist damit die Liste fuer die
 * SAUM-Schranken, die auf genau diese vier geeicht sind. Fuer die Frage, ob
 * die Figur ohne Saum auskaeme, reicht das nicht: Sie steht die halbe
 * Spielzeit vor Erde, tiefer Erde, Kies und Grasnarbe.
 */
function alleHintergruende(theme: ThemeId): string[] {
  const p = paletteFor(theme);
  const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;
  return [
    p.skyTop,
    p.skyMid,
    p.skyBottom,
    hex(p.earth),
    hex(p.earthDeep),
    hex(p.pebble),
    hex(p.rock),
    hex(p.crust),
    hex(p.crustDark),
  ];
}

describe('Saum', () => {
  /**
   * Es gibt keinen mehr — und zwar auf Ansage.
   *
   * Der Saum war ein gerechnetes Mittel gegen ein gemessenes Problem, und die
   * Rechnung stimmt weiter: Ohne ihn liegt der schlechteste Fall JEDER Welt
   * zwischen 1,00 und 1,09, also bei „rechnerisch nicht vorhanden". Das steht
   * unten in der Gegenprobe und bleibt dort stehen, damit die Zahl nicht
   * verlorengeht.
   *
   * Der Auftraggeber hat ihn trotzdem dreimal abgelehnt — zuletzt: „wenn ich
   * sag ich möchte keinen saum dann ist da gefälligst auch kein saum." Das ist
   * eine Entwurfsentscheidung und keine Messfrage; Sichtbarkeit ist nicht der
   * einzige Wert, und ein Umriss, der bei jedem Blick stoert, kostet auch
   * etwas. Also ist er weg.
   *
   * Diese Pruefung haelt die Entscheidung fest, damit er nicht still
   * zurueckkommt — durch eine neue Welt, die eine Farbe aus einer alten kopiert,
   * oder durch einen spaeteren Griff, der es gut meint.
   *
   * Was stattdessen traegt, ist die Palette. Zehn Hintergrundfarben sind am
   * 25.08.2026 aus dem Sperrband der Figur geschoben worden (Rostwerks Himmel
   * und Fels, Kristallklamms Erde und Fels, Sonnenhangs Fels, Schlots
   * Horizont); einunddreissig von dreiundsechzig liegen noch darunter. Wer die
   * Figur besser sehen will, arbeitet dort weiter und nicht am Saum.
   */
  it('ist abgeschafft und kommt nicht still zurueck', () => {
    for (const t of THEMEN) {
      expect(paletteFor(t).saum, `${t}: Saum wieder da`).toBe('');
    }
  });

  /**
   * Die Gegenprobe — sie misst jetzt den PREIS und nicht mehr die Notwendigkeit.
   *
   * Gemessen ueber alle drei Figurentoene (Haar #3851B6, Tunika #545d20, Haut
   * #b6854c) und alle neun Hintergrundfarben je Welt:
   *
   *   GRASS       Haar vor Erde              1,02
   *   SONNENHANG  Haar vor dunkler Narbe     1,03
   *   WIPFEL      Tunika vor Erde            1,03
   *   CRYSTAL     Haut vor Horizont          1,00
   *   RUST        Haar vor Erde              1,09
   *   FROST       Tunika vor tiefer Erde     1,03
   *   MAGMA       Haar vor Narbe             1,03
   *
   * Solange diese Pruefung durchgeht, gibt es in jeder Welt eine Stelle, an
   * der die Figur rechnerisch verschwindet. Sie ist absichtlich so herum
   * geschrieben: Wenn sie eines Tages FEHLSCHLAEGT, weil alle Paletten weit
   * genug geschoben wurden, ist das Ziel erreicht — dann darf sie umgedreht
   * werden in „jede Welt traegt die Figur ueberall".
   */
  it('kostet in jeder Welt eine Stelle, an der die Figur verschwindet', () => {
    const FIGUR = ['#3851B6', '#545d20', '#b6854c'];
    for (const t of THEMEN) {
      const schlimmste = Math.min(
        ...alleHintergruende(t).flatMap((b) => FIGUR.map((f) => kontrast(f, b))),
      );
      expect(schlimmste, `${t}: schlechtestes Paar ${schlimmste.toFixed(2)}`).toBeLessThan(1.2);
    }
  });

  /**
   * Und die Buchhaltung dazu: wieviele Hintergrundfarben noch im Sperrband
   * liegen. Die Zahl darf fallen, aber nicht steigen — wer eine Palette
   * anfasst, soll die Figur nicht nebenbei tiefer hineinschieben.
   */
  it('haelt die Zahl der Farben im Sperrband der Figur bei hoechstens 31', () => {
    const FIGUR = ['#3851B6', '#545d20', '#b6854c'];
    let drin = 0;
    for (const t of THEMEN) {
      for (const b of alleHintergruende(t)) {
        if (Math.min(...FIGUR.map((f) => kontrast(f, b))) < 1.5) drin++;
      }
    }
    expect(drin, `${drin} von 63 Hintergrundfarben im Sperrband`).toBeLessThanOrEqual(31);
  });
});
