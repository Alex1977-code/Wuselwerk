import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
const PORT = 4331;
const server = spawn(process.execPath,
  ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--host', '127.0.0.1'],
  { stdio: 'ignore' });
process.on('exit', () => { try { server.kill('SIGKILL'); } catch {} });
for (let i = 0; i < 80; i++) {
  try { const r = await fetch(`http://127.0.0.1:${PORT}/probe/figur.html`); if (r.ok) break; } catch {}
  await sleep(250);
}
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
page.on('console', (m) => { if (m.type() === 'error') console.log('KONSOLE', m.text()); });
page.on('pageerror', (e) => console.log('FEHLER', e.message));
const flagge = process.argv[3] ? `?${process.argv[3]}` : '';
await page.goto(`http://127.0.0.1:${PORT}/probe/figur.html${flagge}`, { waitUntil: 'networkidle' });
await page.waitForFunction('window.fertig === true', { timeout: 30000 }).catch(() => console.log('nicht fertig'));
const el = await page.$('#c');
await el.screenshot({ path: process.argv[2] ?? 'art-src/proben/ww-spiel.png', omitBackground: !!flagge });
await browser.close();
server.kill('SIGKILL');
console.log('ok');
