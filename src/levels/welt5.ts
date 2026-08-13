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
    hint: 'Zwei Nähte, eine Wahl: Unter der einen liegt Stahl, unter der anderen der Weg. Sieh genau hin.',
    theme: 'magma',
    width: 720,
    height: 540,
    seed: 51004,
    entrance: { x: 100, y: 300 },
    exit: { x: 420, y: 386, w: 32, h: 26 },
    total: 20,
    needed: 15,
    timeLimitSec: 90,
    releaseRate: 50,
    minReleaseRate: 25,
    // Zwei Bomben fuer zwei Naehte: Ein Irrtum ist erlaubt und kostet nur
    // den Sprengmeister — die Falschloesung ist angekuendigt, nicht
    // toedlich (Blaupause 4 der Design-Runde).
    skills: sk({ bomber: 2, digger: 1, blocker: 1 }),
    par: 1,
    paint: [
      // Duenne Narbe ueber einer Stahlplatte — wie in w1-07, nur dass die
      // Platte jetzt ZWEI Naehte traegt und nur eine davon traegt.
      { t: 'rect', x: 0, y: 339, w: 720, h: 2, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 341, w: 720, h: 3, mat: MAT.STEEL },
      // Naht A — die attraktive Falsche: naeher am Eingang, aber unter ihr
      // liegt eine sichtbar stahlgraue Sohle. Der Krater oeffnet die
      // Platte und endet auf Metall; sichtbar verpufft.
      { t: 'rect', x: 260, y: 341, w: 4, h: 3, mat: MAT.EARTH },
      { t: 'rect', x: 236, y: 344, w: 52, h: 10, mat: MAT.STEEL },
      // Naht B — die echte: unter ihr nur Erde, der Krater legt den Weg
      // zur begrabenen Tuer frei.
      { t: 'rect', x: 455, y: 341, w: 4, h: 3, mat: MAT.EARTH },
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
    exit: { x: 420, y: 390, w: 32, h: 24 },
    total: 20,
    // Remix statt Kopie (Design-Runde, Blaupause 5): w1-05-Geometrie mal
    // w3-01-Idee. Die Platte ist durchgehend, nur eine 24 Punkte breite
    // Rostluecke bei x 520 fuehrt hinab — sichtbar, denn ueberall sonst
    // steht der Graeber auf Stahl. Unten geht es nur nach WESTEN. Der
    // w1-05-Plan (graben bei 690) endet auf der Platte; der Rot-Test
    // belegt es. Der Sprengmeister ist Koeder: Die Platte hat keine Naht.
    needed: 17,
    timeLimitSec: 90,
    releaseRate: 60,
    minReleaseRate: 30,
    skills: sk({ digger: 2, basher: 2, blocker: 1, bomber: 1 }),
    par: 2,
    paint: [
      { t: 'ground', x: 0, w: 960, y: 340, h: 200, mat: MAT.EARTH, rough: 2 },
      { t: 'rect', x: 120, y: 372, w: 820, h: 14, mat: MAT.STEEL },
      { t: 'rect', x: 520, y: 372, w: 24, h: 14, mat: MAT.EARTH },
      { t: 'rect', x: 360, y: 408, w: 600, h: 12, mat: MAT.STEEL },
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
    name: 'Glutregen',
    chapter: 'Ader',
    // Ersetzt den vierten Schirmregen (Design-Runde, Paket 4): Der Schirm
    // traegt hinab wie gehabt — aber die Landeinsel hat zwei sichtbare
    // Todeskanten, und die Laufrichtung der Gelandeten fuehrt geradewegs
    // auf die oestliche zu. Der erste Gelandete muss Waechter werden;
    // Westlaeufer faengt die Tuer von selbst.
    hint: 'Der Schirm bringt dich auf die Insel — und die Insel hat Kanten. Der Erste unten wird Wächter.',
    theme: 'magma',
    width: 720,
    height: 620,
    seed: 51010,
    entrance: { x: 100, y: 110 },
    // Die Tuer liegt WESTLICH der Landestelle: Gelandete laufen ostwaerts
    // auf die Kante zu — erst der Abprall am Waechter bringt sie zur Tuer.
    exit: { x: 240, y: 450, w: 32, h: 26 },
    total: 12,
    needed: 7,
    timeLimitSec: 65,
    releaseRate: 40,
    minReleaseRate: 20,
    skills: sk({ floater: 10, blocker: 2 }),
    par: 11,
    paint: [
      { t: 'rect', x: 0, y: 50, w: 720, h: 20, mat: MAT.ROCK },
      // Der Startsims: Blech, von dessen Ostkante der lange Fall beginnt.
      { t: 'rect', x: 0, y: 170, w: 320, h: 26, mat: MAT.STEEL },
      // Die Landeinsel — 300 Punkte tiefer, mit zwei offenen Kanten.
      { t: 'rect', x: 200, y: 470, w: 280, h: 150, mat: MAT.ROCK },
      // Der Grund der Schlucht, sichtbar toedlich tief (130 Punkte).
      { t: 'ground', x: 0, w: 200, y: 600, h: 20, mat: MAT.ROCK, rough: 2 },
      { t: 'ground', x: 480, w: 240, y: 600, h: 20, mat: MAT.ROCK, rough: 2 },
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
    name: 'Der Kessel',
    chapter: 'Kern',
    // Ersetzt das Ostfluegel-Doppel zu w5-15 (Design-Runde, Paket 4): DAS
    // Rate-Regler-Level. Die Luke steht auf Vollgas, vor der Tuer klafft
    // eine Fanggrube — wer die halbfertige Bruecke betritt, kippt vom Ende
    // hinein und sitzt fest (lebt, aber fehlt der Quote). Vollgas fuellt
    // den Kessel, Drosseln haelt ihn leer; nach dem Schlussstein wird
    // aufgedreht. Rate-Zuege kosten kein Par. Die erste Fassung dieses
    // Slots (Sprengung im vollen Pulk) fiel im Messlauf: Die Explosion
    // reisst keine Nachbarn mit - nur Terrain.
    hint: 'Die Luke steht auf Vollgas, und die Brücke ist noch nicht fertig. Drossle den Strom — der Kessel schluckt jeden Vorwitzigen.',
    theme: 'magma',
    width: 720,
    height: 540,
    seed: 51013,
    entrance: { x: 100, y: 330 },
    exit: { x: 600, y: 360, w: 32, h: 26 },
    total: 20,
    // 17 statt 14 (Messregel): Die Drossel-Loesung rettet 19, Marge 2 -
    // und Vollgas fuellt den Kessel weit unter die Quote (Rot-Test).
    needed: 17,
    timeLimitSec: 75,
    releaseRate: 99,
    minReleaseRate: 15,
    skills: sk({ builder: 2 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 720, y: 380, h: 160, mat: MAT.EARTH, rough: 2 },
      // Der Kessel: 70 Punkte tief - ueberlebbar, ausweglos, sichtbar.
      // 24 Punkte breit, das bewiesene w1-03-Mass: Eine Bruecke schafft
      // zwei Punkte je Stein, die Zweierkette also 48 - mehr Grube waere
      // fuer den Vorrat unerreichbar (der erste Wurf mass 60 und der Bauer
      // endete mitten im Loch).
      { t: 'rect', x: 368, y: 380, w: 24, h: 70, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w5-14',
    name: 'Kaskade und Steg',
    chapter: 'Kern',
    // Ersetzt die dritte Portion w1-10 (Design-Runde, Paket 4): Remix aus
    // zwei Frost-Bausteinen — die Kaskade von w4-01 und die Brueckenluecke
    // von w4-11, mitten im Abstieg. Unter der Luecke fehlt die naechste
    // Etage sichtbar: Wer faellt, faellt 140 Punkte. Blocker haelt den
    // Pulk, Brueckenkette schliesst den Steg, die Bombe oeffnet den Weg.
    hint: 'Die Kaskade führt hinab — bis zur Lücke. Halte den Pulk, schliesse den Steg, dann sprenge den Wächter frei.',
    theme: 'magma',
    width: 480,
    height: 720,
    seed: 51014,
    entrance: { x: 340, y: 150 },
    exit: { x: 224, y: 390, w: 32, h: 26 },
    total: 14,
    // 9 statt 10: Die Musterloesung rettet 10 - eine Figur Vergebung,
    // mehr gibt der Steg nicht her (Blocker wird gesprengt, und der Bau
    // kostet, wen die Luecke vor dem Waechter erwischt).
    needed: 9,
    timeLimitSec: 135,
    releaseRate: 50,
    minReleaseRate: 25,
    skills: sk({ builder: 2, blocker: 1, bomber: 1 }),
    par: 4,
    paint: [
      { t: 'rect', x: 0, y: 50, w: 480, h: 20, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 200, w: 380, h: 12, mat: MAT.ROCK },
      // Die geteilte Etage: 44 Punkte Luecke, und darunter — nichts.
      // Westteil bis 304: Die Luecke misst 40 Punkte - eine Zweierkette
      // (48 Punkte Spannweite) erreicht das mit zwei Steinen Reserve.
      { t: 'rect', x: 100, y: 270, w: 204, h: 12, mat: MAT.ROCK },
      // Die Ost-Etage ist DICK: Auf ihr steht der Waechter, und seine
      // Sprengung soll eine Mulde reissen, kein Loch - das w1-03-Prinzip.
      { t: 'rect', x: 344, y: 270, w: 136, h: 50, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 340, w: 280, h: 12, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 480, y: 410, h: 310, mat: MAT.EARTH, rough: 2 },
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
