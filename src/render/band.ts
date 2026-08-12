import type { SkillId } from '../core/types';
import { schopfFarbe } from './schopf';

/**
 * Das Stirnband des Wuselwerkers — sein Signalelement.
 *
 * ## Warum weder Schopf noch Maske
 *
 * Die Murmel traegt einen Haarschopf ueber dem Kopf, das Erdmaennchen eine
 * Augenmaske im Gesicht. Beides scheitert an dieser Figur, und zwar aus
 * entgegengesetzten Gruenden.
 *
 * **Ein Schopf** hat keinen Platz. Ueber dem Kopf sitzt bereits eine
 * Haarmasse, die achtzig Prozent der Zellbreite einnimmt; ein Bueschel darueber
 * waere ein Bueschel auf einem Bueschel.
 *
 * **Eine Maske** kostet zu viel. Diese Figur hat ein Gesicht mit Augen und
 * Mund — das ist ihr bestes Stueck, und deshalb liegen ihre Backwinkel
 * durchweg flacher als die des Tieres (siehe `art-src/wuselwerker/figur.json`).
 * Ein Farbband quer darueber nimmt genau das weg, wofuer die flachen Winkel
 * bezahlt wurden.
 *
 * ## Was stattdessen da ist
 *
 * Die Haarmasse selbst. Gemessen am Blatt ist sie an der Haaransatzlinie —
 * 1,2 logische Pixel ueber dem Gesichtspunkt — **acht Pixel breit**. Zum
 * Vergleich: Die Augenmaske des Erdmaennchens misst gut drei. Ein Band quer
 * ueber diese Flaeche ist das groesste Farbfeld, das an einer Zwoelf-Pixel-Figur
 * ueberhaupt unterzubringen ist, und es verdeckt nichts, was zaehlt.
 *
 * Es sitzt zudem **oben**. Im Gedraenge stehen Figuren nebeneinander, nicht
 * uebereinander; was oben liegt, bleibt sichtbar. Dasselbe Argument hat schon
 * bei Schopf und Maske entschieden.
 *
 * ## Das Band bricht die Silhouette
 *
 * Der Schwachpunkt der Maske war, dass sie **innerhalb** des Umrisses liegt und
 * damit gegen jeden Hintergrund flach wirkt. Das Band laeuft deshalb ein wenig
 * ueber das Haar hinaus und bekommt hinten ein loses Ende, das nachschwingt.
 * Der Zipfel ist nicht Zierrat: Er haengt entgegen der Blickrichtung und ist
 * damit derselbe zweite Richtungshinweis, den das Halstuch dem Tier gibt.
 */

/**
 * Form je Zustand: halbe Breite, halbe Dicke, Bogen nach oben, Winkel des
 * losen Endes in Grad (0 = waagerecht nach hinten, positiv = nach oben).
 *
 * **Alle Laengen als Vielfaches der gemessenen Kopfachse**, nicht in logischen
 * Pixeln. Die Achse ist der Abstand Gesicht → Stirn aus dem Blatt und misst in
 * elf der dreizehn Posen 1,8 bis 1,9 Pixel — in den beiden anderen weniger,
 * und genau darum geht es: `saving` schrumpft die Figur auf die Haelfte,
 * `dying` staucht sie. Ein Band in festen Pixeln blieb dabei stehen und stand
 * zuletzt groesser da als der Kopf, den es umspannen soll. In Achsen gerechnet
 * schrumpft es von selbst mit.
 *
 * Die fuenf Zustaende sind dieselben wie bei der Maske und kommen aus demselben
 * Feld der Posentabelle — ein Band kann nicht blinzeln, aber es kann rutschen
 * und flattern, und das ist bei dieser Groesse dieselbe Bandbreite.
 */
const FORM: readonly (readonly [number, number, number, number])[] = [
  [2.03, 0.26, 0.8, -40], // 0 ruhe — Band gewoelbt, Ende haengt
  [1.97, 0.28, 0.72, -16], // 1 kniff — die Arbeit: flacher, Ende zurueck
  [2.09, 0.25, 0.91, 34], // 2 weit — Schreck, Fall, Wache: Ende steht ab
  [2.06, 0.26, 0.96, 66], // 3 freude — das Ende fliegt
  [1.91, 0.3, 0.53, -66], // 4 zu — der Tod: verrutscht, Ende faellt
];

/**
 * Wie viel kuerzer die **vordere** Haelfte des Bandes ist.
 *
 * Ein Band ist ein Ring um den Kopf; im Bild sieht man davon einen Bogen. Wo
 * dieser Bogen aufhoert, entscheidet nicht seine Laenge, sondern der Umriss des
 * Haars — und der ist bei einer gedrehten Figur nicht symmetrisch. Der
 * Gesichtspunkt liegt vorn, die Haarmasse liegt dahinter: Nach hinten hat das
 * Band Platz, nach vorn stoesst es nach knapp zwei Pixeln an die Stirn.
 *
 * Ohne diese Kuerzung lief die vordere Haelfte in allen Arbeitsposen ueber die
 * Haargrenze hinaus und lag als Streifen auf Stirn und Wange — genau das, was
 * ein Band statt einer Maske vermeiden sollte.
 */
const VORN = 0.5;

/**
 * Wie hoch ueber dem Gesichtspunkt das Band liegt, als Anteil des Abstands
 * zwischen Gesichts- und Stirnpunkt.
 *
 * Beide Punkte sind aus dem Rig gemessen und stehen im Blatt (`anchors` und
 * `stirn`). Sie spannen die **Hochachse des Kopfes im Bild** auf, und das ist
 * etwas anderes als die Hochachse des Bildes.
 *
 * **Der Fehler, den das abschafft.** Die erste Fassung setzte das Band schlicht
 * 1,25 Pixel ueber den Gesichtspunkt — im Bild senkrecht nach oben. Bei
 * aufrechten Posen sass es damit richtig. Bei jeder Pose mit gesenktem Kopf
 * lag es quer im Gesicht: Der Graeber neigt den Kopf um sechsundzwanzig Grad,
 * der Rammer um vier bei zweiundfuenfzig Grad Drehung, und ein Band, das davon
 * nichts weiss, wandert genau so weit nach unten in die Augen. Auf dem Blatt
 * ist das nicht zu sehen — das Blatt ist richtig, nur das Band lag daneben.
 *
 * **Der Wert ist ausgemessen.** `.bandsitz.py` tastet die Mittellinie des
 * Bandes gegen das Blatt ab und zaehlt, worauf sie faellt: Haar, Haut oder
 * daneben. Ueber alle dreizehn Posen:
 *
 * | Hoehe | Haar | Haut |
 * |---|---|---|
 * | 0,85 | 63 % | 27 % |
 * | 1,05 | 75 % | 15 % |
 * | 1,25 | 91 % | 3 % |
 * | **1,50** | **98 %** | **0 %** |
 * | 1,85 | 98 % | 1 % daneben |
 *
 * Bemerkenswert daran ist, welche Posen den Ausschlag geben: nicht die stark
 * gedrehten Arbeitshaltungen, die im Bild am schiefsten aussahen — die lagen
 * schon bei 0,85 zu hundert Prozent im Haar —, sondern die **frontalen**.
 * Blocker, Spaeher und Sterbender halten den Kopf aufrecht, und dort sass das
 * Band mit 51 bis 58 Prozent Hautanteil quer ueber den Augen. Beim Blick auf
 * das Bild waren mir die schiefen aufgefallen.
 */
const HOEHE = 1.5;

/**
 * Das Band einer Figur **ohne** Auftrag.
 *
 * Ein dunkles Leder. Nicht der blasse Ton des Schopfs — dort hiess „kein
 * Auftrag" gleich „unauffaellig", und ein Schopf dicht am Koerperton war
 * richtig. Hier liegt das Band auf kraeftigem Blau; ein blasser Ton darauf
 * saehe nach Fleck aus statt nach Kleidungsstueck. Unbunt genug, um keinen
 * Beruf vorzutaeuschen, dunkel genug, um gegen das Haar zu stehen.
 */
const OHNE_AUFTRAG = '#4b3a2a';

/** Welche Farbe das Band traegt. Dieselbe Berufspalette wie Schopf und Maske. */
export function bandFarbe(skill: SkillId | null): string {
  return skill ? schopfFarbe(skill) : OHNE_AUFTRAG;
}

/** Dieselbe Warnlampe wie bei Schopf und Maske. */
export { schopfPuls as bandPuls } from './schopf';

/**
 * Das Stirnband zeichnen.
 *
 * @param x Gesichtspunkt auf dem Bildschirm — der Anker aus dem Manifest.
 * @param sx Stirnpunkt auf dem Bildschirm, in logischen Pixeln **relativ zum
 *   Gesichtspunkt**. Er gibt dem Band Hoehe und Neigung; fehlt er, faellt es
 *   auf die Bildhochachse zurueck.
 * @param s Bildpunkte je logischem Pixel.
 * @param spiegeln Blickt die Figur nach links?
 * @param dreh Backwinkel dieser Pose in Grad, aus dem Manifest.
 */
export function drawBand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  zustand: number,
  farbe: string,
  s: number,
  spiegeln = false,
  dreh = 0,
  stirnX = 0,
  stirnY = -2,
): void {
  const i = Math.max(0, Math.min(FORM.length - 1, Math.round(zustand)));
  const [breite, dicke, bogen, zipfelWinkel] = FORM[i];
  const bg = (dreh * Math.PI) / 180;
  // Perspektive: Was sich wegdreht, wird schmaler. Der Versatz geht hier —
  // anders als bei der Maske — **nach hinten**. Die Maske sitzt im Gesicht und
  // wandert mit ihm zur Blickseite; das Band sitzt auf dem Haar, und dessen
  // Masse bleibt bei einer gedrehten Figur hinter dem Gesichtspunkt zurueck.
  const schmal = Math.cos(bg);
  const versatz = -Math.sin(bg) * 1.1;

  // Die Hochachse des Kopfes im Bild. `atan2` liefert den Winkel des Vektors
  // Gesicht → Stirn; um ihn wird das ganze Band gedreht, damit „quer ueber den
  // Kopf" quer ueber **diesen** Kopf heisst und nicht quer ueber das Bild.
  const laengeAchse = Math.hypot(stirnX, stirnY) || 2;
  const neigung = Math.atan2(stirnY, stirnX) + Math.PI / 2;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(spiegeln ? -s : s, s);
  ctx.rotate(neigung);

  // Hinten die volle Haelfte, vorn die gekuerzte — beide perspektivisch
  // verschmaelert. Alle Masse in Achsen, deshalb hier die eine Multiplikation.
  const b = breite * laengeAchse * schmal;
  const bv = b * VORN;
  const oben = -HOEHE * laengeAchse;
  const d = dicke * laengeAchse;
  const bo = bogen * laengeAchse;

  // **Gestrichen und nicht gefuellt.** Die erste Fassung hat Band und Zipfel je
  // als gefuellte Flaeche aus zwei Bezierkurven gebaut. Am Ende stand ein
  // Hakenzeichen: An beiden Enden lief die Flaeche spitz zu, und zwei Spitzen an
  // einem Bogen liest das Auge bei zwoelf Pixeln als Pfeil, nicht als Band.
  //
  // Ein Strich mit runden Enden und fester Dicke kann das gar nicht — er ist
  // ueberall gleich breit, und genau das macht ein Band aus.
  ctx.strokeStyle = farbe;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = d * 2;

  // Das lose Ende, zuerst — das Band soll darueber liegen. Es haengt nach
  // hinten, also entgegen der Blickrichtung: Die Figur schaut in +x.
  const zw = (zipfelWinkel * Math.PI) / 180;
  const wurzelX = versatz - b * 0.92;
  const wurzelY = oben + bo * 0.12;
  const laenge = 1.4 * laengeAchse;
  ctx.lineWidth = d * 1.5;
  ctx.beginPath();
  ctx.moveTo(wurzelX, wurzelY);
  ctx.quadraticCurveTo(
    wurzelX - Math.cos(zw) * laenge * 0.55 - Math.sin(zw) * 0.5,
    wurzelY - Math.sin(zw) * laenge * 0.55 + Math.cos(zw) * 0.5,
    wurzelX - Math.cos(zw) * laenge,
    wurzelY - Math.sin(zw) * laenge,
  );
  ctx.stroke();

  // Das Band selbst: ein Bogen ueber den Haaransatz, hinten lang, vorn kurz.
  //
  // **Gewoelbt und nicht gerade.** Eine Sehne quer durch die Haarmasse schneidet
  // sie in zwei Haelften; ein Bogen, der ihrer Rundung folgt, liegt darauf. Bei
  // zwoelf Pixeln entscheidet dieser Unterschied darueber, ob man ein
  // Kleidungsstueck sieht oder einen Strich. Die Woelbung geht am hinteren Ende
  // in die Silhouette hinaus — das ist der Bruch des Umrisses, den die Maske
  // des Erdmaennchens nicht leisten konnte.
  ctx.lineWidth = d * 2;
  ctx.beginPath();
  ctx.moveTo(versatz - b, oben + bo * 0.16);
  ctx.quadraticCurveTo(versatz - b * 0.15, oben - bo, versatz + bv, oben - bo * 0.28);
  ctx.stroke();

  ctx.restore();
}
