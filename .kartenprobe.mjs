// Bildschirmabzug der Weltkarte (nach dem Titel), hoch und quer.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 4347;
const server = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--host', '127.0.0.1'],
  { stdio: 'ignore' },
);
process.on('exit', () => { try { server.kill('SIGKILL'); } catch { /* schon weg */ } });
for (let i = 0; i < 80; i++) {
  try { if ((await fetch(`http://127.0.0.1:${PORT}/wuselwerk-single.html`)).ok) break; } catch { /* noch nicht */ }
  await sleep(250);
}
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
for (const [name, vw, vh] of [['karte-hoch', 390, 844], ['karte-quer', 844, 390]]) {
  const page = await browser.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: 3, hasTouch: true });
  await page.goto(`http://127.0.0.1:${PORT}/wuselwerk-single.html`, { waitUntil: 'load' });
  await sleep(900);
  await page.mouse.click(vw / 2, vh / 2); // Titel wegtippen
  await sleep(700);
  await page.screenshot({ path: `art-src/proben/${name}.png` });
  // Hochscrollen (Band herunterziehen): die Naht zur naechsten Welt.
  for (let i = 0; i < 3; i++) {
    await page.mouse.move(vw / 2, vh * 0.25);
    await page.mouse.down();
    for (let s2 = 1; s2 <= 8; s2++) {
      await page.mouse.move(vw / 2, vh * 0.25 + (vh * 0.6 * s2) / 8);
      await sleep(16);
    }
    await page.mouse.up();
    await sleep(120);
  }
  await sleep(400);
  await page.screenshot({ path: `art-src/proben/${name}-oben.png` });
  await page.close();
}
await browser.close();
server.kill('SIGKILL');
console.log('ok');
