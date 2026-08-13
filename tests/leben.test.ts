import { describe, expect, it } from 'vitest';
import {
  FREI_SEKUNDEN,
  GESCHENK,
  freibetragGilt,
  lebensfrei,
  LEBEN_PRO_TAG,
  VIDEOS_PRO_TAG,
  abziehen,
  frischerStand,
  heuteTag,
  mitGeschenk,
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
    const gestern = { tag: '2026-08-11', uebrig: 0, videos: 3, geschenk: GESCHENK };
    const heute = tagesWechsel(gestern, '2026-08-12');
    expect(heute).toEqual(frischerStand('2026-08-12'));
    const gleich = { tag: '2026-08-12', uebrig: 2, videos: 1 };
    expect(tagesWechsel(gleich, '2026-08-12')).toBe(gleich);
  });

  it('schenkt je Auffüll-Kennwort genau einmal volle Leben', () => {
    // Ein alter Stand ohne Kennwort (oder mit dem eines frueheren
    // Baustands) wird einmal auf voll gesetzt — das Test-Geschenk nach
    // grossen Paketen. Danach greift die normale Tagesmechanik: Dasselbe
    // Kennwort schenkt nie ein zweites Mal.
    const alt = { tag: '2026-08-12', uebrig: 0, videos: 2 };
    const beschenkt = mitGeschenk(alt);
    expect(beschenkt.uebrig).toBe(LEBEN_PRO_TAG);
    expect(beschenkt.geschenk).toBe(GESCHENK);
    expect(beschenkt.videos).toBe(2);
    const danach = abziehen(beschenkt);
    expect(mitGeschenk(danach)).toBe(danach);
    // Und ueber Mitternacht bleibt das Kennwort erhalten.
    expect(tagesWechsel(danach, '2026-08-13').geschenk).toBe(GESCHENK);
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

  /**
   * Der lebensfreie Lehrgang deckt seit dem Welt-1-Umbau die ganze Welt ab —
   * rote Linie des Marketings: „Kein Spieler darf seine allererste Sitzung an
   * der Lebensgrenze beenden."
   */
  it('macht ganz Welt 1 lebensfrei und sonst nichts', () => {
    for (const n of ['01', '05', '08', '10', '14']) {
      expect(lebensfrei(`w1-${n}`), `w1-${n}`).toBe(true);
    }
    for (const id of ['w2-01', 'w3-07', 'w4-14', 'w5-15', 'w6-01']) {
      expect(lebensfrei(id), id).toBe(false);
    }
  });

  /**
   * Der Erkundungs-Freibetrag: Er gilt genau einmal je Level und nur, solange
   * das Level noch nie gewonnen wurde. Damit ist der erste ehrliche Versuch
   * ueberall gratis — und die Haerte bestraft danach das Denken, nie das
   * Kennenlernen.
   */
  it('schenkt den ersten Versuch je Level genau einmal', () => {
    expect(freibetragGilt(false, false)).toBe(true);
    // Schon verbraucht.
    expect(freibetragGilt(false, true)).toBe(false);
    // Schon gewonnen — wer das Level kennt, zahlt.
    expect(freibetragGilt(true, false)).toBe(false);
    expect(freibetragGilt(true, true)).toBe(false);
  });
});
