import { State, type SkillId, type Wusel } from './types';

/** Lebt die Figur noch und ist sie ueberhaupt ansprechbar? */
export function isActive(w: Wusel): boolean {
  return (
    w.state !== State.DEAD &&
    w.state !== State.SAVED &&
    w.state !== State.DYING &&
    w.state !== State.SAVING
  );
}

/** Zustaende, in denen die Figur auf festem Boden arbeitet. */
function isWorkingOnGround(w: Wusel): boolean {
  return (
    w.state === State.WALKING ||
    w.state === State.BUILDING ||
    w.state === State.BASHING ||
    w.state === State.MINING ||
    w.state === State.DIGGING
  );
}

/**
 * Kern des intelligenten Zielens (GDD §3.3): Ein Tap bietet nur Figuren an,
 * fuer die der gewaehlte Beruf ueberhaupt gueltig ist. Wer schon klettert,
 * taucht beim Kletterer nicht mehr auf; ein Blocker wird nicht doppelt gesetzt.
 */
export function canAssign(w: Wusel, skill: SkillId): boolean {
  if (!isActive(w)) return false;
  // Ein laufender Countdown laesst sich nicht mehr ueberschreiben.
  if (w.fuse > 0) return false;

  switch (skill) {
    case 'climber':
      return !w.hasClimber;
    case 'floater':
      return !w.hasFloater;
    case 'bomber':
      // Der Sprengmeister geht immer — auch im Fall, auch beim Blocker.
      return true;
    case 'blocker':
      // Nur aus dem Laufen heraus, und niemals doppelt.
      return w.state === State.WALKING;
    case 'builder':
      return isWorkingOnGround(w);
    case 'basher':
      return isWorkingOnGround(w);
    case 'miner':
      return isWorkingOnGround(w);
    case 'digger':
      return isWorkingOnGround(w);
    default:
      return false;
  }
}
