import { describe, expect, it } from 'vitest';
import { DEFAULT_MANIFEST } from '../src/render/atlas';
import { PROFIL } from '../src/render/sprites';
import type { AtlasManifest } from '../src/render/atlas';
import { WUSEL_H } from '../src/core/constants';
// Als Modul geladen, nicht über das Dateisystem: Das Projekt hat bewusst keine
// Node-Typen im Testpfad, und der Lader im Spiel holt das Blatt genauso.
import murmelBlatt from '../src/art/murmel.atlas.json';
import erdmaennchenBlatt from '../src/art/erdmaennchen.atlas.json';

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
/**
 * **Beide** ausgelieferten Blätter, nicht nur das eingeschaltete.
 *
 * Seit es zwei Figuren gibt, ist „das Blatt" mehrdeutig. Nur das aktive zu
 * prüfen wäre die schlechteste Wahl: Das inaktive verfällt dann still, und man
 * merkt es genau in dem Moment, in dem jemand umschaltet. Der Vertrag gilt für
 * jedes Blatt, das im Bau liegt.
 */
const BLAETTER: Record<string, AtlasManifest> = {
  murmel: murmelBlatt as unknown as AtlasManifest,
  erdmaennchen: erdmaennchenBlatt as unknown as AtlasManifest,
};
const sheet = BLAETTER.murmel;

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

/**
 * Die Dreiviertelansicht — und warum sie eine eigene Prüfung braucht.
 *
 * „Läuft seitwärts" kam **zweimal**. Beim ersten Mal habe ich es im Zeichner
 * versucht (neigen, stauchen); das konnte nicht wirken, weil die Augen ins Bild
 * gebacken sind und dort in der Mitte bleiben. Gedreht wird deshalb jetzt das
 * Modell beim Backen.
 *
 * Damit hängt die Sache an einer Datei, der man nicht ansieht, ob sie aktuell
 * ist: Ein altes Blatt lädt genauso, zeichnet genauso und meldet keinen Fehler
 * — die Figur läuft nur wieder seitwärts. Deshalb schreibt der Backvorgang den
 * Winkel ins Blatt, und deshalb steht diese Prüfung hier.
 */
describe('Jedes Blatt sagt, was es zeigt', () => {
  for (const [figur, blatt] of Object.entries(BLAETTER)) {
    describe(figur, () => {
      it('nennt seine Figur', () => {
        // Ohne diese Angabe wüsste der Renderer nicht, ob er einen Schopf über
        // den Kopf oder eine Maske ins Gesicht zeichnen soll — und er würde es
        // still falsch machen.
        expect(blatt.figur).toBe(figur);
      });

      it('bedient alle zwölf Zustände mit der vorgeschriebenen Bildzahl', () => {
        for (const [name, soll] of Object.entries(DEFAULT_MANIFEST.clips)) {
          const ist = blatt.clips[name];
          expect(ist, `Zustand ${name} fehlt`).toBeDefined();
          expect(ist.row, `Zeile von ${name}`).toBe(soll.row);
          expect(ist.holds, `Haltedauern von ${name}`).toEqual(soll.holds);
        }
      });

      it('zeichnet die Figur so hoch, wie die Simulation sie rechnet', () => {
        expect(blatt.cell.h * KOERPER_ANTEIL).toBeCloseTo(WUSEL_H, 1);
      });

      it('liefert zu jedem Einzelbild Anker, Zustand und Winkel', () => {
        for (const [name, clip] of Object.entries(blatt.clips)) {
          expect(clip.anchors?.length, `Ankerzahl von ${name}`).toBe(clip.holds.length);
          expect(clip.tuff?.length, `Zustandszahl von ${name}`).toBe(clip.holds.length);
          expect(clip.dreh, `Backwinkel von ${name}`).toBeDefined();
        }
      });

      it('lässt den Blocker den Betrachter ansehen', () => {
        // Seine ganze Aussage ist „bis hierher und nicht weiter", und die
        // richtet sich an den Betrachter — er darf sich also nicht wegdrehen
        // wie eine laufende Figur.
        //
        // Geprüft wird **nahezu frontal**, nicht exakt null. Beim Erdmännchen
        // stehen zwölf Grad: Schnurgerade von vorn ist sein Kopf eine flache
        // Scheibe mit zwei dunklen Löchern, und die Schnauze — sein
        // freundlichstes Merkmal — zeigt in die Kamera und verschwindet. Die
        // Rückmeldung dazu lautete „etwas gruselig von vorn". Eine Prüfung auf
        // exakt null hätte diese Korrektur verboten, ohne dass sie etwas
        // schützt.
        const blocker = blatt.clips.blocking.dreh ?? 0;
        const laufend = blatt.clips.walking.dreh ?? 0;
        expect(blocker).toBeLessThanOrEqual(15);
        expect(blocker).toBeLessThan(laufend);
      });
    });
  }

  /**
   * Die Drehung ist **figurabhängig**, und die Begründung dafür hat sich
   * unterwegs umgedreht.
   *
   * Die Murmel ist ein spiegelsymmetrischer Kiesel mit mittigen Augen; sie hat
   * kein Vorderende. Ihre Laufrichtung entsteht ausschliesslich aus der
   * Drehung — unter 30 Grad liest man sie in Spielgrösse nicht, über 48 Grad
   * verliert sie ihr Gesicht, weil die beiden Augen zu einem Fleck verschmelzen.
   * Sie hat also ein Fenster, und 42 Grad liegen darin.
   *
   * Für das Erdmännchen hatte ich vor dem Modell das Gegenteil vermutet: Eine
   * Schnauze sage die Richtung schon, also genüge wenig Drehung. Das war falsch
   * herum gedacht. Eine Schnauze **gewinnt** mit jedem Grad — im Profil ist sie
   * ein spitzes Dreieck, das die Silhouette durchbricht; frontal ist sie ein
   * Fleck, der in die Kamera zeigt und verschwindet. Und die Augen können nicht
   * verschmelzen, weil sie in der Textur sitzen und weit auseinander stehen.
   * Diese Figur hat also kein oberes Ende des Fensters, und sie steht bei 62.
   *
   * Was hier geprüft wird, ist deshalb nicht mehr „viel gegen wenig", sondern
   * das, was für beide gilt: **Wer läuft, ist deutlich weggedreht.**
   */
  it('dreht jede laufende Figur deutlich weg', () => {
    for (const [figur, blatt] of Object.entries(BLAETTER)) {
      expect(blatt.clips.walking.dreh ?? 0, `${figur} läuft zu frontal`).toBeGreaterThanOrEqual(30);
      expect(blatt.clips.walking.dreh ?? 0, `${figur} dreht sich weg`).toBeLessThanOrEqual(75);
    }
  });

  it('hält die Rückfallebene auf dem Profil der Murmel', () => {
    // Die Rückfallebene zeichnet eine Murmel — sie ist der Notausgang, wenn
    // *kein* Blatt lädt, und dann gibt es auch keine Figurenangabe. Ihr Profil
    // muss deshalb zum Murmelblatt passen.
    for (const [name, clip] of Object.entries(BLAETTER.murmel.clips)) {
      const soll = Math.sin(((clip.dreh ?? 0) * Math.PI) / 180);
      expect(PROFIL[name] ?? 0, `Profil von ${name}`).toBeCloseTo(soll, 1);
    }
  });
});
