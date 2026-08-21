/**
 * Aufeinanderfolgende Bilder um ein Ereignis herum — aufgezeichnet IN der Seite.
 *
 * Ein Bildschirmfoto von aussen braucht ueber hundert Millisekunden. Ein
 * Nachschlag des Haares ist nach zwoelf Bildern vorbei, also nach
 * zweihundert — von aussen erwischt man ihn nie. Diese Probe haengt sich
 * deshalb an requestAnimationFrame, wartet auf das Ereignis und schneidet die
 * naechsten vierzehn Bilder als Zellinhalt mit.
 *
 * Zwei Ereignisse: `landung` (eine Figur, die ueber zwanzig Pixel gefallen ist,
 * kommt auf) und `wende` (eine Figur dreht um, waehrend sie sich bewegt).
 *
 * Aufruf (aus dem Wurzelverzeichnis, nach `npm run build:single`):
 *   node art-src/figur-umbau/schwungprobe.mjs <ziel-praefix> [level] [landung|wende]
 *
 * Die Bilder wandern nach <ziel-praefix>-00.png bis -13.png. Zum Auswerten
 * muss die Figur ueber die Reihe verfolgt werden — die Kamera zieht mit, und
 * ein fester Ausschnitt zeigt bei Bild 13 den Nachbarn. Bewaehrt hat sich:
 * staerkste Bewegung ueber alle Bilder als Startpunkt, dann je Bild der
 * Hautfleck im Umkreis von zweiundzwanzig Punkten.
 */
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, writeFileSync } from 'fs';
const ZIEL = process.argv[2];
const LEVEL = process.argv[3] || 'w1-03';
const WAS = process.argv[4] || 'landung';     // landung | wende
const html = readFileSync('/home/user/Wuselwerk/dist/spielen.html', 'utf8');
const srv = createServer((_q, r) => { r.writeHead(200, {'Content-Type':'text/html'}); r.end(html); }).listen(8148);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2 });
p.on('console', (m) => { if (m.text().startsWith('PROBE')) console.log('  ', m.text()); });
await p.goto('http://localhost:8148/');
await p.waitForFunction(() => !!window.__wuselwerk, null, { timeout: 20000 });
await p.mouse.click(422, 195);
await p.waitForTimeout(300);
await p.evaluate((lv) => window.__wuselwerk.debugLoadLevel(lv), LEVEL);
await p.waitForTimeout(700);
const rect = await (await p.$('#spielfeld')).boundingBox();
const k = await p.evaluate(() => (window.__wuselwerk?.debugButtons() ?? []).find((x) => x.id === 'start') ?? null);
if (k) await p.mouse.click(rect.x + k.x + k.w / 2, rect.y + k.y + k.h / 2);

const bilder = await p.evaluate(({ was }) => new Promise((fertig) => {
  const cv = document.querySelector('#spielfeld');
  const g = window.__wuselwerk;
  const raus = [];
  let sammeln = 0;
  let vorher = new Map();
  function tick() {
    const ws = g?.world?.wusels ?? [];
    if (sammeln > 0) {
      raus.push(cv.toDataURL('image/png'));
      if (--sammeln === 0) { fertig(raus); return; }
    } else {
      for (const w of ws) {
        const v = vorher.get(w.id);
        const treffer = was === 'landung'
          ? v && v.fall > 20 && w.fallDist === 0
          : v && v.dir !== w.dir && v.x !== w.x;
        if (treffer) { console.log(`PROBE ${was} bei Figur ${w.id}, Sturz ${v ? v.fall : 0}`); sammeln = 14; break; }
      }
      vorher = new Map(ws.map((w) => [w.id, { fall: w.fallDist, dir: w.dir, x: w.x }]));
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  setTimeout(() => fertig(raus), 25000);
}), { was: WAS });

console.log('Bilder:', bilder.length);
bilder.forEach((d, i) => writeFileSync(`${ZIEL}-${String(i).padStart(2, '0')}.png`, Buffer.from(d.split(',')[1], 'base64')));
await b.close(); srv.close();
