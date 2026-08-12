/**
 * Bildschirmabzug aus dem **echten Spiel** — nicht aus der Zeichenprobe.
 *
 * Die Zeichenprobe zeigt die Figur vor leerem Grund. Wie sie im Gelaende
 * aussieht, entscheidet sich woanders: neben Erde, im Gedraenge, bei der
 * Groesse, in der der Daumen sie trifft. Diese Probe holt genau das.
 *
 *   node .spielprobe.mjs <ziel.png> [level] [sekunden] [beruf]
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const [ziel = 'art-src/proben/spiel.png', level = 'w1-01', warten = '4', beruf = ''] =
  process.argv.slice(2);
const PORT = 4344;
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
const page = await browser.newPage({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true,
});
page.on('pageerror', (e) => console.log('FEHLER', e.message));
await page.goto(`http://127.0.0.1:${PORT}/wuselwerk-single.html`, { waitUntil: 'load' });
await sleep(700);

const rect = await page.evaluate(() => {
  const r = document.getElementById('spielfeld').getBoundingClientRect();
  return { x: r.left, y: r.top };
});
const knopf = async (id) => {
  const b = await page.evaluate(
    (want) => (window.__wuselwerk?.debugButtons() ?? []).find((x) => x.id === want) ?? null, id);
  if (!b) return false;
  await page.mouse.click(rect.x + b.x + b.w / 2, rect.y + b.y + b.h / 2);
  return true;
};
// Erst der ehrliche Weg ueber die Karte; ist das Level dort gesperrt, der
// Haken daran vorbei — die Probe prueft das Aussehen, nicht die Freischaltung.
const kp = await page.evaluate((l) => window.__wuselwerk?.debugKartePunkt(l) ?? null, level);
if (kp?.offen) {
  await page.mouse.click(rect.x + kp.x, rect.y + kp.y);
  await sleep(300);
  await knopf('start');
} else {
  await page.evaluate((l) => window.__wuselwerk?.debugLoadLevel(l), level);
  await sleep(300);
  // Auch der Direktlader landet erst im Vorspann.
  await knopf('start');
}
await sleep(Number(warten) * 1000);
// Beruf vergeben ueber den Haken des Spiels. Ueber die Bedienung sind manche
// Posen kaum herzustellen, und geprueft werden soll das Aussehen, nicht das Zielen.
if (beruf) {
  const wo = await page.evaluate(
    ([sk, n]) => window.__wuselwerk?.debugAssign(sk, n) ?? null,
    [beruf, 0],
  );
  if (!wo) console.log('Beruf nicht vergeben:', beruf);
  await sleep(1400);
}
if (process.argv[6] === 'zurueck') {
  const b = await page.evaluate(() => {
    const g = window.__wuselwerk;
    const L = g?.debugButtons ? null : null;
    return null;
  });
  // Der Ruecklaufknopf liegt im Layout — direkt anklicken.
  const rb = await page.evaluate(() => {
    const g = window.__wuselwerk;
    return g && g['layout'] ? null : null;
  });
  void b; void rb;
}
await page.screenshot({ path: ziel });
await browser.close();
server.kill('SIGKILL');
console.log(ziel);
