import { SKILLS, type SkillCounts } from './core/types';
import { LEVELS } from './levels';
import type { LevelDef } from './levels/types';
import {
  WELTEN,
  bandBreiteFuer,
  type Belohnung,
  type KartenPunkt,
  type Welt,
} from './levels/welten';
import type { Progress } from './storage';

/**
 * Die Regeln des Fortschritts — was offen ist, was verdient ist, wo die Figur
 * steht.
 *
 * ## Warum das hier steht und nicht im Spiel
 *
 * Alles in dieser Datei ist eine **reine Funktion**: gleicher Spielstand,
 * gleiche Antwort. Kein Zustand, kein `localStorage`, kein Zeichnen. Das ist
 * keine Formsache — die Freischaltung ist die eine Regel, die ein Spieler
 * sofort bemerkt, wenn sie falsch ist, und die man ohne Bildschirm nicht
 * ansieht. Prüfbar heisst hier: `tests/progression.test.ts` kann sich einen
 * beliebigen Spielstand ausdenken und nachrechnen.
 *
 * ## Der Spielstand bleibt, wie er ist
 *
 * `wuselwerk.progress.v1` wird **nicht erweitert**. Alles, was diese Datei
 * beantwortet, folgt aus `won` und `stars` der einzelnen Level. Belohnungen
 * werden nicht gespeichert, sondern *hergeleitet*: Wer alle Level einer Welt
 * geschafft hat, hat ihre Belohnung — immer, auch auf einem anderen Gerät und
 * auch nach einem Umbau des Weltenkatalogs.
 *
 * Damit gibt es keinen Übergang und nichts, was schiefgehen kann: Ein alter
 * Stand mit fünf Leveln liest sich als "fünf geschafft, Welt noch offen". Ein
 * Stand mit unbekannten IDs (weil ein Level umbenannt wurde) verliert genau
 * dieses eine Level und sonst nichts. Beides ohne Sonderbehandlung.
 *
 * ## Das Band
 *
 * Kartenkoordinaten sind Bildschirmbreiten (`x`) und Anteile der Bandhöhe
 * (`y`), siehe `levels/welten.ts`. Die Punkte, die hier herauskommen, liegen
 * bereits im **Gesamtband** — der Versatz der Welt ist eingerechnet.
 */

// --- Katalog ---------------------------------------------------------------

/**
 * Woraus die Karte gebaut wird.
 *
 * Als Parameter durchgereicht statt fest verdrahtet, damit die Tests eine
 * erfundene Welt einsetzen können. Ohne das liesse sich der interessanteste
 * Teil — der Übergang zwischen zwei Welten samt Belohnung — erst prüfen, wenn
 * zwei Welten wirklich gebaut sind.
 */
export interface Katalog {
  welten: Welt[];
  level: LevelDef[];
}

export const KATALOG: Katalog = { welten: WELTEN, level: LEVELS };

// --- Beträge ---------------------------------------------------------------

/**
 * Rückenwind: So viele Werkzeuge mehr gibt es in Leveln, deren **Etappe**
 * bereits vollständig geschafft ist.
 *
 * Der Betrag ist klein und die Bedingung ist der ganze Trick: Er wirkt
 * ausschliesslich rückwärts, auf Rätsel, die der Spieler schon gelöst hat.
 * Nachspielen wird bequemer, das Gleichgewicht künftiger Level bleibt
 * unberührt. Eine Belohnung, die nie ein ungespieltes Rätsel anfasst, kann
 * auch keines kaputtmachen.
 */
export const RUECKENWIND = 1;

// --- Typen -----------------------------------------------------------------

export type LevelZustand = 'gesperrt' | 'offen' | 'geschafft';

export interface LevelKarte {
  id: string;
  def: LevelDef;
  weltId: string;
  /** Nummer innerhalb der Welt, ab 1. */
  nr: number;
  /** Nummer über alle Welten, ab 1. */
  lauf: number;
  /** Name der Etappe (kommt aus `LevelDef.chapter`). */
  etappe: string;
  zustand: LevelZustand;
  sterne: number;
  /**
   * Steht vor diesem Level ein Sterntor? Dann traegt der Punkt eine Plakette
   * mit der Forderung; `fehlen` sagt, wie viele noch fehlen (0 = offen).
   */
  sternTor?: { sterne: number; fehlen: number };
  /** Punkt im Gesamtband. */
  pos: KartenPunkt;
}

export interface EtappeKarte {
  name: string;
  /** Indizes in `WeltKarte.level`, beide einschliesslich. */
  von: number;
  bis: number;
  geschafft: number;
  fertig: boolean;
  /** Rastplatz am Ende der Etappe — dort steht die Laterne. */
  rast: KartenPunkt;
}

export interface WeltKarte {
  welt: Welt;
  /** Nur gebaute Level, in Spielreihenfolge. */
  level: LevelKarte[];
  etappen: EtappeKarte[];
  geschafft: number;
  sterne: number;
  sterneMoeglich: number;
  /** Alle gebauten Level dieser Welt geschafft. */
  fertig: boolean;
  /** Schon betreten — mindestens ein Level ist offen oder geschafft. */
  betreten: boolean;
  belohnung: Belohnung;
  belohnungVerdient: boolean;
  /** Versatz des Weltabschnitts im Gesamtband, in Bildschirmbreiten. */
  bandStart: number;
  bandBreite: number;
  /** Weltentor am Ende des Abschnitts. */
  tor: KartenPunkt;
  /** Name der Welt hinter dem Tor, oder null, wenn keine mehr kommt. */
  torZiel: string | null;
}

export interface FigurStand {
  weltId: string;
  /** Level, auf dem die Figur steht; null heisst: sie steht auf dem Tor. */
  levelId: string | null;
  pos: KartenPunkt;
}

export interface Weltkarte {
  welten: WeltKarte[];
  /** Gesamtbreite des Bandes in Bildschirmbreiten. */
  bandBreite: number;
  figur: FigurStand | null;
  /** Alle verdienten Belohnungen in der Reihenfolge, in der sie fielen. */
  belohnungen: Belohnung[];
  geschafft: number;
  gesamt: number;
  sterne: number;
  sterneMoeglich: number;
}

/** Ein Halt auf dem Band: Level, Rastplatz einer Etappe oder Weltentor. */
export type StationsArt = 'level' | 'rast' | 'tor';

export interface Station {
  art: StationsArt;
  pos: KartenPunkt;
  weltId: string;
  /** Nur bei `art === 'level'` gesetzt. */
  levelId: string | null;
}

export interface Wanderung {
  von: FigurStand | null;
  nach: FigurStand | null;
  /** Punkte, die die Figur der Reihe nach abläuft, Start und Ziel inbegriffen. */
  weg: KartenPunkt[];
  /** Rastplätze, die dabei aufgehen. */
  rasten: KartenPunkt[];
  /** Weltentore, die dabei aufgehen. */
  tore: KartenPunkt[];
  /** Was dieser Schritt neu einbringt. */
  neueBelohnungen: Belohnung[];
  /** Welten, die dieser Schritt abgeschlossen hat. */
  fertigeWelten: Welt[];
}

// --- Spielstand vorsichtig lesen -------------------------------------------

/**
 * Ist dieses Level geschafft?
 *
 * Bewusst misstrauisch: Der Spielstand kommt aus dem `localStorage` und kann
 * alles Mögliche enthalten — einen älteren Aufbau, halb geschriebenes JSON,
 * Reste eines fremden Spiels auf derselben Adresse. Ein Kartenbildschirm, der
 * daran abstürzt, sperrt das ganze Spiel aus.
 */
export function istGeschafft(p: Progress, levelId: string): boolean {
  const r = p ? p[levelId] : undefined;
  return !!r && r.won === true;
}

/** Beste Sternzahl dieses Levels, 0 bis 3. */
export function sternenZahl(p: Progress, levelId: string): number {
  const r = p ? p[levelId] : undefined;
  const s = r?.stars;
  if (typeof s !== 'number' || !isFinite(s) || s <= 0) return 0;
  return Math.min(3, Math.floor(s));
}

// --- Reihenfolge und Freischaltung -----------------------------------------

function gebauteLevel(welt: Welt, k: Katalog): LevelDef[] {
  const out: LevelDef[] = [];
  for (const id of welt.levelIds) {
    const def = k.level.find((l) => l.id === id);
    if (def) out.push(def);
  }
  return out;
}

/** Nur Welten, von denen mindestens ein Level wirklich existiert. */
function gebauteWelten(k: Katalog): { welt: Welt; level: LevelDef[] }[] {
  const out: { welt: Welt; level: LevelDef[] }[] = [];
  for (const welt of k.welten) {
    const level = gebauteLevel(welt, k);
    if (level.length > 0) out.push({ welt, level });
  }
  return out;
}

/** Alle gebauten Level in Spielreihenfolge, über alle Welten hinweg. */
export function spielReihenfolge(k: Katalog = KATALOG): LevelDef[] {
  return gebauteWelten(k).flatMap((w) => w.level);
}

export function weltVon(levelId: string, k: Katalog = KATALOG): Welt | null {
  for (const { welt } of gebauteWelten(k)) {
    if (welt.levelIds.includes(levelId)) return welt;
  }
  return null;
}

/**
 * Offen, gesperrt oder geschafft?
 *
 * Zwei Regeln, und die zweite ist der ganze Unterschied zwischen einer Liste
 * und einer Karte:
 *
 * 1. **Innerhalb einer Welt** ist ein Level offen, sobald sein *Vorgänger*
 *    geschafft ist. Mehr nicht — der Weg ist eine Perlenschnur.
 * 2. **Am Weltanfang** ist das erste Level offen, sobald die *ganze* vorige
 *    Welt steht. Das Weltentor ist also ein echtes Tor und keine Deko: Es geht
 *    genau dann auf, wenn die Belohnung fällt. Ohne diese zweite Regel könnte
 *    ein lückenhafter Spielstand in die nächste Welt durchrutschen, während
 *    die Belohnung dafür ausbleibt — der Spieler stünde in einer neuen Welt
 *    und wüsste nicht, warum er nichts bekommen hat.
 *
 * Ein geschafftes Level bleibt geschafft. Es gibt keinen Weg zurück; ein
 * schlechter zweiter Versuch nimmt nichts weg (siehe `storage.recordResult`,
 * das nur Bestwerte fortschreibt).
 */
export function levelZustand(p: Progress, levelId: string, k: Katalog = KATALOG): LevelZustand {
  if (istGeschafft(p, levelId)) {
    // Nur, wenn es das Level überhaupt (noch) gibt — sonst steht im Spielstand
    // eine Leiche aus einer früheren Fassung.
    return spielReihenfolge(k).some((l) => l.id === levelId) ? 'geschafft' : 'gesperrt';
  }
  const welten = gebauteWelten(k);
  for (let wi = 0; wi < welten.length; wi++) {
    const liste = welten[wi].level;
    const li = liste.findIndex((l) => l.id === levelId);
    if (li < 0) continue;
    // Das Sterntor haelt zu, bis genug Sterne da sind — unabhaengig davon,
    // ob der Vorgaenger steht (Kritik F6: Sterne muessen etwas kaufen).
    const tor = sternTorFuer(levelId, k);
    if (tor && gesamtSterne(p) < tor.sterne) return 'gesperrt';
    if (li > 0) return istGeschafft(p, liste[li - 1].id) ? 'offen' : 'gesperrt';
    if (wi === 0) return 'offen';
    const vorige = welten[wi - 1].level;
    return vorige.every((l) => istGeschafft(p, l.id)) ? 'offen' : 'gesperrt';
  }
  return 'gesperrt';
}

/** Alle je verdienten Sterne, ueber alle Level. */
export function gesamtSterne(p: Progress): number {
  let n = 0;
  for (const id of Object.keys(p)) n += p[id]?.stars ?? 0;
  return n;
}

/**
 * Das Sterntor eines Levels — verlangt es welche, und ist es offen?
 *
 * `null` heisst: Vor diesem Level steht kein Tor. Das Tor gilt nur fuer den
 * Eintritt; ein einmal geschafftes Level bleibt geschafft, auch wenn jemand
 * dem Spielstand Sterne wegnehmen koennte (kann niemand — Bestwerte).
 */
export function sternTorFuer(
  levelId: string,
  k: Katalog = KATALOG,
): { sterne: number } | null {
  for (const w of k.welten) {
    const t = w.sternTor;
    if (!t) continue;
    if (w.levelIds[t.vorIndex] === levelId) return { sterne: t.sterne };
  }
  return null;
}

export function istFreigeschaltet(p: Progress, levelId: string, k: Katalog = KATALOG): boolean {
  return levelZustand(p, levelId, k) !== 'gesperrt';
}

/** Das erste noch nicht geschaffte Level — dort steht die Figur. */
export function naechstesLevel(p: Progress, k: Katalog = KATALOG): LevelDef | null {
  return spielReihenfolge(k).find((l) => !istGeschafft(p, l.id)) ?? null;
}

// --- Belohnungen -----------------------------------------------------------

/** Sind alle gebauten Level dieser Welt geschafft? */
export function weltFertig(p: Progress, weltId: string, k: Katalog = KATALOG): boolean {
  const eintrag = gebauteWelten(k).find((w) => w.welt.id === weltId);
  if (!eintrag) return false;
  return eintrag.level.every((l) => istGeschafft(p, l.id));
}

/**
 * Alle verdienten Belohnungen, in der Reihenfolge der Welten.
 *
 * Eine Welt, die noch kein einziges Level hat, kann auch nichts auszahlen —
 * sonst bekäme man für nichts etwas.
 */
export function verdienteBelohnungen(p: Progress, k: Katalog = KATALOG): Belohnung[] {
  return gebauteWelten(k)
    .filter((w) => w.level.every((l) => istGeschafft(p, l.id)))
    .map((w) => w.welt.belohnung);
}

/** Ist dieser Komfortschlüssel schon verdient? */
export function hatKomfort(p: Progress, id: string, k: Katalog = KATALOG): boolean {
  return verdienteBelohnungen(p, k).some((b) => b.art === 'komfort' && b.id === id);
}

/**
 * Ist die Etappe, in der dieses Level liegt, vollständig geschafft?
 *
 * Etappen stehen nicht eigens im Katalog, sondern ergeben sich aus dem
 * `chapter`-Feld: aufeinanderfolgende Level derselben Welt mit gleichem
 * Kapitelnamen. So steht die Einteilung an genau einer Stelle — im Level
 * selbst, wo sie ohnehin für die Kopfzeile gebraucht wird.
 */
function etappeFertig(p: Progress, level: LevelDef, k: Katalog): boolean {
  for (const { level: liste } of gebauteWelten(k)) {
    const i = liste.findIndex((l) => l.id === level.id);
    if (i < 0) continue;
    let von = i;
    while (von > 0 && liste[von - 1].chapter === level.chapter) von--;
    let bis = i;
    while (bis + 1 < liste.length && liste[bis + 1].chapter === level.chapter) bis++;
    for (let j = von; j <= bis; j++) {
      if (!istGeschafft(p, liste[j].id)) return false;
    }
    return true;
  }
  return false;
}

/**
 * Die Werkzeugzahlen, mit denen dieses Level **geladen** wird.
 *
 * Zwei Regeln, und beide haben eine Grenze eingebaut:
 *
 * 1. **Dauerhafte Werkzeugboni** erhöhen nur Berufe, die das Level *ohnehin
 *    ausgibt*. Ein Level ohne Sprengmeister bekommt auch durch keine Belohnung
 *    einen — sonst wäre die Belohnung kein Bonus, sondern ein anderes Rätsel.
 * 2. **Rückenwind** gibt es nur in Leveln, deren Etappe schon vollständig
 *    geschafft ist. Er kann also nie auf ein ungelöstes Rätsel wirken.
 *
 * Und die Grenze, die beides zusammenhält: Der dritte Stern hängt an
 * `level.par`, also an der Zahl der *benutzten* Werkzeuge. Boni erhöhen den
 * Vorrat, nicht die Musterlösung. Sie können einem also den Durchgang
 * erleichtern, aber niemals die Meisterschaft kaufen.
 *
 * Die Simulation selbst bleibt unberührt: Was hier herauskommt, geht als
 * Startvorrat in `World`, und ab da rechnet das Spiel wie immer.
 */
export function werkzeugeFuer(
  level: LevelDef,
  p: Progress,
  k: Katalog = KATALOG,
): SkillCounts {
  const out = { ...level.skills };
  for (const b of verdienteBelohnungen(p, k)) {
    if (b.art !== 'werkzeug') continue;
    if (out[b.skill] > 0) out[b.skill] += b.anzahl;
  }
  if (etappeFertig(p, level, k)) {
    for (const s of SKILLS) {
      if (out[s] > 0) out[s] += RUECKENWIND;
    }
  }
  return out;
}

/** Das Zeitlimit, mit dem dieses Level geladen wird — in Sekunden. */
export function zeitlimitFuer(level: LevelDef, p: Progress, k: Katalog = KATALOG): number {
  let anteil = 0;
  for (const b of verdienteBelohnungen(p, k)) {
    if (b.art === 'zeit') anteil += b.anteil;
  }
  return Math.round(level.timeLimitSec * (1 + anteil));
}

// --- Karte -----------------------------------------------------------------

function rund(v: number): number {
  return Math.round(v * 1000) / 1000;
}

function mitte(a: KartenPunkt, b: KartenPunkt): KartenPunkt {
  return { x: rund((a.x + b.x) / 2), y: rund((a.y + b.y) / 2) };
}

/**
 * Die reine Geometrie des Bandes: Welcher Abschnitt liegt wo, welcher Punkt
 * gehört zu welchem Level, wo steht das Tor.
 *
 * Hängt **nicht** vom Fortschritt ab. Das ist der Grund, warum es diese
 * Funktion gibt: `figurStand` braucht die Punkte, `weltkarte` braucht
 * `figurStand`, und ohne diese Trennung rechnete jede die andere mit aus.
 */
interface Abschnitt {
  welt: Welt;
  defs: LevelDef[];
  /** Bandpunkte der gebauten Level, schon mit Versatz. */
  punkte: KartenPunkt[];
  bandStart: number;
  bandBreite: number;
  tor: KartenPunkt;
}

function abschnitte(k: Katalog): Abschnitt[] {
  const out: Abschnitt[] = [];
  let bandStart = 0;
  for (const { welt, level: defs } of gebauteWelten(k)) {
    const vollstaendig = defs.length === welt.soll;
    // Fehlt der Welt noch etwas, rückt ihr Abschnitt auf das Gebaute zusammen.
    // Sonst klaffte auf dem Band eine Lücke, in der nichts steht — und nichts
    // ist genau das, was niemand scrollen will.
    const bandBreite = vollstaendig ? welt.bandBreite : bandBreiteFuer(defs.length);
    const punkte = defs.map((_, i) => {
      const lokal = welt.punkte[i] ?? { x: 0.26, y: 0.5 };
      return { x: rund(bandStart + lokal.x), y: lokal.y };
    });
    const letzter = punkte[punkte.length - 1];
    const tor: KartenPunkt = vollstaendig
      ? { x: rund(bandStart + welt.torPunkt.x), y: welt.torPunkt.y }
      : { x: rund(bandStart + bandBreite - 0.1), y: rund((letzter.y + 0.5) / 2) };
    out.push({ welt, defs, punkte, bandStart: rund(bandStart), bandBreite, tor });
    bandStart = rund(bandStart + bandBreite);
  }
  return out;
}

/**
 * Baut den vollständigen Kartenzustand.
 *
 * Das ist die Schnittstelle für den Zeichner: **ein** Aufruf, und darin steht
 * alles, was auf dem Schirm landet. Absichtlich keine Sammlung von zwanzig
 * Einzelabfragen — beim Zeichnen will man nicht dreimal dieselbe Frage
 * stellen, und ein einziger Rückgabewert lässt sich in einem Test vollständig
 * nachrechnen.
 *
 * Gedacht als Aufruf beim Öffnen der Karte und nach jedem Levelende, nicht je
 * Bild: Das Ergebnis ändert sich nur, wenn sich der Spielstand ändert.
 */
export function weltkarte(p: Progress, k: Katalog = KATALOG): Weltkarte {
  const welten: WeltKarte[] = [];
  let lauf = 0;
  let geschafftGesamt = 0;
  let sterneGesamt = 0;
  const teile = abschnitte(k);
  // Ob die vorige Welt steht, entscheidet über das erste Level dieser — die
  // Torregel aus `levelZustand`, hier einmal je Welt statt einmal je Level.
  let vorigeWeltFertig = true;

  for (let wi = 0; wi < teile.length; wi++) {
    const { welt, defs, punkte, bandStart, bandBreite, tor } = teile[wi];

    const level: LevelKarte[] = defs.map((def, i) => {
      lauf++;
      const geschafft = istGeschafft(p, def.id);
      const tor = sternTorFuer(def.id, k);
      const torZu = tor !== null && gesamtSterne(p) < tor.sterne;
      const offen =
        !torZu &&
        (i > 0 ? istGeschafft(p, defs[i - 1].id) : wi === 0 || vorigeWeltFertig);
      const zustand: LevelZustand = geschafft ? 'geschafft' : offen ? 'offen' : 'gesperrt';
      const sterne = sternenZahl(p, def.id);
      if (zustand === 'geschafft') geschafftGesamt++;
      sterneGesamt += sterne;
      return {
        id: def.id,
        def,
        weltId: welt.id,
        nr: i + 1,
        lauf,
        etappe: def.chapter,
        zustand,
        sterne,
        ...(tor
          ? { sternTor: { sterne: tor.sterne, fehlen: Math.max(0, tor.sterne - gesamtSterne(p)) } }
          : {}),
        pos: punkte[i],
      };
    });

    // Etappen aus den Kapitelnamen ableiten.
    const etappen: EtappeKarte[] = [];
    for (let i = 0; i < level.length; i++) {
      const letzte = etappen[etappen.length - 1];
      if (letzte && level[i].etappe === letzte.name) {
        letzte.bis = i;
        continue;
      }
      etappen.push({ name: level[i].etappe, von: i, bis: i, geschafft: 0, fertig: false, rast: level[i].pos });
    }
    for (const e of etappen) {
      let n = 0;
      for (let i = e.von; i <= e.bis; i++) if (level[i].zustand === 'geschafft') n++;
      e.geschafft = n;
      e.fertig = n === e.bis - e.von + 1;
      const naechster = level[e.bis + 1];
      // Der Rastplatz liegt zwischen dem letzten Level der Etappe und dem
      // ersten der nächsten — dort, wo man beim Scrollen ohnehin vorbeikommt.
      e.rast = naechster ? mitte(level[e.bis].pos, naechster.pos) : level[e.bis].pos;
    }

    const geschafft = level.filter((l) => l.zustand === 'geschafft').length;
    const fertig = geschafft === level.length;
    welten.push({
      welt,
      level,
      etappen,
      geschafft,
      sterne: level.reduce((s, l) => s + l.sterne, 0),
      sterneMoeglich: level.length * 3,
      // "Fertig" heisst: alles Gebaute geschafft. Solange eine Welt unfertig
      // gebaut ist, zahlt sie trotzdem aus — sonst hinge die Belohnung an
      // Leveln, die es noch gar nicht gibt, und niemand käme je weiter.
      fertig,
      betreten: level.some((l) => l.zustand !== 'gesperrt'),
      belohnung: welt.belohnung,
      belohnungVerdient: fertig,
      bandStart,
      bandBreite,
      tor,
      torZiel: teile[wi + 1] ? teile[wi + 1].welt.name : null,
    });
    vorigeWeltFertig = fertig;
  }

  const letzterTeil = teile[teile.length - 1];
  return {
    welten,
    bandBreite: letzterTeil ? rund(letzterTeil.bandStart + letzterTeil.bandBreite) : 0,
    figur: figurStand(p, k),
    belohnungen: verdienteBelohnungen(p, k),
    geschafft: geschafftGesamt,
    gesamt: lauf,
    sterne: sterneGesamt,
    sterneMoeglich: lauf * 3,
  };
}

// --- Figur -----------------------------------------------------------------

/**
 * Alle Halte des Bandes in einer Reihe: Level, Rastplätze, Weltentore.
 *
 * Die Figur läuft nicht von Punkt zu Punkt, sondern von Halt zu Halt — nur so
 * kommt sie beim Weltwechsel sichtbar durch das Tor, statt darüber
 * hinwegzuspringen.
 */
export function stationen(k: Katalog = KATALOG): Station[] {
  const out: Station[] = [];
  for (const teil of abschnitte(k)) {
    for (let i = 0; i < teil.defs.length; i++) {
      out.push({
        art: 'level',
        pos: teil.punkte[i],
        weltId: teil.welt.id,
        levelId: teil.defs[i].id,
      });
      // Etappenwechsel? Dann liegt dazwischen ein Rastplatz.
      const naechster = teil.defs[i + 1];
      if (naechster && naechster.chapter !== teil.defs[i].chapter) {
        out.push({
          art: 'rast',
          pos: mitte(teil.punkte[i], teil.punkte[i + 1]),
          weltId: teil.welt.id,
          levelId: null,
        });
      }
    }
    out.push({ art: 'tor', pos: teil.tor, weltId: teil.welt.id, levelId: null });
  }
  return out;
}

/**
 * Wo die Figur steht: auf dem ersten Level, das noch nicht geschafft ist.
 *
 * Nicht auf dem zuletzt gespielten. Der Unterschied fällt auf, sobald jemand
 * ein altes Level wiederholt: Die Figur ist der **Stand**, nicht der Zeiger.
 * Sie wandert nach vorn und nie zurück — sonst hiesse ein Nachspielen von
 * Level 2, dass man wieder bei Level 2 steht, und das wäre eine Strafe fürs
 * Wiederkommen.
 *
 * Ist alles geschafft, steht sie auf dem letzten Weltentor.
 */
export function figurStand(p: Progress, k: Katalog = KATALOG): FigurStand | null {
  const teile = abschnitte(k);
  if (teile.length === 0) return null;
  for (const teil of teile) {
    for (let i = 0; i < teil.defs.length; i++) {
      if (!istGeschafft(p, teil.defs[i].id)) {
        return { weltId: teil.welt.id, levelId: teil.defs[i].id, pos: teil.punkte[i] };
      }
    }
  }
  const letzte = teile[teile.length - 1];
  return { weltId: letzte.welt.id, levelId: null, pos: letzte.tor };
}

/**
 * Was die Figur tut, wenn sich der Spielstand ändert.
 *
 * Aufzurufen mit dem Stand *vor* und *nach* einem Level. Heraus kommt die
 * ganze Choreografie in einem Stück: der Weg, die Rastplätze und Tore, die
 * dabei aufgehen, und was es dafür gibt. Der Zeichner muss daraus nur noch
 * eine Bewegung machen.
 *
 * Bleibt der Stand gleich (ein Level wurde wiederholt, ohne dass etwas Neues
 * dazukam), ist `weg` genau ein Punkt: Die Figur bleibt stehen. Wiederholen
 * bewegt sie nie — auch nicht rückwärts.
 */
export function wanderung(
  vorher: Progress,
  nachher: Progress,
  k: Katalog = KATALOG,
): Wanderung {
  const von = figurStand(vorher, k);
  const nach = figurStand(nachher, k);
  const halte = stationen(k);

  const index = (s: FigurStand | null): number => {
    if (!s) return -1;
    if (s.levelId) return halte.findIndex((h) => h.art === 'level' && h.levelId === s.levelId);
    // Steht sie auf einem Tor, ist es das Tor ihrer Welt.
    return halte.findIndex((h) => h.art === 'tor' && h.weltId === s.weltId);
  };

  const a = index(von);
  const b = index(nach);
  const weg: KartenPunkt[] = [];
  const rasten: KartenPunkt[] = [];
  const tore: KartenPunkt[] = [];
  if (a >= 0 && b >= 0) {
    for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
      weg.push(halte[i].pos);
      if (i > a && b > a) {
        if (halte[i].art === 'rast') rasten.push(halte[i].pos);
        if (halte[i].art === 'tor') tore.push(halte[i].pos);
      }
    }
  }

  const alt = verdienteBelohnungen(vorher, k);
  const neu = verdienteBelohnungen(nachher, k);
  const fertigeWelten = gebauteWelten(k)
    .filter(
      (w) =>
        w.level.every((l) => istGeschafft(nachher, l.id)) &&
        !w.level.every((l) => istGeschafft(vorher, l.id)),
    )
    .map((w) => w.welt);

  return {
    von,
    nach,
    weg,
    rasten,
    tore,
    neueBelohnungen: neu.slice(alt.length),
    fertigeWelten,
  };
}
