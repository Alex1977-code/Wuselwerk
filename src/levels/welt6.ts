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
];
