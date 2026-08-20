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
 * Die Übersichtskarte ist **ein einziges senkrechtes Band** über alle Welten.
 * Es wird nicht geblättert, es wird gescrollt — und zwar **nach oben**: Die
 * erste Welt liegt unten, der Fortschritt ist ein Aufstieg. Das ist die
 * natürliche Leserichtung eines Weges auf einem hochkant gehaltenen Gerät,
 * und „weiterkommen heisst höher kommen" erzählt dieselbe Geschichte wie die
 * Sterne und Tore am Weg. (Das Band war zuerst waagerecht — der Wechsel steht
 * auf der Merkliste, die Begründung des Scrollens in
 * `docs/weltkarte-entwurf.md` gilt unverändert.)
 *
 * Gemessen wird in **Bildschirmhöhen**: `y = 1` ist genau eine Höhe des
 * Geräts, gezählt **entlang des Weges** ab Anfang des Weltabschnitts.
 * `x` läuft von 0 bis 1 quer über die Bandbreite. Damit ist die Karte
 * auflösungsfrei — der Zeichner multipliziert mit der tatsächlichen Höhe und
 * muss nichts umrechnen, wenn ein Gerät kürzer ist. `y` ist hier
 * **weltlokal**; den Versatz im Gesamtband legt `progression.ts` darauf.
 */

export interface KartenPunkt {
  /** 0 = linke Kante des Bandes, 1 = rechte. */
  x: number;
  /** Bildschirmhöhen ab Anfang des Weltabschnitts, entlang des Weges. */
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
  // Komfort-Belohnungen sagen etwas an, ohne mitzuspielen. Der
  // Meisterschluessel legt die Par-Zahl offen, das Hoehenband beschriftet die
  // Kanten — die Welt, die das Normhoehen-Raster lehrt, schenkt am Ende
  // seine Beschriftung.
  | (BelohnungText & { art: 'komfort'; id: 'meisterschluessel' | 'hoehenband' })
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
  /**
   * Sterntore: Vor dem Level mit diesem Index (ab 0) verlangt das Band eine
   * Gesamtzahl Sterne. Die uebliche, faire Genre-Mechanik (Kritik F6): Wer nur
   * durchrennt, sammelt vor dem Tor nach — und sieht dabei, wofuer die Sterne
   * da sind. Hoechstens eines je Welt; mehr waeren Schranken statt Tore.
   */
  sternTor?: { vorIndex: number; sterne: number };
  /** Länge des Weltabschnitts entlang des Weges, in Bildschirmhöhen. */
  bandLaenge: number;
  /** Das Weltentor am Ende des Abschnitts. */
  torPunkt: KartenPunkt;
  belohnung: Belohnung;
}

// --- Bandgeometrie ---------------------------------------------------------

/**
 * Abstand zweier Levelpunkte in Bildschirmhöhen.
 *
 * 0,2 ist keine Geschmacksfrage, sondern folgt aus dem Finger: Bei 844
 * Bildpunkten Höhe (hochkant) sind das rund 170 Bildpunkte Abstand, quer bei
 * 390 noch 78 — ein Tippziel braucht 44, die drei Sterne darunter noch einmal
 * 40, und die Schlangenlinie schiebt Nachbarn zusätzlich quer auseinander.
 * So stehen hochkant **gut vier Punkte gleichzeitig im Bild**: einer unter
 * der Figur, die Figur, und zwei, auf die man sich freut.
 */
export const PUNKT_ABSTAND = 0.2;

/** Luft vor dem ersten und hinter dem letzten Punkt. */
const RAND = 0.22;

/**
 * Wellenlänge der Schlangenlinie in Leveln.
 *
 * Sieben: Damit steigt der Weg über gut drei Punkte an und fällt über gut drei
 * wieder ab. Auf dem Bild sieht man also immer eine **ganze Bewegung** — einen
 * Anstieg oder ein Gefälle —, nie eine Zickzacklinie. Kürzere Wellen sehen aus
 * wie ein Sägeblatt, längere wie eine Gerade.
 */
const WELLE = 7;

/** Ausschlag nach links und rechts um die Bandmitte. */
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
      x: rund(0.5 + AUSSCHLAG * Math.sin(((i + phase) * 2 * Math.PI) / WELLE)),
      y: rund(RAND + i * PUNKT_ABSTAND),
    });
  }
  return out;
}

/** Länge des Abschnitts entlang des Weges, die zu `bahn(n)` passt. */
export function bandLaengeFuer(n: number): number {
  return rund(RAND * 2 + (n - 1) * PUNKT_ABSTAND);
}

/** Fortlaufende Level-IDs einer Welt: `ids('w2', 3)` -> w2-01, w2-02, w2-03. */
export function ids(praefix: string, n: number): string[] {
  const out: string[] = [];
  for (let i = 1; i <= n; i++) out.push(`${praefix}-${String(i).padStart(2, '0')}`);
  return out;
}

function welt(
  w: Omit<Welt, 'levelIds' | 'punkte' | 'bandLaenge' | 'torPunkt'> & { phase?: number },
): Welt {
  const punkte = bahn(w.soll, w.phase ?? 0);
  const laenge = bandLaengeFuer(w.soll);
  const letzter = punkte[punkte.length - 1];
  return {
    ...w,
    levelIds: ids(w.id, w.soll),
    punkte,
    bandLaenge: laenge,
    // Das Tor sitzt hinter dem letzten Punkt, quer auf halbem Weg zwischen ihm
    // und der Bandmitte: am Ende des Weges, aber nicht daran klebend.
    torPunkt: { x: rund((letzter.x + 0.5) / 2), y: rund(laenge - 0.1) },
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
 * **Welt 1 und 2 sind gebaut.** Für die übrigen stehen die IDs, die Bahn und
 * die Belohnung schon fest; sobald jemand ein Level mit der passenden ID in
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
    soll: 14,
    // Das Sterntor steht auf der KAPITELGRENZE vor Punkt 9 — dort, wo der
    // Grundkurs endet und die Pruefung beginnt. Zwoelf von vierundzwanzig
    // bis dahin moeglichen Sternen: Wer jedes Lehrstueck nur eben besteht,
    // hat acht und einen Grund, zwei davon besser zu spielen. Im Grundkurs
    // selbst steht nie ein Tor — wer noch lernt, wird nicht aufgehalten.
    sternTor: { vorIndex: 8, sterne: 12 },
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
    soll: 13,
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
    kartenTheme: 'rust',
    farbe: '#c07a3a',
    // 14 seit „Unter dem Hinweg" (Level-Konzept, Paket 2) — damit stimmt
    // die beworbene 66 wieder.
    soll: 14,
    phase: 4,
    // Das Sterntor vor Punkt 8: vierzig Sterne aus bis dahin 87 moeglichen.
    // Wer alles nur eben besteht, hat 29 — und zwei Welten voller Gruende,
    // besser zu werden, bevor die Halde ihre Pruefungen oeffnet.
    sternTor: { vorIndex: 7, sterne: 40 },
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
    kartenTheme: 'frost',
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
    kartenTheme: 'magma',
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
  // --- Der Hundert-Level-Ausbau -------------------------------------------
  //
  // Zwei Welten in der Familie von Grasland, aber am anderen Ende des Spiels:
  // Wer sie erreicht, kennt alle acht Berufe und alle acht Raumbausteine. Der
  // Reiz ist genau dieser Widerspruch — die freundlichste Kulisse traegt die
  // haerteste Architektur. Getrennt sind die beiden durch das Licht: der
  // Sonnenhang bekommt Nachmittagslicht von Westen und einen Horizont, die
  // Wipfelweide Licht von oben durchs Laub und gar keinen.
  welt({
    id: 'w6',
    name: 'Sonnenhang',
    thema: 'Terrassen im Nachmittagslicht. Was von weitem wie eine Wiese aussieht, hat vier Stockwerke.',
    kartenTheme: 'sonnenhang',
    farbe: '#d9a441',
    // Siebzehn von siebzehn. Der Sonnenhang ist vollstaendig.
    soll: 17,
    phase: 3,
    belohnung: {
      art: 'komfort',
      id: 'hoehenband',
      titel: 'Das Höhenband',
      text: 'Jede Kante schreibt ab jetzt ihre Normhöhe an, solange der Finger auf dem Glas liegt: 48, 72, 96, 120.',
    },
  }),
  welt({
    id: 'w7',
    name: 'Wipfelweide',
    thema: 'Ein Wald von oben. Der Boden ist weit unten, und die Äste sind die Straßen.',
    kartenTheme: 'wipfel',
    // Moosgruen, und bewusst ein anderes als Graslands #63b23f: Die beiden
    // gruenen Welten stehen am Anfang und am Ende des Spiels und duerfen auf
    // der Karte nicht verwechselbar sein. Grasland ist gelbgruen, die
    // Wipfelweide blaugruen — derselbe Unterschied wie zwischen ihren
    // Paletten.
    farbe: '#4fa77a',
    // Null von siebzehn gebaut. Der Eintrag steht trotzdem schon hier: Ohne
    // ihn kann kein Level dieser Welt zugeordnet werden. Auf der Karte
    // erscheint sie deshalb noch nicht — `gebauteWelten` in progression.ts
    // wirft Welten ohne ein einziges gebautes Level heraus, und genau so
    // soll es sein.
    soll: 17,
    phase: 6,
    belohnung: {
      art: 'schmuck',
      id: 'blattkranz',
      titel: 'Der Blattkranz',
      text: 'Die Karte bekommt ein Blätterdach, durch das Licht auf den Weg fällt — und die Figur trägt einen Kranz. Wer alle Level mit drei Sternen hat, bekommt ihn in Gold.',
    },
  }),
];

export function weltById(id: string): Welt | undefined {
  return WELTEN.find((w) => w.id === id);
}
