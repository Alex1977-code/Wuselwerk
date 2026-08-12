import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
const PORT = 4337;
const server = spawn(process.execPath,
  ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--host', '127.0.0.1'],
  { stdio: 'ignore' });
process.on('exit', () => { try { server.kill('SIGKILL'); } catch {} });
for (let i = 0; i < 80; i++) {
  try { const r = await fetch(`http://127.0.0.1:${PORT}/probe/zipfel.html`); if (r.ok) break; } catch {}
  await sleep(250);
}
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1500, height: 1400 } });
page.on('console', (m) => console.log('KONSOLE', m.type(), m.text()));
page.on('pageerror', (e) => console.log('FEHLER', e.message));
await page.goto(`http://127.0.0.1:${PORT}/probe/zipfel.html`, { waitUntil: 'networkidle' });
await page.waitForFunction('window.fertig === true', { timeout: 40000 }).catch(() => console.log('nicht fertig'));
const z = await page.evaluate(() => window.zahlen);
console.log((z||[]).join('\n'));
await (await page.$('#c')).screenshot({ path: process.argv[2] });
await browser.close(); server.kill('SIGKILL');
