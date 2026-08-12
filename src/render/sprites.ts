import { SAVING_TICKS, WUSEL_H } from '../core/constants';
import { State, type Wusel } from '../core/types';
import { standY, sx, type View } from './camera';
import { drawSchopf, schopfFarbe, schopfPuls } from './schopf';
import { drawWerkzeug } from './werkzeug';
import { LEHNE, clipForWusel } from './atlas';

/**
 * Die Murmel, im Code gezeichnet.
 *
 * ## Wofuer das gut ist
 *
 * Das Spiel darf nie auf eine Bilddatei angewiesen sein. Laedt das Blatt nicht
 * — falscher Pfad, kaputter Speicher, ein Browser, der WebP verweigert —, muss
 * es trotzdem spielbar bleiben. Diese Datei ist dieser Notausgang.
 *
 * ## Warum sie neu geschrieben wurde
 *
 * Sie zeichnete bis zuletzt die **Vorgaengerfigur**: einen violetthaarigen
 * Troll aus Rechtecken. Das war kein Notausgang mehr, sondern eine Falle. Wer
 * das Blatt nicht bekam, sah nicht eine schlichtere Murmel, sondern ein anderes
 * Spiel — und in der automatisierten Sichtprobe war es noch schlimmer: Sie
 * tauscht das Blatt fuer eine Pruefung gegen eines aus diesem Zeichner, und ab
 * da zeigte **jeder weitere Bildabzug die falsche Figur**. Man haelt so etwas
 * fuer einen Fehler im Spiel und sucht an der falschen Stelle.
 *
 * ## Was sie mit dem Blatt teilt
 *
 * Schopf und Werkzeug sind **dieselben** Zeichner wie beim gebackenen Blatt
 * (`schopf.ts`, `werkzeug.ts`). Nur der Koerper wird hier aus Kurven gebaut
 * statt aus einem Bild geholt. Damit koennen die beiden Wege gar nicht mehr
 * auseinanderlaufen: Wer eine Berufsfarbe aendert, aendert beide.
 *
 * Was hier fehlt und im Blatt steht, ist die **Feinheit der Bewegung** — die
 * zwoelf gebackenen Posen kommen aus einem gerigten Modell, hier gibt es je
 * Zustand eine Handvoll Zahlen. Das ist der Unterschied zwischen „laeuft" und
 * „sieht gut aus", und genau so ist die Aufgabenteilung gemeint.
 */

/** Aus der Vorlage: Der Koerper wird nie eingefaerbt. Farbe gehoert dem Schopf. */
const KOERPER = '#EFE3D0';
const KOERPER_TIEF = '#DCCDB4';
const SOHLE = '#D6C6AC';
const AUGEN = '#2E2A26';

/**
 * Die Haltung je Zustand.
 *
 * `neigung` in Bogenmass, positiv nach vorn. `stauch` ueber 1 macht breit und
 * flach, darunter schmal und hoch. `arme` ist der Winkel der Arme, gemessen von
 * der Waagerechten nach unten.
 */
interface Haltung {
  neigung: number;
  stauch: number;
  arme: number;
  /** Zusaetzlicher Schopfzustand, falls er nicht aus der Bewegung folgt. */
  schopf?: number;
}

/**
 * Wie weit sich die Figur je Zustand wegdreht, 0 bis 1.
 *
 * ## Warum die Rueckfallebene das selbst rechnen muss
 *
 * Das gebackene Blatt bekommt seine Dreiviertelansicht aus dem Modell
 * (`DREHUNG_GRAD` in `scripts/bake-murmel.mjs`) — dort dreht sich eine echte
 * Figur, und ihre Augen wandern von selbst mit. Hier gibt es kein Modell, nur
 * Kurven. Nachgestellt wird die Drehung deshalb aus ihren zwei sichtbaren
 * Folgen: Der Umriss wird schmaler, und die Augen ruecken in die
 * Laufrichtung.
 *
 * Die zweite Folge ist die wichtige. Genau daran ist der erste Versuch
 * gescheitert, der nur gestaucht hat: Ohne wandernde Augen sieht die Figur
 * weiter geradeaus, egal wie schmal sie wird.
 *
 * Die Werte sind die Sinuswerte der Winkel aus dem Backskript, gerundet — so
 * laufen beide Wege nicht auseinander, wenn jemand dort etwas aendert.
 */
export const PROFIL: Record<string, number> = {
  walking: 0.67,
  falling: 0.41,
  floating: 0.31,
  climbing: 0.5,
  hoisting: 0.56,
  building: 0.62,
  bashing: 0.56,
  mining: 0.59,
  digging: 0.44,
  blocking: 0,
  saving: 0.28,
  dying: 0,
};

const HALTUNG: Record<string, Haltung> = {
  walking: { neigung: 0.1, stauch: 1, arme: 0.35 },
  falling: { neigung: -0.12, stauch: 0.93, arme: -0.7, schopf: 5 },
  floating: { neigung: 0, stauch: 1.04, arme: -0.25, schopf: 8 },
  climbing: { neigung: 0.22, stauch: 0.96, arme: -0.9, schopf: 6 },
  hoisting: { neigung: 0.5, stauch: 0.98, arme: -0.6, schopf: 6 },
  building: { neigung: 0.34, stauch: 1, arme: 0.15, schopf: 4 },
  bashing: { neigung: 0.4, stauch: 1, arme: 0.05, schopf: 3 },
  mining: { neigung: 0.5, stauch: 1, arme: 0.4, schopf: 3 },
  digging: { neigung: 0.12, stauch: 1.12, arme: 0.8, schopf: 5 },
  blocking: { neigung: 0, stauch: 1.08, arme: 0, schopf: 0 },
  saving: { neigung: 0, stauch: 1, arme: 0.3, schopf: 5 },
  dying: { neigung: 0, stauch: 1, arme: 0.5, schopf: 7 },
};

/** Der Koerper: ein Ei, unten breiter als oben. */
function koerper(ctx: CanvasRenderingContext2D, b: number, h: number): void {
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.bezierCurveTo(b * 0.62, -h, b, -h * 0.52, b, -h * 0.28);
  ctx.bezierCurveTo(b, -h * 0.06, b * 0.6, 0, 0, 0);
  ctx.bezierCurveTo(-b * 0.6, 0, -b, -h * 0.06, -b, -h * 0.28);
  ctx.bezierCurveTo(-b, -h * 0.52, -b * 0.62, -h, 0, -h);
  ctx.closePath();
  ctx.fill();
}

export function drawWusel(
  ctx: CanvasRenderingContext2D,
  v: View,
  w: Wusel,
  tick: number,
  platz = Infinity,
): void {
  if (w.state === State.DEAD || w.state === State.SAVED) return;
  const pose = clipForWusel(w);
  if (!pose) return;
  const ha = HALTUNG[pose] ?? HALTUNG.walking;
  const profil = PROFIL[pose] ?? 0;

  const s = v.scale;
  const fx = Math.round(sx(v, w.x));
  const fy = Math.round(standY(v, w.y));

  // Die beiden einmaligen Ablaeufe schrumpfen beziehungsweise flachen ab. Der
  // Fortschritt kommt aus der Uhr der Figur, nicht aus einem globalen Takt.
  //
  // Beides steht hier und nicht in der Szene, weil das gebackene Blatt es
  // genauso macht: Seine sechs Rettungsbilder zeigen eine Figur, die kleiner
  // wird. Was die Szene beisteuert, ist allein der **Bogen zum Tor** — der
  // braucht die Stelle des Tors, und die kennt nur sie. Stuende das Schrumpfen
  // auch dort, schrumpfte die Figur auf diesem Weg zweimal.
  let schwund = 1;
  let platt = 1;
  let deckung = 1;
  if (w.state === State.SAVING) {
    const t = Math.min(1, w.timer / SAVING_TICKS);
    schwund = Math.max(0.05, 1 - t);
    deckung = Math.max(0, 1 - t * 0.9);
  } else if (w.state === State.DYING) {
    const t = Math.min(1, w.timer / 26);
    platt = 1 + t * 2.6;
    schwund = Math.max(0.08, 1 - t * 0.9);
  }

  const h = WUSEL_H * schwund;
  const breite = WUSEL_H * 0.38 * ha.stauch * platt;
  // Im Gehen wippt die Figur. Ein Kiesel ohne Beine kann nur federn, und genau
  // das ist seine Gangart.
  const wippe = pose === 'walking' ? Math.sin(tick / 3.2) * 0.4 : 0;

  ctx.save();
  ctx.globalAlpha = deckung;
  ctx.translate(fx, fy);
  ctx.scale(w.dir < 0 ? -s : s, s);
  // Haltung **und** Neigung in die Laufrichtung. Die Haltung sagt, was die Figur
  // gerade tut; die Neigung sagt, wohin sie will — und genau die fehlte, weshalb
  // eine gehende Murmel seitwaerts zu rutschen schien statt zu laufen. Dieselbe
  // Tabelle wie beim gebackenen Blatt, damit beide Wege gleich laufen.
  ctx.rotate(ha.neigung * 0.5 + (LEHNE[pose] ?? 0));
  // Die Dreiviertelansicht: schmaler, weil eine weggedrehte Figur schmaler
  // erscheint. Siehe `PROFIL` — das Verschieben der Augen weiter unten ist der
  // wichtigere Teil davon.
  if (profil > 0) ctx.scale(1 - profil * 0.22, 1);
  ctx.translate(0, wippe);

  // Fuesse zuerst — sie liegen hinter dem Koerper und schauen nur unten heraus.
  ctx.fillStyle = SOHLE;
  for (const seite of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(seite * breite * 0.42, -h * 0.03, breite * 0.3, h * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Arme. Sie haengen am oberen Koerperdrittel, nicht an der Mitte — sonst
  // wirken sie wie Henkel.
  ctx.strokeStyle = KOERPER_TIEF;
  ctx.lineWidth = breite * 0.17;
  ctx.lineCap = 'round';
  for (const seite of [-1, 1]) {
    const laenge = breite * 0.95;
    const wi = ha.arme + (seite < 0 ? 0.25 : 0);
    ctx.beginPath();
    ctx.moveTo(seite * breite * 0.72, -h * 0.58);
    ctx.lineTo(
      seite * (breite * 0.72 + Math.cos(wi) * laenge),
      -h * 0.58 + Math.sin(wi) * laenge,
    );
    ctx.stroke();
  }

  ctx.fillStyle = KOERPER;
  koerper(ctx, breite, h);

  // Augen: zwei Punkte im oberen Drittel. Sie sind das Einzige im Koerper, was
  // dunkel sein darf — deshalb darf auch kein Werkzeug hineinragen.
  //
  // Und sie wandern in die Laufrichtung. **Das ist der eigentliche Punkt der
  // ganzen Dreiviertelansicht**: Ein Koerper, der sich um die Hochachse dreht,
  // verschiebt seine Augen zur Seite, weil sie vorn auf ihm sitzen. Neigen und
  // Stauchen erzeugen das nicht — beim gebackenen Blatt geht es nur ueber das
  // Modell, hier geht es, weil diese Augen im Code entstehen.
  //
  // Zugleich ruecken sie zusammen: Der Abstand zweier Punkte auf einer
  // gedrehten Kugel verkuerzt sich mit dem Kosinus.
  if (deckung > 0.2 && platt < 2) {
    ctx.fillStyle = AUGEN;
    const ar = Math.max(0.5, breite * 0.13);
    const versatz = breite * 0.46 * profil;
    const abstand = breite * 0.3 * (1 - profil * 0.3);
    for (const seite of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(versatz + seite * abstand, -h * 0.66, ar, ar * 1.15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Werkzeug und Schopf, mit denselben Zeichnern wie beim gebackenen Blatt.
  drawWerkzeug(ctx, pose, breite * 0.55, -h * 0.5, h, 1);
  const zustand =
    ha.schopf ?? (pose === 'walking' ? 1 + (Math.floor(tick / 6) % 2) : 0);
  drawSchopf(ctx, 0, -h, zustand, schopfPuls(schopfFarbe(auftragVon(w)), w.fuse), 1, false, platz);

  ctx.restore();
  ctx.globalAlpha = 1;
}

/**
 * Derselbe Schluss wie im Blattzeichner, nur ohne Umweg ueber den Atlas.
 *
 * Bewusst hier dupliziert und nicht importiert: `atlas.ts` importiert diese
 * Datei nicht, und ein Import in die Gegenrichtung waere ein Kreis. Die Regel
 * ist drei Zeilen lang; ein Kreis waere teurer als die Wiederholung.
 */
function auftragVon(w: Wusel) {
  if (w.fuse > 0) return 'bomber' as const;
  switch (w.state) {
    case State.BLOCKING:
      return 'blocker' as const;
    case State.BUILDING:
      return 'builder' as const;
    case State.BASHING:
      return 'basher' as const;
    case State.MINING:
      return 'miner' as const;
    case State.DIGGING:
      return 'digger' as const;
    case State.CLIMBING:
    case State.HOISTING:
      return 'climber' as const;
    case State.FALLING:
      return w.hasFloater ? ('floater' as const) : null;
    default:
      return null;
  }
}

/*
 * Der Sprengcountdown steht nicht mehr hier.
 *
 * Er war zuletzt eine leere Funktion, die nichts zeichnete — ein Ueberrest aus
 * der Zeit, als eine Ziffer ueber dem Kopf stand. Die Warnlampe (Schein hinter
 * der Figur, Licht auf ihr, gluehender Schopf) liegt jetzt vollstaendig in
 * `schopf.ts` und wird von `scene.ts` fuer beide Zeichenwege gemeinsam
 * aufgerufen. Eine leere Anlaufstelle stehen zu lassen, haette nur so
 * ausgesehen, als gaebe es hier noch etwas.
 */
