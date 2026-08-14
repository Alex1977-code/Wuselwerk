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
 * ## Es bleibt im Haar — und das war eine Korrektur
 *
 * Der Schwachpunkt der Maske ist, dass sie **innerhalb** des Umrisses liegt und
 * damit gegen jeden Hintergrund flach wirkt. Daraus war zuerst der Schluss
 * gezogen, das Band solle ein Stueck ueber das Haar hinauslaufen. Das war
 * falsch, und es hat die Rueckmeldung „irgendetwas ist am Haar, was dort nicht
 * hingehoert" gekostet: Bei sechsundzwanzig Bildschirmpixeln Figurenhoehe ist
 * ein Strich neben dem Kopf kein Band, sondern ein Zweig.
 *
 * Das Band ist deshalb **nur noch der Bogen**, vollstaendig im Haar; die
 * Sichtbarkeit traegt allein die **Farbe** — acht Pixel kraeftiges Blau, auf
 * denen ein Berufston steht. Das lose Ende, das hier zweimal verteidigt und
 * zweimal fuer unauffaellig erklaert worden war, ist gestrichen: Die Messung,
 * die es freisprach, kannte nur die Mittellinie; flaechig gemessen hing es in
 * zwoelf von dreizehn Posen aus der Silhouette, beim Schirmspringer zu
 * 61 Prozent. Warum die Zahl beim Bogen steht, steht dort.
 */

/**
 * Form je Zustand: halbe Breite, halbe Dicke, Bogen nach oben.
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
const FORM: readonly (readonly [number, number, number])[] = [
  [2.03, 0.26, 0.8], // 0 ruhe — Band ruhig gewoelbt
  [1.97, 0.28, 0.72], // 1 kniff — die Arbeit: flacher, tiefer gezogen
  [2.09, 0.25, 0.91], // 2 weit — Schreck, Fall, Wache: staerker gewoelbt
  [2.06, 0.26, 0.96], // 3 freude — am weitesten auf
  [1.91, 0.3, 0.53], // 4 zu — der Tod: verrutscht und flach
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
 * Ohne Auftrag **kein Band**.
 *
 * ## Der Fehler, und warum er keiner Messung aufgefallen ist
 *
 * Die erste Fassung gab einer Figur ohne Auftrag ein dunkles Lederband —
 * gedacht als Kleidungsstueck, das immer da ist. Im Spiel sah das so aus:
 *
 * > „irgendetwas ist am haar was dort nicht hingehoert"
 *
 * Und genau so war es. Ein dunkelbrauner Bogen auf kraeftig blauem Haar, bei
 * sechsundzwanzig Bildschirmpixeln Figurenhoehe — das liest niemand als Band,
 * das liest man als Zweig im Haar. Alle Messungen sagten „98 Prozent im Haar",
 * und alle waren richtig: Sie haben geprueft, ob das Band **sitzt**, nie, ob es
 * dort **hingehoert**.
 *
 * ## Die Regel, die die anderen beiden Figuren schon hatten
 *
 * Der Schopf der Murmel liegt ohne Auftrag dicht am Koerperton — unauffaellig.
 * Das Halstuch des Erdmaennchens erscheint ueberhaupt nur mit Auftrag: Wer
 * eines traegt, arbeitet. Beide sagen dasselbe, und das Band hat es als
 * einziges nicht getan.
 *
 * Es bleibt also weg. Das kostet nichts: Der Wuselwerker ist auch ohne Band
 * unverwechselbar — blaues Haar, gruene Tunika —, waehrend das Erdmaennchen
 * sandbraun auf sandbraun war und seine Augenmaske als Kennzeichen brauchte.
 *
 * Die Zuendschnur faellt nicht darunter. `schopfAuftrag` liefert bei `fuse > 0`
 * immer `bomber`, in jedem Zustand und vor jeder anderen Regel — wer gleich
 * hochgeht, traegt ein Band, auch wenn er sonst nur laeuft.
 */
export function bandFarbe(skill: SkillId | null): string | null {
  return skill ? schopfFarbe(skill) : null;
}

/** Dieselbe Warnlampe wie bei Schopf und Maske. */
export { schopfPuls as bandPuls } from './schopf';

/*
 * Hier standen `drawHaarZacken` und `drawHaarStraehnen` — zweihundert Zeilen,
 * die dem gebackenen Kopf zur Laufzeit Zacken und Straehnen aufmalten.
 *
 * Sie sind ersatzlos entfallen, und zwar nicht, weil sie schlecht gebaut
 * waren, sondern weil sie an der falschen Stelle standen. Ein Zeichner, der
 * nur die fertige Blattzelle kennt, kann Tinte hinzufuegen — aber der grosse
 * Teil davon landet INNERHALB der vorhandenen Haarkuppel, weil dort schon
 * Haar ist. Gemessen trug der ganze Zackenkamm in der Frontansicht 4,2
 * Prozent neue Flaeche bei: sechs Bildpunkte bei Telefongroesse. Umriss
 * kauft man nicht durch Hinzufuegen.
 *
 * Die Form sitzt seit dem Haar-Umbau im Modell (`scripts/haar-bauen.mjs`):
 * Das vorhandene Lappenrelief der Haarschale wird dort gespreizt, und der
 * Kletterruck haengt am Knochen `HaarSchwung` und ist in die vier
 * Kletterbilder gebacken. Was hier bleibt, ist `drawBand` — die acht
 * Berufsfarben muessen zur Laufzeit umschaltbar sein, und ein Bogen je Figur
 * ist dafuer der richtige Preis.
 */


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
  const [breite, dicke, bogen] = FORM[i];
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

  // Das Band: ein Bogen ueber den Haaransatz, hinten lang, vorn kurz.
  //
  // **Gewoelbt und nicht gerade.** Eine Sehne quer durch die Haarmasse schneidet
  // sie in zwei Haelften; ein Bogen, der ihrer Rundung folgt, liegt darauf. Bei
  // zwoelf Pixeln entscheidet dieser Unterschied darueber, ob man ein
  // Kleidungsstueck sieht oder einen Strich.
  //
  // **Nur der Bogen — das lose Ende ist weg.** Es war als zweiter
  // Richtungshinweis gedacht und zweimal „gemessen in Ordnung": Die Messung
  // tastete die Mittellinie ab und uebersah, dass Strichbreite und runde Kappe
  // eine Flaeche zeichnen. Flaechig nachgemessen lagen beim Schirmspringer
  // 61 Prozent der Zipfeltinte **ausserhalb** der Silhouette — ein rosa Haken
  // im Himmel —, und im Zustand „weit" zeigte er nach oben aus dem Scheitel.
  // Der Bogen dagegen misst 0 bis 1,4 Prozent daneben, in jeder Pose. Die
  // Richtung zeigt die Figur selbst; das Band muss es nicht.
  ctx.lineWidth = d * 2;
  ctx.beginPath();
  ctx.moveTo(versatz - b, oben + bo * 0.16);
  ctx.quadraticCurveTo(versatz - b * 0.15, oben - bo, versatz + bv, oben - bo * 0.28);
  ctx.stroke();

  ctx.restore();
}
