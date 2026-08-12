import type { SkillId } from '../core/types';
import { schopfFarbe } from './schopf';

/**
 * Die Augenmaske des Erdmaennchens — sein Signalelement.
 *
 * ## Was hier an die Stelle des Schopfs tritt
 *
 * Bei der Murmel trug ein Haarschopf die ganze Aussage: Beruf, Mimik,
 * Fallschirm. Ein Erdmaennchen hat keinen Schopf, und seine Ohren sind kleine
 * runde Klappen ohne jede Bandbreite — drei Bildpunkte gross, nicht faltbar,
 * nicht spreizbar. Sie gehoeren zur Silhouette, sonst nichts.
 *
 * Der Traeger der Farbe ist deshalb die **Augenmaske**. Erdmaennchen haben
 * dunkle Augenringe; sie einzufaerben setzt die Berufsfarbe genau dorthin, wo
 * im Gedraenge nichts verdeckt wird und wo der Blick ohnehin hingeht — neben
 * die Augen, oben an der Figur.
 *
 * ## Der Preis, den das hat — und was daraus folgte
 *
 * Eine Maske liegt **innerhalb** der Silhouette. Der Schopf funktionierte auch
 * deshalb, weil er den Umriss durchbrach und dadurch gegen jeden Hintergrund
 * und ueber jede ueberlappende Figur hinweg zu sehen war. Flache Farbe im
 * Gesicht ist bei zwoelf Pixeln schwaecher.
 *
 * Genau das ist beim Spielen passiert: „Farbe fehlt." Die Maske ist knapp drei
 * logische Pixel breit, das Fell ist sandbraun, und damit war die ganze Figur
 * beige auf beige. Die Antwort steht unten als `HALSTUCH`: ein zweites farbiges
 * Element direkt unter dem Kopf, an der schmalsten Stelle der Silhouette.
 *
 * Es erscheint **nur bei einem Auftrag**, und das ist der eigentliche Gewinn:
 * Wer eines traegt, arbeitet. Das ist keine Zierde, sondern dieselbe Aussage
 * wie die Farbe — nur gross genug, um sie im Pulk zu sehen.
 *
 * ## Warum sie gezeichnet und nicht gebacken wird
 *
 * Weil sie die Berufsfarbe traegt und die zur Laufzeit feststeht. Gebacken sind
 * dagegen die **Augen** — sie sind Geometrie, drehen sich mit dem Kopf und
 * sitzen dadurch in jeder Pose richtig. Genau diese Arbeitsteilung war bei der
 * Murmel der Unterschied zwischen „sieht in die Laufrichtung" und „aufgeklebt".
 *
 * Die Maske folgt der Drehung, in der die Pose gebacken wurde (`dreh` im
 * Manifest): Sie wird um den Kosinus des Winkels schmaler und um seinen Sinus
 * versetzt. Ohne das laege ein frontales Band auf einem gedrehten Kopf.
 */

/** Die fuenf Maskenzustaende, in der Reihenfolge der Posentabellen. */
export const MASKE_ZUSTAND = ['ruhe', 'kniff', 'weit', 'freude', 'zu'] as const;

/**
 * Form je Zustand: halbe Breite, halbe Hoehe, Bogen nach oben, Neigung.
 *
 * Alles in logischen Pixeln beziehungsweise Bogenmass. Der Kopf ist gut drei
 * logische Pixel breit — die Maske ist also **kleiner als vier Pixel**, und
 * genau deshalb steht hier keine Zeichnung, sondern eine Handvoll Zahlen: Was
 * so klein ist, liest man als Fleck mit Richtung, nicht als Form.
 */
const FORM: readonly (readonly [number, number, number, number])[] = [
  [1.6, 0.62, 0.14, 0], // 0 ruhe
  [1.52, 0.4, 0.0, 0], // 1 kniff — die Arbeit
  [1.68, 0.8, 0.2, 0], // 2 weit — Schreck, Fall, Wache
  [1.6, 0.56, 0.34, 0], // 3 freude — der Bogen macht es
  [1.42, 0.22, -0.1, 0], // 4 zu — der Tod
];

/**
 * Die Maske einer Figur **ohne** Auftrag.
 *
 * Nicht der blasse Ton, den der Schopf dafuer benutzt. Bei der Murmel war „kein
 * Auftrag" gleichbedeutend mit „unauffaellig", und ein Schopf dicht am
 * Koerperton war genau richtig — die arbeitenden Figuren sollen herausstechen.
 *
 * Hier waere derselbe Griff falsch: Die Augenringe sind das, was ein
 * Erdmaennchen zu einem Erdmaennchen macht. Ohne sie steht dort ein beliebiges
 * braunes Tier. Also ein **dunkles Naturbraun** — auffaellig genug, um die Figur
 * zu kennzeichnen, unbunt genug, um keinen Beruf vorzutaeuschen. Saettigung
 * bleibt Information.
 */
const OHNE_AUFTRAG = '#4a3626';

/** Welche Farbe die Maske traegt. Dieselbe Berufspalette wie beim Schopf. */
export function maskeFarbe(skill: SkillId | null): string {
  return skill ? schopfFarbe(skill) : OHNE_AUFTRAG;
}

/**
 * Das Halstuch: halbe Breite, halbe Hoehe, Abstand unter dem Gesichtspunkt.
 *
 * Es sitzt am Hals, also an der **schmalsten Stelle** der Figur und direkt unter
 * dem Kopf. Beides ist Absicht: An der schmalsten Stelle bricht Farbe den Umriss
 * am staerksten, und unter dem Kopf liegt sie dort, wo der Blick ohnehin ist —
 * und wo im Gedraenge nichts davor steht.
 *
 * Der Zipfel nach hinten ist kein Zierrat: Er gibt dem Tuch eine Richtung und
 * damit der Figur einen zweiten Richtungshinweis neben der Schnauze.
 */
const HALSTUCH = { breite: 1.5, hoehe: 0.62, tief: 1.55, zipfel: 1.1 };

/**
 * Die Maskenfarbe waehrend der Zuendschnur.
 *
 * Dieselbe Warnlampe wie beim Schopf, damit ein Wechsel der Figur den
 * Sprengmeister nicht anders aussehen laesst. Der Puls, der Schein hinter der
 * Figur und das Licht auf ihr kommen unveraendert aus `schopf.ts` — sie haengen
 * an der Figurenmitte, nicht an einem Haarbueschel.
 */
export { schopfPuls as maskePuls } from './schopf';

/**
 * Die Maske zeichnen.
 *
 * @param x Gesichtspunkt auf dem Bildschirm — der Anker aus dem Manifest.
 * @param s Bildpunkte je logischem Pixel.
 * @param spiegeln Blickt die Figur nach links?
 * @param dreh Backwinkel dieser Pose in Grad, aus dem Manifest.
 * @param halstuch Traegt die Figur gerade einen Auftrag? Nur dann.
 */
export function drawMaske(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  zustand: number,
  farbe: string,
  s: number,
  spiegeln = false,
  dreh = 0,
  halstuch = false,
): void {
  const i = Math.max(0, Math.min(FORM.length - 1, Math.round(zustand)));
  const [breite, hoehe, bogen] = FORM[i];
  const bg = (dreh * Math.PI) / 180;
  // Perspektive: Was sich wegdreht, wird schmaler und rueckt zur Blickseite.
  const schmal = Math.cos(bg);
  const versatz = Math.sin(bg) * 0.9;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(spiegeln ? -s : s, s);
  ctx.fillStyle = farbe;

  // Das Halstuch, falls die Figur einen Auftrag hat. Zuerst gezeichnet, damit
  // die Maske darueber liegt — beide sind derselbe Farbton, und an der
  // Ueberschneidung soll das Gesicht gewinnen.
  if (halstuch) {
    const b = HALSTUCH.breite * schmal;
    ctx.beginPath();
    ctx.moveTo(versatz - b, HALSTUCH.tief);
    ctx.quadraticCurveTo(versatz, HALSTUCH.tief + HALSTUCH.hoehe * 2.1, versatz + b, HALSTUCH.tief);
    ctx.quadraticCurveTo(versatz, HALSTUCH.tief - HALSTUCH.hoehe * 0.5, versatz - b, HALSTUCH.tief);
    ctx.closePath();
    ctx.fill();
    // Der Zipfel, nach hinten haengend.
    ctx.beginPath();
    ctx.moveTo(versatz - b * 0.55, HALSTUCH.tief + HALSTUCH.hoehe * 0.4);
    ctx.lineTo(versatz - b * 0.2, HALSTUCH.tief + HALSTUCH.hoehe * 0.6);
    ctx.lineTo(versatz - b * 0.75, HALSTUCH.tief + HALSTUCH.zipfel + HALSTUCH.hoehe);
    ctx.closePath();
    ctx.fill();
  }

  // Das Band ueber beiden Augen. Ein Bogen, kein Rechteck — ein Rechteck an
  // einem Kopf sieht aus wie ein Balken, ein Bogen wie eine Zeichnung im Fell.
  ctx.beginPath();
  ctx.moveTo(versatz - breite * schmal, -hoehe * 0.2);
  ctx.quadraticCurveTo(versatz, -hoehe - bogen * 2, versatz + breite * schmal, -hoehe * 0.2);
  ctx.quadraticCurveTo(versatz, hoehe * 0.9, versatz - breite * schmal, -hoehe * 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Wie viel Platz ueber dem Kopf frei ist — fuer die Ohren.
 *
 * Sie ragen ueber die Figurenhoehe hinaus, genau wie der Schopf der Murmel, und
 * stecken deshalb an einer niedrigen Decke im Gestein. Anders als beim Schopf
 * ist der Ueberstand hier klein (die Ohren sind ein knapper logischer Pixel
 * hoch), und sie sind **gebacken** — sie lassen sich nicht ducken. Diese
 * Funktion sagt nur, ob es eng ist; der Zeichner blendet sie dann weg.
 *
 * Weglassen statt ducken ist hier die richtige Antwort: Ein Ohr, das an der
 * Decke verschwindet, ist ein Ohr, das an der Decke anliegt — und bei einem
 * Bildpunkt sieht niemand den Unterschied.
 */
export function ohrenRaum(
  solid: (x: number, y: number) => boolean,
  ax: number,
  ay: number,
): boolean {
  return !solid(Math.round(ax), Math.round(ay - 1)) && !solid(Math.round(ax), Math.round(ay - 2));
}
