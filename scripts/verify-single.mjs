/**
 * Prüft die Einzeldatei aus build-single.mjs im echten Browser:
 * einmal in Handygrösse, einmal am Schreibtisch.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const OUT = 'shots';
const PORT = 4321;
mkdirSync(OUT, { recursive: true });

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

const problems = [];

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${PORT}/wuselwerk-single.html`)).ok) return;
    } catch {
      /* noch nicht da */
    }
    await sleep(250);
  }
  throw new Error('Vorschauserver kam nicht hoch');
}

async function check(label, viewport, shot) {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  });
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2, hasTouch: true });
  page.on('pageerror', (e) => problems.push(`${label}: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`${label}: ${m.text()}`);
  });

  await page.goto(`http://127.0.0.1:${PORT}/wuselwerk-single.html`, { waitUntil: 'load' });
  await sleep(600);

  const box = await page.evaluate(() => {
    const c = document.getElementById('spielfeld');
    const r = c.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), pixels: c.width * c.height };
  });
  const ok = box.w > 100 && box.h > 100 && box.pixels > 0;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label} — Spielfeld ${box.w}x${box.h} CSS-Pixel`);
  if (!ok) problems.push(`${label}: Spielfeld hat keine brauchbare Grösse`);

  // Level 1 starten und ein paar Sekunden laufen lassen
  const centre = await page.evaluate(() => {
    const r = document.getElementById('spielfeld').getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  await page.mouse.click(centre.x + centre.w / 2, centre.y + 147 * (centre.h / 844));
  await sleep(250);
  await page.mouse.click(centre.x + centre.w / 2, centre.y + 507 * (centre.h / 844));
  await sleep(2500);
  await page.screenshot({ path: `${OUT}/${shot}` });

  const stats = await page.evaluate(() => window.__wuselwerk?.debugStats() ?? null);
  const running = stats && stats.screen === 'play' && stats.released > 0;
  console.log(
    `${running ? '  ok  ' : ' FAIL '} ${label} — Simulation läuft (${stats?.released ?? 0} Figuren draussen)`,
  );
  if (!running) problems.push(`${label}: Simulation lief nicht an`);

  await browser.close();
}

await waitForServer();
await check('Handy 390x844', { width: 390, height: 844 }, '10-einzeldatei-handy.png');
await check('Schreibtisch 1280x900', { width: 1280, height: 900 }, '11-einzeldatei-desktop.png');

stop();
if (problems.length) {
  console.error(`\nPROBLEME:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log('\nEinzeldatei läuft in beiden Grössen.');
process.exit(0);
