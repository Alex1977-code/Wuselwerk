/**
 * Ein Bildschirmfoto aus dem laufenden Spiel — die Gegenprobe zu jedem Umbau.
 *
 * Das Blatt luegt nicht, aber es antwortet auf die falsche Frage. Auf der
 * 112er Zelle sieht jede Aenderung gross aus; im Spiel steht die Figur auf
 * rund neun logischen Pixeln vor Kulisse, Gras und Erde. Erst hier zeigt sich,
 * ob ein Umriss noch traegt.
 *
 * Aufruf (aus dem Wurzelverzeichnis, nach `npm run build:single`):
 *   node art-src/figur-umbau/schuss.mjs <ziel.png> [level] [wartezeit-ms]
 */
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
const ZIEL = process.argv[2];
const LEVEL = process.argv[3] || 'w1-03';
const WARTE = Number(process.argv[4] || 6000);
const html = readFileSync('/home/user/Wuselwerk/dist/spielen.html', 'utf8');
const srv = createServer((_q, r) => { r.writeHead(200, {'Content-Type':'text/html'}); r.end(html); }).listen(8143);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 4 });
p.on('console', (m) => { const t = m.text(); if (t.startsWith('PROBE')) console.log('  [Browser]', t); });
await p.goto('http://localhost:8143/');
await p.waitForFunction(() => !!window.__wuselwerk, null, { timeout: 20000 });
await p.mouse.click(422, 195);
await p.waitForTimeout(300);
await p.evaluate((lv) => window.__wuselwerk.debugLoadLevel(lv), LEVEL);
await p.waitForTimeout(700);
const rect = await (await p.$('#spielfeld')).boundingBox();
const k = await p.evaluate(() => (window.__wuselwerk?.debugButtons() ?? []).find((x) => x.id === 'start') ?? null);
if (k) await p.mouse.click(rect.x + k.x + k.w / 2, rect.y + k.y + k.h / 2);
await p.waitForTimeout(WARTE);
await p.screenshot({ path: ZIEL });
console.log('Schuss:', ZIEL);
await b.close(); srv.close();
