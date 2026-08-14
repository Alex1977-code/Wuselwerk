import { MAT, SKILLS, type SkillCounts } from '../core/types';
import type { LevelDef } from './types';

function sk(partial: Partial<SkillCounts>): SkillCounts {
  const out = {} as SkillCounts;
  for (const s of SKILLS) out[s] = partial[s] ?? 0;
  return out;
}

/**
 * Welt 1 — Grasland, der Berufs-Grundkurs und die Pruefung.
 *
 * Vierzehn Level, gebaut nach dem abgenommenen Plan in `docs/welt-1-neu.md`.
 * Der Auftrag lautete: „in welt 1 haette ich gern level zum basics lernen
 * jeden berufs und danach muss das anspruchsvoll werden, ab level drei
 * braucht es mindestens 3 berufe um das level zu loesen … anspruchsvoll aber
 * nicht demotivierend."
 *
 * ## Warum sich das nicht widerspricht
 *
 * Es sieht nach einem Widerspruch aus — erst lehren, dann fordern —, und er
 * loest sich durch eine Rechnung, nicht durch einen Kompromiss: **Zwei
 * bekannte Berufe plus ein neuer sind exakt drei.** Der Grundkurs faellt
 * damit mit der Drei-Berufe-Regel zusammen, statt vor ihr zu liegen.
 *
 * - Level 1 und 2 zeigen je genau **einen** scharfen Knopf (Graeber, Rammer).
 *   Nach zwei Leveln sind zwei Berufe gelernt — der erste arithmetisch
 *   moegliche Moment fuer „drei".
 * - Level 3 bis 8 fuehren je genau **einen neuen** Beruf ein und verlangen
 *   **zwei gelernte**. Nach Level 8 sind alle acht Berufe gelehrt.
 * - Level 9 bis 14 kombinieren ohne Neuzugang.
 *
 * Die Kurve der verlangten Berufe lautet 1, 1, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3,
 * 4, 4. Ab Level 3 faellt keines darunter.
 *
 * ## Die vier Gesetze der Knopfleiste
 *
 * Der Spieltest fand nicht zu wenig Haerte, sondern zu wenig Lesbarkeit: von
 * einem auf vier auf fuenf unbeschriftete Bildchen, kein Beruf je
 * vorgestellt, sechs Niederlagen am dritten Level. Dagegen gilt:
 *
 * 1. Hoechstens **fuenf** Knopfarten je Level — tatsaechlich nie mehr als
 *    vier.
 * 2. Jede gezeigte Art ist in einem frueheren Level **vorgestellt** worden.
 * 3. Der Werkzeug-Ueberschuss steckt ausschliesslich in **Stueckzahlen**,
 *    nie in einer zusaetzlichen Knopfart.
 * 4. Jeder Knopf traegt sein deutsches Wort (`SKILL_KNOPF`) und die
 *    Vorratszahl.
 *
 * ## Und die drei Bausetze, die diese Welt benutzt
 *
 * - **E48 faellt frei hinab**, E72 auch — und beide sperren den Rueckweg.
 *   E96 ist die Zahl, die nur der Kletterer beantwortet, E120 die, die nur
 *   der Schirm ueberlebt (Sturzgrenze 78).
 * - **Die Schraege ist der Rueckweg.** Der Schraegbagger steigt 1 px je 2 px
 *   und ist damit die einzige Verbindung des Spiels, die in BEIDE Richtungen
 *   begehbar ist. Damit der Pulk sie von unten betreten kann, muss ihre
 *   untere Muendung auf der Wartehoehe liegen — deshalb steht in jedem
 *   Schraegbagger-Level eine **Wand hinter dem Ansatz**: Sie legt den
 *   Startpunkt fest, und aus dem Startpunkt folgt die Muendung. Ein
 *   Ansatzfenster, das der Daumen treffen muss, waere Millimeterarbeit.
 * - **Sackgassen fangen mit Warten, nie mit Sterben.** Wo eine Kante
 *   toedlich waere, steht eine 12-px-Lippe davor (ueber MAX_STEP 5, unter
 *   BASH_UP 12 — ein Rammer oeffnet sie) oder die Kante liegt hinter dem
 *   Ost-Umweg. In sechs der vierzehn Level gibt es ueberhaupt keine
 *   Verlustkante.
 *
 * **Lippe und Kletterer schliessen einander aus:** Eine Lippe wendet keinen
 * Kletterer, er klettert sie. Wo ein Kletterer oben umkehren muss, steht ein
 * **Kragstein** — in Level 9 sichtbar eingefuehrt, in Level 13 abgefragt.
 *
 * Ganz Welt 1 ist lebensfrei (`lebensfrei` in `leben.ts`), das Sterntor steht
 * auf der Kapitelgrenze vor Level 9 — nie im Grundkurs.
 *
 * ## Stand: gemessen und verdrahtet
 *
 * Die Hausregel dieses Projekts lautet: Ein Level gilt erst, wenn der
 * Messlauf es bestaetigt hat — Zahlen, die nur plausibel aussehen, sind hier
 * mehrfach zusammengebrochen. Alle vierzehn Level loesen sich inzwischen mit
 * ihrer Musterloesung (`tests/welt1-plaene.ts`), halten ihr Par, ihre Marge
 * und ihren Uhrfaktor; die Quittung steht in `docs/messlauf.json`.
 *
 * ## Was der Messlauf ueber die Regeln des Spiels gelehrt hat
 *
 * Sieben der vierzehn Level standen im ersten Lauf still oder toeteten ihren
 * Pulk. Keine dieser Ursachen war eine Zahl, die knapp danebenlag — jede war
 * eine Regel, die niemand aufgeschrieben hatte. Sie stehen jetzt bei dem
 * Level, an dem sie gemessen wurden, und zusammengefasst hier:
 *
 * 1. **Eine Figur setzt beim Laufen erst den Fuss auf das Nachbarfeld und
 *    faellt dann.** Die Westkante einer Platte ist damit ein offener Abgrund,
 *    auch wenn die naechste Platte buendig anschliesst (w1-12).
 * 2. **Ein Rammer, dem beim Auftrag keine Wand in Reichweite steht (5
 *    Bildpunkte), wird zum VORGEMERKTEN Rammer** und faengt an der
 *    naechstbesten Wand an — in der Richtung, in die er dann gerade schaut.
 *    Zweimal hat das eine Wand geoeffnet, die stehen bleiben sollte
 *    (w1-12, w1-13).
 * 3. **Ein Bagger prueft elf Bildpunkte ueber seinen Fuessen mit.** Eine
 *    Schraege kann eine durchgehende Stahlkappe deshalb nie unterlaufen, und
 *    unter einem Stahldeckel braucht sie zwoelf Bildpunkte Luft (w1-11,
 *    w1-14).
 * 4. **Ein Blocker steht fuer immer.** Man kann ihn nicht freigraben; er
 *    blockt auch nach einem Sturz weiter. In einem Level mit nur einem Gang
 *    ist er kein Werkzeug, sondern ein Riegel (w1-10, w1-14).
 * 5. **Ein Laeufer ist viermal schneller als ein Bauer** und ueberholt ihn
 *    auf der eigenen Bruecke. Jede Bruecke ueber einen Spalt kostet Figuren;
 *    was man bauen kann, ist nur, dass der Sturz sie nicht toetet
 *    (w1-12, w1-13, w1-14).
 * 6. **Zwei Auftraege an dieselbe Figur loeschen einander.** Der zweite
 *    ueberschreibt den ersten, eine Vormerkung bleibt trotzdem liegen
 *    (w1-12, w1-13).
 * 7. **Ein Schacht ist neun Bildpunkte breit.** Wer weniger als fuenf
 *    Bildpunkte von der Kante einer Kammer entfernt graebt, graebt an ihr
 *    vorbei — und im schlimmsten Fall aus der Welt heraus (w1-09).
 */
export const WELT1_LEVELS: LevelDef[] = [
  {
    id: 'w1-01',
    name: 'Grabe dich durch',
    chapter: 'Spaziergang',
    // Unveraendert aus dem Bestand. Ein einziger scharfer Knopf, eine einzige
    // Zuweisung, kein Weg zu sterben: Wer nichts tut, laeuft ewig auf ebenem
    // Boden, und nur die Uhr verliert.
    hint: 'Die Tür liegt unter dir. Wähle den Gräber und tippe eine Figur an.',
    theme: 'grass',
    width: 480,
    height: 540,
    seed: 1337,
    entrance: { x: 240, y: 320 },
    exit: { x: 220, y: 436, w: 40, h: 20 },
    total: 10,
    // Messlauf: Musterloesung rettet 8, Marge 3 (Drittel A verlangt drei).
    needed: 5,
    timeLimitSec: 90,
    releaseRate: 50,
    minReleaseRate: 30,
    skills: sk({ digger: 5 }),
    par: 1,
    paint: [{ t: 'ground', x: 0, w: 480, y: 380, h: 160, mat: MAT.EARTH, rough: 3 }],
  },
  {
    id: 'w1-02',
    name: 'Die Wand',
    chapter: 'Spaziergang',
    // Zwei Korrekturen am Bestand, beide aus dem Plan:
    //
    // 1. `rough` von 2 auf 0. Der Rammer verliert auf rauem Grund nach jedem
    //    Zwei-Punkt-Versatz den Boden — und die einzige Rammstrecke dieses
    //    Levels lag auf rauem Boden. Eine gemessene Falle im zweiten Level
    //    des Spiels.
    // 2. Der Vorrat schrumpft von vier Knopfarten auf EINE. Das ist die
    //    direkte Antwort auf den Spieltest-Befund „1 -> 4 -> 5
    //    unbeschriftete Bildchen": Ein Level, das genau einen Beruf lehrt,
    //    zeigt genau einen Knopf.
    hint: 'Der Rammer gräbt waagerecht. Setze ihn an, bevor die Uhr abläuft.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 4711,
    entrance: { x: 100, y: 340 },
    exit: { x: 596, y: 380, w: 32, h: 26 },
    total: 20,
    needed: 15,
    timeLimitSec: 120,
    releaseRate: 50,
    minReleaseRate: 30,
    skills: sk({ basher: 3 }),
    par: 1,
    paint: [
      { t: 'ground', x: 0, w: 720, y: 400, h: 140, mat: MAT.EARTH, rough: 0 },
      { t: 'rect', x: 340, y: 250, w: 44, h: 155, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w1-03',
    name: 'Der Wächter',
    chapter: 'Spaziergang',
    // Lehrt den Blocker — und zwar an der Stelle, an der er wirklich
    // gebraucht wird: Der Grabpunkt liegt WESTLICH einer Abbruchkante, und
    // ohne einen Waechter davor laeuft der Pulk beim Graben daran vorbei.
    //
    // Die Falltuer liegt zwischen Riegel und Ostwand: Solange der Spieler
    // nichts oeffnet, pendelt der ganze Pulk in einer geschlossenen Schale.
    // Nichts kann verloren gehen, bevor man selbst etwas aufmacht.
    hint: 'Der Riegel im Westen versperrt den Weg — nur der Rammer kommt hindurch. Dahinter fällt die Wiese ab: Setze den Wächter, bevor du gräbst.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 1103,
    entrance: { x: 480, y: 280 },
    exit: { x: 140, y: 386, w: 32, h: 26 },
    total: 20,
    needed: 13,
    timeLimitSec: 120,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ basher: 2, blocker: 2, digger: 2 }),
    par: 3,
    paint: [
      { t: 'ground', x: 0, w: 720, y: 340, h: 200, mat: MAT.EARTH, rough: 0 },
      // Die Ostwand wendet den Pulk, der Riegel sperrt nach Westen. Zwischen
      // beiden liegt die Falltuer — die geschlossene Schale.
      { t: 'rect', x: 676, y: 240, w: 44, h: 100, mat: MAT.ROCK },
      { t: 'rect', x: 300, y: 280, w: 44, h: 60, mat: MAT.ROCK },
      // Der Pferch an der Westkante: 72 hinab, ueberlebbar, ohne Rueckweg.
      // Er ist die Strafe fuer den vergessenen Waechter — sichtbar, nicht
      // toedlich.
      { t: 'rect', x: 0, y: 340, w: 60, h: 72, mat: MAT.EMPTY },
      // Die Tuerkammer unter der Wiese. Deckel 32 dick: Der Graeber braucht
      // sichtbar Zeit, aber keine zweite Zuweisung.
      { t: 'rect', x: 100, y: 372, w: 120, h: 40, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w1-04',
    name: 'Die Brücke',
    chapter: 'Spaziergang',
    // Lehrt den Brueckenbauer, und mit ihm die Rechnung, die diese Welt
    // traegt: Je Zuweisung sind rund zwanzig Bildpunkte Weg und zehn Anstieg
    // nutzbar (Uebergabe bei zwei Reststeinen). Der Normspalt der Welt ist
    // deshalb 36 px — drei Zuweisungen mit sichtbarem Startfenster, statt
    // zwei mit Millimeterarbeit.
    //
    // Die Falltuer liegt oestlich des Spalts: Der Pulk laeuft erst gegen die
    // Ostwand und dann zurueck. Bis die erste Kante erreicht ist, vergehen
    // ueber dreissig Sekunden — die Vierzig-Sekunden-Regel ist ohne Lippe
    // eingehalten.
    hint: 'Der Spalt ist zu breit zum Springen. Drei Brückenbauer nacheinander tragen hinüber — und im Westen wartet wieder eine Kante.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 1104,
    entrance: { x: 420, y: 320 },
    exit: { x: 120, y: 426, w: 32, h: 26 },
    total: 20,
    // Messlauf: Musterloesung rettet 16, Marge 3.
    needed: 13,
    timeLimitSec: 150,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ builder: 5, blocker: 2, digger: 2 }),
    par: 5,
    paint: [
      { t: 'ground', x: 0, w: 720, y: 380, h: 160, mat: MAT.EARTH, rough: 0 },
      { t: 'rect', x: 690, y: 300, w: 30, h: 80, mat: MAT.ROCK },
      // Der Normspalt: 36 breit, 72 tief. Wer hineinfaellt, lebt und wartet.
      { t: 'rect', x: 300, y: 380, w: 36, h: 72, mat: MAT.EMPTY },
      // Der Westpferch, wieder 72 — dieselbe Sprache wie in Level 3.
      { t: 'rect', x: 0, y: 380, w: 60, h: 72, mat: MAT.EMPTY },
      { t: 'rect', x: 100, y: 412, w: 120, h: 40, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w1-05',
    name: 'Über den Stahl',
    chapter: 'Kniffelig',
    // Lehrt den Kletterer und das Material STAHL in einem Bild: Die Flanke
    // der Stufe ist Stahl, also prallt der Rammer ab und der Graeber beisst
    // sich nicht durch. Der Kletterer ist eine PERSOENLICHE Gabe — eine je
    // Figur —, und genau das ist die Lehre.
    //
    // Die Stufe ist 72 hoch und nicht, wie zuerst entworfen, 130. Grund:
    // Wer oben ankommt, laeuft irgendwann nach Westen zurueck und faellt
    // wieder hinunter. Bei 130 waere das toedlich, und eine 12-px-Lippe
    // haelt ausgerechnet einen Kletterer nicht auf — er klettert sie. Bei 72
    // faellt er heil, laeuft wieder gegen den Stahl und steigt erneut: Das
    // Level korrigiert sich selbst. Der Kragstein, der das anders loesen
    // wuerde, wird erst in Level 9 vorgestellt.
    hint: 'Stahl hält jedes Werkzeug auf. Über ihn kommt nur, wer klettern kann — und Klettern ist eine Gabe für eine einzige Figur.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 1105,
    entrance: { x: 200, y: 312 },
    exit: { x: 650, y: 346, w: 32, h: 26 },
    total: 10,
    needed: 5,
    timeLimitSec: 150,
    releaseRate: 40,
    minReleaseRate: 25,
    skills: sk({ climber: 9, basher: 2, digger: 2 }),
    // Eine Verteilung von Gaben ist EINE Entscheidung; die Zahl ist die
    // Stueckzahl, nicht der Anspruch (siehe `docs/welt-1-neu.md`, Par-Regel).
    // Gemessen: neun Kletterer, ein Rammer, ein Graeber.
    par: 11,
    paint: [
      { t: 'ground', x: 0, w: 400, y: 372, h: 168, mat: MAT.EARTH, rough: 0 },
      { t: 'rect', x: 400, y: 300, w: 320, h: 240, mat: MAT.EARTH },
      { t: 'rect', x: 400, y: 300, w: 10, h: 72, mat: MAT.STEEL },
      // Oben der Riegel: Auch wer klettern kann, kommt nicht ohne Rammer zur
      // Tuer. Zwei Berufe fuer den Aufstieg, einer fuer die Tuer.
      { t: 'rect', x: 560, y: 240, w: 44, h: 60, mat: MAT.ROCK },
      { t: 'rect', x: 620, y: 332, w: 90, h: 40, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w1-06',
    name: 'Der lange Fall',
    chapter: 'Kniffelig',
    // Lehrt den Schirmspringer — und die Reihenfolge. Hundertzwanzig
    // Bildpunkte ueberlebt nur der Schirm; die Lippe an der Ostkante haelt
    // den Pulk so lange, bis der Spieler selbst oeffnet. Wer zuerst rammt
    // und dann verteilt, verliert die Schirmlosen: Die toedliche Hoehe ist
    // erst nach dem eigenen Handgriff offen.
    //
    // Kein Kletterer im Vorrat — Gesetz dieser Welt: Eine Lippe wendet
    // keinen Kletterer.
    hint: 'Hundertzwanzig hinab überlebt nur, wer einen Schirm hat. Erst verteilen, dann die Kante öffnen — nicht umgekehrt.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 1106,
    entrance: { x: 200, y: 200 },
    exit: { x: 600, y: 354, w: 32, h: 26 },
    total: 12,
    needed: 6,
    timeLimitSec: 150,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ floater: 10, basher: 2, blocker: 2 }),
    // Gemessen: zehn Schirme, ein Waechter, ein Rammer.
    par: 12,
    paint: [
      { t: 'rect', x: 0, y: 260, w: 400, h: 280, mat: MAT.EARTH },
      // Der Westpferch: Ohne Waechter wandert der halbe Pulk hinein,
      // waehrend man Schirme verteilt. Er ist der Grund, warum dieses Level
      // drei Berufe braucht und nicht zwei.
      { t: 'rect', x: 0, y: 260, w: 60, h: 72, mat: MAT.EMPTY },
      // Die Lippe: zwoelf hoch — ueber der Stufenhoehe MAX_STEP 5, unter der
      // Raeumhoehe BASH_UP 12. Genau ein Rammer oeffnet sie.
      { t: 'rect', x: 388, y: 248, w: 12, h: 12, mat: MAT.EARTH },
      { t: 'ground', x: 400, w: 320, y: 380, h: 160, mat: MAT.EARTH, rough: 0 },
    ],
  },
  {
    id: 'w1-07',
    name: 'Die Haarnadel',
    chapter: 'Kniffelig',
    // Lehrt den Schraegbagger — die einzige Verbindung des Spiels, die in
    // BEIDE Richtungen begehbar ist. Der Ansatz steht an der Flanke der
    // Ostwand und ist damit erzwungen, nicht getroffen: Die Wand trichtert
    // den Pulk hinein.
    //
    // Der Stahl unter der Rampe setzt die Tiefe, nicht der Daumen — dort
    // dreht der Bagger um, und dort setzt der Rammer den Stollen an, der
    // unter dem Hinweg zurueck nach Westen laeuft.
    hint: 'Die Schräge ist der einzige Weg, den man in beide Richtungen gehen kann. Setze sie an der Wand an — und unten wartet der Stahl.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 1107,
    entrance: { x: 300, y: 220 },
    exit: { x: 140, y: 398, w: 32, h: 26 },
    total: 20,
    needed: 14,
    timeLimitSec: 180,
    releaseRate: 35,
    minReleaseRate: 20,
    skills: sk({ miner: 2, basher: 3, digger: 3 }),
    par: 3,
    paint: [
      { t: 'ground', x: 0, w: 720, y: 280, h: 260, mat: MAT.EARTH, rough: 0 },
      { t: 'rect', x: 660, y: 180, w: 60, h: 100, mat: MAT.ROCK },
      // Der Stahlriegel: Er stoppt die Schraege auf einer festen Hoehe — der
      // Stahl setzt die Ansatztiefe, nicht der Daumen.
      //
      // Und er reicht bewusst NUR bis x=440, obwohl der Entwurf ihn bis 200
      // laufen liess. Gemessener Befund: Ein Rammer, der AUF Stahl steht,
      // rammt nicht. Sein Raeumstreifen reicht von den Fuessen zwoelf
      // Bildpunkte hinauf, beruehrt also die Oberkante der Platte, unter der
      // er steht — die Stahlpruefung schlaegt an, und er dreht um. Im ersten
      // Messlauf pendelte der ganze Pulk daraufhin zwei Minuten lang die
      // Rampe auf und ab, ohne dass etwas geschah.
      //
      // Westlich von 440 ist die Sohle deshalb gewachsener Boden. Der Rammer
      // steht auf Erde und schlaegt seinen Stollen durch Erde; der Stollen
      // IST der Weg nach Westen.
      { t: 'rect', x: 440, y: 352, w: 80, h: 10, mat: MAT.STEEL },
      { t: 'rect', x: 120, y: 392, w: 100, h: 32, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w1-08',
    name: 'Fünf Sekunden',
    chapter: 'Kniffelig',
    // Lehrt den Sprengmeister — den einzigen Beruf, der die eigene Figur
    // kostet, und deshalb den letzten im Grundkurs. Dieselbe Silhouette wie
    // Level 4, andere Aufgabe: Der Waechter steht diesmal IM WEG. Er haelt
    // den Pulk waehrend des Bauens vom Spalt fern und versperrt danach genau
    // die fertige Bruecke. Die Zuendschnur von fuenf Sekunden IST die Lehre.
    hint: 'Der Wächter hält den Pulk — und steht danach selbst im Weg. Ein Sprengmeister räumt sich selbst aus dem Weg, und seine Zündschnur brennt fünf Sekunden.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 1108,
    entrance: { x: 420, y: 320 },
    exit: { x: 80, y: 354, w: 32, h: 26 },
    total: 20,
    needed: 14,
    timeLimitSec: 150,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ bomber: 3, builder: 5, blocker: 2 }),
    par: 5,
    paint: [
      { t: 'ground', x: 0, w: 720, y: 380, h: 160, mat: MAT.EARTH, rough: 0 },
      { t: 'rect', x: 690, y: 300, w: 30, h: 80, mat: MAT.ROCK },
      { t: 'rect', x: 300, y: 380, w: 36, h: 72, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w1-09',
    name: 'Der Aufstieg',
    chapter: 'Prüfung',
    // Erstes Level der Pruefung und zugleich ein sicherer Sieg: Ab hier kommt
    // kein neuer Beruf mehr, der Empfang ist ein Kompetenzgefuehl.
    //
    // Die Aufgabe ist der Rueckweg. Ein Kletterer kommt hinauf; der ganze
    // Pulk kommt nur nach, wenn er oben eine Schraege bekommt — und deren
    // untere Muendung muss auf der Wartehoehe liegen. Deshalb steht die
    // Ostwand genau 192 Bildpunkte hinter der Kante: 192 Weg sind 96 Tiefe
    // (MINE_DX 2 / MINE_DY 1), und 96 ist genau die Hoehe der Stufe. Der
    // Ansatz ist damit von der Wand gesetzt, nicht vom Daumen getroffen.
    //
    // Der Kragstein ueber der Ostwand wird hier sichtbar eingefuehrt: Eine
    // Lippe wendet keinen Kletterer, ein Kragstein schon. In Level 13 rettet
    // genau dieser Griff Leben.
    //
    // Zwei gemessene Kollisionen aus dem ersten Lauf, beide hier geheilt:
    //
    // 1. Die Schraege braucht die GANZE Breite des Plateaus — 192 Weg fuer 96
    //    Tiefe. Sie zieht also ein Band quer durch den Berg, und in diesem
    //    Band darf keine Kammer liegen. Die Ausgangskammer lag bei y=356 und
    //    damit genau im Band: Der Bagger fiel bei x=626 durch die Kammerdecke
    //    und rettete sich selbst — die Schraege endete im Nichts, der Pulk
    //    stand. Die Kammer liegt jetzt UNTER dem Band, und der Graeber oeffnet
    //    sie von der Schraege aus.
    // 2. Die Stirnwand war 96 hoch und ganz aus Stahl. Der Bagger prueft vier
    //    Bildpunkte voraus ueber die volle Figurenhoehe — er lief also in den
    //    Stahl und drehte ab, ehe die Muendung die Wartewiese erreichte. Die
    //    Wand traegt jetzt 76 Bildpunkte Stahl; die untersten zwanzig sind
    //    gewachsener Fels, und genau dort bricht die Muendung durch. Der
    //    Aufstieg bleibt trotzdem dem Kletterer vorbehalten: 96 Bildpunkte
    //    sind 96 Bildpunkte, und ein Rammer steht in diesem Level nicht zur
    //    Verfuegung.
    hint: 'Hinauf kommt nur der Kletterer. Damit alle nachkommen, braucht es oben eine Schräge — setze sie an der Wand an.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 1109,
    entrance: { x: 200, y: 360 },
    exit: { x: 650, y: 386, w: 32, h: 26 },
    total: 20,
    needed: 14,
    timeLimitSec: 180,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ climber: 3, miner: 2, digger: 2 }),
    par: 3,
    paint: [
      { t: 'ground', x: 0, w: 500, y: 420, h: 120, mat: MAT.EARTH, rough: 0 },
      // Die Stahlsohle unter der Wartewiese: Sie faengt die Schraege ab,
      // damit der Bagger nicht unter dem Pulk weiter in die Tiefe faehrt.
      { t: 'rect', x: 0, y: 432, w: 500, h: 10, mat: MAT.STEEL },
      { t: 'rect', x: 500, y: 324, w: 220, h: 216, mat: MAT.EARTH },
      // Die Stirnwand: 96 hoch, oben Stahl — aber die untersten zwanzig
      // Bildpunkte bleiben Fels, damit die Schraege dort ausmuenden kann.
      { t: 'rect', x: 500, y: 324, w: 10, h: 76, mat: MAT.STEEL },
      { t: 'rect', x: 694, y: 256, w: 26, h: 68, mat: MAT.ROCK },
      { t: 'rect', x: 660, y: 244, w: 34, h: 12, mat: MAT.ROCK },
      // Die Ausgangskammer liegt unter dem Schraegband, nicht darin: Die
      // Sohle der Schraege steht bei x=620 auf y=359, die Decke der Kammer
      // auf 380 — zwanzig Bildpunkte Fels, die der Graeber wegnimmt. Der
      // Sturz in die Kammer misst 52 Bildpunkte und bleibt damit deutlich
      // unter der Todesfallhoehe von 78.
      { t: 'rect', x: 620, y: 380, w: 80, h: 32, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w1-10',
    name: 'Die Galerie',
    chapter: 'Prüfung',
    // Der staerkste Rueckkehrgrund des Genres: Der Spieler sieht das Ziel
    // unter seinen Fuessen und weiss noch nicht, wie er hinkommt. Zwei
    // Arbeitsfronten, die zweite direkt unter der ersten — beide passen ins
    // selbe Lesefenster.
    //
    // Kleiner Pulk mit Absicht: Zehn Figuren, damit die Schirmverteilung
    // eine Entscheidung bleibt und kein Regen wird.
    hint: 'Die Tür liegt unter der Galerie. Hundertzwanzig hinab trägt nur der Schirm — und unten ist der Weg noch verriegelt.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 1110,
    entrance: { x: 200, y: 140 },
    exit: { x: 650, y: 366, w: 32, h: 26 },
    total: 10,
    needed: 6,
    timeLimitSec: 180,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ floater: 10, basher: 3, blocker: 2, digger: 2 }),
    par: 13,
    paint: [
      { t: 'rect', x: 0, y: 200, w: 420, h: 20, mat: MAT.EARTH },
      { t: 'rect', x: 408, y: 188, w: 12, h: 12, mat: MAT.EARTH },
      { t: 'ground', x: 0, w: 720, y: 320, h: 220, mat: MAT.EARTH, rough: 0 },
      { t: 'rect', x: 560, y: 272, w: 44, h: 48, mat: MAT.ROCK },
      { t: 'rect', x: 610, y: 352, w: 100, h: 40, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w1-11',
    name: 'Der Turm',
    chapter: 'Prüfung',
    // Der geborene Hochformat-Baustein: drei Boeden im E72-Takt in einer
    // geschlossenen Schale. Es gibt keine Verlustkante, jeder Absatz faellt
    // frei hinab und sperrt den Rueckweg — Richtung ohne Tod.
    //
    // Jede Etage verlangt eine andere Antwort, und die zweite ist die Pointe:
    // Wer dort senkrecht graebt, steht nach sechs Bildpunkten auf einer
    // Stahlkappe. Die Schraege umgeht sie — nach OSTEN.
    //
    // Drei gemessene Befunde aus dem ersten Lauf:
    //
    // 1. Neunzehn von zwanzig Figuren starben, ehe das Level ueberhaupt
    //    begann: Die Falltuer stand ueber dem Schacht der ersten Etage. Wer
    //    aus der Tuer faellt, hat schon 59 Bildpunkte Fallweg auf dem Zaehler
    //    — trifft er dann den offenen Schacht, kommt er auf 131 und schlaegt
    //    auf. Der Schacht liegt jetzt weit westlich, und unter der Falltuer
    //    liegt ein kurzer Stahlriegel, der genau diesen Griff unmoeglich
    //    macht. Ein Schacht, den der Spieler selbst gegraben hat, darf seinen
    //    Pulk nicht toeten, ohne dass er es kommen sieht.
    // 2. Die Stahlkappe der zweiten Etage endete bei x=279, die Figuren
    //    landeten aber bei x=300 — also NEBEN der Kappe. Die Pointe biss
    //    nicht: Ein senkrechter Schacht am Landeplatz loeste die Etage, die
    //    Schraege war ueberfluessig. Die Kappe reicht jetzt ueber die ganze
    //    begehbare Strecke, von der Westwand bis an den Pfeiler.
    // 3. Dass die Kappe das kann, liegt an der Richtung der Schraege. Ein
    //    Bagger prueft vier Bildpunkte voraus ueber die volle Figurenhoehe;
    //    eine Schraege nach WESTEN taucht deshalb 58 Bildpunkte weit in die
    //    Kappe hinein, ehe sie unter ihr durch waere — sie kann eine
    //    durchgehende Kappe niemals unterlaufen. Nach OSTEN laeuft sie von
    //    der Kappe weg und ist ab dem ersten Schlag frei. Der Pfeiler steht
    //    genau am Ostende der Kappe: Er wendet den Pulk und setzt damit den
    //    Ansatz der Schraege, ohne dass der Daumen zielen muesste.
    hint: 'Drei Böden, drei Antworten. Auf der mittleren Etage liegt Stahl unter dem naheliegenden Punkt — die Schräge geht ostwärts an ihm vorbei.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 1111,
    entrance: { x: 300, y: 120 },
    exit: { x: 540, y: 370, w: 32, h: 26 },
    total: 20,
    needed: 14,
    timeLimitSec: 200,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ digger: 3, miner: 2, basher: 2 }),
    par: 4,
    paint: [
      { t: 'rect', x: 40, y: 140, w: 20, h: 260, mat: MAT.ROCK },
      { t: 'rect', x: 660, y: 140, w: 20, h: 260, mat: MAT.ROCK },
      { t: 'rect', x: 60, y: 180, w: 600, h: 36, mat: MAT.EARTH },
      { t: 'rect', x: 60, y: 252, w: 600, h: 36, mat: MAT.EARTH },
      { t: 'rect', x: 60, y: 324, w: 600, h: 36, mat: MAT.EARTH },
      { t: 'ground', x: 0, w: 720, y: 396, h: 144, mat: MAT.EARTH, rough: 0 },
      // Der Riegel unter der Falltuer: Er verbietet den einen Griff, der den
      // ganzen Pulk kostet — den Schacht unter dem eigenen Eingang.
      { t: 'rect', x: 286, y: 186, w: 28, h: 10, mat: MAT.STEEL },
      // Die Stahlkappe der zweiten Etage. Sie reicht von der Westwand bis an
      // den Pfeiler und deckt damit JEDEN Punkt, den der Pulk dort betreten
      // kann — sonst waere die Schraege nur eine Zierde.
      { t: 'rect', x: 60, y: 258, w: 280, h: 10, mat: MAT.STEEL },
      // Die Wand, an der die Schraege angesetzt wird.
      { t: 'rect', x: 340, y: 216, w: 20, h: 36, mat: MAT.ROCK },
      // Die Kappe der dritten Etage: Sie deckt die Landestelle ab, damit die
      // Rippe wirklich trennt. Ohne sie graebt man westlich der Rippe hinab,
      // laeuft unten bequem nach Osten — und der Rammer ist ueberfluessig.
      { t: 'rect', x: 60, y: 330, w: 370, h: 10, mat: MAT.STEEL },
      // Die Rippe der dritten Etage: Sie trennt die Landestelle vom einzigen
      // offenen Grabpunkt.
      { t: 'rect', x: 430, y: 288, w: 40, h: 36, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w1-12',
    name: 'Die Treppe',
    chapter: 'Prüfung',
    // Der Durchatmer vor dem Doppelfinale: bekannte Bausteine in neuer
    // Silhouette. Vier Absaetze nach Osten, und vor dem Spalt eine Lippe —
    // der Pulk pendelt auf dem zweiten Absatz zwischen ihr und der Stufe,
    // die er nicht mehr hinaufkommt. Nichtstun verliert keine einzige Figur,
    // und zwar dauerhaft.
    hint: 'Vier Absätze nach Osten. Die Lippe hält den Pulk, bis du sie öffnest — und über den Spalt tragen drei Brückenbauer.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 1112,
    entrance: { x: 100, y: 120 },
    exit: { x: 560, y: 346, w: 32, h: 26 },
    total: 18,
    // Gemessen: Die Musterloesung verliert drei Figuren, und zwar
    // unvermeidlich. Wer eine Bruecke baut, ist viermal langsamer als ein
    // Laeufer — der Pulk ueberholt den Bauer und tritt am unfertigen Ende
    // ins Leere. Genau dagegen liegen zwei Blocker im Kasten, die die
    // Musterloesung NICHT braucht: Wer sie einsetzt, rettet alle und zahlt
    // dafuer einen Zug ueber Par. Das ist der Handel, nicht die Strafe.
    needed: 11,
    timeLimitSec: 180,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ builder: 5, basher: 3, blocker: 2, digger: 2 }),
    par: 5,
    paint: [
      // Der erste Absatz reicht bis auf die Hoehe des zweiten hinab, ist
      // also eine echte Stufe und keine schwebende Platte. Gemessener Grund:
      // Eine Figur setzt beim Laufen ERST den Fuss auf das Nachbarfeld und
      // faellt DANN — die Westkante des zweiten Absatzes war damit ein
      // offener Abgrund, und sechzehn von sechzehn Figuren gingen dort
      // verloren, ehe das Level ueberhaupt begann.
      { t: 'rect', x: 0, y: 180, w: 200, h: 72, mat: MAT.EARTH },
      { t: 'rect', x: 200, y: 228, w: 140, h: 24, mat: MAT.EARTH },
      { t: 'rect', x: 328, y: 216, w: 12, h: 12, mat: MAT.EARTH },
      { t: 'rect', x: 340, y: 300, w: 36, h: 240, mat: MAT.EARTH },
      { t: 'rect', x: 376, y: 228, w: 124, h: 24, mat: MAT.EARTH },
      // Dieselbe Lippe noch zweimal, und zwar aus Notwehr: Jede Platte, die
      // der Pulk betritt, braucht an ihrer Westkante etwas, das ihn wendet.
      // Sonst laeuft er dort hinaus — die Bruecke traegt ihn nur nach Osten,
      // zurueck kommt er nicht. Die Bruecke selbst laeuft ueber beide Lippen
      // hinweg; sie stoeren den Bauer also nicht, sie fangen nur die auf, die
      // von der Bruecke heruntersteigen.
      { t: 'rect', x: 376, y: 216, w: 12, h: 12, mat: MAT.EARTH },
      { t: 'rect', x: 480, y: 300, w: 210, h: 240, mat: MAT.EARTH },
      { t: 'rect', x: 480, y: 288, w: 20, h: 12, mat: MAT.EARTH },
      { t: 'rect', x: 690, y: 220, w: 30, h: 80, mat: MAT.ROCK },
      { t: 'rect', x: 520, y: 332, w: 100, h: 40, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w1-13',
    name: 'Der Pfeiler',
    chapter: 'Prüfung',
    // Die Abfrage des Kragsteins. Der Pfeiler ist sechsundneunzig hoch: Nur
    // der Kletterer kommt hinauf, und oben rettet der Kragstein sein Leben —
    // ohne ihn liefe der erste Kletterer nach Osten und faellt.
    //
    // Die urspruenglich vorgeschlagene Pointe „der erste Kletterer wird oben
    // zum Gelaender-Blocker" ist gestrichen: Sie toetet ihn im ersten
    // Versuch planmaessig, und das verletzt die Sackgassen-Regel.
    hint: 'Der Pfeiler ist zu hoch für alles ausser dem Kletterer. Oben hält der Vorsprung ihn auf — vor dem Pfeiler liegt erst noch ein Spalt.',
    theme: 'grass',
    width: 720,
    height: 540,
    seed: 1113,
    entrance: { x: 200, y: 380 },
    exit: { x: 500, y: 378, w: 32, h: 26 },
    total: 12,
    needed: 6,
    timeLimitSec: 200,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ climber: 10, builder: 5, basher: 2, digger: 2 }),
    par: 14,
    paint: [
      { t: 'ground', x: 0, w: 720, y: 440, h: 100, mat: MAT.EARTH, rough: 0 },
      { t: 'rect', x: 700, y: 360, w: 20, h: 80, mat: MAT.ROCK },
      // Sechsundfuenfzig tief, nicht zweiundsiebzig. Gemessen: Wer waehrend
      // des Brueckenbaus vom unfertigen Ende tritt, faellt nicht von der
      // Wiese, sondern von der Rampe — bei h=72 waren das 82 Bildpunkte und
      // damit toedlich. Der Spalt haelt fest, wen er faengt; toeten muss er
      // dafuer niemanden.
      { t: 'rect', x: 420, y: 440, w: 36, h: 56, mat: MAT.EMPTY },
      { t: 'rect', x: 408, y: 428, w: 12, h: 12, mat: MAT.EARTH },
      { t: 'rect', x: 480, y: 344, w: 120, h: 196, mat: MAT.ROCK },
      // Der Erddeckel auf der Kuppe — der einzige grabbare Fleck des
      // Pfeilers.
      { t: 'rect', x: 480, y: 344, w: 120, h: 32, mat: MAT.EARTH },
      { t: 'rect', x: 470, y: 376, w: 110, h: 28, mat: MAT.EMPTY },
      { t: 'rect', x: 584, y: 308, w: 16, h: 36, mat: MAT.ROCK },
      { t: 'rect', x: 560, y: 296, w: 24, h: 12, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w1-14',
    name: 'Prüfung im Grasland',
    chapter: 'Prüfung',
    // Drei Knoten, jeder fuer sich in einem Lesefenster: Wende und Riegel,
    // Spalt, Stahldeckel. Kein Schritt ist toedlich, jeder ist binnen
    // dreizehn Sekunden als richtig oder falsch zu sehen.
    //
    // Die einzige Ausnahme von der 720er-Normbreite dieser Welt — eine
    // Pruefung darf einmal weiter blicken als jedes Lehrstueck.
    hint: 'Riegel, Spalt, Stahldeckel — drei Knoten nach Westen. Über dem Ausgang liegt Stahl; unter ihm führt nur die Schräge hindurch.',
    theme: 'grass',
    width: 960,
    height: 540,
    seed: 1114,
    entrance: { x: 560, y: 280 },
    exit: { x: 40, y: 378, w: 32, h: 26 },
    total: 20,
    needed: 11,
    // Marge 3 gemessen: Die Bruecke kostet sechs Figuren an den Spalt.
    timeLimitSec: 240,
    releaseRate: 30,
    minReleaseRate: 20,
    skills: sk({ blocker: 2, builder: 5, miner: 2, basher: 3 }),
    par: 5,
    paint: [
      { t: 'ground', x: 0, w: 960, y: 340, h: 200, mat: MAT.EARTH, rough: 0 },
      { t: 'rect', x: 920, y: 260, w: 40, h: 80, mat: MAT.ROCK },
      // Knoten 1: der Riegel nach Westen.
      { t: 'rect', x: 300, y: 280, w: 44, h: 60, mat: MAT.ROCK },
      // Knoten 2: der Normspalt — VIERZIG tief, nicht zweiundsiebzig.
      //
      // Gemessen und dreimal umgebaut. Der Spalt kostet Figuren, und zwar
      // unvermeidlich: Ein Laeufer ist viermal schneller als ein Bauer,
      // ueberholt ihn auf der eigenen Bruecke und tritt an deren unfertigem
      // Ende ins Leere. Eine Lippe davor hilft NICHT — sie haelt den Pulk
      // nur, bis die Rampe zwoelf Bildpunkte hoch ist, und laesst ihn dann
      // aus groesserer Hoehe fallen; im Versuch starben daran zwanzig von
      // zwanzig statt sechs. Ein Blocker hilft auch nicht: Er steht fuer
      // immer, und dieses Level hat nur einen Gang.
      //
      // Also bleibt der Spalt offen und wird stattdessen flach genug, dass
      // der Sturz von der hoechsten Stelle der Bruecke (y=307) auf seiner
      // Sohle (y=379) 72 Bildpunkte misst — sechs unter der Todesgrenze.
      // Wer hineinfaellt, ist nicht gerettet, aber er lebt. Genau das meint
      // der Kopfsatz dieses Levels: „Kein Schritt ist toedlich."
      { t: 'rect', x: 224, y: 340, w: 36, h: 40, mat: MAT.EMPTY },
      // Knoten 3: der Stahldeckel ueber der Tuer — und die Wand, an der die
      // Schraege angesetzt wird.
      { t: 'rect', x: 196, y: 280, w: 20, h: 60, mat: MAT.ROCK },
      // Der Deckel liegt ueber der TUER, nicht ueber dem Anmarsch. Gemessen:
      // Bei einer Breite von 140 stand er der eigenen Loesung im Weg. Ein
      // Bagger prueft nicht nur vor sich, sondern elf Bildpunkte ueber
      // seinen Fuessen mit; seine Schraege lief geometrisch sauber unter dem
      // Deckel durch, seine Fuehlerspitze aber stiess bei x=142 an dessen
      // Unterkante, und er drehte ab — vier Bildpunkte vor dem Durchbruch in
      // die Kammer. Ein Stahldeckel sperrt also nicht seine eigene Dicke,
      // sondern zwoelf Bildpunkte darunter gleich mit.
      { t: 'rect', x: 0, y: 366, w: 100, h: 10, mat: MAT.STEEL },
      { t: 'rect', x: 0, y: 404, w: 150, h: 10, mat: MAT.STEEL },
      { t: 'rect', x: 0, y: 380, w: 150, h: 24, mat: MAT.EMPTY },
    ],
  },
];
