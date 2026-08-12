import { describe, expect, it } from 'vitest';
import { ARPEGGIO, BASSFIGUR, PULS, STUECKE } from '../src/audio/music';

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

describe('Der Puls und die Basslinie', () => {
  it('teilen sich die acht Achtel lückenlos und überschneidungsfrei', () => {
    // Das ist die Eigenschaft, an der die tiefe Lage auf einem
    // Handylautsprecher hängt, und sie ist der Grund, warum der Groove von vier
    // Vierteln auf 3-3-2 wechseln durfte, ohne dass unten etwas verlorenging:
    //
    // - **Lückenlos**, damit das Ohr eine durchgehende tiefe Linie hört. Eine
    //   Lücke im Bass klingt nicht nach Pause, sondern nach Aussetzer.
    // - **Überschneidungsfrei**, damit nie zwei tiefe Töne gleichzeitig laufen.
    //   Genau dort entsteht sonst der Matsch, den kleine Lautsprecher nicht
    //   mehr auflösen.
    //
    // Beim Verschieben eines einzelnen Schlags fällt beides sofort auseinander,
    // und man hört es erst auf dem Zielgerät.
    expect(PULS.length).toBe(8);
    expect(BASSFIGUR.length).toBe(8);
    for (let i = 0; i < 8; i++) {
      expect(
        PULS[i] !== (BASSFIGUR[i] !== null),
        `Achtel ${i} ist ${PULS[i] ? 'doppelt belegt' : 'unbelegt'}`,
      ).toBe(true);
    }
  });

  it('meidet die Terz — wie die laufende Figur', () => {
    // Dieselbe Begründung wie bei `ARPEGGIO`: Die Terz sagt, ob ein Akkord Dur
    // oder Moll ist. Diese eine Figur läuft über alle Akkorde beider Stücke —
    // die Wiese in Dur, die Höhle in dorisch —, ohne je umgeschrieben zu
    // werden. Eine grosse Terz darin wäre in der Höhle schlicht der falsche
    // Ton, und beim Schreiben fällt es nicht auf: Über dem Dur-Stück klingt sie
    // richtig.
    for (const eintrag of BASSFIGUR) {
      if (!eintrag) continue;
      expect([0, 7], `${eintrag[0]} Halbtöne ist weder Grundton noch Quinte`).toContain(
        eintrag[0] % 12,
      );
    }
  });

  it('setzt den Schlag dreimal je Takt, ungleich verteilt', () => {
    // Drei Schläge auf acht Achteln, und zwar in den Abständen 3–3–2. Wären
    // sie gleich verteilt, stünde wieder ein Zählwerk da; genau die ungleiche
    // Verteilung ist der Gang.
    const stellen = PULS.map((an, i) => (an ? i : -1)).filter((i) => i >= 0);
    expect(stellen.length).toBe(3);
    const abstaende = stellen.map((s, k) =>
      k === 0 ? s + 8 - stellen[stellen.length - 1] : s - stellen[k - 1],
    );
    expect(new Set(abstaende).size, 'alle Abstände gleich — das ist ein Metronom').toBeGreaterThan(1);
    expect(abstaende.reduce((a, b) => a + b, 0)).toBe(8);
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
        //
        // Die Liste ist absichtlich hier ausgeschrieben und wird nicht aus
        // `music.ts` importiert: Sonst prüfte der Test nur noch, dass eine
        // Angabe mit sich selbst übereinstimmt. Wer eine Stimme hinzufügt, muss
        // hier bewusst bestätigen, dass sie halten kann.
        //
        // `leier` und `streicher` sind dazugekommen: gestrichene Saiten, also
        // Dauerton statt Anschlag. Beide halten (`hold` 0,8 bzw. 0,74).
        const haltend = ['akkordeon', 'klarinette', 'panfloete', 'okarina', 'leier', 'streicher'];
        expect(haltend).toContain(p.melodieStimme);
        expect(haltend).toContain(p.zweitStimme);
      });

      /**
       * Die Zweitstimme muss eine **andere** sein.
       *
       * Sie ist die Antwort auf „zu eintönig": Jeder zweite Durchgang gibt die
       * Melodie weiter (`DURCHGAENGE`). Stünde dort dieselbe Stimme, liefe der
       * ganze Bau leer, ohne dass irgendetwas kaputt wäre — der Fehler von der
       * leisen Sorte, den man erst nach Minuten Zuhören bemerkt.
       */
      it('hat für den Wechsel eine wirklich andere Stimme', () => {
        expect(p.zweitStimme).not.toBe(p.melodieStimme);
      });

      it('stimmt die Geräusche auf Töne, die in der Melodie vorkommen', () => {
        // Bis hierher hing alles Melodische der Spielgeräusche an einer festen
        // C-Dur-Pentatonik. Dass das bei zwei Welten aufging, war Glück: C D E
        // G A liegt vollständig in A-dorisch. Bei der dritten Welt hält das
        // Glück nicht mehr — und der Fehler wäre einer von der leisen Sorte:
        // Man hört, dass etwas nicht stimmt, ohne zu wissen, was.
        //
        // Der Maßstab ist bewusst die **Melodie selbst** und nicht eine
        // Tonleitertabelle. Eine Tabelle könnte falsch sein, ohne dass es
        // auffällt; die Melodie ist abgenommen und definiert damit, welche
        // Töne diese Welt hat.
        const inDerMelodie = new Set(
          p.melodie
            .map(([ton]) => ton)
            .filter((t): t is number => t !== null)
            .map((t) => ((t % 12) + 12) % 12),
        );
        for (const stufe of p.sfxStufen) {
          const halbton = ((stufe % 12) + 12) % 12;
          expect(
            inDerMelodie.has(halbton),
            `Geräuschstufe ${stufe} kommt in der Melodie von "${name}" nicht vor`,
          ).toBe(true);
        }
      });

      it('hat einen Fanfarengrundton, auf dem ein Durdreiklang steht', () => {
        // Eine Fanfare muss in Dur stehen, sonst ist sie kein Sieg. Geprüft
        // wird deshalb, dass Grundton, grosse Terz und Quinte über
        // `fanfareGrund` alle drei Töne der Welt sind — bei einem Stück in
        // Moll oder dorisch ist das nur auf der Paralleltonart der Fall, und
        // genau darauf muss der Wert zeigen.
        const vorrat = new Set(
          [
            ...p.melodie.map(([ton]) => ton).filter((t): t is number => t !== null),
            ...p.akkorde,
          ].map((t) => ((t % 12) + 12) % 12),
        );
        for (const stufe of [0, 4, 7]) {
          const halbton = (((p.fanfareGrund + stufe) % 12) + 12) % 12;
          expect(
            vorrat.has(halbton),
            `Der Durdreiklang auf ${p.fanfareGrund} liegt in "${name}" nicht im Tonvorrat (${halbton})`,
          ).toBe(true);
        }
      });
    });
  }
});
