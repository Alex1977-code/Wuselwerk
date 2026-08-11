import { describe, expect, it } from 'vitest';
import { ARPEGGIO, STUECKE } from '../src/audio/music';

/**
 * Pruefungen am Notentext, nicht am Klang.
 *
 * Ob eine Melodie schoen ist, kann kein Test sagen. Ob sie *ueberhaupt eine
 * Melodie sein kann*, schon: Sie muss auf dem Taktraster sitzen, und sie muss
 * die Wiederkehr haben, die aus einer Tonfolge ein Lied macht. Beides geht
 * still kaputt — ein Takt mit neun Achteln verschiebt die Melodie fuer immer
 * gegen die Akkorde, und man hoert nur, dass etwas nicht stimmt, ohne zu
 * wissen, was.
 */

const TAKT = 8;

describe('Die laufende Sechzehntelfigur', () => {
  it('meidet die Terz', () => {
    // Die Terz sagt, ob ein Akkord Dur oder Moll ist. Diese eine Figur laeuft
    // ueber alle Akkorde beider Stuecke — die Wiese in Dur, die Hoehle in
    // dorisch —, ohne je umgeschrieben zu werden. Eine grosse Terz darin waere
    // in der Hoehle schlicht der falsche Ton, und sie faellt beim Schreiben
    // nicht auf: Ueber dem Dur-Stueck klingt sie richtig.
    for (const halbton of ARPEGGIO) {
      expect([0, 7], `${halbton} Halbtoene ist weder Grundton noch Quinte`).toContain(halbton % 12);
    }
  });

  it('bleibt unter dem Fenster der Melodie', () => {
    // 800 Hz bis 3 kHz gehoert der Melodie. Eine Begleitfigur, die dort
    // mitspielt, zwingt einen dazu, die Melodie lauter zu drehen — und dann ist
    // alles zu laut.
    let hoechste = 0;
    for (const p of Object.values(STUECKE)) {
      const wurzel = Math.max(...p.akkorde);
      const oben = Math.max(...ARPEGGIO);
      hoechste = Math.max(hoechste, p.grund * Math.pow(2, (wurzel + oben) / 12));
    }
    expect(hoechste).toBeLessThan(800);
  });
});

describe('Notentext der Begleitmusik', () => {
  for (const [name, p] of Object.entries(STUECKE)) {
    describe(name, () => {
      it('fuellt jeden Takt genau aus', () => {
        // Der Fehler waere sonst unsichtbar: Die Melodie liefe weiter, nur
        // eben ab dem zweiten Durchlauf gegen die Harmonie.
        let imTakt = 0;
        const takte: number[] = [];
        for (const [, laenge] of p.melodie) {
          imTakt += laenge;
          expect(imTakt, `Note ragt ueber die Taktgrenze in "${name}"`).toBeLessThanOrEqual(TAKT);
          if (imTakt === TAKT) {
            takte.push(imTakt);
            imTakt = 0;
          }
        }
        expect(imTakt, `letzter Takt in "${name}" unvollstaendig`).toBe(0);
        expect(takte.length).toBe(p.akkorde.length);
      });

      it('hat ein Kopfmotiv, das wiederkehrt', () => {
        // Nicht die Menge der Toene macht eine Melodie, sondern die Wiederkehr.
        //
        // Gemessen werden drei Toene, nicht vier, und das ist keine Nachlaessig-
        // keit: Ein Kopfmotiv kehrt wieder und wird beim vierten Ton *anders
        // weitergefuehrt* — daher weiss das Ohr beim dritten Mal schon, was
        // kommt, und wird dann ueberrascht. Auf vier Toenen bestehen hiesse
        // wortwoertliche Wiederholung verlangen, und die ist langweilig.
        const kopf = p.melodie.slice(0, 3).map(([ton]) => ton);
        let treffer = 0;
        for (let i = 0; i + kopf.length <= p.melodie.length; i++) {
          const hier = p.melodie.slice(i, i + kopf.length).map(([ton]) => ton);
          if (hier.every((t, k) => t === kopf[k])) treffer++;
        }
        expect(treffer, `Kopfmotiv in "${name}" kommt nur ${treffer}-mal vor`).toBeGreaterThanOrEqual(2);
      });

      it('laesst die Phrasen atmen', () => {
        // Ohne lange Toene am Phrasenende hoert man kein Ende und damit auch
        // keinen Anfang — die Melodie laeuft dann geradeaus und bleibt nicht.
        const lang = p.melodie.filter(([, l]) => l >= 3).length;
        expect(lang, `"${name}" hat keine Atempausen`).toBeGreaterThanOrEqual(3);
      });

      it('bleibt in singbarer Lage', () => {
        // Ueber zwei Oktaven kann niemand mitsummen, und auf einem
        // Handylautsprecher wird der obere Rand stechend.
        const toene = p.melodie.map(([t]) => t).filter((t): t is number => t !== null);
        expect(Math.max(...toene) - Math.min(...toene)).toBeLessThanOrEqual(24);
      });

      it('spielt die Melodie mit einer haltenden Stimme', () => {
        // Ein Stabspiel kann keinen Ton halten. Eine Melodie daraus ist eine
        // Folge von Punkten, keine Linie — genau das klang nach Piepen.
        expect(['akkordeon', 'klarinette', 'panfloete']).toContain(p.melodieStimme);
      });
    });
  }
});
