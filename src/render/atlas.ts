import { State, type SkillId, type Wusel } from '../core/types';
import { sx, sy, type View } from './camera';
import { drawSchopf, schopfFarbe, schopfPuls } from './schopf';
import { drawMaske, maskeFarbe } from './maske';
import { drawWerkzeug } from './werkzeug';

/**
 * Sprite-Atlas für die Figuren.
 *
 * Zelle **28 × 28** logisch, Fusspunkt **(14, 22)** — hergeleitet und gemessen
 * in `docs/grafik-ankerbild-a0.md` §4, die dem älteren `grafik-integration.md`
 * an dieser Stelle vorgeht. Die Bildzahl je Zustand stammt weiterhin aus
 * `grafik-integration.md` §2.3. Zwei Eigenheiten sind dort hergeleitet und hier
 * bindend umgesetzt:
 *
 * - **Haltedauer je Bild, nicht je Blatt.** `DIG_INTERVAL` ist 7 und damit
 *   prim; eine gleichmässige Haltedauer wäre arithmetisch unmöglich.
 * - **Bild eins ist das Wirkungsbild.** Die Simulation arbeitet bei
 *   `timer % interval === 0`, und genau dort steht der Bildindex auf 0. Der
 *   Schaufelbiss muss deshalb auf dem ersten Bild liegen, sonst laufen
 *   Animation und Terrainänderung auseinander.
 *
 * Der Bildindex kommt aus `w.timer`, also aus der Uhr *dieser* Figur — nicht
 * aus einem globalen Takt. Sonst schlagen alle Hämmer im Gleichschritt zu.
 */

/**
 * Das Zellmass der **Rückfallebene**, nicht des ausgelieferten Blattes.
 *
 * Das ist seit der Murmel eine wichtige Unterscheidung. Diese vier Zahlen
 * beschreiben nur noch `DEFAULT_MANIFEST` — das Ersatzblatt, das aus dem
 * prozeduralen Zeichner entsteht. Das echte Blatt bringt sein Mass in
 * `murmel.atlas.json` selbst mit, und dort ist es **aus der Figurenhöhe
 * zurückgerechnet** statt festgeschrieben (siehe `scripts/bake-murmel.mjs`):
 * Der Körper der Murmel füllt einen festen Anteil der Zelle, also folgt die
 * Zelle aus `WUSEL_H` und nicht umgekehrt.
 *
 * Der Renderer liest ausschliesslich `manifest.cell` und `manifest.anchor` —
 * diese Konstanten hier erreichen ihn nie. Wer sie ändert, ändert das
 * Ersatzblatt; wer die Figurengrösse ändern will, ändert `WUSEL_H` und bäckt
 * neu.
 *
 * Die Breite bleibt gerade und der Anker auf halber Zellbreite — sonst
 * verliert die Spiegelung ihre Versatzfreiheit (siehe `drawWusel`).
 */
export const CELL_W = 28;
export const CELL_H = 28;
export const ANCHOR_X = 14;
export const ANCHOR_Y = 22;

export interface ClipDef {
  /** Zeile im Blatt. */
  row: number;
  /** Haltedauer je Bild in Ticks. Die Länge ist zugleich die Bildzahl. */
  holds: number[];
  /** Einmalige Abläufe frieren auf dem letzten Bild ein, statt zu wiederholen. */
  once?: boolean;
  /**
   * Ansatzpunkt des Schopfs je Einzelbild, in logischen Pixeln von der linken
   * oberen Zellecke aus.
   *
   * Warum eine Tabelle und keine feste Stelle: Der Ansatz wandert je nach Pose
   * zwischen y = 5,4 und y = 25,8 — beim Klettern sitzt er hoch, beim Sterben
   * fast auf dem Boden, waagerecht schwankt er zwischen 10,6 und 25,0. Eine
   * feste Stelle liesse den Schopf bei jeder Neigung vom Kopf rutschen.
   */
  anchors?: [number, number][];
  /** Zustand des Schopfs je Einzelbild — Index in `SCHOPF_ZUSTAND`. */
  tuff?: number[];
  /** Ansatz des Werkzeugs je Einzelbild — die vordere Hand, aus dem Rig gemessen. */
  hands?: [number, number][];
  /**
   * Wie weit diese Pose beim Backen aus der Kamera weggedreht wurde, in Grad.
   *
   * Der Renderer braucht sie nicht — die Ansicht steckt ja im Bild. Sie steht
   * hier, damit **das Blatt selbst sagt, was es zeigt**: Ein altes, frontal
   * gebackenes Blatt ist von einem neuen sonst nicht zu unterscheiden, und der
   * Fehler faellt erst als „läuft seitwärts" auf. Ein Test hält sich daran fest.
   */
  dreh?: number;
}

export interface AtlasManifest {
  cell: { w: number; h: number };
  anchor: { x: number; y: number };
  /**
   * Bildpunkte je logischem Pixel im Blatt.
   *
   * `1` heisst Pixelgrafik: Ein logischer Pixel ist ein Bildpunkt, und der
   * Renderer vergrössert hart. Alles darüber heisst gemalt: Das Blatt hält
   * mehr Auflösung vor, als die Simulation kennt, und wird weich skaliert.
   *
   * Die Simulation ist davon unberührt — sie kennt nur Fusspunkt und
   * Figurenhöhe, beide in logischen Pixeln. `ppl` betrifft ausschliesslich,
   * wie fein das Blatt dieselbe Figur beschreibt.
   */
  ppl?: number;
  /**
   * Welche Figur dieses Blatt zeigt.
   *
   * Der Renderer braucht es, weil die **Signalschicht figurabhaengig** ist: Die
   * Murmel traegt einen Schopf ueber dem Kopf, das Erdmaennchen eine Augenmaske
   * im Gesicht. Beide haengen am selben Ankerpunkt je Einzelbild und am selben
   * Zustandsfeld — nur gezeichnet wird etwas anderes.
   *
   * Fehlt die Angabe, gilt die Murmel: Alle Blaetter, die es vor dieser
   * Unterscheidung gab, zeigen sie.
   */
  figur?: 'murmel' | 'erdmaennchen';
  clips: Record<string, ClipDef>;
}

/**
 * Die verbindliche Blattaufteilung. Wer eigene Grafik liefert, muss genau
 * diese Zeilen und Bildzahlen bedienen — sie hängen an den Taktraten der
 * Simulation und sind nicht frei wählbar.
 */
export const DEFAULT_MANIFEST: AtlasManifest = {
  cell: { w: CELL_W, h: CELL_H },
  anchor: { x: ANCHOR_X, y: ANCHOR_Y },
  clips: {
    walking: { row: 0, holds: [3, 3, 3, 3, 3, 3, 3, 3] },
    falling: { row: 1, holds: [4, 4, 4, 4] },
    floating: { row: 2, holds: [3, 3, 3, 3] },
    climbing: { row: 3, holds: [4, 4, 4, 4] },
    hoisting: { row: 4, holds: [8, 8, 8, 8, 8, 12], once: true },
    building: { row: 5, holds: [3, 3, 3, 3, 3, 3, 3, 3] },
    bashing: { row: 6, holds: [3, 3, 3] },
    mining: { row: 7, holds: [3, 3, 3, 3] },
    // DIG_INTERVAL = 7 ist prim — ungleiche Haltedauer ist hier zwingend.
    digging: { row: 8, holds: [3, 2, 2] },
    blocking: { row: 9, holds: [8, 8] },
    saving: { row: 10, holds: [3, 3, 3, 3, 3, 3], once: true },
    dying: { row: 11, holds: [3, 3, 3, 3, 3, 3, 4, 4], once: true },
  },
};

/**
 * Wie weit sich die Figur je Zustand in ihre Bewegungsrichtung legt, in
 * Bogenmass. Positiv ist nach vorn.
 *
 * ## Warum das hier steht und nicht im Blatt
 *
 * Weil eine Neigung nichts ist, was man backen sollte. Sie ist eine Haltung,
 * kein Körperbau: Wer geht, fällt nach vorn und fängt sich. Im Blatt wäre sie
 * in jedes einzelne Bild eingebrannt und liesse sich nicht mehr nachstellen.
 *
 * Was sie **nicht** ist: die Antwort auf „läuft seitwärts". Das war der erste
 * Versuch, und er ist gescheitert — eine Neigung verschiebt Pixel, aber die
 * Augen der Figur bleiben dabei in der Mitte, und die Blickrichtung ist der
 * stärkste Richtungshinweis, den es gibt. Dass die Murmel jetzt in ihre
 * Laufrichtung **sieht**, kommt aus dem Modell (`DREHUNG_GRAD` im Backskript).
 * Die Neigung kommt obendrauf und macht aus einer gedrehten Figur eine, die
 * sich bewegt.
 *
 * Gedreht wird um den **Fusspunkt**, weil dort der Kontakt zum Boden ist. Um
 * die Mitte gedreht rutschten die Füsse unter der Figur weg.
 *
 * Die Zahlen sind klein: 0,13 rad sind siebeneinhalb Grad, bei zwölf logischen
 * Pixeln Körperhöhe also gut anderthalb Pixel Versatz am Kopf. Mehr sähe nach
 * Sturm aus. Was nicht in der Tabelle steht, steht aufrecht — Blocker,
 * Rettung und Tod sind Zustände ohne Richtung, und eine Neigung wäre dort eine
 * Behauptung.
 */
export const LEHNE: Record<string, number> = {
  walking: 0.14,
  // Beim Fallen kippt es zurück: Der Körper bleibt hinter den Füssen.
  falling: -0.09,
  climbing: 0.06,
  // Der Aufschwung über die Kante ist die stärkste Bewegung, die es gibt.
  hoisting: 0.2,
  bashing: 0.09,
  mining: 0.11,
  digging: 0.04,
  building: 0.07,
};

/*
 * Hier stand eine Tabelle `DREHUNG`, die das Blatt waagerecht gestaucht hat.
 *
 * Sie war der Versuch, die Dreiviertelansicht **im Zeichner** herzustellen: Ein
 * schmalerer Umriss ist die Vorderansicht einer weggedrehten Figur, also müsste
 * eine Stauchung genügen. Sie genügt nicht, und der Grund ist der Kern der
 * ganzen Sache: Eine Stauchung schiebt Pixel zusammen, aber **die Augen bleiben
 * in der Mitte** — sie sind ins Bild gebacken. Die Blickrichtung ist der
 * stärkste Richtungshinweis, den eine Figur hat, und genau der lässt sich hier
 * nicht erzeugen. Die Rückmeldung „läuft immer noch seitwärts" kam prompt.
 *
 * Gedreht wird deshalb jetzt das **Modell**, beim Backen (`DREHUNG_GRAD` in
 * `scripts/bake-murmel.mjs`). Das Blatt bringt die Ansicht mit; eine Stauchung
 * darüber wäre eine zweite und würde die Figur platt drücken.
 */

/** Welcher Clip gehört zu welchem Zustand? */
export function clipForWusel(w: Wusel): string | null {
  switch (w.state) {
    case State.WALKING:
      return 'walking';
    case State.FALLING:
      return w.hasFloater && w.fallDist >= 10 ? 'floating' : 'falling';
    case State.CLIMBING:
      return 'climbing';
    case State.HOISTING:
      return 'hoisting';
    case State.BUILDING:
      return 'building';
    case State.BASHING:
      return 'bashing';
    case State.MINING:
      return 'mining';
    case State.DIGGING:
      return 'digging';
    case State.BLOCKING:
      return 'blocking';
    case State.SAVING:
      return 'saving';
    case State.DYING:
      return 'dying';
    default:
      return null;
  }
}

export function cycleTicks(clip: ClipDef): number {
  let n = 0;
  for (const h of clip.holds) n += h;
  return n;
}

/** Bildindex aus der Uhr dieser Figur. */
/**
 * Welchen Auftrag der Schopf anzeigt.
 *
 * Nicht „welchen Beruf hat die Figur", sondern **welcher wirkt gerade**. Ein
 * Kletterer mit Schirm, der faellt, ist in diesem Moment ein Schirmspringer,
 * und die Farbe muss das sagen — sonst zeigt sie einen Zustand an, der nicht
 * stattfindet. Deshalb entscheidet der Zustand und nicht der Besitz.
 *
 * Die Zuendschnur steht ganz oben: Wer gleich hochgeht, ist nichts anderes
 * mehr.
 */
export function schopfAuftrag(w: Wusel): SkillId | null {
  if (w.fuse > 0) return 'bomber';
  switch (w.state) {
    case State.BLOCKING:
      return 'blocker';
    case State.BUILDING:
      return 'builder';
    case State.BASHING:
      return 'basher';
    case State.MINING:
      return 'miner';
    case State.DIGGING:
      return 'digger';
    case State.CLIMBING:
    case State.HOISTING:
      return 'climber';
    case State.FALLING:
      return w.hasFloater ? 'floater' : null;
    default:
      return null;
  }
}

export function frameFor(clip: ClipDef, timer: number): number {
  const cycle = cycleTicks(clip);
  if (cycle <= 0) return 0;
  let t = clip.once ? Math.min(timer, cycle - 1) : ((timer % cycle) + cycle) % cycle;
  for (let i = 0; i < clip.holds.length; i++) {
    if (t < clip.holds[i]) return i;
    t -= clip.holds[i];
  }
  return clip.holds.length - 1;
}

export class SpriteAtlas {
  constructor(
    readonly image: CanvasImageSource,
    readonly manifest: AtlasManifest,
  ) {}

  has(clip: string): boolean {
    return clip in this.manifest.clips;
  }

  /**
   * Ein Bild aus dem Blatt an eine Bildschirmstelle zeichnen.
   *
   * Der Weg für alles ausserhalb des Spielfelds — die Übersichtskarte zeigt
   * dieselbe Figur, kennt aber weder `View` noch `Wusel`. Ohne diesen Zugang
   * müsste sie sich eine Simulationsfigur erfinden, nur um an ein Bild zu
   * kommen, und das wäre eine Lüge im Typsystem.
   *
   * @param x Fusspunkt auf dem Bildschirm, nicht die obere linke Ecke.
   * @param s Bildpunkte je logischem Pixel der Zelle.
   */
  drawClip(
    ctx: CanvasRenderingContext2D,
    name: string,
    frame: number,
    x: number,
    y: number,
    s: number,
    spiegeln = false,
  ): boolean {
    const clip = this.manifest.clips[name];
    if (!clip) return false;
    const cw = this.manifest.cell.w;
    const ch = this.manifest.cell.h;
    const ppl = this.manifest.ppl ?? 1;
    const f = ((frame % clip.holds.length) + clip.holds.length) % clip.holds.length;

    ctx.save();
    ctx.imageSmoothingEnabled = ppl > 1;
    ctx.translate(Math.round(x), Math.round(y));
    if (spiegeln) ctx.scale(-1, 1);
    ctx.drawImage(
      this.image,
      f * cw * ppl,
      clip.row * ch * ppl,
      cw * ppl,
      ch * ppl,
      -this.manifest.anchor.x * s,
      -this.manifest.anchor.y * s,
      cw * s,
      ch * s,
    );
    ctx.restore();
    return true;
  }

  /**
   * Zeichnet eine Figur. Gespiegelt wird um den Fusspunkt: Weil der Anker auf
   * halber Zellbreite sitzt, genügt dafür `scale(-1, 1)` ohne Versatzausgleich.
   */
  drawWusel(ctx: CanvasRenderingContext2D, v: View, w: Wusel, platz = Infinity): boolean {
    const name = clipForWusel(w);
    if (!name) return false;
    const clip = this.manifest.clips[name];
    if (!clip) return false;

    const cw = this.manifest.cell.w;
    const ch = this.manifest.cell.h;
    // Bildpunkte je logischem Pixel. Ein gemaltes Blatt hält mehr Auflösung
    // vor, als die Simulation kennt — die Zelle im Bild ist entsprechend
    // grösser als die Zelle in logischen Pixeln.
    const ppl = this.manifest.ppl ?? 1;
    const frame = frameFor(clip, w.timer);
    const s = v.scale;

    const footX = Math.round(sx(v, w.x));
    const footY = Math.round(sy(v, w.y));

    ctx.save();
    // Pixelgrafik wird hart vergrössert, Gemaltes weich verkleinert. Beides
    // ist hier richtig: Beim harten Vergrössern wäre Glättung ein Verwaschen,
    // beim weichen Verkleinern wäre ihr Fehlen ein Flimmern.
    ctx.imageSmoothingEnabled = ppl > 1;
    ctx.translate(footX, footY);
    if (w.dir < 0) ctx.scale(-1, 1);
    // Erst spiegeln, dann neigen — dadurch ist „vorn" in beiden Blickrichtungen
    // dieselbe Drehrichtung, und die Tabelle braucht kein Vorzeichen.
    if (LEHNE[name]) ctx.rotate(LEHNE[name]);
    ctx.drawImage(
      this.image,
      frame * cw * ppl,
      clip.row * ch * ppl,
      cw * ppl,
      ch * ppl,
      -this.manifest.anchor.x * s,
      -this.manifest.anchor.y * s,
      cw * s,
      ch * s,
    );

    // Das Werkzeug — vor dem Koerper, hinter dem Schopf.
    //
    // Die Reihenfolge ist Vorgabe und hat einen Grund: Der Schopf soll beim
    // Bohren **vor** dem Keil durchschwingen koennen. Laege er darunter,
    // verschwaende er hinter dem Geraet genau in dem Moment, in dem er am
    // meisten ausschlaegt.
    if (clip.hands) {
      const h = clip.hands[frame] ?? clip.hands[0];
      // Die Koerperhoehe steckt im Blatt: Der Koerper fuellt einen festen
      // Anteil der Zelle, und die Zelle ist aus genau dieser Hoehe
      // zurueckgerechnet worden (siehe `scripts/bake-murmel.mjs`).
      const koerperH = this.manifest.cell.h * 0.706;
      drawWerkzeug(
        ctx,
        name,
        h[0] - this.manifest.anchor.x,
        h[1] - this.manifest.anchor.y,
        koerperH,
        s,
      );
    }

    // Der Schopf, falls das Blatt einen kennt.
    //
    // Er wird hier gezeichnet und nicht daneben, weil er im selben gekippten
    // Koordinatensystem sitzt: Die Spiegelung nach links gilt für ihn genauso,
    // und weil der Ankerpunkt auf halber Zellbreite liegt, braucht es dafür
    // keinen Versatzausgleich.
    if (clip.anchors && clip.tuff) {
      const n = clip.holds.length;
      // Ein Bild Nachlauf: Der Schopf zeigt den Zustand des **vorherigen**
      // Körperbildes. Das ist die gesamte Physik, die er braucht — ohne den
      // Nachlauf wirkt er angeklebt, mit mehr als einem Bild wirkt er lose.
      // Bei einmaligen Abläufen bleibt Bild 0 bei sich selbst, statt ans Ende
      // zu springen: Ein Sterbender, dessen Schopf im ersten Bild schon platt
      // liegt, stirbt zweimal.
      const vor = clip.once ? Math.max(0, frame - 1) : (frame - 1 + n) % n;
      const a = clip.anchors[frame] ?? clip.anchors[0];
      const zustand = clip.tuff[vor] ?? 0;
      const px = (a[0] - this.manifest.anchor.x) * s;
      const py = (a[1] - this.manifest.anchor.y) * s;
      const auftrag = schopfAuftrag(w);
      // Beide Figuren teilen die Berufspalette und die Warnlampe; nur der
      // Grundton ohne Auftrag ist figurabhaengig. Bei der Murmel liegt er dicht
      // am Koerper (unauffaellig ist dort richtig), beim Erdmaennchen ist er ein
      // dunkles Naturbraun — die Augenringe sind sein Kennzeichen.
      const grund =
        this.manifest.figur === 'erdmaennchen' ? maskeFarbe(auftrag) : schopfFarbe(auftrag);
      const farbe = schopfPuls(grund, w.fuse);
      // Dieselbe Mechanik, zwei Zeichner: Der Anker sagt wo, das Zustandsfeld
      // sagt wie, und die Figur sagt was. Ein Schopf ueber dem Kopf oder eine
      // Maske im Gesicht — beides traegt die Berufsfarbe.
      //
      // Die Maske bekommt zusaetzlich den Backwinkel dieser Pose: Sie liegt im
      // Gesicht und muss der Drehung folgen, waehrend ein Schopf ueber dem Kopf
      // sitzt und es nicht muss.
      if (this.manifest.figur === 'erdmaennchen') {
        drawMaske(ctx, px, py, zustand, farbe, s, false, clip.dreh ?? 0);
      } else {
        drawSchopf(ctx, px, py, zustand, farbe, s, false, platz);
      }
    }
    ctx.restore();
    return true;
  }
}

/** Lädt ein Bild aus einer Adresse. Liefert null statt zu werfen. */
export function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
