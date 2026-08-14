import { describe, expect, it } from 'vitest';
import {
  ARPEGGIO,
  BASSFIGUR,
  DURCHGAENGE,
  HARMONIE_STELLEN,
  PULS,
  STUECKE,
} from '../src/audio/music';
import { farbTon, pruefe, stueckFuer, zaehler } from '../src/audio/musikbau';
import { LEVELS } from '../src/levels';
import type { ThemeId } from '../src/levels/types';

/**
 * Pruefungen am Notentext, nicht am Klang.
 *
 * Ob eine Melodie schoen ist, kann kein Test sagen. Ob sie *ueberhaupt eine
 * Melodie sein kann*, schon: Sie muss auf dem Taktraster sitzen, und sie muss
 * die Wiederkehr haben, die aus einer Tonfolge ein Lied macht. Beides geht
 * still kaputt — ein Takt mit neun Achteln verschiebt die Melodie fuer immer
 * gegen die Akkorde, und man hoert nur, dass etwas nicht stimmt, ohne zu
 * wissen, was.
 *
 * ## Zwei Sorten Stuecke, und beide werden hier geprueft
 *
 * `STUECKE` haelt die abgenommenen **Weltstuecke** — eines je Thema. Sie sind
 * der Rueckfall (Weltkarte, Vorspann, unbekanntes Level) und die Vorlage, aus
 * der die Motivfamilien gewonnen wurden. Was im Spiel wirklich laeuft, ist das
 * **Levelstueck** aus `musikbau.ts`: dieselbe Familie, je Level anders montiert.
 *
 * Die Pruefungen der ersten Haelfte gelten den Weltstuecken und sind
 * absichtlich von Hand ausgeschrieben; die der zweiten Haelfte laufen ueber
 * **alle gebauten Level** und benutzen `pruefe()` aus dem Baukasten. Eine
 * einzelne Melodie kann man von Hand ansehen; siebzig kann man nur noch
 * gegenrechnen.
 */

const TAKT = 8;
const kl = (t: number) => ((t % 12) + 12) % 12;
/** Alle Themen, die es gibt — die Weltstuecke sind darueber verschluesselt. */
const THEMEN = Object.keys(STUECKE) as ThemeId[];

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
    //
    // Gemessen wird hier an den **Weltstuecken** und an der abgenommenen Figur.
    // Dieselbe Aussage ueber alle montierten Levelstuecke und ueber alle vier
    // Figuren der Bank steht weiter unten („Ein eigenes Stueck je Level").
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

/**
 * Ein eigenes Stueck je Level (`src/audio/musikbau.ts`).
 *
 * ## Warum hier anders geprueft wird als oben
 *
 * Ueber den Weltstuecken steht eine Abnahme: Ein Mensch hat sie gehoert und
 * „melodie passt, merken" gesagt. Ueber einem montierten Stueck kann das
 * niemand sagen, weil es siebzig davon gibt und morgen hundert. An deren Stelle
 * tritt die **Bauart**: Die Bausteine sind einzeln abgenommen (Eintrag 0 jeder
 * Tabelle stammt aus dem Weltstueck), und `pruefe()` haelt jedes fertige Stueck
 * gegen dieselben Gesetze, die `docs/musik-abnahme.md` und
 * `docs/klangdesign.md` festhalten.
 *
 * Deshalb laufen diese Pruefungen ueber **alle gebauten Level** und nicht ueber
 * eine Auswahl. Eine Auswahl waere hier wertlos: Der Fehler, den es zu fangen
 * gilt, trifft nicht „die Musik", sondern genau ein Level — und man merkt es
 * beim Spielen dieses einen Levels.
 */
describe('Ein eigenes Stueck je Level', () => {
  /** Alles einmal montieren; die Pruefungen darunter lesen nur noch. */
  const stuecke = LEVELS.map((lv) => ({ lv, p: stueckFuer(lv.id, lv.theme) }));

  it('haelt an jedem gebauten Level jedes Gesetz der Klangschicht', () => {
    // Die Sammelpruefung. Sie sagt zu jedem Verstoss, welches Gesetz gebrochen
    // ist (A1, B1..B8, C9..C11, E3, F2, F3, F6) — nachzulesen in `pruefe()`.
    // Faellt hier etwas um, ist es kein Geschmacksurteil, sondern eine
    // Zusage, an der eine andere Schicht haengt.
    const befunde = stuecke
      .map(({ lv, p }) => ({ id: lv.id, fe: pruefe(p) }))
      .filter((x) => x.fe.length);
    expect(
      befunde.map((x) => `${x.id}: ${x.fe.join(', ')}`),
      `${befunde.length} von ${stuecke.length} Leveln mit Befund`,
    ).toEqual([]);
  });

  it('erzeugt zu einer Level-Id immer dasselbe Stueck', () => {
    // Die Erzeugung darf keinen Zufall enthalten — sonst klingt ein Level bei
    // jedem Start anders, und der Spieler kann sich an nichts erinnern.
    // `Math.random` waere im Klang grundsaetzlich erlaubt (die Simulation ist
    // deterministisch, der Klang muss es nicht sein); an DIESER Stelle waere er
    // aber der Unterschied zwischen einem Stueck und einem Geraeusch.
    //
    // Tief verglichen, nicht nur die Melodie: Auch Kadenz, Farbe, Stimmen,
    // Figur und Bogenplan muessen wiederkommen.
    for (const { lv, p } of stuecke) {
      expect(stueckFuer(lv.id, lv.theme), `"${lv.id}" klingt beim zweiten Mal anders`).toEqual(p);
    }
  });

  /**
   * Und keinem Level im GANZEN Spiel dasselbe wie einem anderen.
   *
   * Der Test je Welt reicht nicht, und das ist gemessen: Drei Welten teilen
   * die gruene Motivfamilie, und ohne `THEMA_VERSATZ` standen w1-01 und w6-01
   * auf demselben Punkt des Notenraums — gleicher Notentext, gleiche Kadenz,
   * nur andere Tonart. Ein Test, der nur innerhalb der Welt vergleicht, sieht
   * das nie.
   */
  it('gibt keinen zwei Leveln im ganzen Spiel dasselbe Stueck', () => {
    const gesehen = new Map<string, string>();
    for (const lv of LEVELS) {
      const p = stueckFuer(lv.id, lv.theme);
      const schluessel = JSON.stringify([p.melodie, p.akkorde, p.farbe]);
      const alt = gesehen.get(schluessel);
      expect(alt, `${lv.id} klingt wie ${alt}`).toBeUndefined();
      gesehen.set(schluessel, lv.id);
    }
    expect(gesehen.size).toBe(LEVELS.length);
  });

  it('gibt keinen zwei Leveln derselben Welt dasselbe Stueck', () => {
    // Der Sinn des ganzen Verfahrens. Zwei Level einer Welt mit demselben
    // Notentext waeren der Zustand von vorher, nur teurer.
    //
    // Verglichen werden Melodie UND Kadenz, also der Notentext. Zwei gleiche
    // Melodien mit verschiedener Figur waeren fuer das Ohr dasselbe Stueck.
    const gesehen = new Map<string, string>();
    const doppelt: string[] = [];
    for (const { lv, p } of stuecke) {
      const schluessel = `${lv.theme}|${JSON.stringify(p.melodie)}|${JSON.stringify(p.akkorde)}`;
      const vorher = gesehen.get(schluessel);
      if (vorher) doppelt.push(`${lv.id} klingt wie ${vorher}`);
      else gesehen.set(schluessel, lv.id);
    }
    expect(doppelt).toEqual([]);
  });

  it('haelt die Begleitung jedes Levels unter dem Fenster der Melodie', () => {
    // Dieselbe Aussage wie oben bei der Sechzehntelfigur, nur ueber alle Level:
    // Die Maschine bleibt **unter** 800 Hz, das Fenster darueber gehoert der
    // Melodie. Neu daran ist, dass jetzt jedes Level seine eigene Kadenz, seine
    // eigene Figur und seine eigene Flaechenfarbe mitbringt — die Rechnung ist
    // also nicht mehr einmal zu machen, sondern siebzigmal.
    //
    // Drei Groessen, und alle drei sind Rechenwege und keine Schaetzungen:
    //
    // 1. Die Sechzehntelfigur, hoechste Akkordwurzel plus hoechster Figurton.
    // 2. Die Flaeche, hoechster Farbton ueber der hoechsten Wurzel — und einen
    //    Halbton hoeher, weil im Endspurt alles hochgeschoben wird.
    // 3. Die Oktavdopplung der Melodie im vierten Umlauf, die von oben an das
    //    Fenster stoesst und unter 3 kHz bleiben muss.
    //
    // Was hier NICHT geprueft wird: dass die Melodie durchweg ueber 800 Hz
    // liegt. Ihre tiefsten Toene liegen darunter (die Wiese faengt bei 523 Hz
    // an), und das ist so gewollt — die Zusage lautet, dass die Begleitung
    // nicht ins Melodiefenster hineinspielt, nicht umgekehrt.
    for (const { lv, p } of stuecke) {
      const hoch = Math.max(...p.akkorde);
      const figur = p.grund * Math.pow(2, (hoch + Math.max(...(p.arpeggio ?? ARPEGGIO))) / 12);
      expect(figur, `Figur in "${lv.id}" bei ${figur.toFixed(0)} Hz`).toBeLessThan(800);

      let farbSpitze = hoch;
      for (const wurzel of p.akkorde) {
        for (const stufe of p.farbe) {
          farbSpitze = Math.max(farbSpitze, farbTon(wurzel, stufe, p.leiter));
        }
      }
      const flaeche = p.grund * Math.pow(2, (farbSpitze + 1) / 12);
      expect(flaeche, `Flaeche in "${lv.id}" bei ${flaeche.toFixed(0)} Hz`).toBeLessThan(800);

      const toene = p.melodie.map(([t]) => t).filter((t): t is number => t !== null);
      const spitze = p.grund * Math.pow(2, Math.max(...toene) / 12 + 2);
      expect(spitze, `Oktavdopplung in "${lv.id}" bei ${spitze.toFixed(0)} Hz`).toBeLessThan(3000);
    }
  });

  it('stimmt die Geraeusche jedes Levels auf Toene, die dessen Melodie benutzt', () => {
    // Dieselbe Pruefung wie fuer die Weltstuecke oben — und hier ist sie keine
    // Formalie mehr, sondern der Grund fuer eine Regel in der Montage
    // (`deckt`): Die Geraeuschleiter ist je WELT fest, die Melodie wechselt je
    // Level. Ein montiertes Stueck, dem eine Stufe der Leiter fehlt, laesst
    // jedes Spielgeraeusch neben seiner eigenen Musik stehen.
    //
    // Gemessen wird am gebauten Notentext, nicht an einer Tabelle: Eine Tabelle
    // koennte falsch sein, ohne dass es auffaellt.
    for (const { lv, p } of stuecke) {
      const inDerMelodie = new Set(
        p.melodie
          .map(([ton]) => ton)
          .filter((t): t is number => t !== null)
          .map(kl),
      );
      for (const stufe of p.sfxStufen) {
        expect(
          inDerMelodie.has(kl(stufe)),
          `Geraeuschstufe ${stufe} fehlt in der Melodie von "${lv.id}"`,
        ).toBe(true);
      }
    }
  });

  it('laesst keinen Ton der Harmoniespur ausserhalb des Modus liegen', () => {
    // **Der Test zum gemessenen Befund.**
    //
    // Die Flaeche und die gezupfte Harmonie spielen je Takt die Akkordwurzel
    // und darueber die Farbtoene. Solange die Farbe ein festes Halbtonintervall
    // war, war sie nur ueber der Tonika richtig — ueber jeder anderen Wurzel
    // fiel sie aus der Tonart. Seit sie in LEITERSTUFEN zaehlt (`farbTon`),
    // kann das nicht mehr vorkommen; dieser Test ist der Nagel, der es
    // festhaelt.
    //
    // Geprueft werden Welt- und Levelstuecke: Der Fehler sass in den
    // Weltstuecken, und die Levelstuecke erben ihre Farben aus derselben Bank.
    const alle = [
      ...THEMEN.map((th) => ({ name: th, p: STUECKE[th] })),
      ...stuecke.map(({ lv, p }) => ({ name: lv.id, p })),
    ];
    for (const { name, p } of alle) {
      for (const wurzel of p.akkorde) {
        for (const stufe of p.farbe) {
          const halbton = farbTon(wurzel, stufe, p.leiter);
          expect(
            p.leiter.includes(kl(halbton)),
            `"${name}": Stufe ${stufe} ueber der Wurzel ${wurzel} ergibt ${kl(halbton)} — nicht im Modus [${p.leiter}]`,
          ).toBe(true);
        }
      }
    }
  });

  it('haelt fest, was die feste Halbtonfarbe angestellt hatte', () => {
    // Der Befund in Zahlen, damit er nicht als Behauptung im Kommentar steht.
    //
    // Nachgerechnet wird die alte Lesart: dieselbe Farbe, aber als festes
    // Halbtonintervall ueber jeder Akkordwurzel — genau das, was bis zum Umbau
    // in `STUECKE.farbe` stand (`leiter[stufe]` ist die Umrechnung zurueck).
    // Gezaehlt werden die Takte, in denen dabei ein modusfremder Ton entstand.
    // Er lief zweimal je Takt, im Band 250 bis 800 Hz, seit der ersten
    // Auslieferung.
    //
    // Dass die drei Gruenwelten heil blieben, ist kein Verdienst, sondern Dur:
    // Ueber den Wurzeln 0, 5 und 7 ist die grosse Terz zufaellig immer
    // leitereigen. Beim ersten Moll-Stueck hielt der Zufall nicht mehr.
    const erwartet: Record<string, number> = {
      grass: 0, sonnenhang: 0, wipfel: 0, crystal: 5, rust: 5, frost: 6, magma: 4,
    };
    const gemessen: Record<string, number> = {};
    for (const th of THEMEN) {
      const p = STUECKE[th];
      const alsHalbton = p.farbe.map((stufe) => p.leiter[stufe]);
      gemessen[th] = p.akkorde.filter((wurzel) =>
        alsHalbton.some((h) => !p.leiter.includes(kl(wurzel + h))),
      ).length;
    }
    expect(gemessen, 'der Befund hat sich verschoben — nachrechnen, nicht anpassen').toEqual(
      erwartet,
    );
  });

  it('laesst Tonart, Tempo, Geraeuschleiter und Fanfare der Welt unangetastet', () => {
    // Was ausdruecklich NICHT je Level wechselt, und warum:
    //
    // `tonart()` und `schrittDauer()` reichen Grundton, Geraeuschleiter,
    // Fanfarengrund und Tempo an `sfx.ts` und `stinger.ts` weiter. Wechselten
    // sie je Level, haette eine Welt keine Tonart mehr, sondern fuenfzehn — und
    // die Tempobaender der Welten (88 bis 132) wuerden ueberlappen, womit der
    // Puls nicht mehr sagt, wo man ist.
    //
    // Der Test hat einen zweiten Zweck: Dieselben vier Werte stehen in
    // `STUECKE` (`music.ts`) und in `WELTEN` (`musikbau.ts`), weil das
    // Weltstueck dort abgenommen ist. Hier laufen beide Tabellen gegeneinander,
    // damit sie nicht auseinanderdriften.
    for (const { lv, p } of stuecke) {
      const welt = STUECKE[lv.theme];
      expect(p.grund, `Grundton von "${lv.id}"`).toBe(welt.grund);
      expect(p.bpm, `Tempo von "${lv.id}"`).toBe(welt.bpm);
      expect(p.sfxStufen, `Geraeuschleiter von "${lv.id}"`).toEqual(welt.sfxStufen);
      expect(p.fanfareGrund, `Fanfarengrund von "${lv.id}"`).toBe(welt.fanfareGrund);
      expect(p.leiter, `Modus von "${lv.id}"`).toEqual(welt.leiter);
      expect(p.melodieStimme, `fuehrende Stimme von "${lv.id}"`).toBe(welt.melodieStimme);
    }
  });

  it('baut aus dem ersten Level jeder Welt das abgenommene Weltstueck', () => {
    // Das ist die Zusage, die den ganzen Umbau von einer Neukomposition
    // unterscheidet: Eintrag 0 jeder Tabelle des Baukastens stammt aus dem
    // abgenommenen Weltstueck, und der Zaehler eines ersten Levels ist null.
    // Also muss dort Note fuer Note dasselbe herauskommen, was heute laeuft —
    // samt Kadenz, Farbe, Stimmen, Figur, Harmoniedichte und Bogenplan.
    //
    // Die Id kommt aus den gebauten Leveln, damit hier keine zweite Tabelle
    // „welche Welt hat welche Nummer" entsteht. Fuer eine Welt, die noch keine
    // Level hat (die Wipfelweide), steht `w0-01` ein — `zaehler` liest nur die
    // Nummer hinter dem Strich, und die ist es, auf die es ankommt.
    // Nur die FUEHRENDE Welt einer Motivfamilie steht auf Punkt null.
    //
    // Drei Welten teilen die gruene Familie, und ihr abgenommenes Weltstueck
    // ist bei allen drei derselbe Notentext — sie trennen sich ueber Tempo,
    // Tonart und Instrumentierung. Stuenden alle drei auf Punkt null, spielte
    // das erste Level des Sonnenhangs Note fuer Note die Eroeffnungsmelodie
    // des Spiels; `THEMA_VERSATZ` schiebt sie deshalb weiter. Fuer sie ist
    // diese Zusage dadurch nicht verloren, sondern war von Anfang an leer.
    const FUEHREND = ['grass', 'crystal', 'rust', 'frost', 'magma'];
    for (const th of THEMEN.filter((t) => FUEHREND.includes(t))) {
      const id = LEVELS.find((lv) => lv.theme === th && zaehler(lv.id) === 0)?.id ?? 'w0-01';
      const p = stueckFuer(id, th);
      const soll = STUECKE[th];
      expect(p.melodie, `Melodie von "${id}" (${th})`).toEqual(soll.melodie);
      expect(p.akkorde, `Kadenz von "${id}" (${th})`).toEqual(soll.akkorde);
      expect(p.leiter, `Modus von "${id}" (${th})`).toEqual(soll.leiter);
      expect(p.farbe, `Farbe von "${id}" (${th})`).toEqual(soll.farbe);
      expect(
        [p.melodieStimme, p.zweitStimme, p.harmonieStimme],
        `Stimmen von "${id}" (${th})`,
      ).toEqual([soll.melodieStimme, soll.zweitStimme, soll.harmonieStimme]);
      expect(p.bpm).toBe(soll.bpm);
      expect(p.grund).toBe(soll.grund);
      // Die drei Texturangaben, die ein Levelstueck mitbringt: Eintrag 0 ist
      // ueberall das Abgenommene, also das, was `music.ts` ohne sie tut.
      expect(p.arpeggio, `Figur von "${id}"`).toEqual(ARPEGGIO);
      expect(p.harmonieStellen, `Harmoniedichte von "${id}"`).toEqual(HARMONIE_STELLEN);
      expect(p.bogen, `Bogenplan von "${id}"`).toEqual(DURCHGAENGE);
    }
  });
});
