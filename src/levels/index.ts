import type { LevelDef } from './types';
import { WELT1_LEVELS } from './welt1';
import { WELT2_LEVELS } from './welt2';
import { WELT3_LEVELS } from './welt3';
import { WELT4_LEVELS } from './welt4';
import { WELT5_LEVELS } from './welt5';
import { WELT6_LEVELS } from './welt6';

/**
 * Die Reihenfolge aller Level — nicht die Einteilung.
 *
 * Welche Level zu welcher Welt gehoeren, steht in `welten.ts`; welches Level
 * offen ist, rechnet `progression.ts` aus. Der Grund fuer die Trennung: Eine
 * Welt ist eine Frage der Dramaturgie und wird sich noch aendern, die
 * Levelzahlen sind es nicht.
 *
 * Das `chapter`-Feld traegt die **Etappe** innerhalb der Welt — drei bis
 * fuenf Level, die dasselbe Thema durchspielen. `progression.ts` liest die
 * Etappen aus diesem Feld, damit dieselbe Zeile nicht zweimal gepflegt
 * werden muss.
 *
 * Seit dem Neubau der ersten Welt steht hier keine Levelbeschreibung mehr:
 * Jede Welt wohnt in ihrer eigenen Datei, diese hier reiht sie nur auf.
 */
export const LEVELS: LevelDef[] = [];

LEVELS.push(...WELT1_LEVELS);
// Welt 2 haengt sich hier an — die Karte findet ihre Level ueber die IDs
// (`welten.ts`): Ein Level existiert, sobald es hier steht, an keiner
// zweiten Stelle.
LEVELS.push(...WELT2_LEVELS);
LEVELS.push(...WELT3_LEVELS);
LEVELS.push(...WELT4_LEVELS);
LEVELS.push(...WELT5_LEVELS);
LEVELS.push(...WELT6_LEVELS);

export function levelById(id: string): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id);
}
