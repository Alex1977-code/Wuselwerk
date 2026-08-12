import { describe, expect, it } from 'vitest';
import { State, type Wusel } from '../src/core/types';
import { blickVergessen, blickrichtung } from '../src/render/blick';

function figur(over: Partial<Wusel> = {}): Wusel {
  return {
    id: 1,
    x: 10,
    y: 20,
    dir: 1,
    state: State.WALKING,
    timer: 0,
    ...over,
  } as Wusel;
}

/**
 * Der Fall, für den es diese Datei gibt.
 *
 * Steht eine Figur in einem Schacht, dessen Wände höher sind als `MAX_STEP`,
 * läuft sie bei jedem Schritt gegen die eine Wand, dreht um, läuft gegen die
 * andere und dreht wieder — und `stepWalking` kommt alle drei Ticks dran. Die
 * Simulation ist im Recht: Eine eingesperrte Figur läuft auf und ab.
 *
 * Gezeichnet ist es eine Katastrophe. Das Blatt wird gespiegelt, und seit die
 * Figur auf allen vieren läuft, springt dabei ein dreizehn Pixel breiter Körper
 * von links nach rechts. Bei zwanzig Hertz ist das Flimmern, und in einer Grube
 * voller Figuren flimmert das halbe Bild.
 */
describe('Die gezeichnete Blickrichtung', () => {
  it('bleibt stehen, wenn sich die Figur nicht von der Stelle rührt', () => {
    blickVergessen();
    const w = figur();
    expect(blickrichtung(w)).toBe(1);
    // Zwanzig Umdrehungen auf der Stelle — genau der Schacht.
    for (let i = 0; i < 20; i++) {
      w.dir = (-w.dir) as -1 | 1;
      expect(blickrichtung(w), `nach ${i + 1} Umdrehungen`).toBe(1);
    }
  });

  it('folgt sofort, sobald die Figur einen Schritt getan hat', () => {
    blickVergessen();
    const w = figur();
    blickrichtung(w);
    w.dir = -1;
    // Der Schritt zurück ist die Aussage, nicht das Umdrehen selbst.
    expect(blickrichtung(w)).toBe(1);
    w.x -= 1;
    expect(blickrichtung(w)).toBe(-1);
  });

  it('folgt auch ohne Schritt, wenn die Figur ihren Zustand wechselt', () => {
    // Ein neuer Beruf richtet die Figur aus, auch wenn sie stehen bleibt —
    // sonst gräbt sie sichtbar in die falsche Richtung.
    blickVergessen();
    const w = figur();
    blickrichtung(w);
    w.dir = -1;
    w.state = State.DIGGING;
    expect(blickrichtung(w)).toBe(-1);
  });

  it('hält die Figuren auseinander', () => {
    blickVergessen();
    const a = figur({ id: 1, dir: 1 });
    const b = figur({ id: 2, dir: -1 });
    expect(blickrichtung(a)).toBe(1);
    expect(blickrichtung(b)).toBe(-1);
    a.dir = -1;
    expect(blickrichtung(a)).toBe(1);
    expect(blickrichtung(b)).toBe(-1);
  });

  it('vergisst beim Levelwechsel', () => {
    blickVergessen();
    const w = figur({ dir: 1 });
    blickrichtung(w);
    blickVergessen();
    // Neue Figur, dieselbe Nummer, andere Richtung: Sie erbt nichts.
    expect(blickrichtung(figur({ dir: -1 }))).toBe(-1);
  });
});
