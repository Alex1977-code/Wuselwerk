import { Terrain } from '../core/terrain';
import { World } from '../core/world';
import { paintTerrain } from './paint';
import type { LevelDef } from './types';

/** Baut aus einer Leveldefinition eine frische, spielbereite Simulation. */
export function createWorld(level: LevelDef): World {
  const terrain = new Terrain(level.width, level.height);
  paintTerrain(terrain, level.paint, level.seed);
  terrain.markAllDirty();
  return new World({
    terrain,
    entrance: level.entrance,
    exit: level.exit,
    total: level.total,
    needed: level.needed,
    timeLimitSec: level.timeLimitSec,
    releaseRate: level.releaseRate,
    minReleaseRate: level.minReleaseRate,
    skills: level.skills,
  });
}
