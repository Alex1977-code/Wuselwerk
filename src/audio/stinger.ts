import type { AudioEngine } from './engine';
import { bass, glocke, kalimba, kies, pling, steeldrum, woodblock } from './instrumente';
import { tonart } from './music';

/**
 * Stingers — die Klaenge, die einen Abschnitt schliessen.
 *
 * ## Was einen Stinger von einem Spielton unterscheidet
 *
 * Ein Spielton (`sfx.ts`) ist die Rueckmeldung auf eine Handlung: sehr kurz,
 * beliebig oft wiederholbar, und er muss sich unterordnen — dutzende davon
 * liegen gleichzeitig uebereinander. Ein Stinger ist das Gegenteil. Er kommt
 * einmal, dauert Sekunden statt Millisekunden, hat einen eigenen harmonischen
 * Verlauf mit Anfang, Steigerung und Schluss, und er darf den Vordergrund
 * beanspruchen. Daraus folgt anderes Handwerk als nebenan:
 *
 * - Er **duckt die Musik** ueber seine ganze Laenge (1,5 dB, siehe
 *   `engine.duck`). Nicht mehr: Der Stinger soll Platz haben, nicht die Musik
 *   abschalten.
 * - Er **plant im Voraus**. Jeder Ton bekommt sein `delay` und landet damit auf
 *   der Zeitachse der Klangkarte. Ein `setTimeout` haengt dagegen am Bildtakt,
 *   und wenn beim Levelende gerade sechzig Figuren aufloesen, verrutscht die
 *   Fanfare hoerbar. Eine verrutschte Fanfare klingt nach Fehler.
 * - Er **ignoriert die Stimmenbegrenzung** (`ignoreLimit` bzw. `fest`). Ein
 *   verschluckter Grabeton faellt niemandem auf, ein verschluckter
 *   Schlussakkord jedem.
 *
 * ## Warum genau diese fuenf
 *
 * Ein Stinger gehoert an die Stellen, an denen das Spiel **einen Zustand
 * verlaesst** und der Blick sich vom Geschehen hebt: geschafft, ganz geschafft,
 * gescheitert, selbst gesprengt, besser als je zuvor. Fuer alles dazwischen
 * gibt es laufende Geraeusche; ein Stinger dort waere eine Unterbrechung ohne
 * Anlass. Vier der fuenf sind Abschluesse, der Countdown ist die Ausnahme: Er
 * ist ein Stinger, der **vorwaerts** zeigt, und deshalb der einzige mit einer
 * Dauer als Parameter.
 *
 * ## Woher die Toene kommen
 *
 * Aus dem Durdreiklang und der Pentatonik **der laufenden Welt** (`tonart()`
 * aus `music.ts`). Das ist keine Bequemlichkeit: Die Begleitmusik laeuft weiter,
 * waehrend der Stinger spielt, und nur so klingen beide zusammen statt
 * gegeneinander. Ein Dreiklang gehoert niemandem — nachgebaut wird hier weder
 * eine Melodie noch ein Klang aus dem Vorbild von 1991.
 *
 * Vorher stand hier ein fester Grundton C. Dass das bisher aufging, war Glueck:
 * Die Hoehle steht in A-dorisch, und C-Dur ist deren Paralleltonart. Bei der
 * dritten Welt geht das Glueck aus. Jetzt bringt jedes Stueck seinen
 * Fanfarengrundton mit (`fanfareGrund`), und der ist so gewaehlt, dass die
 * Fanfare **immer in Dur** steht — ohne Dur ist eine Fanfare kein Sieg.
 */

/**
 * Halbtoene ueber dem Fanfarengrundton, in Hertz. Negative Werte gehen nach
 * unten.
 *
 * Der Grundton wird bei **jedem Aufruf** neu geholt und nicht einmal
 * gespeichert: Ein Stinger kann in jeder Welt fallen, und zwischen zwei
 * Stingern kann die Welt gewechselt haben.
 */
function hz(halbton: number): number {
  const t = tonart();
  return t.grund * Math.pow(2, (t.fanfare + halbton) / 12);
}

/**
 * Gemeinsame Vorgaben fuer die Grundbausteine der Klangwerkstatt.
 *
 * Immer der Effektbus: Ein Stinger ist ein Ereignis, kein Musikstueck — er
 * gehoert auf dieselbe Ebene wie die Spielgeraeusche, waehrend die Musik unter
 * ihm weggeduckt wird. Immer `ignoreLimit`, siehe Dateikopf.
 *
 * Achtung beim Uebernehmen von Pegeln aus `instrumente.ts`: Die Vorgaben dort
 * sind auf den Musikbus (0,5) abgestimmt, der Effektbus steht auf 0,85. Ein
 * unveraenderter Wert liegt hier also rund 4,6 dB lauter — deshalb stehen in
 * dieser Datei durchweg kleinere Zahlen.
 */
function direkt(delay: number, pan = 0) {
  return { bus: 'sfx' as const, delay, ignoreLimit: true, pan };
}

/** Dasselbe fuer die fertigen Stimmen aus `instrumente.ts`. */
function fuerStimme(delay: number, pan = 0) {
  return { bus: 'sfx' as const, delay, fest: true, pan };
}

/**
 * Ein Hauch Zufall um 1 herum.
 *
 * Bewusst der einzige Ort mit `Math.random()` in dieser Datei, und bewusst nur
 * fuer **Zeitpunkte**, nie fuer Tonhoehen: Unregelmaessige Abstaende klingen
 * lebendig, unregelmaessige Tonhoehen klingen falsch. Die Simulation beruehrt
 * das nicht — diese Datei kennt weder Spielzustand noch Bildtakt.
 */
function streu(anteil: number): number {
  return 1 + (Math.random() * 2 - 1) * anteil;
}

// ---------------------------------------------------------------------------
// Zwei Stimmen, die es in `instrumente.ts` noch nicht gibt
// ---------------------------------------------------------------------------

/**
 * Blechblaeser-Miniatur — die Fanfarenstimme.
 *
 * Erkennbar wird ein Blasinstrument an drei Dingen, und die Grundfrequenz ist
 * keins davon:
 *
 * 1. **Huellkurve.** 40 ms Anstieg. Darunter klingt es nach Orgelpfeife (die
 *    steht sofort), darueber nach Streicher; dazwischen liegt die Zeit, die
 *    eine Lippe braucht, bis sie schwingt.
 * 2. **Teiltoene.** Saegezahn, weil Blech alle Teiltoene hat, gerade wie
 *    ungerade. Wichtiger als die Wellenform ist aber der Tiefpass, der
 *    *waehrend* des Ansatzes aufgeht: Ein Blasinstrument wird heller, je lauter
 *    es wird, und genau dieser Zusammenhang ist das Erkennungszeichen. Ein
 *    Saegezahn hinter einem festen Filter klingt nach Synthesizer.
 * 3. **Anlaufgeraeusch.** Ein kurzer Luftstoss beim Ansatz. Ohne ihn beginnt
 *    der Ton aus dem Nichts, und das tut kein geblasenes Instrument.
 *
 * Die zweite, um sechs Cent verstimmte Stimme ist keine Verzierung, sondern der
 * Unterschied zwischen einer Trompete und einem Register: Fanfaren spielt man
 * nie allein, und zwei exakt gleiche Stimmen ergeben nur eine lautere.
 */
function blech(e: AudioEngine, freq: number, dauer: number, ab: number, gain = 0.11, echo = 0): void {
  // Ansatz. Auf 0,3 s gedeckelt, weil ein Blaeser beim Einsetzen aufblueht und
  // nicht ueber die ganze Note hinweg — bei einem langen Schlusston waere ein
  // Filterlauf ueber die volle Laenge ein Synthesizer-Effekt, kein Ansatz.
  e.tone({
    freq,
    dur: Math.min(dauer, 0.3),
    type: 'sawtooth',
    gain: gain * 0.55,
    attack: 0.04,
    filterHz: freq * 1.4,
    filterSweep: 3.4,
    ...direkt(ab),
  });
  // Koerper. Der Filter sitzt am fuenften Teilton (die Resonanz des Filters
  // macht daraus eine Art Formant) und faellt zum Ende leicht ab: Der Ton
  // verliert seinen Glanz zuerst, so wie der Blaeser am Ende der Note nachlaesst.
  //
  // Die zwei Stimmen gehen jetzt auch **auseinander**, nicht nur auseinander in
  // der Stimmung. Ein Blechsatz ist ein Register aus mehreren Spielern, und
  // mehrere Spieler stehen nebeneinander; uebereinander gestapelt bleiben sie
  // ein einziger, dickerer Ton. Nur ±0,22 — eine Fanfare ist eine Ansage und
  // gehoert in die Mitte, sie soll nur nicht schmal sein.
  for (const [stimmung, seite] of [
    [1, -0.22],
    [1.0035, 0.22],
  ] as const) {
    e.tone({
      freq: freq * stimmung,
      dur: dauer,
      type: 'sawtooth',
      gain: gain * 0.5,
      attack: 0.05,
      filterHz: freq * 5,
      filterSweep: 0.7,
      ...direkt(ab, seite),
      echo,
    });
  }
  // Der Luftstoss liegt als Band um den zweiten Teilton, damit er zum Ton
  // gehoert und nicht als eigenes Zischen danebensteht.
  e.noise({ dur: 0.05, gain: gain * 0.26, filter: 'bandpass', freq: freq * 2, q: 1.1, ...direkt(ab) });
}

/**
 * Fagott und Tuba — die schwere Stimme fuer den Misserfolg.
 *
 * 1. **Huellkurve.** 80 ms Anstieg, doppelt so traege wie beim Blech oben. Eine
 *    grosse Luftsaeule kommt langsam in Gang, und genau diese Traegheit macht
 *    den Klang gutmuetig statt bedrohlich — der Ton kann gar nicht zustechen.
 * 2. **Teiltoene.** Der Grundton traegt hier wenig, der zweite Teilton traegt
 *    den Klang; deshalb steht er als eigene Stimme darueber. Der Tiefpass
 *    bleibt tief (Faktor 3 statt 5 wie beim Blech): Ein Fagott hat oberhalb des
 *    vierten Teiltons kaum noch Glanz, und ohne diese Deckelung klingt es wie
 *    eine schlecht gestimmte Trompete.
 * 3. **Anlaufgeraeusch.** Das Doppelrohrblatt schnarrt beim Ansatz. Das
 *    Rauschband liegt **fest** bei 480 Hz statt relativ zur Tonhoehe, denn ein
 *    Formant ist eine Eigenschaft des Instruments und nicht der Note. Das ist
 *    der Grund, warum man ein Fagott ueber sein ganzes Register wiedererkennt.
 */
function fagott(e: AudioEngine, freq: number, dauer: number, ab: number, gain = 0.15): void {
  e.tone({
    freq,
    dur: dauer,
    type: 'sawtooth',
    gain: gain * 0.85,
    attack: 0.08,
    filterHz: freq * 3,
    filterSweep: 0.6,
    ...direkt(ab),
  });
  e.tone({
    freq: freq * 2,
    dur: dauer * 0.75,
    type: 'triangle',
    gain: gain * 0.4,
    attack: 0.06,
    ...direkt(ab),
  });
  e.noise({ dur: 0.06, gain: gain * 0.16, filter: 'bandpass', freq: 480, q: 1.8, ...direkt(ab) });
}

// ---------------------------------------------------------------------------
// Bausteine, die sich mehrere Stingers teilen
// ---------------------------------------------------------------------------

/**
 * Die Fanfarenfigur: G – G – C – E – G, also ausschliesslich Toene des
 * C-Dur-Dreiklangs.
 *
 * Der doppelte Anfangston ist der ganze Trick an einer Fanfare: Erst die
 * Wiederholung macht aus einer Tonleiter einen Ruf. Die Abstaende sind kurz und
 * ungleich (0,18 / 0,12 / 0,26 / 0,26) — gleichmaessige Abstaende klaengen nach
 * Uebung, das punktierte Muster nach Ankuendigung.
 */
const ANLAUF: readonly { ton: number; ab: number; dauer: number }[] = [
  { ton: 7, ab: 0.0, dauer: 0.16 },
  { ton: 7, ab: 0.18, dauer: 0.1 },
  { ton: 12, ab: 0.3, dauer: 0.22 },
  { ton: 16, ab: 0.56, dauer: 0.22 },
  { ton: 19, ab: 0.82, dauer: 0.44 },
];

/** Sekunde, zu der der Anlauf in den Schlussakkord kippt. */
const AKKORD_AB = 1.32;

/** Der aufsteigende Anlauf, gemeinsam fuer Sieg und Vollrettung. */
function anlauf(e: AudioEngine, ab: number): void {
  for (const n of ANLAUF) {
    const f = hz(n.ton);
    // Der letzte, lange Ton geht ins Echo. Die kurzen davor nicht — sonst
    // liegen die Wiederholungen der ersten Toene noch unter den spaeteren und
    // machen aus einer Ansage einen Brei.
    blech(e, f, n.dauer, ab + n.ab, 0.14, n.dauer > 0.3 ? 0.3 : 0);
    // Pling auf jeden Ansatz. Das Blech braucht 40 ms, bis es steht — bis dahin
    // traegt der Anschlag den Rhythmus. Er macht die Figur scharf, ohne sie hart
    // zu machen.
    //
    // Frueher stand hier eine Steeldrum. Der Pling tut dasselbe und noch etwas:
    // Er ist derselbe Klang wie der Anschlag unter der Melodie, wie die
    // Werkzeugwahl und wie jede Brueckenstufe. Damit ist der lauteste Moment des
    // Spiels aus demselben Material gebaut wie sein leisester.
    pling(e, { freq: f, dur: n.dauer * 1.5, gain: 0.08, ...fuerStimme(ab + n.ab) });
  }
  // Fundament: G3 bei 196 Hz, die Dominante unter dem Anlauf. Tiefer geht es
  // nicht — das tiefe C bei 131 Hz gibt ein Handylautsprecher nicht wieder, und
  // der Hochpass vor dem Ausgang nimmt es ohnehin heraus. Dass die Quinte unten
  // liegt, ist hier kein Notbehelf, sondern richtig: Sie zieht zum Schlussakkord.
  bass(e, { freq: 196, dur: 0.5, gain: 0.18, ...fuerStimme(ab) });
  bass(e, { freq: 196, dur: 0.42, gain: 0.15, ...fuerStimme(ab + 0.82) });
}

/**
 * Der Schlussakkord: C-Dur, breit gelegt.
 *
 * @param toene Halbtoene ueber dem Grundton, von unten nach oben.
 *
 * Glockenspiel und Steeldrum bekommen nur die obersten Toene. Auf den unteren
 * wuerden ihre Obertoene den Akkord truebe machen, und jede gesparte Stimme ist
 * Aussteuerungsreserve fuer den Glitzer, der gleich darueber liegt.
 *
 * Die Einzelpegel sind kleiner, als sie einzeln klingen muessten: Sechs
 * Akkordtoene mal vier Stimmen schlagen gleichzeitig an, und wenn ihre Summe
 * die Bremse vor dem Ausgang voll erwischt, drueckt die den ganzen Mix
 * zusammen — dann ist aus dem sanften Ducken der Musik ein Zusammenbruch
 * geworden. Der Akkord soll gross klingen, nicht laut sein.
 */
function schlussakkord(e: AudioEngine, ab: number, toene: readonly number[], dauer: number): void {
  for (const t of toene) {
    blech(e, hz(t), dauer, ab, 0.088);
  }
  toene.slice(-3).forEach((t, k) => {
    // Das Glockenspiel legt selbst eine Oktave drauf (siehe `instrumente.ts`),
    // klingt also eine Oktave ueber dem Akkordton — genau die Ebene, auf der
    // der Glitzer sitzt. Die drei obersten Toene werden ueber die Breite
    // verteilt: Ein Akkord, dessen Toene alle an derselben Stelle stehen, ist
    // ein Klang; einer, der auseinandergezogen ist, ist ein Ensemble.
    const wo = (k - 1) * 0.42;
    glocke(e, { freq: hz(t), dur: dauer * 0.8, gain: 0.05, ...fuerStimme(ab, wo), echo: 0.25 });
    steeldrum(e, { freq: hz(t), dur: dauer * 0.5, gain: 0.058, ...fuerStimme(ab, -wo * 0.6) });
  });
  bass(e, { freq: hz(0), dur: dauer * 0.5, gain: 0.16, ...fuerStimme(ab) });
  // Nachschwelle auf den beiden obersten Toenen. Die Huellkurve der
  // Klangwerkstatt faellt immer exponentiell ab, ein wirklich *gehaltener* Ton
  // ist damit nicht zu haben. Ein zweiter, leiser Einsatz mit langsamem Anstieg
  // im letzten Drittel taeuscht ihn an: Der Akkord atmet noch einmal, statt
  // einfach zu sterben.
  for (const t of toene.slice(-2)) {
    blech(e, hz(t), dauer * 0.7, ab + dauer * 0.34, 0.046);
  }
}

/** Toene des Glitzers: C-Dur-Pentatonik ueber gut eine Oktave. */
const GLITZER = [12, 14, 16, 19, 21, 24, 26, 28] as const;

/**
 * Konfetti-Glitzer ueber dem Schlussakkord.
 *
 * Die Tonhoehen kommen aus der Pentatonik und in einer festen Schrittfolge
 * (immer drei Stufen weiter, umlaufend): So klingt jede Kombination zusammen,
 * die Reihenfolge wirkt trotzdem gestreut. Zufaellig ist nur, *wann* ein Ton
 * kommt — mit exakt gleichen Abstaenden klaenge Konfetti nach Maschine.
 */
function konfetti(e: AudioEngine, ab: number, dauer: number, anzahl = 14): void {
  for (let i = 0; i < anzahl; i++) {
    const p = i / anzahl;
    const t = ab + dauer * p * streu(0.09);
    const ton = GLITZER[(i * 3) % GLITZER.length];
    // Auch die Seite wandert, und zwar in einer eigenen Schrittfolge (fuenf
    // Plaetze, jedes Mal zwei weiter). Konfetti faellt ueberall, nicht in einer
    // Linie — und weil Tonhoehe und Ort verschieden schnell umlaufen, wiederholt
    // sich keine Kombination.
    const wo = ((i * 2) % 5) / 2 - 1;
    // Nach hinten leiser: Konfetti faellt, es wird nicht geworfen.
    glocke(e, { freq: hz(ton), dur: 0.85, gain: 0.06 * (1 - p * 0.6), ...fuerStimme(t, wo * 0.7) });
    // Jeder dritte Schnipsel ist ein Pling statt einer Glocke: das
    // Erkennungszeichen des Spiels, mitten im Jubel.
    if (i % 3 === 1) {
      pling(e, { freq: hz(ton), dur: 0.3, gain: 0.045 * (1 - p * 0.5), ...fuerStimme(t, -wo * 0.5) });
    }
    // Der Kies ist der Papierschnipsel dazu — ohne ein Geraeusch zwischen den
    // Glocken bleibt es ein Glockenspiel und wird kein Konfetti.
    if (i % 3 === 0) kies(e, { freq: 0, gain: 0.04, ...fuerStimme(t, wo) });
  }
}

/**
 * Jubel-Rasseln — die Ratsche zur Vollrettung.
 *
 * Eine Ratsche ist eine Folge sehr kurzer Knacke mit *ungleichen* Abstaenden.
 * Genau daran haengt alles: Bei gleichen Abstaenden liegt die Wiederholrate von
 * rund 25 pro Sekunde bereits im hoerbaren Bereich, und aus dem Geraeusch wird
 * ein Brummton. Deshalb schwankt der Abstand hier um ein Drittel.
 */
function jubelRassel(e: AudioEngine, ab: number, dauer: number): void {
  const abstand = 0.042;
  let k = 0;
  for (let t = 0; t < dauer; t += abstand * streu(0.35)) {
    const p = t / dauer;
    // Schnell an, langsam aus. Der Faktor bleibt immer ueber null, weil die
    // Huellkurve exponentiell laeuft und einen Pegel von genau null nicht kennt.
    const g = 0.05 * (0.25 + 0.75 * Math.min(1, p * 5)) * (1 - p * 0.7);
    // Die Ratsche wandert von links nach rechts durch. Sie ist der einzige
    // Klang im Spiel, der lang genug dauert, dass man eine Bewegung im Raum
    // ueberhaupt verfolgen kann — und eine gedrehte Ratsche bewegt sich.
    e.noise({
      dur: 0.012, gain: g, filter: 'bandpass', freq: 3200, q: 1.4,
      ...direkt(ab + t, Math.sin(k * 0.9) * 0.5),
    });
    k++;
  }
}

// ---------------------------------------------------------------------------
// Die fuenf Stingers
// ---------------------------------------------------------------------------

/**
 * Level geschafft — aufsteigende Fanfare mit Konfetti, gut viereinhalb Sekunden.
 *
 * Aufbau: Anlauf auf dem C-Dur-Dreiklang (Blech mit Steeldrum-Anschlag ueber
 * einem Fundament auf der Dominante), Schlussakkord ueber zwei Oktaven mit dem
 * Gipfel auf C6, darueber der Glitzer, der den Akkord ueberlebt.
 */
export function levelGeschafft(e: AudioEngine): void {
  e.duck(4.7);
  anlauf(e, 0);
  schlussakkord(e, AKKORD_AB, [0, 4, 7, 12, 16, 24], 1.7);
  // Der Glitzer setzt eine Zehntelsekunde *nach* dem Akkord ein: Zuerst muss
  // klar sein, worauf der Akkord steht, danach darf gefeiert werden.
  konfetti(e, AKKORD_AB + 0.12, 2.2);
}

/**
 * Alle gerettet — dieselbe Fanfare, aber sie hoert nicht bei C6 auf, sondern
 * klettert weiter und landet eine grosse Terz hoeher. Sechs Sekunden.
 *
 * Abweichung mit Absicht: Der Terzsprung liegt in der **Lage**, nicht in der
 * Tonart. Eine echte Transposition um eine grosse Terz braechte Gis ins Spiel
 * und liefe damit gegen die weiterlaufende C-Dur-Musik. Hier bleibt der Akkord
 * C-Dur, das Fundament bleibt auf C, und nur der Gipfelton wandert von C6 auf
 * E6 — hoerbar ist genau der Sprung, den die Vorgabe meint.
 */
export function alleGerettet(e: AudioEngine): void {
  e.duck(6);
  anlauf(e, 0);
  // Weiterklettern statt landen: zwei Zwischenschritte A5 und C6, ueber die der
  // Akkord erst in die hoehere Lage kommt.
  for (const [ton, ab] of [
    [21, AKKORD_AB],
    [24, AKKORD_AB + 0.2],
  ] as const) {
    blech(e, hz(ton), 0.2, ab, 0.13);
    pling(e, { freq: hz(ton), dur: 0.32, gain: 0.075, ...fuerStimme(ab) });
  }
  const akkordAb = AKKORD_AB + 0.44;
  schlussakkord(e, akkordAb, [4, 7, 12, 16, 19, 28], 2.1);
  jubelRassel(e, akkordAb, 1.3);
  // Mehr und laenger als beim einfachen Sieg — der Unterschied zwischen den
  // beiden Stingers soll ueber die Dauer laufen, nicht ueber die Lautstaerke.
  konfetti(e, akkordAb + 0.1, 2.9, 18);
}

/**
 * Drei absteigende Toene auf Fagott und Tuba: C4 – A3 – F3, also ein
 * abwaerts ausbuchstabierter F-Dur-Dreiklang. Drei Sekunden.
 *
 * Der Klang soll mit den Schultern zucken, nicht strafen. Drei Entscheidungen
 * tragen das:
 *
 * - **F-Dur statt Moll.** Eine fallende Durlinie klingt bedauernd, eine fallende
 *   Molllinie klingt nach Beerdigung.
 * - **Die Verstimmung sackt mit.** Der erste Ton steht sauber, der zweite liegt
 *   fuenf, der dritte neunzehn Cent zu tief — so, als ginge dem Blaeser die Luft
 *   aus. Gleichmaessig verstimmt klaenge nach kaputtem Instrument; erst das
 *   Wegsacken macht daraus einen Seufzer.
 * - **Zweite Stimme 14 Cent daneben**, 12 ms spaeter eingesetzt. Die Schwebung
 *   von rund anderthalb Schlaegen pro Sekunde ist das Wackeln, das die Sache
 *   freundlich macht. Der Versatz sorgt dafuer, dass es nach zwei Spielern
 *   klingt und nicht nach einem Effektgeraet.
 *
 * Der tiefste Ton liegt bei 174,6 Hz. Eine echte Tuba stuende zwei Oktaven
 * darunter, aber davon gaebe ein Handylautsprecher nichts wieder — und erkannt
 * wird das Instrument ohnehin an Huellkurve, Teiltoenen und Ansatzgeraeusch,
 * nicht an der Grundfrequenz.
 */
export function levelGescheitert(e: AudioEngine): void {
  e.duck(3);
  const toene = [
    { ton: 0, ab: 0.0, dauer: 0.55, sackt: 1.0 },
    { ton: -3, ab: 0.5, dauer: 0.55, sackt: 0.997 },
    { ton: -7, ab: 1.0, dauer: 1.5, sackt: 0.989 },
  ];
  for (const n of toene) {
    const f = hz(n.ton) * n.sackt;
    fagott(e, f, n.dauer, n.ab, 0.16);
    fagott(e, f * 1.008, n.dauer * 0.9, n.ab + 0.012, 0.07);
  }
}

/**
 * Selbstzerstoerung — beschleunigender Holzblock-Tick, halbtonweise steigend,
 * am Ende ein Cartoon-Bumms. Die Laenge gibt der Aufrufer vor.
 *
 * @param sekunden Zeit bis zur Sprengung.
 */
export function selbstzerstoerung(e: AudioEngine, sekunden: number): void {
  // Gedeckelt, weil die ganze Folge im Voraus geplant wird: Ein versehentlich
  // grosser Wert legte hunderte Stimmen in den Klanggraphen, und zuruecknehmen
  // laesst sich Geplantes nicht mehr. Zwoelf Sekunden sind mehr, als ein
  // Zuender im Spiel je braucht.
  const s = Math.min(12, Math.max(0.7, sekunden));
  e.duck(s + 0.8);

  // Erster und letzter Tickabstand. Unter 70 ms verschmelzen die Schlaege zum
  // Schnarren, und dann ist der Countdown nicht mehr zaehlbar — das Zaehlen ist
  // aber der ganze Zweck.
  const ERSTER_ABSTAND = 0.32;
  const LETZTER_ABSTAND = 0.07;

  let t = 0;
  for (let i = 0; t < s - 0.03 && i < 96; i++) {
    // Halbtonweise hoch, beim C5 los und nach zwei Oktaven gedeckelt: Darueber
    // ist der Holzblock kein Holz mehr, sondern ein Piepser, und auf einem
    // Handylautsprecher wird er stechend. Der Start auf dem C haelt auch den
    // Countdown in der Tonart der Musik, obwohl er chromatisch steigt.
    const freq = hz(12 + Math.min(i, 24));
    woodblock(e, { freq, gain: 0.1 + 0.09 * (t / s), ...fuerStimme(t) });
    // Geometrisch beschleunigen — gleiche Verhaeltnisse statt gleicher
    // Differenzen. Das Ohr nimmt Tempo logarithmisch wahr; linear verkuerzte
    // Abstaende klingen erst lange gleich und dann ploetzlich hektisch.
    t += ERSTER_ABSTAND * Math.pow(LETZTER_ABSTAND / ERSTER_ABSTAND, t / s);
  }
  bumms(e, s);
}

/**
 * Der Cartoon-Bumms.
 *
 * Drei Teile, und die Reihenfolge macht den Witz: ein aufsteigendes Zischen
 * als Anlauf, dann der Schlag, dann ein absackender Nachsatz. Der dritte Teil
 * ist der ganze Unterschied zwischen Zeichentrick und Katastrophenfilm — ohne
 * ihn bleibt es eine Explosion, mit ihm wird es eine Pointe.
 */
function bumms(e: AudioEngine, ab: number): void {
  e.noise({
    dur: 0.12, gain: 0.07, filter: 'highpass', freq: 900, sweep: 2.6,
    ...direkt(Math.max(0, ab - 0.12)),
  });
  // Der Schlag setzt bei 200 Hz an und rutscht auf 100 ab. Der Ansatz traegt
  // den Klang; das Abrutschen hoert man auf kleinen Lautsprechern als Geste,
  // nicht als Ton, und es kostet dort auch keine Aussteuerungsreserve.
  e.tone({ freq: 200, dur: 0.34, type: 'sine', gain: 0.33, slide: 0.5, ...direkt(ab) });
  e.noise({ dur: 0.4, gain: 0.21, filter: 'lowpass', freq: 1500, sweep: 0.18, ...direkt(ab) });
  e.noise({ dur: 0.1, gain: 0.13, filter: 'bandpass', freq: 2400, q: 0.7, sweep: 0.4, ...direkt(ab) });
  // Der Nachsatz: ein Dreieckston, der eine gute Oktave weit nach unten
  // wegsackt. Dreieck und nicht Saegezahn, damit er albern klingt statt scharf.
  e.tone({ freq: 620, dur: 0.5, type: 'triangle', gain: 0.085, slide: 0.3, ...direkt(ab + 0.06) });
  e.tone({ freq: 310, dur: 0.28, type: 'square', gain: 0.05, slide: 0.55, ...direkt(ab + 0.2) });
}

/** Der Harfenlauf: C-Dur-Pentatonik ueber gut zwei Oktaven. */
const LAUF = [0, 4, 7, 9, 12, 16, 19, 21, 24, 28] as const;

/**
 * Neuer Bestwert — Harfenlauf hinauf, darueber ein Glockenspiel-Triller. Zwei
 * Sekunden, kuerzer als alles andere hier: Ein Bestwert wird nebenbei
 * gemeldet, waehrend der Blick schon auf der naechsten Zahl liegt.
 *
 * Die Harfe ist die Kalimba aus `instrumente.ts`. Von den zwoelf Stimmen ist
 * sie die einzige gezupfte mit langem Ausklang, und genau das ist eine Harfe;
 * das Pizzicato waere zu trocken, und eine dritte eigene Stimme fuer zwei
 * Sekunden Klang waere Aufwand ohne Gegenwert.
 *
 * @param ab Versatz in Sekunden. Als einziger der fuenf braucht dieser Stinger
 *   ihn: Ein Bestwert faellt immer *nach* einem gewonnenen Level an, also hinter
 *   die Fanfare. Ein `setTimeout` dafuer waere falsch — es haengt am Bildtakt und
 *   feuert womoeglich noch, wenn der Spieler laengst weitergeblaettert hat.
 */
export function neuerBestwert(e: AudioEngine, ab = 0): void {
  e.duck(ab + 2.1);
  LAUF.forEach((ton, i) => {
    // Nach oben leiser werdend: So klingt es nach einer Hand, die ueber die
    // Saiten streicht, und nicht nach zehn einzeln angeschlagenen Toenen. Und
    // der Lauf wandert dabei von links nach rechts — eine Hand, die ueber Saiten
    // streicht, bewegt sich.
    kalimba(e, {
      freq: hz(ton), dur: 0.5, gain: 0.115 - i * 0.004,
      ...fuerStimme(ab + i * 0.048, -0.5 + i / (LAUF.length - 1)),
    });
  });
  // Triller auf E6/G6 (das Glockenspiel klingt eine Oktave ueber dem
  // uebergebenen Ton). Acht Wechsel in 0,56 s — schnell genug, dass man zwei
  // Toene als eine schimmernde Flaeche hoert, langsam genug, dass man sie
  // trotzdem einzeln erkennt.
  for (let i = 0; i < 8; i++) {
    glocke(e, {
      freq: hz(i % 2 === 0 ? 16 : 19), dur: 0.35, gain: 0.06,
      // Die zwei Toene des Trillers stehen auf zwei Seiten. Das ist der Grund,
      // warum man sie einzeln erkennt und trotzdem als eine Flaeche hoert.
      ...fuerStimme(ab + 0.5 + i * 0.07, i % 2 === 0 ? -0.35 : 0.35),
    });
  }
  // Schlusston eine Oktave ueber dem Grundton — er faengt den Triller auf,
  // sonst bricht der Stinger mitten in der Bewegung ab.
  glocke(e, { freq: hz(24), dur: 0.85, gain: 0.09, ...fuerStimme(ab + 1.1), echo: 0.35 });
}
