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
 * vier Stockwerke." (`welten.ts`). Siebzehn Level in drei Kapiteln —
 * **Terrasse** (1 bis 6) lehrt das Normhoehen-Raster, **Hang** (7 bis 12)
 * verkettet es, **Kamm** (13 bis 17) prueft. Gebaut und ausgemessen sind
 * bisher die ersten sieben; der Rest steht als abgenommener Entwurf in
 * `docs/welt-6-7-konzept.md` und wird Level fuer Level nachgezogen, jedes
 * mit eigener Messrunde. Die Welt meldet darum nur die gebauten Punkte:
 * Eine Karte, die zehn tote Punkte zeigt, verspricht etwas, das das Spiel
 * nicht halten kann.
 *
 * Eine Abweichung vom Entwurf ist im Bestand festgeschrieben: Das Konzept
 * fuehrt auf Platz 3 „Die Wasserrinne" und auf Platz 4 „Zu tief zum Fallen".
 * Gebaut wurde damals der Platz-4-Entwurf auf Platz 3, und die spaetere
 * Messrunde hat aus demselben Entwurf ein zweites, besseres Level gemacht.
 * Beide sind gruen, beide sind nachweislich eigenstaendig (der Plan des
 * einen verliert im anderen), und sie stehen jetzt als Paar: Platz 3 fuehrt
 * die Schraege am gestuften Hang ein, Platz 4 steigert sie an drei losen
 * Bloecken. „Die Wasserrinne" faellt dafuer aus dem Plan — siebzehn Plaetze
 * sind siebzehn Plaetze, und ein gemessenes Level wiegt schwerer als ein
 * geschriebener Entwurf. Die Reihenfolge-Lehre, die sie tragen sollte,
 * traegt w6-13.
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
    // Die dritte Stufe des Rasters, gebaut im Bild von Level 2: dieselben
    // drei Terrassen, aber im E96-Takt (Oberkanten y180 / y276 / y372) ueber
    // der Tuersohle y444. Ein Sturz ueber eine Kante waere 96 und damit
    // toedlich, und es liegt KEIN Schirm im Vorrat — also traegt nur die
    // Schraege. Zwei davon, jede rund 170 Bildpunkte ostwaerts. Die letzte
    // Stufe auf die Sohle misst 72 und faellt frei: Das ist die These der
    // Welt in einem Bild, denn der Spieler muss hier 96 von 72 unterscheiden
    // und nicht Werkzeuge zaehlen.
    //
    // ## Was die Messung gelehrt hat
    //
    // 1. EINE SCHRAEGE DARF NICHT BUENDIG MUENDEN. Der erste Wurf folgte dem
    //    Entwurf aufs Wort: ein Findlingsdeckel auf T2 hielt den Bagger nach
    //    vollen 192 px buendig auf Terrassenhoehe an. Das loeste sauber
    //    (12 von 12, kein Toter) — und brauchte 112,3 s statt der jetzigen
    //    73,4 s. Eine buendige Muendung ist naemlich eine Rampe in BEIDE
    //    Richtungen: Der Pulk lief sie wieder hinauf, und der Bagger, den der
    //    Stein nach Westen dreht, lief als Erster zurueck. Die halbe Uhr war
    //    Zuschauen. Jetzt endet jede Terrassenstirn zwoelf Bildpunkte ueber
    //    der naechsten — die Schraege bricht aus der Stirn, die letzten zwoelf
    //    sind ein Fall, und ein Absatz von zwoelf wendet jeden (MAX_STEP 5).
    //    Dasselbe Bild, halbe Uhr.
    // 2. DIE ZWEI FINDLINGSBAENDER SIND DAS NETZ, NICHT DER SCHMUCK. Sie
    //    liegen auf Terrassenhoehe quer durch den ganzen Hangkoerper (y276 bis
    //    x392, y372 bis x628) und stehen nur an den Terrassenstirnen als
    //    Steinstreifen im Profil. Wer zu weit westlich ansetzt, laeuft in das
    //    Band und steht sichtbar auf Stein, statt den Huegel diagonal
    //    aufzuschneiden und den Pulk in einer Tiefe zu stranden, aus der ihn
    //    kein zweiter Bagger holt. Gemessen: Jeder Fehlansatz kostet einen
    //    Bagger und den Rueckweg, keiner ein Leben — darum fuenf im Vorrat.
    // 3. Die 12er Lippen (x296 auf T1, x556 auf T2) halten den
    //    unbeaufsichtigten Pulk oben. Ohne eine einzige Zuweisung pendelt er
    //    bis zur Uhr: niemand stirbt, und niemand kommt an.
    hint: 'Sechsundneunzig sind zu tief zum Fallen, und ein Schirm liegt nicht bereit. Zwei Schrägen tragen den Hang hinab — die zweite erst dort, wo der Findling endet.',
    theme: 'sonnenhang',
    width: 720,
    height: 540,
    seed: 61003,
    entrance: { x: 80, y: 130 },
    exit: { x: 664, y: 418, w: 32, h: 26 },
    total: 12,
    needed: 9,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (73,4 s).
    timeLimitSec: 105,
    releaseRate: 35,
    minReleaseRate: 15,
    skills: sk({ miner: 5, blocker: 2 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Der Hang als drei gestufte Erdkoerper. Jeder reicht bis zur Sohle
      // hinunter — nur so steht unter der Schraege durchgehend Boden, und nur
      // deshalb traegt sie ueberhaupt 96 am Stueck.
      { t: 'rect', x: 0, y: 180, w: 308, h: 360, mat: MAT.EARTH },
      // Die Lippe an T1s Ostkante: Dahinter faellt es 96 auf T2, und die
      // Schraege laeuft zwoelf Bildpunkte darunter durch, ohne sie zu
      // beruehren. Sie ist der Grund, warum Nichtstun hier verliert statt zu
      // toeten.
      { t: 'rect', x: 296, y: 168, w: 12, h: 12, mat: MAT.EARTH },
      { t: 'rect', x: 308, y: 276, w: 260, h: 264, mat: MAT.EARTH },
      // Das Findlingsband auf T2-Hoehe. Es endet bei x392 — oestlich davon
      // liegt die Erde offen, und genau dort und nur dort greift die zweite
      // Schraege. Wer davor tippt, hoert den Stein und sieht den Bagger
      // abdrehen (die Lehre von Level 2, hier als Preisschild).
      { t: 'rect', x: 0, y: 276, w: 392, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 556, y: 264, w: 12, h: 12, mat: MAT.EARTH },
      { t: 'rect', x: 568, y: 372, w: 60, h: 168, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 372, w: 628, h: 6, mat: MAT.STEEL },
      // Die Tuersohle. T3s Ostkante steht 72 darueber und bleibt mit Absicht
      // ohne Lippe: 72 faellt frei, und dass der letzte Schritt nichts kostet,
      // ist der Satz, den dieses Level zu sagen hat.
      { t: 'ground', x: 628, w: 92, y: 444, h: 96, mat: MAT.EARTH, rough: 2 },
    ],
  },
  {
    id: 'w6-04',
    name: 'Die dritte Schräge',
    chapter: 'Terrasse',
    // Die Steigerung des Vorlevels, und der Unterschied steckt in der Luft
    // zwischen den Bloecken. Dort traegt ein gestufter Hang: Eine Schraege
    // bricht aus der Terrassenstirn und der Bagger steht danach wieder auf
    // Boden. Hier liegen drei volle E96-Bloecke mit 24 Bildpunkten Luft
    // dazwischen — am Blockfuss verliert der Bagger den Boden, faellt die 24
    // heil auf den naechsten und muss dort NEU angesetzt werden. Aus zwei
    // Schraegen werden drei, und keine traegt durch.
    //
    // Zwei Zahlen machen das Level haerter als seinen Vorgaenger: Es gibt
    // kein Findlingsband, das einen Fehlansatz sichtbar abfaengt, und jede
    // Schraege laeuft volle 192 Bildpunkte nach Osten. Wer die dritte zu weit
    // oestlich ansetzt, laeuft mit ihr aus der Welt — deshalb sechs Bagger
    // im Vorrat fuer drei gesetzte.
    hint: 'Drei Blöcke, und zwischen ihnen steht Luft — keine Schräge trägt durch. Jeder Block braucht seine eigene, immer weiter nach Osten.',
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
  },
  {
    id: 'w6-05',
    name: 'Die Rampe von oben',
    chapter: 'Terrasse',
    // Der neue Satz der Welt, zum ersten Mal umgedreht: In w6-03 traegt die
    // Baggerschraege HINAB, hier traegt sie HINAUF. Der Pulk pendelt am
    // Hangfuss, die Tuer sitzt sichtbar in einer Kammer im Hang, und
    // dazwischen liegen sechsundneunzig, die von unten niemand nimmt.
    //
    // ## Was die Messung gelehrt hat
    //
    // 1. Ein Bagger graebt, wohin er SCHAUT (`stepMining`: nx = x + dir *
    //    MINE_DX). Der Entwurf liess den Kletterer ostwaerts ueber die Krone
    //    laufen und dabei eine Westschraege schneiden — das gibt es nicht;
    //    gemessen kam die Rampe jedes Mal auf der falschen Seite heraus.
    //    Also laeuft der Spaeher erst bis an den Ostrand der Welt, kehrt
    //    dort um, und erst auf dem Rueckweg wird er zum Bagger. Diese Kehre
    //    IST der Griff des Levels; sie stammt aus der Messung, nicht aus dem
    //    Papier.
    // 2. Zwei Schraegen, eine Hand. Die Westschraege setzt den Bagger selbst
    //    am Hangfuss ab; von dort steigt er seine eigene Rampe zurueck
    //    hinauf — der Beweis, dass sie in beide Richtungen traegt — und
    //    schaut oben wieder nach Osten. Dieselbe Figur oeffnet mit dem
    //    zweiten Bagger die Tuerkammer. Par 3, alle drei Zuege an einem
    //    einzigen Wusel.
    // 3. Der Erdkeil ist kein Schmuck. Erster Wurf: senkrechte Hangflanke,
    //    Muendung genau auf die Findlingssohle. Gemessenes Ansatzfenster:
    //    FUENF Bildpunkte, eine Viertelsekunde — unspielbar. Der 1:1-Keil am
    //    Hangfuss faengt jede Muendung zwischen y349 und y396 ab und macht
    //    daraus einundsiebzig; die vorgeschnittene Tuerkammer tut auf der
    //    Ostseite dasselbe (zweiundvierzig gemessen).
    // 4. Wer daneben tippt, verliert nichts. Weltrand und Hangkante wenden
    //    den Spaeher, der Keil traegt ihn heil hinab, durch die Westrampe
    //    kommt er von selbst wieder herauf: Er laeuft die Schleife endlos,
    //    bis der Griff sitzt. Ueber die volle Uhr Leerlauf stirbt in diesem
    //    Level niemand — gemessen, nicht geschaetzt.
    hint: 'Die Tür sitzt in einer Kammer im Fuß des Hangs, und keine Kante führt hinauf. Schick einen Kletterer auf die Krone — von dort trägt seine Schräge in beide Richtungen.',
    theme: 'sonnenhang',
    width: 480,
    height: 540,
    seed: 61005,
    entrance: { x: 60, y: 330 },
    exit: { x: 444, y: 370, w: 32, h: 26 },
    total: 14,
    needed: 11,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (126,2 s).
    timeLimitSec: 177,
    releaseRate: 45,
    minReleaseRate: 20,
    skills: sk({ climber: 3, miner: 3, blocker: 2 }),
    par: 3,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 404, w: 480, h: 136, mat: MAT.EARTH },
      // Der Erdkeil am Hangfuss: 1:1 von der Sohle (x120) hinauf an die
      // Flanke (x167/y349). Er ist die Toleranz des Levels — jede
      // Westmuendung zwischen y349 und y396 trifft ihn, und der Pulk laeuft
      // von der Sohle ohne Stufe in den Stollen hinein. Zugleich ist er die
      // Leiter des Spaehers: Der Kletterer nimmt an seinem Kopf nur noch
      // achtundvierzig statt sechsundneunzig.
      { t: 'slope', x0: 120, y0: 396, x1: 167, y1: 349, thick: 48, mat: MAT.EARTH },
      // Der Hang: sechsundneunzig hoch, Krone y300, bis an den Ostrand der
      // Welt. Der Weltrand ersetzt die Lippe — er wendet den Spaeher, ohne
      // dass jemand fallen kann, und ist damit die Kehre, aus der die
      // Westschraege ueberhaupt erst moeglich wird.
      { t: 'rect', x: 168, y: 300, w: 312, h: 96, mat: MAT.EARTH },
      // Die Findlingssohle liegt UEBER dem Keil, nicht darunter. Der Keil
      // malt mit achtundvierzig Bildpunkten Dicke bis y443 durch und riss
      // sie im ersten Bau auf ganzer Keilbreite auf — dann graebt jede
      // Schraege durch die Sohle weiter, statt an ihr zu wenden. Im
      // Terrainabzug gesehen, durch die Reihenfolge geheilt.
      { t: 'rect', x: 0, y: 396, w: 480, h: 8, mat: MAT.STEEL },
      // Die Tuerkammer im Hangfuss: zwoelf hoch, von aussen unerreichbar,
      // vom ersten Bild an sichtbar. Sie faengt die Ostschraege genauso ab
      // wie der Keil die Westschraege — beide Rampen duerfen daneben
      // liegen, keine muss auf den Bildpunkt sitzen.
      { t: 'rect', x: 440, y: 384, w: 40, h: 12, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w6-06',
    name: 'Der Sonnenhof',
    chapter: 'Terrasse',
    // Das eine Doppeltor dieser Welt (Konzept: B6 genau einmal je neuer
    // Welt). Ein ummauerter Hofgarten mit der Tuer in der Mitte, und zwei
    // Tore, die zusammen in ein Fenster von 300 x 200 passen: der Schacht
    // durchs Erddach und der Stollen durch die Westmauer. Beide loesen,
    // beide sind sicher, keiner kostet ein Leben — nur der Rammer haelt das
    // Par. Die Kuer ist damit eine ANDERE Route und nicht dieselbe Route
    // fehlerfreier; bezahlt wird in Zeit oder in Werkzeug.
    //
    // Gemessen, beide Wege ueber den vollen Durchlauf:
    //   Westmauer — 1 Zug, 12 von 12 gerettet, letzte Rettung 68,0 s.
    //   Erddach — 13 Zuege (Graeber und zwoelf Schirme), 12 von 12, 36,6 s.
    // Der Umweg kostet einunddreissig Sekunden und spart zwoelf Vergaben.
    // Der leere Plan verliert, ohne eine einzige Figur zu verlieren: Der
    // Pulk pendelt unversehrt auf der Hofsohle vor der Mauer.
    //
    // Zwei Zahlen hat die Messung gegen den Entwurf gestellt. Erstens: Das
    // Dach ist 24 dick, und deshalb faellt der Graeber aus seinem eigenen
    // Schacht 96 — die Hofhoehe —, jeder Nachlaeufer aber 120; der tritt
    // oben auf die Dachkante und nicht unten aus der Decke. Beide Zahlen
    // liegen ueber der Sturzgrenze 78, beide verlangen den Schirm. Wer nur
    // die Kammerhoehe rechnet, rechnet die Dachdicke aus Versehen weg.
    // Zweitens: Der Entwurf veranschlagte zwei Zuweisungen fuer die Mauer,
    // gemessen ist es eine — wie bei den beiden Geschwistern w4-06 und
    // w5-05, die denselben Baustein tragen und ebenfalls auf par 1 stehen.
    hint: 'Der Hof hat zwei Tore: der Schacht durchs Erddach — hundertzwanzig tief, ein Schirm für jeden. Oder der lange Weg herum zur Westmauer. Nur einer hält das Par.',
    theme: 'sonnenhang',
    width: 720,
    height: 540,
    seed: 61006,
    entrance: { x: 200, y: 200 },
    exit: { x: 344, y: 334, w: 32, h: 26 },
    total: 12,
    // Beide Wege retten zwoelf, keiner toetet: Quote = Messung minus 3.
    needed: 9,
    // Uhr = 1,4 x letzte Rettung der LANGSAMEREN Route (Mauer, 68,0 s);
    // das Dach ist nach 36,6 s fertig. Gemessener Uhrfaktor 1,40.
    timeLimitSec: 95,
    releaseRate: 45,
    minReleaseRate: 20,
    // Der Blocker gehoert keinem der beiden Tore, und er bleibt trotzdem:
    // Als Riegel auf die Westkante des Daches gesetzt haelt er den Pulk
    // oben, waehrend die zwoelf Schirme verteilt werden (gemessen: 14
    // Zuege, 11 von 12, letzte Rettung 47,9 s). Ruhe fuer Geld — der
    // einzige Handel dieses Levels, der weder Weg noch Ausgang aendert.
    skills: sk({ basher: 2, digger: 2, floater: 12, blocker: 2 }),
    par: 1,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Das Hofmassiv am Stueck, dann der Hof hineingeschnitten: Dach 24
      // dick, Hohlraum 96 hoch, jede Mauer 60 dick. Die 96 sind die Zahl,
      // die der Spieler sieht; die 24 sind die, die er unterschaetzt.
      { t: 'rect', x: 120, y: 240, w: 480, h: 120, mat: MAT.EARTH },
      { t: 'rect', x: 180, y: 264, w: 360, h: 96, mat: MAT.EMPTY },
      // Findling auf beiden Mauerkoepfen — der Mauerleib bleibt frei davon,
      // sonst gaebe es kein Westtor. Ohne die sechs Punkte Stein laege der
      // bequemste Schacht ueber der Mauer selbst: hundertzwanzig gerade
      // hinunter in eine neun Punkte breite Grube, aus der niemand mehr
      // herauskommt und in die jeder Nachlaeufer hundertzwanzig faellt. Mit
      // ihnen steht ein falsch gesetzter Graeber nach einem Schlag sichtbar
      // auf Stein — gemessen verloren, aber ohne einen Toten. Das ist die
      // w6-02-Lehre, hier als Gelaender.
      { t: 'rect', x: 120, y: 240, w: 60, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 540, y: 240, w: 60, h: 6, mat: MAT.STEEL },
      // Der Ostgiebel: zwoelf Punkte hoeher als das Westdach. Eine 12er
      // Lippe wendet jeden ausser einem Kletterer, und einen gibt es hier
      // nicht — also bleibt der Pulk von selbst auf der Westhaelfte, beide
      // Tore liegen im selben Fenster, und kein Werkzeug bezahlt dafuer.
      // Ohne ihn liefe jede Figur bis zur Ostkante und zurueck, gut zwanzig
      // Sekunden je Figur, und die Ostkante faellt hundertzwanzig.
      { t: 'rect', x: 360, y: 228, w: 240, h: 12, mat: MAT.EARTH },
      // Die Aussentreppe, zwei Stufen im Raster: 48 vom Dach auf das Band,
      // 72 vom Band auf die Hofsohle. Das Band endet weiter WESTLICH als
      // das Dach darueber — nur so faellt der Pulk von Kante zu Kante
      // hinab, statt auf einer Stufe gefangen zu pendeln.
      { t: 'rect', x: 20, y: 288, w: 100, h: 16, mat: MAT.EARTH },
      // rough 0 auf der ganzen Sohle, weil auf ihr gerammt wird: Ein Rammer
      // verliert auf rauem Grund nach jedem Zwei-Punkt-Versatz den Boden.
      { t: 'ground', x: 0, w: 720, y: 360, h: 180, mat: MAT.EARTH, rough: 0 },
    ],
  },
  {
    id: 'w6-07',
    name: 'Der Brunnen',
    chapter: 'Hang',
    // Die einzige Schleife der Welt, die nach UNTEN geht: hinab, hinueber,
    // hinauf. Die Findlingsmauer teilt die Mittelterrasse bis zur Felsdecke
    // und ist von oben nicht zu nehmen — ihr Fuss aber haengt achtzehn
    // Bildpunkte ueber der Kammersohle, und darunter passt ein Koerper
    // (12 hoch) bequem hindurch. Also sinkt ein Graeber den Brunnen durch die
    // Erdplatte (E48 hinab, frei), der Pulk laeuft unter dem Mauerfuss nach
    // Osten, und je ein Kletterer holt die 48 an der Kammerostwand zur
    // Tuerbank zurueck. Wer nichts tut, pendelt oben zwischen Hangschulter
    // und Mauer und verliert keine einzige Figur; der einzige Gegner ist die
    // Uhr. Der Brunnenmund zwischen Mauer und Tuerblock steht mit Absicht
    // offen: Man SIEHT die Kammer und die Kletterwand, bevor man tippt.
    //
    // ## Was die Messung gelehrt hat
    //
    // 1. Der teuerste Befund: Ein Schacht ganz im Westen der Platte legte
    //    sich genau unter die Abbruchkante der Startterrasse — aus 48 px
    //    Fall wurden 96, und ZEHN von zwoelf Figuren zerschellten an einem
    //    einzigen Fehltipp. Zwei Antworten stehen jetzt im Bild: Die Westbank
    //    traegt einen Findlingsdeckel (dort beisst kein Graeber), und die
    //    Startterrasse endet vierzig Bildpunkte weiter westlich als die Bank.
    //    Ihre Kante faellt damit immer auf ungrabbaren Stein.
    // 2. Auch die Sohle ist Findling, und zwar deshalb: Ohne sie graebt ein
    //    Fehltipp in der Kammer den Pulk in den Abgrund. Mit ihr ist die
    //    Erdplatte ueber der Kammer das EINZIGE grabbare Feld des Levels —
    //    und dort loest jede Stelle (gemessen x304 bis x551, sieben Proben,
    //    kein Toter). Kein Zielraetsel: Das steht in w6-02 und w6-08.
    // 3. Der Kragstein ist Pflicht, nicht Zierat. Ein Kletterer, den man
    //    versehentlich oben vergibt, stiege sonst an der Mauerwestflanke bis
    //    unter die Felsdecke und faellt von dort 208 px in den Tod. Am
    //    Kragstein kippt er nach vierzig und steht wieder im Pulk (Gesetz 9).
    // 4. Traegheit kostet hier nichts: Auch ein Graeber, der erst nach der
    //    zwoelften Figur gesetzt wird, rettet noch 12 von 12.
    hint: 'Die Findlingsmauer steht bis zur Decke — nur unten, in der Kammer, endet sie zu früh. Grabe dich hinunter, laufe hinüber, klettere drüben wieder hinauf.',
    theme: 'sonnenhang',
    width: 720,
    height: 540,
    seed: 61007,
    entrance: { x: 160, y: 210 },
    exit: { x: 656, y: 274, w: 32, h: 26 },
    total: 12,
    needed: 9,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (50,7 s).
    timeLimitSec: 71,
    releaseRate: 50,
    minReleaseRate: 20,
    skills: sk({ digger: 3, climber: 14, blocker: 2 }),
    // Gemessen: ein Graeber, zwoelf Kletterer — einer je Figur.
    par: 13,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Startterrasse (E48 ueber der Mittelterrasse) mit ihrem Widerlager im
      // Westen. Sie endet bei x260 — vierzig Bildpunkte VOR dem Ostrand der
      // Findlingsbank darunter, damit ihre Abbruchkante niemals ueber einem
      // grabbaren Feld haengt. Genau daran ist der erste Wurf gestorben.
      { t: 'rect', x: 0, y: 252, w: 260, h: 16, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 252, w: 60, h: 96, mat: MAT.EARTH },
      // Die Westbank der Mittelterrasse: massiv bis zur Sohle und oben mit
      // Findling gedeckelt. Wer hier graebt, hoert Stein und macht kein Loch.
      { t: 'rect', x: 0, y: 300, w: 300, h: 48, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 300, w: 300, h: 6, mat: MAT.STEEL },
      // Die Erdplatte ueber der Kammer — sechzehn dick und das einzige
      // grabbare Feld des Levels.
      { t: 'rect', x: 300, y: 300, w: 256, h: 16, mat: MAT.EARTH },
      // Die Findlingsmauer: von der Felsdecke bis y329, also achtzehn ueber
      // der Sohle. Oben ein Riegel, unten ein Tor — dasselbe Bauteil.
      { t: 'rect', x: 556, y: 80, w: 44, h: 250, mat: MAT.STEEL },
      // Der Kragstein, zwanzig Bildpunkte nach Westen ueber die Mauer hinaus:
      // Er kippt einen falsch vergebenen Kletterer nach vierzig Bildpunkten
      // statt nach zweihundertacht. Ohne ihn kostet ein Fehltipp eine Figur.
      { t: 'rect', x: 536, y: 240, w: 64, h: 8, mat: MAT.STEEL },
      // Der Tuerblock. Seine Westflanke ist die Kletterwand (48 von der Sohle
      // auf y300), seine Krone traegt Findling — auch hier soll kein Graeber
      // ein Loch zwischen Ankunft und Tuer reissen.
      { t: 'rect', x: 640, y: 300, w: 80, h: 48, mat: MAT.EARTH },
      { t: 'rect', x: 640, y: 300, w: 80, h: 6, mat: MAT.STEEL },
      // Die Kammersohle als Findlingspflaster ueber dem Untergrund: Sie ist
      // der Grund, warum in diesem Level kein Graeber jemals in die Tiefe
      // durchsackt — und warum die Kletterhoehe auf den Bildpunkt genau 48
      // bleibt (rough 0).
      { t: 'ground', x: 0, w: 720, y: 348, h: 192, mat: MAT.EARTH, rough: 0 },
      { t: 'rect', x: 0, y: 348, w: 720, h: 8, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w6-08',
    name: 'Unter der Hecke',
    chapter: 'Hang',
    // Die einzige Haarnadel der Welt — und die einzige, die ein
    // PLATZIERUNGSraetsel ist. Der Weg zeigt sich vollstaendig im Startbild:
    // Hinweg (y300) ostwaerts bis zur Hecke, dahinter E72 hinab in die Grube
    // (y372), von der Grube schraeg hinunter in die sichtbare Vorhalle
    // (y444), und aus ihr rammt der Stollen knapp 290 Bildpunkte westwaerts
    // unter dem ganzen Hinweg zurueck in die Tuerkammer, die von Anfang an
    // offen unter dem Eingang liegt. Gesucht ist kein Ort, sondern eine
    // STELLE: Wo genau setzt die Schraege an? Gemessenes Fenster x600 bis
    // x692 — 93 Bildpunkte auf 200 Bildpunkten Grubensohle.
    //
    // ## Was die Messung gegen den Entwurf entschieden hat
    //
    // 1. EINE FINDLINGSSOHLE TRAEGT KEINEN BAGGER. Der Entwurf legte die
    //    ganze Grubensohle als Findling an. Das geht nicht: `stepMining`
    //    prueft `sy = y - 11`, `sh = 13`, also bis eine Zeile UNTER die
    //    Fuesse — wer auf Stahl steht, dreht im ersten Arbeitstick ab
    //    (dieselbe Zeile, an der w6-05 den Hangfuss verloren hat). Der
    //    Findling ist deshalb auf die 42 Bildpunkte am Fuss der Stirn
    //    geschrumpft (x520 bis x561), und genau dieser Rest IST das Raetsel:
    //    Er ist das sichtbare Westende der Sohle, und seine Unterkante ist
    //    das, worunter die Schraege durchmuss.
    // 2. DER ANSATZ IST NICHT DIE STEINKANTE, SONDERN DIE STEINKANTE PLUS
    //    ANLAUF. Der Stein endet bei x561, das Fenster beginnt aber erst bei
    //    x600 — gemessen, nicht gerechnet. Der Grund steht in derselben
    //    Zeile wie Befund 1: Der Bagger prueft elf Bildpunkte ueber seinen
    //    Fuessen und vier voraus, seine Bahn muss also zwoelf unter der
    //    Plattenunterkante (y377) liegen, bevor sein Blick die Plattenkante
    //    erreicht — 2 x 19 = 38 Bildpunkte Anlauf, plus einer. Die
    //    Konzeptzeile „oestlich von x600" stimmt damit auf den Bildpunkt,
    //    aber aus einem anderen Grund, als sie angibt.
    // 3. DAS OSTENDE DES FENSTERS IST DIE VORHALLE, NICHT DER WELTRAND. Ab
    //    x693 kommt die Schraege oestlich der Vorhalle auf dem Findlingsgrund
    //    auf und endet in einer blinden Tasche; der Pulk laeuft die Rampe
    //    hinab, steht vor Erde und laeuft sie wieder hinauf. Genau daran
    //    scheitert das Rezept von w3-14 „Unter dem Hinweg", das den Bagger am
    //    Weltrand wendet und sofort ansetzt (Rot-Probe gefahren: verloren,
    //    kein Toter). Dort war der Ansatz gleichgueltig, hier ist er alles.
    // 4. DIE VORHALLE IST DER STANDPLATZ DES RAMMERS, NICHT DIE KULISSE.
    //    Ohne sie endet die Rampe unmittelbar an der Erdwand, und der
    //    Rammer haette dort vier Bildpunkte ebenen Boden — zwei Zehntel
    //    Sekunden, unspielbar (und auf der schiefen Rampe verliert er nach
    //    jedem Zwei-Punkt-Versatz den Boden, siehe w3-14). Mit ihr ist das
    //    Rammerfenster gemessene 86 Bildpunkte breit (x460 bis x545): Man
    //    tippt irgendwo in der Halle nach Westen, die Vormerkung traegt den
    //    Rest bis an die Wand.
    // 5. DER GRAEBER IST KOEDER, UND ER IST ANGEKUENDIGT. Er liegt im
    //    Vorrat, er loest nichts — das ist Absicht. Auf dem Hinweg und ueber
    //    der Tuerkammer meldet er nach null Bildpunkten Findling (gemessen,
    //    je eine Steinmeldung, kein Loch): Der Hinweg traegt einen
    //    durchgehenden Findlingsdeckel, die Tuerkammer ausserdem einen
    //    eigenen. Auf dem Erdfeld der Grube — dem einen Feld, das der Bagger
    //    braucht — senkt er dagegen einen 72er Schacht auf den
    //    Findlingsgrund; der Pulk faellt unverletzt hinein und sitzt fest.
    //    Gemessen: Lauf verloren, kein Toter. Das ist der Preis dafuer, dass
    //    hier ueberhaupt ein Bagger arbeiten kann — ein Findlingsdeckel auf
    //    diesem Feld naehme den Bagger mit (Befund 1).
    // 6. TODESFREI, UND ZWAR BEWEISBAR. Der tiefste Sturz des Levels ist die
    //    E72 hinter der Hecke; alles andere faellt 49 (Falltuer), 24 (Rampe
    //    in die Vorhalle) oder gar nicht. Vierhundert Zufallslaeufe mit
    //    wahllos verteilten Berufen: null Tote — und null Zufallssiege.
    // 7. Traegheit kostet nichts. Wer erst nach vierzig Sekunden anfaengt,
    //    rettet immer noch 14 von 14 (letzte Rettung 131,1 s bei einer Uhr
    //    von 142). Wer gar nichts tut, verliert ohne eine einzige Figur: Die
    //    Hecke haelt den Pulk auf dem Hinweg.
    //
    // Malreihenfolge beachtet: Alle fuenf Findlingsstuecke stehen am ENDE
    // der Liste. Der Hinwegdeckel liegt auf demselben Band wie der
    // Erdkoerper darunter und waere sonst wieder Erde.
    hint: 'Die Tür liegt sichtbar unter dem Eingang — aber ihr Deckel ist Findling. Hinter der Hecke geht es zweiundsiebzig hinab, und die Schräge muss unter dem Steinfuß hindurch: weit im Osten ansetzen, sonst hörst du nur den Stein.',
    theme: 'sonnenhang',
    width: 720,
    height: 540,
    seed: 61008,
    entrance: { x: 130, y: 250 },
    exit: { x: 114, y: 418, w: 32, h: 26 },
    total: 14,
    // Musterloesung rettet alle 14 — sterben kann hier niemand (Befund 6).
    // Quote = Messung minus 3.
    needed: 11,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (101,1 s).
    timeLimitSec: 142,
    releaseRate: 40,
    minReleaseRate: 20,
    // Vier Knopfarten, alle laengst gelehrt. Fuenf Bagger fuer einen
    // gesetzten: Das Ansatzfenster ist der Kern des Levels, und ein
    // Fehlansatz soll ein Werkzeug kosten und den Rueckweg — gemessen
    // gewinnt der Lauf auch noch mit einem verschenkten Bagger.
    skills: sk({ basher: 4, miner: 5, blocker: 2, digger: 2 }),
    par: 3,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Der Hinweg als ein Massiv bis zum Grund: In ihm liegen Tuerkammer
      // und Stollen, und auf ihm wird gerammt — darum rough 0.
      { t: 'ground', x: 0, w: 520, y: 300, h: 240, mat: MAT.EARTH, rough: 0 },
      // Die Hecke: die 12er Lippe der Welt, hier als Gehoelz am Wegende.
      // Sie ist der Grund, warum Nichtstun verliert statt zu toeten — der
      // Pulk pendelt hinter ihr auf dem Hinweg, bis der Rammer sie oeffnet.
      { t: 'rect', x: 504, y: 288, w: 16, h: 12, mat: MAT.EARTH },
      // Die Grube hinter der Hecke, 72 tiefer. Auch hier rough 0: Der
      // haeufigste Fehlgriff des Levels ist ein Rammer auf dieser Sohle.
      { t: 'ground', x: 520, w: 200, y: 372, h: 168, mat: MAT.EARTH, rough: 0 },
      // Die Vorhalle auf der Tiefsohle — vom ersten Bild an sichtbar, und
      // damit die Ansage des Levels: DA muss die Schraege hin. Sie faengt
      // jede Muendung des Fensters ab (die westlichste bei x504, die
      // oestlichste bei x548) und gibt dem Rammer die ebene Bank.
      { t: 'rect', x: 460, y: 420, w: 86, h: 24, mat: MAT.EMPTY },
      // Die Tuerkammer genau unter dem Eingang: die Haarnadel als Bild.
      { t: 'rect', x: 100, y: 418, w: 76, h: 26, mat: MAT.EMPTY },
      // --- Findling zuletzt (Malreihenfolge) ---------------------------
      // Der Deckel des Hinwegs: Kein Graeber reisst hier ein Loch, und
      // damit haengt keine Abbruchkante je ueber einem Schacht.
      { t: 'rect', x: 0, y: 300, w: 520, h: 6, mat: MAT.STEEL },
      // Die Stirn des Hinwegs: 72 sichtbar als Grubenwestwand, sechs
      // weitere im Boden. An ihr endet jeder Rammer, der auf der
      // Grubensohle nach Westen schlaegt — sichtbar, hoerbar, ohne Verlust.
      { t: 'rect', x: 508, y: 300, w: 12, h: 78, mat: MAT.STEEL },
      // Der Findlingsfuss der Grubensohle. Zweiundvierzig Bildpunkte Stein,
      // und die ganze Schwierigkeit des Levels: Auf ihm dreht jeder Bagger
      // sofort ab, unter ihm muss jede Schraege durch. Fenster x600..x692.
      { t: 'rect', x: 520, y: 372, w: 42, h: 6, mat: MAT.STEEL },
      // Der Deckel der Tuerkammer — der angekuendigte Koeder. Wer die Tuer
      // von oben aufgraben will, steht nach null Bildpunkten auf Stein.
      { t: 'rect', x: 94, y: 412, w: 88, h: 6, mat: MAT.STEEL },
      // Der Findlingsgrund: Er faengt die Schraege auf y444 ab (ohne ihn
      // graebt sie sich aus der Welt), er gibt dem Stollen seine Hoehe, und
      // er deckelt jeden Graeberschacht bei 72 — unter der Sturzgrenze 78.
      { t: 'rect', x: 0, y: 444, w: 720, h: 12, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w6-09',
    name: 'Die Doppelmauer',
    chapter: 'Hang',
    // Der Durchatmer des Kapitels, und sein Griff ist eine Rechnung: Der
    // Rammer raeumt genau zwoelf Bildpunkte ueber den Fuessen (BASH_UP 12),
    // das Tuerbeet hinter der Mauer liegt aber vierundzwanzig ueber der
    // Sohle. Ein Stollen von der Sohle aus kann die Tuer also gar nicht
    // treffen — er endet an der Findlingsflanke des Tuerbeets, und dort
    // steht der Pulk sichtbar herum. Der zweite Stollen muss vierundzwanzig
    // hoeher ansetzen, und so hoch traegt genau eine Zweierkette Bauer.
    // Dieselbe Mauer, zweimal genommen: daher der Name.
    //
    // ## Was die Messung gegen den Entwurf entschieden hat
    //
    // 1. EIN BAUER IST EIN SPANN-, KEIN HEBEWERKZEUG. Im Code nachgemessen
    //    (stepBuilding: ny = y-1 je Stein bei BUILD_ADVANCE 2, BUILD_BRICKS
    //    12): ein Bauer x300/y335 -> x324/y323, also ZWOELF hinauf auf
    //    VIERUNDZWANZIG Spannweite. Die Kette aus zwei Bauern misst
    //    x300/y335 -> x348/y311: 24 hinauf auf 48 weit. Das Konzept
    //    veranschlagte „rund 26 px" — daraus sind vierundzwanzig geworden,
    //    denn jede Bauerhoehe dieses Spiels ist ein Vielfaches von zwoelf.
    //    Die ganze Geometrie haengt an dieser Zahl: Sohle y336, Bank und
    //    Tuerbeet y312, Startterrasse y264, Mauerkrone y240.
    // 2. DIE BRUECKE IST EIN DACH, UND DAS KOSTET FIGUREN. Ein Laeufer ist
    //    viermal schneller als ein Bauer (Gesetz 5 aus Welt 1): Er klettert
    //    die entstehende Rampe hinauf und faellt am unfertigen Ende wieder
    //    herunter. Unter der Rampe ist der Boden dann gesperrt — in den
    //    ersten dreissig Bildpunkten hinter dem Ansatz liegen die Steine
    //    weniger als dreizehn ueber der Sohle, und ein Koerper (12 hoch)
    //    passt nicht mehr darunter durch. Gemessen ueber alle Raten von 20
    //    bis 40 und ueber jede Position des Ansatzfensters stranden dafuer
    //    IMMER GENAU ZWEI Figuren am Mauerfuss — nie mehr, nie weniger, und
    //    keine stirbt. Der erste Wurf stand auf total 12 / needed 9 und kam
    //    damit auf Marge 0; das war kein Levelfehler, sondern eine
    //    ungezaehlte Bruecke. Jetzt: total 14, zwoelf kommen an, Marge 3.
    // 3. WO DIE ZWEI STRANDEN, IST DER KOEDER. Sie pendeln zwischen
    //    Rampenunterseite und Bankfuss — und sobald jemand den unteren
    //    Stollen geschlagen hat, stehen sie darin, sichtbar vor der
    //    Findlingsflanke unter der Tuer. Das Bild, das der Entwurf
    //    beschreibt („der Pulk wartet sichtbar, bis die Kette steht"),
    //    entsteht also von selbst aus dem Fehler, den der Spieler ohnehin
    //    macht. Der Koeder kostet einen Rammer und kein Leben.
    // 4. DAS ANSATZFENSTER IST SECHZEHN BILDPUNKTE BREIT — UND ES STEHT IM
    //    BODEN. Gemessen tragen x419 bis x434; westlich davon erreicht die
    //    fertige Rampe die Bank nicht mehr und der Bauer faellt am eigenen
    //    Ende herunter, oestlich davon bricht ihn der Bankfuss zu tief ab
    //    (Reststufe ueber MAX_STEP 5). Beides verliert das Level ohne einen
    //    einzigen Toten. Der Findlingsstreifen in der Sohle liegt auf genau
    //    diesen sechzehn Bildpunkten. Er ist buendig eingelassen (y336 bis
    //    y341) und stoert deshalb nichts: Der Rammer raeumt nur bis y335
    //    hinunter, der Bauer legt seinen ersten Stein auf y335.
    // 5. NACHGESETZT WIRD ERST BEI DREI RESTSTUFEN. Gemessen tragen
    //    Reststufen 0 bis 3; ab 4 ist die Rampe zwar hoch genug, aber vier
    //    Bildpunkte zu KURZ — der Laeufer faellt am Rampenende in die Sohle
    //    statt auf die Bank. Wer zu frueh nachsetzt, verschenkt Spannweite,
    //    nicht Hoehe. Die Grenze ist dieselbe Zahl wie BUILD_WARN_AT; die
    //    Konstante steht in constants.ts allerdings noch ungenutzt herum.
    // 6. EIN FEHLANSATZ KOSTET ZWEI BAUER UND DEN RUECKWEG. Gemessen: erste
    //    Kette bei x438 oder x440 (zu tief), zweite Kette im Fenster —
    //    fuenf Zuege, neun gerettet, letzte Rettung 78,4 s. Das ist genau
    //    die Quote, also traegt der zweite Anlauf noch. Darum liegen sechs
    //    Bauer fuer zwei gesetzte im Vorrat.
    // 7. NICHTSTUN VERLIERT UND TOETET NIEMANDEN: ueber die volle Uhr
    //    pendelt der Pulk zwischen Terrassenstirn und Bankfuss — 0 gerettet,
    //    0 tot. Dasselbe gilt fuer jeden Teilgriff (nur Koeder, nur ein
    //    Bauer, Kette ohne Rammer). Traegheit kostet nur Uhr: die Kette erst
    //    nach dreissig Sekunden gesetzt rettet noch elf, nach vierzig noch
    //    zehn. In diesem Level kann ueberhaupt niemand sterben — der tiefste
    //    Sturz misst 72 (Terrasse auf Sohle), die Grenze 78.
    hint: 'Zwei Stollen braucht diese Mauer. Der untere endet am Findling unter der Tür — der zweite muss vierundzwanzig höher ansetzen, und so hoch trägt genau eine Zweierkette Bauer.',
    theme: 'sonnenhang',
    width: 720,
    height: 540,
    seed: 61009,
    entrance: { x: 80, y: 216 },
    exit: { x: 640, y: 286, w: 32, h: 26 },
    total: 14,
    // Zwei Figuren zahlt die Bruecke (Befund 2), zwoelf kommen an.
    needed: 9,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (71,2 s). Gemessener
    // Uhrfaktor 1,40.
    timeLimitSec: 100,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ builder: 6, basher: 4, blocker: 2 }),
    par: 3,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Die Sohle, und rough 0 ist hier in doppelter Hinsicht Pflicht: Auf
      // ihr wird gerammt (ein Rammer verliert auf rauem Grund nach jedem
      // Zwei-Punkt-Versatz den Boden) UND gebaut — auf einem Huckel legte
      // die Kette ihren ersten Stein eine Zeile daneben, und das
      // Ansatzfenster waere kein Fenster mehr.
      { t: 'ground', x: 0, w: 720, y: 336, h: 204, mat: MAT.EARTH, rough: 0 },
      // Die Startterrasse, 72 ueber der Sohle: faellt frei (72 < 78) und
      // sperrt den Rueckweg. Ihre Stirn bei x200 ist zugleich die Westwand
      // des Pulkraums — westlich davon kann niemand mehr hin, oestlich
      // liegt alles, was das Level ausmacht.
      { t: 'rect', x: 0, y: 264, w: 200, h: 72, mat: MAT.EARTH },
      // Die Mauerbank: vierundzwanzig hoch, achtundvierzig breit, Krone auf
      // Tuerbeethoehe. Sie ist die Landung der Kette und zugleich der
      // Ostrand des Pulkraums — vierundzwanzig wendet jeden (MAX_STEP 5),
      // und niemand faellt dabei. Von ihrer Krone aus, und nur von dort,
      // trifft ein Rammstollen das Tuerbeet.
      { t: 'rect', x: 472, y: 312, w: 48, h: 24, mat: MAT.EARTH },
      // Die Trockenmauer: 44 dick, Krone y240, also 96 ueber der Sohle. Sie
      // wird zweimal durchbrochen — unten bei y323..y335 (der Koeder), oben
      // bei y299..y311 (der Weg). Zwischen beiden Stollen bleiben elf
      // Bildpunkte Mauer stehen; das ist im Profil das Bild, das dem Level
      // seinen Namen gibt.
      { t: 'rect', x: 520, y: 240, w: 44, h: 96, mat: MAT.EARTH },
      { t: 'rect', x: 564, y: 312, w: 156, h: 228, mat: MAT.EARTH },
      // MALREIHENFOLGE: Findling zuletzt, sonst schneidet der Erdkoerper des
      // Tuerbeets die Flanke wieder auf. Im Terrainabzug geprueft — x564
      // traegt Stahl von y312 bis y347, x572 nur noch die Kappe.
      //
      // Die Findlingssohle des Tuerbeets: hier beisst kein Werkzeug durch,
      // und darauf steht die Tuer.
      { t: 'rect', x: 564, y: 312, w: 156, h: 6, mat: MAT.STEEL },
      // Die Findlingsflanke, und sie ist der ganze Koeder: Der untere
      // Rammstollen laeuft 84 Bildpunkte durch Bank und Mauer und endet
      // genau hier an ihr. Man sieht die Tuer, man steht vierundzwanzig
      // darunter, und kein Rammer der Welt holt das auf.
      { t: 'rect', x: 564, y: 312, w: 8, h: 36, mat: MAT.STEEL },
      // Die Findlingsschwelle: das gemessene Ansatzfenster der Kette, x419
      // bis x434, buendig in die Sohle eingelassen. Sie zeigt an und spielt
      // nicht mit — wie das Hoehenband, das diese Welt am Ende schenkt.
      { t: 'rect', x: 419, y: 336, w: 16, h: 6, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w6-10',
    name: 'Der Wächter im Schacht',
    chapter: 'Hang',
    // Das eine Level der Welt, das eine Code-Wahrheit zeigt statt sie zu
    // benutzen: `stepFalling` setzt beim Aufkommen `w.isBlocker ? BLOCKING :
    // WALKING`. Ein Waechter, dem man den Boden wegnimmt, faellt — und blockt
    // unten weiter. Er ist damit das einzige Werkzeug des Spiels, das man
    // EINE ETAGE TIEFER TRAGEN kann, und dieses Level ist der Beweis: EIN
    // Waechter bedient hier zwei Stockwerke.
    //
    // ## Was die Messung gegen den Entwurf entschieden hat
    //
    // 1. DER ENTWURF WAR IM OFFENEN GELAENDE UNSPIELBAR — und zwar wegen
    //    EINES Bildpunkts. Das Konzept sagt: Waechter auf x400, Graeber auf
    //    x404, das 9-px-Fenster (DIG_HALF_W 4) nimmt ihm den Boden. Im Code
    //    steht dagegen BLOCK_RADIUS 5: `blockedBy` wendet einen Laeufer schon
    //    bei |dx| <= 5, und zwar BEVOR er sich bewegt. Wer auf einen Waechter
    //    zulaeuft, kommt also nie naeher als fuenf heran — sein Grabfenster
    //    reicht aber nur vier weit und laesst genau die Spalte des Waechters
    //    stehen. Ein Graeber kann einem stehenden Waechter den Boden NUR dann
    //    nehmen, wenn er beim Antippen schon in dessen Bannmeile stand. Erste
    //    gebaute Fassung (flache Mulde aus fuenf Spalten, x396 bis x400):
    //    Waechter auf x397 bis x400 rettete 13 von 14, Waechter auf x396 —
    //    der Einstiegsspalte — verlor ALLE VIERZEHN. Vier Fuenftel Toleranz
    //    mit einem Fuenftel Totalverlust ist kein Fenster, sondern eine
    //    Falle. Verworfen.
    // 2. DIE ANTWORT IST EINE EINBAHN-MULDE, KEIN ZIELFENSTER. Der Brunnen
    //    hat genau zwei Standplaetze: die Stufe x399 (zwoelf unter der
    //    Terrasse) und den Sumpf x400 (weitere sechs tiefer). Sechs
    //    Bildpunkte liegen ueber MAX_STEP 5 — hinunter faellt jeder, hinauf
    //    keiner. Vor dem ersten Griff sammelt sich deshalb der ganze Pulk im
    //    Sumpf: gemessen ueber vierzig Sekunden Leerlauf steht 2154 Ticks
    //    lang jemand auf x400 und nur 42 Ticks lang jemand auf x399. Wer
    //    „die Figur im Brunnen" antippt, trifft zu achtundneunzig Prozent den
    //    Sumpf. Das Zielen macht die Geometrie, nicht der Daumen.
    // 3. UND DER WAECHTER BAUT SICH SEINEN GRAEBER SELBST. Sobald er im Sumpf
    //    steht, wendet er jeden Nachlaeufer schon auf der Stufe darueber
    //    (|dy| = 6 < WUSEL_H 12, also greift `blockedBy` ueber die Stufe
    //    hinweg). Die Stufe wird damit zum Dauerstandplatz — der zweite Griff
    //    hat weder Zeitdruck noch Zielaufgabe, und sein Fenster x395..x403
    //    deckt die Sumpfsohle (Reihe 318) sicher ab. Gemessen: der Waechter
    //    darf zu JEDEM Zeitpunkt gesetzt werden; bis Tick 440 (7,3 s) retten
    //    alle dreizehn, bis Tick 1070 (17,8 s) haelt die Quote. Danach
    //    verliert nur noch die Uhr, niemand stirbt.
    // 4. DER WAECHTER FAELLT 30, NICHT 48. Er steht achtzehn Bildpunkte unter
    //    der Terrassenkante, der Pulk faellt spaeter die vollen 48 durch
    //    denselben Schacht. Beide Zahlen sind gemessen (317 -> 347 und
    //    299 -> 347); die 48 des Entwurfs gelten fuer die Terrassen, nicht
    //    fuer den Mann im Brunnen.
    // 5. DAS SCHACHTDACH SCHIEBT DEN PULK NACH WESTEN. Wer mit dem Waechter
    //    im Schacht absinkt, kann nur nach Westen ausweichen: oestlich und
    //    westlich der Grabreihe steht ueber ihr noch Terrassenkoerper, und
    //    `bodyFits` verlangt zwoelf freie Reihen — allein die Brunnenspalte
    //    ist oben offen. In keiner Probe landete eine Figur oestlich des
    //    Waechters, auch nicht beim spaeten Tipp mit elf Mann im Sumpf.
    // 6. OHNE WAECHTER STIRBT NIEMAND — ES SIND NUR ALLE WEG. Rot-Probe „nur
    //    Graeber": vierzehn von vierzehn stranden in der Ostwanne, null Tote,
    //    verloren. Und der Fehlgriff auf die Stufe (Waechter auf x399 statt
    //    x400) ist mit dem zweiten Waechter unten zu heilen: gemessen 12 von
    //    14, kein Toter, fuenf Zuege, 45,5 s. Ein Fehlansatz kostet hier ein
    //    Werkzeug und den Rueckweg, nie ein Leben.
    // 7. Abweichung vom Entwurfstext, bewusst: Dort haelt der Waechter den
    //    Pulk „vor der Ostkante" der Terrasse. Gemessen haelt ihn der
    //    Brunnen, und der Waechter haelt ihn vor dem Sumpf — dieselbe Geste
    //    eine Groessenordnung kleiner. Eine offene Ostkante haette Gesetz 4
    //    gebrochen: Untaetigkeit haette den Pulk gekostet, bevor der erste
    //    Griff sitzt.
    hint: 'Der Brunnen fasst zwei: Setze den Wächter ganz unten hinein und grabe ihm dann von der Stufe darüber den Boden weg — er fällt mit und hält unten weiter Wache.',
    theme: 'sonnenhang',
    width: 720,
    height: 540,
    seed: 61010,
    entrance: { x: 356, y: 250 },
    exit: { x: 150, y: 370, w: 32, h: 26 },
    total: 14,
    // Gemessen 13 (der Waechter selbst bleibt unten stehen und kommt nie an —
    // das ist der Preis der Mechanik und im Bild sichtbar). Marge 3.
    needed: 10,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (40,1 s). Gemessener
    // Uhrfaktor 1,40.
    timeLimitSec: 56,
    releaseRate: 50,
    minReleaseRate: 20,
    // Vier Zuege, neun Werkzeuge. Der zweite Waechter ist kein Schmuck: Er
    // heilt den einen Fehlgriff, den dieses Level kennt (Waechter auf der
    // Stufe statt im Sumpf), indem er unten uebernimmt — gemessen 12 von 14
    // ohne Toten.
    skills: sk({ digger: 4, blocker: 2, basher: 3 }),
    par: 4,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // --- T1, obere Terrasse: Oberkante y300, Koerper 24 dick ----------
      { t: 'rect', x: 0, y: 300, w: 470, h: 24, mat: MAT.EARTH },
      // Findlingsdeckel auf der ganzen Terrasse: Gegraben wird nur im
      // Brunnen. Wer daneben tippt, hoert Stein und behaelt seine Figur
      // (gemessen: ein Graeber weg, kein Toter).
      { t: 'rect', x: 0, y: 300, w: 399, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 401, y: 300, w: 69, h: 6, mat: MAT.STEEL },
      // Der Findlingskranz — die sichtbare Marke genau ueber der Grabstelle,
      // zwoelf Bildpunkte tief in den Terrassenkoerper hinein. Er malt
      // ZUERST, die beiden Aussparungen darunter zuletzt; im Terrainabzug
      // geprueft, nicht im Kopf. Nebenwirkung, gemessen: Ein versehentlich im
      // Brunnen gesetzter Rammer beisst nach beiden Seiten auf Stein und
      // prallt ab, statt den Brunnen aufzureissen.
      { t: 'rect', x: 396, y: 300, w: 3, h: 12, mat: MAT.STEEL },
      { t: 'rect', x: 401, y: 300, w: 3, h: 12, mat: MAT.STEEL },
      // Der Brunnen selbst, und er ist das ganze Level: Stufe x399 zwoelf
      // tief, Sumpf x400 achtzehn tief. Die sechs Bildpunkte zwischen beiden
      // liegen ueber MAX_STEP 5 — hinunter geht jeder, hinauf keiner. Genau
      // deshalb steht der Waechter immer im Sumpf und der Graeber immer auf
      // der Stufe, ohne dass jemand zielen muss.
      { t: 'rect', x: 399, y: 300, w: 1, h: 12, mat: MAT.EMPTY },
      { t: 'rect', x: 400, y: 300, w: 1, h: 18, mat: MAT.EMPTY },
      // --- T2, mittlere Terrasse: Oberkante y348, E48 unter T1 ----------
      // Findlingsdeckel mit einem Erdfenster von x280 bis x359: Der zweite
      // Schacht muss zwischen x284 und x355 sitzen (9-px-Fenster), gemessen
      // traegt jede Stelle von x282 bis x350 — zweiundsiebzig Bildpunkte, und
      // der Pulk pendelt vor dem Waechter beliebig oft daran vorbei.
      { t: 'rect', x: 0, y: 348, w: 436, h: 24, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 348, w: 280, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 360, y: 348, w: 76, h: 6, mat: MAT.STEEL },
      // --- T3, die Tuersohle: rough 0, weil auf ihr gerammt wird --------
      { t: 'ground', x: 0, w: 424, y: 396, h: 144, mat: MAT.EARTH, rough: 0 },
      // Die Erdmauer vor der Tuerkammer. Vierundzwanzig hoch, der Rammer
      // raeumt dreizehn — der Stollen steht unter einem Sturz aus Erde.
      { t: 'rect', x: 200, y: 372, w: 44, h: 24, mat: MAT.EARTH },
      // --- Die Ostwanne: die sichtbare Drohung ---------------------------
      // Wer ohne Waechter graebt, schickt den Pulk hierher: 48 hinab, eine
      // Findlingsschwelle davor, kein Weg zurueck. Gemessen 14 von 14 drin,
      // null Tote. Die Strafe ist der Rueckweg, nicht das Leben.
      { t: 'ground', x: 424, w: 296, y: 396, h: 144, mat: MAT.EARTH, rough: 0 },
      { t: 'rect', x: 424, y: 384, w: 8, h: 12, mat: MAT.STEEL },
      // Findlingspflaster fuenf Bildpunkte unter der Tuersohle. Fuenf, nicht
      // mehr: Ein Graeber, der hier ansetzt, kratzt eine Rinne und steht auf
      // Stein — und die Rinne ist flach genug, dass jeder wieder heraussteigt
      // (MAX_STEP 5). Ohne das Pflaster graebt derselbe Fehltipp sich durch
      // hundertvierundvierzig Bildpunkte Erde aus der Welt heraus und stirbt.
      { t: 'rect', x: 0, y: 401, w: 720, h: 6, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w6-11',
    name: 'Hangbruch',
    chapter: 'Hang',
    // Das zweite Mechaniklevel des Kapitels, und seine These steht in einer
    // Zeile Code: `clearPixel` prueft `isDiggable`, also raeumt ein Krater
    // Erde und laesst Findling stehen. Die Mittelterrasse ist deshalb eine
    // durchgehende Findlingsplatte (y300, sechs dick), und in ihr steckt eine
    // vier Bildpunkte schmale Erdnaht bei x340. Der Graeber sieht neun
    // Bildpunkte breit (DIG_HALF_W 4) und findet darin IMMER Stein — allein
    // die Sprengung raeumt Bildpunkt fuer Bildpunkt und macht aus der Naht
    // ein Loch. Darunter liegt die Erdtasche, von deren Sohle eine
    // Baggerschraege ostwaerts in die Tuerhalle traegt.
    //
    // ## Was die Messung gegen den Entwurf entschieden hat
    //
    // 1. DER KRATER MACHT DIE NAHT NICHT BREITER. Das Konzept versprach eine
    //    Oeffnung von rund 24 Bildpunkten. Gemessen sind es 24 Bildpunkte
    //    FLAECHE — vier breit, sechs tief — und kein Bildpunkt mehr: Der
    //    Radius 14 greift zwar bis x328, aber links und rechts der Naht steht
    //    Findling, und den raeumt kein Sprengsatz. Das Loch ist exakt so
    //    breit wie die Naht. Und das reicht, weil die Simulation eine Figur
    //    als EINE Spalte kollidieren laesst: Gemessen faellt der ganze Pulk
    //    durch vier Bildpunkte, keiner laeuft darueber hinweg.
    // 2. DESHALB IST DAS ZIELFENSTER GROESSER ALS DIE NAHT. Die volle Naht
    //    raeumt ein Zuender zwischen x336 und x347 (zwoelf Bildpunkte) — aber
    //    schon EINE durchgehende Spalte laesst alle hindurch, und die gibt es
    //    von x333 bis x350. Gemessenes Fenster der Musterloesung: achtzehn
    //    Bildpunkte, knapp eine Sekunde Lauf. Wer knapp danebenliegt, bekommt
    //    statt des Lochs eine Treppe in die Naht; kein Absatz darin misst
    //    mehr als fuenf, also steigt jede Figur wieder heraus (MAX_STEP 5).
    //    Ein Fehlschuss kostet den Zuender, nie den Pulk.
    // 3. DER RIEGEL IST DIE ZIELHILFE, NICHT DIE SPERRE. Ein Waechter steht
    //    still, und ein Sprengmeister zuendet dort, wo er steht — die
    //    Zuendung am Waechter braucht darum keinen Vorhalt. Der Vorhaltschuss
    //    geht trotzdem: von der Westterrasse aus, gemessenes Fenster x250 bis
    //    x259 (zehn Bildpunkte), zwei Zuege statt drei und 55,0 s statt
    //    60,3 s. Par 3 bleibt stehen, weil der Riegelweg der Weg des
    //    Hinweises ist; wer den Vorhalt trifft, unterbietet das Par.
    // 4. DREIMAL ACHTUNDVIERZIG. Westterrasse zur Platte 48, Platte in die
    //    Tasche 48, Taschensohle in die Halle 48. Der erste Sturz faellt von
    //    selbst, den zweiten oeffnet die Sprengung, den dritten legt die
    //    Schraege. Der erste Bau hatte hier 46 und 54 stehen — krumme Zahlen,
    //    die dem zweiten Weltgesetz widersprechen. Zwei Bildpunkte tiefer
    //    gelegte Taschensohle haben das geheilt, ohne einen anderen Wert
    //    anzufassen; im Terrainabzug nachgesehen, nicht im Kopf gerechnet.
    // 5. FINDLING IST DAS NETZ. Beide Terrassen, die Taschensohle bis x474
    //    und der Hallenboden sind gedeckelt. Gemessen: null von 292
    //    Plattenspalten haben ein findlingsfreies Graeberfenster (der Koeder
    //    verpufft ueberall und laesst das Terrain unveraendert), ein
    //    Fehlbagger westlich von x474 dreht am Stein ab und kostet ein
    //    Werkzeug plus Rueckweg, und ein Zuender, der irgendwo sonst hochgeht,
    //    raeumt null Bildpunkte — auf der Westterrasse zwoelf, alle unter dem
    //    Steindeckel und unsichtbar. Nur im Erdfenster der Tasche (x479 bis
    //    x535) beisst der Graeber wirklich: Er sinkt die 48 auf das
    //    Findlingspflaster, der Pulk faellt ihm nach und sitzt im
    //    Neun-Punkte-Schacht. Gemessen 0 Tote, 0 Gerettete — die Runde ist
    //    verloren, kein Leben. Diese Stelle war nicht wegzubauen: Der Bagger
    //    prueft elf Bildpunkte ueber seinen Fuessen mit (Welt-1-Gesetz 3), er
    //    braucht also einen rund dreissig Bildpunkte breiten steinfreien
    //    Korridor — und in den passt das neun Punkte breite Graeberfenster
    //    immer. Graeber und Schraege koennen im selben begehbaren Raum nicht
    //    beide unschaedlich sein; die Wahl fiel auf: verloren statt tot.
    // 6. MARGE 3 IST HIER PFLICHT UND AUSGEMESSEN. Jeder Zuender kostet sich
    //    selbst, die Musterloesung rettet 11 von 12. Wer zwei Zuender
    //    verbrennt und erst mit dem dritten trifft, rettet noch neun und
    //    gewinnt (gemessen, letzte Rettung 74,0 s). Darum drei Zuender UND
    //    drei Waechter im Vorrat: Mit nur zwei Waechtern hat der dritte
    //    Versuch keine Zielhilfe mehr, und genau daran ist die erste Fassung
    //    des Vorrats gemessen gescheitert.
    // 7. Traegheit toetet hier niemanden. Ohne eine einzige Vergabe pendelt
    //    der Pulk die volle Uhr auf der Platte: verloren, null Tote. Wer erst
    //    nach zwanzig Sekunden anfaengt, rettet noch elf; wer nach dreissig
    //    anfaengt, rettet genau die Quote. Der Gegner ist die Uhr.
    hint: 'Die Terrasse liegt unter einer geschlossenen Findlingsplatte — nur eine schmale Erdnaht steckt darin. Zu schmal für den Gräber: die räumt allein die Sprengung.',
    theme: 'sonnenhang',
    width: 720,
    height: 540,
    seed: 61011,
    entrance: { x: 180, y: 210 },
    exit: { x: 624, y: 370, w: 32, h: 26 },
    total: 12,
    // Quote = Messung minus 3, weil der Zuender sich selbst kostet.
    needed: 8,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (60,3 s). Gemessener
    // Uhrfaktor 1,41; der billigere Vorhaltweg liegt bei 1,55.
    timeLimitSec: 85,
    releaseRate: 55,
    minReleaseRate: 20,
    // Vier Knopfarten, alle laengst gelehrt. Der Graeber ist der im Hinweis
    // angekuendigte Koeder — er hat in diesem Level auf keiner begehbaren
    // Flaeche ausser dem Erdfenster der Tasche eine Wirkung.
    skills: sk({ bomber: 3, miner: 3, blocker: 3, digger: 2 }),
    par: 3,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Der Hangkoerper ab der Mittelterrasse abwaerts, am Stueck. Alles
      // Weitere ist entweder herausgeschnitten oder darauf gelegt.
      { t: 'rect', x: 0, y: 300, w: 720, h: 240, mat: MAT.EARTH },
      // Westterrasse und Ostschulter, je 48 ueber der Platte. Die Westkante
      // der Schulter ist die Wand, an der der Pulk auf der Platte wendet —
      // eine Lippe braucht es dafuer nicht, 48 wendet jeden (MAX_STEP 5).
      { t: 'rect', x: 0, y: 252, w: 260, h: 48, mat: MAT.EARTH },
      { t: 'rect', x: 560, y: 252, w: 160, h: 48, mat: MAT.EARTH },
      // Die Erdtasche unter der Platte: 42 hoch, damit ihre Sohle genau 48
      // unter der Platte liegt. Man sieht sie vom ersten Bild an — die Naht
      // im Stein und der Hohlraum darunter erklaeren zusammen die Aufgabe.
      { t: 'rect', x: 300, y: 306, w: 240, h: 42, mat: MAT.EMPTY },
      // Die Tuerhalle im Hangfuss, 44 hoch. Sie ist der Faenger der
      // Schraege: Jede Muendung zwischen y352 und y395 bricht in sie ein,
      // deshalb traegt ein Ansatzfenster von 65 Bildpunkten statt eines
      // Treffers auf den Punkt.
      { t: 'rect', x: 560, y: 352, w: 140, h: 44, mat: MAT.EMPTY },
      // Findling ZULETZT — ein spaeter Malbefehl macht sonst aus einer
      // Steinsohle wieder Erde. Deckel der Westterrasse und der Ostschulter:
      // Ohne sie sinkt ein Graeber dort 48 auf die Platte und der Pulk faellt
      // in einen Schacht, aus dem er nicht mehr herauskommt.
      { t: 'rect', x: 0, y: 252, w: 260, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 560, y: 252, w: 160, h: 6, mat: MAT.STEEL },
      // Die Findlingsplatte: durchgehend ueber die ganze Weltbreite und durch
      // beide Hangkoerper hindurch. Genau das macht den Graeber wirkungslos.
      { t: 'rect', x: 0, y: 300, w: 720, h: 6, mat: MAT.STEEL },
      // Die Taschensohle, gedeckelt bis x474. Oestlich davon liegt die Erde
      // offen — und nur dort greift die Schraege (gemessen x474 bis x538).
      // Die Kante ist die sichtbare Marke des dritten Zuges.
      { t: 'rect', x: 300, y: 348, w: 175, h: 8, mat: MAT.STEEL },
      // Das Findlingspflaster: Boden der Halle und Grund dafuer, dass in
      // diesem Level kein Graeber je in die Tiefe durchsackt.
      { t: 'rect', x: 0, y: 396, w: 720, h: 8, mat: MAT.STEEL },
      // Und ganz zuletzt die Erdnaht — ein Loch IM Findling, vier breit.
      // Breiter darf sie nicht sein: Ab neun faende der Graeber ein Fenster
      // ohne Stein, und das Level haette seine These verloren.
      { t: 'rect', x: 340, y: 300, w: 4, h: 6, mat: MAT.EARTH }
    ]
  },
  {
    id: 'w6-12',
    name: 'Das Storchennest',
    chapter: 'Hang',
    // Der Durchatmer des Kapitels und das Werbebild der Welt: ein
    // Findlingsschlot mit fuenf Grasboeden im reinen E48-Takt (y152 / y200 /
    // y248 / y296 / y344) ueber der Sohle y392, und die 12er-Lippe wechselt
    // auf jeder Etage die Kante — Ost, West, Ost, West, Ost. Der Pulk laeuft
    // deshalb Stockwerk fuer Stockwerk in die andere Richtung; ohne Zuweisung
    // pendelt er zwischen Lippe und Findlingsflanke hin und her, und die
    // Silhouette liest sich beim Spielen wie ein Uhrpendel (gemessene
    // Halbwelle 11,4 s, volles Hin und Her 22,8 s — auf jeder Etage gleich,
    // weil jedes Band dieselben 228 begehbaren Bildpunkte hat). Fuenf Rammer,
    // einer je Lippe, oeffnen den Turm von oben nach unten; gemessen faellt
    // alle 14,3 Sekunden eine (7,0 / 21,3 / 35,6 / 49,8 / 64,1 s).
    //
    // Die Aussage des Levels ist die TODESFREIHEIT, und sie ist gebaut, nicht
    // behauptet: Jeder Sturz misst genau 48 (Sturzgrenze 78), der Falltuerfall
    // 43, und der Turm hat keine andere Kante. Was der Spieler falsch machen
    // kann, kostet ein Werkzeug und den Rueckweg.
    //
    // ## Was die Messung gegen den Entwurf entschieden hat
    //
    // 1. TODESFREI, UND ZWAR BEWIESEN. Sechzehnhundert Laeufe mit wahllos
    //    verteilten Berufen — tausend davon zusaetzlich mit zufaelligen
    //    Reglerzuegen, zusammen ueber 13 000 Vergaben: null Tote, groesster
    //    gemessener Sturz 48. Zwei bis drei von tausend Laeufen gewinnen sogar
    //    blind; das ist kein Leck, sondern das Versprechen des Durchatmers.
    // 2. DIE FINDLINGSFLANKEN SIND DIE TODESFREIHEIT, NICHT DIE KULISSE.
    //    Gegenprobe mit denselben Flanken aus Erde: dieselben Zufallslaeufe
    //    ergeben 1476 Tote in 220 von 300 Laeufen, groesster Sturz 239 — ein
    //    fehlgeleiteter Rammer schlaegt den Schlot auf, und der Pulk faellt
    //    von der Etage bis auf die Sohle. Das Bittere daran: Die
    //    Musterloesung merkt den Unterschied NICHT (12 von 12, dieselbe
    //    Zeit auf den Tick). Ein Level, das nur an seiner Musterloesung
    //    geprueft wird, haette diesen Fehler mitgeliefert.
    // 3. EINE VORMERKUNG UEBERLEBT DEN STURZ, ABER NICHT DIE LANDUNG.
    //    `stepFalling` setzt beim Aufkommen nur den Zustand, `w.vormerk`
    //    bleibt stehen — ein vorbestellter Rammer koennte also mitfallen und
    //    die naechste Lippe von selbst oeffnen. Gemessen tut er das nie: Jede
    //    Landung liegt zwanzig Bildpunkte neben der Findlingsflanke, der
    //    Blick zeigt dorthin, und `wandInReichweite` loest an ihr aus. Fuenf
    //    Rammer auf einen Schlag auf der obersten Etage oeffnen gemessen
    //    genau EINE Lippe und sind danach alle fuenf weg. Der Turm laesst
    //    sich also nicht im Voraus loesen; jede Etage kostet ihren eigenen
    //    Griff, und deshalb ist par 5 kein Budget, sondern der bewiesene
    //    Mindestwert.
    // 4. DAS ANSATZFENSTER IST DAS GANZE STOCKWERK. 115 von 115 Proben je
    //    Etage im Zwei-Punkte-Raster (x232..459 bzw. x264..491): Jeder
    //    Rammer, der in Richtung seiner Lippe schaut, oeffnet sie — die
    //    Vormerkung traegt ihn hin. Gesucht ist nicht der Ort, sondern die
    //    RICHTUNG. Wer zur Flanke tippt, hoert den Stein und sieht die Figur
    //    umdrehen.
    // 5. NEUN RAMMER HEISSEN GEMESSEN VIER FREIE FEHLGRIFFE. Vier Fehlgriffe
    //    plus fuenf richtige sind neun Vergaben und gewinnen (96,3 s); ein
    //    Fehlgriff je Etage waeren zehn und verliert — ohne einen Toten. Auch
    //    der Panikwurf geht noch auf: fuenf Rammer sofort oben, danach sauber
    //    weiter ab Etage 2, macht neun Vergaben und 91,3 s.
    // 6. DER SCHIRM IST HIER KEINE RETTUNG, SONDERN EINE BREMSE. Kein Sturz
    //    erreicht die Sturzgrenze, ein Schirm kann also nichts retten — er
    //    kostet Zeit (FLOAT_INTERVAL 3 gegen FALL_INTERVAL 1). Alle sechs
    //    vergeben: 97,1 s statt 90,7 s, und gewonnen wird trotzdem. Genau
    //    dafuer liegt er im Vorrat: als der eine Knopf, mit dem man nichts
    //    kaputtmachen kann.
    // 7. DER TURM IST GEMESSEN SCHMAL. Der Entwurf liess die Boeden bis an
    //    die Weltkanten laufen — die Weltkante wendet gratis und ist so hart
    //    wie Findling. Gemessen dauert diese Fassung 240,4 s statt 90,7 s:
    //    Jedes Stockwerk waere 600 Bildpunkte breit, ein Pendelschlag eine
    //    ganze Minute, und zwei Drittel der Uhr waeren Zuschauen. Zwei
    //    Findlingsflanken bei x208 und x492 kuerzen das Band auf 228
    //    begehbare Bildpunkte und geben dem Fehlgriff seinen Preis. Dass der
    //    Schlot dabei frei in der Wiese steht, ist die Folge der Messung,
    //    nicht der Entwurf.
    // 8. Die Uhr haengt nicht am Regler und kaum an der Geduld. Zwischen
    //    Rate 20 (der Untergrenze) und Rate 90 schwankt die letzte Rettung um
    //    5,8 s (96,5 bis 90,7) — der Pulk staut sich ohnehin an jeder Lippe.
    //    Wer erst nach vierzig Sekunden anfaengt, rettet noch alle zwoelf
    //    (124,8 s); wer nach fuenfzig anfaengt, rettet zehn und gewinnt. Wer
    //    gar nichts tut, verliert ohne eine einzige Figur: Der Pulk pendelt
    //    die volle Uhr auf Etage 1.
    //
    // Malreihenfolge beachtet: Die beiden Findlingsflanken stehen am ENDE
    // der Liste — sie liegen ueber den Etagenbaendern und dem Sohlenband, und
    // ein spaeterer Malbefehl haette aus ihrem Fuss wieder Erde gemacht. Die
    // Turmsohle traegt rough 0, weil auf ihr gerammt wird; nur die Wiese
    // links und rechts des Schlots ist rau.
    hint: 'Fünf Grasböden, fünf Lippen — und jede sitzt an der anderen Kante. Ein Rammer je Lippe, und kein Fall misst mehr als achtundvierzig: Hier kann niemand sterben.',
    theme: 'sonnenhang',
    width: 720,
    height: 540,
    seed: 61012,
    entrance: { x: 360, y: 108 },
    exit: { x: 420, y: 366, w: 32, h: 26 },
    total: 12,
    // Musterloesung rettet alle zwoelf — sterben kann hier niemand (Befund 1).
    // Quote = Messung minus 3.
    needed: 9,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (90,7 s). Gemessener
    // Uhrfaktor 1,40; der langsamste gepruefte Gewinnweg (vier Fehlgriffe,
    // 96,3 s) liegt bei 1,32.
    timeLimitSec: 127,
    releaseRate: 60,
    minReleaseRate: 20,
    // Zwei Knopfarten, beide laengst gelehrt. Neun Rammer fuer fuenf Lippen
    // sind gemessen genau vier freie Fehlgriffe (Befund 5); die Schirme sind
    // der Fehltipp-Puffer, der nichts kaputtmachen kann (Befund 6).
    skills: sk({ basher: 9, floater: 6 }),
    par: 5,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Die fuenf Grasboeden im E48-Takt. Die ungeraden (y152/y248/y344)
      // haengen an der Westflanke und tragen ihre Lippe im Osten, die
      // geraden (y200/y296) an der Ostflanke mit der Lippe im Westen. Aus
      // dem Versatz von zwanzig Bildpunkten faellt der Pulk genau neben die
      // Flanke der naechsten Etage — dorthin, wo er sofort wendet und das
      // ganze Band zurueckgehen muss. Das ist der Pendelschlag.
      { t: 'rect', x: 232, y: 152, w: 240, h: 16, mat: MAT.EARTH },
      { t: 'rect', x: 460, y: 140, w: 12, h: 12, mat: MAT.EARTH },
      { t: 'rect', x: 252, y: 200, w: 240, h: 16, mat: MAT.EARTH },
      { t: 'rect', x: 252, y: 188, w: 12, h: 12, mat: MAT.EARTH },
      { t: 'rect', x: 232, y: 248, w: 240, h: 16, mat: MAT.EARTH },
      { t: 'rect', x: 460, y: 236, w: 12, h: 12, mat: MAT.EARTH },
      { t: 'rect', x: 252, y: 296, w: 240, h: 16, mat: MAT.EARTH },
      { t: 'rect', x: 252, y: 284, w: 12, h: 12, mat: MAT.EARTH },
      { t: 'rect', x: 232, y: 344, w: 240, h: 16, mat: MAT.EARTH },
      { t: 'rect', x: 460, y: 332, w: 12, h: 12, mat: MAT.EARTH },
      // Die Wiese. Unter dem Schlot rough 0 — dort wird gerammt, und ein
      // Zwei-Punkte-Huckel nimmt dem Rammer nach jedem Versatz den Boden.
      { t: 'ground', x: 0, w: 208, y: 392, h: 148, mat: MAT.EARTH, rough: 2 },
      { t: 'ground', x: 208, w: 308, y: 392, h: 148, mat: MAT.EARTH, rough: 0 },
      { t: 'ground', x: 516, w: 204, y: 392, h: 148, mat: MAT.EARTH, rough: 2 },
      // Findling ZULETZT. Die beiden Flanken sind das Netz dieses Levels:
      // Sie schliessen den Schlot von oben bis auf die Wiese, sie wenden
      // jeden Laeufer, und an ihnen verpufft jeder Rammer, der in die
      // falsche Richtung tippt — sichtbar, hoerbar, ohne Verlust. Aus Erde
      // gebaut kosten sie gemessen 1476 Leben (Befund 2).
      { t: 'rect', x: 208, y: 100, w: 24, h: 292, mat: MAT.STEEL },
      { t: 'rect', x: 492, y: 100, w: 24, h: 292, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w6-13',
    name: 'Vier Etagen',
    chapter: 'Kamm',
    // Der Auftakt des letzten Kapitels, und die These der ganzen Welt in
    // einem Bild: vier Ebenen im Wechsel 48 / 96 / 48 (Oberkanten y180 /
    // y228 / y324 / y372, auf den Bildpunkt die Zahlen des Konzepts). Jeder
    // Abstand nennt sein Werkzeug selbst — die beiden Achtundvierzig nimmt
    // der Graeber durch den Boden, die Sechsundneunzig dazwischen nimmt
    // allein die Baggerschraege, und auf der Tuersohle oeffnet ein Rammer
    // die vierundvierzig dicke Erdmauer. Vier Griffe, streng von oben nach
    // unten.
    //
    // Dieses Level traegt ausserdem die Lehre der gestrichenen „Wasserrinne"
    // (siehe den Kopf dieser Datei): Es prueft die REIHENFOLGE, nicht die
    // Hand. Darum liegt von jedem Werkzeug ein Vielfaches im Vorrat, darum
    // ist jedes Ansatzfenster mindestens dreiundsechzig Bildpunkte breit —
    // und darum kostet jeder Fehlgriff Zeit oder den Weg, aber gemessen
    // niemals eine Figur.
    //
    // ## Was die Messung gegen den Entwurf entschieden hat
    //
    // 1. DIE UNTEREN ZWEI ETAGEN SIND GALERIEN, KEINE WIESEN. Der Entwurf
    //    sagt „vier Terrassen". Gemessen geht das nicht: Eine offene
    //    Terrassenkante ueber achtundvierzig ist ein GESCHENKTER Abstieg —
    //    der Pulk laeuft sie ohne eine einzige Zuweisung hinunter, und der
    //    Graeber, dem die Achtundvierzig gehoeren soll, waere ueberfluessig.
    //    Wo der Boden das Tor ist, muss die Etage links und rechts
    //    geschlossen sein. Also: T1 und T2 sind offene Baender (West der
    //    Weltrand, Ost die Hangstirn bei x340, deren Krone y156 zwoelf ueber
    //    T1 steht und jeden wendet), T3 und T4 sind Galerien IM Hang, vom
    //    ersten Bild an sichtbar aufgeschnitten. Die vier Hoehen des
    //    Konzepts stehen unveraendert.
    // 2. DER ABSTAND NENNT SEIN WERKZEUG — ABER NUR IN EINER RICHTUNG.
    //    Gemessen nimmt die Schraege auch die Achtundvierzig: Durch die
    //    sechzehn dicken Platten von T1 und T3 schneidet sie eine begehbare
    //    Rampe und faellt unten heraus (14 von 14, 76,0 s — dieselbe Zeit
    //    wie der Schacht). Umgekehrt nimmt der Graeber die Sechsundneunzig
    //    NIE: im Erdfenster von T2 sinkt er zweiundsechzig auf die
    //    Findlingsbank (y288), der Pulk sackt ihm Bildpunkt fuer Bildpunkt
    //    nach und steht am Ende vollzaehlig im Neun-Punkte-Schacht.
    //    Gemessen 0 gerettet, 0 tot, tiefster Einzelfall 60. Das ist der
    //    Satz des Levels, und er ist unsymmetrisch: Die Schraege kann alles,
    //    der Graeber nur die Achtundvierzig — und sie kostet dafuer das
    //    Werkzeug, das die Sechsundneunzig braucht.
    // 3. DIE SCHRAEGE LAEUFT 151, NICHT 192. Gemessen von x188/y227 bis
    //    x339/y303: hunderteinundfuenfzig Bildpunkte Lauf, sechsundsiebzig
    //    Abstieg — die letzten zwanzig sind ein FALL in die Galerie. Die
    //    192 der reinen 2:1-Rechnung haetten buendig gemuendet, und eine
    //    buendige Muendung ist eine Rampe in beide Richtungen (Paket 1,
    //    Befund 1). Die zwanzig Bildpunkte Absatz sind es, die den Pulk
    //    unten wenden.
    // 4. DAS ANSATZFENSTER IST DREIUNDSECHZIG BREIT — UND SEINE OSTKANTE IST
    //    DER ANLAUF. Gemessen tragen x179 bis x241. Die Westkante ist die
    //    Kante des Findlingsdeckels bei x180 (der Bagger prueft vier Spalten
    //    VOR sich, er darf also einen Bildpunkt westlich der Erde stehen).
    //    Die Ostkante liegt neununddreissig Bildpunkte vor dem Deckel, der
    //    bei x280 wieder anfaengt: Seine Bahn muss zwoelf unter der
    //    Deckelunterkante (y233) liegen, bevor sein Blick die Kante
    //    erreicht — 2 x 19 + 1 = 39. Das ist die Anlaufregel aus Paket 2,
    //    zum zweiten Mal gemessen und auf den Bildpunkt bestaetigt.
    // 5. DER SCHACHT GEHOERT ZWISCHEN FALLTUER UND ANSATZ. Die ganze
    //    Grasschulter traegt ihn (gemessen x4 bis x338; x0 bis x3 fallen aus,
    //    weil der Weltrand wie Stahl zaehlt und das Neun-Punkte-Fenster ihn
    //    mitprueft). Aber nur zwischen x38 und x194 kommen alle vierzehn an
    //    (76 bis 82 s): Dort landet der Pulk WESTLICH des Ansatzes und laeuft
    //    ostwaerts hinein. Sonst landet er oestlich davon, und bis wieder
    //    jemand ostwaerts am Fenster vorbeikommt, vergeht eine volle
    //    T2-Runde — gemessen 13 von 14 und letzte Rettung 105,8 s. Niemand
    //    stirbt, niemand strandet: Die falsche Seite kostet eine Figur und
    //    dreissig Sekunden. Das ist die Reihenfolge-Lehre als Zahl.
    // 6. DER RIEGEL HEILT GENAU DIESEN FEHLER. Ein Waechter WESTLICH des
    //    Ansatzes dreht den westwaerts laufenden Pulk frueher um: gemessen
    //    bei x150 letzte Rettung 85,2 s statt 105,8 s — zwanzig Sekunden
    //    zurueck fuer eine Vergabe. Das ist die einzige gemessene Wirkung
    //    des Waechters in diesem Level; er aendert weder Weg noch Ausgang,
    //    nur die Uhr (dieselbe Handelsart wie in w6-06).
    // 7. AUF DER TUERSOHLE BEISST NUR DER RAMMER. Das Findlingspflaster
    //    liegt fuenf Bildpunkte unter ihr (die Zahl aus w6-10): Ein Graeber
    //    kratzt eine Rinne und steht auf Stein, ein Bagger schneidet eine
    //    fuenf tiefe Mulde und dreht ab — beides gemessen, beides verloren,
    //    beides ohne Toten, und aus beiden Mulden steigt jeder wieder heraus
    //    (MAX_STEP 5). Das Rammerfenster ist dafuer die GANZE Sohle:
    //    gemessen x344 bis x555, zweihundertzwoelf Bildpunkte, weil ein
    //    Rammer ohne Wand in BASH_LOOK 5 zur Vormerkung wird und von selbst
    //    an der Mauer anfaengt. Die Mauer ist zweiunddreissig hoch, der
    //    Stollen raeumt dreizehn — neunzehn Bildpunkte Erde bleiben als
    //    Sturz darueber stehen und sind im Profil sichtbar.
    // 8. FINDLING IST DAS NETZ, UND ES HAT ZWEI ZUSAETZLICHE MASCHEN
    //    GEBRAUCHT. Der erste Bau hatte weder das Band in der Hangmasse
    //    (y234) noch das Band auf Galeriehoehe (y324): dreihundert
    //    Zufallslaeufe ergaben 63 Tote, tiefster Fall 106. Der Weg dorthin
    //    war immer derselbe und immer zweizuegig — ein Rammer schlaegt einen
    //    waagerechten Stollen (auf T1 bei y167..179, auf T2 bei y215..227,
    //    in der Galerie westwaerts bei y311..323), und ein Graeber IN diesem
    //    Stollen nimmt ihm den Boden; von der Stollensohle in die Galerie
    //    sind es sechsundneunzig. Mit beiden Baendern: achthundert
    //    Zufallslaeufe, 0 Tote, 0 Zufallssiege, tiefster Fall 67.
    // 9. DIE FALLTUER HAENGT AUF y160 UND NICHT AUF y150, UND ZWAR WEGEN
    //    EINES BILDPUNKTS. Der tiefste Sturz des Levels ist die Falltuer
    //    selbst: Wer den Schacht genau unter sie legt, laesst jede Figur von
    //    der Luke bis auf den Findlingsdeckel von T2 durchfallen. Aus y150
    //    waren das gemessene 77 bei einer Grenze von 78. Aus y160 sind es
    //    67 — elf Bildpunkte Luft, und das Bild aendert sich nicht.
    // 10. NICHTSTUN VERLIERT UND TOETET NIEMANDEN, TRAEGHEIT KOSTET NUR UHR.
    //    Leerer Plan ueber die volle Uhr UND ueber 300 s: 0 gerettet, 0 tot —
    //    der Pulk pendelt auf der Grasschulter. Wer erst nach 25 s anfaengt,
    //    rettet noch alle vierzehn; nach 30 s dreizehn. Und ein Rammer, den
    //    man aus Ungeduld schon oben vergibt, treibt den Pulk in einen
    //    Blindstollen im Hang: gemessen fuenf Zuege, 13 von 14, 84,5 s —
    //    gewonnen, acht Sekunden teurer, kein Toter.
    // 11. EINE SCHRAEGE NACH WESTEN KOSTET DEN LAUF, NICHT DEN PULK. Wird
    //    der Bagger einer westwaerts laufenden Figur gegeben, schneidet er
    //    denselben Stollen spiegelverkehrt (Paket 1, Befund 2), und der
    //    zweite Bagger faellt beim Kreuzen in dessen Hohlraum. Gemessen ueber
    //    300 s: 0 gerettet, 0 tot. Geheilt wird das nur von einem zweiten
    //    Ansatz OESTLICH des ersten (Westansatz x200, Zweitansatz x200 bis
    //    x238: 14 von 14, fuenf Zuege, 78 bis 92 s). Ein danebengesetzter,
    //    aber ostwaerts blickender Bagger ist dagegen voll heilbar:
    //    gemessen Fehlansatz x170 oder x260, danach x188 — 14 von 14, fuenf
    //    Zuege, 77,1 bzw. 80,2 s. Genau dafuer liegen drei Bagger im Vorrat.
    //
    // Malreihenfolge beachtet: Alle acht Findlingsstuecke stehen am ENDE der
    // Liste. Das Band auf Galeriehoehe (x0..x399) liegt auf demselben Streifen
    // wie die Galeriesohle darunter und waere sonst wieder Erde; im
    // Terrainabzug geprueft, nicht im Kopf.
    hint: 'Achtundvierzig, sechsundneunzig, achtundvierzig — jeder Abstand sagt selbst, welches Werkzeug er will. Nur der Reihe nach von oben nach unten, und unten öffnet der Rammer die Mauer.',
    theme: 'sonnenhang',
    width: 720,
    height: 540,
    seed: 61013,
    entrance: { x: 40, y: 160 },
    exit: { x: 650, y: 346, w: 32, h: 26 },
    total: 14,
    // Gemessen 14 von 14 ohne einen Toten; Quote = Messung minus 3.
    needed: 11,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (76,3 s). Gemessener
    // Uhrfaktor 1,40.
    timeLimitSec: 107,
    releaseRate: 50,
    minReleaseRate: 20,
    // Vier Knopfarten, alle laengst gelehrt, und von jeder ein Vielfaches:
    // Das Level prueft die Reihenfolge, nicht die Hand (Erbe der
    // gestrichenen „Wasserrinne"). Zwei Graeber, ein Bagger, ein Rammer
    // sind gesetzt — der Rest ist die bezahlte Erlaubnis, sich zu irren.
    skills: sk({ digger: 4, miner: 3, basher: 3, blocker: 2 }),
    par: 4,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Die Hangmasse im Osten, Krone y156. Sie ist die Ostwand von T1 UND
      // T2: vierundzwanzig ueber der Grasschulter, zweiundsiebzig ueber der
      // Terrasse — beides weit ueber MAX_STEP 5, und es gibt keinen
      // Kletterer. Deshalb braucht keine dieser beiden Etagen eine Lippe,
      // und deshalb kann auf ihnen niemand verloren gehen.
      { t: 'rect', x: 340, y: 156, w: 380, h: 108, mat: MAT.EARTH },
      // T1, die Grasschulter: sechzehn dick, darunter zweiunddreissig
      // Bildpunkte Luft. Ein Schacht hier ist zweiunddreissig Fall auf den
      // Deckel von T2 — geschenkt, und das ist der erste Satz des Levels.
      { t: 'rect', x: 0, y: 180, w: 340, h: 16, mat: MAT.EARTH },
      // T2, der Terrassenkoerper: massiv von y228 bis an die Tuersohle. Nur
      // so steht unter der Schraege durchgehend Boden, und nur deshalb
      // traegt sie sechsundneunzig am Stueck.
      { t: 'rect', x: 0, y: 228, w: 340, h: 144, mat: MAT.EARTH },
      // T3, die Galeriesohle: sechzehn dick, darunter zweiunddreissig Luft.
      // Dieselbe Bauart wie T1 — dieselbe Zahl, dasselbe Werkzeug.
      { t: 'rect', x: 340, y: 324, w: 380, h: 16, mat: MAT.EARTH },
      // Die Erdmauer vor der Tuerkammer: vierundvierzig dick, zweiunddreissig
      // hoch, vom Boden bis an die Galeriedecke. Der Rammer raeumt dreizehn,
      // neunzehn bleiben als Sturz stehen.
      { t: 'rect', x: 560, y: 340, w: 44, h: 32, mat: MAT.EARTH },
      // Die Tuersohle. rough 0 ist Pflicht: Auf ihr wird gerammt, und auf
      // rauem Grund verliert ein Rammer nach jedem Zwei-Punkte-Versatz den
      // Boden.
      { t: 'ground', x: 0, w: 720, y: 372, h: 168, mat: MAT.EARTH, rough: 0 },
      // --- Findling zuletzt (Malreihenfolge) ---------------------------
      // Der Deckel von T2 mit dem Erdfenster x180..x279. Er macht die
      // Sechsundneunzig zur Sache des Baggers: Westlich und oestlich des
      // Fensters dreht jedes Werkzeug am Stein ab, im Fenster greift die
      // Schraege — und nur dort greift auch der Graeber, dem sie gehoert.
      { t: 'rect', x: 0, y: 228, w: 180, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 280, y: 228, w: 60, h: 6, mat: MAT.STEEL },
      // Die Findlingsbank zweiundsechzig unter dem Fenster: das Fangnetz
      // fuer den Graeber, der die Sechsundneunzig probiert. Sie endet bei
      // x291, und das ist gerechnet: Die Schraege erreicht ihre Hoehe erst
      // bei x299, sieht sie also nie. Waere sie acht Bildpunkte breiter,
      // gaebe es dieses Level nicht.
      { t: 'rect', x: 0, y: 288, w: 292, h: 6, mat: MAT.STEEL },
      // Das Band in der Hangmasse. Es deckelt jeden Schacht, den ein
      // Graeber in einem Rammstollen des Hangs ansetzt, bei hoechstens
      // vierundfuenfzig Bildpunkten ab — ohne es faellt derselbe Fehlgriff
      // sechsundneunzig in die Galerie (Befund 8).
      { t: 'rect', x: 340, y: 234, w: 380, h: 6, mat: MAT.STEEL },
      // Das Band auf Galeriehoehe: vom Westrand durch den ganzen
      // Terrassenkoerper bis an das Erdfenster der Galeriesohle. Es ist
      // zugleich der Westdeckel von T3 — ein Streifen, zwei Aufgaben.
      { t: 'rect', x: 0, y: 324, w: 400, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 520, y: 324, w: 200, h: 6, mat: MAT.STEEL },
      // Die Westflanke der Tuersohle. Ohne sie schlaegt ein westwaerts
      // vergebener Rammer einen dreihundert Bildpunkte langen Blindstollen
      // unter die Terrasse; mit ihr hoert er Stein und behaelt seine Figur.
      { t: 'rect', x: 332, y: 340, w: 8, h: 32, mat: MAT.STEEL },
      // Das Findlingspflaster, fuenf unter der Tuersohle — die Zahl aus
      // w6-10: flach genug, dass jeder aus der Rinne wieder heraussteigt.
      { t: 'rect', x: 0, y: 377, w: 720, h: 6, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w6-14',
    name: 'Die Schleife am Hang',
    chapter: 'Kamm',
    // Die Rampe von oben ein zweites Mal — und diesmal ist nicht die Kehre das
    // Raetsel, sondern die STELLE. Die Trockenmauer im Hang (Krone y252, Fuss
    // y396) sperrt den Ostweg, und in ihrem Koerper stecken zwei
    // Findlingsrippen uebereinander (x470 bis x485, oben y252..y272, unten
    // y326..y395). Zwischen ihnen bleibt ein Korridor von dreiundfuenfzig
    // Bildpunkten offen; nur eine Westschraege, die genau dort hindurchpasst,
    // kommt bis in den Mauerfuss. Der Rest ist ein Kreis, und er gibt dem
    // Level seinen Namen: Ein Kletterer steigt die Mauerwestflanke hinauf,
    // laeuft die Krone ostwaerts, faellt hinten E48 auf die Ostterrasse, wird
    // dort vom Kragstein ueber der Erdrippe gewendet und kommt an der
    // Mauerostflanke von selbst wieder herauf — als Einziger mit Blick nach
    // WESTEN. Dieser Rueckweg IST das Zeitfenster des Levels.
    //
    // ## Was die Messung gegen den Entwurf entschieden hat
    //
    // 1. DIE VIERZEHN SEKUNDEN GIBT ES NICHT — ES IST EINE SCHLEIFE. Das
    //    Konzept warnte, der Vorauslaeufer auf der Krone habe rund vierzehn
    //    Sekunden, bevor er die Tuer erreicht und weg ist. Gemessen wird er
    //    ueberhaupt nicht verbraucht: Der Kragstein ueber der Erdrippe dreht
    //    ihn um, die Mauerostflanke traegt ihn zurueck auf die Krone, und er
    //    laeuft die Runde endlos. Umlauf 31,7 s, davon 3,3 s im Ansatzfenster,
    //    erster Durchgang bei 41,4 s. Erster, zweiter und dritter Durchgang
    //    gewinnen (letzte Rettung 119,4 s / 151,1 s / 167,1 s), der vierte
    //    nicht mehr. Die Krone musste dafuer nicht nach Osten wachsen — sie
    //    musste sich schliessen.
    // 2. EINE LIPPE WENDET KEINEN KLETTERER, SIE TOETET IHN HIER. Erster Bau:
    //    eine 12er Lippe an der Kronenwestkante. Der Spaeher klettert sie
    //    (Welt-1-Gesetz), steht oben darauf, laeuft weiter nach Westen und
    //    faellt sechsundachtzig Bildpunkte auf den Keil — gemessen tot, in
    //    jedem Lauf. Jetzt steht dort ein Findlingspfeiler mit Kragstein: Der
    //    Pfeiler wendet den Laeufer, der Kragstein kippt den Kletterer nach
    //    zweiunddreissig Bildpunkten zurueck auf die Krone.
    // 3. UND DER PFEILER IST DAS UHRWERK, NICHT DAS GELAENDER. Ohne ihn loest
    //    das Level auch (gemessen 117,8 s, kein Toter) — aber der Spaeher
    //    faellt dann vierundsiebzig Bildpunkte an der Kronenwestkante hinab,
    //    vier unter der Sturzgrenze, und seine Schleife laeuft ueber die Sohle
    //    statt ueber die Krone: Umlauf 77,1 s statt 31,7 s. Der Pfeiler kauft
    //    beides, Abstand zur Grenze und einen halb so langen Umlauf.
    // 4. DER KEIL IST PFLICHT, UND ER IST STEILER ALS DER VON w6-05. Ohne den
    //    Keil am Mauerfuss verliert die Musterloesung (gemessen): Die Schraege
    //    endet blind im Mauerleib. Er steigt hier 2:1 statt 1:1, weil ein
    //    flacher Keil nur eine schmale Muendungshoehe abfaengt — die Schraege
    //    faellt 1 px je 2 px, der Keil muss ihr entgegenkommen. So haengt das
    //    Ansatzfenster an den Rippen und nicht am Keil, und das ist der Punkt
    //    des Levels.
    // 5. DAS FENSTER: x554 BIS x618, dreiundreissig tragende Stellen auf der
    //    ganzen Krone. Sein Westende macht die obere Rippe (wer weiter westlich
    //    ansetzt, laeuft zu hoch und stoesst an sie), sein Ostende faellt mit
    //    dem Ostende der Krone zusammen; die untere Rippe deckt genau diese
    //    Grenze ab und sagt im Bild, warum es sie gibt: weiter oestlich laege
    //    die Bahn zu tief. Jeder Fehlansatz kostet einen Bagger und den
    //    Rueckweg, kein Leben — darum fuenf Bagger fuer einen gesetzten.
    //    Gemessen: Fehlansatz bei x500 oder x540, danach der richtige — 14 von
    //    14, vier Zuege, 140,3 s bzw. 139,0 s.
    // 6. DER KRONENDECKEL IST DIE ANTWORT AUF DEN HAEUFIGSTEN FEHLGRIFF. Ein
    //    Bagger auf dem HINWEG schneidet die Schraege in die falsche Richtung
    //    (die Lehre von w6-05). Ohne Deckel kostete das den Lauf an jeder
    //    Stelle. Mit dem drei Bildpunkte duennen Findlingsdeckel (x392 bis
    //    x520) meldet jeder Bagger westlich von x524 Stein und kostet nur ein
    //    Werkzeug: Fehlgriff bei x420 gewinnt noch mit 123,1 s, bei x500 mit
    //    130,6 s. Zwischen Deckelkante und Fenster bleiben vierunddreissig
    //    Bildpunkte Anlauf stehen — dieselbe Zahl, die w6-08 gemessen hat, und
    //    aus demselben Grund (der Bagger prueft elf Bildpunkte ueber den
    //    Fuessen). Wer dort nach Osten baggert, verliert den Lauf und keine
    //    Figur; oestlich von x556 heilt der naechste Umlauf den Fehler.
    // 7. DER KRAGSTEIN UEBER DER ERDRIPPE MUSS UEBER DER RAEUMZEILE DES RAMMERS
    //    LIEGEN. Er sitzt auf y279..y286, der Rammer raeumt y287..y299
    //    (BASH_UP 12). Eine Zeile tiefer, und der Rammer prallt an seinem
    //    eigenen Dach ab, statt die Rippe zu oeffnen. Ohne ihn klettert der
    //    Spaeher die Rippe, laeuft in die Tuer und ist weg: gemessen 1
    //    gerettet, verloren.
    // 8. RAMMER NUR OSTWAERTS. Gemessenes Fenster auf der Ostterrasse x622 bis
    //    x662 — die ganze freie Terrasse, einundvierzig Bildpunkte. Nach Westen
    //    loest keine einzige Stelle: Die Findlingsflanke der Mauer wirft ihn
    //    zurueck. Die Reihenfolge ist Pflicht, und zwar in diese Richtung: Wer
    //    die Rippe oeffnet, BEVOR die Rampe steht, verliert den Vorlaeufer an
    //    die Tuer — gemessen 2 gerettet, verloren, auch mit sofort
    //    nachgesetztem zweitem Kletterer.
    // 9. DER WAECHTER GEHOERT AUF DIE SOHLE, WESTLICH DER FALLTUER. Bei x120
    //    (die Falltuer steht auf x140) sammelt er den Pulk und holt die letzte
    //    Rettung von 119,4 s auf 106,7 s — er kostet sich selbst (13 statt 14)
    //    und liegt mit vier Zuegen ueber Par: die Kuer dieses Levels. Oestlich
    //    der Falltuer (x200, x260, x320) riegelt derselbe Waechter den Pulk
    //    ein: verloren, kein Toter. Auf der Krone kostet er den Spaeher, denn
    //    oben ist sonst niemand.
    // 10. TODESFREI, UND ZWAR BEWEISBAR. Tiefster Sturz der Musterloesung ist
    //    die E48 hinter der Krone; alles andere faellt 65 (Falltuer), 32
    //    (Kragstein) oder 15. Zweihundert Zufallslaeufe mit wahllos verteilten
    //    Berufen: null Tote und null Zufallssiege. Nichtstun verliert ueber die
    //    volle Uhr, ohne eine einzige Figur zu kosten — der Pulk pendelt am
    //    Mauerfuss. Traegheit kostet nur Uhr: erst nach vierzig Sekunden
    //    angefangen rettet noch alle vierzehn (157,4 s), nach sechzig noch
    //    genau die Quote, nach achtzig nicht mehr.
    //
    // Malreihenfolge beachtet: Aller Findling steht am ENDE der Liste. Der
    // Kronendeckel und die Terrassenkappe liegen auf denselben Baendern wie die
    // Erdkoerper darunter und waeren sonst wieder Erde; im Terrainabzug
    // geprueft, nicht im Kopf. Und rough 0 auf der Sohle, weil der Keil buendig
    // anschliessen muss — auf rauem Grund haette sein Fuss eine Stufe.
    hint: 'Die Mauer trägt zwei Findlingsrippen, und nur zwischen ihnen bleibt ein Korridor frei. Schick einen Kletterer hinauf — die Schräge gibt es erst auf seinem Rückweg über die Krone. Der Rammer drüben kommt zuletzt.',
    theme: 'sonnenhang',
    width: 720,
    height: 540,
    seed: 61014,
    entrance: { x: 140, y: 330 },
    exit: { x: 684, y: 274, w: 32, h: 26 },
    total: 14,
    // Musterloesung rettet alle vierzehn — sterben kann hier niemand
    // (Befund 10). Quote = Messung minus 3.
    needed: 11,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (119,4 s). Gemessener
    // Uhrfaktor 1,41. Sie ist so bemessen, dass der zweite Fensterdurchgang
    // (151,1 s) noch gewinnt und der dritte (167,1 s) genau die Quote holt.
    timeLimitSec: 168,
    releaseRate: 40,
    minReleaseRate: 20,
    // Vier Knopfarten, alle laengst gelehrt. Fuenf Bagger fuer einen
    // gesetzten: Das Ansatzfenster ist der Kern des Levels, und ein
    // Fehlansatz soll ein Werkzeug kosten und einen Umlauf.
    skills: sk({ climber: 3, miner: 5, basher: 3, blocker: 2 }),
    par: 3,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Die Sohle. rough 0, damit der Keil ohne Stufe anschliesst.
      { t: 'ground', x: 0, w: 720, y: 396, h: 144, mat: MAT.EARTH, rough: 0 },
      // Der Mauerkoerper: Krone y252, Fuss y396 — hundertvierundvierzig, die
      // von unten niemand nimmt.
      { t: 'rect', x: 380, y: 252, w: 240, h: 144, mat: MAT.EARTH },
      // Der Keil am Mauerfuss, 2:1 von der Sohle auf y324. Er ist der Faenger
      // jeder Westmuendung: Die Schraege faellt 1 px je 2 px, der Keil steigt
      // 2 px je 1 px, und wo sich beide schneiden, oeffnet sich der Stollen
      // von selbst auf die Keilflanke. Ohne ihn haengt die Rampe im Berg
      // (gemessen: verloren).
      { t: 'slope', x0: 344, y0: 396, x1: 380, y1: 324, thick: 80, mat: MAT.EARTH },
      // Die Ostterrasse, E48 unter der Krone: der Landeplatz des Pulks und
      // sein Warteraum vor der Rippe.
      { t: 'rect', x: 620, y: 300, w: 100, h: 96, mat: MAT.EARTH },
      // Die Erdrippe — die 12er Lippe der Welt, hier als letzte Sperre vor
      // der Tuer. Sie haelt den Pulk sicher, bis der Rammer sie oeffnet.
      { t: 'rect', x: 664, y: 288, w: 12, h: 12, mat: MAT.EARTH },
      // --- Findling zuletzt (Malreihenfolge) ---------------------------
      // Das Findlingspflaster der Sohle: An ihm dreht jede Schraege ab, und
      // deshalb graebt sich in diesem Level niemand aus der Welt.
      { t: 'rect', x: 0, y: 396, w: 720, h: 8, mat: MAT.STEEL },
      // Der Kronendeckel, nur drei Bildpunkte stark und trotzdem das
      // freundlichste Bauteil des Levels: Westlich von x524 beisst kein
      // Bagger, in keiner Richtung. Er endet vierunddreissig Bildpunkte vor
      // dem Fenster — genau der Anlauf, den ein Bagger unter einer Deckplatte
      // braucht.
      { t: 'rect', x: 392, y: 252, w: 129, h: 3, mat: MAT.STEEL },
      // Die zwei Findlingsrippen im Mauerkoerper und der Korridor zwischen
      // ihnen (y273 bis y325). Die obere steht als Steinzahn bis in die
      // Krone hinauf und ist damit im Startbild die Marke des Fensters; die
      // untere reicht bis auf das Pflaster.
      { t: 'rect', x: 470, y: 252, w: 16, h: 21, mat: MAT.STEEL },
      { t: 'rect', x: 470, y: 326, w: 16, h: 70, mat: MAT.STEEL },
      // Die Findlingsflanke der Mauer zur Terrasse hin: An ihr endet jeder
      // Rammer, der auf der Terrasse nach Westen schlaegt (gemessen: keine
      // einzige Stelle loest westwaerts). Sie beginnt erst bei y294 und nicht
      // an der Terrassenkante, damit sie nur den Rammer faengt.
      { t: 'rect', x: 612, y: 294, w: 8, h: 102, mat: MAT.STEEL },
      // Die Terrassenkappe: Wer hier gruebt oder baggert, steht sofort auf
      // Stein, und der Weg zur Tuer bleibt eben.
      { t: 'rect', x: 620, y: 300, w: 100, h: 6, mat: MAT.STEEL },
      // Der Kragstein ueber der Erdrippe — das Bauteil, das die Schleife
      // schliesst. Er kippt den Kletterer, der die Rippe nehmen will, nach
      // Westen zurueck, statt ihn in die Tuer zu lassen. Er sitzt auf y279
      // bis y286 und damit UEBER der Raeumzeile des Rammers (y287 bis y299):
      // eine Zeile tiefer, und der Rammer prallt an seinem eigenen Dach ab.
      { t: 'rect', x: 652, y: 279, w: 32, h: 8, mat: MAT.STEEL },
      // Findlingspfeiler und Kragstein am Kronenwestende. Der Pfeiler wendet
      // den Laeufer, der Kragstein kippt den Kletterer — eine Lippe allein
      // taete beides nicht, sie wuerde geklettert und der Spaeher fiele
      // dahinter sechsundachtzig Bildpunkte in den Tod (gemessen, erster Bau).
      { t: 'rect', x: 380, y: 240, w: 12, h: 12, mat: MAT.STEEL },
      { t: 'rect', x: 380, y: 232, w: 32, h: 8, mat: MAT.STEEL }
    ]
  },
  {
    id: 'w6-16',
    name: 'Zwei Hände am Hang',
    chapter: 'Kamm',
    // Die einzige Doppelfront der Welt — und das einzige Level, in dem die UHR
    // das Raetsel ist und nicht der Tod. Von der gepflasterten Startkanzel
    // (x300 bis x499, Findlingsdeckel) laufen zwei Terrassenarme nach West und
    // Ost. Beide enden an einer 12er Lippe ueber demselben 96er Absturz:
    // Armkrone y276, Sohle y372 — gemessen faellt eine Figur von der
    // Armkrone genau 96 und waere tot (Grenze 78). Sie kommt nie dorthin, denn
    // beide Lippen sind Findlingszaehne. Ein unbeaufsichtigter Pulk pendelt
    // zwischen ihnen und verliert nichts; gemessen: leerer Plan, 0 gerettet,
    // 0 tot, die volle Uhr lang.
    //
    // Die zwei Fronten: Im Westarm sinkt ein GRAEBER den Schacht 72 auf die
    // Galerie (E72, Sohle y348, Findling), im Ostarm legt ein BAGGER die
    // E96-Schraege (68 Schritte, 13,6 s), und in der Galerie oeffnet ein
    // RAMMER die 44 dicke Stirn in die Tuerkammer, in die beide Arme muenden.
    //
    // ## Was die Messung gegen den Entwurf entschieden hat
    //
    // 1. OHNE RIEGEL GIBT ES KEINE DOPPELFRONT — DAS IST DER KERNBEFUND.
    //    Jede Figur startet mit dir +1 (`spawn` in world.ts). Der Pulk laeuft
    //    also geschlossen nach OSTEN, und wer dort die Schraege ansetzt, faengt
    //    ihn vollstaendig ab: Gemessen ohne jede weitere Vergabe 15 von 15,
    //    letzte Rettung 52,9 s, ein einziger Zug. Der Westarm wurde in diesem
    //    Lauf nie betreten. Der Riegel auf der Kanzel ist deshalb nicht
    //    Zubehoer, sondern der erste Griff der Musterloesung: Er teilt den Pulk
    //    dauerhaft (wer oestlich von ihm steht, kommt nicht mehr nach Westen),
    //    und erst dadurch gibt es zwei Haelften, die zwei Fronten brauchen.
    // 2. UND DER RIEGEL IST DIE PROBE AUF DIE UHR. Setzt man ihn spaet und
    //    bedient dann nur den Westen, verhungert die Osthaelfte: gemessen
    //    Riegel bei 15 s, nur Westfront — 6 von 15, verloren. Setzt man ihn
    //    frueh (bei 3 s), traegt der Westen allein 14 von 15 (55,9 s). Beides
    //    ist gemessen und beides bleibt stehen: Das Level bestraft nicht die
    //    Routenwahl, sondern die REIHENFOLGE.
    // 3. NACHEINANDER KOSTET DREIUNDDREISSIG SEKUNDEN. Dieselben vier Griffe,
    //    aber die Ostfront erst, nachdem die Westfront ihre erste Figur
    //    geliefert hat: Quote (11) erst bei 85,3 s statt 52,0 s, letzte Rettung
    //    88,5 s statt 54,6 s. Umgekehrt (Westfront zuletzt) 78,0 s. Die Uhr
    //    steht bei 76 s — der parallele Weg gewinnt mit 21 s Luft, jeder
    //    serielle verliert mit 8 bis 10 geretteten Figuren. Der geforderte
    //    Abstand von rund zehn Sekunden ist damit dreifach uebererfuellt; die
    //    Arme mussten dafuer nicht laenger werden.
    // 4. SIEBZIG SIND SICHER, SECHSUNDNEUNZIG NICHT — DAHER DIE GALERIE. Ein
    //    Schacht, der bis auf die Sohle durchschlaegt, waere ein 96er Sturz
    //    fuer jeden Nachruecker und toetete den halben Pulk. Die Galerie faengt
    //    ihn auf y347 ab: gemessen tiefster Sturz der ganzen Musterloesung 72
    //    (sechs Bildpunkte unter FALL_DEATH_PX 78). Das ist die engste
    //    gemessene Marge des Levels und der Grund fuer jede Zahl darin.
    // 5. DIE ERDLIPPE WAR DER TOEDLICHE BAUFEHLER (Paket-3-Befund 12). Erster
    //    Bau: die zwei Lippen aus Erde, wie in Welt 1. Die Musterloesung merkte
    //    nichts — 14 von 15, auf den Tick gleich schnell. Hundert Zufallslaeufe
    //    ergaben 96 Tote in 25 Laeufen, tiefster Sturz 96: Ein Rammer raeumt
    //    eine Erdlippe in vier Schlaegen, und danach laeuft der ganze Pulk ueber
    //    die Kante. Jetzt sind es Findlingszaehne, die von der Lippenkrone
    //    (y264) bis auf die Sohle (y371) durchgehen — dieselben zweihundert
    //    Zufallslaeufe: 0 Tote.
    // 6. DIE KANZEL IST GEPFLASTERT, WEIL SONST DIE ARME UEBERFLUESSIG WAEREN.
    //    Der Findlingsdeckel liegt auf der Oberflaeche (y276..279), nicht
    //    tiefer: Ein Graeber auf der Kanzel beisst im ersten Arbeitstick auf
    //    Stein, ein Bagger ebenso (Paket-3-Befund 8 — eine Findlingssohle
    //    traegt keinen Bagger, und hier ist genau das erwuenscht). Gemessen:
    //    sieben Vergaben auf der Kanzel, 0 gerettet, 0 tot. Ein Deckel eine
    //    Zeile TIEFER haette stattdessen eine 24er Grube gemacht, aus der
    //    niemand mehr herauskommt.
    // 7. DIE FINDLINGSBANK BEI y348 IST DAS NETZ BEIDER ARME. Im Westarm ist
    //    sie die Galeriesohle, im Ostarm faengt sie den Fehlgraeber ab: Er
    //    steht dann 72 tief im Schacht, der Pulk sackt heil nach (gemessen 0
    //    Tote), und ein Rammer holt ihn seitwaerts wieder heraus. Sie endet bei
    //    x499 und beginnt erst wieder bei x500 — genau dort, wo die Schraege
    //    in die Tuerkammer ausmuendet. Zwei Bildpunkte weiter westlich, und der
    //    Bagger meldet bei y347 Stein und bleibt im Berg stecken; das ist im
    //    ersten Bau dreimal passiert, bevor die Ostwand der Kammer von x492
    //    auf x499 rueckte.
    // 8. DIE MUENDUNG DARF NICHT BUENDIG SEIN (Paket-1-Befund 1). Die Schraege
    //    faellt bei x499 auf y343 aus der Wand und die Figuren fallen die
    //    letzten 28 in die Kammer — nicht kletterbar, also einbahnig. Ebenso
    //    der Rammerstollen: Er liegt auf y347 und muendet 24 ueber der
    //    Kammersohle. Ohne diese zwei Absaetze laufen beide Haelften ihren
    //    eigenen Weg wieder hinauf und die halbe Uhr ist Zuschauen.
    //
    // Gemessene Fenster: Schacht x84 bis x290 (bei x76 nur 11 gerettet — der
    // Pulk pendelt erst bis an den Westzahn; bei x295 verloren), Riegel x368
    // bis x392 bei 8 bis 11 freigesetzten Figuren, Baggeransatz x624 bis x640
    // westwaerts. Traegheit kostet nur Uhr: zehn Sekunden spaeter angefangen
    // rettet noch alle vierzehn (63,4 s).
    //
    // Malreihenfolge beachtet: Aller Findling steht am ENDE der Liste, sonst
    // haetten die zwei Hohlraeume Bank und Deckel wieder aufgerissen; im
    // Terrainabzug geprueft, nicht im Kopf. rough 0 auf der Sohle, weil dort
    // gerammt wird.
    hint: 'Zwei Arme, zwei Kanten — und nur eine Uhr. Der Schacht im Westen und die Schräge im Osten müssen zusammen wachsen; wer erst den einen und dann den anderen bedient, kommt zu spät.',
    theme: 'sonnenhang',
    width: 720,
    height: 540,
    seed: 61016,
    entrance: { x: 360, y: 212 },
    exit: { x: 346, y: 346, w: 32, h: 26 },
    total: 15,
    // Die Musterloesung rettet vierzehn — der Riegel bleibt stehen und ist der
    // einzige Verlust des Levels. Quote = Messung minus 3.
    needed: 11,
    // Uhr = 1,39 x letzte Rettung der Musterloesung (54,6 s). Sie ist so
    // bemessen, dass jeder serielle Weg (78,0 s bzw. 85,3 s bis zur Quote)
    // daran scheitert und der parallele einundzwanzig Sekunden Luft hat.
    timeLimitSec: 76,
    releaseRate: 55,
    minReleaseRate: 20,
    // Vier Knopfarten, alle laengst gelehrt. Von jeder Art liegt mehr im
    // Vorrat als die Musterloesung braucht: Ein Fehlansatz kostet hier ein
    // Werkzeug und Uhr, nie eine Figur (Befunde 6 und 7).
    skills: sk({ blocker: 3, digger: 3, miner: 4, basher: 3 }),
    par: 4,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Die Sohle. rough 0, weil auf ihr gerammt wird.
      { t: 'ground', x: 0, w: 720, y: 372, h: 168, mat: MAT.EARTH, rough: 0 },
      // Die Hangmasse mit beiden Armen: Krone y276, Fuss y372 — die
      // sechsundneunzig, die von den Lippen bewacht werden.
      { t: 'rect', x: 60, y: 276, w: 600, h: 96, mat: MAT.EARTH },
      // Die Westgalerie (zweite Etage) — im Startbild sichtbar aufgeschnitten.
      // Sie faengt den Schacht auf y347 ab; das sind 72 unter der Armkrone.
      { t: 'rect', x: 72, y: 330, w: 228, h: 18, mat: MAT.EMPTY },
      // Die Tuerkammer. In sie muenden beide Arme: der Rammerstollen von
      // Westen auf y347, die Baggerschraege von Osten auf y343.
      { t: 'rect', x: 344, y: 304, w: 156, h: 68, mat: MAT.EMPTY },
      // --- Findling zuletzt (Malreihenfolge) ---------------------------
      // Das Sohlenpflaster: An ihm endet jede Grabung, und deshalb graebt sich
      // hier niemand aus der Welt.
      { t: 'rect', x: 0, y: 372, w: 720, h: 8, mat: MAT.STEEL },
      // Die Findlingsbank, in zwei Stuecken. Das westliche traegt die Galerie
      // und den Rammerstollen, das oestliche faengt den Fehlgraeber im Ostarm
      // ab. Die Luecke zwischen x344 und x499 ist die Tuerkammer und zugleich
      // das Fenster, durch das die Schraege ausmuendet.
      { t: 'rect', x: 72, y: 348, w: 272, h: 4, mat: MAT.STEEL },
      { t: 'rect', x: 500, y: 348, w: 148, h: 4, mat: MAT.STEEL },
      // Das Kanzelpflaster: auf der Startplatte beisst kein Werkzeug.
      { t: 'rect', x: 300, y: 276, w: 200, h: 4, mat: MAT.STEEL },
      // Die zwei Kammerflanken unter der Bank. Ohne sie schlaegt ein Rammer
      // auf der Kammersohle einen Stollen bis unter die Arme hinaus und der
      // Pulk strandet in den Aussentaschen.
      { t: 'rect', x: 336, y: 352, w: 8, h: 20, mat: MAT.STEEL },
      { t: 'rect', x: 500, y: 352, w: 8, h: 20, mat: MAT.STEEL },
      // Die zwei Findlingszaehne — Lippe und Flanke in einem Stueck. Sie sind
      // der Grund, warum dieses Level todesfrei ist (Befund 5).
      { t: 'rect', x: 60, y: 264, w: 12, h: 108, mat: MAT.STEEL },
      { t: 'rect', x: 648, y: 264, w: 12, h: 108, mat: MAT.STEEL }
    ]
  },
  {
    id: 'w6-17',
    name: 'Prüfung am Sonnenhang',
    chapter: 'Kamm',
    // Das Finale der Welt: der ganze Hang in einem Bild, fuenf Ebenen, fuenf
    // Griffe — und kein einziger davon ist neu. Startsohle (y200) vor der
    // Trockenmauer, Krone (y104), Mittelterrasse (y152), Halle (y248) und die
    // Tuerkammer, die genau unter dem Eingang im Westmassiv liegt. Jeder Griff
    // stammt aus einem gebauten Level dieser Welt: Kletterer an der
    // Mauerwestflanke und Westschraege vom Rueckweg (w6-05, verschaerft in
    // w6-14), Rammer nimmt die 12er Lippe (w6-12), je ein Schirm hinab
    // (w6-06, Dachroute), Haarnadel-Stollen vom Findlingspflock westwaerts
    // unter den Hinweg (w6-08). Die Pruefung verlangt nichts Neues, nur alles
    // zugleich.
    //
    // ## Was die Messung gegen den Entwurf entschieden hat
    //
    // 1. AUS 120 WURDEN 96 — DAS RASTER SCHLAEGT DIE KONZEPTZEILE. Der Entwurf
    //    setzt die Mittelterrassen-Ostkante 120 px ueber die Halle.
    //    Entwurfsregel 2 dieser Welt kennt aber nur E48/E72/E96, und 96 ist
    //    laengst toedlich (FALL_DEATH_PX 78): Der Schirm bleibt Pflicht, der
    //    Abstand nennt sein Werkzeug wieder selbst. Gemessen aendert die
    //    Kuerzung am Griff nichts und spart jeder Figur 24 px Schwebezeit.
    // 2. DER BAUER FAELLT AUS. Der Entwurf fuehrt ihn als Reserve — das waeren
    //    sechs Knopfarten. Fuenf sind die Grenze, und der Bauer ist der
    //    einzige, der in diesem Level nirgends etwas ausrichtet: Es gibt keine
    //    Stelle, an der zwoelf Steine eine Kante schliessen. Statt seiner
    //    tragen Bagger (fuenf fuer einen gesetzten) und Rammer (vier fuer
    //    zwei) den Ueberschuss.
    // 3. EINE LIPPE OHNE KRAGSTEIN TOETET DEN SPAEHER. Erster Bau: die 12er
    //    Lippe blank an der Ostkante. Der Spaeher hat den Kletterer, klettert
    //    sie (Welt-1-Gesetz), steht oben darauf, laeuft weiter nach Osten und
    //    faellt in den Schacht — gemessen tot, in jedem Lauf, und die Rampe
    //    wird nie gebaut. Der Kragstein sitzt jetzt auf y131..y138 und kippt
    //    ihn im Hochziehen zurueck. Eine Zeile tiefer waere er das Ende des
    //    Levels: Der Rammer raeumt y139..y151 (BASH_UP 12), und Findling auf
    //    y139 liesse ihn an seinem eigenen Dach abprallen — dieselbe Rechnung
    //    wie w6-14, Befund 7, nur eine Zeile hoeher angesetzt.
    // 4. DAS ANSATZFENSTER: x424 BIS x482, NEUNUNDFUENFZIG BILDPUNKTE,
    //    LUECKENLOS. Gemessen ueber jede Spalte der Krone. Sein Ostende faellt
    //    mit dem Ostende der Krone zusammen — dafuer wurde die Mauer von 192
    //    auf 183 gekuerzt, sonst blieben neun Spalten stehen, auf denen die
    //    Schraege blind im Mauerleib endet. Sein Westende macht der
    //    Kronendeckel plus die vierunddreissig Bildpunkte Anlauf, die ein
    //    Bagger unter einer drei Punkte starken Deckplatte braucht (er prueft
    //    elf Bildpunkte ueber den Fuessen; dieselbe Zahl wie in w6-08 und
    //    w6-14, aus demselben Grund).
    // 5. DER ERDKEIL IST DIE TOLERANZ, NICHT DER SCHMUCK. Er steigt 2:1 vom
    //    Findlingspflaster (y200) auf y164 an den Mauerfuss. Die Schraege
    //    faellt 1 px je 2 px, der Keil faellt 2 px je 1 px — sie schneiden
    //    sich immer, und deshalb traegt das ganze Fenster statt einer Handvoll
    //    Spalten. Ohne ihn haengt die Rampe im Berg.
    // 6. EIN BAGGER OSTWAERTS AUF DER KRONE KOSTET DEN LAUF, ABER KEINE FIGUR.
    //    Gemessen bei x330 / x400 / x450 / x470: verloren, null Tote — sein
    //    Stollen trennt die Krone, und der Spaeher pendelt danach zwischen
    //    Stollenende und Keil. Der Kronendeckel (x304..x391, drei Punkte
    //    stark) faengt genau die Haelfte der Krone ab, auf die ein Spieler
    //    zuerst tippt: Dort meldet jeder Bagger sofort Stein und kostet nur
    //    ein Werkzeug — eine Findlingssohle traegt keinen Bagger, sy = y-11
    //    ueber sh = 13 reicht bis eine Zeile unter die Fuesse.
    // 7. WESTWAERTS HEILT JEDER FEHLANSATZ. Gemessen: Fehlgriff bei x340
    //    (Deckel), x400, x415, x423, danach der richtige — 14 von 14, ein
    //    Werkzeug mehr, letzte Rettung 176,3 s bis 181,4 s und damit noch gut
    //    im Uhrfenster. Die flache Grube, die ein solcher Ansatz in die Krone
    //    reisst, laeuft der Spaeher selbst wieder hinaus.
    // 8. EBENE 3 KOSTET NUR ZEIT — DIE LIPPE IST DIE GEFORDERTE LIPPE. Wer
    //    Kletterer und Schraege setzt und dann haengenbleibt, verliert ueber
    //    die volle Uhr keine einzige Figur: Der Pulk pendelt auf der
    //    Mittelterrasse zwischen Mauerostflanke und Lippe, tiefster Sturz im
    //    ganzen Lauf 49 (der Falltuerabgang). Gemessen, nicht geschaetzt —
    //    Entwurfsregel 4 gilt auch im Finale.
    // 9. DIE REIHENFOLGE IST PFLICHT, UND ZWAR IN DIESE RICHTUNG. Wer die
    //    Lippe oeffnet, BEVOR die Rampe steht, verliert den Spaeher an den
    //    Schacht: gemessen 1 gerettet, verloren, kein Toter. Dieselbe Lehre
    //    wie w6-14, hier mit dem Schirm als Fallschirm statt als Sarg.
    // 10. BEIDE RAMMER SIND GROSSZUEGIG — UND RICHTUNGSGEBUNDEN. Die Lippe
    //    loest ostwaerts von jeder Stelle der Terrasse (x484 bis x626,
    //    lueckenlos, 143 Bildpunkte; die Vormerkung traegt den Rammer bis an
    //    die Lippe), westwaerts loest KEINE Stelle — die Findlingsflanke
    //    x477..x482 wirft ihn zurueck. Der Stollen loest westwaerts von x462
    //    bis x667, ostwaerts von keiner Stelle (Findlingspflock). Das Raetsel
    //    dieses Levels ist die Schraege, nicht das Zielen.
    // 11. OHNE SCHIRM STIRBT ALLES, MIT SCHIRM NIEMAND. Gemessen: derselbe
    //    Plan ohne Schirme kostet 14 von 14 im Schacht. Der Schacht ist der
    //    einzige Toeter des Levels, er steht vom ersten Bild an offen da, und
    //    die Schirme liegen fuer jede Figur bereit (vierzehn im Vorrat).
    // 12. DER FINDLINGSPFLOCK AUF DER SOHLE IST UHRWERK, NICHT GELAENDER. Ohne
    //    ihn pendelt der Pulk bis an den Weltrand, und die letzte Rettung
    //    rutscht von 146,8 s auf 155,5 s — die Weltkante wendet gratis und
    //    kostet die Uhr. Mit ihm ist der Pferch 107 Bildpunkte breit, und die
    //    Falltuer steht in seiner Mitte.
    // 13. ZUFALLSPROBE, 200 LAEUFE IN ZWEI BLOECKEN: Block A vier Tote in drei
    //    von hundert Laeufen, Block B ein Toter in einem von hundert, zusammen
    //    fuenf Tote in vier von zweihundert Laeufen. NULL Zufallssiege.
    //    Groesster Sturz 96 — also ausschliesslich der angesagte Schacht, kein
    //    stiller Baufehler. Ein Finale, das sich blind gewinnen liesse, waere
    //    keins.
    // 14. TRAEGHEIT KOSTET NUR UHR. Erst nach zwanzig Sekunden angefangen
    //    rettet noch alle vierzehn (164,3 s), nach vierzig auch (182,2 s),
    //    nach sechzig gerade eben (203,1 s), nach achtzig nicht mehr — und nie
    //    stirbt dabei jemand.
    //
    // Malreihenfolge beachtet: Aller Findling steht am ENDE der Liste. Das
    // Sohlenpflaster, die Terrassenkappe und der Kronendeckel liegen auf
    // denselben Baendern wie die Erdkoerper darunter und waeren sonst wieder
    // Erde; im Terrainabzug geprueft, nicht im Kopf. rough 0 auf allen drei
    // Sohlen, weil auf zweien gerammt wird und die dritte den Keil buendig
    // tragen muss.
    hint: 'Fünf Ebenen und kein neuer Griff. Der Kletterer bringt dich auf die Krone — die Schräge gibt es erst auf seinem Rückweg. Dann die Lippe, ein Schirm für jeden, und unten der Stollen zurück unter den Hinweg.',
    theme: 'sonnenhang',
    width: 720,
    height: 540,
    seed: 61017,
    entrance: { x: 238, y: 150 },
    exit: { x: 222, y: 222, w: 32, h: 26 },
    total: 14,
    // Musterloesung rettet alle vierzehn; der einzige Toeter ist der
    // angesagte Schacht, und gegen ihn liegt fuer jede Figur ein Schirm
    // bereit. Quote = Messung minus 3.
    needed: 11,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (146,8 s). Gemessener
    // Uhrfaktor 1,40. Sie ist so bemessen, dass ein verschenkter Bagger
    // (181,4 s) und ein um sechzig Sekunden verspaeteter Anfang (203,1 s)
    // noch gewinnen.
    timeLimitSec: 206,
    releaseRate: 55,
    minReleaseRate: 20,
    // Fuenf Knopfarten, alle laengst gelehrt — der Bauer des Entwurfs ist
    // gestrichen (Befund 2). Ein Schirm je Figur, fuenf Bagger fuer einen
    // gesetzten, vier Rammer fuer zwei: Das Fenster auf der Krone ist der
    // Kern des Levels, und ein Fehlansatz soll ein Werkzeug kosten und einen
    // Umlauf.
    skills: sk({ climber: 3, miner: 5, basher: 4, floater: 14, blocker: 2 }),
    par: 18,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Das Westmassiv: Startsohle y200, und in ihm liegen Stollen und
      // Tuerkammer. rough 0, weil hier gerammt wird und der Keil buendig
      // anschliessen muss.
      { t: 'ground', x: 0, w: 460, y: 200, h: 340, mat: MAT.EARTH, rough: 0 },
      // Die Trockenmauer: Krone y104, Fuss y199 — sechsundneunzig, die von
      // unten niemand nimmt. 183 breit, damit das Ansatzfenster genau am
      // Ostende der Krone endet (Befund 4).
      { t: 'rect', x: 300, y: 104, w: 183, h: 96, mat: MAT.EARTH },
      // Der Erdkeil am Mauerfuss, 2:1 von der Sohle auf y164: Faenger jeder
      // Westmuendung und zugleich die Leiter des Spaehers — an seinem Kopf
      // klettert er nur noch zweiundsechzig statt sechsundneunzig.
      { t: 'slope', x0: 282, y0: 200, x1: 300, y1: 164, thick: 40, mat: MAT.EARTH },
      // Die Mittelterrasse, E48 unter der Krone: Landeplatz des Pulks und
      // sein Warteraum vor der Lippe.
      { t: 'rect', x: 483, y: 152, w: 157, h: 48, mat: MAT.EARTH },
      // Die 12er Lippe an der Ostkante. Sie ist der Grund, warum Ebene 3 nur
      // Zeit kostet und keine Figur (Befund 8).
      { t: 'rect', x: 628, y: 140, w: 12, h: 12, mat: MAT.EARTH },
      // Das Ostmassiv unter der Halle. rough 0 — hier steht der Stollen an.
      { t: 'ground', x: 460, w: 260, y: 248, h: 292, mat: MAT.EARTH, rough: 0 },
      // Die Hallenostwand: Sie schliesst den Raum hinter dem Findlingspflock,
      // damit dort keine tote Tasche bleibt.
      { t: 'rect', x: 680, y: 200, w: 40, h: 48, mat: MAT.EARTH },
      // Die Tuerkammer genau unter dem Eingang — die Haarnadel als Bild.
      { t: 'rect', x: 216, y: 222, w: 44, h: 26, mat: MAT.EMPTY },
      // --- Findling zuletzt (Malreihenfolge) ---------------------------
      // Das Sohlenpflaster: Es deckelt die Tuerkammer gegen jede Grabung von
      // oben und stoppt die Westschraege am Mauerfuss — es macht damit das
      // Ostende des Ansatzfensters.
      { t: 'rect', x: 0, y: 200, w: 300, h: 8, mat: MAT.STEEL },
      // Der Findlingsgrund von Halle, Stollen und Tuerkammer: Auf ihm dreht
      // jeder Bagger ab, und deshalb graebt sich hier niemand aus der Welt.
      { t: 'rect', x: 0, y: 248, w: 720, h: 8, mat: MAT.STEEL },
      // Der Kronendeckel, drei Bildpunkte stark: Westlich von x392 beisst
      // kein Bagger, in keiner Richtung. Er endet vierunddreissig Bildpunkte
      // vor dem Fenster — genau der Anlauf, den ein Bagger unter einer
      // Deckplatte braucht.
      { t: 'rect', x: 304, y: 104, w: 88, h: 3, mat: MAT.STEEL },
      // Die Terrassenkappe: Wer hier gruebt oder baggert, steht sofort auf
      // Stein — kein Loch in der Terrasse, unter der die Halle liegt.
      { t: 'rect', x: 483, y: 152, w: 157, h: 6, mat: MAT.STEEL },
      // Die Findlingsflanke der Mauer zur Terrasse hin: An ihr endet jeder
      // Rammer, der auf der Terrasse nach Westen schlaegt (gemessen: keine
      // einzige Stelle loest westwaerts). Sie beginnt erst bei y116, damit
      // sie die Schraege am Fensterostende nicht beruehrt.
      { t: 'rect', x: 477, y: 116, w: 6, h: 36, mat: MAT.STEEL },
      // Der Findlingspflock in der Halle: Er wendet den Rammer nach Westen
      // und macht aus dem Ostwaertsversuch einen Fehlgriff ohne Verlust.
      { t: 'rect', x: 668, y: 236, w: 12, h: 12, mat: MAT.STEEL },
      // Der Findlingspflock westlich der Falltuer: Er haelt den Pulk im
      // Pferch und ist damit Uhrwerk, nicht Gelaender (Befund 12).
      { t: 'rect', x: 192, y: 188, w: 12, h: 12, mat: MAT.STEEL },
      // Der Kragstein ueber der Lippe. Er sitzt auf y131..y138 und damit UEBER
      // der Raeumzeile des Rammers (y139..y151): Er kippt den Kletterer im
      // Hochziehen zurueck, laesst dem Rammer aber die oberste Zeile frei.
      { t: 'rect', x: 612, y: 131, w: 28, h: 8, mat: MAT.STEEL }
    ]
  },
];
