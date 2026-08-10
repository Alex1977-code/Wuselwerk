import { describe, expect, it } from 'vitest';
import { State } from '../src/core/types';
import { fanPick, fanSlots, findCandidates, needsFan, PICK_RADIUS } from '../src/input/targeting';
import { place, testWorld } from './helpers';

/** Zielpunkt liegt auf Koerpermitte, also 6 px ueber den Fuessen. */
const centerY = (feetY: number) => feetY - 6;

describe('Intelligentes Zielen (GDD §3.3)', () => {
  it('findet die nächste Figur im Fangradius', () => {
    const w = testWorld();
    const a = place(w, 50, 79);
    const b = place(w, 70, 79);
    const c = findCandidates(w, 'digger', 54, centerY(79));
    expect(c.map((x) => x.w.id)).toEqual([a.id, b.id]);
    expect(c[0].dist).toBeLessThan(c[1].dist);
  });

  it('ignoriert alles ausserhalb des Radius', () => {
    const w = testWorld();
    place(w, 50, 79);
    expect(findCandidates(w, 'digger', 50 + PICK_RADIUS + 5, centerY(79))).toHaveLength(0);
  });

  it('bietet den Kletterer nicht an, wer schon klettert', () => {
    const w = testWorld();
    const a = place(w, 50, 79);
    const b = place(w, 56, 79);
    w.assign(a.id, 'climber');
    const c = findCandidates(w, 'climber', 52, centerY(79));
    expect(c.map((x) => x.w.id)).toEqual([b.id]);
  });

  it('setzt keinen zweiten Blocker auf denselben Blocker', () => {
    const w = testWorld();
    const a = place(w, 50, 79);
    w.assign(a.id, 'blocker');
    expect(findCandidates(w, 'blocker', 50, centerY(79))).toHaveLength(0);
    // Der Sprengmeister greift dagegen weiterhin.
    expect(findCandidates(w, 'bomber', 50, centerY(79))).toHaveLength(1);
  });

  it('bietet nichts an, wenn das Kontingent leer ist', () => {
    const w = testWorld();
    place(w, 50, 79);
    w.skills.digger = 0;
    expect(findCandidates(w, 'digger', 50, centerY(79))).toHaveLength(0);
  });

  it('bietet tote Figuren nicht mehr an', () => {
    const w = testWorld();
    const a = place(w, 50, 79);
    const b = place(w, 54, 79);
    a.state = State.DYING;
    const c = findCandidates(w, 'digger', 52, centerY(79));
    expect(c.map((x) => x.w.id)).toEqual([b.id]);
  });
});

describe('Auswahl-Fächer', () => {
  it('greift, wenn zwei Kandidaten dicht beieinander stehen', () => {
    const w = testWorld();
    place(w, 50, 79);
    place(w, 54, 79);
    expect(needsFan(findCandidates(w, 'digger', 52, centerY(79)))).toBe(true);
  });

  it('greift nicht bei einem klaren Treffer', () => {
    const w = testWorld();
    place(w, 50, 79);
    place(w, 74, 79);
    expect(needsFan(findCandidates(w, 'digger', 50, centerY(79)))).toBe(false);
  });

  it('greift nie bei nur einem Kandidaten', () => {
    const w = testWorld();
    place(w, 50, 79);
    expect(needsFan(findCandidates(w, 'digger', 50, centerY(79)))).toBe(false);
  });

  it('legt die Plätze auf einem Bogen oberhalb des Daumens ab', () => {
    const slots = fanSlots(3);
    expect(slots).toHaveLength(3);
    for (const s of slots) expect(s.dy).toBeLessThan(0);
    expect(slots[0].dx).toBeLessThan(slots[1].dx);
    expect(slots[1].dx).toBeLessThan(slots[2].dx);
  });

  it('wählt ohne Zugbewegung den nächsten Kandidaten', () => {
    expect(fanPick(0, 0, 3)).toBe(0);
    expect(fanPick(4, -6, 3)).toBe(0);
  });

  it('wählt nach Zugrichtung', () => {
    expect(fanPick(-60, -60, 3)).toBe(0);
    expect(fanPick(0, -60, 3)).toBe(1);
    expect(fanPick(60, -60, 3)).toBe(2);
  });
});
