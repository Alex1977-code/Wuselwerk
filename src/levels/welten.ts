import type { SkillId } from '../core/types';
import type { ThemeId } from './types';

/**
 * Die Themenwelten und ihre Karte.
 *
 * Diese Datei ist **reine Beschreibung**: Was es gibt, wie es heisst, wo es auf
 * dem Band liegt, was es am Ende gibt. Was davon *offen* ist, rechnet
 * `progression.ts` aus; gezeichnet wird woanders. Die Trennung ist Absicht —
 * eine Welt umzustellen soll heissen, hier Zahlen zu ändern, und sonst nichts.
 *
 * ## Das Band
 *
 * Die Übersichtskarte ist **ein einziges waagerechtes Band** über alle Welten.
 * Es wird nicht geblättert, es wird gescrollt (Begründung in
 * `docs/weltkarte-entwurf.md`).
 *
 * Gemessen wird in **Bildschirmbreiten**: `x = 1` ist genau eine Breite des
 * quer gehaltenen Geräts, `y` läuft von 0 (oben) bis 1 (unten) der Bandhöhe.
 * Damit ist die Karte auflösungsfrei — der Zeichner multipliziert mit der
 * tatsächlichen Breite und muss nichts umrechnen, wenn ein Gerät schmaler ist.
 * `x` ist hier **weltlokal**; den Versatz im Gesamtband legt `progression.ts`
 * darauf.
 */

export interface KartenPunkt {
  /** Bildschirmbreiten ab Anfang des Weltabschnitts. */
  x: number;
  /** 0 = Oberkante des Bandes, 1 = Unterkante. */
  y: number;
}

/**
 * Was es beim Abschluss einer Welt gibt.
 *
 * Die vier Sorten sind nicht willkürlich, sondern nach ihrer **Wirkung auf
 * ungespielte Rätsel** geordnet:
 *
 * - `werkzeug` — verändert das Gleichgewicht *jedes* Levels. Die stärkste und
 *   gefährlichste Währung. Höchstens zwei im ganzen Spiel (siehe Entwurf).
 * - `zeit` — nimmt Hast, löst aber kein Rätsel. Unbedenklich.
 * - `komfort` — zeigt mehr an, spielt nicht mit. Unbedenklich.
 * - `schmuck` — Aussehen. Wirkungslos und trotzdem begehrt.
 */
export interface BelohnungText {
  titel: string;
  /** Ein Satz für die Belohnungstafel am Weltentor. */
  text: string;
}

export type Belohnung =
  | (BelohnungText & {
      art: 'werkzeug';
      skill: SkillId;
      anzahl: number;
    })
  | (BelohnungText & {
      art: 'zeit';
      /** Anteil auf das Zeitlimit, 0.25 = ein Viertel mehr. */
      anteil: number;
    })
  | (BelohnungText & { art: 'komfort'; id: 'meisterschluessel' })
  | (BelohnungText & { art: 'schmuck'; id: string });

export interface Welt {
  id: string;
  name: string;
  /** Ein Satz, der das Thema trägt — steht als Untertitel über dem Abschnitt. */
  thema: string;
  /**
   * Palette und Musik, mit denen der **Kartenabschnitt** gezeichnet und
   * unterlegt wird. Bewusst auf die Themen beschränkt, die es wirklich gibt:
   * Eine Welt, deren Karte sich nicht zeichnen lässt, ist kein Entwurf.
   */
  kartenTheme: ThemeId;
  /**
   * Eigenes Thema, das die Level dieser Welt einmal tragen sollen. Steht hier
   * als Merkposten, solange es weder Palette noch Musikstück dafür gibt —
   * `ThemeId` in `types.ts` kennt es noch nicht.
   */
  themaGeplant?: string;
  /** Akzentfarbe des Bandabschnitts (Weg, Ring der offenen Punkte). */
  farbe: string;
  /** Sollzahl der Level. Zwischen 10 und 15 — Begründung im Entwurf. */
  soll: number;
  /**
   * Die Level in Spielreihenfolge. Eine ID, zu der es in `LEVELS` keinen
   * Eintrag gibt, ist **noch nicht gebaut**; `progression.ts` lässt sie weg.
   * Dadurch wächst eine Welt allein dadurch in die Karte hinein, dass jemand
   * das Level schreibt — es ist keine zweite Stelle zu pflegen.
   */
  levelIds: string[];
  /** Bandpunkt je Level, gleiche Reihenfolge wie `levelIds`. */
  punkte: KartenPunkt[];
  /** Breite des Weltabschnitts in Bildschirmbreiten. */
  bandBreite: number;
  /** Das Weltentor am Ende des Abschnitts. */
  torPunkt: KartenPunkt;
  belohnung: Belohnung;
}

// --- Bandgeometrie ---------------------------------------------------------

/**
 * Abstand zweier Levelpunkte in Bildschirmbreiten.
 *
 * 0,24 ist keine Geschmacksfrage, sondern folgt aus dem Finger: Bei 640
 * logischen Bildpunkten Breite sind das rund 154 Bildpunkte Abstand. Ein
 * Tippziel braucht 44, die drei Sterne darüber noch einmal 40 — bei engerem
 * Abstand berühren sich die Punkte, bei weiterem sieht man zu wenig Weg auf
 * einmal. So stehen **gut vier Punkte gleichzeitig im Bild**: einer hinter der
 * Figur, die Figur, und zwei, auf die man sich freut.
 */
export const PUNKT_ABSTAND = 0.24;

/** Luft vor dem ersten und hinter dem letzten Punkt. */
const RAND = 0.26;

/**
 * Wellenlänge der Schlangenlinie in Leveln.
 *
 * Sieben: Damit steigt der Weg über gut drei Punkte an und fällt über gut drei
 * wieder ab. Auf dem Bild sieht man also immer eine **ganze Bewegung** — einen
 * Anstieg oder ein Gefälle —, nie eine Zickzacklinie. Kürzere Wellen sehen aus
 * wie ein Sägeblatt, längere wie eine Gerade.
 */
const WELLE = 7;

/** Ausschlag nach oben und unten um die Bandmitte. */
const AUSSCHLAG = 0.26;

function rund(v: number): number {
  return Math.round(v * 1000) / 1000;
}

/**
 * Legt `n` Levelpunkte auf die Schlangenlinie eines Weltabschnitts.
 *
 * Erzeugt statt getippt, weil eine Welt zwischen zehn und fünfzehn Leveln
 * schwankt und von Hand gesetzte Punkte bei jeder Änderung neu gesetzt werden
 * müssten. Wer eine Welt von Hand gestalten will, ersetzt das Ergebnis durch
 * eine eigene Liste — der Rest des Spiels merkt davon nichts.
 */
export function bahn(n: number, phase = 0): KartenPunkt[] {
  const out: KartenPunkt[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      x: rund(RAND + i * PUNKT_ABSTAND),
      y: rund(0.5 + AUSSCHLAG * Math.sin(((i + phase) * 2 * Math.PI) / WELLE)),
    });
  }
  return out;
}

/** Breite des Abschnitts, die zu `bahn(n)` passt. */
export function bandBreiteFuer(n: number): number {
  return rund(RAND * 2 + (n - 1) * PUNKT_ABSTAND);
}

/** Fortlaufende Level-IDs einer Welt: `ids('w2', 3)` -> w2-01, w2-02, w2-03. */
export function ids(praefix: string, n: number): string[] {
  const out: string[] = [];
  for (let i = 1; i <= n; i++) out.push(`${praefix}-${String(i).padStart(2, '0')}`);
  return out;
}

function welt(
  w: Omit<Welt, 'levelIds' | 'punkte' | 'bandBreite' | 'torPunkt'> & { phase?: number },
): Welt {
  const punkte = bahn(w.soll, w.phase ?? 0);
  const breite = bandBreiteFuer(w.soll);
  const letzter = punkte[punkte.length - 1];
  return {
    ...w,
    levelIds: ids(w.id, w.soll),
    punkte,
    bandBreite: breite,
    // Das Tor sitzt hinter dem letzten Punkt, auf halber Höhe zwischen ihm und
    // der Bandmitte: Es soll am Ende des Weges stehen, aber nicht daran kleben.
    torPunkt: { x: rund(breite - 0.1), y: rund((letzter.y + 0.5) / 2) },
  };
}

// --- Die Welten ------------------------------------------------------------

/**
 * Fünf Welten, 10 bis 15 Level, zusammen 64.
 *
 * Warum die Zahl je Welt wächst (10, 12, 13, 14, 15) und warum es fünf sind,
 * steht in `docs/weltkarte-entwurf.md`. Kurz: Die erste Welt muss ihre
 * Belohnung erreichen, bevor die Geduld reisst, und jedes ihrer Level bringt
 * etwas bei — Unterricht ist teuer. Späte Welten variieren ein bekanntes
 * Vokabular, und Variation trägt fünfzehn Level.
 *
 * **Nur Welt 1 ist gebaut.** Für die übrigen stehen die IDs, die Bahn und die
 * Belohnung schon fest; sobald jemand ein Level mit der passenden ID in
 * `LEVELS` schreibt, erscheint es auf der Karte. Welten ohne ein einziges
 * gebautes Level lässt `weltkarte()` weg — die Karte verspricht nichts, was
 * das Spiel nicht halten kann.
 */
export const WELTEN: Welt[] = [
  welt({
    id: 'w1',
    name: 'Grasland',
    thema: 'Weiche Erde, flacher Himmel, alles grabbar. Hier lernt man die acht Berufe.',
    kartenTheme: 'grass',
    farbe: '#63b23f',
    soll: 10,
    belohnung: {
      art: 'werkzeug',
      skill: 'digger',
      anzahl: 1,
      titel: 'Ein Gräber mehr',
      text: 'Jedes Level, das überhaupt einen Gräber ausgibt, gibt ab jetzt einen mehr aus.',
    },
  }),
  welt({
    id: 'w2',
    name: 'Kristallklamm',
    thema: 'Enge Schächte unter Tage. Der Stahl liegt in Adern, das Licht kommt aus der Wand.',
    kartenTheme: 'crystal',
    farbe: '#8aa5e8',
    soll: 12,
    phase: 2,
    belohnung: {
      art: 'zeit',
      anteil: 0.25,
      titel: 'Die längere Uhr',
      text: 'Ein Viertel mehr Zeit in jedem Level — für immer.',
    },
  }),
  welt({
    id: 'w3',
    name: 'Rostwerk',
    thema: 'Eine Halde aus Stahl und Schrott. Wenig ist grabbar, alles ist im Weg.',
    // Bis es eine eigene Palette gibt, trägt der Kartenabschnitt die der Höhle:
    // kühl, metallisch, dunkel — das ist von Rost am wenigsten weit entfernt.
    kartenTheme: 'crystal',
    themaGeplant: 'rust',
    farbe: '#c07a3a',
    soll: 13,
    phase: 4,
    belohnung: {
      art: 'werkzeug',
      skill: 'floater',
      anzahl: 1,
      titel: 'Ein Schirm mehr',
      text: 'Jedes Level, das Schirmspringer ausgibt, gibt ab jetzt einen mehr aus.',
    },
  }),
  welt({
    id: 'w4',
    name: 'Frostklamm',
    thema: 'Hohe, schmale Level. Der Weg führt nach unten, und unten wartet der Aufprall.',
    kartenTheme: 'crystal',
    themaGeplant: 'frost',
    farbe: '#9fd8e8',
    soll: 14,
    phase: 1,
    belohnung: {
      art: 'komfort',
      id: 'meisterschluessel',
      titel: 'Meisterschlüssel',
      text: 'Die Musterlösungszahl steht ab jetzt in jedem Level offen da — auch im ersten Versuch.',
    },
  }),
  welt({
    id: 'w5',
    name: 'Schlot',
    thema: 'Senkrecht in den Berg. Hitze von unten, Zeitdruck von oben.',
    kartenTheme: 'grass',
    themaGeplant: 'magma',
    farbe: '#e2653a',
    soll: 15,
    phase: 5,
    belohnung: {
      art: 'schmuck',
      id: 'goldband',
      titel: 'Goldenes Band',
      text: 'Der ganze Weg wird golden, und die Figur bekommt einen Hut. Sonst nichts — das ist der Witz.',
    },
  }),
];

export function weltById(id: string): Welt | undefined {
  return WELTEN.find((w) => w.id === id);
}
