import { describe, expect, it } from 'vitest';
import { Terrain } from '../src/core/terrain';
import { MAT } from '../src/core/types';

describe('Terrainmaske', () => {
  it('behandelt seitliche Levelränder wie Stahl, oben und unten wie Luft', () => {
    const t = new Terrain(64, 64);
    expect(t.matAt(-1, 10)).toBe(MAT.STEEL);
    expect(t.matAt(64, 10)).toBe(MAT.STEEL);
    expect(t.solid(-1, 10)).toBe(true);
    expect(t.solid(10, -1)).toBe(false);
    expect(t.solid(10, 64)).toBe(false);
  });

  it('gräbt Erde weg, lässt Stahl stehen', () => {
    const t = new Terrain(64, 64);
    t.fillRect(0, 32, 64, 32, MAT.EARTH);
    t.fillRect(20, 32, 10, 4, MAT.STEEL);

    expect(t.clearPixel(5, 40)).toBe(true);
    expect(t.solid(5, 40)).toBe(false);

    expect(t.clearPixel(22, 33)).toBe(false);
    expect(t.matAt(22, 33)).toBe(MAT.STEEL);
  });

  it('meldet Stahl im Zielbereich, damit Grabungen stoppen', () => {
    const t = new Terrain(64, 64);
    t.fillRect(0, 32, 64, 32, MAT.EARTH);
    t.fillRect(20, 40, 8, 2, MAT.STEEL);

    expect(t.hasSteel(18, 39, 12, 4)).toBe(true);
    expect(t.hasSteel(0, 39, 12, 4)).toBe(false);
    // Der Levelrand zählt als Stahl.
    expect(t.hasSteel(-2, 39, 2, 4)).toBe(true);
  });

  it('markiert frische Bruchkanten neben dem Krater', () => {
    const t = new Terrain(64, 64);
    t.fillRect(0, 32, 64, 32, MAT.EARTH);
    t.clearCircle(32, 40, 5);
    expect(t.isFresh(32, 46)).toBe(true);
    expect(t.isFresh(2, 60)).toBe(false);
  });

  it('führt einen Dirty-Rect über alle Änderungen', () => {
    const t = new Terrain(64, 64);
    t.consumeDirty();
    t.fillRect(10, 10, 4, 4, MAT.EARTH);
    t.fillRect(30, 20, 2, 2, MAT.EARTH);
    const d = t.consumeDirty();
    expect(d).toEqual({ x: 10, y: 10, w: 22, h: 12 });
    expect(t.consumeDirty()).toBeNull();
  });

  it('lässt sich verlustfrei klonen — Grundlage für den Zeitrücklauf', () => {
    const t = new Terrain(32, 32);
    t.fillRect(0, 16, 32, 16, MAT.EARTH);
    t.clearCircle(16, 20, 4);
    const c = t.clone();
    expect(Array.from(c.mat)).toEqual(Array.from(t.mat));
    c.clearCircle(4, 20, 3);
    expect(Array.from(c.mat)).not.toEqual(Array.from(t.mat));
  });
});
