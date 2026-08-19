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
];
