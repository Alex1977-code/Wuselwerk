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

/**
 * Die gemessenen Haartoene des Blatts: Licht, Grundton, Schatten.
 *
 * Dieselben Werte wie in `docs/grafikbedarf.md` §1.2 — gemessen am
 * ausgelieferten Blatt, nicht erfunden. Die Zacken muessen aus demselben Haar
 * sein wie die Kuppel, sonst sind sie ein zweites Kleidungsstueck.
 */
const HAAR_LICHT = '#3D59C8';
const HAAR_GRUND = '#3851B6';
const HAAR_SCHATTEN = '#284098';

/**
 * Die Haarzacken am Scheitel — **hinter** dem Koerper gezeichnet.
 *
 * ## „Die Haare wirken wie eine Kappe"
 *
 * So die Rueckmeldung, und sie stimmt: Am Scheitel ist die gebackene Haarmasse
 * eine glatte Kuppel, und eine glatte Kuppel auf einem Kopf ist per Silhouette
 * eine Muetze. Der Unterschied zwischen Muetze und Haar liegt bei
 * sechsundzwanzig Bildschirmpixeln nicht in der Flaeche — die ist bei beiden
 * blau —, sondern im **Umriss**: Haar franst, eine Kappe nicht.
 *
 * Vier Straehnenspitzen dicht an dicht brechen deshalb die Kuppel — ein
 * ausgefranster Kamm, kein Hoernerpaar. Die erste Fassung hatte drei hohe,
 * weit auseinander; im Bild waren das zwei Teufelshoernchen, weil die mittlere
 * in der Kuppel verschwand und nur die aeusseren Spitzen herausragten. Fransen
 * entstehen aus **Ueberlappung**: kurz, breit, die Nachbarn beruehren sich.
 *
 * Sie stehen hinter dem Koerper, ihre Wurzeln verschwinden unter dem
 * gebackenen Haar, nur die Spitzen ragen heraus — dadurch mischen sie sich
 * mit der Kuppel, statt auf ihr zu kleben. Die hintere liegt im Schatten, die
 * vordere im Licht, derselben Lichtregel folgend wie der Backvorgang (warm
 * von links vorn).
 *
 * Verankert an der Kopfachse (Gesicht → Stirn), wie das Band: Die Zacken
 * nicken mit, wenn der Kopf sich senkt, und schrumpfen mit, wenn `saving` die
 * Figur halbiert. Alle Masse in Kopfachsen.
 */
export function drawHaarZacken(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  dreh = 0,
  stirnX = 0,
  stirnY = -2,
): void {
  const L = Math.hypot(stirnX, stirnY) || 2;
  const neigung = Math.atan2(stirnY, stirnX) + Math.PI / 2;
  const bg = (dreh * Math.PI) / 180;
  // Wie beim Band, nur staerker: Der Kamm sitzt auf dem **Scheitel der
  // Haarmasse**, und die liegt bei gedrehter Figur deutlich hinter dem
  // Gesichtspunkt. Mit zu wenig Versatz stand die hintere Zacke beim Laeufer
  // als einzelnes Faehnchen neben der Kuppel.
  const versatz = -Math.sin(bg) * 1.6;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.rotate(neigung);

  // [quer zur Achse, Neigung in Grad, Hoehe, halbe Breite], alles in Kopfachsen.
  //
  // Ein Viertel hoeher und etwas breiter als die erste Fassung: Bei 26
  // Bildschirmpixeln Figurenhoehe blieb der Kamm sonst ein Zierrat oben auf
  // der Kuppel — zu klein gegen die Masse, die er brechen soll. Die
  // Rueckmeldung dazu kam dreimal („wie eine Kappe").
  const zacken: readonly (readonly [number, number, number, number, string])[] = [
    [versatz - 1.35 * L, -26, 0.78 * L, 0.5 * L, HAAR_SCHATTEN],
    [versatz - 0.5 * L, -8, 1.1 * L, 0.55 * L, HAAR_GRUND],
    [versatz + 0.38 * L, 10, 1.0 * L, 0.53 * L, HAAR_GRUND],
    [versatz + 1.2 * L, 34, 0.75 * L, 0.46 * L, HAAR_LICHT],
  ];
  // Die Wurzel liegt knapp unter dem Scheitel — tief genug, dass die Flanken
  // in der Kuppel verschwinden, hoch genug, dass mehr als die Spitze zu sehen
  // ist.
  const wurzel = -2.25 * L;
  for (const [zx, grad, hoch, halb, farbe] of zacken) {
    const b = (grad * Math.PI) / 180;
    const tx = zx + Math.sin(b) * hoch;
    const ty = wurzel - Math.cos(b) * hoch;
    ctx.fillStyle = farbe;
    ctx.beginPath();
    ctx.moveTo(zx - halb, wurzel);
    // Beide Flanken gebogen, die Spitze leicht eingedreht — eine gerade Zacke
    // ist ein Dorn, eine gebogene eine Straehne.
    ctx.quadraticCurveTo(zx - halb * 0.5 + (tx - zx) * 0.35, wurzel + (ty - wurzel) * 0.55, tx, ty);
    ctx.quadraticCurveTo(zx + halb * 0.55 + (tx - zx) * 0.3, wurzel + (ty - wurzel) * 0.5, zx + halb, wurzel);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Straehnen **auf** der Haarkuppel — vor dem Bild gezeichnet.
 *
 * ## Warum die Zacken allein nicht reichten
 *
 * Die Zacken hinter dem Koerper brechen die Silhouette, aber die Flaeche
 * selbst blieb eine glatt schattierte Kuppel — und eine glatte blaue Flaeche
 * ueber dem Gesicht liest sich als Stoff, egal wie ihr Rand aussieht. Die
 * Rueckmeldung kam entsprechend zweimal: „die Haare wirken wie eine Kappe."
 *
 * Was eine Kappe von Haar unterscheidet, ist **innere Richtung**: Haar hat
 * einen Scheitel, von dem Straehnen auseinanderlaufen. Drei dunkle
 * Scheitellinien und ein heller Glanzstrich geben der Flaeche diese Richtung;
 * dazu zwei Fransen, deren Wurzeln sichtbar **auf** der Kuppel liegen und
 * deren Spitzen ueber den Rand hinausstehen — die Verbindung zwischen Flaeche
 * und Zackenkamm.
 *
 * Verankert wie Band und Zacken an der Kopfachse (Gesicht → Stirn), alle
 * Masse in Kopfachsen: Die Straehnen nicken mit und schrumpfen mit.
 */
export function drawHaarStraehnen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  dreh = 0,
  stirnX = 0,
  stirnY = -2,
): void {
  const L = Math.hypot(stirnX, stirnY) || 2;
  const neigung = Math.atan2(stirnY, stirnX) + Math.PI / 2;
  const bg = (dreh * Math.PI) / 180;
  // Derselbe Versatz wie bei den Zacken: Der Scheitel der Haarmasse liegt bei
  // gedrehter Figur hinter dem Gesichtspunkt.
  const versatz = -Math.sin(bg) * 1.6;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.rotate(neigung);
  ctx.lineCap = 'round';

  // Der Scheitelpunkt, von dem alles auslaeuft — knapp hinter der Krone.
  const sxp = versatz - 0.2 * L;
  const syp = -2.55 * L;

  // Drei dunkle Straehnenlinien: eine nach vorn zur Stirn, eine ueber die
  // Kuppelmitte, eine nach hinten in den Nacken. Halbdurchsichtig — sie
  // sollen die Flaeche gliedern, nicht zerschneiden.
  ctx.strokeStyle = HAAR_SCHATTEN;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 0.24 * L;
  const linien: readonly (readonly [number, number, number, number])[] = [
    // [Kontrollpunkt quer/hoch, Ende quer/hoch] relativ zum Scheitelpunkt.
    [0.85 * L, 0.1 * L, 1.35 * L, 0.85 * L],
    [0.35 * L, 0.5 * L, 0.55 * L, 1.15 * L],
    [-0.75 * L, 0.15 * L, -1.2 * L, 0.95 * L],
  ];
  for (const [kx, ky, ex, ey] of linien) {
    ctx.beginPath();
    ctx.moveTo(sxp, syp);
    ctx.quadraticCurveTo(sxp + kx, syp + ky, sxp + ex, syp + ey);
    ctx.stroke();
  }

  // Ein Glanzstrich auf der Lichtseite (vorn), heller als der Grundton: die
  // eine Stelle, an der Haar spiegelt und Stoff nicht.
  ctx.strokeStyle = '#5B79E4';
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 0.2 * L;
  ctx.beginPath();
  ctx.moveTo(sxp + 0.4 * L, syp + 0.06 * L);
  ctx.quadraticCurveTo(sxp + 0.95 * L, syp + 0.22 * L, sxp + 1.1 * L, syp + 0.62 * L);
  ctx.stroke();

  // Zwei Fransen, deren Wurzeln sichtbar auf der Kuppel sitzen und deren
  // Spitzen darueber hinausstehen. Sie naehen Flaeche und Zackenkamm zusammen:
  // Ohne sie waren die Zacken ein Kranz **hinter** einer glatten Kappe.
  ctx.globalAlpha = 1;
  const fransen: readonly (readonly [number, number, number, number, string])[] = [
    // [quer, Neigung Grad, Hoehe, halbe Breite]
    [versatz + 0.72 * L, 18, 0.72 * L, 0.3 * L, HAAR_LICHT],
    [versatz - 0.85 * L, -16, 0.66 * L, 0.28 * L, HAAR_GRUND],
  ];
  const wurzel = -2.15 * L;
  for (const [zx, grad, hoch, halb, farbe] of fransen) {
    const b = (grad * Math.PI) / 180;
    const tx = zx + Math.sin(b) * hoch;
    const ty = wurzel - Math.cos(b) * hoch;
    ctx.fillStyle = farbe;
    ctx.beginPath();
    ctx.moveTo(zx - halb, wurzel);
    ctx.quadraticCurveTo(zx - halb * 0.5 + (tx - zx) * 0.35, wurzel + (ty - wurzel) * 0.55, tx, ty);
    ctx.quadraticCurveTo(zx + halb * 0.55 + (tx - zx) * 0.3, wurzel + (ty - wurzel) * 0.5, zx + halb, wurzel);
    ctx.closePath();
    ctx.fill();
  }

  // --- Die Grenzgaenger: Pony, Schlaefen- und Nackenstraehne ----------------
  //
  // Der eigentliche Kappen-Toeter. Zacken und Scheitellinien arbeiten OBEN an
  // der Kuppel — die Entscheidung „Muetze oder Haar" faellt aber UNTEN, an der
  // Kante zum Gesicht: Eine Muetze endet dort mit einem glatten Rand, Haar
  // kreuzt die Grenze. Drei Ponyfransen haengen ueber die Stirn, eine Straehne
  // faellt an der Schlaefe, eine im Nacken — alle mit der Wurzel im Haar und
  // der Spitze auf der Haut. Der Gesichtspunkt liegt auf Augenhoehe, der
  // Haaransatz ~0,65 Achsen darueber; die Spitzen bleiben oberhalb von
  // -0,2 Achsen, damit sie nie in die Augen haengen.
  //
  // Der Pony haengt an der STIRN, nicht am Haarscheitel: Er bekommt keinen
  // Ruecken-Versatz, nur die perspektivische Verschmaelerung (`schmal`) — bei
  // gedrehter Figur rueckt die Stirn zusammen, sie wandert nicht nach hinten.
  const schmal = Math.cos(bg);
  const haengend = (
    zx: number,
    wy: number,
    tx: number,
    ty: number,
    halb: number,
    farbe: string,
  ): void => {
    ctx.fillStyle = farbe;
    ctx.beginPath();
    ctx.moveTo(zx - halb, wy);
    ctx.quadraticCurveTo(zx - halb * 0.5 + (tx - zx) * 0.35, wy + (ty - wy) * 0.55, tx, ty);
    ctx.quadraticCurveTo(zx + halb * 0.55 + (tx - zx) * 0.3, wy + (ty - wy) * 0.5, zx + halb, wy);
    ctx.closePath();
    ctx.fill();
  };
  // Diese Figur hat keine freie Stirn — die Haarkante sitzt direkt auf den
  // Brauen. Ein Pony ueber der Stirn landet also auf Haar und ist unsichtbar
  // (so scheiterte der erste Wurf). Was bleibt, sind drei Kanten, an denen
  // Haar wirklich gegen etwas anderes steht: die Braue (Haut darunter), die
  // Wange (Koteletten vor dem Ohr) und der Nacken. Genau dort haengen die
  // Straehnen — und der Brauenrand wird gezackt statt glatt: Der glatte Bogen
  // dort IST der Muetzenschirm.
  const pony: readonly (readonly [number, number, number, number, string])[] = [
    // [quer (x schmal), Spitze quer-Lehnung, Spitze hoch, halbe Breite]
    [0.35 * L, 0.08 * L, -0.08 * L, 0.32 * L, HAAR_SCHATTEN],
    [0.85 * L, 0.14 * L, -0.14 * L, 0.34 * L, HAAR_GRUND],
    [1.3 * L, 0.2 * L, -0.06 * L, 0.28 * L, HAAR_SCHATTEN],
  ];
  for (const [zx, lehn, ty, halb, farbe] of pony) {
    haengend(zx * schmal, -0.8 * L, zx * schmal + lehn, ty, halb, farbe);
  }
  // Die Koteletten: je eine Straehne, die an der Schlaefe bis auf die Wange
  // faellt — neben den Augen, nie darueber. Vorn wandert sie mit der
  // Perspektive, hinten haengt sie an der Haarmasse (Versatz).
  const schlaefe = Math.max(1.45, 1.85 * schmal) * L;
  haengend(schlaefe, -0.55 * L, schlaefe + 0.16 * L, 0.38 * L, 0.26 * L, HAAR_GRUND);
  haengend(versatz - 1.85 * L, -0.75 * L, versatz - 2.05 * L, 0.3 * L, 0.26 * L, HAAR_SCHATTEN);
  // Der Kranz um die Kuppel: Zwei Randzacken je Seite brechen die glatte
  // Flanke der Silhouette — bisher stach der Kamm nur oben heraus, und eine
  // Kuppel mit glatten Flanken bleibt eine Kappe, egal was am Scheitel
  // passiert.
  const rand: readonly (readonly [number, number, number, number, number, string])[] = [
    // [quer, Wurzelhoehe, Neigung Grad, Hoehe, halbe Breite]
    [versatz + 1.85 * L, -1.5 * L, 72, 0.62 * L, 0.3 * L, HAAR_LICHT],
    [versatz + 1.55 * L, -1.95 * L, 52, 0.6 * L, 0.32 * L, HAAR_GRUND],
    [versatz - 1.8 * L, -1.55 * L, -74, 0.58 * L, 0.3 * L, HAAR_SCHATTEN],
    [versatz - 1.55 * L, -2.0 * L, -50, 0.6 * L, 0.32 * L, HAAR_SCHATTEN],
  ];
  for (const [zx, wy, grad, hoch, halb, farbe] of rand) {
    const b = (grad * Math.PI) / 180;
    const tx = zx + Math.sin(b) * hoch;
    const ty = wy - Math.cos(b) * hoch;
    haengend(zx, wy, tx, ty, halb, farbe);
  }

  ctx.restore();
}

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
