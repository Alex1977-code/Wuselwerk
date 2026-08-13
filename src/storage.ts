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

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Progress) : {};
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
