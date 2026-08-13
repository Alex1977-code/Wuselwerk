import { MAT, SKILLS, type SkillCounts } from '../core/types';
import type { LevelDef } from './types';

function sk(partial: Partial<SkillCounts>): SkillCounts {
  const out = {} as SkillCounts;
  for (const s of SKILLS) out[s] = partial[s] ?? 0;
  return out;
}

/**
 * Welt 3 — das Rostwerk.
 *
 * „Eine Halde aus Stahl und Schrott. Wenig ist grabbar, alles ist im Weg."
 * (`welten.ts`). Dreizehn Level, drei Kapitel: **Schrott** lernt die Halde
 * kennen, **Werk** verlangt Kombinationen, **Halde** prueft.
 *
 * ## Die Entwurfsregeln, verschaerft gegenueber Welt 2
 *
 * 1. **Mehrschritt statt Einschritt.** Ab dem vierten Level verlangt fast
 *    jedes Level zwei bis drei Arbeiten in der richtigen Reihenfolge — die
 *    Rueckmeldung nach Welt 2 hiess „anspruchsvollere Level", und Anspruch
 *    entsteht aus Verkettung, nicht aus Ratespiel.
 * 2. **Stahl ist die Regel, Grabbares die Ausnahme.** Wo in der Klamm der
 *    Stahl den Weg *markierte*, versperrt er ihn hier: Boeden aus Blech,
 *    Waende ohne Angriff, und die eine Naht, der eine Erdfleck, die eine
 *    Rostader sind der Schluessel.
 * 3. **Fallhoehen unter 78 oder ausdrueckliche Schirm-Lektion** — unveraendert.
 *    Sackgassen strafen mit Warten, nicht mit Sterben; unbeaufsichtigte
 *    Figuren sterben nie (Falltuer-Probe im Testlauf).
 * 4. **Koeder sind erlaubt.** Die Halde verteilt Werkzeuge, die nicht helfen
 *    (ein Graeber vor einer Stahlsohle) — wer liest, was der Stahl sagt,
 *    verschwendet nichts. In den Lehrwelten waere das gemein, in der
 *    Pruefungswelt ist es die Pruefung.
 */
export const WELT3_LEVELS: LevelDef[] = [
  {
    id: 'w3-01',
    name: 'Blechboden',
    chapter: 'Schrott',
    hint: 'Der ganze Boden ist Blech — bis auf einen Fleck Rost. Nur dort kommt der Gräber durch.',
    theme: 'rust',
    width: 720,
    height: 540,
    seed: 31001,
    entrance: { x: 110, y: 280 },
    exit: { x: 170, y: 380, w: 32, h: 26 },
    total: 10,
    needed: 8,
    timeLimitSec: 100,
    releaseRate: 50,
    minReleaseRate: 30,
    skills: sk({ digger: 3, blocker: 1 }),
    par: 1,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 720, y: 340, h: 200, mat: MAT.ROCK, rough: 2 },
      // Der Blechboden: Stahl auf ganzer Breite — bis auf die Rostnaht.
      { t: 'rect', x: 0, y: 340, w: 495, h: 12, mat: MAT.STEEL },
      { t: 'rect', x: 515, y: 340, w: 205, h: 12, mat: MAT.STEEL },
      { t: 'rect', x: 495, y: 340, w: 20, h: 12, mat: MAT.EARTH },
      // Die Kammer unter dem Blech, mit der Tuer.
      { t: 'rect', x: 120, y: 352, w: 420, h: 48, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w3-02',
    name: 'Steilwand',
    chapter: 'Schrott',
    hint: 'Die Wand ist Stahl, der Fall dahinter zu tief. Wer hinüber will, braucht beides: Kletterer und Schirm.',
    theme: 'rust',
    width: 720,
    height: 540,
    seed: 31002,
    entrance: { x: 110, y: 320 },
    exit: { x: 620, y: 360, w: 32, h: 26 },
    total: 12,
    // Marge-Heilung (Level-Konzept, Paket 0): Quote = Messung - 2.
    needed: 4,
    timeLimitSec: 150,
    releaseRate: 35,
    minReleaseRate: 20,
    skills: sk({ climber: 8, floater: 8, blocker: 2 }),
    par: 12,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 720, y: 380, h: 160, mat: MAT.ROCK, rough: 2 },
      { t: 'rect', x: 420, y: 240, w: 26, h: 140, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w3-03',
    name: 'Doppelgrube',
    chapter: 'Schrott',
    hint: 'Zwei Kammern, zwei Schrägen. Die zweite beginnt, wo die erste endet — und erst die zweite hat die Tür.',
    theme: 'rust',
    width: 720,
    height: 600,
    seed: 31003,
    entrance: { x: 560, y: 240 },
    exit: { x: 110, y: 560, w: 32, h: 26 },
    total: 12,
    needed: 8,
    timeLimitSec: 200,
    releaseRate: 40,
    minReleaseRate: 25,
    skills: sk({ miner: 4, blocker: 2 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 720, y: 300, h: 300, mat: MAT.ROCK, rough: 2 },
      // Kammer A: Ziel der ersten Schraege (Start um x 618, zwei seitwaerts je
      // eins hinunter — bei x 398 ist er 110 tief und bricht durch die Decke).
      { t: 'rect', x: 300, y: 410, w: 180, h: 60, mat: MAT.EMPTY },
      // Kammer B: Ziel der zweiten Schraege, vom Kammerboden A aus (Start um
      // x 350 auf 470 — bei x 230 ist er 60 tiefer und bricht durch).
      { t: 'rect', x: 80, y: 530, w: 160, h: 50, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w3-04',
    name: 'Taktstrasse',
    chapter: 'Werk',
    hint: 'Zwei Spalte, ein schneller Takt. Der Blocker hält den Pulk, zwei Brücken tragen ihn — dieselbe Hand baut beide.',
    theme: 'rust',
    width: 960,
    height: 540,
    seed: 31004,
    entrance: { x: 120, y: 320 },
    exit: { x: 840, y: 360, w: 32, h: 28 },
    total: 20,
    // 17 statt 14 (Design-Runde): Die Musterloesung rettet 18 — hier ist
    // die eine erlaubte Marge-1-Pruefung der Welt. Uhr 130 statt 200: die
    // letzte Rettung faellt bei ~108 s, die Sprengung muss ins Fenster
    // zwischen Bruecke 1 und Pulkankunft, nicht irgendwann.
    needed: 17,
    timeLimitSec: 130,
    releaseRate: 70,
    minReleaseRate: 30,
    skills: sk({ builder: 6, blocker: 2, bomber: 1 }),
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
    id: 'w3-05',
    name: 'Fallwerk',
    chapter: 'Werk',
    hint: 'Ohne Schirm überlebt den Fall niemand — und wer unten ostwärts losläuft, braucht einen Wächter im Rücken.',
    theme: 'rust',
    width: 720,
    height: 540,
    seed: 31005,
    entrance: { x: 100, y: 110 },
    // Entklont (Design-Runde): Die Tuer liegt jetzt WESTLICH der
    // Landestelle. Gelandete laufen ostwaerts los; ohne Waechter kostet
    // der Pendelweg ueber die halbe Welt die Uhr (Rot-Test gegen den
    // geerbten w1-04-Plan).
    exit: { x: 80, y: 450, w: 32, h: 26 },
    total: 12,
    // Marge-Heilung (Level-Konzept, Paket 0): Quote = Messung - 2.
    needed: 4,
    timeLimitSec: 62,
    releaseRate: 30,
    minReleaseRate: 20,
    // +1 Schirm (Paket 0): Ein Fehltipp verbrannte sonst die letzte Gabe.
    skills: sk({ floater: 8, blocker: 1 }),
    par: 8,
    paint: [
      { t: 'rect', x: 0, y: 50, w: 720, h: 20, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 170, w: 320, h: 26, mat: MAT.STEEL },
      { t: 'ground', x: 0, w: 720, y: 470, h: 70, mat: MAT.ROCK, rough: 2 },
    ],
  },
  {
    id: 'w3-06',
    name: 'Nadelöhr',
    chapter: 'Werk',
    hint: 'Senkrecht bis auf das Blech, waagerecht bis ins Freie. Zwei Grabungen, eine Ecke.',
    theme: 'rust',
    width: 720,
    height: 540,
    seed: 31006,
    entrance: { x: 360, y: 200 },
    exit: { x: 620, y: 340, w: 32, h: 26 },
    total: 14,
    needed: 10,
    timeLimitSec: 150,
    releaseRate: 45,
    minReleaseRate: 25,
    // +1 Graeber als Koeder (Design-Runde): Ueber der Stahlsohle ist jede
    // senkrechte Grabung verschenkt - der Vorrat laedt dazu ein.
    skills: sk({ digger: 4, basher: 3, blocker: 1 }),
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
    id: 'w3-07',
    name: 'Doppelstock',
    chapter: 'Werk',
    hint: 'Oben Blech, unten Weg. Der Spalt im Untergeschoss will eine Brücke — gebaut im Gegenlauf.',
    theme: 'rust',
    width: 960,
    height: 600,
    seed: 31007,
    entrance: { x: 110, y: 280 },
    exit: { x: 140, y: 380, w: 32, h: 26 },
    total: 16,
    // Marge-Heilung (Level-Konzept, Paket 0): Quote = Messung - 2.
    needed: 11,
    timeLimitSec: 150,
    releaseRate: 50,
    minReleaseRate: 25,
    // +1 Graeber als Koeder (Design-Runde): Das Blech im Obergeschoss
    // schluckt jede Grabung - wer es versucht, lernt das Blech kennen.
    skills: sk({ builder: 4, blocker: 2, floater: 2, digger: 1 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 960, h: 24, mat: MAT.ROCK },
      // Obergeschoss: Blech bis kurz vor die Ostwand — dort geht es hinab.
      { t: 'rect', x: 0, y: 340, w: 880, h: 12, mat: MAT.STEEL },
      { t: 'ground', x: 0, w: 960, y: 400, h: 200, mat: MAT.ROCK, rough: 2 },
      // Der Spalt im Untergeschoss, mit ueberlebbarem Grund.
      { t: 'rect', x: 376, y: 400, w: 28, h: 70, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w3-08',
    name: 'Hebewerk',
    chapter: 'Werk',
    hint: 'Die Tür steht auf dem Hochregal. Hinauf hilft der Kletterer — und oben fehlt dem Blech ein Stück.',
    theme: 'rust',
    width: 720,
    height: 600,
    seed: 31008,
    entrance: { x: 110, y: 470 },
    exit: { x: 650, y: 232, w: 32, h: 26 },
    total: 12,
    // Marge-Heilung (Level-Konzept, Paket 0): Quote = Messung - 2.
    needed: 4,
    timeLimitSec: 180,
    releaseRate: 35,
    minReleaseRate: 20,
    skills: sk({ climber: 8, builder: 2, floater: 2 }),
    par: 8,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 720, y: 540, h: 60, mat: MAT.ROCK, rough: 2 },
      // Das Hochregal: Stuetze und Boden, alles Stahl — und die Luecke.
      { t: 'rect', x: 520, y: 252, w: 12, h: 288, mat: MAT.STEEL },
      { t: 'rect', x: 520, y: 252, w: 80, h: 12, mat: MAT.STEEL },
      { t: 'rect', x: 612, y: 252, w: 108, h: 12, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w3-09',
    name: 'Zeitschacht',
    chapter: 'Halde',
    hint: 'Zwei Grabungen, eine sehr knappe Uhr. Jeder Umweg kostet die Quote.',
    theme: 'rust',
    width: 720,
    height: 540,
    seed: 31009,
    entrance: { x: 90, y: 270 },
    exit: { x: 560, y: 354, w: 36, h: 26 },
    total: 14,
    needed: 10,
    timeLimitSec: 90,
    releaseRate: 65,
    minReleaseRate: 40,
    skills: sk({ digger: 3, basher: 3, blocker: 1 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 720, y: 330, h: 210, mat: MAT.ROCK, rough: 2 },
      { t: 'rect', x: 0, y: 380, w: 720, h: 12, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w3-10',
    name: 'Schrottberg',
    chapter: 'Halde',
    hint: 'Erst die Brücke, dann der Berg. Über den Stahlkamm kommt nur, wer klettert — und dahinter fällt es tief.',
    theme: 'rust',
    width: 960,
    height: 600,
    seed: 31010,
    entrance: { x: 110, y: 350 },
    exit: { x: 860, y: 400, w: 32, h: 26 },
    total: 16,
    // 8 statt 6 (Design-Runde): Der Stahlkamm laesst nur Kletterer mit
    // Schirm hinueber, je acht im Vorrat — die Quote fordert jetzt alle
    // acht Paare, nicht sechs mit zwei Fehlern Luft. Par folgt der
    // vollen Musterloesung (8 Paare + Brueckenkette).
    // Marge-Heilung (Level-Konzept, Paket 0): Quote = Messung - 2.
    needed: 6,
    timeLimitSec: 150,
    releaseRate: 45,
    minReleaseRate: 25,
    skills: sk({ builder: 3, climber: 8, floater: 8, blocker: 2 }),
    par: 18,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 960, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 400, y: 420, h: 180, mat: MAT.ROCK, rough: 2 },
      { t: 'ground', x: 432, w: 528, y: 420, h: 180, mat: MAT.ROCK, rough: 2 },
      // Der Spalt hat einen Grund — ueberlebbar, ohne Rueckweg.
      { t: 'rect', x: 400, y: 470, w: 32, h: 130, mat: MAT.ROCK },
      // Der Stahlkamm.
      { t: 'rect', x: 700, y: 300, w: 24, h: 120, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w3-11',
    name: 'Naht und Riegel',
    chapter: 'Halde',
    hint: 'Die Naht öffnet den Boden, der Riegel hält die Tür. Sprengen, fallen, rammen — in dieser Reihenfolge.',
    theme: 'rust',
    width: 720,
    height: 540,
    seed: 31011,
    entrance: { x: 110, y: 300 },
    exit: { x: 630, y: 384, w: 32, h: 26 },
    total: 16,
    needed: 10,
    timeLimitSec: 150,
    releaseRate: 45,
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
    id: 'w3-12',
    name: 'Drei Werke',
    chapter: 'Halde',
    hint: 'Brücke, Abstieg, Schräge — drei Werke, drei Absätze tiefer wartet die Tür.',
    theme: 'rust',
    width: 960,
    height: 600,
    seed: 31012,
    entrance: { x: 110, y: 240 },
    exit: { x: 850, y: 520, w: 32, h: 26 },
    total: 16,
    needed: 10,
    timeLimitSec: 240,
    releaseRate: 45,
    minReleaseRate: 25,
    skills: sk({ builder: 4, miner: 2, digger: 2, blocker: 2 }),
    par: 3,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 960, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 300, y: 300, h: 300, mat: MAT.ROCK, rough: 2 },
      { t: 'ground', x: 300, w: 180, y: 360, h: 240, mat: MAT.ROCK, rough: 2 },
      { t: 'ground', x: 512, w: 128, y: 360, h: 240, mat: MAT.ROCK, rough: 2 },
      // Der Spalt der zweiten Stufe, mit ueberlebbarem Grund.
      { t: 'rect', x: 480, y: 410, w: 32, h: 190, mat: MAT.ROCK },
      { t: 'ground', x: 640, w: 320, y: 420, h: 180, mat: MAT.ROCK, rough: 2 },
      // Die Kammer der dritten Stufe, Ziel der Schraege ab etwa x 694.
      { t: 'rect', x: 800, y: 480, w: 140, h: 60, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w3-13',
    name: 'Meisterstück',
    chapter: 'Halde',
    hint: 'Die Grube hält alle, die nicht klettern. Wer klettert, findet die Naht — und hinter dem Riegel die Tür.',
    theme: 'rust',
    width: 960,
    height: 600,
    seed: 31013,
    entrance: { x: 80, y: 300 },
    exit: { x: 744, y: 420, w: 32, h: 26 },
    total: 16,
    needed: 6,
    // 140 statt 260 (letzte Rettung bei ~84 s) und Werkzeugschnitt
    // +10 -> +2: neun Kletterer (acht kommen durch, einer wird am Riegel
    // zum Sprengmeister), zwei Bomben, zwei Rammer — sonst nichts. Die
    // Quote bleibt 6, die Marge 2 traegt einen Fehltipp im Pulk.
    timeLimitSec: 140,
    releaseRate: 55,
    minReleaseRate: 25,
    skills: sk({ climber: 9, bomber: 2, basher: 2 }),
    par: 11,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 960, h: 24, mat: MAT.ROCK },
      // Der Westboden mit der Grube: Sie faengt jeden, der nicht klettert.
      { t: 'ground', x: 0, w: 380, y: 370, h: 230, mat: MAT.ROCK, rough: 2 },
      { t: 'rect', x: 150, y: 370, w: 60, h: 68, mat: MAT.EMPTY },
      // Muendung frei — siehe w5-15: keine raue Lippe ueber dem Grubenrand.
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
