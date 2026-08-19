import type { World } from './core/world';
import type { LevelDef } from './levels/types';

export interface LevelResult {
  won: boolean;
  bestSaved: number;
  /** Wenigste Skills, mit denen das Level gewonnen wurde. */
  bestSkills: number;
  stars: number;
  /**
   * Ist der Erkundungs-Freibetrag dieses Levels aufgebraucht?
   *
   * Die erste Niederlage in einem noch nie gewonnenen Level kostet kein
   * Leben (`freibetragGilt` in `leben.ts`). Der Merker haengt am Level und
   * nicht am Tag: Ein Level verschenkt genau einen Versuch, und zwar fuer
   * immer — sonst waere er ein taegliches Freikontingent statt eines
   * Kennenlern-Rabatts.
   */
  freibetrag?: boolean;
}

export type Progress = Record<string, LevelResult>;

const KEY = 'wuselwerk.progress.v1';
const GESTEN_KEY = 'wuselwerk.gesten.v1';

/**
 * Welche Gesten-Hinweise schon gesehen wurden.
 *
 * Eigener Schluessel statt eines Feldes im Fortschritt: Der Fortschritt ist
 * nach Level-Id aufgebaut, und ein Hinweis gehoert keinem Level — er gehoert
 * der Hand, die ihn einmal verstanden hat.
 */
export type GesteId = 'halten';

export function gesteGesehen(id: GesteId): boolean {
  try {
    const raw = localStorage.getItem(GESTEN_KEY);
    return raw ? (JSON.parse(raw) as GesteId[]).includes(id) : false;
  } catch {
    return true; // Ohne Speicher lieber kein Hinweis als bei jedem Start einer.
  }
}

export function gesteMerken(id: GesteId): void {
  try {
    const raw = localStorage.getItem(GESTEN_KEY);
    const liste = raw ? (JSON.parse(raw) as GesteId[]) : [];
    if (!liste.includes(id)) liste.push(id);
    localStorage.setItem(GESTEN_KEY, JSON.stringify(liste));
  } catch {
    /* Privatmodus — dann eben jedes Mal. */
  }
}

const UMBAU_KEY = 'wuselwerk.umbau.v1';

/**
 * Level, die unter ihrer alten Id neu gebaut wurden.
 *
 * Eine Level-Id ist ein Platz in der Welt, kein Versprechen auf ein
 * bestimmtes Raetsel. Beim Neubau der ersten Welt sind aus zehn Leveln
 * vierzehn geworden, und die Plaetze 3 bis 10 tragen seitdem voellig andere
 * Level: Was einmal „Der Abgrund" hiess, ist heute „Der Wächter". Der
 * gespeicherte Bestwert dieses Platzes gehoert also einem Raetsel, das es
 * nicht mehr gibt — und er waere sichtbar falsch, weil auch `total` sich
 * geaendert hat: „15 von 10 gerettet" ist keine Bestleistung, sondern ein
 * Anzeigefehler.
 *
 * Deshalb faellt beim ersten Start nach dem Umbau genau das weg, was sich
 * auf das alte Raetsel bezog — Bestwert, Bestzahl und der verbrauchte
 * Erkundungs-Freibetrag. Was bleibt, ist `won` und die Sternzahl: Wer die
 * erste Welt durchgespielt hat, wird nicht an ihren Anfang zurueckgeschickt
 * und verliert kein Sterntor, das er schon passiert hat. Ein Umbau ist
 * unsere Sache, nicht seine.
 */
const UMBAUTEN: Record<string, string[]> = {
  'w1-neubau': ['w1-03', 'w1-04', 'w1-05', 'w1-06', 'w1-07', 'w1-08', 'w1-09', 'w1-10'],
  // Der Sonnenhang hat auf Platz 3 ein anderes Raetsel bekommen: Aus drei
  // losen E96-Bloecken ist der gestufte Hang mit zwei Schraegen geworden,
  // und die alte Aufgabe steht jetzt eine Stufe weiter als w6-04. Par faellt
  // dabei von 3 auf 2 — eine gespeicherte Bestzahl von 3 waere ab sofort
  // die Bestleistung an einer Aufgabe, die es auf diesem Platz nicht mehr
  // gibt. Sie faellt weg, gewonnen und Sterne bleiben.
  'w6-03-neubau': ['w6-03'],
};

function umbautenGelaufen(): string[] {
  try {
    const raw = localStorage.getItem(UMBAU_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    // Ohne Speicher gibt es auch keinen alten Fortschritt, der stoeren
    // koennte: Dann gilt jeder Umbau als erledigt.
    return Object.keys(UMBAUTEN);
  }
}

function umbauAnwenden(p: Progress): Progress {
  const gelaufen = umbautenGelaufen();
  const offen = Object.keys(UMBAUTEN).filter((k) => !gelaufen.includes(k));
  if (offen.length === 0) return p;
  let geaendert = false;
  for (const k of offen) {
    for (const id of UMBAUTEN[k]) {
      const r = p[id];
      if (!r) continue;
      p[id] = {
        won: r.won,
        stars: r.stars,
        bestSaved: 0,
        bestSkills: Number.MAX_SAFE_INTEGER,
      };
      geaendert = true;
    }
  }
  if (geaendert) saveProgress(p);
  try {
    localStorage.setItem(UMBAU_KEY, JSON.stringify([...gelaufen, ...offen]));
  } catch {
    /* Privatmodus — dann eben bei jedem Start noch einmal. Der Umbau ist
       absichtlich wiederholbar: Er nimmt beim zweiten Mal nichts Neues weg. */
  }
  return p;
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return umbauAnwenden(raw ? (JSON.parse(raw) as Progress) : {});
  } catch {
    return {};
  }
}

function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* Privatmodus o. Ä. — dann eben ohne Fortschritt. */
  }
}

/**
 * Drei Sterne pro Level (GDD §8):
 * 1. Quote erreicht  2. alle gerettet  3. unter Par-Skillzahl geloest.
 */
export function starConditions(level: LevelDef, world: World): boolean[] {
  const quota = world.saved >= world.needed;
  return [quota, quota && world.saved === level.total, quota && world.skillsUsed <= level.par];
}

export function starsFor(level: LevelDef, world: World): number {
  return starConditions(level, world).filter(Boolean).length;
}

/**
 * Steht der Erkundungs-Freibetrag dieses Levels noch offen?
 *
 * Er gilt genau einmal je Level und nur, solange das Level noch nie gewonnen
 * wurde. Wer es einmal geschafft hat, kennt es — ab dann kostet jede
 * Niederlage.
 */
export function freibetragOffen(p: Progress, levelId: string): boolean {
  const r = p[levelId];
  return !(r?.won ?? false) && !(r?.freibetrag ?? false);
}

/** Verbraucht den Freibetrag eines Levels. Gibt zurueck, ob er gegriffen hat. */
export function freibetragEinloesen(levelId: string): boolean {
  const p = loadProgress();
  if (!freibetragOffen(p, levelId)) return false;
  const alt = p[levelId];
  p[levelId] = {
    won: alt?.won ?? false,
    bestSaved: alt?.bestSaved ?? 0,
    bestSkills: alt?.bestSkills ?? Number.MAX_SAFE_INTEGER,
    stars: alt?.stars ?? 0,
    freibetrag: true,
  };
  saveProgress(p);
  return true;
}

export function recordResult(level: LevelDef, world: World): LevelResult {
  const p = loadProgress();
  const prev = p[level.id];
  const won = world.saved >= world.needed;
  const stars = starsFor(level, world);
  const next: LevelResult = {
    won: won || (prev?.won ?? false),
    bestSaved: Math.max(prev?.bestSaved ?? 0, world.saved),
    bestSkills: won
      ? Math.min(prev?.bestSkills ?? Number.MAX_SAFE_INTEGER, world.skillsUsed)
      : (prev?.bestSkills ?? Number.MAX_SAFE_INTEGER),
    stars: Math.max(prev?.stars ?? 0, stars),
  };
  p[level.id] = next;
  saveProgress(p);
  return next;
}
