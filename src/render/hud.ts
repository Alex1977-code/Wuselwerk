import { RATE_MAX, RATE_MIN, TICK_HZ } from '../core/constants';
import { SKILL_LABEL, type SkillId } from '../core/types';
import type { World } from '../core/world';
import type { LevelDef } from '../levels/types';
import { drawSkillIcon } from './icons';
import { State, DeathCause, type Wusel } from '../core/types';
import type { SpriteAtlas } from './atlas';
import type { Box, Layout } from './layout';

/**
 * Farben der Bedienoberfläche.
 *
 * Die Leiste bleibt dunkler als das Spielfeld, aber nicht mehr fast schwarz.
 * Ein heller Himmel über einem schwarzen Balken sieht aus wie ein Loch; ein
 * tiefes Schiefer rahmt ihn. Text und Akzent sind gleichzeitig kräftiger
 * geworden — sie standen vorher gegen einen sehr dunklen Grund und wirken auf
 * dem helleren zu schwach, wenn man sie lässt, wie sie waren.
 */
export const COL = {
  panel: '#1b2536',
  panelHi: '#27354b',
  line: '#3a4a66',
  text: '#eaf2ff',
  dim: '#95a7c0',
  accent: '#ffc93c',
  good: '#5ce09a',
  bad: '#f26a55',
};

export interface HudState {
  level: LevelDef;
  world: World;
  selected: SkillId | null;
  cameraFollow: boolean;
  muted: boolean;
  /** Das Figurenblatt — die Knoepfe zeigen die Figur bei der Arbeit. */
  atlas: SpriteAtlas | null;
  /**
   * Lebensvorrat fuer die Kopfleiste — `null`, wenn das System aus ist
   * (Testmodus). Im Level sichtbar, damit man **vor** dem riskanten Zug
   * weiss, was eine Niederlage kostet, nicht erst auf der Karte danach.
   */
  leben: { uebrig: number } | null;
}

export function roundRect(
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

function fmtTime(ticks: number): string {
  if (!isFinite(ticks)) return '--:--';
  const s = Math.ceil(ticks / TICK_HZ);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function drawTopBar(ctx: CanvasRenderingContext2D, L: Layout, s: HudState): void {
  const b = L.topBar;
  ctx.fillStyle = COL.panel;
  ctx.fillRect(b.x, b.y, b.w, b.h);

  const w = s.world;
  // Rechter Rand ergibt sich aus den Knöpfen, nicht aus einem festen Abstand —
  // quer sind sie schmaler und rücken zusammen.
  const timeRight = L.soundBtn.x - 12;

  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  // Der Lebensvorrat, ganz links in der oberen Zeile: Herz und Zahl. Die
  // Etappe rueckt dafuer nach rechts — sie ist Auskunft, das Herz ist Einsatz.
  let linksX = 10;
  if (s.leben) {
    const hx = 16;
    const hy = 13;
    ctx.fillStyle = s.leben.uebrig > 0 ? '#ff5a6e' : '#5a6478';
    ctx.beginPath();
    ctx.moveTo(hx, hy + 5.4);
    ctx.bezierCurveTo(hx - 8.4, hy + 0.3, hx - 4.5, hy - 6, hx, hy - 1.9);
    ctx.bezierCurveTo(hx + 4.5, hy - 6, hx + 8.4, hy + 0.3, hx, hy + 5.4);
    ctx.fill();
    ctx.fillStyle = COL.text;
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.fillText(String(s.leben.uebrig), hx + 9, 8);
    linksX = hx + 9 + ctx.measureText(String(s.leben.uebrig)).width + 8;
  }
  ctx.fillStyle = COL.dim;
  ctx.font = '600 10px system-ui, sans-serif';
  ctx.fillText(s.level.chapter.toUpperCase(), linksX, 7);
  ctx.fillStyle = COL.text;
  ctx.font = '600 15px system-ui, sans-serif';
  // Der Name endet, wo die Mitte-Spalte beginnt — gemessen, nicht gehofft.
  // „Unter dem Deckel" plus „0/14" wurde auf dem Handy zu „Unter dem Decke0/14";
  // die Spalten wussten nichts voneinander. Gekuerzt wird mit Ellipse, Zeichen
  // fuer Zeichen: Bei zehn Levelnamen lohnt keine binaere Suche.
  const midX = Math.min(b.w * 0.52, timeRight - 70);
  const nameMax = midX - ctx.measureText(`${w.saved}/${w.needed}`).width / 2 - 14;
  let name = s.level.name;
  if (ctx.measureText(name).width > nameMax - 10) {
    while (name.length > 1 && ctx.measureText(`${name}…`).width > nameMax - 10) {
      name = name.slice(0, -1).trimEnd();
    }
    name += '…';
  }
  ctx.fillText(name, 10, 20);

  ctx.textAlign = 'right';
  const timeLeft = w.timeLeftTicks;
  const urgent = timeLeft < 15 * TICK_HZ;
  ctx.fillStyle = urgent ? COL.bad : COL.text;
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.fillText(fmtTime(timeLeft), timeRight, b.h > 48 ? 20 : 14);
  if (b.h > 48) {
    ctx.fillStyle = COL.dim;
    ctx.font = '600 10px system-ui, sans-serif';
    ctx.fillText('ZEIT', timeRight, 7);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = COL.dim;
  ctx.font = '600 10px system-ui, sans-serif';
  if (b.h > 48) ctx.fillText('GERETTET', midX, 7);
  ctx.fillStyle = w.saved >= w.needed ? COL.good : COL.text;
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.fillText(`${w.saved}/${w.needed}`, midX, b.h > 48 ? 20 : 14);

  drawSoundButton(ctx, L.soundBtn, s.muted);
  drawIconButton(ctx, L.nukeBtn, '☢', false);
  drawIconButton(ctx, L.pauseBtn, '❚❚', false);

  // Rettungsquote-Balken (GDD §5)
  const bar: Box = { x: 0, y: b.h - 5, w: b.w, h: 5 };
  ctx.fillStyle = '#0d1420';
  ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
  const per = bar.w / w.total;
  ctx.fillStyle = COL.good;
  ctx.fillRect(0, bar.y, w.saved * per, bar.h);
  ctx.fillStyle = COL.bad;
  ctx.fillRect(bar.w - w.dead * per, bar.y, w.dead * per, bar.h);
  ctx.fillStyle = COL.text;
  ctx.fillRect(w.needed * per - 1, bar.y - 1, 2, bar.h + 2);
}

function drawSoundButton(ctx: CanvasRenderingContext2D, b: Box, muted: boolean): void {
  ctx.fillStyle = '#243044';
  roundRect(ctx, b.x, b.y, b.w, b.h, 9);
  ctx.fill();
  ctx.strokeStyle = COL.line;
  ctx.lineWidth = 1;
  ctx.stroke();

  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  ctx.save();
  ctx.translate(cx - 2, cy);
  ctx.fillStyle = muted ? '#4d5972' : COL.text;
  ctx.strokeStyle = muted ? '#4d5972' : COL.text;
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';

  // Membran und Trichter
  ctx.beginPath();
  ctx.moveTo(-5, -2.5);
  ctx.lineTo(-2, -2.5);
  ctx.lineTo(2, -6);
  ctx.lineTo(2, 6);
  ctx.lineTo(-2, 2.5);
  ctx.lineTo(-5, 2.5);
  ctx.closePath();
  ctx.fill();

  if (muted) {
    ctx.beginPath();
    ctx.moveTo(4.5, -4.5);
    ctx.lineTo(9.5, 4.5);
    ctx.moveTo(9.5, -4.5);
    ctx.lineTo(4.5, 4.5);
    ctx.stroke();
  } else {
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.arc(3, 0, 4 + i * 3, -0.85, 0.85);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawIconButton(
  ctx: CanvasRenderingContext2D,
  b: Box,
  glyph: string,
  active: boolean,
): void {
  ctx.fillStyle = active ? COL.panelHi : '#243044';
  roundRect(ctx, b.x, b.y, b.w, b.h, 9);
  ctx.fill();
  ctx.strokeStyle = COL.line;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = COL.text;
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph, b.x + b.w / 2, b.y + b.h / 2 + 1);
}

/**
 * Bedienleiste.
 *
 * Drei Entscheidungen, die den Unterschied zum vorigen Stand ausmachen:
 *
 * 1. **Keine Kürzel mehr.** Unter jedem Symbol stand „KLE", „SBG", „BRÜ" —
 *    acht Wörter, die niemand kennt, in acht Punkt Schriftgrösse. Sie kosteten
 *    eine Zeile Höhe und haben nichts erklärt. Der Name steht jetzt dort, wo er
 *    hilft: einmal, ausgeschrieben, für den *gewählten* Beruf. Wo die Knöpfe
 *    breit genug sind (quer), steht er zusätzlich auf jedem.
 * 2. **Drei klar getrennte Zustände.** Vorher unterschieden sich „wählbar",
 *    „gewählt" und „aufgebraucht" nur in Randfarbe und Füllung um ein paar
 *    Stufen. Jetzt trägt der gewählte Knopf eine helle Fläche und einen Balken
 *    an der Unterkante, der aufgebrauchte hat weder Rand noch Symbolkontrast.
 * 3. **Die Zahl ist eine Plakette, kein Text.** Sie sitzt oben rechts in der
 *    Ecke, wie an einem Vorrat — und sie ist das Einzige, was sich während des
 *    Spiels ändert, also darf sie sich abheben.
 */
/**
 * Welches Bild ein Beruf auf seinem Knopf traegt: Pose und Zustand einer
 * kleinen Vorfuehr-Figur, gezeichnet vom **echten** Zeichner mit Werkzeug und
 * Signalband.
 *
 * Die Kritik (G7) verlangte „ein kleines Portraet der Figur bei der Arbeit,
 * aus dem vorhandenen Figurenblatt zusammensetzbar". Der Einwand aus dem
 * Grafikbedarf — die Posen allein seien zu aehnlich (74 Prozent
 * Ueberdeckung) — hat sich im Spiel dann doch bestaetigt: Werkzeuge von sechs
 * Punkten tragen den Unterschied nicht, „die Spielerfiguren lassen den Beruf
 * nicht erkennen". Deshalb steht das Portraet nur noch **neben** dem Symbol
 * auf den breiten Knoepfen (quer); die Lesbarkeit traegt ueberall das Symbol.
 */
const PORTRAET: Record<SkillId, { pose: string; state: State; extra?: Partial<Wusel> }> = {
  climber: { pose: 'climbing', state: State.CLIMBING, extra: { hasClimber: true } },
  floater: { pose: 'floating', state: State.FALLING, extra: { hasFloater: true, fallDist: 30 } },
  bomber: { pose: 'walking', state: State.WALKING, extra: { fuse: 200 } },
  blocker: { pose: 'blocking', state: State.BLOCKING, extra: { isBlocker: true } },
  builder: { pose: 'building', state: State.BUILDING },
  basher: { pose: 'bashing', state: State.BASHING },
  miner: { pose: 'mining', state: State.MINING },
  digger: { pose: 'digging', state: State.DIGGING },
};

function portraetWusel(id: SkillId): Wusel {
  return {
    id: 9000,
    x: 0,
    y: 0,
    dir: 1,
    state: PORTRAET[id].state,
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
    ...PORTRAET[id].extra,
  };
}

export function drawControls(ctx: CanvasRenderingContext2D, L: Layout, s: HudState): void {
  const c = L.controls;
  ctx.fillStyle = COL.panel;
  ctx.fillRect(c.x, c.y, c.w, c.h);
  // Eine helle Haarlinie an der Oberkante statt eines Rahmens. Sie trennt
  // Leiste und Spielfeld, ohne einen Strich zu ziehen.
  const kante = ctx.createLinearGradient(0, c.y, 0, c.y + 3);
  kante.addColorStop(0, 'rgba(255,255,255,0.09)');
  kante.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = kante;
  ctx.fillRect(0, c.y, c.w, 3);

  drawRateSlider(ctx, L, s.world);

  for (const b of L.skillButtons) {
    const count = s.world.skills[b.id];
    const selected = s.selected === b.id;
    const usable = count > 0;
    // Ab dieser Breite passt der Name unter das Symbol, ohne zu brechen.
    const weit = b.w >= 66;

    // --- Fläche ------------------------------------------------------------
    if (selected) {
      const g = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
      g.addColorStop(0, '#3c6ea0');
      g.addColorStop(1, '#22456b');
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = usable ? '#28354c' : '#1e2739';
    }
    roundRect(ctx, b.x, b.y, b.w, b.h, 12);
    ctx.fill();

    if (!selected && usable) {
      // Schmale Aufhellung an der Oberkante — das ist, was eine Fläche
      // gedrückt oder erhaben aussehen lässt, nicht ein Rahmen.
      ctx.save();
      ctx.clip();
      const gl = ctx.createLinearGradient(0, b.y, 0, b.y + b.h * 0.45);
      gl.addColorStop(0, 'rgba(255,255,255,0.07)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gl;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.restore();
    }

    if (selected) {
      // Balken an der Unterkante. Er liegt innerhalb der Rundung und liest
      // auch aus dem Augenwinkel als „dieser hier".
      ctx.save();
      roundRect(ctx, b.x, b.y, b.w, b.h, 12);
      ctx.clip();
      ctx.fillStyle = COL.accent;
      ctx.fillRect(b.x, b.y + b.h - 4, b.w, 4);
      ctx.restore();
    }

    // --- Symbol und Figur --------------------------------------------------
    //
    // Das **Symbol** traegt die Lesbarkeit, die **Figur bei der Arbeit** kommt
    // nur dazu, wo der Knopf breit genug fuer beides ist. Die erste Fassung
    // (G7) hatte die Figur allein auf den Knopf gesetzt — und die Rueckmeldung
    // war eindeutig: „die Spielerfiguren lassen den Beruf nicht erkennen."
    // Zu Recht: Bei vierzig Punkten Knopfbreite unterscheiden sich acht
    // Figuren nur im Werkzeug, und das Werkzeug misst dann sechs Punkte.
    // Eine Silhouette, die man erst suchen muss, ist kein Symbol.
    //
    // Der gewaehlte Knopf drueckt sichtbar ein: Alles rutscht anderthalb
    // Punkte nach unten.
    const symbolY = b.y + b.h * (weit ? 0.4 : 0.46);
    const druck = selected ? 1.5 : 0;
    const symbolFarbe = selected ? '#ffffff' : usable ? COL.text : '#4a5a75';
    if (s.atlas && weit) {
      // Breiter Knopf: links die Figur bei der Arbeit, rechts das Symbol.
      // Die Figur lehrt, wie der Beruf im Spielfeld aussieht; das Symbol sagt,
      // welcher es ist.
      const wz = portraetWusel(b.id);
      const gross = Math.min(b.h * 0.56, b.w * 0.44);
      const massstab = gross / 15;
      ctx.save();
      if (!usable) ctx.globalAlpha = 0.38;
      const van = {
        ox: 0,
        oy: 0,
        scale: massstab,
        box: { x: b.x + b.w * 0.29, y: symbolY + gross * 0.44 + druck - massstab, w: b.w, h: b.h },
      };
      s.atlas.drawWusel(ctx, van, wz, 1, Infinity, PORTRAET[b.id].pose, 0);
      ctx.restore();
      drawSkillIcon(
        ctx,
        b.id,
        b.x + b.w * 0.68,
        symbolY + druck,
        Math.min(b.w * 0.36, 26),
        symbolFarbe,
      );
    } else {
      drawSkillIcon(ctx, b.id, b.x + b.w / 2, symbolY + druck, Math.min(b.w * 0.6, 30), symbolFarbe);
    }

    // --- Name, nur wo Platz ist -------------------------------------------
    //
    // Die Namen sind unterschiedlich lang: „Blocker" hat sieben Zeichen,
    // „Schirmspringer" vierzehn. Bei fester Schriftgrösse liefen die langen in
    // den Nachbarn hinein. Deshalb wird sie so weit heruntergesetzt, bis der
    // Name in seinen Knopf passt — und wenn selbst neun Punkt nicht reichen,
    // bleibt der Name weg. Lieber kein Name als einer, der zum Nachbarn gehört.
    if (weit) {
      const platz = b.w - 8;
      let fs = 11;
      ctx.font = `600 ${fs}px system-ui, sans-serif`;
      while (fs > 8 && ctx.measureText(SKILL_LABEL[b.id]).width > platz) {
        fs -= 0.5;
        ctx.font = `600 ${fs}px system-ui, sans-serif`;
      }
      if (ctx.measureText(SKILL_LABEL[b.id]).width <= platz) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = selected ? '#dbe9ff' : usable ? COL.dim : '#333c4c';
        ctx.fillText(SKILL_LABEL[b.id], b.x + b.w / 2, b.y + b.h - 10);
      }
    }

    // --- Plakette mit dem Vorrat ------------------------------------------
    const pw = Math.min(24, b.w * 0.62);
    const ph = 16;
    const px = b.x + b.w - pw - 4;
    const py = b.y + 4;
    ctx.fillStyle = selected ? COL.accent : usable ? '#141c2a' : 'transparent';
    if (usable || selected) {
      roundRect(ctx, px, py, pw, ph, 8);
      ctx.fill();
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = selected ? '#1b2431' : usable ? COL.text : '#39424f';
    ctx.font = '700 12px system-ui, sans-serif';
    ctx.fillText(String(count), px + pw / 2, py + ph / 2 + 0.5);
  }

  // Hinweiszeile nur, wenn unter dem Bogen wirklich Platz ist. Quer ist die
  // Steuerung flach — dort liefe der Text mitten durch die Knöpfe.
  const lowestBtn = L.skillButtons.reduce((m, b) => Math.max(m, b.y + b.h), 0);
  const hintY = c.y + c.h - 8;
  if (hintY - 13 < lowestBtn + 2) return;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'center';

  // Der Name des gewählten Berufs steht hier — einmal, ausgeschrieben. Das
  // ersetzt acht Kürzel auf den Knöpfen und sagt zugleich, was als Nächstes
  // zu tun ist.
  if (s.selected) {
    const name = SKILL_LABEL[s.selected];
    ctx.font = '700 12px system-ui, sans-serif';
    const nw = ctx.measureText(name).width;
    const rest = 'auf einer Figur halten · frei ziehen schiebt';
    ctx.font = '500 11px system-ui, sans-serif';
    const rw = ctx.measureText(rest).width;
    const ganz = nw + 10 + rw;
    let x = c.w / 2 - ganz / 2;
    ctx.textAlign = 'left';
    ctx.fillStyle = COL.accent;
    ctx.font = '700 12px system-ui, sans-serif';
    ctx.fillText(name, x, hintY);
    x += nw + 10;
    ctx.fillStyle = COL.dim;
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.fillText(rest, x, hintY);
  } else {
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.fillStyle = COL.dim;
    ctx.fillText('Erst Beruf wählen, dann Figur antippen', c.w / 2, hintY);
  }
}

/**
 * Freisetzungsrate.
 *
 * Auf einer Linie mit den Knöpfen und genauso hoch — vorher lief sie über die
 * ganze Leistenhöhe und trug oben wie unten eine Beschriftung, also drei
 * Elemente für eine Zahl. Jetzt steht die Zahl **im Griff**: Sie ist genau das,
 * was man verschiebt, und muss nicht daneben noch einmal stehen.
 *
 * Der gefüllte Teil unterhalb des Griffs zeigt den Wert auch dann, wenn der
 * Daumen den Griff verdeckt. Das ist der Grund für die Füllung, nicht die Zier.
 */
function drawRateSlider(ctx: CanvasRenderingContext2D, L: Layout, w: World): void {
  const b = L.rateSlider;
  const cx = b.x + b.w / 2;
  const griffH = 20;
  const trackTop = b.y + griffH / 2;
  const trackBottom = b.y + b.h - griffH / 2;
  const th = trackBottom - trackTop;
  const t = (w.releaseRate - RATE_MIN) / (RATE_MAX - RATE_MIN);
  const minT = (w.minReleaseRate - RATE_MIN) / (RATE_MAX - RATE_MIN);
  const bw = 8;

  ctx.fillStyle = '#131b28';
  roundRect(ctx, cx - bw / 2, trackTop, bw, th, bw / 2);
  ctx.fill();

  // Gesperrter Bereich unterhalb der Mindestrate — dorthin lässt sich der
  // Griff nicht ziehen, und das muss man sehen, bevor man es versucht.
  if (minT > 0) {
    ctx.fillStyle = '#3a2530';
    roundRect(ctx, cx - bw / 2, trackBottom - minT * th, bw, minT * th, bw / 2);
    ctx.fill();
  }

  const ky = trackBottom - t * th;
  ctx.fillStyle = '#7a5c18';
  roundRect(ctx, cx - bw / 2, ky, bw, trackBottom - ky, bw / 2);
  ctx.fill();

  ctx.fillStyle = COL.accent;
  roundRect(ctx, b.x + 1, ky - griffH / 2, b.w - 2, griffH, griffH / 2);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1b2431';
  ctx.font = '700 12px system-ui, sans-serif';
  ctx.fillText(String(w.releaseRate), cx, ky + 0.5);
}

/** `earned` als Anzahl (Menü) oder als drei Einzelbedingungen (Ergebnis). */
/**
 * Drei Sterne — mit Auftritt.
 *
 * `zeit` ist die Zeit seit dem Erscheinen der Tafel, in Sekunden. Jeder
 * verdiente Stern hat seinen eigenen Einsatz und **ploppt**: Er kommt zu
 * gross an und setzt sich. Ohne `zeit` (die Kartenansicht) stehen alle
 * sofort — dort sind sie Bestand, kein Ereignis.
 */
export function drawStars(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  earned: number | boolean[],
  zeit?: number,
): void {
  const flags =
    typeof earned === 'number' ? [earned >= 1, earned >= 2, earned >= 3] : earned;
  const gap = size * 1.9;
  for (let i = 0; i < 3; i++) {
    let r = size;
    let da = true;
    if (zeit !== undefined && flags[i]) {
      const einsatz = STERN_EINSATZ + i * STERN_ABSTAND;
      const t = (zeit - einsatz) / 0.22;
      if (t < 0) da = false;
      else if (t < 1) r = size * (1.45 - 0.45 * t * t);
    }
    if (!da) {
      star(ctx, cx + (i - 1) * gap, cy, size, '#2a3244');
      continue;
    }
    star(ctx, cx + (i - 1) * gap, cy, r, flags[i] ? COL.accent : '#2a3244');
  }
}

/** Wann der erste Stern kommt und wie weit die weiteren dahinter liegen. */
export const STERN_EINSATZ = 0.55;
export const STERN_ABSTAND = 0.5;

function star(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

export function drawRecenter(ctx: CanvasRenderingContext2D, L: Layout): void {
  drawIconButton(ctx, L.recenterBtn, '◎', true);
}

/**
 * Der Zeitruecklauf-Knopf, mit Sekundenangabe.
 *
 * Die Zahl steht dran, weil der Knopf ein Versprechen ist: „↺ 10" heisst zehn
 * Sekunden, und in den ersten Sekunden eines Levels ehrlich weniger. Ohne
 * Schnappschuss ist er ausgegraut statt versteckt — ein Knopf, der mal da ist
 * und mal nicht, wirkt wie ein Fehler.
 */
export function drawRewind(ctx: CanvasRenderingContext2D, L: Layout, weiteTicks: number): void {
  const b = L.rewindBtn;
  const sek = Math.round(weiteTicks / TICK_HZ);
  drawIconButton(ctx, b, '↺', sek > 0);
  if (sek > 0) {
    ctx.fillStyle = COL.text;
    ctx.font = '600 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`${sek}s`, b.x + b.w / 2, b.y + b.h - 12);
  }
}
