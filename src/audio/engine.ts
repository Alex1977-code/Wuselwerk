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

/**
 * Die drei Schienen.
 *
 * `pad` ist keine dritte gleichberechtigte Schiene, sondern ein **Unterzweig
 * der Musik**: Er haengt hinter `music` und bekommt dadurch Ducken, Pausen-
 * Tiefpass und beide Hallwege geschenkt. Er existiert nur, damit ein einziger
 * Pegel automatisiert werden kann, ohne alles andere mitzunehmen — siehe
 * `pumpe()`.
 */
export type Bus = 'sfx' | 'music' | 'pad';

/**
 * Pegel der Musikschiene.
 *
 * Steht als Konstante, weil `duck()` ihn kennen muss: Das Ducken faehrt den
 * Pegel herunter und danach wieder **auf diesen Wert**. Als Zahl an zwei Stellen
 * geschrieben hiesse, dass jede Aenderung an der Lautstaerke beim naechsten
 * Ducken stillschweigend zurueckgenommen wird.
 */
/**
 * Warum die Schienen lauter stehen als vorher (0,56 bzw. 0,85).
 *
 * Nicht, weil es lauter sein soll, sondern weil das Panorama Pegel kostet — und
 * zwar ausgerechnet dort, wo gemessen wird. Ein `StereoPannerNode` verteilt
 * nach dem Gesetz gleicher **Leistung**: Bei Mitte stehen links und rechts auf
 * 0,707, ganz aussen auf 1 und 0. Auf zwei Lautsprechern kommt dabei jedes Mal
 * dieselbe Leistung heraus, beim Zusammenlegen zu Mono aber nicht — dort fehlen
 * in der Mitte drei und ganz aussen sechs Dezibel.
 *
 * Das ist kein Fehler, sondern die Eigenschaft, die diese Breite brauchbar
 * macht: Auf einem Handylautsprecher ruecken die gespreizten Stimmen von selbst
 * nach hinten und lassen Melodie, Bass und Schlag — die alle in der Mitte
 * stehen — vorne allein. Auf Kopfhoerern steht dagegen alles da. Eine Mischung,
 * die sich dem Wiedergabegeraet anpasst, ohne dass jemand etwas umschaltet.
 *
 * Bezahlt wird es hier: Beide Schienen kommen um den Betrag hoch, den die
 * Spreizung in der Summe gekostet hat. Uebersteuern kann dabei nichts — die
 * Saettigungskennlinie am Ausgang endet bei 0,92, unabhaengig davon, was
 * hineingeht.
 */
/**
 * 0,5 statt 0,7 — die Musik stand zu weit vorn.
 *
 * Die 0,7 stammen aus dem Auftrag „mehr Volumen, basslastiger". Der war
 * richtig, die Umsetzung an dieser Stelle nicht: Der Musikbus ist der einzige
 * Regler, der **alles gleichzeitig** anhebt, also auch das, was gar nicht mehr
 * Gewicht bekommen sollte. Was „basslastiger" wirklich gebracht hat, sind drei
 * andere Dinge — die Bassschiene (`bassSchiene`), der Anriss im `bass` und das
 * Zuruecktreten der Flaeche bei jedem Schlag (`pumpe`). Die wirken alle weiter.
 *
 * Was der hohe Pegel dagegen bewirkt hat, steht in der Rueckmeldung nach dem
 * Spielen: „zu laut". Auf einem Telefon geht die Musik damit ueber die
 * Geraeusche, und die Geraeusche sind hier die Rueckmeldung des Spiels — man
 * hoert dann nicht mehr, ob ein Spatenstich gesessen hat.
 */
const MUSIK_PEGEL = 0.5;
const SFX_PEGEL = 0.9;

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private busGain: Record<Bus, GainNode | null> = { sfx: null, music: null, pad: null };
  private noiseBuffer: AudioBuffer | null = null;
  private stille: HTMLAudioElement | null = null;
  private hall: ConvolverNode | null = null;
  private duckBis = 0;
  private musikLp: BiquadFilterNode | null = null;
  /** Kann der Browser Panorama? Sonst bleibt alles in der Mitte — kein Fehler. */
  private kannPanorama = false;
  // --- Luft: der zweite, lange Nachhall. Siehe `setRaum`. -------------------
  private luft: ConvolverNode | null = null;
  private luftVor: DelayNode | null = null;
  private luftLp: BiquadFilterNode | null = null;
  private luftPegel: GainNode | null = null;
  private luftSende: Record<'sfx' | 'music', GainNode | null> = { sfx: null, music: null };
  private luftBasis = 1;
  // --- Echo: die punktierte Achtel. Siehe `setEcho`. ------------------------
  private echoEin: GainNode | null = null;
  private echoZeit: DelayNode | null = null;
  private echoLp: BiquadFilterNode | null = null;
  private echoAus: BiquadFilterNode | null = null;

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
   * Die **Luft** — der zweite, lange Nachhall.
   *
   * Der Federhall oben ist die Naehe: Er klebt Musik und Geraeusche zusammen und
   * ist nach einem Drittel einer Sekunde vorbei. Was er nicht kann, ist Weite.
   * Das Bild des Spiels ist eine Tagszene mit drei gestaffelten Huegelketten;
   * in einem Raum von 0,34 s spielt so etwas nicht.
   *
   * Drei Unterschiede zum Federhall, und jeder hat einen Grund:
   *
   * 1. **Flachere Kurve** (Exponent 1,6 statt 3,2). Eine Fahne, die langsam
   *    ausgeht, statt eines Aufschlags, der schnell weg ist.
   * 2. **Anlauf statt Sofortstart.** Die ersten Millisekunden sind leise und
   *    schwellen an. Ein grosser Raum antwortet nicht sofort — er antwortet aus
   *    der Entfernung, und genau das trennt Weite von Watte vor den Ohren.
   * 3. **Getrennte Kanaele.** Links und rechts wuerfeln unabhaengig. Daraus
   *    entsteht die Breite; zwei gleiche Kanaele waeren nur ein lauteres Mono.
   */
  private luftKurve(sek: number): AudioBuffer {
    const ctx = this.ctx!;
    const n = Math.max(1, Math.floor(ctx.sampleRate * sek));
    const buf = ctx.createBuffer(2, n, ctx.sampleRate);
    // Anschwellen ueber die ersten 6 % — bei 1,6 s sind das knapp 100 ms.
    const rampe = Math.max(1, Math.floor(n * 0.06));
    for (let k = 0; k < 2; k++) {
      const d = buf.getChannelData(k);
      for (let i = 0; i < n; i++) {
        const auf = i < rampe ? i / rampe : 1;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.6) * auf;
      }
    }
    return buf;
  }

  /**
   * Den Raum einstellen — einmal je Welt.
   *
   * Das ist die Groesse, die aus „dasselbe Stueck in einer anderen Farbe" einen
   * anderen **Ort** macht. Eine Wiese unter freiem Himmel hat eine kurze, helle,
   * leise Fahne (nach oben ist nichts, was zurueckwirft); eine Hoehle hat eine
   * lange, dunkle, lautere. Man erkennt den Unterschied, bevor der erste Ton der
   * Melodie da ist — und ohne ihn klingen zwei Welten unweigerlich gleich.
   *
   * @param dauer Laenge der Fahne in Sekunden.
   * @param pegel Rueckweg zum Ausgang. Der Raum soll traegen, nicht auffallen.
   * @param daempfungHz Tiefpass hinter dem Hall. Tiefer heisst dunkler, also
   *   groesser und weiter weg — Hoehen werden in der Luft zuerst geschluckt.
   */
  setRaum(dauer: number, pegel: number, daempfungHz: number): void {
    if (!this.ctx || !this.luft || !this.luftLp || !this.luftPegel) return;
    const jetzt = this.ctx.currentTime;
    this.luft.buffer = this.luftKurve(Math.max(0.2, Math.min(4, dauer)));
    this.luftLp.frequency.setTargetAtTime(daempfungHz, jetzt, 0.08);
    this.luftBasis = pegel;
    this.luftPegel.gain.setTargetAtTime(pegel, jetzt, 0.08);
  }

  /**
   * In der Pause rueckt der Raum nach vorn.
   *
   * Der Tiefpass allein (`musikFilter`) klingt nach einem Geraet, dem etwas
   * fehlt. Zusammen mit mehr Nachhall klingt dasselbe nach einem **Schritt
   * zurueck**: weniger direkt, mehr Raum — genau die Wahrnehmung, die eine
   * Pause ist. Zwei Regler, eine Geste.
   */
  raumWeite(faktor: number): void {
    if (!this.ctx || !this.luftPegel) return;
    this.luftPegel.gain.setTargetAtTime(this.luftBasis * faktor, this.ctx.currentTime, 0.1);
  }

  /**
   * Die Echozeit setzen — einmal je Stueck, aus dessen Tempo.
   *
   * Ein Echo, das *nicht* auf dem Tempo sitzt, ist ein Effektgeraet. Eines, das
   * darauf sitzt, ist Teil des Arrangements: Die Wiederholung faellt mit der
   * naechsten Note zusammen und verdichtet sie, statt daneben zu stehen. Die
   * punktierte Achtel ist dafuer die uebliche Wahl, weil sie gegen das
   * Achtelraster laeuft (drei Sechzehntel gegen zwei) und dadurch Bewegung
   * erzeugt statt nur Verdopplung.
   *
   * Die Rueckfuehrung laeuft durch einen Tiefpass. Ohne ihn wird jede
   * Wiederholung so hell wie die erste, und nach der dritten steht ein Kamm aus
   * Hoehen im Weg. Mit ihm sinkt jede Wiederholung tiefer weg — so verhaelt sich
   * ein Echo in Luft.
   */
  setEcho(sekunden: number): void {
    if (!this.ctx || !this.echoZeit) return;
    // Die Delayzeit weich fahren: Ein Sprung darin klingt wie ein Bandriss.
    this.echoZeit.delayTime.setTargetAtTime(
      Math.max(0.05, Math.min(1.9, sekunden)),
      this.ctx.currentTime,
      0.12,
    );
  }

  /**
   * Das **Pumpen** — Flaeche und Harmonie machen dem Schlag Platz.
   *
   * Das ist der Klang, den „basslastig" auf einem Handy wirklich bedeutet. Mehr
   * Pegel unten geht nicht: Der Lautsprecher gibt ihn nicht her, und die
   * Aussteuerungsreserve ist endlich. Was dagegen immer geht, ist **Platz**:
   * Wenn alles Liegende im Moment des Schlags kurz zurueckweicht, hoert das Ohr
   * den Schlag als groesser — nicht weil er lauter ist, sondern weil in seinem
   * Moment nichts anderes da ist.
   *
   * Nur der Pad-Zweig wird gefahren, nicht die ganze Musik. Wuerde die Melodie
   * mitpumpen, waere es kein Platzmachen mehr, sondern ein Lautstaerkeeffekt,
   * den man als solchen hoert.
   *
   * Der Einbruch ist kurz und der Ruecklauf traege — schnell rein, langsam
   * raus. Andersherum klingt es nach Zittern.
   *
   * @param delay Wann, in Sekunden ab jetzt. Der Aufrufer plant im Voraus.
   * @param tiefe Wie weit herunter, als Anteil. 0,3 sind gut drei Dezibel.
   */
  pumpe(delay: number, tiefe = 0.3): void {
    const g = this.busGain.pad;
    if (!g || !this.ctx) return;
    const t = this.ctx.currentTime + Math.max(0, delay);
    g.gain.setValueAtTime(1, t);
    g.gain.linearRampToValueAtTime(Math.max(0.1, 1 - tiefe), t + 0.008);
    g.gain.setTargetAtTime(1, t + 0.01, 0.045);
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
    // Das Echo faehrt mit zu. Es liegt hinter der Musikschiene und wuerde sonst
    // in der Pause als einziges hell stehenbleiben — die Wiederholungen der
    // letzten Melodienote waeren dann ploetzlich der Vordergrund.
    if (this.echoAus) this.echoAus.frequency.setTargetAtTime(hz, this.ctx.currentTime, 0.06);
  }

  /**
   * Begrenzt die Stimmen pro Bild — 60 grabende Figuren duerfen nicht matschen.
   *
   * Gezaehlt werden **Teiltoene**, nicht Klaenge: Ein Aufruf von `tone()` oder
   * `noise()` ist eine Stimme, ein Instrument aus vier Teiltoenen sind vier.
   * Das ist grob, aber es ist die Groesse, die zaehlt — Rechenlast und
   * Klangbrei haengen an der Zahl der Oszillatoren und nicht daran, wie man sie
   * gruppiert.
   *
   * Acht statt sechs, seit der Pling auch in den Spielgeraeuschen steht: Ein
   * zusammengesetzter Klang kostet dort mehrere Plaetze, und bei sechs fielen
   * beim Brueckenbau der zweite und dritte Klack aus — ausgerechnet dort, wo die
   * Tonhoehe eine Aussage traegt. Die Bremse gegen Uebersteuerung ist das hier
   * ohnehin nicht mehr: Das leistet die Saettigungskennlinie am Ausgang, und
   * zwar zugesichert statt wahrscheinlich.
   */
  private voicesThisFrame = 0;
  private readonly maxVoicesPerFrame = 8;

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

      // Senke bei 4,2 kHz — die einzige rein geraetebezogene Entzerrung hier.
      //
      // Ein Handylautsprecher hat in diesem Band seine Eigenresonanz; alles,
      // was dort liegt, kommt lauter heraus, als es gemischt wurde. Dazu
      // kommt, dass genau dort jede Synthese ihre Kanten hat — die Obertoene
      // der Rechteck- und Saegezahnwellen, die Anschlagsgeraeusche, die
      // Glasteiltoene. Ohne die Senke klingt das zusammen nach Plastik, und
      // zwar ausgerechnet auf dem Zielgeraet und nicht am Schreibtisch.
      //
      // Breit (Q 0,9) und nur zweieinhalb Dezibel: Das ist eine Neigung, kein
      // Loch. Schmaler waere ein hoerbarer Eingriff, tiefer nimmt der Musik den
      // Glanz. Nebenwirkung, die hier erwuenscht ist: Der Anteil des
      // Melodiefensters (800 Hz bis 3 kHz) an der Gesamtenergie steigt, weil
      // darueber weniger steht.
      const senke = this.ctx.createBiquadFilter();
      senke.type = 'peaking';
      senke.frequency.value = 4200;
      senke.Q.value = 0.9;
      senke.gain.value = -2.5;

      this.master.connect(hoch);
      hoch.connect(bassSchiene);
      bassSchiene.connect(senke);
      senke.connect(komp);
      komp.connect(saettigung);
      saettigung.connect(this.ctx.destination);

      // Kann dieser Browser Panorama? Safari konnte es lange nicht, und ein
      // fehlender Knoten darf nicht die ganze Tonschicht kosten. Ohne Panorama
      // bleibt alles in der Mitte — das ist genau der Zustand von vorher.
      this.kannPanorama = typeof this.ctx.createStereoPanner === 'function';

      // Federhall. Er ist der Leim zwischen Musik und Geraeuschen: Beide gehen
      // durch denselben Raum, und dadurch klingen sie wie am selben Ort
      // aufgenommen statt wie zwei getrennte Zuspieler.
      this.hall = this.ctx.createConvolver();
      this.hall.buffer = this.federhall(0.34);
      const hallPegel = this.ctx.createGain();
      hallPegel.gain.value = 0.5;
      this.hall.connect(hallPegel);
      hallPegel.connect(this.master);

      // Die Luft — der zweite Hallweg, siehe `luftKurve` und `setRaum`.
      //
      // Die Vorlaufzeit von 28 ms ist der wichtigste Wert daran und der am
      // leichtesten zu uebersehende: Sie ist die Zeit, die der Schall bis zur
      // ersten Wand und zurueck braucht, und **sie allein** entscheidet, ob ein
      // Klang vor dem Raum steht oder darin ertrinkt. Ohne Vorlauf faengt die
      // Fahne im selben Moment an wie der Ton, und der Ton verliert seine Kante.
      this.luftVor = this.ctx.createDelay(0.2);
      this.luftVor.delayTime.value = 0.028;
      this.luft = this.ctx.createConvolver();
      this.luft.buffer = this.luftKurve(1.6);
      this.luftLp = this.ctx.createBiquadFilter();
      this.luftLp.type = 'lowpass';
      this.luftLp.frequency.value = 2600;
      this.luftPegel = this.ctx.createGain();
      this.luftPegel.gain.value = this.luftBasis;
      this.luftVor.connect(this.luft);
      this.luft.connect(this.luftLp);
      this.luftLp.connect(this.luftPegel);
      this.luftPegel.connect(this.master);

      // Das Echo. Rueckfuehrung 0,3 — mehr laesst die Wiederholungen stehen
      // bleiben und verstopft das Melodiefenster, weniger hoert man nur einmal.
      this.echoEin = this.ctx.createGain();
      this.echoZeit = this.ctx.createDelay(2);
      this.echoZeit.delayTime.value = 0.375;
      this.echoLp = this.ctx.createBiquadFilter();
      this.echoLp.type = 'lowpass';
      this.echoLp.frequency.value = 2000;
      const echoRueck = this.ctx.createGain();
      echoRueck.gain.value = 0.3;
      // Der Ausgangsfilter faehrt beim Pausieren mit der Musik zu. Ohne ihn
      // stuende in der Pause ein helles Echo vor einer dumpfen Musik.
      this.echoAus = this.ctx.createBiquadFilter();
      this.echoAus.type = 'lowpass';
      this.echoAus.frequency.value = 18000;
      const echoPegel = this.ctx.createGain();
      echoPegel.gain.value = 0.5;
      this.echoEin.connect(this.echoZeit);
      this.echoZeit.connect(this.echoLp);
      this.echoLp.connect(echoRueck);
      echoRueck.connect(this.echoZeit);
      this.echoZeit.connect(this.echoAus);
      this.echoAus.connect(echoPegel);
      echoPegel.connect(this.master);
      // Das Echo geht seinerseits in die Luft. Dadurch wandern die
      // Wiederholungen nach hinten weg, statt auf derselben Ebene zu bleiben —
      // das ist der Unterschied zwischen einem Echo und einem Doppler.
      const echoInLuft = this.ctx.createGain();
      echoInLuft.gain.value = 0.35;
      echoPegel.connect(echoInLuft);
      echoInLuft.connect(this.luftVor);

      for (const bus of ['sfx', 'music'] as const) {
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

        // Die Musik steht weiter im Raum als die Geraeusche. Das ist kein
        // Zufallswert: Ein Geraeusch ist eine Handlung und muss unmittelbar
        // wirken, ein Musikstueck ist eine Umgebung und darf entfernt sein.
        const luftSend = this.ctx.createGain();
        luftSend.gain.value = bus === 'music' ? 0.3 : 0.16;
        g.connect(luftSend);
        luftSend.connect(this.luftVor);
        this.luftSende[bus] = luftSend;
      }

      // Der Pad-Zweig haengt **hinter** der Musik und nicht daneben. Dadurch
      // gilt fuer ihn alles, was fuer die Musik gilt — Ducken, Pausenfilter,
      // beide Hallwege —, und `pumpe()` bekommt trotzdem einen eigenen Pegel,
      // den es fahren kann, ohne die Melodie mitzunehmen.
      const pad = this.ctx.createGain();
      pad.gain.value = 1;
      pad.connect(this.busGain.music!);
      this.busGain.pad = pad;

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
   * Den Ausgang einer Stimme anschliessen — Panorama und Echoanteil in einem.
   *
   * ## Warum Panorama hier reine Pegelverteilung ist, und bleiben muss
   *
   * Ein `StereoPannerNode` verteilt denselben Klang mit unterschiedlicher
   * Staerke auf zwei Kanaele. Er verzoegert nichts und dreht keine Phase.
   * Daraus folgt die Eigenschaft, an der auf einem Telefon alles haengt: Legt
   * man links und rechts wieder zusammen, kommt **exakt derselbe Klang** heraus
   * wie ohne Panorama, nur ein wenig leiser. Nichts loescht sich aus.
   *
   * Genau das ist bei den ueblichen Verbreiterungsverfahren nicht so — kurze
   * Verzoegerungen oder gedrehte Phasen klingen auf Kopfhoerern gross und auf
   * einem Monolautsprecher duenn oder halb weg. Deshalb steht hier nur dieser
   * eine Knoten und kein Kunstgriff daneben.
   *
   * Wer breit stehen darf, ist trotzdem streng geregelt (siehe `music.ts`):
   * Bass, Erdschlag und Melodie bleiben in der Mitte, weil sie das Fundament
   * und die Aussage tragen. Gespreizt wird nur, was schmueckt.
   */
  private anschliessen(g: GainNode, dest: GainNode, pan: number, echo: number): void {
    const ctx = this.ctx!;
    let letzter: AudioNode = g;
    if (pan !== 0 && this.kannPanorama) {
      const p = ctx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      g.connect(p);
      letzter = p;
    }
    letzter.connect(dest);
    // Der Echoanteil wird **vor** dem Panorama abgegriffen: Ein Echo, das die
    // Seite seines Originals erbt, klebt daran fest. Aus der Mitte heraus legt
    // es sich dagegen hinter das Ganze, und das ist der Ort, an den es gehoert.
    if (echo > 0 && this.echoEin) {
      const s = ctx.createGain();
      s.gain.value = echo;
      g.connect(s);
      s.connect(this.echoEin);
    }
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
    /** Panorama, −1 ganz links bis +1 ganz rechts. Siehe `anschliessen`. */
    pan?: number;
    /** Anteil, der zusaetzlich ins tempogekoppelte Echo geht. 0 heisst keins. */
    echo?: number;
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
    this.anschliessen(g, dest, opts.pan ?? 0, opts.echo ?? 0);
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
    /** Panorama, −1 bis +1. Siehe `anschliessen`. */
    pan?: number;
    /** Anteil ins tempogekoppelte Echo. */
    echo?: number;
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
    this.anschliessen(g, dest, opts.pan ?? 0, opts.echo ?? 0);
    src.start(t);
    src.stop(t + opts.dur + 0.02);
  }
}
