import { describe, expect, it } from 'vitest';
import { DEFAULT_MANIFEST } from '../src/render/atlas';
import type { AtlasManifest } from '../src/render/atlas';
import { WUSEL_H } from '../src/core/constants';
// Als Modul geladen, nicht über das Dateisystem: Das Projekt hat bewusst keine
// Node-Typen im Testpfad, und der Lader im Spiel holt das Blatt genauso.
import blatt from '../src/art/murmel.atlas.json';

/**
 * Das ausgelieferte Blatt gegen den Vertrag im Code.
 *
 * Zellmass, Bildzahlen und Schopfanker stehen an zwei Orten — im Code als
 * Vorgabe und im gebackenen Blatt als das, was tatsächlich herauskam. Läuft
 * eine Änderung durch, ohne dass jemand neu backt, zeichnet das Spiel mit dem
 * alten Blatt weiter und die Figuren sitzen verschoben. Das sieht man erst,
 * wenn man hinschaut — und dann meist zu spät.
 *
 * **Was sich mit der Murmel geändert hat.** Vorher stand hier „die Zelle misst
 * genau 28 × 28 logische Pixel". Das gilt nicht mehr, und zwar aus einem guten
 * Grund: Die logische Zellgrösse wird jetzt aus der **Figurenhöhe**
 * zurückgerechnet, damit der gezeichnete Körper genauso hoch ist wie der, mit
 * dem die Simulation rechnet. Eine feste Zahl wäre bei jedem neuen Modell
 * wieder falsch. Geprüft wird deshalb die Eigenschaft, um die es eigentlich
 * ging — nicht die Zahl, die sie einmal hatte.
 */
const sheet = blatt as unknown as AtlasManifest;

/** Anteil der Zellhöhe, den der Körper der Murmel füllt (0,861 von 1,22). */
const KOERPER_ANTEIL = 0.861 / 1.22;

describe('Ausgeliefertes Sprite-Blatt', () => {
  it('zeichnet die Figur so hoch, wie die Simulation sie rechnet', () => {
    // Der Kern der Sache. Wäre der Körper höher als `WUSEL_H`, ragte der Kopf
    // durch Decken, unter denen die Figur hindurchläuft, und stünde neben
    // Türen, durch die sie passt.
    const koerper = sheet.cell.h * KOERPER_ANTEIL;
    expect(koerper).toBeCloseTo(WUSEL_H, 1);
  });

  it('hält den Anker auf halber Zellbreite', () => {
    // Sonst braucht die Spiegelung im Renderer einen Versatzausgleich.
    expect(sheet.anchor.x * 2).toBeCloseTo(sheet.cell.w, 3);
  });

  it('setzt den Fusspunkt auf die Standlinie', () => {
    // Drei Bildpunkte über der Zellunterkante, in logische Pixel umgerechnet.
    const ppl = sheet.ppl ?? 1;
    expect(sheet.cell.h - sheet.anchor.y).toBeCloseTo(3 / ppl, 2);
  });

  it('bedient alle zwölf Zustände mit der vorgeschriebenen Bildzahl', () => {
    for (const [name, soll] of Object.entries(DEFAULT_MANIFEST.clips)) {
      const ist = sheet.clips[name];
      expect(ist, `Zustand ${name} fehlt im Blatt`).toBeDefined();
      expect(ist.row, `Zeile von ${name}`).toBe(soll.row);
      expect(ist.holds, `Haltedauern von ${name}`).toEqual(soll.holds);
      expect(!!ist.once, `Ablaufart von ${name}`).toBe(!!soll.once);
    }
  });

  it('vergibt jede Zeile genau einmal', () => {
    const reihen = Object.values(sheet.clips).map((c) => c.row);
    expect(new Set(reihen).size).toBe(reihen.length);
  });

  it('liefert zu jedem Einzelbild einen Schopfanker und einen Zustand', () => {
    // Ohne diese beiden Tabellen zeichnet der Renderer den Schopf gar nicht —
    // und zwar stillschweigend. Die Figur wäre dann ein Kiesel ohne Mimik und
    // ohne Berufsfarbe, und niemand bekäme einen Fehler zu sehen.
    for (const [name, clip] of Object.entries(sheet.clips)) {
      expect(clip.anchors, `Schopfanker von ${name}`).toBeDefined();
      expect(clip.tuff, `Schopfzustände von ${name}`).toBeDefined();
      expect(clip.anchors?.length, `Ankerzahl von ${name}`).toBe(clip.holds.length);
      expect(clip.tuff?.length, `Zustandszahl von ${name}`).toBe(clip.holds.length);
    }
  });

  it('hält jeden Schopfanker innerhalb der Zelle', () => {
    // Ein Anker ausserhalb hiesse: Der Schopf schwebt neben der Figur. Das
    // passiert genau dann, wenn Ankertabelle und Zellmass in verschiedenen
    // Einheiten rechnen — der wahrscheinlichste Fehler beim Neubacken.
    for (const [name, clip] of Object.entries(sheet.clips)) {
      for (const [i, a] of (clip.anchors ?? []).entries()) {
        expect(a[0], `${name} Bild ${i} waagerecht`).toBeGreaterThanOrEqual(0);
        expect(a[0], `${name} Bild ${i} waagerecht`).toBeLessThanOrEqual(sheet.cell.w);
        expect(a[1], `${name} Bild ${i} senkrecht`).toBeGreaterThanOrEqual(0);
        expect(a[1], `${name} Bild ${i} senkrecht`).toBeLessThanOrEqual(sheet.cell.h);
      }
    }
  });

  it('kennt nur Schopfzustände, die es gibt', () => {
    for (const [name, clip] of Object.entries(sheet.clips)) {
      for (const t of clip.tuff ?? []) {
        expect(t, `Schopfzustand in ${name}`).toBeGreaterThanOrEqual(0);
        expect(t, `Schopfzustand in ${name}`).toBeLessThanOrEqual(8);
      }
    }
  });
});
