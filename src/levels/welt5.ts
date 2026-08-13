import { MAT, SKILLS, type SkillCounts } from '../core/types';
import type { LevelDef } from './types';

function sk(partial: Partial<SkillCounts>): SkillCounts {
  const out = {} as SkillCounts;
  for (const s of SKILLS) out[s] = partial[s] ?? 0;
  return out;
}

/**
 * Welt 5 — der Schlot.
 *
 * „Senkrecht in den Berg. Hitze von unten, Zeitdruck von oben."
 * (`welten.ts`). Fuenfzehn Level, drei Kapitel: **Krater**, **Ader**,
 * **Kern**.
 *
 * ## Die eine Entwurfsregel dieser Welt
 *
 * **Der Schlot erfindet nichts — er beschleunigt.** Die Abschlusswelt
 * variiert das ganze Vokabular der vier Welten davor unter brutalen Uhren:
 * Dieselben bewiesenen Geometrien (die Koordinaten stimmen mit den
 * Quell-Leveln ueberein, ihre Musterloesungen gelten woertlich weiter),
 * aber die Zeit ist halbiert und der Nachschub schneller. Das ist die
 * ehrliche Form einer Pruefungswelt: Wer die Wege kennt, gewinnt hier
 * gegen die Uhr, nicht gegen neue Raetsel. Und es folgt dem Entwurf
 * (`docs/weltkarte-entwurf.md`): Variation traegt fuenfzehn Level,
 * Unterricht waere doppelt.
 */
export const WELT5_LEVELS: LevelDef[] = [
  {
    id: 'w5-01',
    name: 'Hinab in den Schlot',
    chapter: 'Krater',
    hint: 'Absatz für Absatz in den Berg. Die Uhr läuft ab jetzt immer.',
    theme: 'magma',
    width: 480,
    height: 620,
    seed: 51001,
    entrance: { x: 240, y: 140 },
    exit: { x: 224, y: 390, w: 32, h: 26 },
    total: 10,
    needed: 8,
    timeLimitSec: 100,
    releaseRate: 55,
    minReleaseRate: 35,
    skills: sk({ digger: 1 }),
    par: 0,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 200, w: 380, h: 12, mat: MAT.ROCK },
      { t: 'rect', x: 100, y: 270, w: 380, h: 12, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 340, w: 380, h: 12, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 480, y: 410, h: 210, mat: MAT.ROCK, rough: 2 },
    ],
  },
  {
    id: 'w5-02',
    name: 'Aschenschacht',
    chapter: 'Krater',
    hint: 'Grabe durch die Asche — aber flink: Die Uhr im Schlot kennt keine Gnade.',
    theme: 'magma',
    width: 480,
    height: 540,
    seed: 51002,
    entrance: { x: 240, y: 320 },
    exit: { x: 220, y: 436, w: 40, h: 20 },
    total: 10,
    needed: 8,
    timeLimitSec: 60,
    releaseRate: 55,
    minReleaseRate: 30,
    skills: sk({ digger: 5 }),
    par: 1,
    paint: [{ t: 'ground', x: 0, w: 480, y: 380, h: 160, mat: MAT.EARTH, rough: 3 }],
  },
  {
    id: 'w5-03',
    name: 'Glutbrücke',
    chapter: 'Krater',
    hint: 'Der Spalt, der Blocker, die Brücke — alles wie gehabt, nur die Zeit ist halbiert.',
    theme: 'magma',
    width: 960,
    height: 540,
    seed: 51003,
    entrance: { x: 120, y: 320 },
    exit: { x: 800, y: 360, w: 32, h: 28 },
    total: 20,
    needed: 14,
    timeLimitSec: 100,
    releaseRate: 55,
    minReleaseRate: 25,
    skills: sk({ builder: 3, blocker: 1, bomber: 1 }),
    par: 4,
    paint: [
      { t: 'ground', x: 0, w: 368, y: 380, h: 160, mat: MAT.EARTH, rough: 2 },
      { t: 'ground', x: 392, w: 568, y: 380, h: 160, mat: MAT.EARTH, rough: 2 },
    ],
  },
  {
    id: 'w5-04',
    name: 'Heisse Naht',
    chapter: 'Krater',
    hint: 'Die Platte hat eine Naht, die Zündschnur fünf Sekunden — und du kaum mehr.',
    theme: 'magma',
    width: 720,
    height: 540,
    seed: 51004,
    entrance: { x: 100, y: 300 },
    exit: { x: 420, y: 386, w: 32, h: 26 },
    total: 20,
    needed: 14,
    timeLimitSec: 90,
    releaseRate: 55,
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
    id: 'w5-05',
    name: 'Der Abzweig',
    chapter: 'Krater',
    hint: 'Rechts die Sackgasse, links der Weg. Entscheide dich schneller als der Pulk.',
    theme: 'magma',
    width: 720,
    height: 540,
    seed: 51005,
    entrance: { x: 460, y: 340 },
    exit: { x: 80, y: 360, w: 32, h: 26 },
    total: 20,
    needed: 12,
    timeLimitSec: 85,
    releaseRate: 45,
    minReleaseRate: 20,
    skills: sk({ blocker: 1, builder: 2 }),
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
    id: 'w5-06',
    name: 'Ader auf Zeit',
    chapter: 'Ader',
    hint: 'Zwei Grabungen auf der erkalteten Sohle. Die Uhr ist der eigentliche Gegner.',
    theme: 'magma',
    width: 720,
    height: 540,
    seed: 51006,
    entrance: { x: 90, y: 270 },
    exit: { x: 560, y: 354, w: 36, h: 26 },
    total: 14,
    needed: 10,
    timeLimitSec: 60,
    releaseRate: 65,
    minReleaseRate: 20,
    skills: sk({ digger: 2, basher: 1 }),
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
    id: 'w5-07',
    name: 'Schräg in die Glut',
    chapter: 'Ader',
    hint: 'Die Schräge trifft die Kammer — wenn du sie ansetzt, bevor die Hitze steigt.',
    theme: 'magma',
    width: 720,
    height: 540,
    seed: 51007,
    entrance: { x: 560, y: 240 },
    exit: { x: 150, y: 454, w: 32, h: 26 },
    total: 12,
    needed: 8,
    timeLimitSec: 110,
    releaseRate: 45,
    minReleaseRate: 25,
    skills: sk({ miner: 2 }),
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
    id: 'w5-08',
    name: 'Doppelader',
    chapter: 'Ader',
    hint: 'Zwei erkaltete Adern, versetzt. Der Weg dazwischen war noch nie so knapp.',
    theme: 'magma',
    width: 960,
    height: 540,
    seed: 51008,
    entrance: { x: 160, y: 280 },
    exit: { x: 556, y: 400, w: 32, h: 24 },
    total: 20,
    needed: 14,
    timeLimitSec: 110,
    releaseRate: 45,
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
    id: 'w5-09',
    name: 'Kaminzug',
    chapter: 'Ader',
    hint: 'Die Wand trägt eine erkaltete Haut. Sechs Kletterer, achtzig Sekunden.',
    theme: 'magma',
    width: 720,
    height: 540,
    seed: 51009,
    entrance: { x: 100, y: 390 },
    exit: { x: 620, y: 282, w: 32, h: 24 },
    total: 10,
    needed: 6,
    timeLimitSec: 65,
    releaseRate: 45,
    minReleaseRate: 25,
    skills: sk({ climber: 7 }),
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
    id: 'w5-10',
    name: 'Lavafall',
    chapter: 'Ader',
    hint: 'Der Schacht ist tiefer, als ein Körper aushält — und die Uhr kürzer, als du denkst.',
    theme: 'magma',
    width: 720,
    height: 540,
    seed: 51010,
    entrance: { x: 80, y: 140 },
    exit: { x: 620, y: 456, w: 32, h: 26 },
    total: 12,
    needed: 6,
    timeLimitSec: 90,
    releaseRate: 35,
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
    id: 'w5-11',
    name: 'Kernbohrung',
    chapter: 'Kern',
    hint: 'Senkrecht aufs Blech, waagerecht ins Freie — im Kern zählt jede Sekunde doppelt.',
    theme: 'magma',
    width: 720,
    height: 540,
    seed: 51011,
    entrance: { x: 360, y: 200 },
    exit: { x: 620, y: 340, w: 32, h: 26 },
    total: 14,
    needed: 10,
    timeLimitSec: 100,
    releaseRate: 50,
    minReleaseRate: 25,
    skills: sk({ digger: 2, basher: 1 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 720, y: 430, h: 110, mat: MAT.ROCK, rough: 2 },
      // Der Schuttberg mit dem Blech im Bauch.
      { t: 'rect', x: 200, y: 260, w: 320, h: 170, mat: MAT.EARTH },
      { t: 'rect', x: 200, y: 310, w: 320, h: 12, mat: MAT.STEEL },
      // Zwei Pfosten halten den Pulk oben zusammen.
      { t: 'rect', x: 200, y: 200, w: 10, h: 60, mat: MAT.ROCK },
      { t: 'rect', x: 510, y: 200, w: 10, h: 60, mat: MAT.ROCK },
      // Das Sims, auf dem der Stollen endet.
      { t: 'rect', x: 520, y: 360, w: 200, h: 70, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w5-12',
    name: 'Zwei Hände',
    chapter: 'Kern',
    hint: 'Zwei Spalte, eine Hand, halbe Zeit. Der Blocker hält, was du dir leisten kannst.',
    theme: 'magma',
    width: 960,
    height: 540,
    seed: 51012,
    entrance: { x: 120, y: 320 },
    exit: { x: 840, y: 360, w: 32, h: 28 },
    total: 20,
    needed: 14,
    timeLimitSec: 140,
    releaseRate: 70,
    minReleaseRate: 30,
    skills: sk({ builder: 5, blocker: 1, bomber: 1 }),
    par: 6,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 960, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 368, y: 380, h: 160, mat: MAT.ROCK, rough: 2 },
      { t: 'ground', x: 392, w: 248, y: 380, h: 160, mat: MAT.ROCK, rough: 2 },
      { t: 'ground', x: 664, w: 296, y: 380, h: 160, mat: MAT.ROCK, rough: 2 },
      // Beide Spalte haben einen Grund — ueberlebbar, aber ohne Rueckweg.
      { t: 'rect', x: 368, y: 434, w: 24, h: 106, mat: MAT.ROCK },
      { t: 'rect', x: 664, y: 434, w: 24, h: 106, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w5-13',
    name: 'Unter Druck',
    chapter: 'Kern',
    hint: 'Naht, Fall, Riegel — die Reihenfolge kennst du. Der Schlot fragt nur: wie schnell?',
    theme: 'magma',
    width: 720,
    height: 540,
    seed: 51013,
    entrance: { x: 110, y: 300 },
    exit: { x: 630, y: 384, w: 32, h: 26 },
    total: 16,
    needed: 10,
    timeLimitSec: 110,
    releaseRate: 50,
    minReleaseRate: 25,
    skills: sk({ bomber: 3, basher: 2, digger: 2 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 720, h: 24, mat: MAT.ROCK },
      // Duenne Rostschicht auf einer Blechplatte, mit einer Naht bei 540.
      { t: 'rect', x: 0, y: 337, w: 720, h: 2, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 339, w: 720, h: 3, mat: MAT.STEEL },
      { t: 'rect', x: 540, y: 339, w: 4, h: 3, mat: MAT.EARTH },
      // Die Halle darunter, mit dem Riegel vor der Tuer.
      // Glatt, kein rauer Boden: Auf dem Hallenboden arbeitet der Rammer,
      // und eine Zwei-Punkte-Senke wirft ihn aus dem Stollen (Fallwechsel).
      { t: 'ground', x: 0, w: 720, y: 404, h: 136, mat: MAT.ROCK, rough: 0 },
      { t: 'rect', x: 620, y: 342, w: 40, h: 62, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w5-14',
    name: 'Der lange Gang',
    chapter: 'Kern',
    hint: 'Brücke, Schacht, Stollen — die alte Prüfung, auf Schlotzeit gestellt.',
    theme: 'magma',
    width: 960,
    height: 540,
    seed: 51014,
    entrance: { x: 120, y: 300 },
    exit: { x: 690, y: 396, w: 36, h: 24 },
    total: 16,
    needed: 10,
    timeLimitSec: 150,
    releaseRate: 50,
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
  {
    id: 'w5-15',
    name: 'Prüfung im Schlot',
    chapter: 'Kern',
    hint: 'Die Grube sortiert, die Naht öffnet, der Riegel fällt. Und über allem: die Uhr.',
    theme: 'magma',
    width: 960,
    height: 600,
    seed: 51015,
    entrance: { x: 80, y: 300 },
    exit: { x: 744, y: 420, w: 32, h: 26 },
    total: 16,
    // Quote 7 statt 6 — die eine Marge-1-Pruefung der Welt: Neun
    // Kletterer, acht kommen durch (einer wird am Riegel zum
    // Sprengmeister), sieben muessen heim. Ein Finale darf beissen;
    // die Uhr-Niederlage kostet dank Herzschutz kein Leben.
    needed: 7,
    timeLimitSec: 170,
    releaseRate: 60,
    minReleaseRate: 25,
    skills: sk({ climber: 9, bomber: 2, basher: 2 }),
    par: 11,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 960, h: 24, mat: MAT.ROCK },
      // Der Westboden mit der Grube: Sie faengt jeden, der nicht klettert.
      { t: 'ground', x: 0, w: 380, y: 370, h: 230, mat: MAT.ROCK, rough: 2 },
      { t: 'rect', x: 150, y: 370, w: 60, h: 68, mat: MAT.EMPTY },
      // Die Muendung der Grube ist freigeraeumt: Der raue Boden kann sonst
      // eine Zwei-Punkte-Lippe ueber den Rand woelben, und ein Kletterer
      // bricht am Ueberhang ueber der eigenen Spalte ab — endlose Schleife.
      { t: 'rect', x: 146, y: 358, w: 68, h: 12, mat: MAT.EMPTY },
      // Der Berg in der Mitte.
      { t: 'rect', x: 380, y: 300, w: 200, h: 300, mat: MAT.ROCK },
      // Der Ostflügel: Blechboden mit Naht, darunter die Halle mit dem Riegel.
      { t: 'rect', x: 580, y: 368, w: 380, h: 2, mat: MAT.EARTH },
      { t: 'rect', x: 580, y: 370, w: 380, h: 3, mat: MAT.STEEL },
      { t: 'rect', x: 840, y: 370, w: 4, h: 3, mat: MAT.EARTH },
      // Glatt aus demselben Grund wie in „Naht und Riegel": Arbeitsboden.
      { t: 'ground', x: 580, w: 380, y: 440, h: 160, mat: MAT.ROCK, rough: 0 },
      { t: 'rect', x: 740, y: 373, w: 40, h: 67, mat: MAT.ROCK },
    ],
  },
];
