/**
 * Wieviel die Figur flimmert — gemessen, nicht geschaetzt.
 *
 * ## Warum es das braucht
 *
 * Die Figur wird mit ABSICHT auf krummen Bildpunkten gezeichnet
 * (`atlas.ts`, `drawWusel`): Das Gelaende gleitet beim Scrollen weich, und
 * eine gerundete Figur wuerde daneben in ganzen Schritten springen — sie
 * zittert dann auf dem Boden. Der Preis ist, dass das Blatt bei jedem Bild
 * neu abgetastet wird.
 *
 * Fuer weiche Flaechen ist das unsichtbar. Fuer eine harte, duenne Kante ist
 * es das nicht: Der Saum steckt mit zwei Punkten im Blatt, das Blatt wird
 * beim Zeichnen auf rund drei Fuenftel verkleinert, und was davon ankommt,
 * ist gut ein Bildpunkt. Ein Bildpunkt harte Kante auf krummer Lage deckt mal
 * einen, mal zwei Zielpunkte — die Kante wird bei jedem Bild dunkler und
 * heller. Genau das sieht man als Flimmern.
 *
 * ## Was hier gemessen wird
 *
 * Dieselbe Figur, sechzehnmal gezeichnet, jedesmal um einen anderen Bruchteil
 * eines Bildpunktes versetzt. Verglichen wird jeder Punkt mit demselben Punkt
 * der anderen Lagen, nachdem der ganzzahlige Versatz herausgerechnet ist.
 * Was dann noch schwankt, ist reines Abtastrauschen — also das Flimmern.
 *
 * Zwei Zahlen kommen heraus:
 *
 *   Spanne   der groesste Helligkeitsunterschied eines Punktes ueber alle
 *            Lagen, 0 bis 255. Das ist die Amplitude des Flimmerns.
 *   Anteil   wieviel Prozent der Figurenpunkte um mehr als zwanzig Stufen
 *            schwanken. Zwanzig, weil darunter nichts mehr auffaellt.
 *
 * Aufruf (aus dem Wurzelverzeichnis, nach `npm run build:single`):
 *   node art-src/figur-umbau/flimmern.mjs [pose] [saumton]
 */
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';

const POSE = process.argv[2] ?? 'walking';
const SAUM = process.argv[3] ?? '#0C1020';

const html = readFileSync('/home/user/Wuselwerk/dist/spielen.html', 'utf8');
const srv = createServer((_q, r) => {
  r.writeHead(200, { 'Content-Type': 'text/html' });
  r.end(html);
}).listen(8147);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 900, height: 500 }, deviceScaleFactor: 2 });
page.on('console', (m) => {
  if (m.text().startsWith('FLM')) console.log(m.text());
});
await page.goto('http://localhost:8147/');
await page.waitForFunction(() => !!window.__wuselwerk, null, { timeout: 20000 });
await page.mouse.click(450, 250);
await page.waitForTimeout(300);
await page.evaluate((lv) => window.__wuselwerk.debugLoadLevel(lv), 'w1-03');
await page.waitForTimeout(600);

await page.evaluate(
  ({ pose, saum }) => {
    const at = window.__wuselwerk.atlas;
    if (!at) throw new Error('Kein Blatt geladen');
    at.setSaum(saum);
    const clip = at.manifest.clips[pose];
    // Spielgroesse: die Figur steht auf rund neun logischen Pixeln.
    const s = 4.06;
    const B = 160;
    const H = 160;
    const N = 16;

    // Je Lage ein Bild, alle mit demselben ganzzahligen Ursprung.
    const lagen = [];
    for (let k = 0; k < N; k++) {
      const bruch = k / N;
      const c = document.createElement('canvas');
      c.width = B;
      c.height = H;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = true;
      x.imageSmoothingQuality = 'high';
      // Der Bruchteil wandert in die Verschiebung, der ganze Teil nicht: So
      // liegen alle sechzehn Bilder uebereinander und nur die Abtastung
      // unterscheidet sich.
      x.save();
      x.translate(B / 2 + bruch, H - 30 + bruch);
      x.scale(s / at.manifest.ppl, s / at.manifest.ppl);
      const cw = at.manifest.cell.w * at.manifest.ppl;
      const ch = at.manifest.cell.h * at.manifest.ppl;
      const ax = at.manifest.anchor.x * at.manifest.ppl;
      const ay = at.manifest.anchor.y * at.manifest.ppl;
      if (at.saumBlatt) {
        x.drawImage(at.saumBlatt, 0, clip.row * ch, cw, ch, -ax, -ay, cw, ch);
      }
      x.drawImage(at.image, 0, clip.row * ch, cw, ch, -ax, -ay, cw, ch);
      x.restore();
      lagen.push(x.getImageData(0, 0, B, H).data);
    }

    // Je Punkt: Spanne der Helligkeit ueber die sechzehn Lagen.
    let gezaehlt = 0;
    let unruhig = 0;
    let summe = 0;
    let groesste = 0;
    for (let i = 0; i < B * H; i++) {
      let min = 1e9;
      let max = -1e9;
      let deckung = 0;
      for (const d of lagen) {
        const a = d[i * 4 + 3];
        if (a > 40) deckung++;
        const hell = a === 0 ? -1 : (d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114);
        if (hell >= 0) {
          if (hell < min) min = hell;
          if (hell > max) max = hell;
        }
      }
      // Nur Punkte, die in mindestens einer Lage zur Figur gehoeren.
      if (deckung === 0) continue;
      gezaehlt++;
      const spanne = max - min;
      summe += spanne;
      if (spanne > groesste) groesste = spanne;
      if (spanne > 20) unruhig++;
    }
    console.log(
      `FLM ${pose} Saum ${saum}: ${gezaehlt} Figurenpunkte, ` +
        `Spanne im Mittel ${(summe / gezaehlt).toFixed(1)}, groesste ${groesste.toFixed(0)}, ` +
        `unruhig ${((unruhig / gezaehlt) * 100).toFixed(1)} Prozent`,
    );
  },
  { pose: POSE, saum: SAUM },
);

await browser.close();
srv.close();
