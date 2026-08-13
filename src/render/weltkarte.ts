import { uiBild } from '../art/ui';
import type { Belohnung, KartenPunkt } from '../levels/welten';
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
 * **Ein einziges senkrechtes Band** über alle Welten, kein Blättern. Man
 * scrollt daran entlang wie an einem Weg — **nach oben**: Die erste Welt
 * liegt unten, der Fortschritt ist ein Aufstieg (Merkliste „Weltauswahl
 * senkrecht"). Der Grund ist derselbe wie beim alten waagerechten Band, nur
 * konsequenter erzählt: Der Fortschritt soll als **Strecke** erfahrbar sein,
 * nicht als Liste — und auf einem hochkant gehaltenen Gerät ist die lange
 * Achse die Hochachse. „Weiter" heisst hier „höher", und das passt zu allem,
 * was das Spiel sonst sagt: Sterne sammeln, Tore öffnen, aufsteigen.
 *
 * ## Wie gerechnet wird
 *
 * Die Punkte in `progression.ts` liegen in **Bildschirmhöhen** (y, entlang
 * des Weges) und Anteilen der Bandbreite (x, 0 bis 1 quer). Die Kamera
 * (`kamera`) ist die Band-Höhe an der **Unterkante** des Bildes; ein Punkt
 * mit `y === kamera` steht also ganz unten, einer mit `y === kamera + 1`
 * ganz oben. Quer wird nicht auf die volle Gerätebreite gespannt, sondern
 * auf eine **Spur** von höchstens 0,62 Bildhöhen: Im Querformat zöge die
 * volle Breite die Schlangenlinie zu einem flachen Zickzack auseinander.
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
  /** Band-Höhe an der Unterkante des Ausschnitts, in Bildschirmhöhen. */
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

/** Die Querspur des Weges als Anteil der kürzeren sinnvollen Achse. */
function spurBreite(L: Layout): number {
  return Math.min(L.cssW * 0.9, L.cssH * 0.62);
}

/** Band-x (0..1) auf den Bildschirm. */
function bx(L: Layout, x: number): number {
  return L.cssW / 2 + (x - 0.5) * spurBreite(L);
}

/** Band-y (Bildschirmhöhen entlang des Weges) auf den Bildschirm: unten ist 0. */
function by(L: Layout, a: KarteAnsicht, y: number): number {
  return L.cssH * (1 - (y - a.kamera));
}

/** Radius eines Levelpunktes. Er haengt an der Spur, nicht am Geraet. */
function punktR(L: Layout): number {
  return Math.max(13, Math.min(26, spurBreite(L) * 0.062));
}

function kreisRunde(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
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
 * Der Hintergrund: je Welt ihr eigener Himmel, gestapelt.
 *
 * Jeder Weltabschnitt bekommt den Verlauf seiner eigenen Palette, beschnitten
 * auf seinen Streifen. Beim Hochscrollen steigt man dadurch sichtbar **von
 * einer Welt in die naechste** — das ist billiger und wirksamer als jede
 * Beschriftung. Der Weg laeuft durch ein **Tal**: Links und rechts rahmen
 * Huegelzuege die Spur, mit derselben Luftperspektive wie im Spiel (hinten
 * heller, vorn dunkler). Damit ist die Karte derselbe Ort wie das Spielfeld
 * und nicht dessen Inhaltsverzeichnis.
 *
 * Am **oberen Rand** jedes Abschnitts liegt ein Huegelkamm quer — der
 * Horizont dieser Welt. Was darueber kommt, ist die naechste; die Naht
 * zwischen zwei Himmeln bekommt so eine Form, statt eine Kante zu sein.
 */
/** Zelle je Belohnungsart auf `belohnungen.webp` (Reihenfolge des Blattes). */
const BELOHNUNG_ZELLE: Record<Belohnung['art'], number> = {
  werkzeug: 0,
  zeit: 1,
  komfort: 2,
  schmuck: 3,
};

function grund(ctx: CanvasRenderingContext2D, L: Layout, a: KarteAnsicht): void {
  ctx.fillStyle = '#0a0e16';
  ctx.fillRect(0, 0, L.cssW, L.cssH);
  for (const [nr, w] of a.karte.welten.entries()) {
    const yU = by(L, a, w.bandStart);
    const yO = by(L, a, w.bandStart + w.bandLaenge);
    if (yU < -8 || yO > L.cssH + 8) continue;
    const p = paletteFor(w.welt.kartenTheme);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, yO, L.cssW, yU - yO);
    ctx.clip();
    const g = ctx.createLinearGradient(0, yO, 0, yU);
    g.addColorStop(0, p.skyTop);
    g.addColorStop(0.55, p.skyMid);
    g.addColorStop(1, p.skyBottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, yO, L.cssW, yU - yO);

    // Wolken: weiche Ballen, je Welt an festen Stellen im **oberen** Drittel
    // des Abschnitts — da, wo der Himmel frei bleibt. Ein Himmel ohne
    // irgendetwas darin ist eine Farbflaeche.
    for (let i = 0; i < 4; i++) {
      const wt = w.bandStart * 7.3 + i * 1.37;
      const wy = by(L, a, w.bandStart + w.bandLaenge * (0.72 + (((wt * 137.5) % 100) / 100) * 0.24));
      const wx = L.cssW * (0.1 + (((wt * 61.8) % 100) / 100) * 0.8);
      const wr = spurBreite(L) * (0.09 + (((wt * 29.7) % 100) / 100) * 0.07);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(wx, wy, wr, 0, Math.PI * 2);
      ctx.arc(wx + wr * 0.9, wy + wr * 0.25, wr * 0.72, 0, Math.PI * 2);
      ctx.arc(wx - wr * 0.85, wy + wr * 0.3, wr * 0.62, 0, Math.PI * 2);
      ctx.fill();
    }

    // Der Hang: **Terrassen** aus quer laufenden Huegelkaemmen, die den
    // Abschnitt fuellen. Man blickt einen Hang hinauf — jede Terrasse ist ein
    // Kamm, dahinter beginnt die naechste, und je hoeher, desto blasser
    // (dieselbe Luftperspektive wie im Spiel). Der Weg steigt ueber die
    // Terrassen; „weiter" heisst sichtbar „hoeher". Der erste Entwurf rahmte
    // den Weg mit Talwaenden an den Kanten — das las sich als Schlucht aus
    // Papier, nicht als Landschaft.
    const stufen = Math.max(3, Math.round(w.bandLaenge / 0.4));
    // Die Kaemme fuellen nur die unteren drei Viertel des Abschnitts: Oben
    // bleibt Himmel mit Wolken — die Atempause, bevor die naechste Welt
    // beginnt, und der Ort, an dem ihr Farbverlauf ueberhaupt zu sehen ist.
    const kammBandY = (k: number): number =>
      w.bandStart + w.bandLaenge * (0.06 + (0.68 * (k + 0.5)) / stufen);
    const kammY = (k: number, px: number): number => {
      const t = px / L.cssW;
      const amp = L.cssH * 0.02;
      const ph = w.bandStart * 9.1 + k * 2.7;
      return (
        by(L, a, kammBandY(k)) +
        Math.sin(t * 5.3 + ph) * amp +
        Math.sin(t * 11.7 + ph * 1.7) * amp * 0.35
      );
    };
    const stufeFarbe = (k: number): [string, string] => {
      const i = k === 0 ? 2 : k === 1 ? 1 : k % 2 === 0 ? 0 : 1;
      return [p.hills[i], p.hillsDeep[i]];
    };
    const schritt = Math.max(16, L.cssW * 0.05);
    for (let k = stufen - 1; k >= 0; k--) {
      // Am Kamm der Hangton, nach unten der Fusston — ohne den Verlauf stand
      // die unterste Terrasse als flacher Farbblock im Bild.
      const [oben, unten] = stufeFarbe(k);
      const ky = kammY(k, L.cssW / 2);
      const g2 = ctx.createLinearGradient(0, ky, 0, ky + L.cssH * 0.55);
      g2.addColorStop(0, oben);
      g2.addColorStop(1, unten);
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.moveTo(-4, yU + 50);
      for (let px = -4; px <= L.cssW + schritt; px += schritt) {
        ctx.lineTo(px, kammY(k, Math.min(px, L.cssW)));
      }
      ctx.lineTo(L.cssW + 4, yU + 50);
      ctx.closePath();
      ctx.fill();
      // Lichtsaum auf dem Kamm — die Kante, an der das Auge die Terrassen
      // trennt. Dieselbe Geste wie an den Huegeln im Spiel.
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-4, kammY(k, 0));
      for (let px = -4; px <= L.cssW + schritt; px += schritt) {
        ctx.lineTo(px, kammY(k, Math.min(px, L.cssW)));
      }
      ctx.stroke();
    }

    // Die Falltuer-Maschine auf einer hinteren Terrasse — das Wahrzeichen
    // dieser Welt. Sie erzaehlt, worum es hier geht: Irgendwo haengt so ein
    // Ding, und aus ihm fallen die, die man rettet.
    if (stufen >= 3) {
      const mx = L.cssW * 0.82;
      const my = kammY(stufen - 2, mx);
      const mw = spurBreite(L) * 0.11;
      ctx.fillStyle = p.hills[2];
      ctx.globalAlpha = 0.55;
      ctx.fillRect(mx - mw * 0.06, my - mw * 1.4, mw * 0.12, mw * 1.1);
      ctx.fillRect(mx + mw * 0.4 - mw * 0.06, my - mw * 1.4, mw * 0.12, mw * 1.1);
      ctx.fillRect(mx - mw * 0.28, my - mw * 0.34, mw * 0.96, mw * 0.34);
      ctx.globalAlpha = 1;
    }

    // Die Welttafel — die Kopfplatte des Abschnitts (grafikbedarf.md §3.7).
    //
    // Ein gemaltes Bild der Welt, gerahmt wie ein aufgehaengtes Schild, oben
    // im Himmelsteil des Abschnitts, wo ausser Wolken nichts liegt — und
    // **unter** der angehefteten Namenszeile, die am oberen Bildrand klebt:
    // Bei 0,1 Bildhoehen sassen Tafel und Name uebereinander. Sie ist
    // Kopfplatte, nicht Hintergrund: Weg, Punkte, Laternen und Tor bleiben
    // gezeichnet, weil sie am Fortschritt haengen. Unten links die
    // Belohnung der Welt — verdient in voller Deckung, sonst als Aussicht
    // durchscheinend. Ihr Emblem traegt schon die Namenszeile; ein zweites
    // auf der Tafel war doppelt gesagt.
    const tafel = uiBild(`welt-${nr + 1}`);
    if (tafel) {
      const tw = Math.min(spurBreite(L) * 0.72, 300);
      const th = (tw * tafel.naturalHeight) / tafel.naturalWidth;
      const tx = L.cssW / 2 - tw / 2;
      const ty = yO + L.cssH * 0.165;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#0a0e16';
      kreisRunde(ctx, tx, ty, tw, th, 10);
      ctx.fill();
      ctx.restore();
      ctx.save();
      kreisRunde(ctx, tx, ty, tw, th, 10);
      ctx.clip();
      ctx.drawImage(tafel, tx, ty, tw, th);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 2;
      kreisRunde(ctx, tx, ty, tw, th, 10);
      ctx.stroke();

      const bel = uiBild('belohnungen');
      if (bel) {
        const z = bel.naturalHeight;
        const bs = Math.min(44, tw * 0.19);
        ctx.save();
        if (!w.belohnungVerdient) ctx.globalAlpha = 0.38;
        ctx.drawImage(
          bel,
          BELOHNUNG_ZELLE[w.belohnung.art] * z,
          0,
          z,
          z,
          tx - bs * 0.32,
          ty + th - bs * 0.7,
          bs,
          bs,
        );
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // Unter dem Anfang des Bandes liegt Erde: Hier beginnt der Weg, und ein
  // Weg beginnt auf einem Boden, nicht im Nichts.
  const w1 = a.karte.welten[0];
  if (w1) {
    const p = paletteFor(w1.welt.kartenTheme);
    const y0 = by(L, a, 0);
    if (y0 < L.cssH + 8) {
      ctx.fillStyle = `#${(p.earth >>> 0).toString(16).padStart(6, '0')}`;
      ctx.fillRect(0, y0, L.cssW, L.cssH - y0 + 8);
      ctx.fillStyle = `#${(p.crust >>> 0).toString(16).padStart(6, '0')}`;
      ctx.fillRect(0, y0, L.cssW, Math.max(2, L.cssH * 0.012));
    }
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
    x: bx(L, k.x),
    y: by(L, a, k.y),
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
  const x = bx(L, lv.pos.x);
  const y = by(L, a, lv.pos.y);

  if (lv.zustand === 'gesperrt') {
    // Gesperrtes bleibt klein und stumpf. Es soll zu sehen sein, damit man
    // weiss, dass es weitergeht — aber es darf nicht einladen.
    ctx.fillStyle = 'rgba(12, 18, 30, 0.62)';
    kreis(ctx, x, y, r * 0.62);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 170, 200, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Auch der gesperrte Punkt sagt, der wievielte er ist — „nummernlose
    // graue Scheiben" stand in der Kritik, und ohne Nummer kann man nicht
    // einmal sagen, worauf man sich freut.
    ctx.fillStyle = 'rgba(180, 196, 220, 0.55)';
    ctx.font = `700 ${Math.round(r * 0.7)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(lv.nr), x, y + 1);
    // Die Sterntor-Plakette: Was hier fehlt, sind Sterne, kein Vorgaenger.
    // Sie macht aus dem grauen Punkt eine Ansage — „ab 12 Sternen" ist ein
    // Ziel, „gesperrt" ist nur eine Wand.
    if (lv.sternTor) {
      const ty = y - r - 12;
      ctx.fillStyle = 'rgba(10, 14, 22, 0.82)';
      const text = `${lv.sternTor.sterne}`;
      ctx.font = `700 ${Math.round(r * 0.62)}px system-ui, sans-serif`;
      const tw = ctx.measureText(text).width;
      const bw = tw + r * 1.5;
      kreisRunde(ctx, x - bw / 2, ty - r * 0.55, bw, r * 1.1, r * 0.55);
      ctx.fill();
      stern(ctx, x - tw / 2 - r * 0.05, ty, r * 0.34);
      ctx.fillStyle = COL.accent;
      stern(ctx, x - tw / 2 - r * 0.05, ty, r * 0.34);
      ctx.fillStyle = '#ffe9a0';
      ctx.fillText(text, x + r * 0.3, ty + 1);
    }
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
  const x = bx(L, pos.x);
  const y = by(L, a, pos.y);
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
  // Die gemalte Laterne, wenn das Blatt da ist: Zelle 0 brennt, Zelle 1 ist
  // erloschen. Der Schein darueber bleibt gezeichnet — er pulst, und ein
  // Bild pulst nicht.
  const bild = uiBild('laternen');
  if (bild) {
    const z = bild.naturalHeight;
    const s = h * 1.7;
    ctx.drawImage(bild, (brennt ? 0 : 1) * z, 0, z, z, x - s / 2, y - s, s, s);
    return;
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
  const x = bx(L, w.tor.x);
  const y = by(L, a, w.tor.y);
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

  // Das Emblem der Welt **hinter** dem Tor haengt am Sturz — das Tor sagt
  // damit im Bild, wohin es fuehrt, nicht nur im Text darunter.
  const em = uiBild('weltembleme');
  const naechste = a.karte.welten.indexOf(w) + 1;
  if (em && naechste > 0 && naechste < a.karte.welten.length) {
    const z = em.naturalHeight;
    const es = r * 0.95;
    ctx.save();
    if (!offen) ctx.globalAlpha = 0.45;
    ctx.drawImage(em, naechste * z, 0, z, z, x - es / 2, y - r * 1.82, es, es);
    ctx.restore();
  }
  return null;
}

/** Der Name der Welt, gross ueber ihrem Abschnitt. */
function weltName(ctx: CanvasRenderingContext2D, L: Layout, a: KarteAnsicht, w: WeltKarte): void {
  const yU = by(L, a, w.bandStart);
  const yO = by(L, a, w.bandStart + w.bandLaenge);
  // Die Beschriftung bleibt im Bild, solange ihr Abschnitt es tut: Sie haengt
  // oben, statt mit dem Abschnitt hinauszuwandern. Sonst weiss man mitten in
  // einer Welt nicht mehr, in welcher man ist.
  const zeile = L.cssH * 0.055;
  const y = Math.min(Math.max(yO + 14, L.cssH * 0.05), yU - zeile * 2.6);
  // Das Emblem der Welt vor ihrem Namen — die Kopfzeile aus grafikbedarf.md
  // §3.8. Der Text rueckt dafuer nach rechts; fehlt das Blatt, steht er, wo
  // er immer stand.
  let textX = 16;
  const em = uiBild('weltembleme');
  const nr = a.karte.welten.indexOf(w);
  if (em && nr >= 0) {
    const es = Math.min(46, zeile * 1.7);
    ctx.save();
    if (!w.betreten) ctx.globalAlpha = 0.55;
    ctx.drawImage(em, nr * em.naturalHeight, 0, em.naturalHeight, em.naturalHeight, 12, y - es * 0.1, es, es);
    ctx.restore();
    textX = 12 + es + 8;
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(10, 16, 26, 0.5)';
  ctx.font = `800 ${Math.round(zeile)}px system-ui, sans-serif`;
  ctx.fillText(w.welt.name, textX + 1.5, y + 1.5);
  ctx.fillStyle = w.betreten ? COL.text : COL.dim;
  ctx.fillText(w.welt.name, textX, y);
  ctx.font = `600 ${Math.round(L.cssH * 0.028)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(234, 242, 255, 0.72)';
  ctx.fillText(
    `${w.geschafft}/${w.level.length} · ${w.sterne}/${w.sterneMoeglich} ★`,
    textX,
    y + L.cssH * 0.062,
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
    const yU = by(L, a, w.bandStart);
    const yO = by(L, a, w.bandStart + w.bandLaenge);
    if (yU < -60 || yO > L.cssH + 60) continue;

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
    const fx = bx(L, a.figur.x);
    const fy = by(L, a, a.figur.y);
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
