/**
 * Hoerprobe der Spielgeraeusche: ein Katalog, offline gerendert.
 *
 * Gleicher Offline-Trick wie `.hoerprobe.mjs` (dort begruendet). Hier laeuft
 * die echte `Sfx`-Klasse — gefuettert mit denselben Weltereignissen, die auch
 * das Spiel schickt — plus die Bedienklaenge und die Fanfaren aus
 * `stinger.ts`, alle nach festem Zeitplan hintereinander. Die Tonhoehen der
 * Plings folgen der Pentatonik der laufenden Welt; der Katalog steht auf der
 * Wiese (grass).
 *
 * Aufruf: node .sfxprobe.mjs [zielbasis]
 * Schreibt <zielbasis>.wav und <zielbasis>.mp3 und gibt den Zeitplan aus.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { readFileSync, writeFileSync } from 'node:fs';

const basis = process.argv[2] ?? 'art-src/proben/sfx-katalog';

const PORT = 4374;
const server = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'],
  { stdio: 'ignore' },
);
process.on('exit', () => { try { server.kill('SIGKILL'); } catch { /* schon weg */ } });
for (let i = 0; i < 80; i++) {
  try { if ((await fetch(`http://127.0.0.1:${PORT}/`)).ok) break; } catch { /* noch nicht */ }
  await sleep(250);
}

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await browser.newPage({ viewport: { width: 500, height: 400 } });
page.on('pageerror', (e) => console.error('SEITENFEHLER', e.stack ?? e.message));
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
await sleep(500);

const ergebnis = await page.evaluate(async () => {
  const { AudioEngine } = await import('/src/audio/engine.ts');
  const { Music } = await import('/src/audio/music.ts');
  const { Sfx } = await import('/src/audio/sfx.ts');
  const stinger = await import('/src/audio/stinger.ts');
  const { DeathCause } = await import('/src/core/types.ts');

  const sr = 44100;
  const dauer = 66;

  const off = new OfflineAudioContext(2, Math.ceil(sr * dauer), sr);
  Object.defineProperty(off, 'state', { get: () => 'running' });
  const Orig = window.AudioContext;
  window.AudioContext = function () { return off; };
  const engine = new AudioEngine();
  engine.unlock();
  window.AudioContext = Orig;
  if (!engine.ready) throw new Error('Engine kam nicht auf dem Offline-Kontext an');

  // Setzt das Modul-Thema, aus dem Sfx und Stinger ihre Tonart lesen.
  new Music().setTheme('grass');
  const sfx = new Sfx(engine);

  /** Ein Weltereignis-Buendel zur aktuellen Klanguhr einspeisen. */
  const ev = (t, type, extra = {}) => sfx.handle([{ type, x: 240, y: 200, ...extra }], t * 1000);

  // Der Zeitplan. Jede Zeile: [Sekunde, Name (fuer die Ausgabe), Wirkung].
  const KATALOG = [
    [0.5, 'Falltuer knarrt auf', () => sfx.knarren()],
    [1.2, 'Falltuer schlaegt an', (t) => ev(t, 'hatch')],
    [2.0, 'Figur erscheint', (t) => ev(t, 'spawn')],
    [2.8, 'Startruf', () => sfx.startruf()],
    [7.0, 'Beruf vergeben: Graeber', (t) => ev(t, 'assign', { skill: 'digger' })],
    [8.0, 'Graben (3 Stiche)', (t) => ev(t, 'dig', { skill: 'digger' })],
    [8.45, '', (t) => ev(t, 'dig', { skill: 'digger' })],
    [8.9, '', (t) => ev(t, 'dig', { skill: 'digger' })],
    [10.2, 'Beruf vergeben: Rammer', (t) => ev(t, 'assign', { skill: 'basher' })],
    [11.0, 'Rammer (3 Schlaege)', (t) => ev(t, 'dig', { skill: 'basher' })],
    [11.35, '', (t) => ev(t, 'dig', { skill: 'basher' })],
    [11.7, '', (t) => ev(t, 'dig', { skill: 'basher' })],
    [13.0, 'Beruf vergeben: Schraegbagger', (t) => ev(t, 'assign', { skill: 'miner' })],
    [13.8, 'Schraegbagger (3 Hiebe)', (t) => ev(t, 'dig', { skill: 'miner' })],
    [14.25, '', (t) => ev(t, 'dig', { skill: 'miner' })],
    [14.7, '', (t) => ev(t, 'dig', { skill: 'miner' })],
    [16.0, 'Bruecke, sechs Stufen steigend', (t) => ev(t, 'brick', { n: 0 })],
    [16.5, '', (t) => ev(t, 'brick', { n: 1 })],
    [17.0, '', (t) => ev(t, 'brick', { n: 2 })],
    [17.5, '', (t) => ev(t, 'brick', { n: 3 })],
    [18.0, '', (t) => ev(t, 'brick', { n: 4 })],
    [18.5, '', (t) => ev(t, 'brick', { n: 5 })],
    [20.0, 'Stahl klirrt (2x)', (t) => ev(t, 'steel')],
    [20.6, '', (t) => ev(t, 'steel')],
    [21.8, 'Klettern', (t) => ev(t, 'climb')],
    [23.0, 'Schirm oeffnet', (t) => ev(t, 'float')],
    [24.4, 'Landung', (t) => ev(t, 'land', { n: 10 })],
    [25.4, 'Abprall am Blocker', (t) => ev(t, 'bounce')],
    [26.6, 'Kleines Oh-no (Vormerkung)', (t) => ev(t, 'oh-no')],
    [28.0, 'Oh-no-Chor (Sprengmeister)', () => sfx.ohNo()],
    [29.0, 'Zuenduhr 5', (t) => ev(t, 'fuse-tick', { n: 5 })],
    [30.0, 'Zuenduhr 4', (t) => ev(t, 'fuse-tick', { n: 4 })],
    [31.0, 'Zuenduhr 3', (t) => ev(t, 'fuse-tick', { n: 3 })],
    [32.0, 'Zuenduhr 2', (t) => ev(t, 'fuse-tick', { n: 2 })],
    [33.0, 'Zuenduhr 1 + Panik', (t) => ev(t, 'fuse-tick', { n: 1 })],
    [34.2, 'Explosion', (t) => ev(t, 'explode')],
    [36.2, 'Schrei im Fall', (t) => ev(t, 'scream')],
    [37.4, 'Tod durch Aufprall', (t) => ev(t, 'died', { cause: DeathCause.SPLAT })],
    [39.5, 'Drei Rettungen, steigend', (t) => ev(t, 'saved')],
    [39.9, '', (t) => ev(t, 'saved')],
    [40.3, '', (t) => ev(t, 'saved')],
    [42.0, 'Fehltipp (daneben)', () => sfx.daneben()],
    [42.8, 'Knopf', () => sfx.knopf()],
    [43.6, 'Werkzeug gewaehlt', () => sfx.werkzeugGewaehlt('floater')],
    [44.4, 'Werkzeug fehlt', () => sfx.werkzeugFehlt()],
    [45.2, 'Tempo schnell', () => sfx.tempo(true)],
    [46.0, 'Tempo normal', () => sfx.tempo(false)],
    [46.8, 'Pause zu', () => sfx.pause(true)],
    [47.8, 'Pause auf', () => sfx.pause(false)],
    [48.8, 'Zeitruecklauf', () => sfx.zurueckgespult()],
    [50.2, 'Stern 1', () => sfx.stern(0)],
    [50.8, 'Stern 2', () => sfx.stern(1)],
    [51.4, 'Stern 3', () => sfx.stern(2)],
    [53.0, 'Fanfare: geschafft', () => stinger.levelGeschafft(engine)],
    [55.5, 'Fanfare: alle gerettet', () => stinger.alleGerettet(engine)],
    [58.0, 'Fanfare: neuer Bestwert', () => stinger.neuerBestwert(engine)],
    [60.5, 'Fanfare: gescheitert', () => stinger.levelGescheitert(engine)],
  ];
  // Schritte des Pulks: eigene Kadenzbremse, deshalb dicht aufgerufen.
  for (let t = 4.0; t < 6.0; t += 0.12) {
    KATALOG.push([t, t === 4.0 ? 'Schritte des Pulks' : '', (tt) => sfx.schritte(4, tt * 1000)]);
  }
  KATALOG.sort((a, b) => a[0] - b[0]);

  // Ausfuehrung an Checkpoints: 0,05-s-Raster, faellige Eintraege feuern.
  let cursor = 0;
  const feuere = (bis) => {
    while (cursor < KATALOG.length && KATALOG[cursor][0] <= bis + 1e-9) {
      KATALOG[cursor][2](KATALOG[cursor][0]);
      cursor++;
    }
  };
  const schritt = 0.05;
  for (let k = 1; k * schritt < dauer - 0.1; k++) {
    const t = k * schritt;
    void off.suspend(t).then(() => {
      // Die Stimmenbremse der Engine erlaubt 6 begrenzte Stimmen JE BILD;
      // im Spiel setzt die Bildschleife den Zaehler zurueck. Ohne diesen
      // Aufruf schluckt die Bremse nach den ersten sechs Klaengen alles
      // Begrenzte — der halbe Katalog war digital still.
      engine.beginFrame();
      feuere(t);
      void off.resume();
    });
  }
  const buf = await off.startRendering();

  const L = buf.getChannelData(0);
  const R = buf.getChannelData(1);
  const n = buf.length;
  let peak = 0;
  for (let i = 0; i < n; i++) {
    if (Math.abs(L[i]) > peak) peak = Math.abs(L[i]);
    if (Math.abs(R[i]) > peak) peak = Math.abs(R[i]);
  }
  // Sanft auf 0,8 Spitze bringen — der Katalog ist eine Vorfuehrung, kein Mix.
  const faktor = 0.8 / Math.max(peak, 1e-9);
  const pcm = new Int16Array(n * 2);
  for (let i = 0; i < n; i++) {
    const l = Math.max(-1, Math.min(1, L[i] * faktor));
    const r = Math.max(-1, Math.min(1, R[i] * faktor));
    pcm[i * 2] = Math.round(l * (l < 0 ? 32768 : 32767));
    pcm[i * 2 + 1] = Math.round(r * (r < 0 ? 32768 : 32767));
  }
  const bytes = new Uint8Array(pcm.buffer);
  let bin = '';
  const CH = 0x8000;
  for (let i = 0; i < bytes.length; i += CH) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + CH, bytes.length)));
  }
  const plan = KATALOG.filter((k) => k[1]).map((k) => [k[0], k[1]]);
  return { b64: btoa(bin), sr, n, peak, faktor, gefeuert: cursor, gesamt: KATALOG.length, plan };
});
await browser.close();

const pcmBuf = Buffer.from(ergebnis.b64, 'base64');
const ausgerichtet = new Uint8Array(pcmBuf.length);
ausgerichtet.set(pcmBuf);
const pcm = new Int16Array(ausgerichtet.buffer);
const { sr, n } = ergebnis;

const daten = Buffer.from(pcm.buffer);
const wav = Buffer.alloc(44 + daten.length);
wav.write('RIFF', 0);
wav.writeUInt32LE(36 + daten.length, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22);
wav.writeUInt32LE(sr, 24);
wav.writeUInt32LE(sr * 4, 28);
wav.writeUInt16LE(4, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(daten.length, 40);
daten.copy(wav, 44);
writeFileSync(`${basis}.wav`, wav);

const lameSrc = readFileSync('node_modules/lamejs/lame.all.js', 'utf8');
const lame = new Function(`${lameSrc}\nreturn lamejs;`)();
const links = new Int16Array(n);
const rechts = new Int16Array(n);
for (let i = 0; i < n; i++) {
  links[i] = pcm[i * 2];
  rechts[i] = pcm[i * 2 + 1];
}
const enc = new lame.Mp3Encoder(2, sr, 160);
const teile = [];
const BLOCK = 1152;
for (let i = 0; i < n; i += BLOCK) {
  const chunk = enc.encodeBuffer(links.subarray(i, i + BLOCK), rechts.subarray(i, i + BLOCK));
  if (chunk.length > 0) teile.push(Buffer.from(chunk));
}
const rest = enc.flush();
if (rest.length > 0) teile.push(Buffer.from(rest));
writeFileSync(`${basis}.mp3`, Buffer.concat(teile));

console.log(
  `Katalog: ${ergebnis.gefeuert}/${ergebnis.gesamt} Eintraege gefeuert, rohe Spitze ` +
    `${ergebnis.peak.toFixed(3)}, angehoben x${ergebnis.faktor.toFixed(2)} -> ${basis}.wav/.mp3`,
);
for (const [t, name] of ergebnis.plan) {
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(1).padStart(4, '0');
  console.log(`  ${m}:${s}  ${name}`);
}
process.exit(0);
