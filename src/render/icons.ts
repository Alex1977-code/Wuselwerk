import { uiBild } from '../art/ui';
import type { SkillId } from '../core/types';

/**
 * Berufssymbole.
 *
 * ## Warum sie gefuellt sind und nicht gestrichelt
 *
 * Die erste Fassung waren Strichzeichnungen. Auf dem Entwurfsbildschirm sehen
 * die gut aus, auf einem Knopf von 36 Punkten Breite zerfallen sie: Ein Strich
 * von anderthalb Punkten ist auf einem Handy je nach Bildpunktdichte mal zwei
 * und mal ein Punkt breit, und wo er auf einen Nachbarstrich trifft, wird
 * daraus ein Fleck. Eine **gefuellte Flaeche** hat dieses Problem nicht — sie
 * ist bei jeder Groesse dieselbe Form.
 *
 * Der zweite Grund wiegt schwerer: Ein Symbol wird nicht gelesen, sondern
 * **wiedererkannt**, und wiedererkannt wird eine Silhouette. Ein Umriss hat
 * keine; er hat nur eine Kontur, und die muss das Auge erst zu einer Form
 * zusammensetzen.
 *
 * ## Die Familienlogik
 *
 * Drei der acht Berufe tun dasselbe in verschiedene Richtungen: Graeber nach
 * unten, Schraegbagger schraeg, Rammer waagerecht. Diese drei teilen sich
 * deshalb **eine Form** — ein Pfeil, der auf eine Wand trifft — und
 * unterscheiden sich nur im Winkel. Wer einen davon verstanden hat, versteht
 * alle drei, und im Eifer des Gefechts greift man nicht daneben.
 *
 * Die uebrigen fuenf sind Einzelgaenger und bekommen jeder eine eigene, klar
 * andere Silhouette: Leiter, Schirm, Bombe, Sperre, Treppe.
 */

/** Zeichnet einen Streckenzug als gefuellte Flaeche. */
function form(ctx: CanvasRenderingContext2D, pts: number[][]): void {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
}

/**
 * Der Pfeil, den sich Graeber, Schraegbagger und Rammer teilen.
 *
 * @param winkel Richtung in Radiant. 0 ist nach rechts.
 *
 * Gezeichnet wird immer nach rechts und dann gedreht — so ist garantiert, dass
 * die drei Symbole exakt dieselbe Form haben und sich wirklich nur im Winkel
 * unterscheiden. Zwei getrennt gezeichnete Pfeile waeren nie ganz gleich, und
 * genau diese kleinen Unterschiede zerstoeren die Wiedererkennung.
 */
function pfeilAufWand(ctx: CanvasRenderingContext2D, u: number, winkel: number): void {
  ctx.save();
  ctx.rotate(winkel);
  // Schaft
  form(ctx, [
    [-u * 0.95, -u * 0.2],
    [-u * 0.05, -u * 0.2],
    [-u * 0.05, u * 0.2],
    [-u * 0.95, u * 0.2],
  ]);
  // Spitze
  form(ctx, [
    [-u * 0.12, -u * 0.58],
    [u * 0.42, 0],
    [-u * 0.12, u * 0.58],
  ]);
  // Die Wand, auf die er trifft — aufgebrochen in drei Broecken, damit sie als
  // Material liest und nicht als Balken.
  for (let i = -1; i <= 1; i++) {
    ctx.fillRect(u * 0.6, i * u * 0.46 - u * 0.19, u * 0.34, u * 0.38);
  }
  ctx.restore();
}

/**
 * Zellenreihenfolge auf `berufe.webp`.
 *
 * Das Blatt wird von `scripts/grafik-aufbereiten.py` in genau dieser
 * Reihenfolge gebaut — sie ist die SKILLS-Reihenfolge des Spiels. Wer sie
 * dort aendert, muss sie hier aendern, sonst zeigt der Knopf den falschen
 * Beruf.
 */
const BLATT_REIHE: readonly SkillId[] = [
  'climber',
  'floater',
  'bomber',
  'blocker',
  'builder',
  'basher',
  'miner',
  'digger',
];

/**
 * Der gemalte Berufsknopf vom Blatt. `true`, wenn gezeichnet.
 *
 * Die gemalten Symbole tragen ihre eigene Farbe — Zustaende werden deshalb
 * anders gesagt als bei den Vektorformen: aufgebraucht heisst durchscheinend
 * (`gedimmt`), gewaehlt sagt weiterhin die Knopfflaeche. Fehlt das Blatt,
 * zeichnet der Aufrufer die Vektorform — beide Wege bleiben am Leben.
 */
export function drawSkillBild(
  ctx: CanvasRenderingContext2D,
  id: SkillId,
  cx: number,
  cy: number,
  s: number,
  gedimmt: boolean,
): boolean {
  const blatt = uiBild('berufe');
  if (!blatt) return false;
  const zelle = blatt.naturalHeight;
  const i = BLATT_REIHE.indexOf(id);
  if (i < 0) return false;
  ctx.save();
  if (gedimmt) ctx.globalAlpha = 0.35;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(blatt, i * zelle, 0, zelle, zelle, cx - s / 2, cy - s / 2, s, s);
  ctx.restore();
  return true;
}

export function drawSkillIcon(
  ctx: CanvasRenderingContext2D,
  id: SkillId,
  cx: number,
  cy: number,
  s: number,
  color: string,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const u = s / 2;

  switch (id) {
    case 'digger':
      pfeilAufWand(ctx, u, Math.PI / 2);
      break;
    case 'miner':
      pfeilAufWand(ctx, u, Math.PI / 4);
      break;
    case 'basher':
      pfeilAufWand(ctx, u, 0);
      break;

    case 'climber': {
      // Leiter: zwei Holme, vier Sprossen. Alles als Rechtecke, damit die
      // Sprossen bei jeder Groesse gleich dick bleiben.
      const holm = u * 0.2;
      ctx.fillRect(-u * 0.62, -u, holm, u * 2);
      ctx.fillRect(u * 0.42, -u, holm, u * 2);
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(-u * 0.62, -u * 0.72 + i * u * 0.52, u * 1.24, u * 0.17);
      }
      break;
    }

    case 'floater': {
      // Schirm: gefuellte Kuppel mit gezacktem Saum. Der Zackensaum ist der
      // Unterschied zwischen einem Schirm und einem halben Kreis.
      const r = u * 0.92;
      ctx.beginPath();
      ctx.arc(0, u * 0.12, r, Math.PI, 0);
      for (let i = 0; i < 3; i++) {
        const x0 = r - (i * 2 * r) / 3;
        ctx.lineTo(x0 - r / 3 + r / 6, u * 0.12 + r * 0.26);
        ctx.lineTo(x0 - (2 * r) / 3, u * 0.12);
      }
      ctx.closePath();
      ctx.fill();
      // Leine und Last darunter.
      ctx.fillRect(-u * 0.09, u * 0.12, u * 0.18, u * 0.62);
      ctx.fillRect(-u * 0.3, u * 0.72, u * 0.6, u * 0.28);
      break;
    }

    case 'bomber': {
      // Bombe: Kugel, Zuender, Funke. Der Funke ist das, was sie von einem
      // Punkt unterscheidet.
      ctx.beginPath();
      ctx.arc(0, u * 0.28, u * 0.66, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = u * 0.17;
      ctx.beginPath();
      ctx.moveTo(u * 0.2, -u * 0.3);
      ctx.quadraticCurveTo(u * 0.62, -u * 0.62, u * 0.5, -u * 0.95);
      ctx.stroke();
      // Vier Strahlen als Funke.
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        ctx.save();
        ctx.translate(u * 0.5, -u * 0.95);
        ctx.rotate(a);
        ctx.fillRect(-u * 0.06, -u * 0.34, u * 0.12, u * 0.28);
        ctx.restore();
      }
      break;
    }

    case 'blocker':
      // Sperre: breiter Fuss, schmaler Koerper, zwei ausgestreckte Arme. Das
      // ist die Haltung, die die Figur im Spiel einnimmt — das Symbol zeigt
      // dieselbe Silhouette wie das, was danach auf dem Feld steht.
      ctx.fillRect(-u * 0.22, -u * 0.95, u * 0.44, u * 1.6);
      ctx.fillRect(-u * 0.95, -u * 0.42, u * 1.9, u * 0.26);
      ctx.fillRect(-u * 0.62, u * 0.68, u * 1.24, u * 0.3);
      break;

    case 'builder':
      // Treppe: drei Stufen nach oben rechts, als eine Flaeche. Ein Umriss
      // haette hier fuenf Ecken zu wenig, um noch als Treppe zu lesen.
      form(ctx, [
        [-u, u],
        [-u, u * 0.3],
        [-u * 0.32, u * 0.3],
        [-u * 0.32, -u * 0.25],
        [u * 0.34, -u * 0.25],
        [u * 0.34, -u * 0.8],
        [u, -u * 0.8],
        [u, u],
      ]);
      break;
  }

  ctx.restore();
}
