import { describe, expect, it } from 'vitest';
import { DEFAULT_MANIFEST } from '../src/render/atlas';
import { PROFIL } from '../src/render/sprites';
import { fuehrtWerkzeug, werkzeugAnsatz } from '../src/render/werkzeug';
import { bandFarbe } from '../src/render/band';
import { maskeFarbe } from '../src/render/maske';
import { schopfFarbe } from '../src/render/schopf';
import type { AtlasManifest } from '../src/render/atlas';
import { WUSEL_H } from '../src/core/constants';
// Als Modul geladen, nicht über das Dateisystem: Das Projekt hat bewusst keine
// Node-Typen im Testpfad, und der Lader im Spiel holt das Blatt genauso.
//
// Murmel und Erdmännchen liegen **nicht mehr in `src/art/`** — sie sind aus dem
// Bau gestrichen (Beschluss vom 2026-08-12, siehe `docs/grafikbedarf.md` §5)
// und ruhen bei ihren Quelldaten. Die Prüfungen laufen weiter gegen sie: Ein
// Blatt, das zurückkommt, soll denselben Vertrag erfüllen wie am Tag seines
// Auszugs.
import murmelBlatt from '../art-src/murmel/murmel.atlas.json';
import erdmaennchenBlatt from '../art-src/erdmaennchen/erdmaennchen.atlas.json';
import wuselwerkerBlatt from '../src/art/wuselwerker.atlas.json';

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
  wuselwerker: wuselwerkerBlatt as unknown as AtlasManifest,
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
      expect(
        ist.holds.reduce((a, b) => a + b, 0),
        `Zyklusdauer von ${name} in Ticks`,
      ).toBe(soll.holds.reduce((a, b) => a + b, 0));
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

      /**
       * Jeder Zustand dauert genau so lange wie vorgeschrieben — darf ihn aber
       * in mehr Bildern erzählen.
       *
       * Bis zum 22.08.2026 stand hier ein Vergleich der Haltedauern Zahl für
       * Zahl, also faktisch der Bildzahl. Das war zu streng und hat eine
       * richtige Verbesserung verboten: Rückmeldung war, die Figur flackere
       * bei den Bewegungen, und gemessen kippten zwischen zwei
       * aufeinanderfolgenden Bildern beim Gehen 49,9 Prozent der Silhouette,
       * beim Rammen 58,3 und beim Fallen 68,0. Dagegen hilft nur eines: mehr
       * Zwischenbilder. Der Backvorgang rechnet sie seither aus den
       * Schlüsselbildern (`glaetten` in `bake-figur.mjs`), das Gehen läuft in
       * vierundzwanzig Bildern zu einem Tick statt acht zu drei, und der
       * Wechsel je Bildpaar ist auf 21,9 Prozent gefallen.
       *
       * Was dabei NICHT verhandelbar ist, ist die Dauer: Ein Gangzyklus muss
       * vierundzwanzig Ticks brauchen, sonst rutschen die Füße gegen den
       * Vorschub der Simulation. Genau das wird hier geprüft — die Summe, nicht
       * die Aufteilung. Und die Bildzahl darf nur wachsen: Ein Blatt mit
       * weniger Bildern als vorgeschrieben wäre gröber als der prozedurale
       * Ersatzzeichner, und dann könnte man gleich diesen nehmen.
       */
      it('erzählt jeden Zustand in der vorgeschriebenen Zeit', () => {
        const summe = (h: number[]) => h.reduce((a, b) => a + b, 0);
        for (const [name, soll] of Object.entries(DEFAULT_MANIFEST.clips)) {
          const ist = blatt.clips[name];
          expect(ist, `Zustand ${name} fehlt`).toBeDefined();
          expect(ist.row, `Zeile von ${name}`).toBe(soll.row);
          expect(summe(ist.holds), `Zyklusdauer von ${name} in Ticks`).toBe(summe(soll.holds));
          expect(
            ist.holds.length,
            `Bildzahl von ${name} — gröber als der Ersatzzeichner`,
          ).toBeGreaterThanOrEqual(soll.holds.length);
          expect(!!ist.once, `Ablaufart von ${name}`).toBe(!!soll.once);
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
   * Die obere Schranke stand einmal bei 75, und das war eine Zahl über eine
   * Figur, die aufrecht läuft: Wer sich zu weit wegdreht, verliert sein
   * Gesicht. Das Erdmännchen läuft inzwischen **auf allen vieren** und steht
   * bei 80. Für einen waagerechten Körper ist die Regel umgekehrt — er *liest*
   * sich nur im Profil; von vorn ist er ein Klumpen. Geprüft wird deshalb, was
   * für jede laufende Figur gilt, unabhängig von der Zahl der Beine: **Wer
   * läuft, ist deutlich weggedreht, aber nie ganz.**
   */
  it('dreht jede laufende Figur deutlich weg', () => {
    for (const [figur, blatt] of Object.entries(BLAETTER)) {
      expect(blatt.clips.walking.dreh ?? 0, `${figur} läuft zu frontal`).toBeGreaterThanOrEqual(30);
      expect(blatt.clips.walking.dreh ?? 0, `${figur} dreht sich weg`).toBeLessThan(90);
    }
  });

  /**
   * Die Standfläche — und warum sie geprüft wird, obwohl sie nur ein Schatten ist.
   *
   * Der Kontaktschatten hat vorher einen festen Anteil der Figurenhöhe
   * angenommen. Das passte für eine aufrecht stehende Figur und für sonst
   * nichts: Der Rammer steht auf 4 logischen Pixeln, der Gräber auf 8, der
   * Läufer auf allen vieren auf 10. Jetzt misst der Backvorgang es je Pose.
   *
   * Fehlt die Zahl, fällt der Zeichner still auf den alten Festwert zurück —
   * der Schatten sieht dann nicht falsch aus, sondern nur wie vorher, und das
   * merkt niemand. Genau deshalb steht die Prüfung hier.
   */
  it('misst für jede Pose eine Standfläche', () => {
    const blatt = BLAETTER.erdmaennchen;
    for (const [name, clip] of Object.entries(blatt.clips)) {
      expect(clip.fuss, `${name} ohne Standfläche`).toBeDefined();
      expect(clip.fuss!, `${name} steht auf nichts`).toBeGreaterThan(1);
      expect(clip.fuss!, `${name} steht breiter als die Zelle`).toBeLessThan(blatt.cell.w);
    }
    // Auf allen vieren steht sie deutlich breiter als aufrecht. Wäre das nicht
    // so, hätte die Messung die Pose nicht erfasst.
    expect(blatt.clips.walking.fuss!).toBeGreaterThan(blatt.clips.blocking.fuss!);
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

/**
 * Das Werkzeug hängt an der Hand — und die Hand bedeutet je Figur etwas anderes.
 *
 * Bei der Murmel ist der Handpunkt eine **Schätzung**: Das Modell hat keine
 * Handknochen, die Armspitze ist gerechnet, und sie landet mitten im Körper.
 * Alles, was `werkzeug.ts` an Ellipse und Versatz aufbietet, ist die
 * Berichtigung genau dieser Schätzung.
 *
 * Das Erdmännchen hat echte Handknochen. Sein Handpunkt ist die Pfote, dort, wo
 * sie im Bild steht. Dieselbe Berichtigung ein zweites Mal anzuwenden hiess,
 * einen Fehler auszugleichen, den es nicht gibt — das Gerät sackte anderthalb
 * Pixel unter die Pfote und stand zweieinhalb Pixel neben dem Tier in der Luft.
 *
 * Das ist der Fehler, den kein Blatt meldet: Das Blatt war richtig, nur das
 * Gezeichnete daneben. Deshalb prüft das hier die **Rechnung** und nicht das
 * Bild — nämlich dass ein Gerät bei einer Figur mit gemessener Pfote auch an
 * der Pfote bleibt.
 */
describe('Das Werkzeug bleibt an der Hand', () => {
  const POSEN = ['bashing', 'mining', 'digging', 'building'];

  it('setzt beim Erdmännchen dicht an der gemessenen Pfote an', () => {
    const blatt = BLAETTER.erdmaennchen;
    const koerperH = blatt.cell.h * 0.706;
    for (const pose of POSEN) {
      const clip = blatt.clips[pose];
      expect(clip?.hands, `${pose} ohne Pfoten`).toBeDefined();
      for (let i = 0; i < clip!.holds.length; i++) {
        const h = clip!.hands![i] ?? clip!.hands![0];
        const hx = h[0] - blatt.anchor.x;
        const hy = h[1] - blatt.anchor.y;
        const a = werkzeugAnsatz(pose, hx, hy, koerperH, 'erdmaennchen')!;
        const abstand = Math.hypot(a.x - hx, a.y - hy);
        // Ein logischer Pixel Luft ist das, was ein gehaltenes Gerät von einem
        // angeklebten trennt. Zwei sind schon ein Schweben.
        expect(abstand, `${pose} Bild ${i} steht ${abstand.toFixed(2)}px von der Pfote`)
          .toBeLessThanOrEqual(1.2);
      }
    }
  });

  it('schiebt das Gerät bei der Murmel aus dem Körper heraus', () => {
    // Die Gegenprobe. Bei geschätztem Ansatz *muss* die Ellipse greifen —
    // sonst steckt das dunkle Blatt im hellen Körper und wird als Gesichtszug
    // gelesen. Die Murmel hat ausdrücklich keinen.
    const blatt = BLAETTER.murmel;
    const koerperH = blatt.cell.h * 0.706;
    let geschoben = 0;
    for (const pose of POSEN) {
      const clip = blatt.clips[pose];
      if (!clip?.hands) continue;
      for (let i = 0; i < clip.holds.length; i++) {
        const h = clip.hands[i] ?? clip.hands[0];
        const hx = h[0] - blatt.anchor.x;
        const hy = h[1] - blatt.anchor.y;
        const a = werkzeugAnsatz(pose, hx, hy, koerperH, 'murmel')!;
        if (Math.hypot(a.x - hx, a.y - hy) > 1.2) geschoben++;
      }
    }
    expect(geschoben, 'kein einziges Gerät wird bei der Murmel herausgeschoben').toBeGreaterThan(0);
  });

  it('kennt für jede werkzeugführende Pose eine Führung', () => {
    for (const pose of POSEN) {
      expect(fuehrtWerkzeug(pose), `${pose} führt kein Werkzeug`).toBe(true);
      expect(werkzeugAnsatz(pose, 0, -6, 12, 'erdmaennchen')).not.toBeNull();
    }
    expect(fuehrtWerkzeug('walking')).toBe(false);
    expect(werkzeugAnsatz('walking', 0, -6, 12)).toBeNull();
  });
});

/**
 * Der Stirnpunkt — und warum ein zweiter Kopfpunkt im Blatt steht.
 *
 * Die Signalschicht des Wuselwerkers ist ein Stirnband. Es liegt am Kopf und
 * muss dessen Neigung folgen; ein Band, das im *Bild* senkrecht über dem
 * Gesicht sitzt, liegt bei jeder Pose mit gesenktem Kopf quer in den Augen.
 * Gemessen war das nicht zu ahnen und auf dem Blatt nicht zu sehen — das Blatt
 * ist richtig, nur das Band lag daneben.
 *
 * Der Backvorgang schreibt deshalb einen zweiten Kopfpunkt mit. Gesicht und
 * Stirn zusammen sind die Hochachse des Kopfes im Bild, und daran hängt alles
 * Weitere: Höhe, Neigung **und** Größe des Bandes.
 */
describe('Der Kopf bringt seine eigene Hochachse mit', () => {
  const blatt = BLAETTER.wuselwerker;

  it('nennt zu jedem Einzelbild einen Stirnpunkt', () => {
    for (const [name, clip] of Object.entries(blatt.clips)) {
      expect(clip.stirn, `${name} ohne Stirnpunkt`).toBeDefined();
      expect(clip.stirn!.length, `${name}: Stirnpunkte je Bild`).toBe(clip.holds.length);
    }
  });

  it('legt die Stirn über das Gesicht, nie darunter', () => {
    for (const [name, clip] of Object.entries(blatt.clips)) {
      clip.stirn!.forEach((st, i) => {
        const g = clip.anchors![i] ?? clip.anchors![0];
        // Kleineres y ist weiter oben — die Zelle zählt von der oberen Ecke.
        expect(st[1], `${name} Bild ${i}: Stirn unter dem Gesicht`).toBeLessThan(g[1]);
      });
    }
  });

  /**
   * Die Achse ist auch das **Maß** des Bandes, nicht nur seine Richtung.
   *
   * In elf der dreizehn Posen misst sie 1,8 bis 1,9 logische Pixel. Die beiden
   * Ausreißer sind gewollt: `saving` schrumpft die Figur beim Entschweben auf
   * die Hälfte, `dying` staucht sie. Ein Band in festen Pixeln bliebe dabei
   * stehen und stünde zuletzt größer da als der Kopf — in Achsen gerechnet
   * schrumpft es mit. Diese Prüfung hält beides fest: dass die Achse eine
   * brauchbare Länge hat und dass sie beim Schrumpfen wirklich mitgeht.
   */
  it('misst eine Achse, die mit der Figur schrumpft', () => {
    const laenge = (name: string, i: number) => {
      const c = blatt.clips[name];
      const g = c.anchors![i] ?? c.anchors![0];
      const s = c.stirn![i] ?? c.stirn![0];
      return Math.hypot(s[0] - g[0], s[1] - g[1]);
    };
    for (const [name, clip] of Object.entries(blatt.clips)) {
      for (let i = 0; i < clip.holds.length; i++) {
        expect(laenge(name, i), `${name} Bild ${i}: Achse zu kurz`).toBeGreaterThan(0.6);
        expect(laenge(name, i), `${name} Bild ${i}: Achse zu lang`).toBeLessThan(3);
      }
    }
    const s = blatt.clips.saving;
    expect(laenge('saving', s.holds.length - 1), 'Achse schrumpft beim Entschweben nicht')
      .toBeLessThan(laenge('saving', 0) * 0.7);
  });
});

/**
 * Der Schirm hängt über der Figur, nicht an ihrer Hand.
 *
 * Er ist das einzige Gerät, für das der gemessene Handpunkt **nicht** gilt, und
 * das hat einen gemessenen Grund: Beide Figuren greifen beim Schweben mit
 * beiden Händen nach oben, und welche davon das Rig als „vorn" meldet,
 * entscheidet der Drehwinkel der Pose. Beim Wuselwerker liegt sie bei x +3,15,
 * beim Erdmännchen bei x −4,65 — ein Schirm an dieser Stelle stünde einmal
 * rechts und einmal links neben der Figur.
 */
describe('Der Schirm', () => {
  it('sitzt auf der Mittellinie über dem Kopf, egal wo die Hand ist', () => {
    const koerperH = 12;
    for (const hx of [-5, -1, 0, 3, 5]) {
      const a = werkzeugAnsatz('floating', hx, -9, koerperH, 'wuselwerker')!;
      expect(a, 'Schweben führt kein Gerät').not.toBeNull();
      expect(a.x, `Handstelle ${hx} verschiebt den Schirm`).toBe(0);
      expect(a.y, 'Schirm hängt nicht über der Figur').toBeLessThan(-koerperH);
    }
  });

  it('gilt für jede Figur mit gebackenen Händen', () => {
    for (const figur of ['murmel', 'erdmaennchen', 'wuselwerker']) {
      expect(werkzeugAnsatz('floating', 2, -8, 12, figur), figur).not.toBeNull();
    }
  });
});

/**
 * Ohne Auftrag kein Band — und warum das eine Prüfung wert ist.
 *
 * Der Wuselwerker hat zuerst auch ohne Beruf ein dunkles Lederband getragen,
 * gedacht als Kleidungsstück. Im Spiel kam zurück: „irgendetwas ist am Haar,
 * was dort nicht hingehört." Ein dunkelbrauner Bogen auf kräftig blauem Haar
 * liest sich bei sechsundzwanzig Bildschirmpixeln nicht als Band, sondern als
 * Zweig.
 *
 * Bemerkenswert daran ist, dass **jede Messung zufrieden war**: Das Band saß zu
 * 98 Prozent im Haar. Geprüft war, ob es sitzt, nie, ob es dort hingehört. Die
 * Prüfung unten kann das auch nicht — aber sie hält die Regel fest, die daraus
 * folgt, damit sie nicht beim nächsten Umbau wieder verlorengeht.
 *
 * Die Zündschnur fällt nicht darunter: `schopfAuftrag` liefert bei `fuse > 0`
 * immer `bomber`, vor jeder anderen Regel. Wer gleich hochgeht, trägt ein Band.
 */
describe('Die Signalschicht ohne Auftrag', () => {
  it('lässt beim Wuselwerker nichts übrig', () => {
    expect(bandFarbe(null)).toBeNull();
  });

  it('zeigt bei jedem Beruf eine Farbe, und dieselbe wie die anderen Figuren', () => {
    for (const skill of ['digger', 'basher', 'miner', 'builder', 'blocker', 'climber',
      'floater', 'bomber'] as const) {
      const f = bandFarbe(skill);
      expect(f, `${skill} ohne Bandfarbe`).not.toBeNull();
      // Eine Figur zu wechseln darf einen Beruf nicht anders einfärben.
      expect(f, `${skill} weicht vom Schopf ab`).toBe(schopfFarbe(skill));
    }
  });

  it('behält bei den beiden anderen Figuren einen Grundton', () => {
    // Sie brauchen ihn: Der Schopf der Murmel ist ihr einziges Merkmal, und die
    // Augenringe machen das Erdmännchen zum Erdmännchen. Der Wuselwerker ist
    // auch ohne Band an blauem Haar und grüner Tunika zu erkennen.
    expect(schopfFarbe(null)).toBeTruthy();
    expect(maskeFarbe(null)).toBeTruthy();
  });
});
