import type { KartenPunkt } from '../levels/welten';
import type { LevelKarte, WeltKarte, Weltkarte } from '../progression';
import type { SpriteAtlas } from './atlas';
import { COL } from './hud';
import type { Box, Layout } from './layout';
import { paletteFor } from './palette';

/**
 * Die Übersichtskarte.
 *
 * ## Was sie ist
 *
 * **Ein einziges waagerechtes Band** über alle Welten, kein Blättern. Man
 * scrollt daran entlang wie an einem Weg, und genau das ist der Sinn: Der
 * Fortschritt soll als **Strecke** erfahrbar sein, nicht als Liste. Eine Liste
 * sagt „Level 7 von 15"; ein Band sagt „so weit bist du gekommen, und da vorne
 * geht es weiter".
 *
 * ## Warum in Bildschirmbreiten gerechnet wird
 *
 * Die Punkte in `progression.ts` liegen in **Bildschirmbreiten** (x) und
 * Anteilen der Bandhöhe (y), nicht in Bildpunkten. Damit ist die Karte
 * auflösungsfrei: Ein schmaleres Gerät zeigt denselben Ausschnitt, nur kleiner,
 * und niemand muss umrechnen. Ein Punktabstand von 0,24 Breiten heisst, dass
 * immer gut vier Stationen gleichzeitig im Bild sind — genug, um zu sehen,
 * woher man kommt und wohin es geht, ohne dass es zur Landkarte wird.
 *
 * ## Was hier bewusst *nicht* gezeichnet wird
 *
 * Kein Punkt für ein Level, das es noch nicht gibt. `weltkarte()` liefert nur
 * gebaute Level, und die Karte zeigt nur, was sie bekommt — sie soll nichts
 * versprechen, was das Spiel nicht hält.
 */

/** Ein antippbarer Punkt auf der Karte. */
export interface KarteTreffer extends Box {
  art: 'level' | 'tor';
  /** Bei `art === 'level'` die Level-Kennung. */
  id: string;
  /** Ist er anwählbar? Gesperrte Punkte werden gezeichnet, aber nicht bedient. */
  offen: boolean;
}

/** Was der Zeichner über den Zustand der Karte wissen muss. */
export interface KarteAnsicht {
  karte: Weltkarte;
  /** Linke Kante des Ausschnitts, in Bildschirmbreiten. */
  kamera: number;
  /** Stelle der Figur. Weicht während der Wanderung von `karte.figur` ab. */
  figur: KartenPunkt | null;
  /** Läuft die Figur gerade? Dann geht sie, sonst steht sie. */
  laeuft: boolean;
  /** Blickrichtung der Figur. */
  richtung: 1 | -1;
  /** Zähler für alles Bewegte, in Bildern. */
  anim: number;
  atlas: SpriteAtlas | null;
}

/** Oberer und unterer Rand des Bandes im Bild. */
const BAND_OBEN = 0.3;
const BAND_UNTEN = 0.86;

function bandY(L: Layout, y: number): number {
  return L.cssH * (BAND_OBEN + y * (BAND_UNTEN - BAND_OBEN));
}

/** Radius eines Levelpunktes. Er haengt an der Breite, nicht an der Hoehe. */
function punktR(L: Layout): number {
  return Math.max(13, Math.min(26, L.cssW * 0.032));
}

function kreis(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

/**
 * Ein Stern, gezeichnet als Zackenring.
 *
 * Klein und gefuellt — bei einem Durchmesser von zehn Bildpunkten ist ein
 * Umriss nicht mehr als ein Fleck, eine Flaeche dagegen immer noch ein Stern.
 */
function stern(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const w = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(w) * rr;
    const py = y + Math.sin(w) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Der Hintergrund: je Welt ihr eigener Himmel.
 *
 * Jeder Weltabschnitt bekommt den Verlauf seiner eigenen Palette, beschnitten
 * auf seinen Streifen. Beim Scrollen wandert man dadurch sichtbar **von einer
 * Welt in die naechste** — das ist billiger und wirksamer als jede Beschriftung.
 * Welten ohne eigene Palette bekommen die der Wiese; sie sind noch nicht
 * gebaut, und ein Platzhalterhimmel waere eine Ankuendigung ohne Deckung.
 */
function grund(ctx: CanvasRenderingContext2D, L: Layout, a: KarteAnsicht): void {
  ctx.fillStyle = '#0a0e16';
  ctx.fillRect(0, 0, L.cssW, L.cssH);
  for (const w of a.karte.welten) {
    const x0 = (w.bandStart - a.kamera) * L.cssW;
    const breite = w.bandBreite * L.cssW;
    if (x0 + breite < -8 || x0 > L.cssW + 8) continue;
    const p = paletteFor(w.welt.kartenTheme);
    const g = ctx.createLinearGradient(0, 0, 0, L.cssH);
    g.addColorStop(0, p.skyTop);
    g.addColorStop(0.55, p.skyMid);
    g.addColorStop(1, p.skyBottom);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, 0, breite, L.cssH);
    ctx.clip();
    ctx.fillStyle = g;
    ctx.fillRect(x0, 0, breite, L.cssH);
    // Hügel hinter dem Band.
    //
    // Ohne sie schwebt der Weg im Himmel und die Karte liest sich als
    // Diagramm — eine Kette von Kreisen auf einer blauen Fläche. Zwei
    // gestaffelte Hügelzüge geben ihm einen Grund, auf dem er liegen kann, und
    // dieselbe Luftperspektive wie im Spiel: was weiter weg ist, ist heller und
    // blasser. Damit ist die Karte derselbe Ort wie das Spielfeld und nicht
    // dessen Inhaltsverzeichnis.
    //
    // Die Form kommt aus dem Bandanfang, ist also je Welt fest, ohne dass
    // irgendwo eine Zahl gespeichert wäre.
    const kette = (tiefe: number, farbe: string, phase: number): void => {
      ctx.fillStyle = farbe;
      ctx.beginPath();
      const yBasis = bandY(L, 0.72 + tiefe * 0.34);
      const hub = L.cssH * (0.075 - tiefe * 0.03);
      ctx.moveTo(x0, L.cssH);
      const schritt = Math.max(24, L.cssW * 0.06);
      for (let px = x0 - schritt; px <= x0 + breite + schritt; px += schritt) {
        const t = (px - x0) / L.cssW + phase + w.bandStart;
        const y = yBasis - Math.sin(t * 2.1) * hub - Math.sin(t * 0.83 + 1.7) * hub * 0.6;
        ctx.lineTo(px, y);
      }
      ctx.lineTo(x0 + breite, L.cssH);
      ctx.closePath();
      ctx.fill();
    };
    kette(0, p.hills[1], 0.4);
    kette(1, p.hills[2], 1.9);

    // Der Boden ganz unten schliesst das Bild ab.
    ctx.fillStyle = `#${(p.earth >>> 0).toString(16).padStart(6, '0')}`;
    ctx.fillRect(x0, bandY(L, 1.16), breite, L.cssH);
    ctx.fillStyle = `#${(p.crust >>> 0).toString(16).padStart(6, '0')}`;
    ctx.fillRect(x0, bandY(L, 1.16), breite, Math.max(2, L.cssH * 0.014));
    ctx.restore();
  }
}

/**
 * Der Weg zwischen den Stationen.
 *
 * Zwei Durchgaenge: erst die ganze Strecke matt, dann der bereits gegangene
 * Teil hell darueber. So sieht man auf einen Blick, wie weit man ist, **ohne
 * eine Zahl zu lesen** — und der helle Teil hoert genau dort auf, wo die Figur
 * steht.
 *
 * Gezogen wird durch die Mittelpunkte je zweier Punkte, mit dem Punkt selbst
 * als Kontrollpunkt. Das ist dieselbe Glaettung wie bei den Huegeln und kostet
 * nichts; ein Streckenzug aus Geraden saehe aus wie ein Schaltplan.
 */
function weg(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  a: KarteAnsicht,
  punkte: KartenPunkt[],
  bis: number,
  farbe: string,
  breite: number,
): void {
  if (punkte.length < 2) return;
  const p = punkte.map((k) => ({
    x: (k.x - a.kamera) * L.cssW,
    y: bandY(L, k.y),
  }));
  ctx.save();
  ctx.strokeStyle = farbe;
  ctx.lineWidth = breite;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(p[0].x, p[0].y);
  const ende = Math.max(1, Math.min(p.length - 1, bis));
  for (let i = 1; i < ende; i++) {
    const mx = (p[i].x + p[i + 1 < p.length ? i + 1 : i].x) / 2;
    const my = (p[i].y + p[i + 1 < p.length ? i + 1 : i].y) / 2;
    ctx.quadraticCurveTo(p[i].x, p[i].y, mx, my);
  }
  ctx.lineTo(p[ende].x, p[ende].y);
  ctx.stroke();
  ctx.restore();
}

/** Ein Levelpunkt mit Nummer, Sternen und Zustand. */
function levelPunkt(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  a: KarteAnsicht,
  lv: LevelKarte,
): KarteTreffer {
  const r = punktR(L);
  const x = (lv.pos.x - a.kamera) * L.cssW;
  const y = bandY(L, lv.pos.y);

  if (lv.zustand === 'gesperrt') {
    // Gesperrtes bleibt klein und stumpf. Es soll zu sehen sein, damit man
    // weiss, dass es weitergeht — aber es darf nicht einladen.
    ctx.fillStyle = 'rgba(12, 18, 30, 0.62)';
    kreis(ctx, x, y, r * 0.62);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 170, 200, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    const fertig = lv.zustand === 'geschafft';
    // Ein Schlagschatten setzt den Punkt auf den Weg, statt ihn hineinzumalen.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    kreis(ctx, x, y + r * 0.16, r);
    ctx.fill();

    const g = ctx.createLinearGradient(0, y - r, 0, y + r);
    if (fertig) {
      g.addColorStop(0, '#7ee8b0');
      g.addColorStop(1, '#2f9c6a');
    } else {
      g.addColorStop(0, '#ffd964');
      g.addColorStop(1, '#e09a1c');
    }
    ctx.fillStyle = g;
    kreis(ctx, x, y, r);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (!fertig) {
      // Das naechste offene Level pulst. Es ist der einzige Punkt der Karte,
      // der Aufmerksamkeit verlangt — alles andere ist Auskunft.
      const puls = 0.5 + 0.5 * Math.sin(a.anim / 16);
      ctx.strokeStyle = `rgba(255, 217, 100, ${0.16 + 0.3 * puls})`;
      ctx.lineWidth = 3;
      kreis(ctx, x, y, r + 5 + puls * 5);
      ctx.stroke();
    }

    ctx.fillStyle = '#121a2a';
    ctx.font = `700 ${Math.round(r * 0.95)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(lv.nr), x, y + 1);

    // Sterne unter dem Punkt, drei Plaetze, erreichte gefuellt.
    if (fertig) {
      const sr = r * 0.3;
      for (let i = 0; i < 3; i++) {
        const sx0 = x + (i - 1) * sr * 2.6;
        const sy0 = y + r + sr * 1.5;
        ctx.fillStyle = i < lv.sterne ? COL.accent : 'rgba(255, 255, 255, 0.22)';
        stern(ctx, sx0, sy0, sr);
      }
    }
  }

  return {
    art: 'level',
    id: lv.id,
    offen: lv.zustand !== 'gesperrt',
    x: x - r - 6,
    y: y - r - 6,
    w: r * 2 + 12,
    h: r * 2 + 12,
  };
}

/**
 * Der Rastplatz einer Etappe — eine Laterne.
 *
 * Sie steht dort, wo eine Etappe endet, und brennt, sobald die Etappe fertig
 * ist. Ihr Zweck ist nicht Schmuck: Bei zehn bis fuenfzehn Punkten je Welt
 * braucht das Auge Zwischenmarken, sonst ist das Band eine Perlenkette ohne
 * Gliederung. Und die brennende Laterne ist die kleine Belohnung dazwischen,
 * die eine Welt sonst erst nach zwoelf Leveln haette.
 */
function laterne(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  a: KarteAnsicht,
  pos: KartenPunkt,
  brennt: boolean,
): void {
  const x = (pos.x - a.kamera) * L.cssW;
  const y = bandY(L, pos.y);
  const h = punktR(L) * 1.5;
  if (brennt) {
    const puls = 0.6 + 0.4 * Math.sin(a.anim / 21);
    const g = ctx.createRadialGradient(x, y - h * 0.75, 0, x, y - h * 0.75, h * 1.7);
    g.addColorStop(0, `rgba(255, 222, 150, ${0.5 * puls})`);
    g.addColorStop(1, 'rgba(255, 222, 150, 0)');
    ctx.fillStyle = g;
    kreis(ctx, x, y - h * 0.75, h * 1.7);
    ctx.fill();
  }
  ctx.fillStyle = brennt ? '#6c5636' : '#3a4152';
  ctx.fillRect(x - h * 0.07, y - h, h * 0.14, h);
  ctx.fillStyle = brennt ? '#ffe1a0' : '#2c3344';
  ctx.beginPath();
  ctx.moveTo(x - h * 0.24, y - h * 0.72);
  ctx.lineTo(x + h * 0.24, y - h * 0.72);
  ctx.lineTo(x + h * 0.17, y - h * 1.12);
  ctx.lineTo(x - h * 0.17, y - h * 1.12);
  ctx.closePath();
  ctx.fill();
}

/** Das Weltentor am Ende eines Abschnitts. */
function tor(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  a: KarteAnsicht,
  w: WeltKarte,
): KarteTreffer | null {
  const x = (w.tor.x - a.kamera) * L.cssW;
  const y = bandY(L, w.tor.y);
  const r = punktR(L) * 1.35;
  const offen = w.fertig;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(x - r, y - r * 1.9 + r * 0.2, r * 2, r * 1.9);

  // Pfosten und Sturz — ein Tor braucht drei Balken, mehr nicht.
  ctx.fillStyle = offen ? '#c9a86a' : '#4c5468';
  ctx.fillRect(x - r, y - r * 1.9, r * 0.34, r * 1.9);
  ctx.fillRect(x + r - r * 0.34, y - r * 1.9, r * 0.34, r * 1.9);
  ctx.fillRect(x - r, y - r * 2.15, r * 2, r * 0.32);

  if (offen) {
    // Ein offenes Tor leuchtet hindurch — dieselbe Geste wie beim Ausgang im
    // Spiel, damit man sie nicht zweimal lernen muss.
    const puls = 0.6 + 0.4 * Math.sin(a.anim / 19);
    const g = ctx.createLinearGradient(0, y - r * 1.9, 0, y);
    g.addColorStop(0, `rgba(255, 236, 180, ${0.1 * puls})`);
    g.addColorStop(1, `rgba(255, 236, 180, ${0.5 * puls})`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r * 0.66, y - r * 1.9, r * 1.32, r * 1.9);
  } else {
    ctx.fillStyle = 'rgba(10, 14, 22, 0.72)';
    ctx.fillRect(x - r * 0.66, y - r * 1.9, r * 1.32, r * 1.9);
  }

  if (w.torZiel) {
    ctx.fillStyle = offen ? COL.text : COL.dim;
    ctx.font = `600 ${Math.round(r * 0.42)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(w.torZiel, x, y + r * 0.4);
  }
  return null;
}

/** Der Name der Welt, gross ueber ihrem Abschnitt. */
function weltName(ctx: CanvasRenderingContext2D, L: Layout, a: KarteAnsicht, w: WeltKarte): void {
  const x0 = (w.bandStart - a.kamera) * L.cssW;
  const breite = w.bandBreite * L.cssW;
  // Die Beschriftung bleibt im Bild, solange ihr Abschnitt es tut: Sie klebt an
  // der linken Kante, statt mit dem Abschnitt hinauszuwandern. Sonst weiss man
  // mitten in einer Welt nicht mehr, in welcher man ist.
  const x = Math.min(Math.max(x0 + 16, 16), Math.max(16, x0 + breite - 16));
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(10, 16, 26, 0.5)';
  ctx.font = `800 ${Math.round(L.cssH * 0.055)}px system-ui, sans-serif`;
  ctx.fillText(w.welt.name, x + 1.5, L.cssH * 0.075 + 1.5);
  ctx.fillStyle = w.betreten ? COL.text : COL.dim;
  ctx.fillText(w.welt.name, x, L.cssH * 0.075);
  ctx.font = `600 ${Math.round(L.cssH * 0.028)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(234, 242, 255, 0.72)';
  ctx.fillText(
    `${w.geschafft}/${w.level.length} · ${w.sterne}/${w.sterneMoeglich} ★`,
    x,
    L.cssH * 0.075 + L.cssH * 0.062,
  );
}

/**
 * Zeichnet die ganze Karte und liefert die antippbaren Punkte.
 *
 * Reihenfolge ist Absicht: Hintergrund, Weg, Laternen, Tore, Levelpunkte,
 * Figur. Die Figur zuletzt, weil sie auf einem Punkt stehen kann und dann
 * darueber gehoert — sie ist das, was man sucht, wenn man die Karte oeffnet.
 */
export function drawWeltkarte(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  a: KarteAnsicht,
): KarteTreffer[] {
  grund(ctx, L, a);

  const treffer: KarteTreffer[] = [];

  for (const w of a.karte.welten) {
    const x0 = (w.bandStart - a.kamera) * L.cssW;
    if (x0 + w.bandBreite * L.cssW < -60 || x0 > L.cssW + 60) continue;

    // Der Weg dieser Welt: alle Levelpunkte, dann das Tor.
    const punkte: KartenPunkt[] = [...w.level.map((l) => l.pos), w.tor];
    // Bis wohin er hell ist: bis zum letzten geschafften Punkt.
    const hell = w.level.filter((l) => l.zustand === 'geschafft').length;
    weg(ctx, L, a, punkte, punkte.length - 1, 'rgba(20, 28, 44, 0.55)', punktR(L) * 0.7);
    if (hell > 0) weg(ctx, L, a, punkte, hell, '#ffd15c', punktR(L) * 0.4);

    for (const e of w.etappen) laterne(ctx, L, a, e.rast, e.fertig);
    tor(ctx, L, a, w);
    for (const lv of w.level) treffer.push(levelPunkt(ctx, L, a, lv));
    weltName(ctx, L, a, w);
  }

  // Die Figur.
  if (a.figur) {
    const fx = (a.figur.x - a.kamera) * L.cssW;
    const fy = bandY(L, a.figur.y);
    // Die Groesse haengt am Punkt, nicht am Bildschirm. Der erste Versuch
    // rechnete sie aus der Bildschirmhoehe — im Hochformat wurde die Figur
    // dadurch groesser als die Station, auf der sie steht, und verdeckte genau
    // den Punkt, den man antippen soll.
    const s = punktR(L) * 0.09;
    // Im Stehen das erste Bild des Gehens, **nicht** das Blocken: Die
    // Blockerpose hat ausgestreckte Arme, und die Figur sah damit aus, als
    // wollte sie den Weg versperren, den sie gerade gehen soll.
    const clip = 'walking';
    const bild = a.laeuft ? Math.floor(a.anim / 3) : 0;
    // Ein Schatten unter der Figur, sonst schwebt sie ueber dem Punkt.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(fx, fy - punktR(L) * 0.5, s * 5, s * 2, 0, 0, Math.PI * 2);
    ctx.fill();
    const gezeichnet =
      a.atlas && a.atlas.drawClip(ctx, clip, bild, fx, fy - punktR(L) * 0.55, s, a.richtung < 0);
    if (!gezeichnet) {
      // Ohne Blatt bleibt ein Marker. Die Karte darf nicht davon abhaengen,
      // dass eine Bilddatei geladen werden konnte.
      ctx.fillStyle = '#c98bff';
      kreis(ctx, fx, fy - punktR(L) * 0.9, s * 4);
      ctx.fill();
    }
  }

  return treffer;
}
