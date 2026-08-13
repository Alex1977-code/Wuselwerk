import { MAT, SKILLS, type SkillCounts } from '../core/types';
import type { LevelDef } from './types';

function sk(partial: Partial<SkillCounts>): SkillCounts {
  const out = {} as SkillCounts;
  for (const s of SKILLS) out[s] = partial[s] ?? 0;
  return out;
}

/**
 * Welt 4 — die Frostklamm.
 *
 * „Hohe, schmale Level. Der Weg fuehrt nach unten, und unten wartet der
 * Aufprall." (`welten.ts`). Vierzehn Level, drei Kapitel: **Kante** lernt das
 * Hinabkommen, **Absturz** verlangt es unter Druck, **Tiefe** prueft.
 *
 * ## Die Entwurfsregeln dieser Welt
 *
 * 1. **Die Fallhoehe ist der Gegner.** Fast jedes Raetsel fragt: Wie kommen
 *    alle heil nach unten? Die Absaetze liegen auf dem Normraster des
 *    Level-Konzepts — 48 die billige Etage, 72 der tiefste freie Fall,
 *    96/120 die Gaben-Etagen; was ueber 72 liegt, braucht Schirm, Schacht
 *    oder Bruecke. (Die krummen 70er der Erstfassung sind seit Paket 3
 *    verboten: Jeder Abstand erklaert selbst, welches Werkzeug er verlangt.)
 * 2. **Schmal statt breit.** 480 Bildpunkte Breite, bis zu 860 Hoehe — die
 *    Klamm ist ein Schacht, kein Land. Die Weltwaende sind Spielflaeche.
 * 3. **Blankeis ist der Stahl dieser Welt.** Dieselbe Simulation, andere
 *    Erzaehlung: Was glaenzt, traegt kein Werkzeug.
 * 4. **Der Pulk startet eingezaeunt.** Wo die Route mit einem Absturz
 *    beginnt, haelt ein Pfercht die Unbeaufsichtigten — Sackgassen fangen
 *    mit Warten, nie mit Sterben (Falltuer-Probe im Testlauf).
 */
export const WELT4_LEVELS: LevelDef[] = [
  {
    id: 'w4-01',
    name: 'Die Kante',
    chapter: 'Kante',
    // Level-Konzept, Paket 3: die aktivierte Kaskade (Baustein B5). Die
    // Treppenform bleibt, aber jeder zweite Absatz verlangt einen Handgriff —
    // ein Riegel sperrt die zweite Stufe (Rammer), die dritte endet ueber dem
    // tiefen Abgrund und nur der Schacht auf das Zwischenbord macht aus E120
    // zwei mal E-sicher (Graeber). Alle Abstaende auf dem Normraster: 48 zum
    // Absteigen, 72 als tiefster erlaubter Fall, 120 als sichtbare Grenze.
    hint: 'Die Kaskade trägt nicht mehr von selbst: Ein Riegel sperrt die zweite Stufe, und die dritte endet über dem Abgrund. Ramme — und grabe rechtzeitig.',
    theme: 'frost',
    width: 480,
    height: 620,
    seed: 41001,
    entrance: { x: 240, y: 140 },
    exit: { x: 224, y: 390, w: 32, h: 26 },
    total: 10,
    // Messlauf: die Musterloesung rettet alle 10. Drittel A, Marge 3.
    needed: 7,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (68,6 s), W4-Faktor.
    timeLimitSec: 100,
    releaseRate: 50,
    minReleaseRate: 30,
    skills: sk({ basher: 2, digger: 2 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      // Stufe 1: haengt oestlich, alle spawnen ostwaerts.
      { t: 'rect', x: 120, y: 200, w: 260, h: 12, mat: MAT.ROCK },
      // Stufe 2 mit dem Riegel: der Pulk pendelt sicher zwischen Riegel und
      // Ostwand, bis der Rammer westwaerts oeffnet.
      { t: 'rect', x: 100, y: 248, w: 380, h: 12, mat: MAT.ROCK },
      { t: 'rect', x: 160, y: 218, w: 28, h: 30, mat: MAT.ROCK },
      // Stufe 3: ihre Ostkante liegt 120 ueber dem Grund — toedlich, sichtbar.
      { t: 'rect', x: 0, y: 296, w: 380, h: 12, mat: MAT.ROCK },
      // Das Zwischenbord: der Schacht dorthin faengt jeden, bevor die
      // Ostkante erreichbar wird; beide Bordkanten fallen 72.
      { t: 'rect', x: 40, y: 344, w: 180, h: 12, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 480, y: 416, h: 204, mat: MAT.ROCK, rough: 2 },
    ],
  },
  {
    id: 'w4-02',
    name: 'Schirmpflicht',
    chapter: 'Kante',
    hint: 'Unter dem Pfercht wartet die halbe Klamm. Grabe auf — und schirme jeden, der fällt.',
    theme: 'frost',
    width: 480,
    height: 800,
    seed: 41002,
    entrance: { x: 240, y: 140 },
    exit: { x: 380, y: 700, w: 32, h: 26 },
    total: 12,
    // Marge-Heilung (Paket 5, Drittel A): Quote = Messung - 3.
    needed: 3,
    timeLimitSec: 150,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ floater: 8, digger: 2 }),
    par: 7,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      // Der Pfercht: ein Sims mit Waenden, sicher fuer alle, die warten.
      { t: 'rect', x: 120, y: 200, w: 240, h: 70, mat: MAT.ROCK },
      { t: 'rect', x: 120, y: 140, w: 10, h: 60, mat: MAT.ROCK },
      { t: 'rect', x: 350, y: 140, w: 10, h: 60, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 480, y: 720, h: 80, mat: MAT.ROCK, rough: 2 },
    ],
  },
  {
    id: 'w4-03',
    name: 'Zwei Kanten',
    chapter: 'Kante',
    hint: 'Die Kante lügt, der Schacht trägt: zweimal senkrecht, und jeder Absatz bleibt unter der Grenze.',
    theme: 'frost',
    width: 480,
    height: 620,
    seed: 41003,
    entrance: { x: 180, y: 170 },
    exit: { x: 240, y: 350, w: 32, h: 26 },
    total: 14,
    needed: 10,
    timeLimitSec: 180,
    releaseRate: 45,
    minReleaseRate: 25,
    skills: sk({ digger: 4, blocker: 2 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      // Oberes Sims mit Pferchtwand rechts; links haelt die Weltwand.
      { t: 'rect', x: 0, y: 230, w: 360, h: 58, mat: MAT.ROCK },
      { t: 'rect', x: 348, y: 170, w: 12, h: 60, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 300, w: 480, h: 58, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 480, y: 370, h: 250, mat: MAT.ROCK, rough: 2 },
    ],
  },
  {
    id: 'w4-04',
    name: 'Eisbrücke',
    chapter: 'Kante',
    hint: 'Zwei Türme, dazwischen nichts. Die Brücke braucht Nachschub, bevor die letzte Stufe liegt.',
    theme: 'frost',
    width: 480,
    height: 720,
    seed: 41004,
    entrance: { x: 110, y: 240 },
    exit: { x: 400, y: 280, w: 32, h: 26 },
    total: 14,
    // Marge-Heilung (Level-Konzept, Paket 3): Die Musterloesung rettet 11 —
    // Quote = Messung - 2. Die alte 10 liess nur einen einzigen Fehltritt zu.
    needed: 9,
    timeLimitSec: 160,
    releaseRate: 45,
    minReleaseRate: 25,
    skills: sk({ builder: 4, floater: 2, blocker: 2 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 300, w: 220, h: 420, mat: MAT.ROCK },
      { t: 'rect', x: 252, y: 300, w: 228, h: 420, mat: MAT.ROCK },
      // Der Spaltgrund faengt, wer vor der Bruecke faellt — ohne Rueckweg.
      { t: 'rect', x: 220, y: 360, w: 32, h: 360, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w4-05',
    name: 'Wächter der Kante',
    chapter: 'Absturz',
    hint: 'Die zweite Etage hat eine offene Westkante. Erst der Wächter, dann der zweite Schacht.',
    theme: 'frost',
    width: 480,
    height: 620,
    seed: 41005,
    entrance: { x: 240, y: 160 },
    exit: { x: 400, y: 270, w: 32, h: 26 },
    total: 16,
    // 13 statt 10 (Design-Runde, Messregel): Die Musterloesung rettet
    // 15 — eine Quote fuenf darunter prueft nichts. Marge 2.
    needed: 13,
    timeLimitSec: 200,
    releaseRate: 55,
    minReleaseRate: 30,
    skills: sk({ digger: 4, blocker: 3, floater: 2 }),
    par: 3,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 220, w: 480, h: 58, mat: MAT.ROCK },
      // Die Terrasse endet im Westen ueber dem Abgrund — dort steht der
      // Waechter, oder es stirbt der Pulk. Unter der Kante liegt nur das
      // ferne Becken.
      { t: 'rect', x: 120, y: 290, w: 360, h: 330, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 120, y: 520, h: 100, mat: MAT.ROCK, rough: 2 },
    ],
  },
  {
    id: 'w4-06',
    name: 'Das Doppeltor',
    chapter: 'Absturz',
    // Level-Konzept, Paket 3: der B6-Routenwahl-Ersatzbau. Der alte
    // „Doppelsprung" war ein selbsterklaerter Klon von w4-02 („wie
    // Schirmpflicht, nur mit Zwischenhalt") — hier ersetzt ihn die Kammer
    // mit zwei Zugaengen: oben der Firn-Spalt zwischen Eissaeule und
    // Blankeis-Deckel (Graeber, dann Waechter an die Ostwand der Grube und
    // Freisprengung durch die Erdwand — bomber+digger, der bisherige Koeder
    // wird Loesung), seitlich der lange Stollen vom Eisboden (ein Rammer,
    // kein Toter, aber der weite Umweg). Beide Wege loesen, nur der Stollen
    // haelt das Par — die erste echte Routenwahl des Spiels. Beide Zugaenge
    // liegen in einem 300x200-Fenster (x72..246, y210..290).
    hint: 'Die Kammer hat zwei Tore: der Firn-Spalt neben der Eissäule — Grube, Wächter, Sprengung. Oder der lange Stollen vom Eisboden. Nur einer hält das Par.',
    theme: 'frost',
    width: 480,
    height: 620,
    seed: 41006,
    entrance: { x: 40, y: 150 },
    exit: { x: 108, y: 258, w: 32, h: 26 },
    total: 16,
    // Stollenweg rettet 16, Sprengweg 15 (ein Opfer): Quote laesst beide zu.
    needed: 13,
    // Uhr = 1,4 x letzte Rettung der LANGSAMEREN Route (Stollen, 75,8 s);
    // die Sprengroute rettet in 40,2 s — beide Wege passen bequem.
    timeLimitSec: 110,
    releaseRate: 35,
    minReleaseRate: 20,
    skills: sk({ digger: 2, blocker: 2, bomber: 2, basher: 2 }),
    par: 1,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      // Die Firn-Hochebene auf der Stahlsohle; oestlich faellt sie 72 auf
      // den Blankeis-Boden (der Pfercht der Stollenroute).
      { t: 'rect', x: 0, y: 212, w: 240, h: 72, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 284, w: 480, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 0, y: 290, w: 480, h: 330, mat: MAT.ROCK },
      // Die Kammer mit der Tuer — sichtbar im Fels, beidseitig verschlossen.
      { t: 'rect', x: 96, y: 218, w: 96, h: 66, mat: MAT.EMPTY },
      // Blankeis-Deckel (verbietet den direkten Schacht in die Kammer) und
      // Eissaeule (fuehrt den Spalt: nur zwischen Saeule und Deckel greift
      // der Graeber, alles andere meldet Stahl).
      { t: 'rect', x: 92, y: 212, w: 104, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 72, y: 212, w: 8, h: 72, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w4-07',
    name: 'Gegenwind',
    chapter: 'Absturz',
    // Level-Konzept, Paket 3: die Reparatur. Die alte Fassung war kaputt —
    // die Westkante der zweiten Stufe lag 58 ueber dem Pfeilerkopf, der Pulk
    // landete im Vorbeifallen auf der Tuer, und die Musterloesung rettete
    // 12/12 mit null Zuweisungen; der inszenierte Kletterer war Attrappe.
    // Jetzt liegt keine Kante mehr ueber dem Pfeiler, alle Abstiege sind
    // Normraster (48/72), und der Pfeiler selbst ist 96 hoch: hinauf kommt
    // nur ein echter Kletterer. Der Rot-Test haelt den alten Trick fest:
    // Null Zuweisungen muessen verlieren.
    hint: 'Ganz unten steht der Pfeiler, sechsundneunzig hoch, und auf dem Pfeiler die Tür. Hinauf kommt nur, wer klettern kann.',
    theme: 'frost',
    width: 480,
    height: 620,
    seed: 41007,
    entrance: { x: 240, y: 140 },
    exit: { x: 40, y: 198, w: 32, h: 26 },
    total: 12,
    // Par misst neu: 8 Kletterer steigen, 8 kommen an — Quote = Messung - 2.
    needed: 6,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (57,6 s), W4-Faktor.
    timeLimitSec: 85,
    releaseRate: 40,
    minReleaseRate: 25,
    skills: sk({ climber: 8, floater: 2, builder: 2 }),
    par: 8,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      // Zwei Stufen im Normraster: 48 hinab, dann 72 auf den Grund.
      { t: 'rect', x: 120, y: 200, w: 260, h: 12, mat: MAT.ROCK },
      { t: 'rect', x: 100, y: 248, w: 380, h: 12, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 480, y: 320, h: 300, mat: MAT.ROCK, rough: 2 },
      // Der Pfeiler mit der Tuer — sechsundneunzig hoch, nur fuer Kletterer.
      // Die zwei Bauer im Vorrat sind ehrlicher Koeder: ihre Kette stiege 24.
      { t: 'rect', x: 24, y: 224, w: 60, h: 96, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w4-08',
    name: 'Eisnaht',
    chapter: 'Absturz',
    hint: 'Blankeis trägt kein Werkzeug — aber die Naht trägt eine Sprengung. Hundert Bildpunkte Vorhalt.',
    theme: 'frost',
    width: 480,
    height: 620,
    seed: 41008,
    entrance: { x: 240, y: 340 },
    exit: { x: 400, y: 440, w: 32, h: 26 },
    total: 14,
    needed: 10,
    timeLimitSec: 150,
    releaseRate: 45,
    minReleaseRate: 25,
    skills: sk({ bomber: 3, digger: 2 }),
    par: 1,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      // Firnschicht auf Blankeis, mit einer Naht bei 180.
      { t: 'rect', x: 0, y: 396, w: 480, h: 2, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 398, w: 480, h: 3, mat: MAT.STEEL },
      { t: 'rect', x: 180, y: 398, w: 4, h: 3, mat: MAT.EARTH },
      { t: 'ground', x: 0, w: 480, y: 460, h: 160, mat: MAT.ROCK, rough: 2 },
    ],
  },
  {
    id: 'w4-09',
    name: 'Schrägfahrt',
    chapter: 'Absturz',
    hint: 'Zwei Schrägen im Zickzack durch den Berg — die zweite beginnt am Boden der ersten Kammer.',
    theme: 'frost',
    width: 480,
    height: 720,
    seed: 41009,
    entrance: { x: 380, y: 140 },
    exit: { x: 360, y: 454, w: 32, h: 26 },
    total: 12,
    needed: 8,
    timeLimitSec: 220,
    releaseRate: 40,
    minReleaseRate: 25,
    skills: sk({ miner: 4, blocker: 2 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 200, w: 480, h: 520, mat: MAT.ROCK },
      { t: 'rect', x: 40, y: 280, w: 160, h: 60, mat: MAT.EMPTY },
      { t: 'rect', x: 240, y: 420, w: 180, h: 60, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w4-10',
    name: 'Vier Kanten',
    chapter: 'Tiefe',
    // Level-Konzept, Paket 3: das erste Zwei-Fronten-Pflichtlevel. Die
    // Design-Runde hatte die alte Doppelfront-Blaupause im Messlauf
    // geschlagen (die Tuer fing alle Westlaeufer von selbst, die zweite
    // Front hatte keinen Gegner) — diese Fassung baut die zweite Front so,
    // dass sie einen hat: Der einzige Schacht liegt im Firn-Fleck der
    // Blankeis-Platte, und die Fallrichtung teilt den Pulk. Wer westwaerts
    // faellt, laeuft ueber die Westkante zur Tuer auf dem Westbord; wer
    // ostwaerts faellt, sitzt auf dem Ostbord fest — kein Waechter im
    // Vorrat kann ihn wenden. Die Bergung ist der Sohlen-Stollen: ein
    // Rammer schlaegt vom Ostbord westwaerts UNTER der Terrasse durch bis
    // zum Westbord, und die Ostfront laeuft unter dem Hinweg der Westfront
    // zur Tuer durch. (Die Bauer-Kette der Blaupause ist im Messlauf
    // widerlegt: Eine vom Bordboden steigende Rampe traegt unter ihren
    // ersten Stufen eine Tasche — wer westlich des Rampenfusses pendelt,
    // stoesst an die Unterseite und kommt nie mehr zum Einstieg.) Beide
    // Fronten arbeiten gleichzeitig und liegen im 300x200-Fenster, die
    // zweite direkt unter der ersten (Lesefenster-Gesetz). Niemand kann
    // sterben: alle Kanten fallen 48 oder 72. Marge 3, wie das Konzept
    // fuer Splits verlangt.
    hint: 'Der Firn-Fleck ist der einzige Weg hinunter — und er teilt den Pulk. Westläufer finden die Tür; die Ostfront gräbt sich unter der Terrasse zurück.',
    theme: 'frost',
    width: 480,
    height: 620,
    seed: 41010,
    entrance: { x: 240, y: 160 },
    exit: { x: 40, y: 314, w: 32, h: 26 },
    total: 16,
    needed: 13,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (88,8 s), W4-Faktor.
    timeLimitSec: 125,
    releaseRate: 55,
    minReleaseRate: 30,
    skills: sk({ digger: 2, basher: 2, floater: 2 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      // Die Blankeis-Platte mit dem einen Firn-Fleck: nur dort greift der
      // Graeber, alles andere meldet Stahl.
      { t: 'rect', x: 0, y: 220, w: 480, h: 24, mat: MAT.STEEL },
      { t: 'rect', x: 300, y: 220, w: 56, h: 24, mat: MAT.EARTH },
      // Die Terrasse auf vollem Sockel: beide Kanten fallen 48 auf die
      // Borde. Blankeis-Haut gegen den Koeder-Schacht in die Tiefe.
      { t: 'rect', x: 120, y: 292, w: 240, h: 328, mat: MAT.ROCK },
      { t: 'rect', x: 120, y: 292, w: 240, h: 6, mat: MAT.STEEL },
      // Westbord mit der Tuer; Ostbord als sichere Sackgasse der Ostfront.
      { t: 'rect', x: 0, y: 340, w: 120, h: 280, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 340, w: 120, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 360, y: 340, w: 120, h: 280, mat: MAT.ROCK },
      { t: 'rect', x: 360, y: 340, w: 120, h: 6, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w4-11',
    name: 'Über die Klamm',
    chapter: 'Tiefe',
    hint: 'Vierundvierzig Bildpunkte Leere, kein Grund in Sicht. Drei Bauer in einer Kette tragen hinüber.',
    theme: 'frost',
    width: 480,
    height: 800,
    seed: 41011,
    entrance: { x: 70, y: 180 },
    exit: { x: 400, y: 220, w: 32, h: 26 },
    total: 16,
    needed: 10,
    timeLimitSec: 220,
    releaseRate: 40,
    minReleaseRate: 25,
    skills: sk({ builder: 4, floater: 2, blocker: 2 }),
    par: 3,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 240, w: 140, h: 560, mat: MAT.ROCK },
      { t: 'rect', x: 184, y: 240, w: 296, h: 560, mat: MAT.ROCK },
      { t: 'rect', x: 140, y: 300, w: 44, h: 500, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w4-12',
    name: 'Eile im Eis',
    chapter: 'Tiefe',
    hint: 'Dieselben zwei Schächte wie am Anfang — nur die Uhr ist eine andere.',
    theme: 'frost',
    width: 480,
    height: 620,
    seed: 41012,
    entrance: { x: 180, y: 170 },
    exit: { x: 240, y: 350, w: 32, h: 26 },
    total: 14,
    needed: 11,
    // Uhr-Heilung (Paket 5): 1,4 x letzte Rettung (60,6 s) — die alte 70
    // stand bei Faktor 1,16. Die Identitaet („nur die Uhr ist eine
    // andere") bleibt: w4-03 laesst sich fuer dieselben Schaechte 180.
    timeLimitSec: 85,
    releaseRate: 60,
    minReleaseRate: 40,
    skills: sk({ digger: 4, blocker: 1 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 230, w: 360, h: 58, mat: MAT.ROCK },
      { t: 'rect', x: 348, y: 170, w: 12, h: 60, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 300, w: 480, h: 58, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 480, y: 370, h: 250, mat: MAT.ROCK, rough: 2 },
    ],
  },
  {
    id: 'w4-13',
    name: 'Zurück ans Licht',
    chapter: 'Tiefe',
    hint: 'Drei Stufen, jede zu hoch zum Steigen. Die Klamm lässt nur Kletterer wieder hinauf.',
    theme: 'frost',
    width: 480,
    height: 720,
    seed: 41013,
    entrance: { x: 80, y: 550 },
    exit: { x: 420, y: 390, w: 32, h: 26 },
    total: 12,
    // Marge-Heilung (Level-Konzept, Paket 0): Quote = Messung - 2.
    needed: 4,
    timeLimitSec: 180,
    releaseRate: 40,
    minReleaseRate: 25,
    skills: sk({ climber: 8, floater: 2, builder: 2 }),
    par: 6,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 480, y: 620, h: 100, mat: MAT.ROCK, rough: 2 },
      // Die Treppe aus dem Schacht: drei Bloecke, jeder siebzig hoch.
      { t: 'rect', x: 160, y: 550, w: 320, h: 70, mat: MAT.ROCK },
      { t: 'rect', x: 260, y: 480, w: 220, h: 70, mat: MAT.ROCK },
      { t: 'rect', x: 360, y: 410, w: 120, h: 70, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w4-14',
    name: 'Prüfung in der Klamm',
    chapter: 'Tiefe',
    hint: 'Schacht, Wächter, Naht, Riegel — die ganze Klamm in einem Abstieg.',
    theme: 'frost',
    width: 480,
    height: 860,
    seed: 41014,
    entrance: { x: 240, y: 140 },
    exit: { x: 368, y: 384, w: 32, h: 26 },
    total: 16,
    // 12 statt 8 (Design-Runde, Messregel): Die Musterloesung rettet 14.
    // Marge 2 — die Pruefung verlangt jetzt fast alle, nicht die Haelfte.
    needed: 12,
    timeLimitSec: 260,
    releaseRate: 50,
    minReleaseRate: 25,
    skills: sk({ digger: 3, blocker: 2, bomber: 2, basher: 2, floater: 2, climber: 2 }),
    par: 5,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      // Der Pfercht ganz oben, 58 duenn.
      { t: 'rect', x: 0, y: 200, w: 480, h: 58, mat: MAT.ROCK },
      // Die Mitteletage mit offener Westkante — unter ihr, links der Platte,
      // geht es bis zum Grund durch (140 tief: toedlich).
      { t: 'rect', x: 120, y: 270, w: 360, h: 58, mat: MAT.ROCK },
      // Firn auf Blankeis, die Naht bei 200 — im Westen, denn jeder, der
      // vom Schacht kommt, laeuft westwaerts; die Platte beginnt erst bei 140.
      { t: 'rect', x: 140, y: 340, w: 340, h: 2, mat: MAT.EARTH },
      { t: 'rect', x: 140, y: 342, w: 340, h: 3, mat: MAT.STEEL },
      { t: 'rect', x: 200, y: 342, w: 4, h: 3, mat: MAT.EARTH },
      // Der Grund, glatt: hier arbeitet der Rammer. Der Riegel traegt die Tuer.
      { t: 'ground', x: 0, w: 480, y: 410, h: 450, mat: MAT.ROCK, rough: 0 },
      { t: 'rect', x: 360, y: 345, w: 40, h: 65, mat: MAT.ROCK },
    ],
  },
];
