import type { Layout } from './layout';
import type { SpriteAtlas } from './atlas';
import type { Wusel } from '../core/types';
import { State, DeathCause } from '../core/types';

/**
 * Der Titelbildschirm.
 *
 * ## Der Name
 *
 * Die Figur heisst **Wusel** — fuenf Buchstaben, wie gewuenscht, und das Wort
 * war im Code laengst da (`wusels`, `Wusel`): Der Name ist keine Erfindung,
 * sondern ein Gestaendnis. Der Nachsatz folgt dem Muster „Sonic – the
 * Hedgehog": erst der Rufname, dann, was einer ist. **„Wusel – die
 * Wuselwerker"** — der eine steht vorn auf dem Plakat, die vielen sind das
 * Spiel.
 *
 * ## Warum gemalt und nicht gebaut
 *
 * Der Titel ist eine Buehne, kein Menue: eine Tageslicht-Kulisse der
 * Grasland-Welt, davor eine Parade laufender Wusel aus dem echten
 * Figurenblatt, darueber der Schriftzug. Es gibt genau eine Handlung
 * (antippen), also braucht es keinen einzigen Knopf — die ganze Flaeche ist
 * der Knopf.
 *
 * Alles hier ist Ansicht: kein Zustand, keine Simulation. Die Parade laeuft
 * auf der Bilduhr (`anim`) und wiederholt sich; wer eine Minute zuschaut,
 * sieht dieselben Wusel wiederkommen — wie am Ende des Abspanns eines alten
 * Zeichentricks.
 */

/** Die Blautoene des Haars — der Markenklang der Figur, auch im Schriftzug. */
const LOGO_HELL = '#5B79E4';
const LOGO_GRUND = '#3851B6';
const LOGO_TIEF = '#22346f';

function titelWusel(pose: State, extra: Partial<Wusel> = {}): Wusel {
  return {
    id: 9100,
    x: 0,
    y: 0,
    dir: 1,
    state: pose,
    timer: 0,
    fallDist: 0,
    bricks: 6,
    hoist: 0,
    hasClimber: false,
    hasFloater: false,
    isBlocker: false,
    fuse: 0,
    vormerk: null,
    cause: DeathCause.NONE,
    bornTick: 0,
    ...extra,
  };
}

export function drawTitel(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  atlas: SpriteAtlas | null,
  anim: number,
): void {
  const w = L.cssW;
  const h = L.cssH;
  const quer = w > h;

  // --- Himmel: der Tag der Grasland-Welt -----------------------------------
  const himmel = ctx.createLinearGradient(0, 0, 0, h);
  himmel.addColorStop(0, '#2f74b8');
  himmel.addColorStop(0.55, '#69aadd');
  himmel.addColorStop(1, '#c6e6f2');
  ctx.fillStyle = himmel;
  ctx.fillRect(0, 0, w, h);

  // Sonne: ein weicher Fleck, kein Kreis mit Rand.
  const sx = w * 0.78;
  const sy = h * 0.16;
  const sonne = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.2);
  sonne.addColorStop(0, 'rgba(255, 244, 200, 0.85)');
  sonne.addColorStop(0.35, 'rgba(255, 240, 190, 0.25)');
  sonne.addColorStop(1, 'rgba(255, 240, 190, 0)');
  ctx.fillStyle = sonne;
  ctx.fillRect(0, 0, w, h);

  // Wolken: drei Ballenhaufen, sehr langsam nach rechts treibend.
  const drift = (anim * 0.06) % (w + 260);
  const wolken: readonly (readonly [number, number, number, number])[] = [
    [0.12, 0.14, 34, 0.5],
    [0.52, 0.09, 26, 0.35],
    [0.8, 0.2, 30, 0.42],
    // Zwei tiefere fuer das Hochformat — dort ist zwischen Schriftzug und
    // Huegeln sonst ein leerer Himmel von halber Bildhoehe.
    [0.3, 0.42, 24, 0.28],
    [0.72, 0.5, 20, 0.22],
  ];
  for (const [fx, fy, r, deck] of wolken) {
    const cx = ((fx * w + drift) % (w + 260)) - 130;
    const cy = fy * h;
    for (let i = 0; i < 4; i++) {
      const bx = cx + Math.sin(i * 2.4 + fx * 9) * r * 1.15;
      const by = cy + Math.cos(i * 3.7 + fx * 7) * r * 0.28;
      const br = r * (0.55 + 0.4 * Math.abs(Math.cos(i * 1.7)));
      const g = ctx.createRadialGradient(bx, by - br * 0.2, br * 0.15, bx, by, br);
      g.addColorStop(0, `rgba(255,255,255,${deck})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Huegelzuege ----------------------------------------------------------
  //
  // Drei Schichten wie im Spiel, aber als feste Kurven: Der Titel braucht
  // keinen Zufall, er braucht eine Komposition. Die Taeler liegen in der
  // Mitte, damit der Schriftzug Luft hat.
  const zuege: readonly (readonly [number, number, string, string])[] = [
    [0.6, 0.045, '#a5cbdd', '#8fbbd0'],
    [0.68, 0.06, '#7aa8bd', '#5e8ea6'],
    [0.78, 0.075, '#4a7f69', '#33604e'],
  ];
  for (const [basis, amp, oben, unten] of zuege) {
    const g = ctx.createLinearGradient(0, h * (basis - amp * 2), 0, h);
    g.addColorStop(0, oben);
    g.addColorStop(1, unten);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, h * basis);
    const n = 6;
    for (let i = 0; i <= n; i++) {
      const px = (w * i) / n;
      const py = h * (basis + Math.sin(i * 2.1 + basis * 20) * amp);
      if (i === 0) ctx.moveTo(px, py);
      else {
        const vx = (w * (i - 0.5)) / n;
        const vy = h * (basis + Math.sin((i - 0.5) * 2.1 + basis * 20) * amp * 1.4);
        ctx.quadraticCurveTo(vx, vy, px, py);
      }
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  }

  // --- Der Boden der Buehne -------------------------------------------------
  const bodenY = h * (quer ? 0.82 : 0.8);
  const erde = ctx.createLinearGradient(0, bodenY, 0, h);
  erde.addColorStop(0, '#7a5230');
  erde.addColorStop(1, '#452c19');
  ctx.fillStyle = erde;
  ctx.fillRect(0, bodenY, w, h - bodenY);
  // Grasnarbe mit dunklem Wurzelsaum — dieselbe Regel wie im Terrain.
  ctx.fillStyle = '#35601f';
  ctx.fillRect(0, bodenY, w, 7);
  ctx.fillStyle = '#63b23f';
  ctx.fillRect(0, bodenY, w, 4);
  // Ein paar Grashalme brechen die Linie.
  ctx.fillStyle = '#63b23f';
  for (let i = 0; i < w; i += 14) {
    const hh = 3 + ((i * 7) % 5);
    ctx.fillRect(i + ((i * 13) % 9), bodenY - hh, 2, hh);
  }

  // --- Die Parade -----------------------------------------------------------
  //
  // Vier Laeufer, versetzt im Takt (dieselbe Regel wie im Pulk, G4), und ein
  // Schirmspringer, der ewig sinkt: Er faellt sein Stueck, blendet aus und
  // beginnt oben neu — die Buehne erzaehlt die beiden Grundbewegungen des
  // Spiels, laufen und schweben.
  if (atlas) {
    const gross = Math.min(h * 0.11, 58);
    const massstab = gross / 12;
    const laufweite = w + gross * 4;
    for (let i = 0; i < 4; i++) {
      const lx = ((anim * 0.62 + i * laufweite * 0.26) % laufweite) - gross * 2;
      const van = {
        ox: 0,
        oy: 0,
        scale: massstab,
        box: { x: lx, y: bodenY - massstab, w, h },
      };
      atlas.drawWusel(
        ctx,
        van,
        titelWusel(State.WALKING),
        1,
        Infinity,
        'walking',
        anim / 2 + i * 3,
      );
    }
    // Der Schirmspringer: sinkt von der Sonne herab und beginnt von vorn.
    const fallweg = bodenY - h * 0.1;
    const ft = ((anim * 0.5) % fallweg) / fallweg;
    const fvan = {
      ox: 0,
      oy: 0,
      scale: massstab * 0.9,
      box: { x: w * 0.84, y: h * 0.1 + ft * fallweg - massstab, w, h },
    };
    ctx.save();
    // Am Ende des Wegs ausblenden, statt auf dem Boden zu verschwinden.
    ctx.globalAlpha = ft > 0.85 ? 1 - (ft - 0.85) / 0.15 : 1;
    atlas.drawWusel(
      ctx,
      fvan,
      titelWusel(State.FALLING, { hasFloater: true, fallDist: 30 }),
      1,
      Infinity,
      'floating',
      anim / 2,
    );
    ctx.restore();
  }

  // --- Der Schriftzug -------------------------------------------------------
  //
  // WUSEL, Buchstabe fuer Buchstabe: leicht gegeneinander verkippt und im
  // Takt wippend — gesetzt saehe es nach Textverarbeitung aus, getanzt sieht
  // es nach Spiel aus. Drei Lagen: Schlagschatten, Fuellung im Haarblau,
  // Lichtkante.
  const wort = 'WUSEL';
  const fs = Math.min(w * 0.19, h * 0.17, 118);
  const logoY = h * (quer ? 0.3 : 0.3);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `900 ${fs}px system-ui, sans-serif`;
  const breiten = wort.split('').map((b) => ctx.measureText(b).width);
  const fuge = fs * 0.04;
  const gesamt = breiten.reduce((a, b) => a + b + fuge, -fuge);
  let lx = (w - gesamt) / 2;
  for (let i = 0; i < wort.length; i++) {
    const b = wort[i];
    const bx = lx + breiten[i] / 2;
    const wippe = Math.sin(anim / 26 + i * 1.1) * fs * 0.03;
    const kipp = Math.sin(i * 2.4 + 0.6) * 0.06;
    ctx.save();
    ctx.translate(bx, logoY + wippe);
    ctx.rotate(kipp);
    // Schlagschatten — versetzt, nicht weich: Plakat, nicht Nebel.
    ctx.fillStyle = LOGO_TIEF;
    ctx.fillText(b, fs * 0.045, fs * 0.05);
    // Fuellung im Haarblau, oben hell, unten satt.
    const fg = ctx.createLinearGradient(0, -fs * 0.9, 0, 0);
    fg.addColorStop(0, LOGO_HELL);
    fg.addColorStop(1, LOGO_GRUND);
    ctx.fillStyle = fg;
    ctx.fillText(b, 0, 0);
    // Lichtkante obenauf.
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = Math.max(1, fs * 0.014);
    ctx.strokeText(b, 0, 0);
    ctx.restore();
    lx += breiten[i] + fuge;
  }

  // Der Nachsatz: „die Wuselwerker" — was einer ist, unter dem Rufnamen.
  const nfs = Math.max(14, fs * 0.22);
  ctx.font = `600 ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.shadowColor = 'rgba(20, 30, 70, 0.45)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  ctx.fillText('– die Wuselwerker –', w / 2, logoY + nfs * 1.9);
  ctx.shadowColor = 'transparent';
  ctx.restore();

  // --- Die Aufforderung -----------------------------------------------------
  //
  // Eine Handlung, ein Satz, atmend statt blinkend.
  const puls = 0.55 + 0.45 * Math.sin(anim / 30);
  const afs = Math.max(15, Math.min(w * 0.045, 21));
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${afs}px system-ui, sans-serif`;
  ctx.fillStyle = `rgba(255, 255, 255, ${0.55 + 0.4 * puls})`;
  ctx.shadowColor = 'rgba(20, 30, 70, 0.5)';
  ctx.shadowBlur = 5;
  ctx.fillText('Antippen und loswuseln', w / 2, h * (quer ? 0.62 : 0.6));
  ctx.restore();
}
