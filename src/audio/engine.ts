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

/**
 * Pegel der Musikschiene.
 *
 * Steht als Konstante, weil `duck()` ihn kennen muss: Das Ducken faehrt den
 * Pegel herunter und danach wieder **auf diesen Wert**. Als Zahl an zwei Stellen
 * geschrieben hiesse, dass jede Aenderung an der Lautstaerke beim naechsten
 * Ducken stillschweigend zurueckgenommen wird.
 */
const MUSIK_PEGEL = 0.56;
const SFX_PEGEL = 0.85;

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private busGain: Record<Bus, GainNode | null> = { sfx: null, music: null };
  private noiseBuffer: AudioBuffer | null = null;
  private stille: HTMLAudioElement | null = null;
  private hall: ConvolverNode | null = null;
  private duckBis = 0;
  private musikLp: BiquadFilterNode | null = null;

  /**
   * Kurzer, heller Nachhall aus abklingendem Rauschen.
   *
   * Kein echter Federhall, aber dieselbe Aufgabe: ein gemeinsamer Raum. Die
   * Kurve faellt schnell (Exponent 3,2), sonst verschmiert bei sechzig
   * grabenden Figuren alles zu Matsch.
   */
  private federhall(sek: number): AudioBuffer {
    const ctx = this.ctx!;
    const n = Math.floor(ctx.sampleRate * sek);
    const buf = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let k = 0; k < 2; k++) {
      const d = buf.getChannelData(k);
      for (let i = 0; i < n; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2);
      }
    }
    return buf;
  }

  /**
   * Musik kurz zuruecknehmen, damit ein Ereignis durchkommt.
   *
   * Anderthalb Dezibel, nicht mehr — genug, damit der Ton Platz hat, zu wenig,
   * als dass man das Ducken selbst bemerkt. Mehr klingt nach Radiowerbung.
   */
  duck(sekunden = 0.35): void {
    const g = this.busGain.music;
    if (!g || !this.ctx) return;
    const jetzt = this.ctx.currentTime;
    // Das laengste angemeldete Ducken gewinnt, unabhaengig von der Reihenfolge
    // der Aufrufe. Wer zuerst kommt, hat sonst recht — und dann hebt sich die
    // Musik mitten in einer noch laufenden Fanfare wieder an, nur weil deren
    // Ducken frueher angemeldet wurde als das des Stingers darueber.
    const bis = jetzt + sekunden;
    if (bis <= this.duckBis) return;
    this.duckBis = bis;
    g.gain.cancelScheduledValues(jetzt);
    g.gain.setTargetAtTime(MUSIK_PEGEL * 0.84, jetzt, 0.02);
    g.gain.setTargetAtTime(MUSIK_PEGEL, bis, 0.12);
  }

  /**
   * Tiefpass auf die Musik. Fuer die Pause: Die Musik rueckt weg, statt
   * abzureissen. Ein harter Schnitt fuehlt sich nach Absturz an.
   */
  musikFilter(hz: number): void {
    if (!this.ctx || !this.musikLp) return;
    this.musikLp.frequency.setTargetAtTime(hz, this.ctx.currentTime, 0.06);
  }

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

  /**
   * Erzeugt eine sehr kurze stille Tondatei und spielt sie ab.
   *
   * Der Grund ist ein Sonderweg von iOS: Web Audio laeuft dort in der
   * Kategorie "ambient" und wird vom **Klingelschalter am Geraeterand**
   * stummgeschaltet — auch wenn die Lautstaerke oben steht. Sobald die Seite
   * einmal ein gewoehnliches Audioelement abgespielt hat, wechselt die Sitzung
   * in die Kategorie "playback", und Web Audio ist auch bei stummem Klingeln
   * zu hoeren. Genau dafuer ist diese Datei da; ihr Inhalt ist Stille.
   *
   * Das ist ein Verdacht, kein Beweis: Wer den Schalter umlegt, hoert auch
   * ohne diesen Umweg etwas. Aber es ist der einzige Weg, auf dem eine Seite
   * das von sich aus richtigstellen kann.
   */
  private weckeTonsitzung(): void {
    if (this.stille) return;
    const rate = 8000;
    const n = rate / 10;
    const buf = new Uint8Array(44 + n * 2);
    const dv = new DataView(buf.buffer);
    const text = (o: number, t: string) => {
      for (let i = 0; i < t.length; i++) buf[o + i] = t.charCodeAt(i);
    };
    text(0, 'RIFF');
    dv.setUint32(4, 36 + n * 2, true);
    text(8, 'WAVEfmt ');
    dv.setUint32(16, 16, true);
    dv.setUint16(20, 1, true);
    dv.setUint16(22, 1, true);
    dv.setUint32(24, rate, true);
    dv.setUint32(28, rate * 2, true);
    dv.setUint16(32, 2, true);
    dv.setUint16(34, 16, true);
    text(36, 'data');
    dv.setUint32(40, n * 2, true);
    const el = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })));
    el.setAttribute('playsinline', '');
    el.volume = 1;
    void el.play().catch(() => {
      /* Wenn der Browser das nicht will, bleibt es beim Klingelschalter. */
    });
    this.stille = el;
  }

  /** Beim ersten Fingerdruck aufrufen. Mehrfachaufrufe sind harmlos. */
  unlock(): void {
    this.weckeTonsitzung();
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

      // Weiche Bremse vor dem Ausgang. Sie ist nicht Klanggestaltung, sondern
      // Schutz: Musik laeuft ohne Stimmenbegrenzung, und wenn gleichzeitig
      // sechs Effekte anschlagen, koennte die Summe ueber die Vollaussteuerung
      // gehen und knacken. Erst mit dieser Bremse darf die Musik so laut
      // stehen, dass man sie auf einem Handy ueberhaupt hoert.
      const komp = this.ctx.createDynamicsCompressor();
      komp.threshold.value = -14;
      komp.knee.value = 10;
      komp.ratio.value = 5;
      komp.attack.value = 0.004;
      komp.release.value = 0.16;

      // Bandsaettigung ganz am Ende — und zugleich die Sicherheitsbremse.
      //
      // Eine Kennlinie in Form eines Tangens hyperbolicus: In der Mitte fast
      // gerade, an den Raendern flach. Was daraus folgt, ist genau das, was ein
      // Tonband tut und was die Vorgabe unter "warme Bandsaettigung" meint —
      // leise Stellen kommen etwas lauter heraus, laute werden weich
      // eingefangen statt abgeschnitten.
      //
      // Zwei Dinge auf einmal, und beide werden hier gebraucht:
      //
      // 1. **Lauter ohne lauter zu drehen.** Bei halber Aussteuerung hebt die
      //    Kurve um gut drei Dezibel an. Genau das heisst "mehr Volumen": nicht
      //    hoehere Spitzen, sondern mehr Energie dazwischen.
      // 2. **Uebersteuerung ist ausgeschlossen, nicht unwahrscheinlich.** Ein
      //    Waveshaper begrenzt seine Eingabe von sich aus auf plus/minus eins;
      //    die Kurve endet bei 0,92. Damit *kann* nichts mehr ueber die
      //    Vollaussteuerung hinaus, egal wie viele Spitzen zufaellig
      //    zusammenfallen. Ein Kompressor kann das nicht versprechen: Er regelt
      //    nach, und in der Anregelzeit rutscht der erste Transient durch.
      //    Genau so ist die Spitze von 1,009 entstanden.
      //
      // Das ist nicht das Brickwall-Limiting, das die Vorgabe ablehnt. Das will
      // Lautheit erzwingen und drueckt dafuer die ganze Zeit; diese Kurve
      // veraendert leise Passagen kaum und den Dynamikumfang gar nicht.
      const saettigung = this.ctx.createWaveShaper();
      const stufen = 1024;
      const kurve = new Float32Array(stufen);
      // Wie stark die Kurve kruemmt. Darueber wird aus Saettigung Verzerrung.
      const trieb = 1.6;
      for (let i = 0; i < stufen; i++) {
        const x = (i / (stufen - 1)) * 2 - 1;
        // 0,85 und nicht 0,99: Die Ueberabtastung filtert beim Zurueckrechnen,
        // und ein Filter schwingt an Kanten ueber. Gemessen kamen dadurch 0,968
        // heraus, wo die Kurve auf 0,92 endete. Der Abstand ist fuer diesen
        // Ueberschwinger da, nicht fuer die Kurve.
        kurve[i] = (0.85 * Math.tanh(x * trieb)) / Math.tanh(trieb);
      }
      saettigung.curve = kurve;
      // Ohne Ueberabtastung entstehen an der Kruemmung Spiegelfrequenzen, die
      // als schriller Beiklang hoerbar werden — besonders bei den hohen
      // Glockentoenen.
      saettigung.oversample = '4x';

      // Hochpass vor dem Ausgang.
      //
      // Ein Handylautsprecher gibt unter etwa 60 Hz nichts wieder — die
      // Energie dort ist trotzdem da und frisst Aussteuerungsreserve, die
      // oben fehlt. Weg damit: Das Fundament liegt bei 150 bis 250 Hz.
      const hoch = this.ctx.createBiquadFilter();
      hoch.type = 'highpass';
      hoch.frequency.value = 85;
      hoch.Q.value = 0.7;

      // Bassanhebung — und zwar genau dort, wo ein Handy noch etwas hergibt.
      //
      // "Mehr Bass" heisst auf einem Telefon nicht "tiefer". Unter etwa 150 Hz
      // bewegt so ein Lautsprecher keine Luft mehr, egal wie viel man
      // hineinschickt; die Energie verschwindet einfach. Was man dort wirklich
      // hoert, liegt zwischen 150 und 250 Hz — deshalb sitzt die Anhebung auf
      // 230 Hz und nicht bei 60. Ueber Kopfhoerer kommt der Tiefgang ohnehin
      // vom Hochpass darunter, der nur wegnimmt, was nirgends ankommt.
      //
      // Sie steht **vor** der Bremse, damit die Bremse den angehobenen Bass
      // mitbekommt. Danach angehoben wuerde er die Aussteuerung sprengen, die
      // die Bremse gerade erst hergestellt hat.
      const bassSchiene = this.ctx.createBiquadFilter();
      bassSchiene.type = 'lowshelf';
      bassSchiene.frequency.value = 230;
      bassSchiene.gain.value = 3.5;

      this.master.connect(hoch);
      hoch.connect(bassSchiene);
      bassSchiene.connect(komp);
      komp.connect(saettigung);
      saettigung.connect(this.ctx.destination);

      // Federhall. Er ist der Leim zwischen Musik und Geraeuschen: Beide gehen
      // durch denselben Raum, und dadurch klingen sie wie am selben Ort
      // aufgenommen statt wie zwei getrennte Zuspieler.
      this.hall = this.ctx.createConvolver();
      this.hall.buffer = this.federhall(0.34);
      const hallPegel = this.ctx.createGain();
      hallPegel.gain.value = 0.5;
      this.hall.connect(hallPegel);
      hallPegel.connect(this.master);

      for (const bus of ['sfx', 'music'] as Bus[]) {
        const g = this.ctx.createGain();
        g.gain.value = bus === 'music' ? MUSIK_PEGEL : SFX_PEGEL;
        this.busGain[bus] = g;

        if (bus === 'music') {
          this.musikLp = this.ctx.createBiquadFilter();
          this.musikLp.type = 'lowpass';
          this.musikLp.frequency.value = 18000;
          g.connect(this.musikLp);
          this.musikLp.connect(this.master);
        } else {
          g.connect(this.master);
        }

        const send = this.ctx.createGain();
        send.gain.value = bus === 'music' ? 0.1 : 0.14;
        g.connect(send);
        send.connect(this.hall);
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
    /** Tiefpass in Hertz. Aus einem Sägezahn wird damit ein Vokal. */
    filterHz?: number;
    /** Faktor, um den der Tiefpass bis zum Ende wandert. */
    filterSweep?: number;
    /**
     * Anteil der Tondauer, den der Ton auf voller Staerke **haelt**, bevor er
     * ausklingt. 0 heisst: sofort nach dem Anstieg abfallen.
     *
     * Das ist der Unterschied zwischen einem Anschlag und einem Ton. Ohne
     * Halten kann diese Werkstatt nur Stabspiele, Zupfer und Schlaege — und
     * eine Melodie aus lauter wegsterbenden Anschlaegen hat keine Linie,
     * sondern nur Punkte. Erst mit Halten sind Klarinette, Akkordeon und
     * Panfloete moeglich, und erst damit kann eine Melodie singen.
     */
    hold?: number;
    /** Vibrato in Hertz. Etwa 5 Hz ist eine geblasene oder gestrichene Stimme. */
    vibratoHz?: number;
    /** Wie weit das Vibrato ausschlaegt, in Cent. */
    vibratoCents?: number;
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
    // Vibrato. Es steigt erst ein, statt sofort dazustehen: Ein Blaeser setzt
    // den Ton an und faengt dann an zu vibrieren. Vibrato ab der ersten
    // Millisekunde klingt nach Leierkasten.
    if (opts.vibratoHz) {
      const lfo = ctx.createOscillator();
      const tiefe = ctx.createGain();
      lfo.frequency.value = opts.vibratoHz;
      const cent = opts.vibratoCents ?? 12;
      const ausschlag = opts.freq * (Math.pow(2, cent / 1200) - 1);
      tiefe.gain.setValueAtTime(0, t);
      tiefe.gain.linearRampToValueAtTime(ausschlag, t + Math.min(0.28, opts.dur * 0.6));
      lfo.connect(tiefe);
      tiefe.connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + opts.dur + 0.02);
    }

    const peak = opts.gain ?? 0.2;
    const atk = Math.min(opts.attack ?? 0.004, opts.dur * 0.5);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + atk);
    // Halten. Ohne den Stuetzpunkt in der Mitte laeuft die Abklingrampe schon
    // ab dem Ende des Anstiegs — eine Rampe interpoliert immer vom letzten
    // gesetzten Punkt aus, und der laege sonst am Anfang.
    const halten = Math.max(0, Math.min(1, opts.hold ?? 0));
    if (halten > 0) {
      g.gain.setValueAtTime(peak, t + atk + (opts.dur - atk) * halten);
    }
    g.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);

    if (opts.filterHz) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 6;
      lp.frequency.setValueAtTime(opts.filterHz, t);
      if (opts.filterSweep && opts.filterSweep !== 1) {
        lp.frequency.exponentialRampToValueAtTime(
          Math.max(60, opts.filterHz * opts.filterSweep),
          t + opts.dur,
        );
      }
      osc.connect(lp);
      lp.connect(g);
    } else {
      osc.connect(g);
    }
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
