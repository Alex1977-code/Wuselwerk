import type { World } from './core/world';
import type { LevelDef } from './levels/types';

export interface LevelResult {
  won: boolean;
  bestSaved: number;
  /** Wenigste Skills, mit denen das Level gewonnen wurde. */
  bestSkills: number;
  stars: number;
}

export type Progress = Record<string, LevelResult>;

const KEY = 'wuselwerk.progress.v1';

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
