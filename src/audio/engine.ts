/**
 * Kleine Synthese-Werkstatt auf Basis der Web Audio API.
 *
 * Warum synthetisiert und nicht als Tondateien: Der Prototyp laesst sich in
 * eine einzige HTML-Datei packen, weil er nichts nachlaedt. Eingebettete
 * Tonspuren wuerden diese Eigenschaft zerstoeren — und wir brauchen sie, damit
 * man das Spiel ohne Server aufs Handy bekommt. Ausserdem passt es zum Rest:
 * Auch die Grafik entsteht zur Laufzeit.
 *
 * Der Klangkontext darf erst nach einer Nutzergeste entstehen, sonst blockt
 * ihn der Browser. Deshalb wird alles erst in `unlock()` angelegt.
 */

export type Bus = 'sfx' | 'music';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private busGain: Record<Bus, GainNode | null> = { sfx: null, music: null };
  private noiseBuffer: AudioBuffer | null = null;

  /** Begrenzt die Stimmen pro Bild — 60 grabende Figuren duerfen nicht knallen. */
  private voicesThisFrame = 0;
  private readonly maxVoicesPerFrame = 6;

  muted = false;

  get ready(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  get time(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  /** Beim ersten Fingerdruck aufrufen. Mehrfachaufrufe sind harmlos. */
  unlock(): void {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      try {
        this.ctx = new Ctor();
      } catch {
        return;
      }
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);

      for (const bus of ['sfx', 'music'] as Bus[]) {
        const g = this.ctx.createGain();
        g.gain.value = bus === 'music' ? 0.32 : 0.85;
        g.connect(this.master);
        this.busGain[bus] = g;
      }

      // Rauschen einmal erzeugen und wiederverwenden.
      const len = Math.floor(this.ctx.sampleRate * 0.6);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buf;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setMuted(m: boolean): void {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.02);
    }
  }

  /** Einmal pro Bild aufrufen — setzt die Stimmenzaehlung zurueck. */
  beginFrame(): void {
    this.voicesThisFrame = 0;
  }

  private take(): boolean {
    if (!this.ready || this.muted) return false;
    if (this.voicesThisFrame >= this.maxVoicesPerFrame) return false;
    this.voicesThisFrame++;
    return true;
  }

  private out(bus: Bus): GainNode | null {
    return this.busGain[bus];
  }

  /**
   * Ein Ton mit Huellkurve.
   * `slide` verstimmt zum Ende hin — damit entstehen Auf- und Abwaertsrutscher.
   */
  tone(opts: {
    freq: number;
    dur: number;
    type?: OscillatorType;
    gain?: number;
    slide?: number;
    attack?: number;
    bus?: Bus;
    delay?: number;
    ignoreLimit?: boolean;
  }): void {
    const ctx = this.ctx;
    if (!ctx) return;
    if (!opts.ignoreLimit && !this.take()) return;
    if (opts.ignoreLimit && (!this.ready || this.muted)) return;
    const dest = this.out(opts.bus ?? 'sfx');
    if (!dest) return;

    const t = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = opts.type ?? 'square';
    osc.frequency.setValueAtTime(Math.max(20, opts.freq), t);
    if (opts.slide && opts.slide !== 1) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, opts.freq * opts.slide),
        t + opts.dur,
      );
    }
    const peak = opts.gain ?? 0.2;
    const atk = opts.attack ?? 0.004;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);

    osc.connect(g);
    g.connect(dest);
    osc.start(t);
    osc.stop(t + opts.dur + 0.02);
  }

  /** Gefiltertes Rauschen — Grabegeraeusche, Funken, Einschlaege. */
  noise(opts: {
    dur: number;
    gain?: number;
    filter?: BiquadFilterType;
    freq?: number;
    q?: number;
    sweep?: number;
    bus?: Bus;
    delay?: number;
    ignoreLimit?: boolean;
  }): void {
    const ctx = this.ctx;
    if (!ctx || !this.noiseBuffer) return;
    if (!opts.ignoreLimit && !this.take()) return;
    if (opts.ignoreLimit && (!this.ready || this.muted)) return;
    const dest = this.out(opts.bus ?? 'sfx');
    if (!dest) return;

    const t = ctx.currentTime + (opts.delay ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;

    const bq = ctx.createBiquadFilter();
    bq.type = opts.filter ?? 'bandpass';
    bq.frequency.setValueAtTime(opts.freq ?? 900, t);
    if (opts.sweep && opts.sweep !== 1) {
      bq.frequency.exponentialRampToValueAtTime(
        Math.max(40, (opts.freq ?? 900) * opts.sweep),
        t + opts.dur,
      );
    }
    bq.Q.value = opts.q ?? 1;

    const g = ctx.createGain();
    const peak = opts.gain ?? 0.15;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);

    src.connect(bq);
    bq.connect(g);
    g.connect(dest);
    src.start(t);
    src.stop(t + opts.dur + 0.02);
  }
}
