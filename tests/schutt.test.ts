import { describe, expect, it } from 'vitest';
import { PARTIKEL_MS, SCHUTT_MS, schuttWuerfe } from '../src/render/schutt';

/**
 * Der Schutt sagt, welchen Beruf eine Figur ausübt — über die **Richtung**,
 * in die er fliegt. Genau das lässt sich auf einem Standbild nicht beurteilen:
 * Drei Bildpunkte grosse Körner sind dort ein Fleck. Deshalb wird hier
 * gerechnet statt hingeschaut.
 */
describe('Schuttrichtung je Beruf', () => {
  for (const dir of [1, -1] as const) {
    describe(dir === 1 ? 'nach rechts blickend' : 'nach links blickend', () => {
      it('wirft beim Rammen nach hinten', () => {
        // Der Rammer treibt geradeaus; das Material kommt hinter ihm heraus.
        // Flöge es nach vorn, sähe es aus, als spuckte er in den Stollen.
        const [w] = schuttWuerfe('basher', dir);
        expect(w.seite).toBe(-dir);
        expect(w.hoch).toBeLessThan(0);
      });

      it('wirft beim Schrägbaggern nach hinten und deutlich höher', () => {
        // Seine Achse zeigt nach vorn unten, der Auswurf muss ihr
        // entgegenlaufen — sonst widersprechen sich Werkzeug und Schutt.
        const [m] = schuttWuerfe('miner', dir);
        const [b] = schuttWuerfe('basher', dir);
        expect(m.seite).toBe(-dir);
        expect(m.hoch).toBeLessThan(b.hoch);
      });

      it('wirft beim Graben symmetrisch nach oben', () => {
        // Der Gräber steht im Loch. Aus einem Loch geht es nur hoch, und zwar
        // nach beiden Seiten gleich — eine Vorzugsrichtung wäre hier falsch
        // und würde ihn mit dem Rammer verwechselbar machen.
        const w = schuttWuerfe('digger', dir);
        expect(w).toHaveLength(2);
        expect(w.map((x) => x.seite).sort()).toEqual([-1, 1]);
        for (const x of w) {
          expect(x.hoch).toBeLessThan(-1);
          expect(x.dy).toBeLessThan(0);
        }
      });

      it('wirft beim Brückenbauen gar nichts', () => {
        // Er nimmt nichts weg, er legt etwas hin. Schutt wäre schlicht gelogen.
        expect(schuttWuerfe('builder', dir)).toHaveLength(0);
      });

      it('hält den Kegel eng', () => {
        // Ein breiter Auswurf sieht nach Explosion aus. Die Richtung ist nur
        // zu lesen, solange sie eine ist.
        for (const skill of ['basher', 'miner', 'digger'] as const) {
          for (const w of schuttWuerfe(skill, dir)) {
            expect(w.streu, `Kegel von ${skill}`).toBeLessThanOrEqual(0.6);
          }
        }
      });
    });
  }

  it('lässt den Schutt lange genug leben, um eine Bahn zu zeigen', () => {
    // Vierzig Millisekunden — der frühere Wert — sind bei sechzig Bildern je
    // Sekunde zwei Bilder. Aus zwei Bildern liest niemand eine Flugrichtung,
    // und damit wäre der ganze Kanal umsonst gebaut.
    expect(SCHUTT_MS).toBeGreaterThanOrEqual(250);
  });

  describe('Lebensdauern der uebrigen Wolken', () => {
    /**
     * Sie waren **allesamt** zu kurz, und niemand hatte es gemerkt: Stahl 26,
     * Bruecke 30, Rettung 60, Tod 60, Explosion 90, Rauch 140 Millisekunden.
     * Bei sechzig Bildern je Sekunde sind 26 ms anderthalb Bilder.
     *
     * Das faellt deshalb nicht auf, weil ein zu kurzer Partikel nicht falsch
     * aussieht, sondern **gar nicht**: Man haelt das Bild fuer partikellos und
     * sucht den Fehler woanders. Diese Pruefung ist die Untergrenze, damit es
     * nicht ein zweites Mal passiert.
     */
    it('laesst jede Wolke mindestens ein Sechstel einer Sekunde stehen', () => {
      for (const [name, ms] of Object.entries(PARTIKEL_MS)) {
        expect(ms, `${name} ist zu kurz, um gesehen zu werden`).toBeGreaterThanOrEqual(170);
      }
    });

    it('gibt dem groessten Ereignis die laengste Wolke', () => {
      // Die Explosion ist das lauteste Ereignis des Spiels. Waere ihr Rauch
      // kuerzer als ein Holzsplitter beim Bruecke legen, stimmte die Rangfolge
      // nicht — und die Rangfolge ist das, was der Spieler als Gewicht liest.
      expect(PARTIKEL_MS.explosionRauch).toBeGreaterThan(PARTIKEL_MS.explosionFeuer);
      expect(PARTIKEL_MS.explosionFeuer).toBeGreaterThan(PARTIKEL_MS.bruecke);
      expect(PARTIKEL_MS.explosionFeuer).toBeGreaterThan(PARTIKEL_MS.stahl);
    });
  });
});
