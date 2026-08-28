/**
 * Die Bildfolge einer laufenden Figur — Bild fuer Bild, ohne Luecke.
 *
 * ## Warum es das braucht
 *
 * "Die Figur flackert" ist eine Aussage ueber die ZEIT, und ein Schnappschuss
 * kann sie nicht pruefen. Ein Bildschirmfoto je Aufruf ist ausserdem viel zu
 * langsam: Zwischen zwei Fotos liegen fuenfzig bis hundert Millisekunden, also
 * drei bis sechs uebersprungene Bilder — genau die, in denen das Flackern
 * steckt.
 *
 * Dieses Werkzeug haengt sich deshalb IN die Bildschleife der Seite, liest je
 * Bild einen kleinen Ausschnitt um die Figur aus und gibt am Ende die ganze
 * Folge zurueck.
 *
 * ## Was gemessen wird
 *
 * Zwei Zahlen, und die zweite ist die eigentliche:
 *
 *   Schritt   wie stark sich das Bild von einem zum naechsten aendert. Eine
 *             fluessige Bewegung aendert stetig, also gleichmaessig.
 *   Wechsel   wie stark das Bild ZURUECKSPRINGT: Aehnlichkeit zu Bild N-2
 *             gegen Aehnlichkeit zu Bild N-1. Flackern ist genau das —
 *             ein Hin und Her zwischen zwei Zustaenden. Bei fluessiger
 *             Bewegung ist Bild N-1 immer das aehnlichste.
 *
 * Aufruf (nach npm run build:single):
 *   node art-src/figur-umbau/bildfolge.mjs [level] [bilder]
 */
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, writeFileSync } from 'fs';

const LEVEL = process.argv[2] ?? 'w1-03';
const BILDER = Number(process.argv[3] ?? 90);

const html = readFileSync('/home/user/Wuselwerk/dist/spielen.html', 'utf8');
const srv = createServer((_q, r) => {
  r.writeHead(200, { 'Content-Type': 'text/html' });
  r.end(html);
}).listen(8151);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 900, height: 500 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:8151/');
await page.waitForFunction(() => !!window.__wuselwerk, null, { timeout: 20000 });
await page.mouse.click(450, 250);
await page.waitForTimeout(300);
await page.evaluate((lv) => window.__wuselwerk.debugLoadLevel(lv), LEVEL);
await page.waitForTimeout(700);
// Ohne den Startknopf laeuft die Simulation nicht — die Startklappe haelt sie.
const feld = await (await page.$('#spielfeld')).boundingBox();
const knopf = await page.evaluate(
  () => (window.__wuselwerk?.debugButtons() ?? []).find((x) => x.id === 'start') ?? null,
);
if (knopf) await page.mouse.click(feld.x + knopf.x + knopf.w / 2, feld.y + knopf.y + knopf.h / 2);
await page.waitForTimeout(4000);

const folge = await page.evaluate(async (n) => {
  const cv = document.getElementById('spielfeld');
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  // Die erste Figur suchen: das Spiel fuehrt sie im Feld.
  const spiel = window.__wuselwerk;
  const bilder = [];
  const R = 26; // halbe Kantenlaenge des Ausschnitts in Bildpunkten
  await new Promise((fertig) => {
    let i = 0;
    const schritt = () => {
      // Die Figur an ihrer SIMULATIONSPOSITION greifen, nicht am Farbschwerpunkt.
      //
      // Der erste Anlauf hat den Ausschnitt einem Schwerpunkt der blauen
      // Punkte nachgefuehrt — und damit das Flackern selbst erzeugt: Zittert
      // der Schwerpunkt um einen Punkt, wandert der ganze Ausschnitt mit, und
      // jeder Bildpunkt darin aendert sich. Gemessen wurden dann 28 Prozent
      // Ruecksprung, von denen niemand wusste, wieviel vom Messgeraet kam.
      const p = spiel.debugWalkerScreenPos();
      if (p) {
        const gx = Math.round(p.x), gy = Math.round(p.y);
        const x0 = Math.max(0, Math.min(cv.width - 2 * R, gx - R));
        const y0 = Math.max(0, Math.min(cv.height - 2 * R, gy - R));
        const aus = ctx.getImageData(x0, y0, 2 * R, 2 * R);
        // Der Bruchteil der Lage: Er entscheidet, wie das Blatt abgetastet
        // wird, und ist damit der Verdaechtige Nummer eins.
        bilder.push({
          x0, y0,
          zeit: performance.now(),
          tick: (spiel.debugStats && spiel.debugStats().tick) ?? null,
          bruchX: Number((p.x - gx).toFixed(4)),
          bruchY: Number((p.y - gy).toFixed(4)),
          daten: Array.from(aus.data),
        });
      }
      i++;
      if (i >= n) fertig();
      else requestAnimationFrame(schritt);
    };
    requestAnimationFrame(schritt);
  });
  return { R, bilder };
}, BILDER);

await browser.close();
srv.close();

const { R, bilder } = folge;
console.log(`${bilder.length} Bilder erfasst, Ausschnitt ${2 * R}x${2 * R}`);
// Zeitbasis pruefen, BEVOR irgendetwas ueber Flackern gesagt wird.
const dt = [];
for (let i = 1; i < bilder.length; i++) dt.push(bilder[i].zeit - bilder[i - 1].zeit);
const mitDt = dt.reduce((a, b) => a + b, 0) / dt.length;
console.log(`Bildabstand ${mitDt.toFixed(2)} ms  =  ${(1000 / mitDt).toFixed(1)} Bilder je Sekunde`);
const ticks = bilder.map((b) => b.tick).filter((t) => t !== null);
if (ticks.length > 1) {
  const spanneT = ticks[ticks.length - 1] - ticks[0];
  console.log(`Simulationstakte ueber die Folge: ${spanneT} auf ${bilder.length} Bilder  =  ${(spanneT / bilder.length).toFixed(2)} Takte je Bild`);
} else {
  console.log('Simulationstakt nicht ablesbar (debugStats liefert kein tick)');
}

/**
 * Gehoert ein Punkt zur Figur?
 *
 * Blau (Haar), Orange (Haut) oder das Gruen der Tunika. Alles andere ist
 * Kulisse — und die MUSS heraus: Der Ausschnitt folgt der Figur, also gleitet
 * die Kulisse darin. Beim Gehen springt sie alle drei Bilder um vier Punkte,
 * weil die Figur alle drei Takte einen logischen Pixel weiterkommt. Genau
 * diese Spruenge hat der erste Anlauf als "Flackern der Figur" gemessen. Sie
 * waren die Wiese.
 */
function figur(d, i) {
  const r = d[i], g = d[i + 1], b = d[i + 2];
  const hell = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (b > r + 30 && b > g + 20) return true;              // Haar
  if (r > 110 && r > g + 25 && g > b + 15) return true;   // Haut
  if (g > r + 6 && g > b + 18 && hell > 30 && hell < 120) return true; // Tunika
  return false;
}

/** Mittlerer Helligkeitsunterschied — nur ueber Punkte der Figur. */
function unterschied(a, b) {
  let s = 0, n = 0;
  for (let i = 0; i < a.length; i += 4) {
    if (!figur(a, i) && !figur(b, i)) continue;
    const la = 0.2126 * a[i] + 0.7152 * a[i + 1] + 0.0722 * a[i + 2];
    const lb = 0.2126 * b[i] + 0.7152 * b[i + 1] + 0.0722 * b[i + 2];
    s += Math.abs(la - lb);
    n++;
  }
  return n ? s / n : 0;
}

const schritte = [];
const wechsel = [];
for (let i = 2; i < bilder.length; i++) {
  const d1 = unterschied(bilder[i].daten, bilder[i - 1].daten);
  const d2 = unterschied(bilder[i].daten, bilder[i - 2].daten);
  schritte.push(d1);
  // Groesser als 1: Bild N-2 ist AEHNLICHER als Bild N-1 — das ist ein
  // Ruecksprung, also Flackern.
  wechsel.push(d1 > 0 ? d1 / Math.max(d2, 1e-6) : 0);
}
const mit = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const rueck = wechsel.filter((v) => v > 1).length;
console.log(`Schritt   Mittel ${mit(schritte).toFixed(2)}  Spanne ${Math.min(...schritte).toFixed(2)} bis ${Math.max(...schritte).toFixed(2)}`);
console.log(`Wechsel   Mittel ${mit(wechsel).toFixed(2)}  ueber 1 in ${rueck} von ${wechsel.length} Bildern (${(100 * rueck / wechsel.length).toFixed(0)} Prozent)`);
console.log(`          Ueber 1 heisst: das VORLETZTE Bild war aehnlicher als das letzte — ein Ruecksprung.`);

// Woran haengt der Ruecksprung? Zwei Verdaechtige, getrennt gemessen.
//
// 1. Die Unterpixel-Lage. Die Figur wird mit Absicht auf krummen Bildpunkten
//    gezeichnet; bei jedem Bild wird das Blatt neu abgetastet.
// 2. Der Einzelbildwechsel der Pose. Wenn die Bildnummer springt, aendert sich
//    das Bild sprunghaft — das ist der Gangzyklus, nicht das Abtasten.
const bruch = bilder.map((b) => b.bruchX);
const dBruch = [];
for (let i = 2; i < bilder.length; i++) dBruch.push(Math.abs(bruch[i] - bruch[i - 1]));

function korrelation(a, b) {
  const ma = a.reduce((x, y) => x + y, 0) / a.length;
  const mb = b.reduce((x, y) => x + y, 0) / b.length;
  let z = 0, sa = 0, sb = 0;
  for (let i = 0; i < a.length; i++) {
    z += (a[i] - ma) * (b[i] - mb);
    sa += (a[i] - ma) ** 2;
    sb += (b[i] - mb) ** 2;
  }
  return z / Math.sqrt(sa * sb || 1e-9);
}
console.log(`\nUnterpixel-Lage x: Spanne ${Math.min(...bruch).toFixed(3)} bis ${Math.max(...bruch).toFixed(3)}`);
console.log(`Korrelation Schrittgroesse gegen Aenderung der Unterpixel-Lage: ${korrelation(schritte, dBruch).toFixed(3)}`);

// Wie sieht die Schrittfolge aus? Bei fluessiger Bewegung gleichmaessig,
// bei springenden Einzelbildern ein Zickzack.
// Wo steht der Scheitel, Bild fuer Bild? Der Ausschnitt haengt an der
// Simulationsposition, also ist jede Bewegung darin die Bewegung der Figur
// selbst — Kopfnicken, Federn, Springen.
{
  const R2 = R * 2;
  const scheitel = bilder.map((b) => {
    for (let y = 0; y < R2; y++)
      for (let x = 0; x < R2; x++) {
        const i = (y * R2 + x) * 4;
        if (figur(b.daten, i)) return y;
      }
    return -1;
  });
  const gueltig = scheitel.filter((v) => v >= 0);
  console.log(`\nScheitel im Ausschnitt: ${Math.min(...gueltig)} bis ${Math.max(...gueltig)} Bildpunkte  (Spanne ${Math.max(...gueltig) - Math.min(...gueltig)})`);
  console.log('  ' + scheitel.slice(0, 40).map((v) => String(v).padStart(3)).join(''));
  // Und wie oft kehrt er die Richtung um? Ein Gangzyklus hat ZWEI Hebungen.
  let kehr = 0;
  for (let i = 2; i < scheitel.length; i++) {
    const a = scheitel[i - 1] - scheitel[i - 2], b2 = scheitel[i] - scheitel[i - 1];
    if (a !== 0 && b2 !== 0 && Math.sign(a) !== Math.sign(b2)) kehr++;
  }
  console.log(`  Richtungswechsel ${kehr} auf ${bilder.length} Bilder  =  ${(60 * kehr / bilder.length).toFixed(1)} je Sekunde`);
}

console.log('\nSchrittgroesse Bild fuer Bild (die ersten 40):');
console.log('  ' + schritte.slice(0, 40).map((v) => v.toFixed(1).padStart(5)).join(''));
console.log('Unterpixel-Lage x dazu:');
console.log('  ' + bruch.slice(2, 42).map((v) => v.toFixed(2).padStart(5)).join(''));

// Die Bilder als Streifen herausschreiben — ansehen schlaegt jede Kennzahl.
{
  const N = 16, R2 = R * 2;
  const breite = N * R2, hoehe = R2;
  const roh = Buffer.alloc(breite * hoehe * 4);
  for (let k = 0; k < N && k < bilder.length; k++) {
    const d = bilder[k].daten;
    for (let y = 0; y < R2; y++) {
      for (let x = 0; x < R2; x++) {
        const q = (y * R2 + x) * 4;
        const z = (y * breite + k * R2 + x) * 4;
        roh[z] = d[q]; roh[z + 1] = d[q + 1]; roh[z + 2] = d[q + 2]; roh[z + 3] = 255;
      }
    }
  }
  writeFileSync(process.env.SP + '/streifen.raw', roh);
  writeFileSync(process.env.SP + '/streifen.json', JSON.stringify({ breite, hoehe }));
}
writeFileSync(process.env.SP + '/bildfolge.json', JSON.stringify({ schritte, wechsel, bruch }, null, 1));
