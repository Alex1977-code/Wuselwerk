import { MAT, SKILLS, type SkillCounts } from '../core/types';
import type { LevelDef } from './types';

function sk(partial: Partial<SkillCounts>): SkillCounts {
  const out = {} as SkillCounts;
  for (const s of SKILLS) out[s] = partial[s] ?? 0;
  return out;
}

/**
 * Welt 2 — die Kristallklamm.
 *
 * „Enge Schächte unter Tage. Der Stahl liegt in Adern, das Licht kommt aus der
 * Wand." (`welten.ts`). Zwölf Level, drei Kapitel: **Abstieg** lernt die
 * Klamm kennen, **Stollen** arbeitet in ihr, **Klamm** prüft.
 *
 * ## Die Entwurfsregeln, geerbt aus Welt 1
 *
 * 1. **Jedes Level variiert Bekanntes.** Welt 1 hat alle acht Berufe gelehrt;
 *    hier wird kein neuer eingeführt, sondern das Vokabular in Fels und Stahl
 *    übersetzt. Variation trägt zwölf Level, Unterricht wäre doppelt.
 * 2. **Fallhöhen unter 60.** Die tödliche Grenze liegt bei 78; alles hier
 *    bleibt eine Handbreit darunter, sofern nicht ausdrücklich der Schirm die
 *    Lehre ist. Sackgassen strafen mit Warten, nicht mit Sterben.
 * 3. **Die Decke gehört zum Level.** Jede Höhle hat einen Felsdeckel — er
 *    macht aus einem Level mit Boden einen Ort unter Tage, und der Kletterer
 *    dreht an ihm um, wie es die Simulation immer schon konnte.
 * 4. **Stahl ist die Sprache dieser Welt.** In Welt 1 war er die Ausnahme,
 *    hier ist er die Regel: Adern, Deckel und Stirnseiten sagen, wo gearbeitet
 *    werden kann — und wo nur ein anderer Weg hilft.
 */
export const WELT2_LEVELS: LevelDef[] = [
  {
    id: 'w2-01',
    name: 'Abstieg',
    chapter: 'Abstieg',
    hint: 'Willkommen unter Tage. Der Weg führt über die Kante — der Fall ist kürzer, als er aussieht.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21001,
    entrance: { x: 110, y: 224 },
    exit: { x: 610, y: 316, w: 32, h: 26 },
    total: 10,
    needed: 8,
    timeLimitSec: 90,
    releaseRate: 50,
    minReleaseRate: 30,
    skills: sk({ digger: 2 }),
    // Reines Ankommen: Wer nur laufen lässt, gewinnt mit null Zuweisungen.
    par: 0,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 720, h: 26, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 400, y: 280, h: 260, mat: MAT.ROCK, rough: 2 },
      // Die Kante: 56 Bildpunkte hinunter — überlebbar, und von unten führt
      // kein Weg zurück. Genau das ist die erste Lektion der Klamm.
      { t: 'ground', x: 400, w: 320, y: 336, h: 204, mat: MAT.ROCK, rough: 2 },
    ],
  },
  {
    id: 'w2-02',
    name: 'Die erste Ader',
    chapter: 'Abstieg',
    hint: 'Unter dem Boden liegt Stahl. Grabe dort, wo die Ader endet.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21002,
    entrance: { x: 160, y: 280 },
    // Die Tür liegt 60 Bildpunkte unter der Oberfläche — tief genug, dass man
    // graben muss, flach genug, dass der Sturz in den Schacht niemanden tötet
    // (Grenze: 78).
    exit: { x: 570, y: 400, w: 36, h: 22 },
    total: 12,
    needed: 9,
    timeLimitSec: 120,
    releaseRate: 45,
    minReleaseRate: 25,
    skills: sk({ digger: 4, blocker: 1 }),
    par: 1,
    paint: [
      { t: 'rect', x: 0, y: 80, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 720, y: 340, h: 200, mat: MAT.ROCK, rough: 2 },
      // Die Ader: Stahl dicht unter der Oberfläche, bis auf das letzte Drittel.
      // Wer links gräbt, steht nach neun Bildpunkten auf Metall.
      { t: 'rect', x: 0, y: 368, w: 500, h: 12, mat: MAT.STEEL },
      // Der Ausgang liegt begraben, rechts der Ader.
    ],
  },
  {
    id: 'w2-03',
    name: 'Der Kamin',
    chapter: 'Abstieg',
    hint: 'Die Wand trägt eine Stahlhaut — kein Stollen hilft. Der Kletterer nimmt den Kamin.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21003,
    entrance: { x: 90, y: 380 },
    exit: { x: 620, y: 166, w: 32, h: 26 },
    total: 10,
    needed: 6,
    timeLimitSec: 120,
    releaseRate: 40,
    minReleaseRate: 25,
    skills: sk({ climber: 8, blocker: 2, builder: 2 }),
    // Der Kletterer ist eine persönliche Gabe: sechs Gerettete, sechs Gaben.
    par: 6,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 420, y: 430, h: 110, mat: MAT.ROCK, rough: 2 },
      // Der Block, auf dem der Ausgang steht. Seine Stirnseite ist Stahl —
      // die Lehre aus dem Grasland, hier als Bauteil der Klamm.
      { t: 'rect', x: 420, y: 190, w: 300, h: 350, mat: MAT.ROCK },
      { t: 'rect', x: 420, y: 190, w: 10, h: 240, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w2-04',
    name: 'Kristallspalt',
    chapter: 'Abstieg',
    hint: 'Der Spalt ist tief und sein Grund eine Falle ohne Ausgang. Ein Blocker hält den Pulk, die Brücke trägt ihn.',
    theme: 'crystal',
    width: 960,
    height: 540,
    seed: 21004,
    entrance: { x: 120, y: 320 },
    exit: { x: 800, y: 356, w: 32, h: 28 },
    total: 20,
    needed: 14,
    timeLimitSec: 150,
    releaseRate: 40,
    minReleaseRate: 25,
    skills: sk({ builder: 6, blocker: 2, bomber: 2, digger: 1, basher: 1 }),
    par: 4,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 960, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 368, y: 380, h: 160, mat: MAT.ROCK, rough: 2 },
      { t: 'ground', x: 392, w: 568, y: 380, h: 160, mat: MAT.ROCK, rough: 2 },
      // Der Grund des Spalts, knapp unter der Überlebensgrenze erreichbar:
      // Wer fällt, lebt — und läuft unten zwischen zwei Wänden.
      { t: 'rect', x: 368, y: 434, w: 24, h: 106, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w2-05',
    name: 'Schräg hinab',
    chapter: 'Stollen',
    hint: 'Der Schrägbagger arbeitet nach vorn unten. Unten links wartet eine Kammer — und in ihr die Tür.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21005,
    entrance: { x: 560, y: 240 },
    exit: { x: 150, y: 454, w: 32, h: 26 },
    total: 12,
    needed: 8,
    timeLimitSec: 150,
    releaseRate: 40,
    minReleaseRate: 25,
    skills: sk({ miner: 3, digger: 2, blocker: 2 }),
    par: 1,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 720, y: 300, h: 240, mat: MAT.ROCK, rough: 2 },
      // Die Kammer mit der Tür. Sie liegt genau dort, wo die 2:1-Schräge des
      // Baggers ankommt: Start bei x 430 auf der Oberfläche, zwei Bildpunkte
      // seitwärts je einem hinunter — bei x 208 ist er 111 tief und bricht
      // durch die Kammerdecke.
      { t: 'rect', x: 100, y: 410, w: 180, h: 70, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w2-06',
    name: 'Die Naht',
    chapter: 'Stollen',
    hint: 'Unter dem Staub liegt eine Stahlplatte mit einer Naht. Nur der Sprengmeister öffnet sie.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21006,
    entrance: { x: 110, y: 300 },
    exit: { x: 420, y: 386, w: 32, h: 26 },
    total: 20,
    needed: 14,
    timeLimitSec: 180,
    releaseRate: 45,
    minReleaseRate: 25,
    skills: sk({ bomber: 3, digger: 2, basher: 2, blocker: 2, builder: 2 }),
    par: 1,
    paint: [
      { t: 'rect', x: 0, y: 80, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 339, w: 720, h: 2, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 341, w: 720, h: 3, mat: MAT.STEEL },
      // Die Naht sitzt weiter links als im Grasland — wer sie dort sucht, wo
      // sie beim letzten Mal war, sucht falsch.
      { t: 'rect', x: 287, y: 341, w: 4, h: 3, mat: MAT.EARTH },
      { t: 'ground', x: 0, w: 720, y: 405, h: 135, mat: MAT.ROCK, rough: 2 },
    ],
  },
  {
    id: 'w2-07',
    name: 'Lichtschacht',
    chapter: 'Stollen',
    hint: 'Der Schacht ist tiefer, als ein Körper aushält. Nur unter dem Schirm kommt man unten an.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21007,
    entrance: { x: 80, y: 140 },
    exit: { x: 620, y: 456, w: 32, h: 26 },
    total: 12,
    needed: 6,
    timeLimitSec: 120,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ floater: 8, blocker: 2, builder: 2 }),
    par: 6,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 24, mat: MAT.ROCK },
      // Der Vorsprung, auf dem alle ankommen — und von dessen Kante der
      // Schacht faellt: 280 Bildpunkte, weit jenseits der Grenze. Nur unter
      // dem Schirm kommt man unten an.
      { t: 'rect', x: 0, y: 200, w: 500, h: 340, mat: MAT.ROCK },
      { t: 'ground', x: 500, w: 220, y: 480, h: 60, mat: MAT.ROCK, rough: 2 },
    ],
  },
  {
    id: 'w2-08',
    name: 'Gegenstrom',
    chapter: 'Stollen',
    hint: 'Rechts führt der Weg bequem in eine Sackgasse. Der Blocker dreht den Strom — links wartet der Spalt.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21008,
    entrance: { x: 460, y: 340 },
    exit: { x: 80, y: 360, w: 32, h: 26 },
    total: 20,
    needed: 12,
    timeLimitSec: 150,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ blocker: 2, builder: 3, digger: 2, basher: 2, floater: 2 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 80, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 340, y: 380, h: 160, mat: MAT.ROCK, rough: 2 },
      { t: 'ground', x: 360, w: 200, y: 380, h: 160, mat: MAT.ROCK, rough: 2 },
      { t: 'ground', x: 560, w: 160, y: 440, h: 100, mat: MAT.ROCK, rough: 2 },
    ],
  },
  {
    id: 'w2-09',
    name: 'Adern und Deckel',
    chapter: 'Klamm',
    hint: 'Zwei Adern, versetzt. Wo die obere endet, beginnt der Weg — und die untere trägt den Stollen zur Tür.',
    theme: 'crystal',
    width: 960,
    height: 540,
    seed: 21009,
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
      { t: 'rect', x: 0, y: 70, w: 960, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 960, y: 340, h: 200, mat: MAT.ROCK, rough: 2 },
      { t: 'rect', x: 120, y: 372, w: 480, h: 14, mat: MAT.STEEL },
      { t: 'rect', x: 600, y: 408, w: 360, h: 12, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w2-10',
    name: 'Empor',
    chapter: 'Klamm',
    hint: 'Hinauf hilft nur der Kletterer, hinunter nur der Schirm. Die Klamm verlangt beides von derselben Figur.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21010,
    entrance: { x: 100, y: 420 },
    exit: { x: 600, y: 480, w: 32, h: 26 },
    total: 12,
    needed: 6,
    timeLimitSec: 150,
    releaseRate: 35,
    minReleaseRate: 20,
    skills: sk({ climber: 8, floater: 8, blocker: 2, builder: 2 }),
    par: 12,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 300, y: 460, h: 80, mat: MAT.ROCK, rough: 2 },
      { t: 'rect', x: 300, y: 180, w: 60, h: 360, mat: MAT.ROCK },
      { t: 'rect', x: 300, y: 180, w: 10, h: 290, mat: MAT.STEEL },
      { t: 'ground', x: 360, w: 360, y: 500, h: 40, mat: MAT.ROCK, rough: 2 },
    ],
  },
  {
    id: 'w2-11',
    name: 'Auf Zeit',
    chapter: 'Klamm',
    hint: 'Zwei Grabungen, eine knappe Uhr. Wer den Nachschub drosselt, verliert weniger an die Wartezeit.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21011,
    entrance: { x: 90, y: 270 },
    exit: { x: 560, y: 354, w: 36, h: 26 },
    total: 14,
    needed: 10,
    timeLimitSec: 110,
    releaseRate: 55,
    minReleaseRate: 20,
    skills: sk({ digger: 3, basher: 3, blocker: 1 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 720, y: 330, h: 210, mat: MAT.ROCK, rough: 2 },
      // Die Stahlsohle faengt den Schacht: erst graben, dann auf der Sohle
      // nach rechts rammen — die Tuer liegt im Fels auf der Sohle.
      { t: 'rect', x: 0, y: 380, w: 720, h: 12, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w2-12',
    name: 'Prüfung in der Klamm',
    chapter: 'Klamm',
    hint: 'Spalt, Ader, Kamin — alles auf einmal. Der Stahl über der Tür endet rechts.',
    theme: 'crystal',
    width: 960,
    height: 540,
    seed: 21012,
    entrance: { x: 120, y: 300 },
    exit: { x: 690, y: 396, w: 36, h: 24 },
    total: 16,
    needed: 10,
    timeLimitSec: 240,
    releaseRate: 45,
    minReleaseRate: 25,
    skills: sk({ builder: 4, digger: 3, basher: 3, blocker: 3, miner: 2, floater: 2 }),
    par: 3,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 960, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 424, y: 340, h: 200, mat: MAT.ROCK, rough: 2 },
      { t: 'ground', x: 444, w: 516, y: 340, h: 200, mat: MAT.ROCK, rough: 2 },
      { t: 'rect', x: 424, y: 410, w: 20, h: 130, mat: MAT.ROCK },
      { t: 'rect', x: 560, y: 372, w: 300, h: 10, mat: MAT.STEEL },
      { t: 'rect', x: 600, y: 410, w: 360, h: 12, mat: MAT.STEEL },
    ],
  },
];
