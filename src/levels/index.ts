import { MAT, SKILLS, type SkillCounts } from '../core/types';
import type { LevelDef } from './types';

/** Fuellt die nicht genannten Berufe mit 0 auf. */
function sk(partial: Partial<SkillCounts>): SkillCounts {
  const out = {} as SkillCounts;
  for (const s of SKILLS) out[s] = partial[s] ?? 0;
  return out;
}

/**
 * Welt 1 — Grasland. Tutorialheimat, alles grabbar, weich (GDD §6).
 * Ein neues Konzept pro Level (GDD §8).
 */
export const LEVELS: LevelDef[] = [
  {
    id: 'w1-01',
    name: 'Grabe dich durch',
    chapter: 'Spaziergang',
    hint: 'Die Tür liegt unter dir. Wähle den Gräber und tippe eine Figur an.',
    theme: 'grass',
    width: 480,
    height: 540,
    seed: 1337,
    entrance: { x: 240, y: 320 },
    exit: { x: 220, y: 436, w: 40, h: 20 },
    total: 10,
    needed: 8,
    timeLimitSec: 90,
    releaseRate: 50,
    minReleaseRate: 30,
    skills: sk({ digger: 5 }),
    par: 1,
    paint: [{ t: 'ground', x: 0, w: 480, y: 380, h: 160, mat: MAT.EARTH, rough: 3 }],
  },
  {
    id: 'w1-02',
    name: 'Die Wand',
    chapter: 'Spaziergang',
    hint: 'Der Rammer gräbt waagerecht. Setze ihn an, bevor die Uhr abläuft.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 4711,
    entrance: { x: 100, y: 340 },
    exit: { x: 596, y: 380, w: 32, h: 26 },
    total: 20,
    needed: 16,
    timeLimitSec: 120,
    releaseRate: 50,
    minReleaseRate: 30,
    skills: sk({ basher: 4, blocker: 2, builder: 2, digger: 1 }),
    par: 1,
    paint: [
      { t: 'ground', x: 0, w: 720, y: 400, h: 140, mat: MAT.EARTH, rough: 2 },
      { t: 'rect', x: 340, y: 250, w: 44, h: 155, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w1-03',
    name: 'Der Abgrund',
    chapter: 'Spaziergang',
    hint: 'Ein Blocker hält den Pulk. Der Brückenbauer schafft den Weg hinüber.',
    theme: 'grass',
    width: 960,
    height: 540,
    seed: 90210,
    entrance: { x: 120, y: 320 },
    exit: { x: 800, y: 360, w: 32, h: 28 },
    total: 20,
    needed: 14,
    timeLimitSec: 150,
    releaseRate: 40,
    minReleaseRate: 25,
    skills: sk({ builder: 6, blocker: 2, bomber: 2, digger: 1, basher: 1 }),
    par: 4,
    paint: [
      { t: 'ground', x: 0, w: 368, y: 380, h: 160, mat: MAT.EARTH, rough: 2 },
      { t: 'ground', x: 392, w: 568, y: 380, h: 160, mat: MAT.EARTH, rough: 2 },
    ],
  },
  {
    id: 'w1-04',
    name: 'Der lange Fall',
    chapter: 'Kniffelig',
    hint: 'Ohne Schirm überlebt das niemand. Halte den Finger auf dem Schirm — dann läuft die Zeit langsamer.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 2024,
    entrance: { x: 80, y: 150 },
    exit: { x: 520, y: 450, w: 32, h: 28 },
    total: 12,
    needed: 6,
    timeLimitSec: 120,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ floater: 8, blocker: 2, builder: 2, climber: 2 }),
    par: 6,
    paint: [
      { t: 'ground', x: 0, w: 720, y: 470, h: 70, mat: MAT.EARTH, rough: 2 },
      { t: 'rect', x: 0, y: 200, w: 264, h: 30, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w1-05',
    name: 'Stahl',
    chapter: 'Kniffelig',
    hint: 'Stahl hält jede Grabung auf. Suche die Stelle, an der er endet.',
    theme: 'grass',
    width: 960,
    height: 540,
    seed: 8088,
    entrance: { x: 160, y: 280 },
    exit: { x: 556, y: 400, w: 32, h: 24 },
    total: 20,
    needed: 14,
    timeLimitSec: 180,
    releaseRate: 35,
    minReleaseRate: 20,
    skills: sk({ digger: 4, basher: 4, miner: 2, blocker: 2, builder: 2 }),
    par: 2,
    paint: [
      { t: 'ground', x: 0, w: 960, y: 340, h: 200, mat: MAT.EARTH, rough: 2 },
      { t: 'rect', x: 120, y: 372, w: 480, h: 14, mat: MAT.STEEL },
      { t: 'rect', x: 600, y: 408, w: 360, h: 12, mat: MAT.STEEL },
    ],
  },
];

export function levelById(id: string): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id);
}
