import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
const [level = 'w2-06'] = process.argv.slice(2);
const PORT = 4350;
const server = spawn(process.execPath,
  ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--host', '127.0.0.1'],
  { stdio: 'ignore' });
process.on('exit', () => { try { server.kill('SIGKILL'); } catch { /* weg */ } });
for (let i = 0; i < 80; i++) {
  try { if ((await fetch(`http://127.0.0.1:${PORT}/wuselwerk-single.html`)).ok) break; } catch { /* noch nicht */ }
  await sleep(250);
}
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, hasTouch: true });
await page.goto(`http://127.0.0.1:${PORT}/wuselwerk-single.html`, { waitUntil: 'load' });
await sleep(900);
const rect = await page.evaluate(() => {
  const r = document.getElementById('spielfeld').getBoundingClientRect();
  return { x: r.left, y: r.top };
});
await page.mouse.click(rect.x + 200, rect.y + 200); // Titel
await sleep(400);
await page.evaluate((l) => window.__wuselwerk?.debugLoadLevel(l), level);
await sleep(300);
const b = await page.evaluate(() => (window.__wuselwerk?.debugButtons() ?? []).find((x) => x.id === 'start') ?? null);
if (b) await page.mouse.click(rect.x + b.x + b.w / 2, rect.y + b.y + b.h / 2);
await sleep(4000);
await page.evaluate(() => window.__wuselwerk?.debugZoom(0.6));
await sleep(600);
await page.screenshot({ path: `art-src/proben/quer-${level}.png` });
await browser.close();
server.kill('SIGKILL');
console.log('ok');
