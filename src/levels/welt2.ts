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
    hint: 'Willkommen unter Tage. Über die Kante geht es — der Fall ist kürzer, als er aussieht. Unten sperrt ein Riegel, und unter ihm liegt Stahl.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21001,
    entrance: { x: 110, y: 224 },
    exit: { x: 640, y: 316, w: 32, h: 26 },
    total: 10,
    // Marge-Heilung (Paket 5, Drittel A): Quote = Messung - 3.
    needed: 7,
    timeLimitSec: 90,
    releaseRate: 50,
    minReleaseRate: 30,
    // Ein Rammer loest es. Der Graeber liegt als NAHELIEGENDE FALSCHE Antwort
    // daneben: Unter der Sohle liegt Stahl, und wer dort graebt, hat einen Zug
    // verschenkt und die Lehre dieser Welt gelernt.
    skills: sk({ basher: 2, digger: 2 }),
    par: 1,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 720, h: 26, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 400, y: 280, h: 260, mat: MAT.ROCK, rough: 2 },
      // Die Kante: 56 Bildpunkte hinunter — ueberlebbar, und von unten fuehrt
      // kein Weg zurueck. Genau das ist die erste Lektion der Klamm.
      //
      // `rough: 0` auf der unteren Sohle, und zwar aus Notwendigkeit: Ein
      // Rammer verliert auf rauem Grund nach jedem Zwei-Punkt-Versatz den
      // Boden und dreht ab. Derselbe Befund hat schon w1-02 die Rammstrecke
      // gekostet. Der Rammer arbeitet hier unten — also ist es hier unten
      // glatt, und die Rauheit bleibt oben, wo sie niemanden stoert.
      { t: 'ground', x: 400, w: 320, y: 336, h: 204, mat: MAT.ROCK, rough: 0 },
      // Der Riegel — der Grund, warum dieses Level ueberhaupt eines ist.
      //
      // Vorher stand hier `par: 0` und im Kommentar der Satz „Reines
      // Ankommen: Wer nur laufen laesst, gewinnt mit null Zuweisungen." Ein
      // Level, das sich von allein loest, ist kein Level, sondern ein
      // Ladebildschirm mit Uhr; der Spieltest hat es beim Namen genannt.
      //
      // Sechsunddreissig hoch: weit ueber MAX_STEP 5, und ein Rammer raeumt
      // nur die untersten dreizehn (BASH_UP 12). Der Stollen geht also
      // hindurch, der Riegel bleibt darueber stehen — man sieht am Ende, was
      // man getan hat.
      { t: 'rect', x: 520, y: 300, w: 40, h: 36, mat: MAT.ROCK },
      // Und die Stahlader darunter. Sie macht den Graeber zur teuren Ausrede:
      // Wer unten senkrecht graebt, steht nach dreizehn Bildpunkten auf Stahl.
      // „Der Stahl liegt in Adern" ist das Versprechen dieser Welt — hier
      // steht es zum ersten Mal im Weg.
      { t: 'rect', x: 400, y: 349, w: 320, h: 10, mat: MAT.STEEL },
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
    hint: 'Die Wand trägt eine Stahlhaut — kein Stollen hilft. Der Kletterer nimmt den Kamin, und hinter der Krone geht es in Stufen hinab. Ganz unten liegt die Tür begraben.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21003,
    entrance: { x: 90, y: 380 },
    exit: { x: 590, y: 254, w: 32, h: 26 },
    total: 10,
    needed: 3,
    // Messlauf: letzte Rettung 58,2 s x 2,0 (W2-Faktor) = 115.
    // Quote 3 = Messung 6 minus Marge 3.
    timeLimitSec: 115,
    releaseRate: 40,
    minReleaseRate: 25,
    // B7-Einfuehrung (Level-Konzept, Paket 1): der Kaminzug als reiner
    // Baustein — Wand hinauf, unterm Deckel ueber die Krone, drueben in
    // sicheren Stufen hinab. Neu gegen die Zweituebersetzung von frueher:
    // Unten wartet ein zweiter Schritt, den Klettern allein nicht leistet —
    // die Tuer liegt unter der Platte, ein Kletterer muss zum Graeber
    // werden. Genau daran scheitert der geerbte Nur-Kletter-Plan (Rot-Test).
    skills: sk({ climber: 7, digger: 2 }),
    // Sechs Kletterer plus die eine Grabung: sieben Zuege.
    par: 7,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 420, y: 430, h: 110, mat: MAT.ROCK, rough: 2 },
      // Die Wand: Krone bei 150, Spalt zum Deckel 66 — genug zum
      // Darueberlaufen. Die Westflanke traegt Stahl: kein Stollen.
      { t: 'rect', x: 420, y: 150, w: 26, h: 390, mat: MAT.ROCK },
      { t: 'rect', x: 420, y: 150, w: 8, h: 280, mat: MAT.STEEL },
      // Die Zwischenplatte hinter der Krone: 64 hinab — die freundliche
      // Stufe der Klamm. Unter ihr die Kammer mit der Tuer.
      { t: 'rect', x: 446, y: 214, w: 274, h: 24, mat: MAT.ROCK },
      { t: 'rect', x: 446, y: 238, w: 274, h: 302, mat: MAT.ROCK },
      // Die Kammer: 42 hoch, ihr Boden 66 unter der Platte. Wer oben
      // graebt, faellt weich; wer nur klettert, laeuft oben auf und ab.
      { t: 'rect', x: 540, y: 238, w: 150, h: 42, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w2-04',
    name: 'Die hohle Mauer',
    chapter: 'Abstieg',
    hint: 'Die Mauer sperrt die Senke, und ihr Boden ist Stahl. Aber die Mauer hat einen weichen Kern: Wer sie erklimmt und zweimal gräbt, macht aus der Sperre den Durchlass — erst die Schale, dann den Kern.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21004,
    entrance: { x: 120, y: 290 },
    exit: { x: 610, y: 438, w: 32, h: 26 },
    total: 12,
    needed: 9,
    // Messlauf: letzte Rettung 77,9 s x 2,0 = 155. Quote 9 = Messung 12
    // minus Marge 3 — die Schleife rettet alle, die Marge ist Komfort.
    timeLimitSec: 155,
    releaseRate: 40,
    minReleaseRate: 25,
    // B4-Einfuehrung, die Umweg-Schleife (Level-Konzept, Paket 1): Der
    // direkte Weg ist sichtbar versperrt, ein Kletterer oeffnet ihn von
    // oben — climber+digger, das erste Mal, dass Gabe und Arbeit verkettet
    // sind. Der Pulk wartet sichtbar vor der Mauer. Beide Grabungen macht
    // dieselbe Figur: Nach der ersten steht sie unten im eigenen Schacht,
    // klettert den Kern wieder hinauf und setzt innen nach.
    skills: sk({ climber: 2, digger: 3 }),
    // Ein Kletterer, zwei Grabungen — drei Zuege, eine Schleife.
    par: 3,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 720, h: 24, mat: MAT.ROCK },
      // Westplateau mit dem Fenster; die Kante wirft alle in die Senke.
      { t: 'rect', x: 0, y: 340, w: 300, h: 200, mat: MAT.ROCK },
      // Der Senkenboden ist Stahl: Von hier graebt niemand nach unten —
      // und genau derselbe Stahl stoppt spaeter die Aussengrabung auf
      // Bodenhoehe, sodass eine begehbare Stufe in die Mauer stehen bleibt.
      { t: 'rect', x: 300, y: 400, w: 260, h: 10, mat: MAT.STEEL },
      // Der Fels unter allem; die Galerie wird spaeter hineingeschnitten.
      { t: 'rect', x: 300, y: 410, w: 420, h: 130, mat: MAT.ROCK },
      // Die Mauer: Erdkern, Felsschale nach Westen, Felskappe obenauf.
      // Krone 70 ueber dem Senkenboden — eine Kletterwand, kein Huepfer.
      { t: 'rect', x: 560, y: 336, w: 36, h: 124, mat: MAT.EARTH },
      { t: 'rect', x: 560, y: 330, w: 36, h: 6, mat: MAT.ROCK },
      { t: 'rect', x: 560, y: 336, w: 6, h: 64, mat: MAT.ROCK },
      // Ostseite: massiver Fels bis zur Mauer.
      { t: 'rect', x: 596, y: 400, w: 124, h: 140, mat: MAT.ROCK },
      // Die Galerie unter der Mauer — Ziel der Kerngrabung, Heim der Tuer.
      // Ihr Boden liegt 64 unter dem Senkenniveau: weicher Fall fuer alle.
      { t: 'rect', x: 520, y: 430, w: 180, h: 34, mat: MAT.EMPTY },
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
    // Von der Marge-Heilung (Paket 0) ausgenommen — die eine dokumentierte
    // Ausnahme der Welt: Beim Taktgeber IST die Marge-0 das Raetsel. Die
    // Uhr liegt zwischen gemuetlichem Weg (Quote bei 73,8 s) und getaktetem
    // (67,1 s); mit Quote 6 raettet der gemuetliche Weg schon bei 59 s und
    // die Pointe fiele. Verlieren kann man hier nur an die Uhr, und eine
    // Uhr-Niederlage kostet dank Herzschutz kein Leben.
    needed: 8,
    // Der Taktgeber (Design-Runde, Blaupause 2): Die Uhr ist am Messlauf
    // so bemessen, dass der gemuetliche Weg scheitert — Quote ohne
    // Rate-Zuege bei 73,8 s, mit sofortiger Drossel und Aufdrehen nach dem
    // Durchbruch bei 67,1 s. Rate-Zuege kosten kein Par.
    timeLimitSec: 70,
    releaseRate: 40,
    minReleaseRate: 15,
    skills: sk({ miner: 2, blocker: 1 }),
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
    name: 'Durch zwei Böden',
    chapter: 'Stollen',
    hint: 'Zwei Etagen, zwei Grabungen — aber der Stahl deckt jede Etage an anderer Stelle. Wo eben noch gegraben wurde, geht es diesmal nicht.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21006,
    entrance: { x: 600, y: 250 },
    exit: { x: 80, y: 394, w: 32, h: 26 },
    total: 12,
    needed: 8,
    // Messlauf: letzte Rettung 119,5 s x 2,0 = 240 — der Zickzack durch
    // zwei Ebenen kostet Marschweg, die Uhr respektiert das Gesetz.
    timeLimitSec: 240,
    releaseRate: 45,
    minReleaseRate: 25,
    // Ersatzbau (Level-Konzept, Paket 1): Die Naht war achtmal im Spiel —
    // sie bleibt Zutat, nie mehr Hauptgericht. Stattdessen der Etagenturm
    // im Kleinen (B1): zwei Boeden uebereinander, die Stahlkappen zwingen
    // die Loecher in den Versatz — der Weg wird ein Zickzack durch die
    // Ebenen, und genau das verlangte der Auftrag: mehr als eine.
    skills: sk({ digger: 4 }),
    // Zwei Grabungen, zwei Reserven.
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 720, h: 24, mat: MAT.ROCK },
      // Etage 1: von der Westwand bis zum Rand, unterm Spawn liegt Stahl —
      // der naheliegende Grabpunkt ist der falsche.
      { t: 'rect', x: 120, y: 300, w: 600, h: 24, mat: MAT.ROCK },
      { t: 'rect', x: 520, y: 300, w: 200, h: 6, mat: MAT.STEEL },
      // Der Westpfeiler haelt Etage 1 und sperrt ihre Westkante — niemand
      // stuerzt am Ende der Etage in den Tod. Er endet 30 ueber dem Boden:
      // Unten ist er Torbogen, nicht Sperre — die Tuer liegt dahinter.
      { t: 'rect', x: 96, y: 230, w: 24, h: 160, mat: MAT.ROCK },
      // Etage 2, halb versetzt: Stahl im Westen, grabbar im Osten. Ihre
      // Ostkante ist mit der Wand an Etage 1 verwachsen — kein Umweg
      // aussen herum.
      { t: 'rect', x: 0, y: 348, w: 624, h: 24, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 348, w: 520, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 600, y: 324, w: 24, h: 24, mat: MAT.ROCK },
      // Der Boden mit der Tuer.
      { t: 'ground', x: 0, w: 720, y: 420, h: 120, mat: MAT.ROCK, rough: 2 },
    ],
  },
  {
    id: 'w2-07',
    name: 'Über den Deckel',
    chapter: 'Stollen',
    hint: 'Die Klamm ist zu — der Weg ist das Dach. Wer die Wand erklimmt, läuft oben über den Deckel und fällt durch den Lichtschacht zur Tür.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21007,
    entrance: { x: 60, y: 250 },
    exit: { x: 650, y: 100, w: 32, h: 26 },
    total: 10,
    needed: 3,
    // Messlauf: letzte Rettung 59 s x 2,0 = 120. Quote 3 = 6 minus 3.
    timeLimitSec: 120,
    releaseRate: 40,
    minReleaseRate: 25,
    // Ersatzbau (Level-Konzept, Paket 1): Der zweite Schirmregen ist
    // gestrichen; stattdessen die Weltregel der Klamm woertlich genommen —
    // die Decke ist ein Weg, man LAEUFT auf ihr. Die Wandkrone liegt genau
    // auf Deckelhoehe, der Lichtschacht im Osten wirft den Laeufer in die
    // Grotte mit der Tuer.
    skills: sk({ climber: 7 }),
    par: 6,
    paint: [
      // Der Deckel beginnt erst oestlich der Wand — westlich davon faellt
      // das Licht herein, und ueber ihm ist Platz zum Laufen.
      { t: 'rect', x: 180, y: 60, w: 420, h: 24, mat: MAT.ROCK },
      { t: 'rect', x: 640, y: 60, w: 80, h: 24, mat: MAT.ROCK },
      // Die Wand: ihre Krone liegt auf Deckel-OBERKANTE — wer oben
      // ankommt, laeuft nahtlos aufs Dach.
      { t: 'rect', x: 154, y: 60, w: 26, h: 480, mat: MAT.ROCK },
      // Der Vorhof, in dem alle ankommen. Wer nicht klettert, pendelt hier.
      { t: 'rect', x: 0, y: 300, w: 154, h: 240, mat: MAT.ROCK },
      // Das Massiv unter dem Deckel — die Klamm ist wirklich zu. In ihm
      // die Grotte unterm Lichtschacht, mit der Tuer.
      { t: 'rect', x: 180, y: 84, w: 540, h: 456, mat: MAT.ROCK },
      { t: 'rect', x: 600, y: 84, w: 110, h: 42, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w2-08',
    name: 'Gegenstrom',
    chapter: 'Stollen',
    hint: 'Alle laufen nach Osten — dort wartet die Sackgasse. Der Blocker dreht den Strom, und im Westen braucht der Stollen einen, der schon gewendet hat.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21008,
    entrance: { x: 460, y: 330 },
    exit: { x: 12, y: 402, w: 32, h: 26 },
    total: 20,
    needed: 16,
    // Messlauf: letzte Rettung 72,7 s x 2,0 = 145. Quote 16 = Messung 19
    // minus Marge 3 (nur der Wender selbst bleibt zurueck).
    timeLimitSec: 145,
    releaseRate: 30,
    minReleaseRate: 20,
    // Der Wender (Level-Konzept, Paket 1): blocker+basher, nie zuvor
    // gespielt. Alle starten ostwaerts, die Tuer liegt westlich hinter
    // einem Riegel — der Rammer muss WESTWAERTS arbeiten, also braucht er
    // die Umkehr durch den Blocker. Die Kette aus der alten Fassung ist
    // gestrichen; der Rot-Test belegt, dass der geerbte Brueckenplan
    // unter der neuen Geometrie scheitert.
    skills: sk({ blocker: 2, basher: 2 }),
    // Ein Wender, ein Stollen.
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 80, w: 720, h: 24, mat: MAT.ROCK },
      // Der Startboden. Nach Osten faellt er in die Sackgassen-Senke —
      // ueberlebbar, aber ohne Rueckweg: Wer nicht wendet, wartet unten.
      { t: 'ground', x: 180, w: 400, y: 380, h: 160, mat: MAT.ROCK, rough: 2 },
      { t: 'ground', x: 580, w: 140, y: 440, h: 100, mat: MAT.ROCK, rough: 2 },
      // Nach Westen die freundliche Stufe hinab auf die Sohle. Sie ist
      // GLATT gemauert: Auf rauem Grund verliert der Rammer nach dem
      // ersten Schwung den Boden unter den Fuessen und bricht ab — die
      // Messung hat es gezeigt.
      { t: 'rect', x: 0, y: 428, w: 180, h: 112, mat: MAT.ROCK },
      // Der Riegel auf der Sohle: 44 Punkte Fels vor der Tuernische.
      { t: 'rect', x: 60, y: 300, w: 44, h: 128, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w2-09',
    name: 'Adern und Deckel',
    chapter: 'Klamm',
    hint: 'Die Platte ist dicht — bis auf eine rostige Lücke. Nur dort geht es hinab, und unten nur nach Osten.',
    theme: 'crystal',
    width: 960,
    height: 540,
    seed: 21009,
    entrance: { x: 160, y: 280 },
    exit: { x: 480, y: 390, w: 32, h: 24 },
    total: 20,
    // Entklont (Design-Runde, Muster Blaupause 5): Die alte Fassung teilte
    // Geometrie und Loesung mit w1-05. Jetzt ist die Platte durchgehend
    // und traegt eine 24 Punkte breite Erdluecke bei x 380 — sichtbar, denn
    // ueberall sonst steht der Graeber auf Stahl. Unten geht es nur nach
    // OSTEN zur Tuer; der w1-05-Plan (graben bei 690, rammen nach Westen)
    // endet auf der Platte und scheitert — der Rot-Test belegt es.
    needed: 15,
    timeLimitSec: 120,
    releaseRate: 35,
    minReleaseRate: 20,
    skills: sk({ digger: 2, basher: 1, blocker: 1 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 960, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 960, y: 340, h: 200, mat: MAT.ROCK, rough: 2 },
      { t: 'rect', x: 120, y: 372, w: 820, h: 14, mat: MAT.STEEL },
      { t: 'rect', x: 380, y: 372, w: 24, h: 14, mat: MAT.EARTH },
      { t: 'rect', x: 120, y: 408, w: 640, h: 12, mat: MAT.STEEL },
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
    // Marge-Heilung (Level-Konzept, Paket 0): Quote = Messung - 2.
    needed: 4,
    timeLimitSec: 150,
    releaseRate: 35,
    minReleaseRate: 20,
    // Zweituebersetzung von w1-09, bewusst ohne Rot-Test (siehe w2-03).
    // Geschaerft wie dort: sieben Paare fuer sechs Gerettete.
    skills: sk({ climber: 7, floater: 7 }),
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
    // 12 statt 10 (Messregel): Die Musterloesung rettet 14, Marge 2.
    needed: 12,
    timeLimitSec: 160,
    releaseRate: 45,
    minReleaseRate: 25,
    // Entklont (Design-Runde): Die Schlucht liegt 20 Punkte weiter
    // oestlich - der geerbte w1-10-Plan baut seine Bruecke einen Schritt
    // zu frueh und endet vor der Kante (Rot-Test). Die Loesung braucht
    // die Kette. Werkzeugschnitt auf +2 ueber Par.
    skills: sk({ builder: 3, digger: 2, basher: 1 }),
    par: 4,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 960, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 444, y: 340, h: 200, mat: MAT.ROCK, rough: 2 },
      { t: 'ground', x: 464, w: 496, y: 340, h: 200, mat: MAT.ROCK, rough: 2 },
      { t: 'rect', x: 444, y: 410, w: 20, h: 130, mat: MAT.ROCK },
      { t: 'rect', x: 560, y: 372, w: 300, h: 10, mat: MAT.STEEL },
      { t: 'rect', x: 600, y: 410, w: 360, h: 12, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w2-13',
    name: 'Unterm Deckel',
    chapter: 'Klamm',
    hint: 'Die Brücke stösst an die Decke — hier baut niemand hinauf. Wer die Wand hoch will, muss klettern.',
    theme: 'crystal',
    width: 720,
    height: 540,
    seed: 21013,
    entrance: { x: 90, y: 280 },
    exit: { x: 660, y: 194, w: 32, h: 26 },
    total: 10,
    needed: 6,
    timeLimitSec: 120,
    releaseRate: 40,
    minReleaseRate: 25,
    // Die Brueckenbauer sind der Koeder: Die sichtbare, falsche Loesung.
    // Eine Kette aus dreien stoesst an den Deckel und dreht um — sichtbar
    // verpufft, niemand stirbt. Die Decke verbietet den Bauweg; genau das
    // ist ihr Debuet als Bauteil (Blaupause 1 der Design-Runde).
    skills: sk({ climber: 8, builder: 3, blocker: 1 }),
    par: 8,
    paint: [
      // Der Deckel — die Weltregel der Klamm, endlich als Bauteil.
      { t: 'rect', x: 0, y: 60, w: 720, h: 24, mat: MAT.ROCK },
      // Westboden mit dem Pulk.
      { t: 'ground', x: 0, w: 600, y: 330, h: 210, mat: MAT.ROCK, rough: 2 },
      // Die Wand: Krone bei y 144, Spalt zum Deckel 60 Punkte — genug zum
      // Darueberlaufen, zu wenig fuer eine Bruecke von unten.
      { t: 'rect', x: 600, y: 144, w: 26, h: 396, mat: MAT.ROCK },
      // Stahlhaut an der Westflanke: kein Stollen, kein Krater.
      { t: 'rect', x: 600, y: 144, w: 8, h: 396, mat: MAT.STEEL },
      // Ostboden, 70 Punkte unter der Krone — der Fall ist kurz genug.
      { t: 'rect', x: 626, y: 214, w: 94, h: 326, mat: MAT.ROCK },
    ],
  },
];
