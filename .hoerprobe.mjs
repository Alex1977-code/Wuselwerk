/**
 * Hoerprobe: rendert ein Musikstueck des Spiels **offline** in eine Datei.
 *
 * Kein Mikrofon, kein Mitschnitt — die echte Klangmaschine (`AudioEngine` +
 * `Music`) laeuft gegen einen `OfflineAudioContext`. Der Trick dabei:
 *
 * 1. `AudioEngine.unlock()` baut seinen Graphen auf `new window.AudioContext()`
 *    — fuer die Dauer des Aufbaus wird der Konstruktor gegen eine Funktion
 *    getauscht, die den Offline-Kontext zurueckgibt.
 * 2. Der Scheduler (`Music.update`) plant nur ~0,35 s voraus und braucht eine
 *    laufende Uhr. Offline gibt es die nicht — dafuer gibt es
 *    `OfflineAudioContext.suspend(t)`: Das Rendern haelt an jedem Checkpoint,
 *    `update()` plant nach, `resume()` rendert weiter.
 * 3. `engine.ready` prueft `ctx.state === 'running'`; ein eigener Getter auf
 *    der Instanz meldet dauerhaft 'running'.
 *
 * Aufruf: node .hoerprobe.mjs <theme> [durchgaenge] [zielbasis]
 * Schreibt <zielbasis>.wav (fuer die Pruefung) und <zielbasis>.mp3 (zum
 * Verschicken, lamejs).
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { readFileSync, writeFileSync } from 'node:fs';

const [theme = 'rust', loopsArg = '4', basis = `art-src/proben/stueck-${process.argv[2] ?? 'rust'}`] =
  process.argv.slice(2);
const loops = Number(loopsArg);

const PORT = 4372;
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

const ergebnis = await page.evaluate(async ({ theme, loops }) => {
  const { AudioEngine } = await import('/src/audio/engine.ts');
  const { Music, STUECKE } = await import('/src/audio/music.ts');
  const p = STUECKE[theme];
  if (!p) throw new Error(`unbekanntes Thema ${theme}`);
  const stepDur = 60 / p.bpm / 2;
  const loopSec = stepDur * 64;
  const musikEnde = loopSec * loops;
  const tail = 2.5;
  const dauer = musikEnde + tail;
  const sr = 44100;

  const off = new OfflineAudioContext(2, Math.ceil(sr * dauer), sr);
  Object.defineProperty(off, 'state', { get: () => 'running' });
  const Orig = window.AudioContext;
  window.AudioContext = function () { return off; };
  const engine = new AudioEngine();
  engine.unlock();
  window.AudioContext = Orig;
  if (!engine.ready) throw new Error('Engine kam nicht auf dem Offline-Kontext an');

  const music = new Music();
  music.setTheme(theme);
  music.setBesetzung('voll');
  music.setLage({ restAnteil: 1, restSekunden: 999, alleGerettet: false, pausiert: false });
  music.start(engine);
  music.update(engine);

  // Checkpoints deutlich enger als der 0,35-s-Horizont des Schedulers.
  const schritt = 0.15;
  for (let k = 1; k * schritt < dauer - 0.1; k++) {
    const t = k * schritt;
    void off.suspend(t).then(() => {
      if (t < musikEnde) music.update(engine);
      void off.resume();
    });
  }
  const buf = await off.startRendering();

  const L = buf.getChannelData(0);
  const R = buf.getChannelData(1);
  const n = buf.length;
  const pcm = new Int16Array(n * 2);
  let peak = 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const l = Math.max(-1, Math.min(1, L[i]));
    const r = Math.max(-1, Math.min(1, R[i]));
    if (Math.abs(l) > peak) peak = Math.abs(l);
    if (Math.abs(r) > peak) peak = Math.abs(r);
    sum += l * l + r * r;
    pcm[i * 2] = Math.round(l * (l < 0 ? 32768 : 32767));
    pcm[i * 2 + 1] = Math.round(r * (r < 0 ? 32768 : 32767));
  }
  const bytes = new Uint8Array(pcm.buffer);
  let bin = '';
  const CH = 0x8000;
  for (let i = 0; i < bytes.length; i += CH) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + CH, bytes.length)));
  }
  return {
    b64: btoa(bin),
    sr,
    n,
    peak,
    rms: Math.sqrt(sum / (n * 2)),
    dauer,
    loopSec,
    notes: music.state.notes,
  };
}, { theme, loops });

await browser.close();

const pcmBuf = Buffer.from(ergebnis.b64, 'base64');
const { sr, n } = ergebnis;

// --- WAV (16 bit, Stereo) --------------------------------------------------
const wav = Buffer.alloc(44 + pcmBuf.length);
wav.write('RIFF', 0);
wav.writeUInt32LE(36 + pcmBuf.length, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22);
wav.writeUInt32LE(sr, 24);
wav.writeUInt32LE(sr * 4, 28);
wav.writeUInt16LE(4, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(pcmBuf.length, 40);
pcmBuf.copy(wav, 44);
writeFileSync(`${basis}.wav`, wav);

// --- MP3 (lamejs, 160 kbit/s) ----------------------------------------------
// lame.all.js haengt seine Klassen an die eigene Funktion — als CommonJS-Modul
// exportiert es nichts, deshalb der Umweg ueber `new Function`.
const lameSrc = readFileSync('node_modules/lamejs/lame.all.js', 'utf8');
const lame = new Function(`${lameSrc}\nreturn lamejs;`)();
const ausgerichtet = new Uint8Array(pcmBuf.length);
ausgerichtet.set(pcmBuf);
const pcm = new Int16Array(ausgerichtet.buffer);
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
  `${theme}: ${ergebnis.dauer.toFixed(1)}s (${loops}x${ergebnis.loopSec.toFixed(2)}s), ` +
    `${ergebnis.notes} Melodietoene, Spitze ${ergebnis.peak.toFixed(3)}, ` +
    `RMS ${ergebnis.rms.toFixed(3)} -> ${basis}.wav/.mp3`,
);
process.exit(0);
