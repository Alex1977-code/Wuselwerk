/**
 * Eine Musterkarte aller Posen — aus dem LAUFENDEN Spiel, nicht aus dem Blatt.
 *
 * Warum nicht aus dem Blatt: Seit die Straehnen gezeichnet werden, steht die
 * halbe Frisur nicht mehr darin. Ein Blattbild zeigt seither eine Figur, die es
 * im Spiel nicht gibt. Diese Karte ruft deshalb denselben Zeichner auf, den das
 * Spielfeld ruft (`atlas.drawClip`), und zwar bei echter Spielgroesse.
 *
 * Zwei Baender, weil die Figur zwei Gegner hat: Himmel (Haar steht mit WCAG
 * 3,07 davor) und Erde (Kontrast 1,00 — dort traegt allein der Saum).
 *
 * Aufruf (aus dem Wurzelverzeichnis, nach `npm run build:single`):
 *   node art-src/figur-umbau/galerie.mjs <ziel.png> [level] [lupe]
 */
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';

const ZIEL = process.argv[2] ?? 'galerie.png';
const LEVEL = process.argv[3] ?? 'w1-03';
const LUPE = Number(process.argv[4] ?? 3);

const html = readFileSync('/home/user/Wuselwerk/dist/spielen.html', 'utf8');
const srv = createServer((_q, r) => {
  r.writeHead(200, { 'Content-Type': 'text/html' });
  r.end(html);
}).listen(8144);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 900, height: 500 }, deviceScaleFactor: 2 });
page.on('console', (m) => {
  if (m.text().startsWith('GAL')) console.log('  [Browser]', m.text());
});
await page.goto('http://localhost:8144/');
await page.waitForFunction(() => !!window.__wuselwerk, null, { timeout: 20000 });
await page.mouse.click(450, 250);
await page.waitForTimeout(300);
await page.evaluate((lv) => window.__wuselwerk.debugLoadLevel(lv), LEVEL);
await page.waitForTimeout(600);

const bild = await page.evaluate((lupe) => {
  const g = window.__wuselwerk;
  const at = g.atlas;
  if (!at) throw new Error('Kein Blatt geladen');
  const posen = Object.keys(at.manifest.clips);
  // Zellkante in Geraetepunkten, wie das Telefon sie zeichnet: Die Figur misst
  // zwoelf logische Pixel und steht dort auf rund vierzig Punkten.
  const s = 3.4 * lupe;
  const spalte = Math.round(11 * s);
  const zeile = Math.round(20 * s);
  const cv = document.createElement('canvas');
  cv.width = spalte * 8 + 20;
  cv.height = zeile * posen.length * 2 + 20;
  const ctx = cv.getContext('2d');
  let y = 10;
  for (const pose of posen) {
    const n = at.manifest.clips[pose].holds.length;
    for (const grund of ['#7fb2d9', '#4a3f35']) {
      ctx.fillStyle = grund;
      ctx.fillRect(0, y, cv.width, zeile);
      for (let i = 0; i < Math.min(8, n); i++) {
        at.drawClip(ctx, pose, i, 10 + spalte * i + spalte / 2, y + zeile - Math.round(3 * s), s, false);
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.round(4 * s)}px sans-serif`;
      ctx.fillText(pose, 12, y + Math.round(5 * s));
      y += zeile;
    }
  }
  // Und die Gegenprobe: dasselbe Blatt ohne Straehnen.
  //
  // Kein zweites Backen noetig — der Zeichner zeichnet nur, was im Manifest
  // steht. Wer das Feld `haar` herausnimmt, bekommt dieselbe Figur ohne
  // Straehnen und damit die Zahl, um die es geht: wieviel Tinte NEBEN dem
  // Umriss des Blattes liegt. Innen liegende zaehlt nicht, sie ist unsichtbar.
  const zaehl = (mitHaar) => {
    const c2 = document.createElement('canvas');
    c2.width = spalte * 8;
    c2.height = zeile * posen.length;
    const x2 = c2.getContext('2d');
    let yy = 0;
    for (const pose of posen) {
      const clip = at.manifest.clips[pose];
      const merk = clip.haar;
      if (!mitHaar) delete clip.haar;
      const n = Math.min(8, clip.holds.length);
      for (let i = 0; i < n; i++) {
        at.drawClip(x2, pose, i, spalte * i + spalte / 2, yy + zeile - Math.round(3 * s), s, false);
      }
      if (merk) clip.haar = merk;
      yy += zeile;
    }
    const d = x2.getImageData(0, 0, c2.width, c2.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 100) n++;
    return n;
  };
  const mit = zaehl(true);
  const ohne = zaehl(false);
  console.log(
    `GAL ${posen.length} Posen, Zelle ${s.toFixed(1)} Punkte — ` +
      `Flaeche ohne Straehnen ${ohne}, mit ${mit}, ` +
      `frei danebengelegt ${(((mit - ohne) / ohne) * 100).toFixed(1)} Prozent`,
  );
  return cv.toDataURL('image/png');
}, LUPE);

const { writeFileSync } = await import('fs');
writeFileSync(ZIEL, Buffer.from(bild.split(',')[1], 'base64'));
console.log('Musterkarte:', ZIEL);
await browser.close();
srv.close();
