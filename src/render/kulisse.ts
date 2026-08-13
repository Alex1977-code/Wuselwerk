import { uiBild } from '../art/ui';
import type { ThemeId } from '../levels/types';
import type { View } from './camera';
import type { Palette } from './palette';

/**
 * Die gemalte Kulisse — Bergzuege und Wolkenband aus `src/art/ui/`.
 *
 * ## Ein Satz Baender fuer fuenf Welten
 *
 * Die drei Bergzuege liegen als **entfaerbte** Graubilder vor (Wertebereich
 * 90–255, siehe `scripts/grafik-aufbereiten.py`): Die Form kommt aus dem
 * Bild, die Farbe aus der Weltpalette. Beim ersten Zeichnen wird je Schicht
 * einmal gebacken — Graubild mal Farbverlauf (`multiply`, Kamm `hills[i]`,
 * Fuss `hillsDeep[i]`), dann `destination-in` gegen das Original, damit die
 * Transparenz zurueckkommt. Danach ist jedes Bild ein `drawImage` je Kachel.
 *
 * ## Masse und Kachelung
 *
 * Vier Bildpunkte je logischem Pixel (grafikbedarf.md §3.1) — ein Band von
 * 1024 Bildpunkten ist 256 logische Pixel breit und wird in dieser Breite
 * fortlaufend gekachelt. Die Baender sind nahtlos gemalt; die Kachelkanten
 * werden auf ganze Bildschirmpixel gelegt, damit zwischen zwei Kacheln kein
 * Haarspalt aufreisst. Unter der Unterkante eines Bandes wird seine letzte
 * Bildzeile bis zum Bildrand gestreckt — so endet kein Bergzug in einer
 * schwebenden Kante, egal wie hoch das Level ist.
 *
 * ## Rueckfall
 *
 * Solange ein Bild fehlt oder noch entschluesselt wird, liefern `drawBerge`
 * und `drawWolken` `false`, und `scene.ts` zeichnet die prozeduralen
 * Huegel und Wolken weiter — das Spiel haengt nie an einer Bilddatei.
 */

interface Schicht {
  bild: HTMLCanvasElement;
  /** Parallaxfaktor — identisch mit den prozeduralen Huegelschichten. */
  faktor: number;
  /** Kachelbreite in logischen Pixeln. */
  breite: number;
  /** Bandhoehe in logischen Pixeln. */
  hoehe: number;
  /** Oberkante des Bandes in Weltkoordinaten. */
  oberkante: number;
}

/** Deckkraft des Wolkenbandes je Welt. In der Hoehle gibt es keine Wolken. */
const WOLKEN_DECKUNG: Partial<Record<ThemeId, number>> = {
  grass: 0.9,
  frost: 0.85,
  rust: 0.5,
  magma: 0.32,
};

/** Bildpunkte je logischem Pixel in den Kulissenbaendern. */
const BILD_JE_LOG = 4;

export class Kulisse {
  private schichten: Schicht[] | null = null;

  constructor(
    private palette: Palette,
    private theme: ThemeId,
    private levelW: number,
    private levelH: number,
  ) {}

  /**
   * Ein Band kacheln, mit Parallaxe wie die prozeduralen Schichten und
   * ganzzahligen Kachelkanten gegen Haarspalten.
   */
  private kacheln(
    ctx: CanvasRenderingContext2D,
    v: View,
    bild: CanvasImageSource,
    bildB: number,
    bildH: number,
    faktor: number,
    breite: number,
    hoehe: number,
    oberkante: number,
    boden: boolean,
  ): void {
    const refX = this.levelW / 2;
    const refY = this.levelH * 0.42;
    const ox = v.ox * faktor + refX * (1 - faktor);
    const oy = v.oy * faktor + refY * (1 - faktor);
    const y = v.box.y + (oberkante - oy) * v.scale;
    const hPix = hoehe * v.scale;
    const unten = v.box.y + v.box.h;

    const kante = (k: number): number => Math.round(v.box.x + (k * breite - ox) * v.scale);
    // Eine Kachel weiter links anfangen als noetig — billiger als die exakte
    // Grenze auszurechnen, und der Clip der Szene schneidet ohnehin.
    let k = Math.floor(ox / breite) - 1;
    while (kante(k) < v.box.x + v.box.w) {
      const x0 = kante(k);
      const x1 = kante(k + 1);
      if (x1 > v.box.x) {
        // Jede zweite Kachel gespiegelt. Die Baender sind als nahtlos
        // bestellt, aber die Lieferung springt an der Naht sichtbar — die
        // Spiegelung macht jede Naht konstruktiv stetig (an der Kante steht
        // beidseits dieselbe Randspalte) und halbiert nebenbei die sichtbare
        // Wiederholung.
        const spiegel = ((k % 2) + 2) % 2 === 1;
        ctx.save();
        if (spiegel) {
          // x wird zu (x0 + x1) − x: die Spanne [x0, x1] klappt in sich um.
          ctx.translate(x0 + x1, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(bild, 0, 0, bildB, bildH, x0, y, x1 - x0, hPix);
        if (boden && y + hPix < unten) {
          // Die letzte Bildzeile bis zum Bildrand strecken.
          ctx.drawImage(bild, 0, bildH - 2, bildB, 2, x0, y + hPix - 1, x1 - x0, unten - y - hPix + 2);
        }
        ctx.restore();
      }
      k++;
    }
  }

  /** Die drei Schichten einfaerben — einmal je Level. */
  private backe(): boolean {
    const namen = ['kulisse-fern', 'kulisse-mitte', 'kulisse-nah'];
    const quellen = namen.map((n) => uiBild(n));
    if (quellen.some((q) => !q)) return false;

    // Die Anker folgen den prozeduralen Schichten (Basis 0,58 der Levelhoehe,
    // Versaetze wie in `buildHills`), nur leicht nach oben gerueckt: Die
    // Oberkante eines Bandes ist sein hoechster Gipfel, nicht sein
    // Durchschnittskamm.
    const basis = this.levelH * 0.58;
    const anker = [basis - 96, basis - 60, basis - 10];
    const faktoren = [0.25, 0.45, 0.68];

    this.schichten = quellen.map((q, i) => {
      const c = document.createElement('canvas');
      c.width = q!.naturalWidth;
      c.height = q!.naturalHeight;
      const g = c.getContext('2d')!;
      g.drawImage(q!, 0, 0);
      g.globalCompositeOperation = 'multiply';
      const grad = g.createLinearGradient(0, 0, 0, c.height);
      grad.addColorStop(0, this.palette.hills[i]);
      grad.addColorStop(1, this.palette.hillsDeep[i]);
      g.fillStyle = grad;
      g.fillRect(0, 0, c.width, c.height);
      g.globalCompositeOperation = 'destination-in';
      g.drawImage(q!, 0, 0);
      return {
        bild: c,
        faktor: faktoren[i],
        breite: c.width / BILD_JE_LOG,
        hoehe: c.height / BILD_JE_LOG,
        oberkante: anker[i],
      };
    });
    return true;
  }

  /** Die Bergzuege. `false`, wenn noch prozedural gezeichnet werden muss. */
  drawBerge(ctx: CanvasRenderingContext2D, v: View): boolean {
    if (!this.schichten && !this.backe()) return false;
    for (const s of this.schichten!) {
      this.kacheln(
        ctx,
        v,
        s.bild,
        s.bild.width,
        s.bild.height,
        s.faktor,
        s.breite,
        s.hoehe,
        s.oberkante,
        true,
      );
    }
    return true;
  }

  /** Das Wolkenband. `false` in der Hoehle und solange das Bild fehlt. */
  drawWolken(ctx: CanvasRenderingContext2D, v: View): boolean {
    const deckung = WOLKEN_DECKUNG[this.theme];
    if (deckung === undefined) return false;
    const bild = uiBild('wolken');
    if (!bild) return false;
    const breite = bild.naturalWidth / BILD_JE_LOG;
    const hoehe = bild.naturalHeight / BILD_JE_LOG;
    // Das Band haengt dort, wo die prozeduralen Wolken lagen: um den
    // Bezugspunkt der Parallaxe, nicht am Dach der Welt (siehe den
    // Kommentar in `buildHills` — dort steht, warum).
    const oberkante = this.levelH * 0.42 - 56;
    ctx.save();
    ctx.globalAlpha = deckung;
    this.kacheln(ctx, v, bild, bild.naturalWidth, bild.naturalHeight, 0.12, breite, hoehe, oberkante, false);
    ctx.restore();
    return true;
  }
}
