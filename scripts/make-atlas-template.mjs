/**
 * Schreibt die Sprite-Vorlage nach src/art.
 *
 * Gezeichnet wird sie vom Spiel selbst mit dem prozeduralen Zeichner — so
 * stimmen Zellraster, Fusspunkt und Bildzahl garantiert mit dem überein, was
 * der Renderer später erwartet, statt aus einer Tabelle abgeschrieben zu sein.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 4323;
const OUT_DIR = 'src/art';
mkdirSync(OUT_DIR, { recursive: true });

const server = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--host', '127.0.0.1'],
  { stdio: 'ignore' },
);
server.unref();
const stop = () => {
  try {
    server.kill('SIGKILL');
  } catch {
    /* schon weg */
  }
};
process.on('exit', stop);

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${PORT}/`)).ok) return;
    } catch {
      /* noch nicht da */
    }
    await sleep(250);
  }
  throw new Error('Vorschauserver kam nicht hoch');
}

await waitForServer();
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
await sleep(500);

const out = await page.evaluate(() => window.__wuselwerk.debugTemplatePng());
await browser.close();
stop();

const base64 = out.png.replace(/^data:image\/png;base64,/, '');
const png = Buffer.from(base64, 'base64');
writeFileSync(`${OUT_DIR}/wusel.png`, png);
writeFileSync(`${OUT_DIR}/wusel.atlas.json`, `${JSON.stringify(out.manifest, null, 2)}\n`);

const clips = Object.entries(out.manifest.clips);
const frames = clips.reduce((n, [, c]) => n + c.holds.length, 0);
console.log(`${OUT_DIR}/wusel.png          ${Math.round(png.length / 1024)} kB`);
console.log(`${OUT_DIR}/wusel.atlas.json   ${clips.length} Clips, ${frames} Bilder`);
const { cell, anchor } = out.manifest;
console.log(
  `Zelle ${cell.w}x${cell.h}, Fusspunkt (${anchor.x}, ${anchor.y}) — zum Übermalen bereit.`,
);
process.exit(0);
