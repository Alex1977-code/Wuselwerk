import { MAT, SKILLS, type SkillCounts } from '../core/types';
import type { LevelDef } from './types';

function sk(partial: Partial<SkillCounts>): SkillCounts {
  const out = {} as SkillCounts;
  for (const s of SKILLS) out[s] = partial[s] ?? 0;
  return out;
}

/**
 * Welt 6 — der Sonnenhang.
 *
 * „Terrassen im Nachmittagslicht. Was von weitem wie eine Wiese aussieht, hat
 * vier Stockwerke." (`welten.ts`). Geplant sind siebzehn Level in drei
 * Kapiteln — **Terrasse** lehrt das Normhoehen-Raster, **Hang** verkettet
 * es, **Kamm** prueft. Gebaut und ausgemessen sind bisher die ersten drei;
 * der Rest steht als abgenommener Entwurf in `docs/welt-6-7-konzept.md` und
 * wird Level fuer Level nachgezogen, jedes mit eigener Messrunde. Die Welt
 * meldet darum vorerst nur die gebauten Punkte: Eine Karte, die vierzehn
 * tote Punkte zeigt, verspricht etwas, das das Spiel nicht halten kann.
 *
 * ## Die Entwurfsregeln dieser Welt
 *
 * 1. **Jede Wiese hat ein Stockwerk unter sich.** Kein Level dieser Welt
 *    verbindet weniger als drei Hoehenebenen, und jede Verbindung ist ein
 *    eigener Arbeitsschritt. Die freundlichste Kulisse des Spiels traegt
 *    seine haerteste Architektur — das ist der ganze Witz der Welt.
 * 2. **Das Raster spricht.** E48 faellt frei hinab und kostet hinauf vier
 *    Bauer (ein Bauer hebt zwoelf, ein Kettenglied zehn — im Code
 *    nachgerechnet, nicht geschaetzt); E72 faellt frei und kommt nur mit
 *    Kletterer oder Schraege zurueck; E96 verlangt hinab den Schirm. Krumme
 *    Abstaende sind verboten: Jeder Abstand sagt ueber seine Zahl selbst,
 *    welches Werkzeug er verlangt.
 * 3. **Die Schraege ist der Rueckweg.** Der Schraegbagger steigt 1 px je 2 px
 *    (MINE_DX 2 / MINE_DY 1) — weit unter der Stufenhoehe MAX_STEP 5. Seine
 *    Rampe ist damit die einzige Verbindung des Spiels, die in BEIDE
 *    Richtungen begehbar ist, und der halbe Sonnenhang ruht darauf.
 * 4. **Sackgassen fangen mit Warten.** Wo eine Kante toedlich ist, steht
 *    entweder eine 12-px-Lippe davor (der Pulk pendelt, ein Rammer oeffnet)
 *    oder die Gefahr steht sichtbar im Startbild. Untaetigkeit darf nie den
 *    ganzen Pulk kosten.
 */
export const WELT6_LEVELS: LevelDef[] = [
  {
    id: 'w6-01',
    name: 'Die vier Wiesen',
    chapter: 'Terrasse',
    // Der erste Satz der Welt, in einem Bild: 48 hinab ist geschenkt, 48
    // hinauf kostet eine Bauerkette. Der Pulk laeuft die Treppe von selbst
    // und pendelt vor dem Wurzelstock — es kann nichts schiefgehen, waehrend
    // man die Kette setzt. Durchatmer und Lehrstueck zugleich.
    hint: 'Drei Wiesen, jede achtundvierzig unter der vorigen — hinab geht das von selbst. Nur die letzte Kante ist gesperrt: Schlage das Tor.',
    theme: 'sonnenhang',
    width: 720,
    height: 540,
    seed: 61001,
    entrance: { x: 80, y: 150 },
    exit: { x: 60, y: 318, w: 32, h: 26 },
    total: 12,
    needed: 9,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (88,8 s).
    timeLimitSec: 125,
    releaseRate: 45,
    minReleaseRate: 20,
    skills: sk({ basher: 3, blocker: 2 }),
    par: 1,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Die drei Grasbaender im E48-Takt. Jedes reicht bis zum Westrand und
      // endet weiter oestlich als das darueber: So laeuft der Pulk die
      // Treppe ostwaerts hinab, und wer auf einem Band nach Westen laeuft,
      // stoesst an die Stirn des Bandes darueber statt ins Leere.
      { t: 'rect', x: 0, y: 200, w: 240, h: 16, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 248, w: 500, h: 16, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 296, w: 700, h: 16, mat: MAT.EARTH },
      // Die Lippe an der Ostkante der untersten Terrasse: Der Pulk pendelt
      // sicher zwischen ihr und der Stirn des Bandes darueber, bis der
      // Rammer das Tor schlaegt. Erst dann faellt es die letzten 48 auf die
      // Sohle mit der Tuer.
      //
      // (Erster Wurf: eine Grube mit Bruecke. Sie lag hinter der Landestelle
      // — das Level loeste sich mit null Zuweisungen selbst, genau der
      // Befund, den die Gesamtabnahme bei w4-01 verurteilt hat. Der zweite
      // Wurf legte sie in den Weg und scheiterte an der Rampentasche. Die
      // Lippe ist die bewiesene Antwort.)
      { t: 'rect', x: 688, y: 284, w: 12, h: 12, mat: MAT.EARTH },
      { t: 'ground', x: 0, w: 720, y: 344, h: 196, mat: MAT.EARTH, rough: 2 },
    ],
  },
  {
    id: 'w6-02',
    name: 'Der versetzte Schacht',
    chapter: 'Terrasse',
    // Dasselbe Raster eine Stufe hoeher: E72 faellt noch frei, aber der Weg
    // hinab ist gedeckelt. Drei Findlingsplatten lassen je ein Erdfenster
    // frei, und die Fenster wandern treppenartig nach Osten — wer daneben
    // graebt, steht nach neun Bildpunkten sichtbar auf Stein, und niemand
    // stirbt dabei. Das Level lehrt Zielen, nicht Eile.
    hint: 'Drei Böden, drei Findlingsplatten — und in jeder genau ein Fenster aus dunkler Erde. Grabe dort, wo der Stein endet.',
    theme: 'sonnenhang',
    width: 720,
    height: 540,
    seed: 61002,
    entrance: { x: 60, y: 150 },
    exit: { x: 600, y: 390, w: 32, h: 26 },
    total: 14,
    needed: 11,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (70 s).
    timeLimitSec: 100,
    releaseRate: 45,
    minReleaseRate: 20,
    skills: sk({ digger: 6, blocker: 2 }),
    par: 3,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Etage 1: Deckel bis auf das Fenster bei x96.
      { t: 'rect', x: 0, y: 200, w: 720, h: 16, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 200, w: 96, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 160, y: 200, w: 560, h: 6, mat: MAT.STEEL },
      // Etage 2: Fenster bei x330.
      { t: 'rect', x: 0, y: 272, w: 720, h: 16, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 272, w: 330, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 394, y: 272, w: 326, h: 6, mat: MAT.STEEL },
      // Etage 3: Fenster bei x560.
      { t: 'rect', x: 0, y: 344, w: 720, h: 16, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 344, w: 560, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 624, y: 344, w: 96, h: 6, mat: MAT.STEEL },
      { t: 'ground', x: 0, w: 720, y: 416, h: 124, mat: MAT.EARTH, rough: 2 },
    ],
  },
  {
    id: 'w6-03',
    name: 'Zu tief zum Fallen',
    chapter: 'Terrasse',
    // Die dritte Stufe des Rasters: E96 faellt nicht mehr frei, und es liegt
    // KEIN Schirm im Vorrat — also traegt nur die Schraege. Drei Blöcke,
    // drei Schraegen, jede 192 Bildpunkte lang (2 px seitwaerts je 1 px
    // hinab): Sie passen genau nebeneinander in die Breite, und wer eine zu
    // weit oestlich ansetzt, laeuft mit ihr aus der Welt.
    hint: 'Sechsundneunzig sind zu tief zum Fallen, und ein Schirm liegt nicht bereit. Der Schrägbagger legt die Rampe — dreimal, immer weiter nach Osten.',
    theme: 'sonnenhang',
    width: 720,
    height: 640,
    seed: 61004,
    entrance: { x: 80, y: 130 },
    exit: { x: 600, y: 514, w: 32, h: 26 },
    total: 12,
    needed: 9,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (126,8 s).
    timeLimitSec: 180,
    releaseRate: 35,
    minReleaseRate: 15,
    skills: sk({ miner: 6, blocker: 2 }),
    par: 3,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Drei E96-Bloecke mit 24 Bildpunkten Luft dazwischen: Die Luft ist
      // der Grund, warum jede Etage ihre eigene Schraege braucht — am
      // Blockfuss verliert der Bagger den Boden und faellt die 24 heil auf
      // den naechsten. Ohne die Luft waeren es nicht drei Etagen, sondern
      // ein einziger Block, und eine Schraege truege durch alle.
      { t: 'rect', x: 0, y: 180, w: 720, h: 96, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 300, w: 720, h: 96, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 420, w: 720, h: 96, mat: MAT.EARTH },
      { t: 'ground', x: 0, w: 720, y: 540, h: 80, mat: MAT.EARTH, rough: 2 },
    ],
  }
];
