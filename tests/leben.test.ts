import { describe, expect, it } from 'vitest';
import {
  FREI_SEKUNDEN,
  LEBEN_PRO_TAG,
  VIDEOS_PRO_TAG,
  abziehen,
  frischerStand,
  heuteTag,
  tagesWechsel,
  videoEinloesen,
} from '../src/leben';

/**
 * Die Lebensregeln sind reine Funktionen (src/leben.ts) — hier werden sie
 * ohne Browser nachgerechnet. Die Zahlen kommen aus der
 * Marketing-Untersuchung (docs/leben-entwurf.md) und sind Vertrag: Wer sie
 * aendert, aendert das Spielgefuehl und soll hier daran erinnert werden.
 */
describe('Leben und Versuche', () => {
  it('startet den Tag mit fünf Leben und ohne Videos', () => {
    const s = frischerStand('2026-08-12');
    expect(s.uebrig).toBe(5);
    expect(LEBEN_PRO_TAG).toBe(5);
    expect(s.videos).toBe(0);
  });

  it('füllt um Mitternacht auf und lässt denselben Tag unangetastet', () => {
    const gestern = { tag: '2026-08-11', uebrig: 0, videos: 3 };
    const heute = tagesWechsel(gestern, '2026-08-12');
    expect(heute).toEqual(frischerStand('2026-08-12'));
    const gleich = { tag: '2026-08-12', uebrig: 2, videos: 1 };
    expect(tagesWechsel(gleich, '2026-08-12')).toBe(gleich);
  });

  it('zieht nie unter null ab', () => {
    let s = frischerStand('2026-08-12');
    for (let i = 0; i < 9; i++) s = abziehen(s);
    expect(s.uebrig).toBe(0);
  });

  it('gibt je Video ein Leben zurück, höchstens dreimal am Tag', () => {
    let s = { tag: '2026-08-12', uebrig: 0, videos: 0 };
    for (let i = 1; i <= VIDEOS_PRO_TAG; i++) {
      const neu = videoEinloesen(s);
      expect(neu).not.toBeNull();
      s = neu!;
      expect(s.uebrig).toBe(i);
      expect(s.videos).toBe(i);
    }
    // Das vierte Angebot gibt es nicht — stattdessen die Verabschiedung.
    expect(videoEinloesen(s)).toBeNull();
  });

  it('kennt eine Schnupperfrist und schreibt den Tag als Kalenderdatum', () => {
    expect(FREI_SEKUNDEN).toBe(30);
    expect(heuteTag(new Date(2026, 7, 12))).toBe('2026-08-12');
    expect(heuteTag(new Date(2026, 0, 3))).toBe('2026-01-03');
  });
});
