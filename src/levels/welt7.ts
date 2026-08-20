import { MAT, SKILLS, type SkillCounts } from '../core/types';
import type { LevelDef } from './types';

function sk(partial: Partial<SkillCounts>): SkillCounts {
  const out = {} as SkillCounts;
  for (const s of SKILLS) out[s] = partial[s] ?? 0;
  return out;
}

/**
 * Welt 7 — die Wipfelweide.
 *
 * „Ein Wald von oben. Der Boden ist weit unten, und die Äste sind die
 * Straßen." (`welten.ts`). Siebzehn Level sind geplant; gebaut und
 * ausgemessen sind bisher die ersten zwei. Der Rest steht als abgenommener
 * Entwurf in `docs/welt-6-7-konzept.md` und wird Level fuer Level
 * nachgezogen, jedes mit eigener Messrunde.
 *
 * ## Der Satz, der diese Welt von allen anderen trennt
 *
 * **Was ueber dir liegt, ist auch ein Boden — und es ist das, was dich
 * aufhaelt.** Der Sonnenhang ging ausschliesslich hinab; die Wipfelweide geht
 * ausschliesslich hinauf, und ihr Gegner ist die DECKE. Sie verbietet die
 * Bruecke und sie kippt den Kletterer.
 *
 * STEEL heisst hier KERNHOLZ: dieselbe Haerte wie der Findling der anderen
 * Welten, aber warm und geadert statt kalt und glatt. Wo in Welt 6 ein
 * Findlingsdeckel schuetzte, schuetzt hier ein Kernholzbrett.
 *
 * ## Die Entwurfsregeln dieser Welt
 *
 * 1. **Jede Decke ist angekuendigt.** Wo etwas von oben aufhaelt, sieht man
 *    es im Startbild — als Brett, als Hut, als Blaetterdach. Eine Decke, die
 *    man erst bemerkt, wenn eine Figur dagegenstoesst, waere eine Falle.
 * 2. **Der Kopfstoss kostet nie ein Leben.** Ein Kletterer, den die Decke
 *    kippt, faellt heil zurueck und behaelt seine Gabe. Er hat Zeit verloren,
 *    mehr nicht — und genau das ist die Lehre.
 * 3. **Ein Bauer unter einer Decke baut eine WAND.** Gemessen in w7-01:
 *    Solange weniger als 24 Bildpunkte Luft ueber der Sohle stehen (Koerper
 *    12 + Bauerhub 12), endet die Rampe als Stumpf, an dem auch ein
 *    Kletterer scheitert. Wer den Bauer als verlustfreien Koeder auslegen
 *    will, braucht deshalb MEHR als 24 px Luft, nicht weniger.
 * 4. **Nach oben raeumt nur die Sprengung.** Rammer und Bagger arbeiten
 *    waagerecht und schraeg hinab; der Krater ist das einzige Werkzeug, das
 *    Material ueber dem Kopf wegnimmt. Das ist der Leitbaustein B7.
 */
export const WELT7_LEVELS: LevelDef[] = [
  {
    id: 'w7-01',
    name: 'Der hohle Stamm',
    chapter: 'Laubdach',
    // Der erste Satz der Wipfelweide, und er wird nicht gesagt, sondern
    // gelaufen: Der Pulk faellt auf das Kernholz-Vordach und geht OBEN
    // darauf nach Osten, bis er ueber dessen Kante 48 auf die Waldsohle
    // faellt. Dasselbe Brett, das eben noch Boden war, ist von unten eine
    // DECKE — das Weltziel in einem einzigen Weg. Ab hier gilt: Was ueber
    // dir liegt, ist auch ein Boden, und es ist das, was dich aufhaelt.
    //
    // Drei Ebenen: Vordach (y432), Waldsohle (y480), Krone (y216) mit dem
    // Ostast (y264), auf dem die Tuer steht. STEEL heisst in dieser Welt
    // KERNHOLZ — dieselbe Haerte, aber warm und geadert.
    //
    // ## Der angekuendigte Koeder — nachgemessen, und der Entwurf lag falsch
    //
    // Unter dem Vordach stehen 36 Bildpunkte Luft. Ein Bauer setzt dort
    // ALLE ZWOELF Steine (gemessen, in beide Richtungen), hebt damit 12 px
    // auf 24 px Weite, steht am Ende volle 24 Bildpunkte unter dem
    // Kernholz und laeuft ueber das Ende seiner eigenen Rampe die zwoelf
    // wieder hinab. Er stirbt nicht, er bleibt nicht haengen, seine Rampe
    // sperrt niemanden aus. Kosten: ein Werkzeug, sonst nichts.
    //
    // Der Entwurf wollte 12 px Luft — "nach einem einzigen Stein stoesst
    // die Bruecke an die Decke". Das stimmt (ein Stein, gemessen), und
    // genau so wird der Koeder zur FALLE:
    //
    // EIN BAUER UNTER EINER DECKE BAUT EINE WAND, solange weniger als 24
    // Bildpunkte Luft ueber der Sohle stehen — und diese Wand nimmt auch
    // kein Kletterer. Gemessen im Labor: 12 px Luft -> 1 Stein, 13 -> 2,
    // 20 -> 9, 23 -> 12 Steine samt sichtbarem Kopfstoss; in allen vier
    // Faellen enden Laeufer UND Kletterer vor dem Stumpf. Erst ab 24 px
    // (Koerper 12 + Bauerhub 12) ist die Rampe ein Weg statt eines
    // Riegels. Der Kopfstoss und der verlustfreie Koeder schliessen
    // einander also aus; die Welt bekommt ihren Kopfstoss vom Kletterer
    // (unten) und ihre 36 px Luft vom Bauer.
    //
    // ## Der zweite Koeder: die Decke kippt den Kletterer (B7)
    //
    // Wer seine Gabe bekommt und nach WESTEN laeuft, trifft den
    // Kernholzpfeiler, der das Vordach traegt. Er steigt 24 Bildpunkte,
    // stoesst mit dem Kopf an das Vordach, kippt, faellt die 24 heil
    // zurueck und geht ostwaerts weiter zum Stamm (gemessen: steigt 24,
    // faellt 24, wird gerettet). Ein Fehltipp kostet Zeit, nie ein Leben.
    //
    // ## Was die Messung sonst noch gegen den Entwurf entschieden hat
    //
    // Krone -> Ostast misst 48 und nicht die entworfenen 72. Grund: Ein
    // Bauer auf der Krone hebt die Kante um 12, und 72 + 12 = 84 liegt
    // ueber FALL_DEATH_PX (78) — jede Figur, die dann ostwaerts ueber die
    // Rampe liefe, waere tot. Mit 48 traegt selbst eine Zweierkette (48 +
    // 24 = 72) noch. Groesster Sturz in 100 Zufallslaeufen: 60.
    //
    // Der Stamm ist innen hohl gemalt, aber RINGSUM geschlossen. Eine
    // Oeffnung im Fuss haette den Pulk in die Hoehle statt an die
    // Kletterwand gefuehrt — der hohle Stamm ist ein Bild, kein Gang.
    //
    // Messbefund: 12 von 12 gerettet (Marge 4), 0 Tote, 12 Zuege = Par,
    // Quote nach 46,2 s, letzte Rettung 53,9 s, Uhr 76 s = Faktor 1,41.
    // 100 Zufallslaeufe mit wahllos verteilten Berufen: 0 Tote, 100 Siege,
    // schlechtester Lauf 11 Gerettete. Der leere Plan verliert, der reine
    // Bauer-Plan verliert — und beide ohne einen einzigen Toten.
    hint: 'Über euch liegt Kernholz — dagegen trägt keine Brücke an. Der Stamm hat eine freie Krone: wer klettert, kommt hinauf.',
    theme: 'wipfel',
    width: 720,
    height: 540,
    seed: 71001,
    // Die Falltuer haengt ueber dem Vordach: Die ersten 48 fallen auf das
    // Brett, die zweiten 48 ueber seine Ostkante auf die Sohle.
    entrance: { x: 400, y: 383 },
    exit: { x: 632, y: 238, w: 32, h: 26 },
    total: 12,
    needed: 8,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (53,9 s).
    timeLimitSec: 76,
    releaseRate: 45,
    minReleaseRate: 20,
    // Zwei Knopfarten, beide aus Welt 1 bekannt. Der Kletterer traegt das
    // Level (je eine Gabe je Figur), der Bauer ist der Koeder — zwei
    // Stueck, damit man ihn zweimal ausprobieren darf.
    skills: sk({ climber: 12, builder: 2 }),
    par: 12,
    paint: [
      // Die Waldsohle. rough 0, weil die Deckenhoehe darueber eine
      // gemessene Zahl ist: Ein Huckel waere ein Rechenfehler.
      { t: 'ground', x: 0, w: 568, y: 480, h: 60, mat: MAT.EARTH, rough: 0 },
      // Der Stamm mit der freien Krone bei y216 — 264 Bildpunkte
      // Kletterwand, der einzige Weg dieser Welt nach oben.
      { t: 'rect', x: 540, y: 216, w: 27, h: 264, mat: MAT.ROCK },
      // Die Hoehle im Stamm: sichtbar, geschlossen, unbetretbar.
      { t: 'rect', x: 547, y: 300, w: 13, h: 172, mat: MAT.EMPTY },
      // Der Ostast, 48 unter der Krone, mit der Tuer. Er reicht bis an die
      // Weltkante, damit niemand ueber sein Ostende hinaus laeuft.
      { t: 'rect', x: 567, y: 264, w: 153, h: 16, mat: MAT.ROCK },
      // Kernholz zuletzt (Malreihenfolge): das Vordach, 12 dick, mit 36
      // Bildpunkten Luft ueber der Sohle — und sein Pfeiler, der den
      // Korridor nach Westen schliesst und den Kletterer kippt.
      { t: 'rect', x: 0, y: 432, w: 500, h: 12, mat: MAT.STEEL },
      { t: 'rect', x: 330, y: 444, w: 16, h: 36, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w7-02',
    name: 'Der Zwillingsstamm',
    chapter: 'Laubdach',
    // Dieselbe Lehre wie in Level 1, jetzt als Lesefrage. Zwei gleich hohe
    // Staemme stehen auf der Waldsohle (y480), der Pulk faellt ZWISCHEN sie,
    // und nur einer traegt hinauf: Der westliche (x300-326) haelt achtzig
    // Bildpunkte ueber dem Boden einen Kernholzhut (y400, 8 dick), der nach
    // beiden Seiten vierzig Bildpunkte ueber die Kletterflanken ragt; der
    // oestliche (x480-506) ist bis zur Krone (y240) glatt und traegt ueber
    // seinen Ostast (y312) die Tuer. Wer den falschen klettert, stoesst mit
    // dem Kopf an, kippt, faellt heil zurueck — und steht danach mit dem
    // Ruecken zum Hut, laeuft also von selbst zum richtigen Stamm. Ein
    // Fehlklettern kostet Zeit, nie eine Figur.
    //
    // ## Was die Messung gegen den Entwurf entschieden hat
    //
    // 1. DEN SCHATTEN GIBT ES NICHT. Der Entwurf versprach, „nur der falsche
    //    Stamm wirft einen Schatten auf sich selbst". Im gebauten Bild
    //    stimmt das nicht: Das Licht der Wipfelweide steht hoch und mittig
    //    (`scene.ts`, sonnePos = W*0.5), und das Terrain kennt ueberhaupt
    //    keinen geworfenen Schatten — nur eine dunkle Konturlinie an jeder
    //    Luftkante, einen Lichtsaum obenauf und -38 an jeder Unterkante
    //    (`terrainView.ts`). Die Marke ist deshalb MATERIAL UND UMRISS: Der
    //    Hut ist Kernholz (MAT.STEEL, kuehles Plattengrau gegen das warme
    //    Rindenbraun des Stammes), er springt beidseits vierzig Bildpunkte
    //    aus der Stammlinie heraus, und seine Unterkante traegt die
    //    dunkelste Linie des Startbilds — genau dort, wo der Kopf anstoesst.
    //    Ein Rateraetsel bleibt es damit nicht.
    // 2. DER HUT UEBERHAENGT NACH BEIDEN SEITEN, und der Pulk wartet
    //    zwischen den Staemmen. Der Entwurf liess ihn nur nach Westen ragen
    //    und den Pulk westlich des ersten Stammes warten — dort steht der
    //    Pulk aber in einem Pferch, den nichts verlaesst: Beide Staemme sind
    //    Waende, und der Ostast liegt hinter beiden. Die Kletterflanken, die
    //    der Pulk erreicht, sind jetzt die Ostflanke des falschen (x327) und
    //    die Westflanke des echten Stammes (x479).
    // 3. GEMESSEN, NICHT ANGENOMMEN: `stepClimbing` prueft `solid(x, y-12)`.
    //    Die Hutunterkante liegt bei y407, der Kletterer kippt also bei
    //    Fusshoehe y419, dreht dabei die Richtung um und faellt 61 auf die
    //    Sohle — weit unter der Sturzgrenze 78, und die Kletterergabe bleibt.
    //    Der Umweg kostet rund achtzehn Sekunden: Ein Lauf, in dem JEDER
    //    Kletterer zuerst den falschen Stamm nimmt, rettet acht statt neun
    //    und braucht fuer die sechste Rettung 58,4 s statt 39,8 s — er
    //    gewinnt noch, aber man sieht den Preis.
    // 4. DIE FALLTUER STEHT MIT ABSICHT NEBEN DEM OSTSTAMM (x452). Im ersten
    //    Wurf hing sie mittig zwischen den Staemmen, und ein Waechter, den
    //    der Spieler an der falschen Flanke setzte, sperrte den Pulk vom
    //    echten Stamm ab: 0 von 10, ohne einen Toten und ohne Rueckweg. Jetzt
    //    liegt der Landeplatz an der richtigen Wand — dieselbe Fehlgabe
    //    gemessen: 9 gerettet, 45,6 s, kein Unterschied.
    // 5. DER KERNHOLZKNOTEN AUF DER KRONE IST DIE LEITPLANKE, NICHT DER
    //    SCHMUCK. Gezielt gemessen: Steht droben ein Waechter, wird der
    //    nachrueckende Kletterer nach Westen gewendet — ohne Knoten faellt er
    //    241 vom Westrand der Krone und stirbt (SPLAT), mit Knoten wird er
    //    gerettet. Der 12 px hohe Astknoten traegt eine Kernholzkappe (y220,
    //    8 dick, 12 px nach Osten ueberhaengend): Wer oben nach Westen
    //    laeuft, klettert den Knoten an, kippt an der Kappe mit Sturzhoehe
    //    NULL und geht ostwaerts weiter. Dieselbe Lehre, jetzt als Schutz.
    // 6. Der Weg des Kletterers, Tick fuer Tick nachgefahren: Wand bei x479,
    //    Klettern bis y231, Hochziehen auf die Kappe (y219), 20 px hinab auf
    //    die Krone (y239), an ihrem Ostrand 72 frei auf den Ostast (y311) —
    //    die Hausnummer der Welt und die einzige Fallhoehe des Levels.
    //
    // ## Zahlen
    //
    // Musterloesung (ein Waechter, neun Kletterer): 9 von 10 gerettet, kein
    // Toter, 10 Zuege, letzte Rettung 45,6 s. Marge 3, Uhr 64 s = 1,40 x.
    // Der leere Plan verliert mit 0 Geretteten, und niemand stirbt dabei.
    // 100 Zufallslaeufe mit wahllos verteilten Berufen: kein Toter,
    // groesster Sturz der ganzen Karte 72, zwei Zufallssiege.
    // Der Waechter kostet keine Sekunde (mit ihm 45,6 s, ohne ihn 45,6 s) —
    // er kauft Lesezeit, nicht Tempo: Mit ihm darf jeder Tipp fallen, ohne
    // dass man auf die Laufrichtung schaut.
    hint: 'Zwei Stämme, und nur einer trägt hinauf: Der Kernholzhut ragt über die Seite, an der geklettert wird — dort stößt der Kopf an, und der Kletterer kippt heil zurück.',
    theme: 'wipfel',
    width: 720,
    height: 540,
    seed: 71002,
    // Neben dem Oststamm, nicht in der Mitte: siehe Befund 4.
    entrance: { x: 452, y: 420 },
    exit: { x: 596, y: 286, w: 32, h: 26 },
    total: 10,
    needed: 6,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (45,6 s).
    timeLimitSec: 64,
    releaseRate: 45,
    minReleaseRate: 20,
    // Kletterer im Ueberschuss, weil Fehlklettern nur Zeit kostet; zwei
    // Waechter, damit ein verschenkter nicht das Haltemittel frisst.
    skills: sk({ climber: 12, blocker: 2 }),
    par: 10,
    paint: [
      // Das Blaetterdach — die Decke dieser Welt, und der Grund, warum der
      // Blick nach oben endet.
      { t: 'rect', x: 0, y: 48, w: 720, h: 16, mat: MAT.ROCK },
      // Der falsche Zwilling. Gleich hoch wie sein Bruder; der Unterschied
      // haengt achtzig Bildpunkte ueber dem Pulk.
      { t: 'rect', x: 300, y: 240, w: 27, h: 240, mat: MAT.ROCK },
      // Der echte Zwilling mit freier Krone bei y240.
      { t: 'rect', x: 480, y: 240, w: 27, h: 240, mat: MAT.ROCK },
      // Der Ostast mit der Tuer. rough 0, damit die 72 von der Krone exakt
      // 72 bleiben — der Stamm selbst sperrt sein Westende, also gibt es auf
      // dem Ast keine Verlustkante.
      { t: 'ground', x: 507, w: 213, y: 312, h: 20, mat: MAT.EARTH, rough: 0 },
      // Der Astknoten am Westrand der Krone (Befund 5).
      { t: 'rect', x: 480, y: 228, w: 8, h: 12, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 720, y: 480, h: 60, mat: MAT.EARTH, rough: 1 },
      // ZULETZT das Kernholz: der Hut des falschen Zwillings und die Kappe
      // auf dem Kronenknoten. Wer die Reihenfolge dreht, uebermalt beide.
      { t: 'rect', x: 260, y: 400, w: 107, h: 8, mat: MAT.STEEL },
      { t: 'rect', x: 480, y: 220, w: 20, h: 8, mat: MAT.STEEL },
    ],
  },
];
