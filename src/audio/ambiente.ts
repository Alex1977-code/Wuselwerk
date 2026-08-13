import type { ThemeId } from '../levels/types';
import type { AudioEngine } from './engine';

/**
 * Umgebungsbett — der Raum, in dem das Spiel steht.
 *
 * ## Wofuer das gut ist
 *
 * Musik sagt, wie eine Welt gemeint ist; das Umgebungsbett sagt, **wo** man
 * ist. Ohne dieses Bett steht die Musik im luftleeren Raum und jede Pause
 * zwischen zwei Toenen ist ein Loch. Mit ihm klingt auch die Stille nach
 * Wiese oder nach Hoehle. Der Preis dafuer ist, dass man es nicht bemerken
 * darf: Ein Umgebungsbett, das auffaellt, hat versagt.
 *
 * ## Warum synthetisiert statt geloopt
 *
 * Zwei Gruende, und der zweite ist der wichtigere.
 *
 * 1. Der Prototyp laedt nichts nach — sonst zerfaellt die einzelne HTML-Datei,
 *    die man ohne Server aufs Handy bekommt. Das gilt hier wie im Rest von
 *    `audio/`.
 * 2. **Jede Schleife verraet sich.** Eine geloopte Windspur von zehn Sekunden
 *    ist nach der dritten Runde erkannt, und ab da hoert man nur noch den
 *    Schnittpunkt. Man kann die Schleife verlaengern, aber nicht abschaffen.
 *    Was hier steht, hat gar keine Periode: Jede Boee, jeder Ruf, jeder
 *    Tropfen wird einzeln in die Zukunft geplant, mit gewuerfeltem Zeitpunkt,
 *    gewuerfelter Tonhoehe und gewuerfelter Staerke. Das Ergebnis ist der
 *    "saubere Loop", den die Vorgabe meint — nur ohne Nahtstelle.
 *
 * Der Bauplan ist derselbe wie in `music.ts`: `update()` laeuft einmal pro
 * Bild und plant einen Vorlauf (`LOOKAHEAD`) voraus. Kein `setTimeout`, keine
 * Rueckrufe — die Klanguhr des Browsers ist die einzige Zeitquelle, die nicht
 * ruckelt, wenn das Bild einmal haengt.
 *
 * ## Wiederholung, und wie sie hier verhindert wird
 *
 * Der sicherste Weg, ein Bett hoerbar zu machen, ist ein Muster: Ein Vogelruf
 * alle vier Sekunden auf demselben Ton ist nach einer Minute eine Folter,
 * weil das Ohr Regelmaessigkeit findet, ob man will oder nicht. Deshalb wird
 * an jedem Einsatz gestreut, und zwar in fuenf Groessen gleichzeitig:
 * Zeitpunkt, Tonhoehe, Staerke, Laenge und Rutschrichtung. Dazu kommt, dass
 * jede Schicht ihre eigene, ebenfalls gewuerfelte Kadenz hat — Wind alle zwei
 * Sekunden, Voegel alle acht, Liegeton alle fuenf. Nichts davon rastet je
 * gemeinsam ein, es gibt also keine gemeinsame Periode, die man lernen
 * koennte.
 *
 * Gewuerfelt wird reichlich, aber **nur im Klang**. Nichts aus dieser Datei
 * fliesst in den Spielzustand zurueck: Es gibt keinen Rueckgabewert, der von
 * `Math.random()` abhaengt, und kein Feld, das jemand ausserhalb lesen koennte
 * ausser `state`, das nur Zaehler und Schalter zeigt. Die Simulation bleibt
 * deterministisch.
 *
 * ## Pegel
 *
 * Zum Vergleich die Musik (`music.ts`): Melodie 0,145 — Bass 0,24 — Harmonie
 * 0,055. Die Dauerschichten hier stehen bei 0,012 bis 0,020, also **17 bis
 * 22 dB unter der Melodie**; die kurzen Ereignisse (Vogel, Tropfen) bei 0,016
 * bis 0,028, **14 bis 19 dB** darunter; der Ausgangsschimmer bei 0,005 bis
 * 0,013, **21 bis 29 dB** darunter. Dass die kurzen Ereignisse hoeher stehen
 * duerfen, ist kein Widerspruch: Ein Tropfen von 60 ms wirkt bei gleichem
 * Zahlenwert viel leiser als eine Flaeche von vier Sekunden, weil das Ohr
 * ueber etwa 200 ms mittelt. Und so weit herunter muss es, weil ein Bett
 * seinen Zweck genau dann erfuellt, wenn man es erst vermisst, wenn es fehlt
 * — alles darueber ist eine zweite Stimme, die mit der Musik konkurriert.
 *
 * ## Bus und Stimmenbegrenzung
 *
 * Alles laeuft ueber den Bus `music`, denn es gehoert zum Bett und nicht zu
 * den Ereignissen: Damit geht es durch das Ducken und durch den
 * Pausen-Tiefpass — das Bett tritt mit der Musik zurueck, wenn ein
 * Spielgeraeusch Platz braucht, und rueckt in der Pause mit ihr weg.
 *
 * Dazu jede Stimme mit `ignoreLimit: true`. Die Begrenzung auf sechs Stimmen
 * pro Bild ist dafuer da, dass sechzig gleichzeitig grabende Figuren nicht
 * uebersteuern — sie schuetzt vor einer Spitze, die aus dem Spielgeschehen
 * kommt. Das Bett erzeugt ein bis zwei Stimmen pro Sekunde und ist an dieser
 * Spitze unschuldig. Faellt es unter Last trotzdem aus, verschwindet der Raum
 * genau in dem Moment, in dem am meisten los ist — und ein Bett mit Loechern
 * faellt weit mehr auf als eines, das durchlaeuft. `ignoreLimit` nimmt den
 * Spielgeraeuschen auch nichts weg: Diese Stimmen zaehlen im Kontingent gar
 * nicht erst mit.
 */

/** Untere und obere Grenze; jeder Einsatz wuerfelt neu daraus. */
type Spanne = readonly [number, number];

interface Basis {
  /** Sekunden bis zum naechsten Einsatz dieser Schicht. */
  pause: Spanne;
  gain: number;
}

/**
 * Boee aus gefiltertem Rauschen. Traegt Wind ebenso wie stehende Hoehlenluft —
 * der Unterschied steckt allein in Bandmitte, Guete und Laenge.
 */
interface Wind extends Basis {
  art: 'wind';
  /** Bandmitte. Gehoert unter die Melodie, siehe Maskierung weiter unten. */
  hz: Spanne;
  /** Klein heisst breit. Ueber 1 wird aus Wind ein Pfeifen. */
  q: number;
  dauer: Spanne;
  /** Faktor, um den die Bandmitte waehrend der Boee wandert. */
  wanderung: Spanne;
}

/**
 * Liegeton. Zwei minimal verstimmte Stimmen erzeugen die Schwebung — ein
 * einzelner Sinus klingt nach Pruefton, zwei klingen nach Raum.
 */
interface Brummen extends Basis {
  art: 'brummen';
  hz: number;
  /** Schwebung in Hertz. Daraus folgt die Verstimmung; unter 1 Hz bleibt sie unauffaellig. */
  schwebungHz: number;
  dauer: number;
  /** Pegel der Oktave darueber, damit kleine Lautsprecher den Ton ueberhaupt finden. */
  oberton: number;
}

/**
 * Vereinzelter Ruf: Vogel, Tropfen, spaeter auch Maschinenklacken. Ein bis
 * drei Toene, gewuerfelte Hoehe, gewuerfelter Rutscher.
 */
interface Ruf extends Basis {
  art: 'ruf';
  hz: Spanne;
  /** Wie viele Toene ein Ruf hat. Eine feste Zahl macht ihn wiedererkennbar. */
  toene: Spanne;
  /** Verstimmung zum Tonende — unter 1 faellt der Ton, ueber 1 steigt er. */
  rutsch: Spanne;
  dauer: Spanne;
  /** Abstand zwischen den Toenen eines Rufs. */
  abstand: Spanne;
  form: OscillatorType;
  /** Anzahl leiser Wiederholungen — daraus entsteht die Tiefe eines Raums. */
  echos: number;
  /** Bandmitte eines winzigen Rauschtupfers zum Anschlag; weglassen heisst kein Anschlag. */
  anschlagHz?: number;
}

type Schicht = Wind | Brummen | Ruf;

/**
 * Die Betten je Welt.
 *
 * Eine neue Welt ist genau ein Eintrag — Eis, Fabrik und Vulkan bekommen hier
 * je eine Zeile und keinen neuen Zweig im Code. Deshalb sind die drei
 * Schichtarten bewusst allgemein gehalten: `wind` deckt alles Flaechige ab,
 * `brummen` alles Liegende, `ruf` alles Vereinzelte. Solange eine neue Welt aus
 * diesen dreien besteht, bleibt der Rest der Datei unberuehrt.
 *
 * ## Maskierung
 *
 * Von 800 Hz bis 3 kHz sitzt die Melodie. Kein Eintrag hat dort seine
 * Bandmitte: Flaechen und Liegetoene bleiben darunter, Rufe gehen darueber.
 * Ein Bett, das sich mit der Melodie ueberlagert, zwingt einen dazu, die Musik
 * lauter zu drehen — und dann ist alles zu laut.
 *
 * Nach unten ist bei etwa 150 Hz Schluss: Vor dem Ausgang steht ein Hochpass
 * bei 85 Hz, und ein Handylautsprecher gibt darunter ohnehin nichts wieder. Ein
 * "tiefes Grundbrummen" muss also oberhalb liegen, sonst brummt es nur auf dem
 * Papier.
 */
const BETTEN: Record<ThemeId, readonly Schicht[]> = {
  // Welt 1 — Wiese. Offener Himmel: viel Bewegung, kein Nachhall. Dass die
  // Vogelrufe hier ohne Echo stehen und die Tropfen unten mit, sagt dem Ohr
  // schon allein, in welcher Welt es ist.
  grass: [
    // Grundwind: breit, tief, dauernd. Die Pause ist kuerzer als die Dauer,
    // dadurch ueberlappen die Boeen und es entsteht eine Flaeche statt eines
    // Pulses. Genau daran erkennt man sonst geschichtete Einzelklaenge.
    { art: 'wind', pause: [1.4, 3.0], gain: 0.019, hz: [190, 430], q: 0.5, dauer: [2.6, 5.2], wanderung: [0.7, 1.4] },
    // Grasrauschen als Kante darueber — bleibt unter 800 Hz, damit die Marimba
    // freie Bahn hat.
    { art: 'wind', pause: [2.2, 5.5], gain: 0.012, hz: [430, 760], q: 0.9, dauer: [1.1, 2.4], wanderung: [0.6, 1.1] },
    // Entfernte Voegel: ueber der Melodie, kurz, selten, mit wechselnder
    // Tonzahl und wechselnder Rutschrichtung — mal steigt der Ruf, mal faellt er.
    { art: 'ruf', pause: [4.5, 13], gain: 0.016, hz: [3100, 4600], toene: [2, 3], rutsch: [0.82, 1.4], dauer: [0.045, 0.095], abstand: [0.05, 0.15], form: 'triangle', echos: 0 },
  ],
  // Welt 2 — Hoehle. Wenig Bewegung, dafuer Tiefe.
  crystal: [
    // Stehende Luft statt Wind: tiefer, laenger, leiser, kaum Wanderung.
    { art: 'wind', pause: [3.0, 6.0], gain: 0.017, hz: [175, 300], q: 0.5, dauer: [4.5, 8.0], wanderung: [0.85, 1.2] },
    // Grundbrummen auf E, der Quinte zur Tonart der Hoehle (`music.ts`: A, 220
    // Hz, dorisch). Auf der Quinte legt sich der Liegeton nicht auf die
    // Harmonie fest und passt zu allen Akkorden des Stuecks — ein Liegeton
    // neben der Tonart faellt sofort auf, und Auffallen ist hier das Versagen.
    // 164,81 Hz statt einer Oktave tiefer, weil unterhalb von 150 Hz nichts
    // mehr durch den Hochpass und den Handylautsprecher kommt; die Oktave
    // darueber traegt den Ton auf kleinen Membranen.
    { art: 'brummen', pause: [4.0, 6.5], gain: 0.020, hz: 164.81, schwebungHz: 0.55, dauer: 7.5, oberton: 0.3 },
    // Wassertropfen: glashell, kurz, mit steigendem Rutscher — so klingt ein
    // Tropfen, dessen Blase beim Aufschlag kleiner wird. Zwei Echos geben der
    // Hoehle ihre Groesse: Der gemeinsame Federhall der Klangwerkstatt ist nur
    // 0,34 s lang und fuer alle Welten gleich, mehr Raum gibt es von hier aus
    // nur ueber geplante Wiederholungen.
    { art: 'ruf', pause: [2.6, 8.0], gain: 0.028, hz: [3050, 4300], toene: [1, 1], rutsch: [1.35, 1.95], dauer: [0.05, 0.09], abstand: [0.1, 0.2], form: 'sine', echos: 2, anschlagHz: 5200 },
  ],
  // Welt 3 — Rostwerk. Im Freien, aber zwischen Blech: Wind wie auf der
  // Wiese, nur stumpfer; ein Aechzen alter Traeger auf G (Septime der
  // dorischen Tonart, liegt im Tonvorrat des geteilten Stuecks); und selten
  // ein fernes metallisches Klacken mit einem einzigen Echo — die Halde
  // antwortet einmal, ein Fels haette zweimal geantwortet.
  rust: [
    { art: 'wind', pause: [1.8, 3.6], gain: 0.017, hz: [210, 400], q: 0.6, dauer: [2.2, 4.6], wanderung: [0.7, 1.3] },
    { art: 'brummen', pause: [5.0, 9.0], gain: 0.013, hz: 196, schwebungHz: 0.4, dauer: 6.0, oberton: 0.4 },
    { art: 'ruf', pause: [6.0, 14], gain: 0.02, hz: [1500, 2400], toene: [1, 2], rutsch: [0.7, 0.95], dauer: [0.06, 0.12], abstand: [0.12, 0.25], form: 'triangle', echos: 1 },
  ],
  // Welt 4 — Frostklamm. Duenne, klare Hoehenluft: heller Wind, weit oben,
  // fast ohne Tiefe; dazu selten ein glasiges Knacken — Eis, das arbeitet.
  frost: [
    { art: 'wind', pause: [1.6, 3.4], gain: 0.015, hz: [420, 900], q: 0.8, dauer: [2.4, 4.8], wanderung: [0.8, 1.5] },
    { art: 'wind', pause: [3.5, 7.0], gain: 0.01, hz: [900, 1600], q: 1.1, dauer: [1.2, 2.6], wanderung: [0.6, 1.2] },
    { art: 'ruf', pause: [5.0, 12], gain: 0.022, hz: [2600, 3800], toene: [1, 1], rutsch: [1.2, 1.6], dauer: [0.03, 0.06], abstand: [0.08, 0.15], form: 'sine', echos: 1, anschlagHz: 4800 },
  ],
  // Welt 5 — Schlot. Hitze hoert man als Tiefe: ein sattes Grollen auf der
  // Quinte, dazu traeges Blubbern von unten und kein Wind — im Schlot steht
  // die Luft.
  magma: [
    { art: 'brummen', pause: [3.0, 5.5], gain: 0.022, hz: 155.56, schwebungHz: 0.7, dauer: 6.5, oberton: 0.5 },
    { art: 'ruf', pause: [2.2, 6.0], gain: 0.02, hz: [180, 340], toene: [1, 2], rutsch: [0.6, 0.85], dauer: [0.08, 0.16], abstand: [0.1, 0.22], form: 'sine', echos: 0 },
    { art: 'wind', pause: [4.0, 8.0], gain: 0.012, hz: [160, 300], q: 0.5, dauer: [3.0, 6.0], wanderung: [0.9, 1.3] },
  ],
  // Welt 6 — Sonnenhang. Dieselbe offene Luft wie im Grasland, aber vier
  // Stunden spaeter: Der Wind steht tiefer und traeger, die Voegel rufen
  // seltener, und ueber allem liegt das Zirpen der Nachmittagswiese.
  sonnenhang: [
    // Grundwind: breit, tief, dauernd. Die Pause ist kuerzer als die Dauer,
    // dadurch ueberlappen die Boeen und es entsteht eine Flaeche statt eines
    // Pulses. Genau daran erkennt man sonst geschichtete Einzelklaenge.
    { art: 'wind', pause: [1.8, 3.6], gain: 0.017, hz: [160, 380], q: 0.5, dauer: [2.6, 5.2], wanderung: [0.7, 1.4] },
    // Grasrauschen als Kante darueber — bleibt unter 800 Hz, damit die Marimba
    // freie Bahn hat.
    { art: 'wind', pause: [2.2, 5.5], gain: 0.012, hz: [430, 760], q: 0.9, dauer: [1.1, 2.4], wanderung: [0.6, 1.1] },
    // Entfernte Voegel: ueber der Melodie, kurz, selten, mit wechselnder
    // Tonzahl und wechselnder Rutschrichtung — mal steigt der Ruf, mal faellt er.
    { art: 'ruf', pause: [7, 18], gain: 0.013, hz: [3100, 4600], toene: [2, 3], rutsch: [0.82, 1.4], dauer: [0.045, 0.095], abstand: [0.05, 0.15], form: 'triangle', echos: 0 },
  ],
  // Welt 7 — Wipfelweide. Kein offener Himmel mehr, sondern Laub: Der Wind
  // steht hoeher und blaettriger, die Rufe sitzen dicht und bekommen ein
  // kurzes Echo — man hoert, dass ueber einem etwas ist.
  wipfel: [
    // Grundwind: breit, tief, dauernd. Die Pause ist kuerzer als die Dauer,
    // dadurch ueberlappen die Boeen und es entsteht eine Flaeche statt eines
    // Pulses. Genau daran erkennt man sonst geschichtete Einzelklaenge.
    { art: 'wind', pause: [1.2, 2.6], gain: 0.016, hz: [340, 900], q: 0.8, dauer: [2.6, 5.2], wanderung: [0.7, 1.4] },
    // Grasrauschen als Kante darueber — bleibt unter 800 Hz, damit die Marimba
    // freie Bahn hat.
    { art: 'wind', pause: [2.2, 5.5], gain: 0.012, hz: [430, 760], q: 0.9, dauer: [1.1, 2.4], wanderung: [0.6, 1.1] },
    // Entfernte Voegel: ueber der Melodie, kurz, selten, mit wechselnder
    // Tonzahl und wechselnder Rutschrichtung — mal steigt der Ruf, mal faellt er.
    { art: 'ruf', pause: [3.4, 9], gain: 0.017, hz: [2600, 4200], toene: [2, 3], rutsch: [0.82, 1.4], dauer: [0.045, 0.095], abstand: [0.05, 0.15], form: 'triangle', echos: 1 },
  ],
};

/**
 * Der Raum je Welt.
 *
 * Das ist die Groesse, die aus „dasselbe Stueck in einer anderen Farbe" einen
 * anderen **Ort** macht — und sie war bisher fuer alle Welten gleich. Ein
 * Federhall von 0,34 s ist eine Kiste; das Bild des Spiels zeigt drei
 * gestaffelte Huegelketten unter freiem Himmel.
 *
 * Man hoert den Unterschied, bevor der erste Melodieton da ist, und zwar an
 * genau drei Zahlen:
 *
 * - **Wiese.** Kurz (1,5 s), hell (5 kHz), leise (0,8). Ueber einer Wiese ist
 *   nach oben nichts, was zurueckwirft — die Weite kommt von der Helligkeit und
 *   davon, dass die Fahne schnell weg ist. Ein langer Hall auf einer Wiese
 *   klingt nicht nach draussen, sondern nach Turnhalle.
 * - **Hoehle.** Lang (2,9 s), dunkel (1,4 kHz), lauter (1,25). Stein schluckt
 *   die Hoehen und wirft den Rest lange zurueck. Der Tiefpass ist dabei
 *   wichtiger als die Laenge: Ein langer *heller* Hall klingt nach Kirche, ein
 *   langer dunkler nach Fels.
 *
 * Eine neue Welt braucht hier eine Zeile — sonst klingt sie unweigerlich wie
 * eine der beiden bestehenden.
 */
const RAEUME: Record<ThemeId, { dauer: number; pegel: number; daempfung: number }> = {
  grass: { dauer: 1.5, pegel: 0.8, daempfung: 5000 },
  crystal: { dauer: 2.9, pegel: 1.25, daempfung: 1400 },
  // Halde im Freien: kuerzer als die Hoehle, dunkler als die Wiese — Blech
  // wirft hart und hoch zurueck, aber es gibt kein Gewoelbe, das traegt.
  rust: { dauer: 1.9, pegel: 1.0, daempfung: 2600 },
  // Frostklamm: lang und glashell — Eiswaende schlucken fast nichts.
  frost: { dauer: 2.4, pegel: 1.05, daempfung: 6500 },
  // Schlot: mittellang und sehr dumpf — heisses Gestein, enger Schacht.
  magma: { dauer: 2.2, pegel: 1.15, daempfung: 1100 },
  // Sonnenhang: offene Terrassen, aber Trockenmauern werfen etwas zurueck —
  // eine Spur laenger als die freie Wiese.
  sonnenhang: { dauer: 1.8, pegel: 0.85, daempfung: 4200 },
  // Wipfelweide: Laub schluckt die Hoehen, Staemme werfen die Tiefen —
  // kurz und weich, das Gegenteil der Eisklamm.
  wipfel: { dauer: 1.6, pegel: 0.9, daempfung: 2200 },
};

/**
 * Der Ausgang.
 *
 * Warm unten, glaesern oben, in der Mitte nichts — dieselbe Luecke von 800 Hz
 * bis 3 kHz, die die Melodie braucht. Der Grundton A (220 Hz) ist in beiden
 * Welten verbraucht: Grundton der Hoehle, Sexte der Wiese. Die Schwebung liegt
 * bei einem Drittel Hertz, also ein Schweben alle drei Sekunden — schnell
 * genug, dass es lebt, langsam genug, dass man nicht hinhoert.
 *
 * Der Pegel liegt noch einmal unter dem Bett. Der Ausgang soll auffindbar
 * sein, nicht rufen; wer ihn sucht, merkt ihn, wer plant, hoert ihn nicht.
 */
const SCHIMMER: readonly Schicht[] = [
  { art: 'brummen', pause: [3.2, 4.4], gain: 0.013, hz: 220, schwebungHz: 0.33, dauer: 5.5, oberton: 0.35 },
  { art: 'brummen', pause: [2.4, 3.6], gain: 0.005, hz: 3520, schwebungHz: 0.5, dauer: 4.0, oberton: 0 },
  // Die dritte Schicht: das Gold.
  //
  // Im Bild ist der Ausgang das **einzige Objekt, das selbst leuchtet** — ein
  // cremig-goldener Torbogen, von innen hell. Geklungen hat er bisher blau:
  // ein warmer Liegeton ganz unten, ein glaeserner ganz oben, und dazwischen
  // nichts. Genau die Mitte ist aber das, was das Ohr als „warm" liest.
  //
  // 659,25 Hz ist das E — in beiden Welten ein Akkordton (Terz der Wiese,
  // Quinte der Hoehle) und damit an keiner Stelle des Stuecks im Weg. Die
  // Schwebung ist mit 0,22 Hz die langsamste von allen dreien: Ein Leuchten
  // pulsiert nicht, es atmet.
  //
  // Der Pegel bleibt unter dem Bett. Der Ausgang soll auffindbar sein, nicht
  // rufen — wer ihn sucht, merkt ihn, wer plant, hoert ihn nicht.
  { art: 'brummen', pause: [3.6, 5.2], gain: 0.007, hz: 659.25, schwebungHz: 0.22, dauer: 6.0, oberton: 0.22 },
];

/**
 * Vorlauf in Sekunden.
 *
 * Groesser als der Vorlauf der Musik (0,35 s), weil hier nichts auf einem
 * Raster sitzt: Ob eine Boee einen Zehntel frueher beginnt, hoert niemand,
 * also darf seltener geplant werden. Viel groesser darf er trotzdem nicht
 * sein, denn Geplantes ist nicht mehr zurueckzuholen — nach `stop()` oder beim
 * Ausblenden des Ausgangs laeuft der Vorlauf noch zu Ende.
 */
const LOOKAHEAD = 0.6;

/** Gewuerfelter Wert aus einer Spanne. */
function zw(s: Spanne): number {
  return s[0] + Math.random() * (s[1] - s[0]);
}

/** Dasselbe als ganze Zahl — fuer Anzahlen, etwa die Toene eines Rufs. */
function ganz(s: Spanne): number {
  return Math.round(zw(s));
}

/** Gemeinsame Vorgaben jeder Stimme dieses Betts. Zur Begruendung siehe `Ambiente`. */
function o(delay: number) {
  return { bus: 'music' as const, delay, ignoreLimit: true };
}

/**
 * Frische Uhren fuer eine Schichtliste.
 *
 * Die Streuung beim Anlegen ist wichtig: Setzen alle Schichten gleichzeitig
 * ein, ist der Beginn der einzige Moment, den man am Bett ueberhaupt hoert.
 */
function neueUhren(anzahl: number, jetzt: number): number[] {
  const uhren: number[] = [];
  for (let i = 0; i < anzahl; i++) uhren.push(jetzt + Math.random() * 1.2);
  return uhren;
}

function spieleWind(e: AudioEngine, s: Wind, delay: number): void {
  e.noise({
    dur: zw(s.dauer),
    // Auch die Staerke wuerfeln: Gleich laute Boeen klingen nach Geblaese.
    gain: s.gain * (0.55 + Math.random() * 0.45),
    filter: 'bandpass',
    freq: zw(s.hz),
    q: s.q,
    sweep: zw(s.wanderung),
    ...o(delay),
  });
}

function spieleBrummen(e: AudioEngine, s: Brummen, delay: number): void {
  // Anschwellen ueber gut ein Drittel der Laenge. Der Rest ist Abklingen —
  // ohne diesen langen Anstieg setzt jeder Block hoerbar neu ein, und aus dem
  // Liegeton wird ein Puls.
  const atem = s.dauer * 0.38;
  // Die Schwebung ist die Differenz der beiden Frequenzen, also wird sie
  // schlicht addiert. In Cents gerechnet muesste man sie fuer jede Tonhoehe
  // neu ausrechnen, und dann steht in der Tabelle eine Zahl, die niemand liest.
  const verstimmt = s.hz + s.schwebungHz;
  e.tone({ freq: s.hz, dur: s.dauer, type: 'sine', gain: s.gain, attack: atem, ...o(delay) });
  e.tone({ freq: verstimmt, dur: s.dauer, type: 'sine', gain: s.gain * 0.8, attack: atem * 1.15, ...o(delay) });
  if (s.oberton > 0) {
    e.tone({ freq: s.hz * 2, dur: s.dauer * 0.8, type: 'sine', gain: s.gain * s.oberton, attack: atem, ...o(delay) });
  }
}

function spieleRuf(e: AudioEngine, s: Ruf, delay: number): void {
  const einzeln = (hz: number, at: number, gain: number): void => {
    e.tone({ freq: hz, dur: zw(s.dauer), type: s.form, gain, attack: 0.006, slide: zw(s.rutsch), ...o(at) });
    if (s.anschlagHz) {
      e.noise({ dur: 0.01, gain: gain * 0.5, filter: 'highpass', freq: s.anschlagHz, ...o(at) });
    }
  };

  const anzahl = ganz(s.toene);
  let hz = zw(s.hz);
  let t = delay;
  for (let i = 0; i < anzahl; i++) {
    if (i > 0) {
      t += zw(s.abstand);
      // Der Folgeton springt, meist nach oben. Ein Ruf auf einer festen
      // Tonhoehe ist nach einer Minute nicht mehr Natur, sondern Wecker.
      hz *= 1 + (Math.random() - 0.35) * 0.3;
    }
    einzeln(hz, t, s.gain);
    let echoZeit = t;
    let echoPegel = s.gain * 0.42;
    for (let k = 0; k < s.echos; k++) {
      // Ungleiche Abstaende: Zwei Echos im selben Takt klingen nach Effektgeraet.
      echoZeit += 0.09 + Math.random() * 0.2;
      einzeln(hz * 0.99, echoZeit, echoPegel);
      echoPegel *= 0.45;
    }
  }
}

function spiele(e: AudioEngine, s: Schicht, delay: number): void {
  // Verzweigt wird nach Schichtart, nicht nach Welt — eine neue Welt kommt in
  // die Tabelle oben und fasst diese Stelle nicht an.
  switch (s.art) {
    case 'wind':
      spieleWind(e, s, delay);
      return;
    case 'brummen':
      spieleBrummen(e, s, delay);
      return;
    case 'ruf':
      spieleRuf(e, s, delay);
      return;
  }
}

/**
 * Das Umgebungsbett. Zuschnitt wie `Music`: `start`/`stop` schalten, `update`
 * plant einmal pro Bild den Vorlauf.
 */
export class Ambiente {
  private playing = false;
  private theme: ThemeId = 'grass';
  private ausgang = false;
  private ereignisse = 0;
  /**
   * Naechster Einsatz je Schicht. Getrennt fuer Bett und Ausgang, damit das
   * Ein- und Ausblenden des Ausgangs nicht jedes Mal die Boeen des Betts neu
   * anwirft — die wuerden sonst zusammenklumpen.
   */
  private bettZeiten: number[] = [];
  private schimmerZeiten: number[] = [];
  /**
   * Steht der Raum schon auf dieser Welt?
   *
   * Als Merker und nicht als Aufruf in `setTheme`, weil es dort die
   * Klangwerkstatt noch gar nicht gibt: Sie entsteht erst nach der ersten
   * Nutzergeste, `setTheme` laeuft aber schon beim Laden des Levels. `update`
   * traegt es nach, sobald es etwas nachzutragen gibt.
   */
  private raumGesetzt = false;

  /** Diagnose fuer die automatisierte Sichtprobe. */
  get state(): { playing: boolean; events: number; bett: ThemeId; ausgang: boolean } {
    return { playing: this.playing, events: this.ereignisse, bett: this.theme, ausgang: this.ausgang };
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  setTheme(theme: ThemeId): void {
    const naechstes = theme in BETTEN ? theme : 'grass';
    if (naechstes === this.theme) return;
    this.theme = naechstes;
    // Uhren des alten Betts wegwerfen; `plane` legt sie neu an. Was schon
    // klingt, klingt aus — ein Weltwechsel blendet dadurch von selbst ueber,
    // statt abzuschneiden.
    this.bettZeiten = [];
    this.raumGesetzt = false;
  }

  /** Das Spiel weiss, ob ein Ausgang sichtbar ist; hier kommt die Antwort an. */
  setAusgang(sichtbar: boolean): void {
    if (sichtbar === this.ausgang) return;
    this.ausgang = sichtbar;
    this.schimmerZeiten = [];
  }

  start(engine: AudioEngine): void {
    if (this.playing) return;
    this.playing = true;
    this.bettZeiten = neueUhren(BETTEN[this.theme].length, engine.time);
    this.schimmerZeiten = neueUhren(SCHIMMER.length, engine.time);
  }

  stop(): void {
    this.playing = false;
  }

  update(engine: AudioEngine): void {
    if (!this.playing || !engine.ready || engine.muted) return;
    // Der Raum gehoert zum Bett und nicht zur Musik: Er sagt, **wo** man ist,
    // und das ist dieselbe Aussage, die die Windboeen und die Vogelrufe machen.
    if (!this.raumGesetzt) {
      const r = RAEUME[this.theme];
      engine.setRaum(r.dauer, r.pegel, r.daempfung);
      this.raumGesetzt = true;
    }
    const horizon = engine.time + LOOKAHEAD;
    this.plane(engine, BETTEN[this.theme], this.bettZeiten, horizon);
    if (this.ausgang) this.plane(engine, SCHIMMER, this.schimmerZeiten, horizon);
  }

  private plane(engine: AudioEngine, schichten: readonly Schicht[], zeiten: number[], horizon: number): void {
    if (zeiten.length !== schichten.length) {
      zeiten.length = 0;
      zeiten.push(...neueUhren(schichten.length, engine.time));
    }

    for (let i = 0; i < schichten.length; i++) {
      const s = schichten[i];
      // Lag das Bild lange still (Tab im Hintergrund), ist die Uhr weit
      // zurueck. Nachholen wuerde alles auf einmal ausloesen, also neu ansetzen.
      if (zeiten[i] < engine.time) zeiten[i] = engine.time + Math.random() * 0.5;
      let guard = 0;
      while (zeiten[i] < horizon && guard++ < 8) {
        spiele(engine, s, zeiten[i] - engine.time);
        this.ereignisse++;
        zeiten[i] += zw(s.pause);
      }
    }
  }
}
