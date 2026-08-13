import { describe, expect, it } from 'vitest';
import { SKILLS, SKILL_KNOPF, SKILL_LABEL } from '../src/core/types';
import { NAME_BREITE, computeLayout } from '../src/render/layout';

/**
 * Die Berufsleiste.
 *
 * Diese Datei gibt es wegen eines einzigen Spieltest-Satzes: „die Grafiken der
 * Berufsleiste sind leider nicht selbsterklaerend." Die Ursache war messbar —
 * acht Knoepfe nebeneinander sind auf einem 390 Punkte breiten Telefon
 * fuenfunddreissig Punkte breit, und der Zeichner schreibt den Berufsnamen
 * erst ab `NAME_BREITE`. Die Bedingung war also nie erfuellt, seit es die
 * Leiste gibt, und niemand hat es gemerkt, weil kein Mass sie geprueft hat.
 *
 * Genau das tut diese Datei jetzt. Sie prueft nicht, wie die Knoepfe aussehen
 * — das entscheidet das Auge —, sondern die eine Zusage, ohne die kein
 * Aussehen hilft: **Auf jedem Geraet, das jemand in die Hand nimmt, traegt
 * jeder Knopf seinen Namen.**
 */

/** Geraetemasse, die wirklich vorkommen — klein, mittel, gross, Tablet. */
const GERAETE: [string, number, number][] = [
  ['iPhone SE', 320, 568],
  ['iPhone 8', 375, 667],
  ['iPhone 14', 390, 844],
  ['Pixel 7', 412, 915],
  ['iPhone 14 Pro Max', 430, 932],
  ['iPad hoch', 768, 1024],
];

describe('Berufsleiste', () => {
  it('gibt jedem Knopf genug Breite fuer den Namen — hoch wie quer', () => {
    for (const [name, w, h] of GERAETE) {
      for (const [b, hh] of [
        [w, h],
        [h, w],
      ]) {
        const L = computeLayout(b, hh);
        for (const k of L.skillButtons) {
          expect(k.w, `${name} ${b}x${hh}: ${k.id}`).toBeGreaterThanOrEqual(NAME_BREITE);
        }
      }
    }
  });

  it('legt keine zwei Knoepfe uebereinander', () => {
    for (const [name, w, h] of GERAETE) {
      const L = computeLayout(w, h);
      for (let i = 0; i < L.skillButtons.length; i++) {
        for (let j = i + 1; j < L.skillButtons.length; j++) {
          const a = L.skillButtons[i];
          const b = L.skillButtons[j];
          const ueber =
            a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
          expect(ueber, `${name}: ${a.id} und ${b.id}`).toBe(false);
        }
      }
    }
  });

  /**
   * Der Schieber steht links neben den Knoepfen und ist so hoch wie der ganze
   * Block. Faengt er tiefer an oder hoert er frueher auf, sieht die Leiste
   * gekippt aus — und der Griff waere kleiner als der Daumen.
   */
  it('spannt den Ratenschieber ueber den ganzen Knopfblock', () => {
    for (const [name, w, h] of GERAETE) {
      const L = computeLayout(w, h);
      const oben = Math.min(...L.skillButtons.map((b) => b.y));
      const unten = Math.max(...L.skillButtons.map((b) => b.y + b.h));
      expect(L.rateSlider.y, `${name} oben`).toBeCloseTo(oben, 0);
      expect(L.rateSlider.y + L.rateSlider.h, `${name} unten`).toBeCloseTo(unten, 0);
      expect(L.rateSlider.x + L.rateSlider.w, `${name}`).toBeLessThan(
        Math.min(...L.skillButtons.map((b) => b.x)),
      );
    }
  });

  it('haelt alle Knoepfe innerhalb der Steuerleiste', () => {
    for (const [name, w, h] of GERAETE) {
      const L = computeLayout(w, h);
      for (const b of L.skillButtons) {
        expect(b.y, `${name}: ${b.id} oben`).toBeGreaterThanOrEqual(L.controls.y);
        expect(b.y + b.h, `${name}: ${b.id} unten`).toBeLessThanOrEqual(
          L.controls.y + L.controls.h,
        );
        expect(b.x + b.w, `${name}: ${b.id} rechts`).toBeLessThanOrEqual(L.cssW);
      }
    }
  });

  /**
   * Das Spielfeld darf ueber dem Umbau nicht verhungern. Zwei Reihen kosten
   * rund vierzig Punkte Hoehe — das ist der Preis, und er hat eine Grenze:
   * Bleibt weniger als die Haelfte des Bildschirms fuer das Spiel, ist der
   * Handel schlecht.
   */
  it('laesst dem Spielfeld mehr als die halbe Hoehe', () => {
    for (const [name, w, h] of GERAETE) {
      const L = computeLayout(w, h);
      expect(L.play.h / h, `${name}`).toBeGreaterThan(0.5);
    }
  });

  /**
   * Keine Knopfbeschriftung darf so lang sein, dass sie selbst auf dem
   * kleinsten Geraet gestaucht werden muss. Der Zeichner staucht zwar (lieber
   * gestaucht als fehlend), aber ein Wort, das das ueberall braucht, ist zu
   * lang gewaehlt und gehoert gekuerzt — nicht gequetscht.
   *
   * Grobmass statt echter Textmessung, weil in der Testumgebung kein Canvas
   * misst: In 600er system-ui ist ein Zeichen im Mittel rund 0,52 mal der
   * Schriftgroesse breit. Bei neuneinhalb Punkt sind das 4,95 je Zeichen.
   */
  it('haelt die Knopfbeschriftungen kurz genug fuer den kleinsten Knopf', () => {
    const breit = (s: string) => s.length * 4.95;
    const L = computeLayout(320, 568);
    const platz = L.skillButtons[0].w - 8;
    for (const id of SKILLS) {
      expect(breit(SKILL_KNOPF[id]), `${id}: „${SKILL_KNOPF[id]}"`).toBeLessThanOrEqual(platz);
    }
  });

  /**
   * Jede Kurzform muss die Wurzel des vollen Namens sein. Daran haengt, dass
   * die Hinweiszeile („Schirmspringer") und der Knopf („Schirm") als DASSELBE
   * gelesen werden und nicht als zwei Werkzeuge.
   */
  it('leitet jede Kurzform aus dem vollen Namen ab', () => {
    for (const id of SKILLS) {
      const kurz = SKILL_KNOPF[id].toLowerCase();
      const voll = SKILL_LABEL[id].toLowerCase();
      // Gemeinsamer Wortanfang von mindestens fuenf Zeichen.
      let gleich = 0;
      while (gleich < kurz.length && kurz[gleich] === voll[gleich]) gleich++;
      expect(gleich, `${id}: „${SKILL_KNOPF[id]}" vs „${SKILL_LABEL[id]}"`).toBeGreaterThanOrEqual(5);
    }
  });
});
