import type { Terrain } from '../core/terrain';
import { MAT } from '../core/types';
import type { ThemeId } from '../levels/types';
import { paletteFor, type Palette } from './palette';

/**
 * Das Gelaende zu Bildpunkten machen.
 *
 * ## Warum das hier gemalt wird und nicht aus einer Bilddatei kommt
 *
 * Das Gelaende ist keine Kachelkarte, sondern eine **pixelgenaue Maske, die
 * sich waehrend des Spiels aendert**: Jeder Grabende schneidet ein Loch mit
 * beliebigem Rand hinein. Eine gemalte Geländegrafik muesste an jeder
 * denkbaren Schnittkante funktionieren, auch mitten im Material — daran
 * scheitern fertige Kachelsaetze. Wird die Erde dagegen aus der Maske heraus
 * berechnet, stimmt jede Kante von selbst, und es kostet kein Kilobyte in der
 * Einzeldatei.
 *
 * ## Was Erde nach Erde aussehen laesst
 *
 * Die vorherige Fassung war eine Flaechenfarbe plus Pixelrauschen plus
 * Helligkeitsverlauf. Das liest sich als **angestrichene Wand**, und zwar aus
 * vier Gruenden, die hier alle einzeln behoben sind:
 *
 * 1. **Rauschen je Bildpunkt ist Salz, kein Boden.** Echte Erde hat Klumpen in
 *    mehreren Groessen. Deshalb `wolke()`: weich verlaufendes Rauschen mit
 *    einstellbarer Feldgroesse, zweimal uebereinander — grosse Schollen, feines
 *    Korn.
 * 2. **Nur Helligkeit zu aendern wirkt wie Plastik.** Erde aendert mit der
 *    Tiefe ihre *Farbe*: oben warm und trocken, unten kuehl und satt. Darum
 *    zwei Farben (`earth`, `earthDeep`) und ein Uebergang dazwischen, nicht ein
 *    Verlauf auf einer.
 * 3. **Eine Kante ohne Verdunklung sieht ausgeschnitten aus.** Wo Material an
 *    Luft grenzt, wird es dunkler — das ist die Verschattung, die dem Auge
 *    sagt, dass hier Volumen aufhoert und nicht Farbe.
 * 4. **Unter Gras kommt nicht sofort Braun.** Zwischen Narbe und Erde liegt
 *    eine dunkle Wurzelschicht. Fehlt sie, stossen zwei Flaechen stumpf
 *    aneinander und die Narbe liest sich als aufgemalter Streifen.
 *
 * ## Was das kostet
 *
 * Nur der veraenderte Bereich wird neu berechnet, deshalb kosten auch grosse
 * Sprengungen kaum etwas. Der volle Durchlauf passiert einmal beim Laden.
 */

/** Deterministisches Pixelrauschen — gleiche Stelle, gleiche Koernung. */
function grain(x: number, y: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Weich verlaufendes Rauschen mit einstellbarer Feldgroesse.
 *
 * `grain` allein ergibt Salz und Pfeffer: Jeder Bildpunkt ist unabhaengig vom
 * Nachbarn, und das sieht aus wie Bildrauschen, nicht wie Material. Hier werden
 * stattdessen die Ecken eines Rasters ausgewuerfelt und dazwischen weich
 * ueberblendet — daraus werden Flecken in der Groesse des Rasters. Mehrere
 * Feldgroessen uebereinander ergeben die Struktur, die echter Boden hat.
 *
 * Die Ueberblendung benutzt die uebliche weiche Kurve (3t² − 2t³) statt einer
 * Geraden: Eine lineare Ueberblendung hinterlaesst sichtbare Knicke genau auf
 * den Rasterlinien, und ein regelmaessiges Gitter ist das Letzte, was Erde
 * haben darf.
 */
function wolke(x: number, y: number, feld: number): number {
  const fx = x / feld;
  const fy = y / feld;
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const a = grain(x0, y0);
  const b = grain(x0 + 1, y0);
  const c = grain(x0, y0 + 1);
  const d = grain(x0 + 1, y0 + 1);
  const oben = a + (b - a) * sx;
  const unten = c + (d - c) * sx;
  return oben + (unten - oben) * sy;
}

function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

/**
 * Wie weit nach oben geschaut wird, um die Tiefe unter der Oberflaeche zu
 * bestimmen. Zugleich der Rand, um den ein veraenderter Bereich **nach unten**
 * erweitert neu gezeichnet werden muss: Wer oben ein Loch graebt, aendert das
 * Aussehen der Bildpunkte darunter.
 */
const TIEFENSICHT = 7;

export class TerrainView {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private img: ImageData;
  private pal: Palette;
  /** Dicke der Narbe je Spalte. Haengt nur an x, also einmal je Durchlauf. */
  private narbe: Float32Array;

  constructor(
    private terrain: Terrain,
    theme: ThemeId,
  ) {
    this.pal = paletteFor(theme);
    this.canvas = document.createElement('canvas');
    this.canvas.width = terrain.width;
    this.canvas.height = terrain.height;
    const ctx = this.canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) throw new Error('2D-Kontext nicht verfügbar');
    this.ctx = ctx;
    this.img = this.ctx.createImageData(terrain.width, terrain.height);
    // Die Narbe ist unterschiedlich dick, sonst laeuft eine Linie mit
    // Zirkelgenauigkeit ueber den ganzen Bildschirm. Sie haengt nur an der
    // Spalte, also wird sie einmal berechnet und nicht je Bildpunkt.
    this.narbe = new Float32Array(terrain.width);
    for (let x = 0; x < terrain.width; x++) {
      this.narbe[x] = this.pal.crustThickness * (0.6 + wolke(x, 0, 13) * 0.9);
    }
    this.terrain.markAllDirty();
    this.sync();
  }

  /** Übernimmt alle Änderungen seit dem letzten Aufruf. */
  sync(): void {
    const d = this.terrain.consumeDirty();
    if (!d) return;
    const x0 = Math.max(0, d.x - 1);
    const y0 = Math.max(0, d.y - 1);
    const x1 = Math.min(this.terrain.width - 1, d.x + d.w);
    // Nach unten weiter als nach oben: Ein Loch veraendert die Tiefe und damit
    // das Aussehen aller Bildpunkte darunter, so weit `TIEFENSICHT` reicht.
    const y1 = Math.min(this.terrain.height - 1, d.y + d.h + TIEFENSICHT);
    this.paint(x0, y0, x1, y1);
    this.ctx.putImageData(this.img, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
  }

  private paint(x0: number, y0: number, x1: number, y1: number): void {
    const { mat, fresh, width, height } = this.terrain;
    const data = this.img.data;
    const p = this.pal;

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = y * width + x;
        const m = mat[i];
        const o = i * 4;

        if (m === MAT.EMPTY) {
          data[o + 3] = 0;
          continue;
        }

        const isFresh = fresh[i] !== 0;

        // Wie viele feste Bildpunkte stehen ueber mir? 0 heisst Oberflaeche.
        let tiefe = 0;
        while (tiefe < TIEFENSICHT) {
          const yy = y - tiefe - 1;
          if (yy < 0 || mat[i - (tiefe + 1) * width] === MAT.EMPTY) break;
          tiefe++;
        }

        // Verschattung an den Kanten. Gezaehlt wird nur seitlich und nach
        // unten: Oben ist die Lichtseite, dort wird aufgehellt statt
        // abgedunkelt.
        let offen = 0;
        if (x > 0 && mat[i - 1] === MAT.EMPTY) offen++;
        if (x < width - 1 && mat[i + 1] === MAT.EMPTY) offen++;
        if (y < height - 1 && mat[i + width] === MAT.EMPTY) offen++;

        let r: number;
        let g: number;
        let b: number;
        // Helligkeit und Waerme getrennt: Nur an der Helligkeit zu drehen
        // ergibt Plastik, weil echtes Material mit dem Licht auch seine Farbe
        // aendert.
        let hell = 0;
        let warm = 0;

        switch (m) {
          case MAT.EARTH: {
            const dick = this.narbe[x];
            // Aufgegrabene Erde traegt keine Narbe mehr — daran sieht man
            // jederzeit, wo schon gearbeitet wurde.
            if (!isFresh && tiefe < dick) {
              r = (p.crust >> 16) & 0xff;
              g = (p.crust >> 8) & 0xff;
              b = p.crust & 0xff;
              // Die oberste Reihe faengt das Licht, die unterste liegt schon im
              // Schatten der Halme darueber.
              hell += tiefe === 0 ? 16 : -9 * tiefe;
              // Halme: senkrechte Streifen. Sie haengen nur an der Spalte,
              // deshalb steht der Boden still, waehrend die Kamera schwenkt.
              if (p.crustThickness >= 2) hell += (grain(x, 7) - 0.5) * 30;
            } else {
              // Zwei Erdfarben, ueberblendet mit der Tiefe im Level. Der
              // Uebergang ist das, was aus einer Flaeche einen Querschnitt
              // macht.
              const t = Math.min(1, (y / height) * 1.25);
              const eR = (p.earth >> 16) & 0xff;
              const eG = (p.earth >> 8) & 0xff;
              const eB = p.earth & 0xff;
              r = eR + (((p.earthDeep >> 16) & 0xff) - eR) * t;
              g = eG + (((p.earthDeep >> 8) & 0xff) - eG) * t;
              b = eB + ((p.earthDeep & 0xff) - eB) * t;

              // Der dunkle Wurzelsaum direkt unter der Narbe.
              if (!isFresh && tiefe < dick + 2.2) {
                const s = 1 - (tiefe - dick) / 2.2;
                r += (((p.crustDark >> 16) & 0xff) - r) * s * 0.85;
                g += (((p.crustDark >> 8) & 0xff) - g) * s * 0.85;
                b += ((p.crustDark & 0xff) - b) * s * 0.85;
              }

              // Schollen und Korn.
              const schollen = wolke(x, y, 6.5);
              hell += (schollen - 0.5) * 24 + (grain(x, y) - 0.5) * 11;
              warm = (schollen - 0.5) * 18;

              // Kiesel: **selten und schwach**. Der erste Versuch stand auf
              // 0,86 mit voller Deckung, und das Ergebnis sah aus wie
              // verstreute Reiskoerner — ein Boden hat Steine, aber er ist
              // nicht damit bestreut. Die Schwelle laesst jetzt nur noch die
              // Spitzen des Rauschens durch, und selbst die decken die Erde nur
              // zu zwei Dritteln zu.
              //
              // Sie gehen zur *grauen* Seite, nicht zur hellen. Waeren sie nur
              // heller, laese das Auge sie als Lichtflecken statt als Material.
              const kies = wolke(x * 1.4, y, 3.4);
              if (kies > 0.9) {
                const s = Math.min(1, (kies - 0.9) * 8) * 0.66;
                r += (((p.pebble >> 16) & 0xff) - r) * s;
                g += (((p.pebble >> 8) & 0xff) - g) * s;
                b += ((p.pebble & 0xff) - b) * s;
                warm *= 0.4;
              }
              // Dunkle Einschluesse als Gegengewicht. Ein Boden, in dem nur
              // helle Dinge stecken, wirkt wie eine Fläche mit Sprenkeln; erst
              // beides zusammen wirkt wie Material mit Innenleben.
              const dunkel = wolke(x, y * 1.3, 4.2);
              if (dunkel < 0.12) hell -= (0.12 - dunkel) * 90;

              // Frisch angeschnittene Erde faengt oben Licht.
              if (tiefe === 0) hell += 13;
            }
            break;
          }
          case MAT.ROCK: {
            r = (p.rock >> 16) & 0xff;
            g = (p.rock >> 8) & 0xff;
            b = p.rock & 0xff;
            // Sedimentbaender: dasselbe Rauschen, in der Waagerechten stark
            // gestreckt. Genau diese Streckung macht aus Flecken Schichten —
            // und Schichten sind das, woran man Fels erkennt.
            hell += (wolke(x * 0.3, y, 7) - 0.5) * 30;
            // Risse. Ein schmales Band eines weichen Rauschens ergibt
            // Hoehenlinien, und die verlaufen wie Spruenge im Gestein.
            const riss = wolke(x, y, 5);
            if (riss > 0.78 && riss < 0.807) hell -= 34;
            hell += (grain(x, y) - 0.5) * 9;
            if (tiefe === 0) hell += 20;
            hell -= (y / height) * 20;
            break;
          }
          case MAT.STEEL:
            r = (p.steel >> 16) & 0xff;
            g = (p.steel >> 8) & 0xff;
            b = p.steel & 0xff;
            // Geschraubte Platten. Das Schachbrett ist die Plattenteilung, der
            // helle Punkt in der Mitte die Niete.
            hell += (((x >> 3) + (y >> 3)) & 1) === 0 ? 7 : -7;
            if (x % 8 === 4 && y % 8 === 4) hell += 36;
            if (tiefe === 0) hell += 24;
            // Stahl ist das einzige Material, das nicht zerstoerbar ist. Er darf
            // deshalb als einziges kalt glaenzen — das ist die Ansage.
            warm = -8;
            break;
          case MAT.BRICK:
            r = (p.brick >> 16) & 0xff;
            g = (p.brick >> 8) & 0xff;
            b = p.brick & 0xff;
            // Fugen quer zur Laufrichtung, damit man die einzelnen Stufen einer
            // Bruecke zaehlen kann.
            hell += x % 7 === 0 ? -26 : 5;
            if (tiefe === 0) hell += 22;
            hell += (grain(x, y) - 0.5) * 9;
            break;
          default:
            r = (p.rock >> 16) & 0xff;
            g = (p.rock >> 8) & 0xff;
            b = p.rock & 0xff;
        }

        // Verschattung an jeder Kante zur Luft. Ohne sie sieht jedes Loch
        // ausgeschnitten aus statt gegraben.
        hell -= offen * 10;
        if (isFresh) hell += p.freshBoost;

        data[o] = clamp255(r + hell + warm);
        data[o + 1] = clamp255(g + hell + warm * 0.35);
        data[o + 2] = clamp255(b + hell - warm * 0.55);
        data[o + 3] = 255;
      }
    }
  }
}
