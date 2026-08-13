import { uiBild } from '../art/ui';
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
 * ## Warum die Leinwand feiner ist als die Maske (`SUPER`)
 *
 * Die Spielkritik hat es an der richtigen Stelle erwischt: „genau dort, wo das
 * Spiel selbst hinzoomt, wird der Boden zu weichgezeichnetem Schmirgelpapier."
 * Der Grund war die Aufloesung, nicht die Malerei — ein Bildpunkt je logischem
 * Pixel, und die Lupe vergroessert das Zweieinhalbfache auf das Dreifache.
 * Was immer man in dieser Aufloesung malt, wird dort zu Matsch.
 *
 * Die Leinwand traegt deshalb `SUPER` Bildpunkte je logischem Pixel. Die
 * **Maske** bleibt, was sie ist — die Simulation kennt weiterhin nur logische
 * Pixel —, aber innerhalb eines Maskenpixels darf das Material Details haben:
 * Kiesel mit Licht- und Schattenkante, Wurzelfasern, Plattenfugen mit Fase.
 * Erst dadurch besteht der Boden den Blick durch die Lupe.
 *
 * ## Was Erde nach Erde aussehen laesst
 *
 * 1. **Rauschen je Bildpunkt ist Salz, kein Boden.** Echte Erde hat Klumpen in
 *    mehreren Groessen: Feuchtflecken (sehr gross), Schollen, Kiesel, Korn.
 * 2. **Nur Helligkeit zu aendern wirkt wie Plastik.** Erde aendert mit der
 *    Tiefe ihre *Farbe*: oben warm und trocken, unten kuehl und satt.
 * 3. **Eine Kante ohne Verdunklung sieht ausgeschnitten aus.** Wo Material an
 *    Luft grenzt, liegt jetzt eine schmale dunkle Konturlinie (ein
 *    Unterpixel breit) und obenauf ein heller Lichtsaum — das ist zugleich die
 *    Trennung von Spielflaeche und Kulisse, die die Kritik unter G2 verlangt:
 *    Was einen Saum hat, ist begehbar; was keinen hat, ist Hintergrund.
 * 4. **Ein Kiesel ist ein Ding, kein Fleck.** Er bekommt eine helle
 *    Oberseite und eine dunkle Unterseite aus dem Gefaelle seines eigenen
 *    Rauschfelds — das billigste Relief, das es gibt.
 *
 * ## Was das kostet
 *
 * Nur der veraenderte Bereich wird neu berechnet, deshalb kosten auch grosse
 * Sprengungen kaum etwas. Der volle Durchlauf passiert einmal beim Laden und
 * ist mit `SUPER` = 2 viermal so teuer wie vorher — gemessen im Rahmen von
 * Zehntelsekunden, einmalig.
 */

/** Bildpunkte je logischem Pixel auf der Terrain-Leinwand. */
const SUPER = 2;

/**
 * Staerke der gemalten Reliefkachel auf der Erde (`erde-relief.webp`).
 *
 * Sie liegt **additiv auf der Helligkeit**, nicht auf der Farbe: Das Bild
 * bringt Klumpen- und Krumenformen mit, die das Rauschen hier nicht hat,
 * aber Farbton und Tiefenverlauf bleiben Sache der Palette. 0 schaltet die
 * Kachel ab — der Boden sieht dann wieder aus wie vor dem Einbau.
 */
const RELIEF_STAERKE = 0.22;

/**
 * Wo die Kachel wirkt: nur auf Welten, deren Grund **Boden** ist.
 *
 * Das Bild zeigt Ackerkrume — Klumpen, Krumen, Wurzelreste. Auf dem glatten
 * Hoehlengrund der Kristallklamm lasen sich dieselben Formen in der
 * Sichtprobe als Kratzer auf blauem Stein; dort bleibt das prozedurale
 * Material allein.
 */
const RELIEF_THEMES: ReadonlySet<ThemeId> = new Set(['grass', 'rust', 'frost', 'magma']);

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
  /** Helligkeitswerte der Reliefkachel, ein Byte je Bildpunkt. */
  private relief: Uint8ClampedArray | null = null;
  private reliefB = 0;
  private reliefH = 0;
  private reliefErlaubt: boolean;

  constructor(
    private terrain: Terrain,
    theme: ThemeId,
  ) {
    this.pal = paletteFor(theme);
    this.reliefErlaubt = RELIEF_THEMES.has(theme);
    this.canvas = document.createElement('canvas');
    this.canvas.width = terrain.width * SUPER;
    this.canvas.height = terrain.height * SUPER;
    const ctx = this.canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) throw new Error('2D-Kontext nicht verfügbar');
    this.ctx = ctx;
    this.img = this.ctx.createImageData(terrain.width * SUPER, terrain.height * SUPER);
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
    // Die Reliefkachel wird asynchron entschluesselt und ist beim ersten
    // vollen Durchlauf meist noch nicht da. Sobald sie es ist, wird einmal
    // alles neu gemalt — danach kostet sie nur noch einen Tabellenblick je
    // Unterpixel.
    if (!this.relief && RELIEF_STAERKE > 0 && this.reliefErlaubt) {
      const bild = uiBild('erde-relief');
      if (bild) {
        const c = document.createElement('canvas');
        c.width = bild.naturalWidth;
        c.height = bild.naturalHeight;
        const g = c.getContext('2d', { willReadFrequently: true })!;
        g.drawImage(bild, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height);
        const flach = new Uint8ClampedArray(c.width * c.height);
        for (let i = 0; i < flach.length; i++) flach[i] = d.data[i * 4];
        this.relief = flach;
        this.reliefB = c.width;
        this.reliefH = c.height;
        this.terrain.markAllDirty();
      }
    }
    const d = this.terrain.consumeDirty();
    if (!d) return;
    const x0 = Math.max(0, d.x - 1);
    const y0 = Math.max(0, d.y - 1);
    const x1 = Math.min(this.terrain.width - 1, d.x + d.w);
    // Nach unten weiter als nach oben: Ein Loch veraendert die Tiefe und damit
    // das Aussehen aller Bildpunkte darunter, so weit `TIEFENSICHT` reicht.
    const y1 = Math.min(this.terrain.height - 1, d.y + d.h + TIEFENSICHT);
    this.paint(x0, y0, x1, y1);
    this.ctx.putImageData(
      this.img,
      0,
      0,
      x0 * SUPER,
      y0 * SUPER,
      (x1 - x0 + 1) * SUPER,
      (y1 - y0 + 1) * SUPER,
    );
  }

  private paint(x0: number, y0: number, x1: number, y1: number): void {
    const { mat, fresh, width, height } = this.terrain;
    const data = this.img.data;
    const p = this.pal;
    const zeile = width * SUPER;

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = y * width + x;
        const m = mat[i];

        if (m === MAT.EMPTY) {
          for (let uy = 0; uy < SUPER; uy++) {
            const basis = ((y * SUPER + uy) * zeile + x * SUPER) * 4;
            for (let ux = 0; ux < SUPER; ux++) data[basis + ux * 4 + 3] = 0;
          }
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

        // Offene Seiten, einzeln: Die Konturlinie liegt genau auf den
        // Unterpixeln, die an die Luft grenzen — deshalb reicht die Summe
        // nicht mehr, es zaehlt die Richtung.
        const offenL = x > 0 && mat[i - 1] === MAT.EMPTY;
        const offenR = x < width - 1 && mat[i + 1] === MAT.EMPTY;
        const offenU = y < height - 1 && mat[i + width] === MAT.EMPTY;
        const offen = (offenL ? 1 : 0) + (offenR ? 1 : 0) + (offenU ? 1 : 0);

        for (let uy = 0; uy < SUPER; uy++) {
          for (let ux = 0; ux < SUPER; ux++) {
            // Die Mitte des Unterpixels in logischen Koordinaten — daran
            // haengen alle Rauschfelder, damit das Material beim Nachbarn
            // nahtlos weitergeht.
            const xf = x + (ux + 0.5) / SUPER;
            const yf = y + (uy + 0.5) / SUPER;

            let r: number;
            let g: number;
            let b: number;
            // Helligkeit und Waerme getrennt: Nur an der Helligkeit zu drehen
            // ergibt Plastik, weil echtes Material mit dem Licht auch seine
            // Farbe aendert.
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
                  // Die oberste Reihe faengt das Licht, die unterste liegt
                  // schon im Schatten der Halme darueber.
                  hell += tiefe === 0 ? 16 : -9 * tiefe;
                  // Halme: senkrechte Streifen, jetzt in halber Pixelbreite —
                  // aus dem Streifen wird ein Grashalm.
                  if (p.crustThickness >= 2) {
                    hell += (grain(Math.floor(xf * SUPER), 7) - 0.5) * 34;
                  }
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
                  // Einzelne Wurzelfasern, die aus dem Saum haengen. Sie sind
                  // der Grund, warum der Streifen kein Streifen mehr ist.
                  if (!isFresh && tiefe < dick + 5) {
                    const faser = wolke(xf * 2.6, yf * 0.55, 2.2);
                    if (faser > 0.84) hell -= (faser - 0.84) * 130;
                  }

                  // Feuchtflecken: die groesste Ordnung. Ohne sie wiederholt
                  // sich der Boden sichtbar, mit ihnen hat er Gegenden.
                  const feucht = wolke(xf * 0.6, yf * 0.6, 26);
                  if (feucht < 0.38) {
                    hell -= (0.38 - feucht) * 46;
                    warm -= (0.38 - feucht) * 22;
                  }

                  // Schollen und Korn — Korn jetzt je Unterpixel.
                  const schollen = wolke(xf, yf, 6.5);
                  hell += (schollen - 0.5) * 24;
                  hell += (grain(x * SUPER + ux, y * SUPER + uy) - 0.5) * 12;
                  warm += (schollen - 0.5) * 18;

                  // Die gemalte Reliefkachel, additiv auf der Helligkeit.
                  if (this.relief) {
                    const rx = (x * SUPER + ux) % this.reliefB;
                    const ry = (y * SUPER + uy) % this.reliefH;
                    hell += (this.relief[ry * this.reliefB + rx] - 128) * RELIEF_STAERKE;
                  }

                  // Kiesel: selten, und jetzt mit Relief. Die helle Ober- und
                  // dunkle Unterseite kommen aus dem Gefaelle des eigenen
                  // Rauschfelds — Licht von links oben, wie ueberall im Spiel.
                  const kies = wolke(xf * 1.4, yf, 3.4);
                  if (kies > 0.88) {
                    const s = Math.min(1, (kies - 0.88) * 7) * 0.7;
                    r += (((p.pebble >> 16) & 0xff) - r) * s;
                    g += (((p.pebble >> 8) & 0xff) - g) * s;
                    b += ((p.pebble & 0xff) - b) * s;
                    const relief =
                      wolke((xf - 0.4) * 1.4, yf - 0.4, 3.4) -
                      wolke((xf + 0.4) * 1.4, yf + 0.4, 3.4);
                    hell += relief * 90 * s;
                    warm *= 0.4;
                  }
                  // Dunkle Einschluesse als Gegengewicht. Ein Boden, in dem
                  // nur helle Dinge stecken, wirkt wie eine Flaeche mit
                  // Sprenkeln; erst beides zusammen wirkt wie Material mit
                  // Innenleben.
                  const dunkel = wolke(xf, yf * 1.3, 4.2);
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
                // Grossform zuerst: Fels ist nicht gleichmaessig grau, er hat
                // hellere und dunklere Partien in Metergroesse.
                hell += (wolke(xf * 0.8, yf * 0.8, 17) - 0.5) * 18;
                // Sedimentbaender: dasselbe Rauschen, in der Waagerechten
                // stark gestreckt. Genau diese Streckung macht aus Flecken
                // Schichten — und Schichten sind das, woran man Fels erkennt.
                hell += (wolke(xf * 0.3, yf, 7) - 0.5) * 30;
                // Risse. Ein schmales Band eines weichen Rauschens ergibt
                // Hoehenlinien, und die verlaufen wie Spruenge im Gestein —
                // jetzt in Unterpixelbreite, also als Linie statt als Kette.
                const riss = wolke(xf, yf, 5);
                if (riss > 0.78 && riss < 0.796) hell -= 40;
                hell += (grain(x * SUPER + ux, y * SUPER + uy) - 0.5) * 9;
                if (tiefe === 0) hell += 20;
                hell -= (y / height) * 20;
                break;
              }
              case MAT.STEEL: {
                r = (p.steel >> 16) & 0xff;
                g = (p.steel >> 8) & 0xff;
                b = p.steel & 0xff;
                // Stahl liest sich als Metall ueber drei Dinge: **Bahnen**
                // (waagerechte Platten mit versetzten Stoessen), **Fasen**
                // (die Fuge faengt an ihrer Unterkante Licht) und **Nieten**
                // entlang der Fugen — mit Kopflicht und Randschatten, wie die
                // Kiesel. Das Schachbrett von vorher war eine Textur; das hier
                // ist eine Konstruktion.
                const bahn = Math.floor(yf / 10);
                const naht = yf - bahn * 10;
                const vers = (bahn % 2) * 9;
                const stoss = (((xf + vers) % 18) + 18) % 18;
                hell += bahn % 2 === 0 ? 5 : -4;
                if (naht < 0.55) hell -= 30;
                else if (naht < 1.05) hell += 16;
                if (stoss < 0.5) hell -= 22;
                const nx = (((xf + vers) % 6) + 6) % 6;
                const nd = Math.hypot(nx - 3, naht - 2.1);
                if (nd < 0.8) hell += nd < 0.42 ? 26 : -13;
                // Buerstenstrich: feine waagerechte Streifen je Bahn.
                hell += (grain(Math.floor(yf * SUPER * 2), bahn) - 0.5) * 7;
                if (tiefe === 0) hell += 24;
                // Stahl ist das einzige Material, das nicht zerstoerbar ist.
                // Er darf deshalb als einziges kalt glaenzen — die Ansage.
                warm = -8;
                break;
              }
              case MAT.BRICK:
                r = (p.brick >> 16) & 0xff;
                g = (p.brick >> 8) & 0xff;
                b = p.brick & 0xff;
                // Fugen quer zur Laufrichtung, damit man die einzelnen Stufen
                // einer Bruecke zaehlen kann.
                hell += (((xf % 7) + 7) % 7) < 0.55 ? -26 : 5;
                if (tiefe === 0) hell += 22;
                hell += (grain(x * SUPER + ux, y * SUPER + uy) - 0.5) * 9;
                break;
              default:
                r = (p.rock >> 16) & 0xff;
                g = (p.rock >> 8) & 0xff;
                b = p.rock & 0xff;
            }

            // Die Konturlinie: genau die Unterpixel, die an Luft grenzen,
            // werden deutlich dunkler. Sie ist die Antwort auf „Hintergrund
            // und Spielflaeche verschwimmen" — begehbares Material hat einen
            // gezogenen Rand, die Kulisse hat keinen. Obenauf stattdessen ein
            // Lichtsaum: Die Sonne steht ueber dem Level.
            if (offenL && ux === 0) hell -= 34;
            if (offenR && ux === SUPER - 1) hell -= 34;
            if (offenU && uy === SUPER - 1) hell -= 38;
            if (tiefe === 0 && uy === 0) hell += 24;
            // Die alte flaechige Verschattung bleibt, schwaecher — sie traegt
            // die Rundung, die Kontur traegt die Kante.
            hell -= offen * 6;
            if (isFresh) hell += p.freshBoost;

            const o = ((y * SUPER + uy) * zeile + (x * SUPER + ux)) * 4;
            data[o] = clamp255(r + hell + warm);
            data[o + 1] = clamp255(g + hell + warm * 0.35);
            data[o + 2] = clamp255(b + hell - warm * 0.55);
            data[o + 3] = 255;
          }
        }
      }
    }
  }
}
