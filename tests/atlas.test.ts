import { describe, expect, it } from 'vitest';
import { CELL_W, CELL_H, ANCHOR_X, ANCHOR_Y, DEFAULT_MANIFEST } from '../src/render/atlas';
import type { AtlasManifest } from '../src/render/atlas';
// Als Modul geladen, nicht über das Dateisystem: Das Projekt hat bewusst keine
// Node-Typen im Testpfad, und der Lader im Spiel holt das Blatt genauso.
import blatt from '../src/art/wusel.atlas.json';

/**
 * Das ausgelieferte Blatt gegen den Vertrag im Code.
 *
 * Der Grund für diese Prüfung: Zellmass und Bildzahlen stehen an zwei Orten —
 * in `atlas.ts` als Vorgabe und in `src/art/wusel.atlas.json` als das, was
 * tatsächlich gebacken wurde. Läuft eine Änderung am Zellmass durch, ohne dass
 * jemand `npm run atlas:backen` neu laufen lässt, zeichnet das Spiel mit dem
 * alten Blatt weiter und die Figuren sitzen verschoben. Das sieht man erst,
 * wenn man hinschaut — und dann meist zu spät.
 */
const sheet = blatt as unknown as AtlasManifest;

describe('Ausgeliefertes Sprite-Blatt', () => {
  it('hat das Zellmass aus dem Code', () => {
    expect(sheet.cell).toEqual({ w: CELL_W, h: CELL_H });
    expect(sheet.anchor).toEqual({ x: ANCHOR_X, y: ANCHOR_Y });
  });

  it('hält den Anker auf halber Zellbreite', () => {
    // Sonst braucht die Spiegelung im Renderer einen Versatzausgleich.
    expect(sheet.anchor.x * 2).toBe(sheet.cell.w);
  });

  it('bedient alle zwölf Zustände mit der vorgeschriebenen Bildzahl', () => {
    for (const [name, soll] of Object.entries(DEFAULT_MANIFEST.clips)) {
      const ist = sheet.clips[name];
      expect(ist, `Zustand ${name} fehlt im Blatt`).toBeDefined();
      expect(ist.row, `Zeile von ${name}`).toBe(soll.row);
      expect(ist.holds, `Haltedauern von ${name}`).toEqual(soll.holds);
    }
  });

  it('vergibt jede Zeile genau einmal', () => {
    const zeilen = Object.values(sheet.clips).map((c) => c.row);
    expect(new Set(zeilen).size).toBe(zeilen.length);
  });
});
