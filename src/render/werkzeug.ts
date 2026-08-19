/**
 * Das Werkzeug in der Hand der Figur.
 *
 * ## Warum es ueberhaupt eines braucht
 *
 * Ohne Werkzeug trennen sich drei der vier Arbeitsposen nur ueber die
 * Koerperneigung: Rammen und Schraegbaggern sehen fast gleich aus, und Bauen
 * liest sich beinahe wie Gehen. Bei einer Figur von zwoelf logischen Pixeln
 * ist eine Neigung von zwanzig Grad kein Unterschied, den man im Pulk erkennt.
 *
 * ## Die Leitregel — und die Zahl, die ihr gefehlt hat
 *
 * Bisher stand hier: **„Der Spieler liest die Achse, nicht das Geraet."** Sie
 * ist nachgemessen und stimmt genau eine Aufloesung lang. Keil, Spaten und
 * Planke im selben Winkel sind bei einem Bildpunkt je logischem Pixel drei
 * gleiche Balken — da traegt die Form nichts. Bei der Groesse, die ein Telefon
 * wirklich zeigt (Koerper 52 Geraetepunkte, `docs/figur-mass.md`), ist der Keil
 * ein Pfeil, der Spaten ein Balken mit Klotz, die Planke ein glattes Brett — da
 * traegt sie sehr wohl. Die Regel war also keine Absage an die Form, sondern
 * eine **Schranke ohne Zahl**, und ohne Zahl war sie eine Ausrede.
 *
 * > **Ein Merkmal wird erkannt, wenn es quer zur Achse mindestens ZWEI logische
 * > Pixel misst** — ein Sechstel der Figurenhoehe, 8,7 Geraetepunkte am
 * > Telefon. Darunter ist es Rauschen.
 *
 * Daraus die heutige Fassung, und sie sagt mehr als die alte:
 *
 * > **Die Achse sagt WAS geschieht, das Merkmal quer dazu sagt WOMIT, und der
 * > Wert sagt, ob man ueberhaupt etwas sieht.**
 *
 * Dazu ein drittes Gesetz, das aus der Gedraengeprobe stammt und in der alten
 * Begruendung fehlte, obwohl es der haeufigste Anblick des Spiels ist: Zwoelf
 * Figuren im Abstand von 8,5 logischen Pixeln stehen enger, als sie breit sind.
 * Vom alten Werkzeugsatz war dort **nichts** zu sehen — was nach vorn ragt,
 * verdeckt der Nachbar.
 *
 * > **Im Gedraenge ueberlebt nur, was ueber dem Kopf steht, eine Farbe traegt,
 * > die sonst nicht vorkommt, oder heller ist als alles ringsum.**
 *
 * Genau die beiden Berufe, die im Gedraenge ueberhaupt vorkommen — Blocker und
 * Sprengmeister —, bekommen deshalb Zeichen dieser Art.
 *
 * ## Eine alte Regel, die nur noch halb gilt
 *
 * Die erste Fassung verbot unter Punkt 2: „Nichts Dunkles ragt in die
 * Koerperflaeche hinein; dort wuerde es als Gesichtszug gelesen, und die Murmel
 * hat ausdruecklich keines." Die Begruendung ist figurgebunden und faellt beim
 * Wuselwerker weg: Er HAT ein Gesicht, und es sitzt oben. Das Pulverfass liegt
 * auf Brusthoehe, 4,7 logische Pixel unter dem Gesichtspunkt, und wird dort als
 * getragen gelesen und nicht als Zug im Gesicht. Fuer alles, was aus der HAND
 * kommt, gilt die Regel unveraendert weiter — das Seil am Guertel des
 * Kletterers ist genau daran gescheitert und deshalb nicht in dieser Datei.
 *
 * ## Warum gezeichnet und nicht gebacken
 *
 * Das Modell enthaelt kein Werkzeug — ein Bake haette bedeutet, erst eines zu
 * modellieren. Der Ansatzpunkt dagegen steht im Blatt: Der Backvorgang misst je
 * Einzelbild die vordere Hand aus dem Rig und schreibt sie ins Manifest. Damit
 * haengt das gezeichnete Geraet an derselben Bewegung wie der Koerper, ohne
 * dass ein zweites Bild noetig waere. Und es hat einen zweiten Vorteil, den
 * diese Fassung ausnutzt: Ein gezeichnetes Geraet **darf sich bewegen**, ohne
 * dass es eine Blattzelle kostet.
 *
 * ## Determinismus
 *
 * Kein `Math.random` in dieser Datei. Alles, was sich bewegt, haengt an `takt`
 * (dem Tickzaehler der Figur), am Einzelbild oder an `fuse` — also an
 * Simulationszustand. Zwei Figuren mit gleichem Zustand zeichnen gleich.
 */

import { BOMB_FUSE_TICKS, TICK_HZ } from '../core/constants';

/* -------------------------------------------------------------------------- *
 * Farben
 * -------------------------------------------------------------------------- */

const EISEN = '#3A3430';
/** Stirnholz und Blattruecken: hell genug, um im Eisen eine Kante zu setzen. */
const EISEN_HELL = '#6E665C';
/**
 * Holz, zwei Stufen heller als frueher (#6B5A46).
 *
 * Der alte Ton stand vor Erde (#7a5230) mit WCAG-Kontrast **1,03** — das ist
 * kein schwacher Kontrast, das ist keiner. Der Saum weiter unten loest das
 * Grundproblem; der hellere Ton ist die zweite Haelfte, damit der Stiel auch
 * INNERHALB seines Saums noch etwas ist und nicht nur ein Rand.
 */
const HOLZ = '#7C6849';
/** Der Kurbelgriff der Bohrwinde: vorn hell, hinten dunkel — daran sieht man
 *  die Drehrichtung. Ohne den Wechsel waere die Bewegung ein Hin und Her. */
const GRIFF_VORN = '#C6AC7C';
const GRIFF_HINTEN = '#83714F';
const SCHEIBE = '#5A5248';
const TUCH = '#D8CBB4';
const TUCH_SCHATTEN = '#A2937C';
const LEINE = '#4A4238';
const FASS_DUNKEL = '#4A3A2A';
const FASS_HELL = '#6B5540';
/**
 * Die Zuendschnur ist HELL, und das ist kein Fehler.
 *
 * Eine dunkle Schnur auf einem dunklen Fass ist keine Schnur, sondern ein Rand:
 * Der Funke hing im ersten Entwurf frei in der Luft und sah aus wie eine
 * Laterne neben der Figur. Zuendschnur gibt es hell wie dunkel — die helle
 * luegt nicht, sie ist nur die, die man sieht.
 */
const SCHNUR = '#C4B08A';
const GLUT = '#FFB43C';
const KERN = '#FFF3D0';
/**
 * Das Rot der Haltekelle.
 *
 * Es liegt CIE76 nur 25,8 von der Warnfarbe des Sprengmeisters entfernt, und
 * das ist der einzige bewusst eingegangene Kompromiss im ganzen Satz. Die
 * Ausweichfarbe ist geprueft und durchgefallen: Eine Kelle in Tuchweiss
 * verliert bei Rasterprobe gegen den hellen Himmel und wird zum grauen Fleck.
 *
 * Tragbar ist das Rot, weil nicht die Farbe verwechselt wird, sondern das
 * ZEICHEN — und die Zeichen sind verschieden: die Kellen sind **zwei** Scheiben,
 * links und rechts auf Brusthoehe; der Funke ist **einer**, klein und golden,
 * ueber einem Fass.
 */
const SIGNAL = '#C8452E';
const SIGNAL_KERN = '#E8DCC4';
/** Die Grabkrallen des Erdmaennchens. Unveraendert. */
const KRALLE = '#33251a';

/* -------------------------------------------------------------------------- *
 * Takt
 * -------------------------------------------------------------------------- */

/**
 * Wie schnell sich die Kurbel dreht — und warum die Zahl gegen `TICK_HZ`
 * gerechnet wird und nicht geraten.
 *
 * Der erste Entwurf stand auf 0,62 Bogenmass je Tick. Das sind bei **60** Ticks
 * je Sekunde 5,9 Umdrehungen in der Sekunde und damit zehn gezeichnete
 * Stellungen je Umdrehung: kein Bohrer, ein Stroboskop. Eine Handbohrwinde
 * dreht rund anderthalb Umdrehungen in der Sekunde; das sind vierzig
 * Stellungen je Umdrehung und liest sich als Drehung.
 */
const KURBEL_JE_TICK = (1.5 * 2 * Math.PI) / TICK_HZ;

/**
 * Wie langsam der Schirm wankt — dieselbe Rechnung, dasselbe Ergebnis.
 *
 * Naheliegend waere gewesen, das Wanken an das Einzelbild zu haengen. Die
 * Schwebezeile haelt aber [3,3,3,3] Ticks, also 0,2 Sekunden je Umlauf: ein
 * Fallschirm mit **fuenf Hertz**. Er haengt deshalb am Tickzaehler, mit einer
 * Periode von 90 Ticks — anderthalb Sekunden, das Mass eines Tuchs an Leinen.
 */
const WANK_JE_TICK = (2 * Math.PI) / 90;

/* -------------------------------------------------------------------------- *
 * Der Saum
 * -------------------------------------------------------------------------- */

/**
 * Waehrend `TON` gesetzt ist, malt jeder Zeichner einfarbig in dieser Farbe.
 *
 * Damit laesst sich derselbe Zeichencode achtmal versetzt als Saum und einmal
 * richtig ausfuehren, **ohne die Form ein zweites Mal zu beschreiben**. Genau
 * so baut `atlas.ts` den Saum der Figur, nur dort aus dem Blatt.
 */
let TON: string | null = null;
function fill(ctx: CanvasRenderingContext2D, c: string): void {
  ctx.fillStyle = TON ?? c;
}
function stroke(ctx: CanvasRenderingContext2D, c: string): void {
  ctx.strokeStyle = TON ?? c;
}

/**
 * Saumbreite in logischen Pixeln — 0,24 und ausdruecklich nicht mehr.
 *
 * Der erste Versuch stand auf 0,32, dem Mass der Figur (2 Blattpunkte bei ppl
 * 6,587 sind 0,30), und hat den Schirm zerstoert: Die Kuppel ist nur zwei
 * logische Pixel dick, zwei Saeume von 0,32 fressen ein Drittel davon, und aus
 * dem Fallschirm wurde ein schwarzer Reif mit einem weissen Splitter darin.
 *
 * **Die Regel „derselbe Saum wie die Figur" gilt fuer die FARBE, nicht fuer die
 * Breite.** Und Striche unter etwa 0,6 Pixel Dicke — die Schirmleinen —
 * bekommen gar keinen; ein Saum haette sie verdreifacht und geschwaerzt.
 */
const SAUM_PX = 0.24;

type Wie = { takt: number; frame: number; fuse: number };
type Mal = (ctx: CanvasRenderingContext2D, l: number, o: Wie) => void;
type Zeichner = (ctx: CanvasRenderingContext2D, l: number, o: Wie, saum: string | null) => void;

function mitSaum(mal: Mal): Zeichner {
  return (ctx, l, o, saum) => {
    if (saum) {
      TON = saum;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.save();
        ctx.translate(Math.cos(a) * SAUM_PX, Math.sin(a) * SAUM_PX);
        mal(ctx, l, o);
        ctx.restore();
      }
      TON = null;
    }
    mal(ctx, l, o);
  };
}

/* -------------------------------------------------------------------------- *
 * Die Geraete
 * -------------------------------------------------------------------------- */

/**
 * Die Bohrwinde des Rammers — und warum die Kurbel und nicht die Schneide.
 *
 * Der Auftrag lautete „ein richtiger Bohrer". Der naheliegende ist ein
 * Spiralbohrer, und der faellt durch: Bei 6,6 Pixeln Laenge und sechs Gaengen
 * hat die Windung 0,73 logische Pixel Steigung — ein Drittel der Schranke. Was
 * uebrig bleibt, ist ein Kegel, also der Keil, nur spitzer; im Bild las er sich
 * als Gewehr mit Bajonett. **Ein Bohrer, den man nicht als Bohrer erkennt, ist
 * ein Keil mit mehr Arbeit.**
 *
 * Was einen Bohrer zum Bohrer macht, ist die **Kurbel**, und sie steht quer zur
 * Achse und dreht sich. Der Griff laeuft ±2,4 logische Pixel aus der Achse,
 * also 4,8 Pixel von Spitze zu Spitze — am Telefon 20,6 Geraetepunkte und damit
 * die groesste Bewegung, die an dieser Figur ueberhaupt vorkommt. Kein anderes
 * Geraet traegt sein Kennzeichen in der Mitte; alle anderen tragen es vorn.
 *
 * ## Was zweimal falsch war
 *
 * Fassung eins: dicker Schaft, Brustplatte hinten, Futter und lange Spitze
 * vorn — zusammen Kolben, Lauf und Muendung. Die Figur sah aus, als lege sie
 * eine Maschinenpistole an. Fassung zwei: die Kurbel als rechteckiger Buegel —
 * das las sich als Abzugsbuegel. Beides ist gestrichen: kein Knauf, kein
 * Futter, duenner Schaft (0,045 statt 0,085 Laengen), kurze stumpfe Spitze.
 *
 * Was es loest, ist die **Schwungscheibe**. Sie ist zugleich der Weg, den der
 * Griff nimmt, und ein Gegenstand, den es gibt: Handbohrmaschinen mit
 * Schwungscheibe sind aelter als alles Maschinelle, das in dieser Wiesenwelt
 * sonst vorkaeme. Keine Waffe hat eine Scheibe quer zum Lauf.
 *
 * ## Die eine Stelle, an der dieser Satz seine eigene Schranke reisst
 *
 * Das Loch der Scheibe misst 1,3 logische Pixel. Bei Rasterprobe faellt es zu
 * und die Scheibe wird ein Klumpen; am Telefon ist es 5,7 Geraetepunkte weit
 * und offen. Die Gegenprobe mit **voller** Scheibe ist gemessen und schlechter:
 * Am Telefon liest sie sich als Kreuz, also als Schwertgriff, und am Raster ist
 * sie derselbe Klumpen. Der Ring bleibt — er verliert nichts und gewinnt eine
 * Aufloesung.
 */
const bohrwinde = mitSaum((ctx, l, o) => {
  const ph = o.takt * KURBEL_JE_TICK;
  const r = Math.sin(ph) * l * 0.36;
  const vorn = Math.cos(ph) > 0;
  const d = l * 0.045;
  const mx = l * 0.21;

  fill(ctx, EISEN);
  ctx.fillRect(-l * 0.16, -d, l * 1.0, d * 2);

  // Die Schwungscheibe von der Seite: eine schmale Ellipse, als Ring.
  stroke(ctx, SCHEIBE);
  ctx.lineWidth = l * 0.055;
  ctx.beginPath();
  ctx.ellipse(mx, 0, l * 0.13, l * 0.36, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Der Arm von der Achse zum Griff.
  fill(ctx, EISEN);
  ctx.fillRect(mx - l * 0.035, Math.min(0, r), l * 0.07, Math.abs(r));

  // Der Griff auf der Scheibe — das hellste Stueck des Geraets.
  fill(ctx, vorn ? GRIFF_VORN : GRIFF_HINTEN);
  ctx.beginPath();
  ctx.ellipse(mx + Math.cos(ph) * l * 0.13, r, l * 0.1, l * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Die Spitze: kurz. Eine lange Spitze wird zum Pfeil, und ein Pfeil sagt nur
  // die Richtung, die der Schaft schon sagt.
  fill(ctx, EISEN);
  ctx.beginPath();
  ctx.moveTo(l * 0.8, -l * 0.09);
  ctx.lineTo(l * 0.98, 0);
  ctx.lineTo(l * 0.8, l * 0.09);
  ctx.closePath();
  ctx.fill();
});

/**
 * Die Spitzhacke des Schraegbaggers.
 *
 * Sie loest das Paar, das bisher **dasselbe Geraet in zwei Winkeln** war:
 * Schraegbagger und Graeber trugen beide den Spaten, getrennt nur durch 45
 * Grad. Das war die alte Leitregel in Reinform und zugleich ihre Schwachstelle.
 *
 * Der Kopf einer Hacke steht QUER zum Stiel; er misst 0,60 Laengen = 3,7
 * logische Pixel von Spitze zu Blatt und liegt damit weit ueber der Schranke.
 * Aus einem Klumpen am Ende wird ein T — der einzige Formunterschied, der diese
 * Groesse ueberlebt.
 *
 * Das Nicken haengt am Einzelbild und schliesst sich nach vier Bildern (die
 * Baggerzeile hat genau vier). Eine Hacke, die still steht, wird geschultert
 * und nicht geschwungen.
 */
const spitzhacke = mitSaum((ctx, l, o) => {
  ctx.save();
  ctx.rotate(Math.sin(o.frame * (Math.PI / 2)) * 0.1);
  const d = l * 0.075;
  fill(ctx, HOLZ);
  ctx.fillRect(-l * 0.2, -d, l * 1.02, d * 2);
  fill(ctx, EISEN);
  // Spitze nach vorn-oben.
  ctx.beginPath();
  ctx.moveTo(l * 0.74, -l * 0.05);
  ctx.lineTo(l * 0.86, -l * 0.36);
  ctx.lineTo(l * 0.98, -l * 0.3);
  ctx.lineTo(l * 0.86, l * 0.02);
  ctx.closePath();
  ctx.fill();
  // Blatt nach vorn-unten, breiter und stumpf.
  ctx.beginPath();
  ctx.moveTo(l * 0.74, l * 0.02);
  ctx.lineTo(l * 0.86, l * 0.24);
  ctx.lineTo(l * 1.0, l * 0.34);
  ctx.lineTo(l * 0.98, l * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
});

/**
 * Der Spaten des Graebers — jetzt mit T-Griff, und kuerzer.
 *
 * ## Der gemessene Fehler
 *
 * Der Ansatz liegt beim Graeber 2,31 logische Pixel ueber dem Fusspunkt. Bei
 * einer Laenge von 6,0 nach unten beginnt das Blatt bei 0,66 der Laenge, also
 * 1,65 Pixel **unter** der Sohle, und endet 3,69 darunter: **Das ganze Blatt
 * liegt unter der Bodenlinie.** Das Stueck, an dem man einen Spaten erkennt,
 * sieht man nie; was herausschaut, ist der nackte Stiel — mit Kontrast 1,03
 * gegen Erde. Genau so steht es im Spielbild: ein dunkles Kaestchen tief in der
 * Grube, ohne sichtbare Verbindung zur Hand.
 *
 * ## Was daraus folgt
 *
 * Der Griff wandert ans andere Ende. Er sitzt bei −0,31 Laengen, also 3,9 Pixel
 * ueber der Sohle auf Brusthoehe, **immer im Freien**, und misst quer 2,4
 * logische Pixel. Die Laenge sinkt von 6,0 auf 5,2, damit der Blattansatz an
 * die Bodenlinie rueckt statt tief darunter.
 *
 * Dass das Blatt trotzdem halb im Boden steckt, ist richtig — ein Spaten im
 * Erdreich gehoert ins Erdreich. Er darf nur nicht das Einzige sein, woran man
 * ihn erkennt.
 */
const spaten = mitSaum((ctx, l) => {
  const d = l * 0.075;
  fill(ctx, HOLZ);
  ctx.fillRect(-l * 0.24, -d, l * 0.86, d * 2);
  ctx.fillRect(-l * 0.31, -l * 0.23, l * 0.11, l * 0.46);
  fill(ctx, EISEN);
  ctx.beginPath();
  ctx.moveTo(l * 0.58, -l * 0.24);
  ctx.lineTo(l * 0.92, -l * 0.19);
  ctx.lineTo(l * 1.0, 0);
  ctx.lineTo(l * 0.92, l * 0.19);
  ctx.lineTo(l * 0.58, l * 0.24);
  ctx.closePath();
  ctx.fill();
});

/**
 * Die Planke des Brueckenbauers. Sie bleibt Material und kein Werkzeug.
 *
 * Zwei Dinge aendern sich, und beide folgen aus einer Zahl. Der Winkel war
 * −22 Grad; die Stufe entsteht bei `BUILD_ADVANCE` 2 auf 1 Pixel Steigung, also
 * bei arctan(1/2) = **26,6 Grad**. Die Planke zeigte nicht dorthin, wo sie
 * hinkommt. Sie steht jetzt auf −27.
 *
 * Damit liegen zwischen ihr und der Bohrwinde (0 Grad) nur 27 Grad, waehrend
 * die eigene Leitregel „waagerecht, 45 Grad, senkrecht — nicht 20 und 40"
 * verlangt. Der Winkel ist aber nicht frei, er ist die Steigung der Stufe.
 * **Also muss die Trennung aus dem WERT kommen**: helles dickes Brett gegen
 * duennen dunklen Bohrschaft. 0,23 Laengen sind 1,6 logische Pixel, dreimal so
 * dick wie der Schaft — und genau daran hat man die beiden bei Rasterprobe
 * auseinander. Das Stirnholz am vorderen Ende macht aus dem Strich ein Brett.
 */
const planke = mitSaum((ctx, l) => {
  const d = l * 0.115;
  fill(ctx, HOLZ);
  ctx.beginPath();
  ctx.moveTo(-l * 0.2, -d);
  ctx.lineTo(l * 1.16, -d * 0.86);
  ctx.lineTo(l * 1.16, d * 0.86);
  ctx.lineTo(-l * 0.2, d);
  ctx.closePath();
  ctx.fill();
  fill(ctx, EISEN_HELL);
  ctx.fillRect(l * 1.02, -d * 0.86, l * 0.14, d * 1.72);
});

/**
 * Der Schirm des Schirmspringers.
 *
 * ## Warum er als einziges Geraet nicht an der Hand haengt
 *
 * Weil er nicht gefuehrt wird, sondern **traegt**. Ein Keil zeigt dorthin, wo
 * die Hand hinzeigt; ein Schirm steht ueber der Figur, ganz gleich wie sie die
 * Arme haelt. Beide Figuren greifen in dieser Pose mit beiden Haenden nach
 * oben, und welche davon „vorn" ist, entscheidet der Zufall der Drehung — ein
 * Schirm an dieser Stelle stuende einmal rechts und einmal links neben der
 * Figur. Sein Ansatz ist deshalb die Mittellinie ueber dem Kopf.
 *
 * ## Zwei Aenderungen
 *
 * 1. **Die Kuppel wird dicker** (0,42 statt 0,34 Laengen), damit der Saum sie
 *    nicht auffrisst. Ohne Saum stand sie vor dem Himmel mit Kontrast 1,56.
 * 2. **Sie wankt.** Gemessen wanderte die Kuppelmitte ueber die vier
 *    Einzelbilder um 0,01 logische Pixel — das ist nicht wenig, das ist nichts:
 *    Die Figur schwebt, das Tuch haengt an einem Nagel. Jetzt kippt sie um ±7
 *    Grad und wandert rund einen logischen Pixel quer. Ein Pixel ist wenig; bei
 *    17 Pixeln Zellhoehe ist es der Unterschied zwischen „schwebt" und „klebt".
 *
 * Die Leinen bekommen ausdruecklich **keinen** Saum: Sie sind 0,55 logische
 * Pixel dick, ein Saum von 0,24 auf jeder Seite haette sie verdoppelt.
 */
const schirm = mitSaum((ctx, l, o) => {
  ctx.save();
  const w = o.takt * WANK_JE_TICK;
  ctx.rotate(Math.sin(w) * 0.12);
  ctx.translate(0, Math.cos(w) * l * 0.07);
  const b = l * 0.5;
  const h = l * 0.42;
  // Die Kuppel liegt im gedrehten System mit +x nach oben; deshalb wird hier in
  // y gerechnet, als waere sie waagerecht.
  fill(ctx, TUCH);
  ctx.beginPath();
  ctx.moveTo(0, -b);
  ctx.quadraticCurveTo(h * 2.1, 0, 0, b);
  ctx.quadraticCurveTo(h * 0.55, 0, 0, -b);
  ctx.closePath();
  ctx.fill();
  // Ein Schattenstreifen an der Unterkante gibt dem Tuch Woelbung. Ohne ihn ist
  // die Kuppel ein heller Fleck, und ein Fleck ueber einer Figur ist kein Schirm.
  fill(ctx, TUCH_SCHATTEN);
  ctx.beginPath();
  ctx.moveTo(0, -b);
  ctx.quadraticCurveTo(h * 0.55, 0, 0, b);
  ctx.quadraticCurveTo(h * 0.2, 0, 0, -b);
  ctx.closePath();
  ctx.fill();
  if (TON) {
    ctx.restore();
    return;
  }
  stroke(ctx, LEINE);
  ctx.lineWidth = l * 0.075;
  ctx.beginPath();
  ctx.moveTo(0, -b * 0.94);
  ctx.lineTo(-l * 0.62, -b * 0.16);
  ctx.moveTo(0, b * 0.94);
  ctx.lineTo(-l * 0.62, b * 0.16);
  ctx.stroke();
  ctx.restore();
});

/**
 * Das Pulverfass des Sprengmeisters.
 *
 * ## Der Beruf, den bisher niemand gesehen hat
 *
 * Er hat keine eigene Pose — er geht. Er hatte auch kein Geraet. Angesagt wurde
 * er ueber drei Zeichen, und alle drei sind Anzeigen und keine Dinge:
 * Bandfarbe, Warnschein, Zuenduhr. Sie sagen **wann**, keines sagt **was**.
 * Gemessen war er vom Kletterer nicht zu unterscheiden: 88,5 Prozent
 * Silhouettenueberdeckung, das schlechteste Paar im Spiel.
 *
 * ## Warum das Fass ADDITIV gezeichnet wird und nicht ueber die Pose
 *
 * Weil der Sprengmeister keine Pose hat — und weil er alles andere weiter tun
 * darf: „Der Sprengmeister geht immer, auch im Fall, auch beim Blocker"
 * (`skills.ts`). Ein Fass, das die Kelle oder den Spaten verdraengte, waere
 * eine Luege ueber den Zustand. Es kommt deshalb **oben drauf**, sobald `fuse`
 * laeuft, und liegt an der Brust statt an der Hand: Die Gehpose meldet die Hand
 * zwischen x +3,7 und −0,4, ein Fass dort schwaenge im Schritt vor dem Bauch
 * hin und her.
 *
 * ## Was sich in den fuenf Sekunden aendert
 *
 * Die Schnur **wird kuerzer** — der Funke wandert 2,12 logische Pixel auf das
 * Fass zu — und der Funke **waechst** auf das Vierfache seiner Flaeche. Beides
 * rein aus `fuse` gerechnet, gegen `BOMB_FUSE_TICKS` und nicht gegen eine
 * geratene Zahl: Der erste Entwurf teilte durch 150 statt durch 300 und liess
 * die Schnur die ersten zweieinhalb Sekunden unveraendert stehen.
 *
 * Zwei weitere Dinge waren erst falsch: Die Schnur zeigte nach hinten, wo das
 * Gesicht liegt — der Funke stand ueber der Wange und war das Einzige, was man
 * von der Figur noch sah. Und Reifen und Fugen sind bei 3,8 Pixeln
 * Fassdurchmesser 0,4 Pixel breit und machen das Fass nur dunkler; was es rund
 * macht, ist die hellere Daube vorn.
 */
const pulverfass = mitSaum((ctx, l, o) => {
  const rest = Math.max(0, Math.min(1, o.fuse / BOMB_FUSE_TICKS));
  const r = l * 0.3;

  fill(ctx, FASS_DUNKEL);
  ctx.beginPath();
  ctx.moveTo(-r * 0.72, -r * 0.98);
  ctx.quadraticCurveTo(r * 1.02, -r * 0.55, r * 0.72, 0);
  ctx.quadraticCurveTo(r * 1.02, r * 0.55, -r * 0.72, r * 0.98);
  ctx.quadraticCurveTo(-r * 1.02, r * 0.55, -r * 0.86, 0);
  ctx.quadraticCurveTo(-r * 1.02, -r * 0.55, -r * 0.72, -r * 0.98);
  ctx.closePath();
  ctx.fill();
  fill(ctx, FASS_HELL);
  ctx.beginPath();
  ctx.moveTo(r * 0.1, -r * 0.94);
  ctx.quadraticCurveTo(r * 1.0, -r * 0.52, r * 0.72, 0);
  ctx.quadraticCurveTo(r * 1.0, r * 0.52, r * 0.1, r * 0.94);
  ctx.quadraticCurveTo(r * 0.34, 0, r * 0.1, -r * 0.94);
  ctx.closePath();
  ctx.fill();
  fill(ctx, EISEN);
  ctx.fillRect(-r * 0.8, -r * 0.44, r * 1.6, r * 0.16);
  ctx.fillRect(-r * 0.8, r * 0.28, r * 1.6, r * 0.16);

  const lang = l * (0.16 + 0.4 * rest);
  const sx = r * 0.45;
  const sy = -r * 0.9;
  const ex = sx + lang * 0.8;
  const ey = sy - lang * 0.6;
  stroke(ctx, SCHNUR);
  ctx.lineWidth = l * 0.085;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.quadraticCurveTo(sx + lang * 0.15, sy - lang * 0.55, ex, ey);
  ctx.stroke();

  // Der Funke bekommt keinen Saum: Er ist das Hellste im Bild, und ein dunkler
  // Ring darum nimmt ihm genau das.
  if (TON) return;
  const gr = l * (0.07 + 0.055 * (1 - rest));
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = GLUT;
  ctx.beginPath();
  ctx.arc(ex, ey, gr * 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = KERN;
  ctx.beginPath();
  ctx.arc(ex, ey, gr, 0, Math.PI * 2);
  ctx.fill();
});

/**
 * Die Haltekelle des Blockers — zweimal, links und rechts.
 *
 * ## Er steht nur da, also muss das Geraet sagen, warum
 *
 * Der Blocker war der zweite Beruf ohne Gegenstand, und er ist der Beruf, den
 * man am laengsten ansieht: Man setzt ihn und sieht ihn dann die ganze Runde.
 * Gemessen teilte er mit dem **Spaehenden** neunzig Prozent seiner Flaeche
 * (Ueberdeckung 0,927 bei 17-Pixel-Zelle) — zwei Figuren in derselben Lage mit
 * entgegengesetzter Bedeutung.
 *
 * Zwei Kellen quer heraus machen die Figur **16 statt 12 logische Pixel breit**,
 * und sie tun es SYMMETRISCH. Das ist das eigentliche Merkmal: Brueckenbauer
 * und Rammer sind aehnlich breit, aber einseitig; ihr Schwerpunkt liegt 2,8 bis
 * 3,4 Pixel vor dem Fusspunkt, der des Blockers bei −0,25. **Er ist die einzige
 * Figur im Spiel, die nach beiden Seiten ausgreift.** Nachgemessen faellt die
 * Ueberdeckung mit dem Spaehenden damit von 0,927 auf 0,814.
 *
 * Die Blockpose meldet nur EINE Hand (sie steht frontal); die zweite Kelle
 * entsteht durch Spiegelung — deshalb `beidhaendig`.
 */
const kelle = mitSaum((ctx, l) => {
  const d = l * 0.12;
  fill(ctx, HOLZ);
  ctx.fillRect(-l * 0.14, -d, l * 0.68, d * 2);
  fill(ctx, SIGNAL);
  ctx.beginPath();
  ctx.arc(l * 0.74, 0, l * 0.32, 0, Math.PI * 2);
  ctx.fill();
  fill(ctx, SIGNAL_KERN);
  ctx.beginPath();
  ctx.arc(l * 0.74, 0, l * 0.13, 0, Math.PI * 2);
  ctx.fill();
});

/**
 * Grabkrallen des Erdmaennchens: drei gespreizte Spitzen aus der Pfote.
 *
 * Unveraendert — inklusive der Begruendung. Gespreizt und nicht parallel: drei
 * parallele Striche sind bei dieser Groesse ein Balken, und ein Balken ist
 * wieder ein Geraet. Der Faecher liest sich als Hand und hat trotzdem eine
 * eindeutige Achse, weil er in der Mitte am laengsten ist.
 *
 * Sie leisten **nicht** die Unterscheidbarkeit — dafuer sind sie zu klein (54,3
 * gegen 53,7 Prozent Ueberdeckung). Sie bleiben, weil diese Figur sandbraun auf
 * sandbraun ist und einen dunklen Akzent an der arbeitenden Pfote braucht.
 */
const krallen = mitSaum((ctx, l) => {
  fill(ctx, KRALLE);
  for (const [winkel, anteil] of [
    [-22, 0.82],
    [0, 1],
    [22, 0.86],
  ] as const) {
    const b = (winkel * Math.PI) / 180;
    const cx = Math.cos(b);
    const cy = Math.sin(b);
    const len = l * anteil;
    const d = l * 0.15;
    ctx.beginPath();
    ctx.moveTo(-cy * d - cx * l * 0.35, cx * d - cy * l * 0.35);
    ctx.quadraticCurveTo(cx * len * 0.6 - cy * d * 0.7, cy * len * 0.6 + cx * d * 0.7, cx * len, cy * len);
    ctx.quadraticCurveTo(cx * len * 0.55 + cy * d * 0.5, cy * len * 0.55 - cx * d * 0.5, cy * d - cx * l * 0.35, -cx * d - cy * l * 0.35);
    ctx.closePath();
    ctx.fill();
  }
});

/* -------------------------------------------------------------------------- *
 * Wer was fuehrt
 * -------------------------------------------------------------------------- */

/**
 * Wie ein Geraet an der Figur haengt.
 *
 * `hand` ist der Regelfall. Die drei anderen sind **gemessene Ausnahmen**, kein
 * Sonderwunsch — die Begruendung steht jeweils beim Zeichner.
 */
type Anbau = 'hand' | 'kuppel' | 'brust' | 'beidhaendig';

interface Fuehrung {
  zeichner: Zeichner;
  anbau: Anbau;
  /** Winkel in Grad. 0 ist waagerecht nach vorn, 90 senkrecht nach unten. */
  winkel: number;
  /** Laenge in logischen Pixeln. */
  laenge: number;
}

/**
 * Welche Pose welches Geraet fuehrt.
 *
 * **Der Schluessel bleibt die Pose und wird nicht der Auftrag** — und das ist
 * eine bewusste Abkehr vom Entwurf, mit einem Grund, der sich nachlesen laesst:
 * `schopfAuftrag(w)` liefert bei einer **Vormerkung** schon den kuenftigen
 * Beruf (`atlas.ts`, „Wer einen Rammer bestellt hat, soll die Figur
 * wiederfinden"). Fuer eine Bandfarbe ist das richtig; fuer ein Geraet waere es
 * falsch — der vorgemerkte Rammer traegt seine Bohrwinde dann waagerecht durch
 * die Landschaft, waehrend er noch geht.
 *
 * Die beiden Berufe ohne Arbeitspose bekommen ihr Geraet deshalb anders:
 * - Der **Blocker** hat eine Pose (`blocking`) — sie stand nur nie in dieser
 *   Tabelle. Jetzt steht sie darin.
 * - Der **Sprengmeister** hat keine. Sein Fass haengt an `fuse` und wird
 *   zusaetzlich gezeichnet; siehe `pulverfass`.
 */
const FUEHRT: Record<string, Fuehrung> = {
  // Waagerecht — der Rammer treibt einen Stollen geradeaus.
  bashing: { zeichner: bohrwinde, anbau: 'hand', winkel: 0, laenge: 6.6 },
  // Genau 45 Grad.
  mining: { zeichner: spitzhacke, anbau: 'hand', winkel: 45, laenge: 6.2 },
  // Senkrecht nach unten, und kuerzer als bisher — siehe `spaten`.
  digging: { zeichner: spaten, anbau: 'hand', winkel: 90, laenge: 5.2 },
  // −27 Grad: arctan(1/2), die Steigung der Stufe, die gleich entsteht.
  building: { zeichner: planke, anbau: 'hand', winkel: -27, laenge: 7.0 },
  // Senkrecht nach oben — und als einziges Geraet nicht an der Hand.
  floating: { zeichner: schirm, anbau: 'kuppel', winkel: -90, laenge: 7.4 },
  // Quer nach beiden Seiten. Der Blocker ist die einzige Figur, die das tut.
  blocking: { zeichner: kelle, anbau: 'beidhaendig', winkel: 0, laenge: 3.4 },
};

/**
 * Die Abweichungen des Erdmaennchens. Die Winkel bleiben, nur das Mittel
 * wechselt — der Spieler liest weiterhin die Achse, sie kommt jetzt aus der
 * Pfote.
 *
 * Ohne `blocking`: Die Haltekelle ist am Wuselwerker gemessen und am
 * Erdmaennchen nicht. Ein Tier mit Verkehrskellen mag richtig sein; belegt ist
 * es nicht, und unbelegt kommt hier nichts hinein.
 */
const FUEHRT_TIER: Record<string, Fuehrung> = {
  bashing: { zeichner: krallen, anbau: 'hand', winkel: 0, laenge: 3.1 },
  mining: { zeichner: krallen, anbau: 'hand', winkel: 45, laenge: 3.0 },
  digging: { zeichner: krallen, anbau: 'hand', winkel: 90, laenge: 2.8 },
  building: { zeichner: planke, anbau: 'hand', winkel: -27, laenge: 7.0 },
  floating: { zeichner: schirm, anbau: 'kuppel', winkel: -90, laenge: 7.4 },
};

function fuehrung(pose: string, figur: string): Fuehrung | undefined {
  if (figur === 'erdmaennchen') return FUEHRT_TIER[pose];
  return FUEHRT[pose];
}

/** Fuehrt diese Pose ein Werkzeug? */
export function fuehrtWerkzeug(pose: string): boolean {
  return pose in FUEHRT;
}

/* -------------------------------------------------------------------------- *
 * Ansatz
 * -------------------------------------------------------------------------- */

/**
 * Der Koerper einer Figur, so grob wie das Werkzeug ihn braucht.
 *
 * Alle Masse als Anteil der Koerperhoehe, damit die Zellgeometrie sie nicht
 * beruehrt.
 *
 * **Warum das je Figur verschieden ist, und zwar wesentlich.** Beim Blatt der
 * Murmel ist der Handpunkt eine **Schaetzung** — dieses Modell hat keine
 * Handknochen, die Armspitze wurde gerechnet, und sie landet mitten im Koerper.
 * Der ganze Apparat darunter, die Ellipse und der Versatz nach unten, ist die
 * Berichtigung dieser Schaetzung. Das Erdmaennchen und der Wuselwerker haben
 * echte Handknochen; dieselbe Berichtigung noch einmal anzuwenden hiess, eine
 * Schaetzung auszugleichen, die es nicht gibt.
 */
interface Koerperform {
  /** Halbe Breite des Rumpfes. */
  breit: number;
  /** Halbe Hoehe des Rumpfes. */
  hoch: number;
  /** Mitte des Rumpfes ueber dem Fusspunkt (negativ = oben). */
  mitte: number;
  /** Wie weit der Ansatz unter den gemeldeten Handpunkt rutscht. */
  handab: number;
  /** Luft zwischen Silhouette und Geraet. */
  luft: number;
}

const KOERPER: Record<string, Koerperform> = {
  murmel: { breit: 0.4, hoch: 0.52, mitte: -0.5, handab: 0.14, luft: 0.12 },
  erdmaennchen: { breit: 0.26, hoch: 0.44, mitte: -0.52, handab: 0, luft: 0.05 },
  // Der Wuselwerker: echte Handknochen, aber ein Chibi. In allen sechs Posen
  // mit fuehrender Hand liegt der gemeldete Punkt 0,54 bis 0,82 logische Pixel
  // INNERHALB der Silhouette, und zwar ueberall gleich viel — das ist die Dicke
  // des Aermels, keine danebenliegende Schaetzung. `luft` 0,06 hebt sie auf.
  wuselwerker: { breit: 0.22, hoch: 0.4, mitte: -0.5, handab: 0, luft: 0.06 },
};

/** Wie weit ueber dem Fusspunkt die Schirmkuppel sitzt. */
const SCHIRM_HOCH = 1.42;
/** Wo das Fass haengt: Brusthoehe, vorn an der Silhouette. */
const FASS_X = 0.24;
const FASS_Y = -0.39;

/**
 * Wie weit das Werkzeug aus dem Koerper heraustreten muss.
 *
 * Der Koerper wird als Ellipse angenaehert und der Ansatz entlang der
 * Werkzeugachse so weit nach aussen geschoben, bis er sie verlaesst. Das ist
 * eine quadratische Gleichung und kostet nichts — der Gewinn ist, dass es fuer
 * **jeden** Winkel stimmt und nicht je Pose von Hand nachgestellt werden muss.
 *
 * Liegt der Ansatz schon ausserhalb, kommt null heraus, und das ist richtig:
 * Dann haelt die Figur das Geraet bereits neben sich.
 */
function austritt(dx: number, dy: number, cx: number, cy: number, a: number, b: number): number {
  const A = (cx * cx) / (a * a) + (cy * cy) / (b * b);
  const B = 2 * ((dx * cx) / (a * a) + (dy * cy) / (b * b));
  const C = (dx * dx) / (a * a) + (dy * dy) / (b * b) - 1;
  if (A <= 0) return 0;
  const disk = B * B - 4 * A * C;
  if (disk < 0) return 0;
  return Math.max(0, (-B + Math.sqrt(disk)) / (2 * A));
}

/** Ein Ansatzpunkt: wo, in welche Richtung, und ob gespiegelt gezeichnet wird. */
interface Ansatz {
  x: number;
  y: number;
  bogen: number;
  spiegel: boolean;
}

function ansaetze(f: Fuehrung, hx: number, hy: number, koerperH: number, figur: string): Ansatz[] {
  const bogen = (f.winkel * Math.PI) / 180;
  // Der Schirm haengt ueber der Mittellinie. Die gemeldete Handstelle geht hier
  // absichtlich nicht ein — warum, steht bei `schirm`.
  if (f.anbau === 'kuppel') return [{ x: 0, y: -koerperH * SCHIRM_HOCH, bogen, spiegel: false }];
  if (f.anbau === 'brust') return [{ x: koerperH * FASS_X, y: koerperH * FASS_Y, bogen: 0, spiegel: false }];
  if (f.anbau === 'beidhaendig') {
    return [
      { x: Math.abs(hx), y: hy, bogen, spiegel: false },
      { x: -Math.abs(hx), y: hy, bogen, spiegel: true },
    ];
  }
  // Krallen wachsen aus der Pfote und werden nicht aus dem Koerper geschoben:
  // Der Austritt berichtigt einen GESCHAETZTEN Ansatz, der im Bauch landet.
  // Eine Kralle sitzt dort, wo die Pfote ist — auch wenn die gerade unter dem
  // Bauch durchzieht. Genau das soll man sehen.
  if (figur === 'erdmaennchen' && f.zeichner === krallen) {
    return [{ x: hx, y: hy, bogen, spiegel: false }];
  }
  const k = KOERPER[figur] ?? KOERPER.murmel;
  const hy2 = hy + koerperH * k.handab;
  const t = austritt(
    hx,
    hy2 - koerperH * k.mitte,
    Math.cos(bogen),
    Math.sin(bogen),
    koerperH * k.breit,
    koerperH * k.hoch,
  );
  // Ein Geraet, das die Silhouette genau beruehrt, sieht angeklebt aus statt
  // gehalten — ein wenig Luft obendrauf.
  const ab = t + koerperH * k.luft;
  return [{ x: hx + Math.cos(bogen) * ab, y: hy2 + Math.sin(bogen) * ab, bogen, spiegel: false }];
}

/**
 * Wo das Werkzeug ansetzt und in welche Richtung es zeigt.
 *
 * Getrennt vom Zeichnen, damit sich diese Rechnung **pruefen** laesst. Sie ist
 * die Stelle, an der eine Figur mit gemessenen Pfoten und eine Figur mit
 * geschaetzten Armspitzen auseinandergehen — und der Fehler dabei sieht auf dem
 * Blatt nach nichts aus: Das Blatt ist richtig, nur das Geraet steht daneben.
 *
 * Liefert den **ersten** Ansatz; nur die Haltekelle hat einen zweiten, und der
 * ist die Spiegelung des ersten.
 */
export function werkzeugAnsatz(
  pose: string,
  hx: number,
  hy: number,
  koerperH: number,
  figur = 'murmel',
): { x: number; y: number; bogen: number } | null {
  const f = fuehrung(pose, figur);
  if (!f) return null;
  const a = ansaetze(f, hx, hy, koerperH, figur)[0];
  return { x: a.x, y: a.y, bogen: a.bogen };
}

/* -------------------------------------------------------------------------- *
 * Zeichnen
 * -------------------------------------------------------------------------- */

/**
 * Was die Figur gerade tut, soweit das Werkzeug es wissen muss.
 *
 * Alle drei Angaben liegen beim Aufrufer bereits vor: `takt` ist `w.timer`,
 * `frame` hat `frameFor` schon gerechnet, `fuse` steht am Wusel. `saum` kommt
 * aus der Weltpalette — **derselbe Wert wie fuer die Figur**, und das ist keine
 * Bequemlichkeit: In der Kristallklamm und im Schlot ist er hell, ein fest
 * verdrahteter dunkler Saum waere dort schlimmer als keiner.
 */
export interface WerkzeugLage {
  takt?: number;
  frame?: number;
  fuse?: number;
  saum?: string | null;
}

/**
 * Das Werkzeug zeichnen.
 *
 * @param hx Ansatz in logischen Pixeln, waagerecht vom Fusspunkt aus.
 * @param hy Ansatz in logischen Pixeln, senkrecht vom Fusspunkt aus (negativ = oben).
 * @param koerperH Hoehe des Koerpers in logischen Pixeln.
 * @param s Bildpunkte je logischem Pixel.
 * @param figur Welche Figur — sie entscheidet ueber die Koerperform.
 * @param lage Takt, Einzelbild, Zuendrest und Saumfarbe. Ohne sie zeichnet
 *   alles im Ruhezustand und ohne Saum — genau das braucht der prozedurale
 *   Zeichner in `sprites.ts`, der kein Blatt und keine Palette hat.
 */
export function drawWerkzeug(
  ctx: CanvasRenderingContext2D,
  pose: string,
  hx: number,
  hy: number,
  koerperH: number,
  s: number,
  figur = 'murmel',
  lage: WerkzeugLage = {},
): void {
  const o: Wie = { takt: lage.takt ?? 0, frame: lage.frame ?? 0, fuse: lage.fuse ?? 0 };
  const saum = lage.saum ?? null;

  const f = fuehrung(pose, figur);
  if (f) male(ctx, f, hx, hy, koerperH, s, figur, o, saum);

  // Und obendrauf das Fass, sobald eine Zuendschnur laeuft — unabhaengig von
  // der Pose und zusaetzlich zu allem anderen. Warum, steht bei `pulverfass`.
  if (o.fuse > 0) {
    male(ctx, FASS, hx, hy, koerperH, s, figur, o, saum);
  }
}

const FASS: Fuehrung = { zeichner: pulverfass, anbau: 'brust', winkel: 0, laenge: 6.4 };

function male(
  ctx: CanvasRenderingContext2D,
  f: Fuehrung,
  hx: number,
  hy: number,
  koerperH: number,
  s: number,
  figur: string,
  o: Wie,
  saum: string | null,
): void {
  for (const a of ansaetze(f, hx, hy, koerperH, figur)) {
    ctx.save();
    ctx.translate(a.x * s, a.y * s);
    ctx.scale(a.spiegel ? -s : s, s);
    ctx.rotate(a.bogen);
    f.zeichner(ctx, f.laenge, o, saum);
    ctx.restore();
  }
}
