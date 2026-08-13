/**
 * Hoerprobe der Umgebungsbetten: rendert das Ambiente jeder Welt offline.
 *
 * Gleicher Trick wie `.hoerprobe.mjs` (dort begruendet): Die echte
 * `AudioEngine` + `Ambiente` laufen gegen einen OfflineAudioContext,
 * der 0,6-s-Scheduler wird ueber suspend()-Checkpoints nachgefuettert.
 *
 * Eine Besonderheit hat das Bett: Es steht absichtlich 17 bis 22 dB unter
 * der Melodie — pur waere die Aufnahme fast unhoerbar. Fuer die Hoerprobe
 * wird deshalb **je Datei** normalisiert (Ziel-RMS -20 dBFS, Spitze
 * hoechstens 0,85), und zwar **vor** der 16-Bit-Quantisierung — ein nach
 * der Quantisierung angehobenes Fluesterbett hoebe sein eigenes
 * Quantisierungsrauschen mit an. Der erste Wurf normalisierte alle Welten
 * gemeinsam auf die lauteste; die Wiese (rohes RMS -60 dBFS, das
 * leiseste Bett) blieb dabei unhoerbar. Die je-Datei-Anhebung wird
 * ausgegeben, damit die echten Verhaeltnisse benennbar bleiben.
 *
 * Der Ausgangs-Schimmer bleibt weg: Er gehoert zum Torbogen, nicht zur Welt.
 *
 * Aufruf: node .ambienteprobe.mjs [sekunden]   (Vorgabe 45 + 4 s Ausklang)
 * Schreibt art-src/proben/ambiente-<welt>.wav/.mp3 fuer alle fuenf Welten.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { readFileSync, writeFileSync } from 'node:fs';

const dauerMusik = Number(process.argv[2] ?? '45');
// 12 statt 4: Der Kristall-Liegeton dauert 7,5 s und darf bis kurz vor dem
// Planungsende starten — dazu bis zu 2,9 s Raumhall. Ein kuerzerer Ausklang
// schneidet ihn hoerbar ab (die Nachpruefung mass -16 dBFS am Dateiende).
const TAIL = 12;
const WELTEN = [
  { theme: 'grass', name: 'wiese' },
  { theme: 'crystal', name: 'kristall' },
  { theme: 'rust', name: 'rost' },
  { theme: 'frost', name: 'frost' },
  { theme: 'magma', name: 'schlot' },
];

const PORT = 4373;
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

const roh = [];
for (const w of WELTEN) {
  const ergebnis = await page.evaluate(async ({ theme, dauerMusik, tail }) => {
    const { AudioEngine } = await import('/src/audio/engine.ts');
    const { Ambiente } = await import('/src/audio/ambiente.ts');
    const sr = 44100;
    const dauer = dauerMusik + tail;

    const off = new OfflineAudioContext(2, Math.ceil(sr * dauer), sr);
    Object.defineProperty(off, 'state', { get: () => 'running' });
    const Orig = window.AudioContext;
    window.AudioContext = function () { return off; };
    const engine = new AudioEngine();
    engine.unlock();
    window.AudioContext = Orig;
    if (!engine.ready) throw new Error('Engine kam nicht auf dem Offline-Kontext an');

    const amb = new Ambiente();
    amb.setTheme(theme);
    amb.start(engine);
    amb.update(engine);

    // Checkpoints enger als der 0,6-s-Horizont des Ambiente-Schedulers.
    const schritt = 0.25;
    for (let k = 1; k * schritt < dauer - 0.1; k++) {
      const t = k * schritt;
      void off.suspend(t).then(() => {
        if (t < dauerMusik) amb.update(engine);
        void off.resume();
      });
    }
    const buf = await off.startRendering();

    const L = buf.getChannelData(0);
    const R = buf.getChannelData(1);
    const n = buf.length;
    let peak = 0;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      if (Math.abs(L[i]) > peak) peak = Math.abs(L[i]);
      if (Math.abs(R[i]) > peak) peak = Math.abs(R[i]);
      sum += L[i] * L[i] + R[i] * R[i];
    }
    const rms = Math.sqrt(sum / (n * 2));
    // Je Datei auf Ziel-RMS anheben, Spitze gedeckelt — auf den Floats,
    // vor der Quantisierung.
    const faktor = Math.min(0.85 / Math.max(peak, 1e-9), 0.1 / Math.max(rms, 1e-9));
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
    return { b64: btoa(bin), sr, n, peak, rms, faktor, events: amb.state.events };
  }, { theme: w.theme, dauerMusik, tail: TAIL });
  roh.push({ ...w, ...ergebnis });
  console.log(
    `${w.name}: roh Spitze ${ergebnis.peak.toFixed(4)}, RMS ${ergebnis.rms.toFixed(4)}, ` +
      `angehoben um ${(20 * Math.log10(ergebnis.faktor)).toFixed(1)} dB, ` +
      `${ergebnis.events} geplante Einsaetze`,
  );
}
await browser.close();

const lameSrc = readFileSync('node_modules/lamejs/lame.all.js', 'utf8');
const lame = new Function(`${lameSrc}\nreturn lamejs;`)();

for (const r of roh) {
  const pcmBuf = Buffer.from(r.b64, 'base64');
  const ausgerichtet = new Uint8Array(pcmBuf.length);
  ausgerichtet.set(pcmBuf);
  const pcm = new Int16Array(ausgerichtet.buffer);

  const basis = `art-src/proben/ambiente-${r.name}`;
  const daten = Buffer.from(pcm.buffer);
  const wav = Buffer.alloc(44 + daten.length);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(36 + daten.length, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(2, 22);
  wav.writeUInt32LE(r.sr, 24);
  wav.writeUInt32LE(r.sr * 4, 28);
  wav.writeUInt16LE(4, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(daten.length, 40);
  daten.copy(wav, 44);
  writeFileSync(`${basis}.wav`, wav);

  const links = new Int16Array(r.n);
  const rechts = new Int16Array(r.n);
  for (let i = 0; i < r.n; i++) {
    links[i] = pcm[i * 2];
    rechts[i] = pcm[i * 2 + 1];
  }
  const enc = new lame.Mp3Encoder(2, r.sr, 160);
  const teile = [];
  const BLOCK = 1152;
  for (let i = 0; i < r.n; i += BLOCK) {
    const chunk = enc.encodeBuffer(links.subarray(i, i + BLOCK), rechts.subarray(i, i + BLOCK));
    if (chunk.length > 0) teile.push(Buffer.from(chunk));
  }
  const rest = enc.flush();
  if (rest.length > 0) teile.push(Buffer.from(rest));
  writeFileSync(`${basis}.mp3`, Buffer.concat(teile));
  console.log(`${basis}.wav/.mp3 geschrieben`);
}
process.exit(0);
