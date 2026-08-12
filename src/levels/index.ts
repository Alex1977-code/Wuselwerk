import { MAT, SKILLS, type SkillCounts } from '../core/types';
import type { LevelDef } from './types';
import { WELT2_LEVELS } from './welt2';

/** Fuellt die nicht genannten Berufe mit 0 auf. */
function sk(partial: Partial<SkillCounts>): SkillCounts {
  const out = {} as SkillCounts;
  for (const s of SKILLS) out[s] = partial[s] ?? 0;
  return out;
}

/**
 * Welt 1 — Grasland. Tutorialheimat, alles grabbar, weich (GDD §6).
 * Ein neues Konzept pro Level (GDD §8).
 *
 * ## Reihenfolge und Weltzugehörigkeit
 *
 * Diese Liste ist die **Reihenfolge**, nicht die Einteilung. Welche Level zu
 * welcher Welt gehören, steht in `welten.ts`; welches Level offen ist, rechnet
 * `progression.ts` aus. Der Grund für die Trennung: Eine Welt ist eine Frage
 * der Dramaturgie und wird sich noch ändern, die Levelzahlen sind es nicht.
 *
 * Das `chapter`-Feld trägt dabei die **Etappe** innerhalb der Welt — drei bis
 * fünf Level, die dasselbe Thema durchspielen. `progression.ts` liest die
 * Etappen aus diesem Feld, damit dieselbe Zeile nicht zweimal gepflegt werden
 * muss.
 *
 * ## Lehrgang der Welt 1
 *
 * | # | lehrt | setzt voraus |
 * |---|---|---|
 * | 1 | Gräber, senkrecht | — |
 * | 2 | Rammer, waagerecht; die Wand | — |
 * | 3 | Brückenbauer + Blocker; der Abgrund | 2 |
 * | 4 | Schirmspringer; Fokuszeit | — |
 * | 5 | Stahl als Grenze; Schrägbagger | 1, 2 |
 * | 6 | Kletterer — der Weg *über* den Stahl | 5 |
 * | 7 | Sprengmeister; die Zündschnur als Vorhalt | 1, 5 |
 * | 8 | Blocker als Weiche; Brücke unter Zeitdruck | 3 |
 * | 9 | Zwei Gaben auf einer Figur | 4, 6 |
 * | 10 | Prüfung: Brücke, Schacht, Stollen | 1, 2, 3, 5 |
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
  {
    id: 'w1-06',
    name: 'Die Stahlwand',
    chapter: 'Kniffelig',
    hint: 'Kein Werkzeug beisst sich durch Stahl. Der Kletterer geht darüber hinweg.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 6161,
    entrance: { x: 100, y: 390 },
    exit: { x: 620, y: 282, w: 32, h: 24 },
    total: 10,
    needed: 6,
    timeLimitSec: 120,
    releaseRate: 40,
    minReleaseRate: 25,
    skills: sk({ climber: 8, basher: 2, blocker: 2, builder: 2 }),
    // Sechs Kletterer für sechs Gerettete: Der Kletterer ist eine *persönliche*
    // Gabe, keine Bauleistung. Wer das begriffen hat, löst das Level mit
    // genau so vielen Zuweisungen, wie Figuren durchkommen müssen.
    par: 6,
    paint: [
      { t: 'ground', x: 0, w: 400, y: 430, h: 110, mat: MAT.EARTH, rough: 2 },
      { t: 'rect', x: 400, y: 300, w: 320, h: 240, mat: MAT.EARTH },
      // Die Stirnseite der Stufe ist Stahl. Der Rammer funkt daran ab — genau
      // das ist die Lehre aus Level 5, hier als Sperre statt als Umweg.
      { t: 'rect', x: 400, y: 300, w: 10, h: 140, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w1-07',
    name: 'Unter dem Deckel',
    chapter: 'Kniffelig',
    hint: 'Die Stahlplatte hat eine Naht. Nur eine Sprengung öffnet sie — und die Zündschnur brennt fünf Sekunden.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 7007,
    entrance: { x: 100, y: 300 },
    exit: { x: 420, y: 386, w: 32, h: 26 },
    total: 20,
    needed: 14,
    timeLimitSec: 180,
    releaseRate: 45,
    minReleaseRate: 25,
    skills: sk({ bomber: 3, digger: 2, basher: 2, blocker: 2, builder: 2 }),
    // Eine einzige Sprengung genügt. Alles andere ist Nachbesserung.
    par: 1,
    paint: [
      // Dünne Narbe über einer Stahlplatte: Der Gräber räumt die zwei Zentimeter
      // Erde ab und steht dann auf Stahl. Der Sprengmeister räumt beides.
      { t: 'rect', x: 0, y: 339, w: 720, h: 2, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 341, w: 720, h: 3, mat: MAT.STEEL },
      // Die Naht — vier Bildpunkte Erde in der Platte. Sie liegt im
      // Sprengradius, aber nicht im Grabungsfenster: Der Gräber räumt neun
      // Punkte breit und findet darin immer Stahl.
      { t: 'rect', x: 351, y: 341, w: 4, h: 3, mat: MAT.EARTH },
      { t: 'ground', x: 0, w: 720, y: 405, h: 135, mat: MAT.EARTH, rough: 2 },
    ],
  },
  {
    id: 'w1-08',
    name: 'Die Weiche',
    chapter: 'Prüfung',
    hint: 'Rechts geht es abwärts in die Sackgasse. Der Blocker schickt den Pulk nach links — und links wartet der Abgrund aus Level 3.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 8080,
    entrance: { x: 460, y: 340 },
    exit: { x: 80, y: 360, w: 32, h: 26 },
    total: 20,
    needed: 12,
    timeLimitSec: 150,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ blocker: 2, builder: 3, digger: 2, basher: 2, floater: 2 }),
    // Blocker plus Brücke. Beides muss sitzen, bevor der Pulk da ist — deshalb
    // ist dieses Level das erste, das zwei Dinge *gleichzeitig* verlangt.
    par: 2,
    paint: [
      { t: 'ground', x: 0, w: 340, y: 380, h: 160, mat: MAT.EARTH, rough: 2 },
      { t: 'ground', x: 360, w: 200, y: 380, h: 160, mat: MAT.EARTH, rough: 2 },
      // Rechts fällt der Boden ab — überlebbar, aber ohne Rückweg: sechzig
      // Bildpunkte hinunter kommt jeder, sechzig hinauf niemand. Wer nicht
      // eingreift, verliert seine Figuren an eine Sackgasse und nicht an einen
      // Sturz. Das ist die freundlichere Lehre und die deutlichere: Ein Haufen
      // Wusel, der unten hin- und herläuft, sagt mehr als ein Todesschrei.
      { t: 'ground', x: 560, w: 160, y: 440, h: 100, mat: MAT.EARTH, rough: 2 },
    ],
  },
  {
    id: 'w1-09',
    name: 'Auf und ab',
    chapter: 'Prüfung',
    hint: 'Über die Wand hilft nur der Kletterer, hinunter nur der Schirm. Eine Figur darf beides bekommen.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 9009,
    entrance: { x: 100, y: 420 },
    exit: { x: 600, y: 480, w: 32, h: 26 },
    total: 12,
    needed: 6,
    timeLimitSec: 150,
    releaseRate: 35,
    minReleaseRate: 20,
    skills: sk({ climber: 8, floater: 8, blocker: 2, builder: 2 }),
    // Zwei Zuweisungen je geretteter Figur. Die Zahl sieht teuer aus und ist
    // die Lehre: Gaben stapeln sich auf *einer* Figur, sie sind kein Bauwerk
    // für alle.
    par: 12,
    paint: [
      { t: 'ground', x: 0, w: 300, y: 460, h: 80, mat: MAT.EARTH, rough: 2 },
      { t: 'rect', x: 300, y: 180, w: 60, h: 360, mat: MAT.EARTH },
      { t: 'rect', x: 300, y: 180, w: 10, h: 290, mat: MAT.STEEL },
      { t: 'ground', x: 360, w: 360, y: 500, h: 40, mat: MAT.EARTH, rough: 2 },
    ],
  },
  {
    id: 'w1-10',
    name: 'Prüfung im Grasland',
    chapter: 'Prüfung',
    hint: 'Brücke, Schacht, Stollen. Der Stahl über dem Ausgang endet rechts — dort beginnt der Weg nach unten.',
    theme: 'grass',
    width: 960,
    height: 540,
    seed: 10101,
    entrance: { x: 120, y: 300 },
    exit: { x: 690, y: 396, w: 36, h: 24 },
    total: 16,
    needed: 10,
    timeLimitSec: 240,
    releaseRate: 45,
    minReleaseRate: 25,
    skills: sk({ builder: 4, digger: 3, basher: 3, blocker: 3, miner: 2, floater: 2 }),
    // Brücke, Gräber, Rammer — drei Zuweisungen, jede aus einem früheren Level.
    par: 3,
    paint: [
      { t: 'ground', x: 0, w: 424, y: 340, h: 200, mat: MAT.EARTH, rough: 2 },
      { t: 'ground', x: 444, w: 516, y: 340, h: 200, mat: MAT.EARTH, rough: 2 },
      // Die Schlucht hat einen Grund, und der liegt knapp innerhalb der
      // tödlichen Fallhöhe. Wer hineinfällt, lebt und kommt nicht mehr heraus.
      // In der Prüfung soll die Strafe für den zu späten Brückenbauer sichtbar
      // sein, nicht endgültig.
      { t: 'rect', x: 424, y: 410, w: 20, h: 130, mat: MAT.EARTH },
      // Deckel über dem Ausgang: Wer senkrecht darüber gräbt, steht auf Stahl.
      { t: 'rect', x: 560, y: 372, w: 300, h: 10, mat: MAT.STEEL },
      // Sohle des Stollens. Sie stoppt den Gräber auf genau der Höhe, auf der
      // der Rammer waagerecht zum Ausgang durchkommt.
      { t: 'rect', x: 600, y: 410, w: 360, h: 12, mat: MAT.STEEL },
    ],
  },
];

// Welt 2 haengt sich hier an — die Karte findet ihre Level ueber die IDs
// (`welten.ts`): Ein Level existiert, sobald es hier steht, an keiner
// zweiten Stelle.
LEVELS.push(...WELT2_LEVELS);

export function levelById(id: string): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id);
}
