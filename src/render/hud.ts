import { RATE_MAX, RATE_MIN, TICK_HZ } from '../core/constants';
import { SKILLS, SKILL_KNOPF, SKILL_LABEL, type SkillId } from '../core/types';
import type { World } from '../core/world';
import type { LevelDef } from '../levels/types';
import { drawRichtungsmarke, drawSkillBild, drawSkillIcon } from './icons';
import { NAME_BREITE, type Box, type Layout } from './layout';

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
  /**
   * Lebensvorrat fuer die Kopfleiste — `null`, wenn das System aus ist
   * (Testmodus). Im Level sichtbar, damit man **vor** dem riskanten Zug
   * weiss, was eine Niederlage kostet, nicht erst auf der Karte danach.
   */
  leben: { uebrig: number } | null;
  /**
   * Ist der Totenkopf scharf? Der erste Tipp schaerft nur (Spieltest-Runde:
   * er sass 45 Punkte neben der Pause und zuendete ohne Rueckfrage — ein
   * Fehlgriff kostete den ganzen Lauf). Der zweite Tipp zuendet, jeder
   * andere Tipp und drei Sekunden Warten entschaerfen wieder.
   */
  nukeScharf: boolean;
  /**
   * Winkt die Berufsleiste gerade?
   *
   * Wer eine Figur antippt, ohne einen Beruf gewaehlt zu haben, bekam gar
   * keine Antwort (Spieltest-Runde — der haeufigste erste Handgriff eines
   * Kindes lief ins Leere). Jetzt heben sich fuer einen Moment die noch
   * vorraetigen Knoepfe: Die Leiste zeigt auf sich selbst.
   */
  leisteWinkt: boolean;
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
  const nameMax = midX - ctx.measureText(`${w.saved}/${s.level.total}`).width / 2 - 14;
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

  // Der Rettungszaehler zaehlt gegen die GESAMTZAHL, nicht gegen die Quote.
  //
  // Bis hierher stand dort `gerettet/Quote`, und das war in jedem Level
  // falsch, in dem man mehr retten kann als noetig — also in fast jedem. In
  // „Unter dem Hinweg" (16 Figuren, Quote 14) zaehlte die Leiste bis 16/14
  // hoch: ein Bruch, dessen Zaehler groesser ist als sein Nenner. Ein
  // Spieler liest das als Fehler, und er hat recht.
  //
  // Jetzt steht dort, wie viele von allen angekommen sind — eine Zahl, die
  // ihre Obergrenze nie ueberschreitet und die zweite Sternbedingung („alle
  // gerettet") ueberhaupt erst sichtbar macht.
  //
  // Und sie stimmt damit endlich mit dem Balken darunter ueberein: Der
  // Quotenbalken teilt seine Breite seit jeher durch `w.total` und traegt
  // die Quote als weisse Marke bei `needed * per`. Zaehler und Balken
  // standen also unmittelbar uebereinander und rechneten gegen
  // VERSCHIEDENE Bezugsgroessen — das war der eigentliche Fehler, und die
  // Marke auf dem Balken ist die Stelle, an der die Quote hingehoert. Der
  // Zaehler wird zusaetzlich gruen, sobald sie erreicht ist, die
  // Beschriftung nennt sie, wo Platz dafuer ist, und die Startklappe sagt
  // sie ohnehin an („rette 14 von 16").
  ctx.textAlign = 'center';
  ctx.fillStyle = COL.dim;
  ctx.font = '600 10px system-ui, sans-serif';
  if (b.h > 48) {
    // Die Quote kommt in die Beschriftung — aber nur, wenn sie hineinpasst.
    // Die Mitte-Spalte ist zentriert, die Zeit rechtsbuendig; die lange
    // Fassung stiess auf dem Telefon mit ihr zusammen („AB 14ZEIT"), genau
    // wie es der Levelname zwei Spalten weiter links schon einmal getan hat.
    // Statt eine Breite zu raten, fragt die Leiste hier nach: Passt die
    // lange Fassung nicht, steht die kurze da, und die Quote sagen die
    // Startklappe und der gruene Zaehler.
    const lang = `GERETTET · AB ${w.needed}`;
    const platz = timeRight - ctx.measureText('ZEIT').width - 10 - midX;
    ctx.fillText(ctx.measureText(lang).width / 2 <= platz ? lang : 'GERETTET', midX, 7);
  }
  ctx.fillStyle = w.saved >= w.needed ? COL.good : COL.text;
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.fillText(`${w.saved}/${s.level.total}`, midX, b.h > 48 ? 20 : 14);

  drawSoundButton(ctx, L.soundBtn, s.muted);
  drawIconButton(ctx, L.nukeBtn, '☢', s.nukeScharf);
  if (s.nukeScharf) {
    // Die Rueckfrage steht als Fahne UNTER dem Knopf, nicht in einem
    // Fenster: Wer aufgibt, soll das ohne Dialog tun duerfen — wer
    // danebentippt, nicht. Unter der Leiste, damit sie der Uhr nicht ins
    // Wort faellt (erste Fassung ueberdeckte sie).
    ctx.save();
    const txt = 'nochmal tippen = alle sprengen';
    ctx.font = '700 10px system-ui, sans-serif';
    const tw = ctx.measureText(txt).width + 14;
    const fx = Math.min(b.x + b.w - tw - 6, L.nukeBtn.x + L.nukeBtn.w / 2 - tw / 2);
    const fy = b.y + b.h + 6;
    ctx.fillStyle = 'rgba(24, 10, 14, 0.92)';
    roundRect(ctx, fx, fy, tw, 20, 6);
    ctx.fill();
    ctx.strokeStyle = COL.bad;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COL.bad;
    ctx.fillText(txt, fx + tw / 2, fy + 11);
    ctx.restore();
  }
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

  // Eine Schriftgroesse fuer alle acht Namen: die groesste, bei der auch der
  // laengste („Kletterer") noch in seinen Knopf passt.
  //
  // Vorher suchte jeder Knopf seine eigene Groesse. Das Ergebnis war eine
  // Leiste mit acht verschieden grossen Beschriftungen — „Kletterer" in elf
  // Punkt neben „Schirmspringer" in acht. Zwei Schriftgroessen nebeneinander
  // lesen als Rangfolge: Der groessere Name sieht wichtiger aus. Es gibt hier
  // aber keine Rangfolge, es gibt acht gleichwertige Werkzeuge.
  const erste = L.skillButtons[0];
  const namePlatz = erste.w - 8;
  // Die Obergrenze haengt auch an der Knopfhoehe: Auf einem flachen Knopf
  // frisst eine grosse Schrift dem Symbol den Platz weg, und ein Name ohne
  // erkennbares Bild darueber ist genauso halb wie ein Bild ohne Namen.
  let nameFs = Math.min(10.5, Math.round(erste.h * 0.23 * 2) / 2);
  const passt = (fs: number): boolean => {
    ctx.font = `600 ${fs}px system-ui, sans-serif`;
    return SKILLS.every((id) => ctx.measureText(SKILL_KNOPF[id]).width <= namePlatz);
  };
  while (nameFs > 8 && !passt(nameFs)) nameFs -= 0.5;
  // Die Zeile, die der Name unten belegt — daraus ergibt sich, was oben fuer
  // das Symbol uebrig bleibt. Beide aus derselben Zahl zu rechnen ist der
  // einzige Weg, auf dem sie sich bei keiner Knopfhoehe ueberlappen.
  const nameRaum = nameFs + 7;

  for (const b of L.skillButtons) {
    const count = s.world.skills[b.id];
    const selected = s.selected === b.id;
    const usable = count > 0;
    // Ab dieser Breite passt der Name unter das Symbol, ohne zu brechen. Das
    // Layout stellt sicher, dass das im Hochformat gilt — notfalls, indem es
    // die acht Knoepfe auf zwei Reihen legt.
    const weit = b.w >= NAME_BREITE;
    // Und ab dieser Hoehe passt neben das Symbol noch die arbeitende Figur.
    // Zweireihig ist der Knopf dafuer zu flach: Dort traegt das Symbol allein,
    // dafuer gross und mittig.
    const hoch = weit && b.h >= 58;

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

    if (s.leisteWinkt && usable && !selected) {
      // Der Wink: ein warmer Ring um jeden Knopf, der noch etwas hergibt.
      ctx.save();
      ctx.strokeStyle = COL.accent;
      ctx.lineWidth = 2;
      roundRect(ctx, b.x + 1, b.y + 1, b.w - 2, b.h - 2, 11);
      ctx.stroke();
      ctx.restore();
    }

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

    // --- Symbol ------------------------------------------------------------
    //
    // Ein Knopf, drei Aussagen: **was** (Symbol), **wohin** (Richtungsmarke),
    // **wie oft** (Plakette) — und darunter der ausgeschriebene **Name**.
    //
    // Vorher stand auf dem breiten Knopf zusaetzlich die arbeitende Figur.
    // Sie ist gegangen, und zwar nicht aus Platznot: Vier Bilder auf einer
    // Flaeche von fuenfundsiebzig Punkten heben sich gegenseitig auf. Die
    // Figur bei der Arbeit lehrt am besten dort, wo sie ohnehin steht — im
    // Spielfeld. Der Knopf muss etwas anderes koennen: in einem Viertel
    // Augenblick sagen, welches Werkzeug er ist. Dafuer traegt jetzt ueberall
    // dasselbe Bild in derselben Groesse an derselben Stelle, hoch wie quer.
    //
    // Der gewaehlte Knopf drueckt sichtbar ein: Alles rutscht anderthalb
    // Punkte nach unten.
    const druck = selected ? 1.5 : 0;
    const symbolFarbe = selected ? '#ffffff' : usable ? COL.text : '#4a5a75';
    // Was nach der Namenszeile oben uebrig bleibt. Die Groesse bindet an
    // diesen Rest UND an die Breite: nur an der Breite gebunden, stuende das
    // Symbol im flachen zweireihigen Knopf unter dem Namen hervor; nur an der
    // Hoehe gebunden, verschwaende es quer die Breite.
    const symbolRaum = weit ? b.h - nameRaum - 4 : b.h;
    const gross = weit ? Math.min(b.w * 0.62, symbolRaum, 42) : Math.min(b.w * 0.74, 40);
    const symbolY = weit ? b.y + 2 + symbolRaum / 2 : b.y + b.h * 0.46;
    // Das gemalte Symbol zuerst; die Vektorform bleibt der Rueckfall. Es
    // traegt eigene Farben, darf also groesser stehen als die einfarbige
    // Form — Zustand sagt die Knopfflaeche, aufgebraucht sagt die Durchsicht.
    if (!drawSkillBild(ctx, b.id, b.x + b.w / 2, symbolY + druck, gross, !usable)) {
      drawSkillIcon(ctx, b.id, b.x + b.w / 2, symbolY + druck, gross * 0.78, symbolFarbe);
    }

    // --- Richtungsmarke ----------------------------------------------------
    //
    // Fuenf der acht Berufe tragen die Figur durch die Welt, und sie
    // unterscheiden sich nur in der RICHTUNG: Kletterer hinauf,
    // Brueckenbauer schraeg hinauf, Rammer waagerecht, Schraegbagger schraeg
    // hinab, Graeber hinab. Genau diese Reihe ist am gemalten Blatt kaum zu
    // sehen — Schraegbagger und Graeber sind dort zwei Schaufeln im Schutt,
    // und bei siebenundzwanzig Punkten ist das dieselbe Schaufel.
    //
    // Die Marke sagt es unabhaengig vom Symbol: dieselbe kleine Scheibe, nur
    // gedreht. Wer eine gelesen hat, liest alle fuenf — und die drei ohne
    // Marke (Blocker, Sprengmeister, Schirmspringer) sagen mit dem Fehlen
    // ebenfalls etwas Wahres: Sie bringen niemanden woandershin.
    //
    // Sie steht nur auf dem breiten Knopf. Auf einem von fuenfunddreissig
    // Punkten stiesse sie mit der Plakette zusammen, und zwei Zeichen, die
    // einander ueberdecken, sagen weniger als eines.
    if (weit) drawRichtungsmarke(ctx, b.id, b.x + 12, b.y + 12 + druck, usable, selected);

    // --- Name, nur wo Platz ist -------------------------------------------
    //
    // Auf dem Knopf steht die Kurzform (SKILL_KNOPF), nicht der volle Name.
    // Den vollen schreibt die Hinweiszeile unter der Leiste, sobald man den
    // Beruf waehlt — und weil jede Kurzform die Wurzel des vollen Namens ist,
    // lernt man das Paar dabei nebenbei.
    //
    // Reicht selbst acht Punkt nicht, wird der Name gestaucht statt
    // weggelassen. Ein Knopf ohne Namen war der Befund, der diesen Umbau
    // ausgeloest hat; er darf nicht durch die Hintertuer zurueckkommen.
    if (weit) {
      ctx.font = `600 ${nameFs}px system-ui, sans-serif`;
      const breite = ctx.measureText(SKILL_KNOPF[b.id]).width;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      // Heller als zuvor (COL.dim war ein Grauton fuer Nebensaechliches). Der
      // Name ist hier die Hauptsache.
      ctx.fillStyle = selected ? '#ffffff' : usable ? '#c9d8ef' : '#4a5468';
      const mitte = b.x + b.w / 2;
      const grund = b.y + b.h - (hoch ? 12 : 9);
      if (breite > namePlatz) {
        ctx.translate(mitte, grund);
        ctx.scale(namePlatz / breite, 1);
        ctx.fillText(SKILL_KNOPF[b.id], 0, 0);
      } else {
        ctx.fillText(SKILL_KNOPF[b.id], mitte, grund);
      }
      ctx.restore();
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
