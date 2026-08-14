/**
 * Vermisst das **Haar** auf dem gebackenen Sprite-Blatt — Bild fuer Bild.
 *
 * ## Wofuer
 *
 * Ueber das Haar dieser Figur wird viel behauptet: es sei zu zottelig, es haenge
 * in den Augen, es fresse die halbe Zelle, auf dem Telefon zerfalle es zu Matsch.
 * Solange das niemand misst, gewinnt die Behauptung, die zuletzt gesagt wurde.
 * Dieses Werkzeug macht aus jeder dieser Behauptungen eine Zahl:
 *
 * - **Rauheit** — Umrisslaenge der Haarflaeche durch den Umriss ihrer konvexen
 *   Huelle. Eine geschlossene Kappe liegt knapp ueber 1; jede Zacke, jede
 *   Straehne, jedes Loch verlaengert den Umriss, ohne die Huelle zu vergroessern.
 *   Gemessen bei Blattgroesse **und** bei Telefongroesse, denn die zweite Zahl
 *   ist die, die der Spieler sieht.
 * - **Richtungswechsel der Stirnkante** — wie oft die Haargrenze ueber der Stirn
 *   ihre Richtung umkehrt. Eine gezackte Franse zaehlt hoch, ein Bogen zaehlt
 *   eins.
 * - **Haarpunkte innerhalb des Hautumrisses** — ob Haar *vor* dem Gesicht liegt.
 *   Das ist eine Frage der Tiefenstaffelung und faellt sonst erst im Spiel auf.
 * - **Anteil exakter Volltonpunkte** — ob die Flaeche gemalt (ein Ton) oder
 *   gerendert (tausend Toene) ist.
 * - **Kopfanteil, Figurenbreite, Augenschranke** — die drei Masse, an denen die
 *   Simulation haengt: Spaltenbreite im Pulk und ein Gesicht, das man sieht.
 *
 * ## Warum die Zahlen zusammen mit einem SHA-256 herausgeschrieben werden
 *
 * Ein Messbericht ohne Fingerabdruck des Gemessenen veraltet lautlos: Das Blatt
 * wird neu gebacken, die Datei mit den Zahlen bleibt liegen, und ab dann streiten
 * zwei Quellen. Steht der SHA-256 des WebP daneben, laesst sich in einer Zeile
 * pruefen, ob der Bericht noch zum Blatt gehoert.
 *
 * ## Warum Chromium und nicht PIL
 *
 * Beides liegt hier: `playwright` steht in `package.json`, PIL steht nur zufaellig
 * im Abbild. Nur das erste ist damit reproduzierbar. Entscheidend ist aber etwas
 * anderes: Die Telefongroesse entsteht durch **Herunterskalieren**, und wie das
 * ausgeht, haengt am Filter. Der Filter, der zaehlt, ist der des Browsers, denn
 * `drawImage` in `src/render/atlas.ts` macht es im Spiel genauso. In Chromium
 * gemessen ist die Telefonzahl das, was auf dem Geraet steht; in PIL gemessen
 * waere sie das, was PIL daraus machen wuerde.
 *
 * Aufruf: `node scripts/haar-messen.mjs [--telefon 69]`
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const WURZEL = '/tmp/claude-0/-home-user-Wuselwerk/9de56fbf-32ae-5115-8d23-53a558f14354/scratchpad/probe-f5aca86/';
const P = (rel) => WURZEL + rel;

const BLATT = 'src/art/wuselwerker.webp';
/**
 * Das Manifest liegt bei den Quelldaten, sobald das Blatt dorthin gezogen ist;
 * bis dahin neben dem ausgelieferten Blatt. Gesucht wird in dieser Reihenfolge,
 * damit der Lauf nicht daran scheitert, wo die Datei gerade steht.
 */
const MANIFESTE = ['art-src/wuselwerker/wuselwerker.atlas.json', 'src/art/wuselwerker.atlas.json'];
const ZIEL = 'art-src/wuselwerker/blatt-mess.json';

/**
 * Kantenlaenge der Zelle auf dem Telefonschirm, in Punkten.
 *
 * Nicht aus dem Code herleitbar — sie haengt an Geraet und Zoomstand, nicht an
 * einer Konstante. 69 ist die Vorgabe, gegen die gemessen werden soll;
 * `--telefon <n>` stellt sie um.
 */
const TELEFON_VORGABE = 69;

/**
 * Ab welchem Anteil der groessten Haarinsel eine kleinere noch als Haar zaehlt.
 *
 * Die Figur traegt **blaue Augenbrauen**. Sie sind farblich nicht vom Haar zu
 * trennen — gemessen liegen sie bei Farbton 236 bis 266 Grad, mitten im Blau der
 * Kappe. Von der Kappe unterscheiden sie sich durch die Groesse: gut ein Prozent
 * ihrer Flaeche. Was unter dieser Schranke bleibt, geht als **Splitter** in den
 * Bericht statt in die Haarflaeche — sonst behauptete jedes Bild, es liege Haar
 * vor dem Gesicht, und die Brauen verdeckten genau den Befund, auf den es hier
 * ankommt.
 */
const INSEL_SCHRANKE = 0.05;

/**
 * Wie weit die Stirnkante ausschlagen muss, damit ein Richtungswechsel zaehlt —
 * in logischen Pixeln.
 *
 * Ohne diese Schwelle zaehlt das Kantenrauschen der Kantenglaettung mit: Die
 * Haargrenze wackelt bildpunktweise um einen halben Punkt, und eine glatte Kante
 * kaeme auf zwanzig Wechsel. Eine echte Zacke misst rund einen logischen Pixel;
 * ein Drittel davon trennt beides sauber.
 */
const WELLEN_SCHWELLE = 0.3;

/**
 * Untere Saettigungsgrenze, ab der ein Farbton ueberhaupt etwas bedeutet.
 *
 * Das ist keine Annahme ueber die Grafik, sondern ueber die Kodierung: Bei
 * s < 0,1 liegen alle drei Kanaele im Abstand von hoechstens 25 Stufen, und der
 * Farbton, den man daraus rechnet, ist Rundungsrauschen. Diese Punkte — Weiss im
 * Auge, Pupille, Glanz — gehen als *unbunt* in den Bericht.
 */
const BUNT_AB = 0.1;

const args = process.argv.slice(2);
const TELEFON = args.includes('--telefon')
  ? Number(args[args.indexOf('--telefon') + 1])
  : TELEFON_VORGABE;

// ---------------------------------------------------------------------------
// Blatt und Manifest
// ---------------------------------------------------------------------------

if (!existsSync(P(BLATT))) throw new Error(`Kein Blatt unter ${BLATT}`);
const blattBytes = readFileSync(P(BLATT));
const SHA = createHash('sha256').update(blattBytes).digest('hex');

const manifestPfad = MANIFESTE.find((m) => existsSync(P(m)));
if (!manifestPfad) throw new Error(`Kein Manifest gefunden (${MANIFESTE.join(', ')})`);
const manifest = JSON.parse(readFileSync(P(manifestPfad), 'utf8'));

const PPL = manifest.ppl ?? 1;
const ZELLE = Math.round(manifest.cell.w * PPL);
if (Math.abs(manifest.cell.w * PPL - ZELLE) > 0.01) {
  throw new Error(`Zellmass ${manifest.cell.w} x ${PPL} ergibt keine ganze Zahl`);
}

/** Jedes Einzelbild als (Zeile, Spalte) im Blatt, in Manifestreihenfolge. */
const BILDER = [];
for (const [clip, def] of Object.entries(manifest.clips)) {
  for (let i = 0; i < def.holds.length; i++) BILDER.push({ clip, bild: i, zeile: def.row, spalte: i });
}

// ---------------------------------------------------------------------------
// Bildpunkte holen — Chromium dekodiert das WebP und skaliert die Zellen
// ---------------------------------------------------------------------------

/**
 * Laeuft **im Browser**: dekodiert das Blatt und gibt je Einzelbild zwei
 * Rohpunktfelder zurueck — Blattgroesse und Telefongroesse.
 *
 * Skaliert wird je Zelle, nicht das ganze Blatt auf einmal: Ein Filter, der ueber
 * die Zellgrenze hinweg abtastet, zieht den Nachbarn ins Bild. Im Spiel schneidet
 * `drawImage` die Zelle vorher heraus, also muss es hier genauso laufen.
 */
async function imBrowser({ b64, zelle, telefon, bilder }) {
  const bild = new Image();
  bild.src = 'data:image/webp;base64,' + b64;
  await bild.decode();

  const mach = (n) => {
    const c = document.createElement('canvas');
    c.width = n;
    c.height = n;
    const k = c.getContext('2d', { willReadFrequently: true });
    // Wie im Spiel: `ppl > 1` heisst gemaltes Blatt, also weich skalieren.
    k.imageSmoothingEnabled = true;
    return k;
  };
  const gross = mach(zelle);
  const klein = mach(telefon);

  const b64Von = (u8) => {
    let s = '';
    for (let i = 0; i < u8.length; i += 0x8000) {
      s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    }
    return btoa(s);
  };

  const aus = [];
  for (const b of bilder) {
    const sx = b.spalte * zelle;
    const sy = b.zeile * zelle;
    gross.clearRect(0, 0, zelle, zelle);
    gross.drawImage(bild, sx, sy, zelle, zelle, 0, 0, zelle, zelle);
    klein.clearRect(0, 0, telefon, telefon);
    klein.drawImage(bild, sx, sy, zelle, zelle, 0, 0, telefon, telefon);
    aus.push({
      blatt: b64Von(new Uint8Array(gross.getImageData(0, 0, zelle, zelle).data.buffer)),
      telefon: b64Von(new Uint8Array(klein.getImageData(0, 0, telefon, telefon).data.buffer)),
    });
  }
  return { breite: bild.width, hoehe: bild.height, aus };
}

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
let roh;
try {
  const page = await browser.newPage({ viewport: { width: 200, height: 200 } });
  page.on('pageerror', (e) => console.error('Seitenfehler:', e.message));
  await page.goto('about:blank');
  roh = await page.evaluate(imBrowser, {
    b64: blattBytes.toString('base64'),
    zelle: ZELLE,
    telefon: TELEFON,
    bilder: BILDER,
  });
} finally {
  // Sonst haengt bei einem Fehler im Browser der ganze Lauf an einem offenen
  // Chromium, statt die Meldung zu zeigen.
  await browser.close();
}

if (roh.breite % ZELLE || roh.hoehe % ZELLE) {
  throw new Error(`Blatt ${roh.breite}x${roh.hoehe} ist kein Vielfaches der Zelle ${ZELLE}`);
}
const felder = roh.aus.map((a) => ({
  blatt: { n: ZELLE, p: Buffer.from(a.blatt, 'base64') },
  telefon: { n: TELEFON, p: Buffer.from(a.telefon, 'base64') },
}));

// ---------------------------------------------------------------------------
// Farbe: Klassen aus der gemessenen Verteilung, nicht aus Vermutung
// ---------------------------------------------------------------------------

/** HSV, wie ueblich: h in Grad, s und v in 0..1. */
function hsv(r, g, b) {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  let h = 0;
  if (d > 0) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: mx === 0 ? 0 : d / mx, v: mx / 255 };
}

/**
 * Sucht die Farbtongipfel des Blattes und legt die Klassengrenzen in die Taeler
 * dazwischen.
 *
 * Der Sinn ist, **nicht** zu raten: Ob das Haar bei 225 Grad liegt oder bei 218,
 * ob die Tunika ins Gelbe zieht, wie weit die Haut streut — das steht im Blatt
 * und nirgends sonst. Geraten wird hier nur noch, welcher Gipfel welchen Namen
 * traegt, und auch das nur ueber weite, nicht ueberlappende Bereiche.
 */
function farbsektoren(punktfelder) {
  const hist = new Float64Array(360);
  for (const f of punktfelder) {
    const p = f.blatt.p;
    for (let i = 0; i < p.length; i += 4) {
      if (p[i + 3] < 128) continue;
      const c = hsv(p[i], p[i + 1], p[i + 2]);
      if (c.s < BUNT_AB) continue;
      hist[Math.min(359, Math.floor(c.h))]++;
    }
  }
  // Glaetten ueber +-3 Grad, zyklisch: ein Gipfel soll ein Gipfel sein und nicht
  // der Zufall eines einzelnen Faechers.
  const glatt = new Float64Array(360);
  for (let i = 0; i < 360; i++) {
    let s = 0;
    for (let d = -3; d <= 3; d++) s += hist[(i + d + 360) % 360];
    glatt[i] = s / 7;
  }
  // Die drei staerksten Gipfel mit mindestens 40 Grad Abstand.
  const abstand = (a, b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
  const reihenfolge = [...glatt.keys()].sort((a, b) => glatt[b] - glatt[a]);
  const gipfel = [];
  for (const i of reihenfolge) {
    if (gipfel.length === 3) break;
    if (gipfel.every((g) => abstand(g, i) >= 40)) gipfel.push(i);
  }
  gipfel.sort((a, b) => a - b);
  // Grenze zwischen zwei Gipfeln: das tiefste Tal auf dem Bogen dazwischen.
  const grenzen = [];
  for (let k = 0; k < gipfel.length; k++) {
    const von = gipfel[k];
    const bis = gipfel[(k + 1) % gipfel.length];
    let best = von;
    let wert = Infinity;
    for (let i = von + 1; i < von + ((bis - von + 360) % 360); i++) {
      const j = i % 360;
      if (glatt[j] < wert) {
        wert = glatt[j];
        best = j;
      }
    }
    grenzen.push(best);
  }
  // Namen vergeben. Die Bereiche sind weit und ueberlappen nicht; trifft ein
  // Gipfel keinen oder zwei denselben, hat sich die Grafik so geaendert, dass
  // dieses Werkzeug neu bedacht werden muss — dann bricht es lieber ab.
  const namen = {};
  for (const g of gipfel) {
    const name = g >= 180 && g < 300 ? 'haar' : g >= 45 && g < 180 ? 'tunika' : 'haut';
    if (namen[name] !== undefined) throw new Error(`Zwei Farbgipfel heissen ${name}`);
    namen[name] = g;
  }
  for (const n of ['haar', 'haut', 'tunika']) {
    if (namen[n] === undefined) throw new Error(`Kein Farbgipfel fuer ${n} gefunden`);
  }
  return { gipfel, grenzen, namen };
}

const sektoren = farbsektoren(felder);

/**
 * Nachschlagetafel Farbton (ganze Grad) -> Klasse. Einmal gebaut, danach kostet
 * das Einordnen eines Punktes einen Zugriff.
 *
 * Sektor k liegt zwischen Grenze k und Grenze k+1 und enthaelt Gipfel k+1 —
 * die Grenzen sind ja die Taeler *zwischen* den Gipfeln.
 */
const SEKTOR_TAFEL = (() => {
  const { grenzen, gipfel, namen } = sektoren;
  const tafel = new Uint8Array(360);
  for (let k = 0; k < grenzen.length; k++) {
    const gip = gipfel[(k + 1) % gipfel.length];
    const klasse = gip === namen.haar ? 1 : gip === namen.haut ? 2 : 3;
    const von = grenzen[k];
    const laenge = (grenzen[(k + 1) % grenzen.length] - von + 360) % 360;
    for (let d = 0; d < laenge; d++) tafel[(von + d) % 360] = klasse;
  }
  return tafel;
})();

/**
 * Einordnen eines Punktes. Rueckgabe: 0 = durchsichtig, 1 = Haar, 2 = Haut,
 * 3 = Tunika, 4 = unbunt (Augenweiss, Pupille, Glanz).
 */
function klasseVon(r, g, b, a) {
  if (a < 128) return 0;
  const c = hsv(r, g, b);
  if (c.s < BUNT_AB) return 4;
  return SEKTOR_TAFEL[Math.min(359, Math.floor(c.h))];
}

// ---------------------------------------------------------------------------
// Formwerkzeug: Komponenten, Umriss, konvexe Huelle, Loecher
// ---------------------------------------------------------------------------

/** Zusammenhaengende Inseln einer Maske, 8er-Nachbarschaft, groesste zuerst. */
function inseln(maske, n) {
  const gesehen = new Uint8Array(n * n);
  const aus = [];
  const stapel = [];
  for (let start = 0; start < n * n; start++) {
    if (!maske[start] || gesehen[start]) continue;
    gesehen[start] = 1;
    stapel.length = 0;
    stapel.push(start);
    const insel = [];
    while (stapel.length) {
      const i = stapel.pop();
      insel.push(i);
      const x = i % n;
      const y = (i / n) | 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
          const j = ny * n + nx;
          if (maske[j] && !gesehen[j]) {
            gesehen[j] = 1;
            stapel.push(j);
          }
        }
      }
    }
    aus.push(insel);
  }
  aus.sort((a, b) => b.length - a.length);
  return aus;
}

/**
 * Umriss einer Maske nach Marching Squares, Ecken auf den Kantenmitten.
 *
 * Warum nicht einfach Randpunkte zaehlen: Ein Treppenumriss misst fuer einen
 * Kreis das Achtfache des Radius statt 2*pi*r — 27 Prozent zu viel. Dieser
 * Fehler saehe wie Rauheit aus und waere doch nur das Punktraster. Die
 * Kantenmitten schneiden die Treppe ab; was uebrig bleibt, misst die Eichprobe
 * weiter unten (rund vier Prozent zu lang, und zwar gleichmaessig).
 *
 * Geliefert werden Gesamtlaenge (alle Raender, auch Loecher) und alle Eckpunkte.
 */
function umriss(maske, n) {
  let laenge = 0;
  const punkte = [];
  const gesehen = new Set();
  const s = (x, y) => (x < 0 || y < 0 || x >= n || y >= n ? 0 : maske[y * n + x] ? 1 : 0);
  for (let y = -1; y < n; y++) {
    for (let x = -1; x < n; x++) {
      const code = s(x, y) | (s(x + 1, y) << 1) | (s(x + 1, y + 1) << 2) | (s(x, y + 1) << 3);
      if (code === 0 || code === 15) continue;
      // Kantenmitten des Feldes, in der Reihenfolge Nord, Ost, Sued, West.
      const ecke = [[x + 0.5, y], [x + 1, y + 0.5], [x + 0.5, y + 1], [x, y + 0.5]];
      for (const [i, j] of MS_TAFEL[code]) {
        const a = ecke[i];
        const b = ecke[j];
        laenge += Math.hypot(a[0] - b[0], a[1] - b[1]);
        for (const p of [a, b]) {
          const schluessel = p[0] * 2 * 4096 + p[1] * 2;
          if (!gesehen.has(schluessel)) {
            gesehen.add(schluessel);
            punkte.push(p);
          }
        }
      }
    }
  }
  return { laenge, punkte };
}

/**
 * Welche Kantenmitten ein Feld verbindet, nach seinem Eckmuster (Nord = 0,
 * Ost = 1, Sued = 2, West = 3).
 *
 * Die Faelle 5 und 10 sind mehrdeutig — dort stossen zwei Ecken diagonal
 * aneinander, und es ist nicht entscheidbar, ob sie zusammengehoeren. Fuer die
 * Laenge ist das gleich: Beide Auflegungen ergeben dieselben zwei Strecken.
 */
const MS_TAFEL = {
  1: [[0, 3]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 5: [[0, 3], [1, 2]],
  6: [[0, 2]], 7: [[3, 2]], 8: [[3, 2]], 9: [[0, 2]], 10: [[0, 1], [3, 2]],
  11: [[1, 2]], 12: [[3, 1]], 13: [[0, 1]], 14: [[0, 3]],
};

/** Umfang der konvexen Huelle einer Punktwolke (Andrew, monotone Kette). */
function huellenUmfang(punkte) {
  if (punkte.length < 3) return 0;
  const p = [...punkte].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const kreuz = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const kette = (liste) => {
    const k = [];
    for (const q of liste) {
      while (k.length >= 2 && kreuz(k[k.length - 2], k[k.length - 1], q) <= 0) k.pop();
      k.push(q);
    }
    return k;
  };
  const unten = kette(p);
  const oben = kette([...p].reverse());
  const h = [...unten.slice(0, -1), ...oben.slice(0, -1)];
  let u = 0;
  for (let i = 0; i < h.length; i++) {
    const a = h[i];
    const b = h[(i + 1) % h.length];
    u += Math.hypot(a[0] - b[0], a[1] - b[1]);
  }
  return u;
}

/**
 * Maske mit gefuellten Loechern: alles, was der Hintergrund vom Zellrand aus
 * nicht erreicht, liegt innen.
 *
 * Das ist der *Umriss* der Flaeche im Wortsinn — bei der Haut also Gesicht samt
 * Augen und Mund. Nur so laesst sich fragen, ob ein Haarpunkt **darin** liegt.
 */
function mitLoechern(maske, n) {
  const aussen = new Uint8Array(n * n);
  const stapel = [];
  for (let i = 0; i < n; i++) {
    for (const j of [i, (n - 1) * n + i, i * n, i * n + n - 1]) {
      if (!maske[j] && !aussen[j]) {
        aussen[j] = 1;
        stapel.push(j);
      }
    }
  }
  while (stapel.length) {
    const i = stapel.pop();
    const x = i % n;
    const y = (i / n) | 0;
    const nachbarn = [x > 0 ? i - 1 : -1, x < n - 1 ? i + 1 : -1, y > 0 ? i - n : -1, y < n - 1 ? i + n : -1];
    for (const j of nachbarn) {
      if (j >= 0 && !maske[j] && !aussen[j]) {
        aussen[j] = 1;
        stapel.push(j);
      }
    }
  }
  const voll = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) voll[i] = maske[i] || !aussen[i] ? 1 : 0;
  return voll;
}

/**
 * Richtungswechsel einer Kurve mit Mindestausschlag.
 *
 * Gezaehlt wird, wie oft die Folge ihre Richtung umkehrt, nachdem sie sich um
 * mindestens `schwelle` vom letzten Umkehrpunkt entfernt hat. Das entspricht dem
 * Vorzeichenwechsel der Konturnormalen — nur eben unempfindlich gegen das
 * Zittern der Kantenglaettung.
 */
function richtungswechsel(werte, schwelle) {
  if (werte.length < 2) return 0;
  let hoch = werte[0];
  let tief = werte[0];
  let richtung = 0;
  let wechsel = 0;
  for (const w of werte) {
    if (w > hoch) hoch = w;
    if (w < tief) tief = w;
    if (richtung !== 1 && w >= tief + schwelle) {
      if (richtung === -1) wechsel++;
      richtung = 1;
      hoch = w;
    } else if (richtung !== -1 && w <= hoch - schwelle) {
      if (richtung === 1) wechsel++;
      richtung = -1;
      tief = w;
    }
  }
  return wechsel;
}

// ---------------------------------------------------------------------------
// Eichprobe: das Messband gegen sich selbst
// ---------------------------------------------------------------------------

/**
 * Bevor irgendein Bild vermessen wird, misst das Werkzeug zwei Formen, deren
 * Rauheit feststeht: eine Scheibe (glatt, also 1) und einen Zackenstern (rau).
 *
 * Ohne das ist eine Zahl wie 1,2 nicht zu lesen — man wuesste nicht, ob sie die
 * Form beschreibt oder das Raster. Die Scheibe sagt, wie viel das Raster
 * beitraegt; der Stern sagt, dass das Mass ueberhaupt ausschlaegt.
 */
function eichprobe() {
  const mach = (n, f) => {
    const m = new Uint8Array(n * n);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (f(x + 0.5 - n / 2, y + 0.5 - n / 2)) m[y * n + x] = 1;
      }
    }
    return m;
  };
  const rauheit = (m, n) => {
    const u = umriss(m, n);
    return u.laenge / huellenUmfang(u.punkte);
  };
  const n = 64;
  const scheibe = rauheit(mach(n, (x, y) => x * x + y * y <= 24 * 24), n);
  const stern = rauheit(
    mach(n, (x, y) => {
      const r = Math.hypot(x, y);
      return r <= 16 + 8 * Math.cos(12 * Math.atan2(y, x));
    }),
    n,
  );
  if (!(scheibe > 0.98 && scheibe < 1.12)) {
    throw new Error(`Eichprobe gescheitert: Scheibe misst ${scheibe.toFixed(3)} statt rund 1`);
  }
  if (!(stern > 1.6)) throw new Error(`Eichprobe gescheitert: Stern misst nur ${stern.toFixed(3)}`);
  return { scheibe: Number(scheibe.toFixed(4)), zackenstern: Number(stern.toFixed(4)) };
}

const EICHUNG = eichprobe();

// ---------------------------------------------------------------------------
// Ein Einzelbild vermessen
// ---------------------------------------------------------------------------

/** Masken und Haarflaeche eines Punktfeldes. */
function zerlegen({ n, p }) {
  const deckend = new Uint8Array(n * n);
  const haarRoh = new Uint8Array(n * n);
  const haut = new Uint8Array(n * n);
  const tunika = new Uint8Array(n * n);
  const zahl = { deckend: 0, haar: 0, haut: 0, tunika: 0, unbunt: 0 };
  for (let i = 0, k = 0; i < p.length; i += 4, k++) {
    const kl = klasseVon(p[i], p[i + 1], p[i + 2], p[i + 3]);
    if (kl === 0) continue;
    deckend[k] = 1;
    zahl.deckend++;
    if (kl === 1) {
      haarRoh[k] = 1;
      zahl.haar++;
    } else if (kl === 2) {
      haut[k] = 1;
      zahl.haut++;
    } else if (kl === 3) {
      tunika[k] = 1;
      zahl.tunika++;
    } else {
      zahl.unbunt++;
    }
  }
  // Haarflaeche = die grossen Inseln. Der Rest sind Splitter (Augenbrauen,
  // vereinzelte Punkte der Kantenglaettung).
  const alle = inseln(haarRoh, n);
  const haar = new Uint8Array(n * n);
  let splitter = 0;
  const splitterMaske = new Uint8Array(n * n);
  if (alle.length) {
    const schranke = alle[0].length * INSEL_SCHRANKE;
    for (const insel of alle) {
      const ziel = insel.length >= schranke ? haar : splitterMaske;
      for (const i of insel) ziel[i] = 1;
      if (insel.length < schranke) splitter += insel.length;
    }
  }
  return { n, p, deckend, haar, haarRoh, haut, tunika, splitter, splitterMaske, zahl, inselzahl: alle.length };
}

/** Rauheit einer Maske: Umriss durch Huellenumriss. */
function rauheit(maske, n) {
  const u = umriss(maske, n);
  const h = huellenUmfang(u.punkte);
  return h > 0 ? u.laenge / h : null;
}

/** Kasten (bbox) einer Maske. */
function kasten(maske, n) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, z = 0;
  for (let i = 0; i < n * n; i++) {
    if (!maske[i]) continue;
    const x = i % n;
    const y = (i / n) | 0;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
    z++;
  }
  return z ? { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1, zahl: z } : null;
}

/**
 * Vermisst ein Einzelbild bei Blattgroesse. Alles ausser der Rauheit haengt an
 * Bildpunkten, die in der Telefongroesse gar nicht mehr aufgeloest sind — dort
 * wird deshalb nur die Rauheit gemessen.
 */
function vermessen(z) {
  const { n, p } = z;
  const aus = {};

  aus.rauheitBlatt = rauheit(z.haar, n);
  // Dieselbe Zahl noch einmal, aber mit gefuellten Loechern. Der Abstand
  // zwischen beiden sagt, woher die Rauheit kommt: Ist er klein, liegt sie am
  // *Umriss* (Zacken, Zipfel, Lappen); ist er gross, hat die Flaeche Loecher —
  // Schattenflecken, die farblich aus dem Haar fallen. Nur das erste ist eine
  // Aussage ueber die Frisur.
  const haarVoll = mitLoechern(z.haar, n);
  aus.rauheitOhneLoecher = rauheit(haarVoll, n);
  let loecher = 0;
  for (let i = 0; i < n * n; i++) if (haarVoll[i] && !z.haar[i]) loecher++;
  aus.haarloecher = loecher;

  const figur = kasten(z.deckend, n);
  aus.figurbreite = figur ? Number((figur.w / PPL).toFixed(3)) : null;
  aus.figurhoehe = figur ? Number((figur.h / PPL).toFixed(3)) : null;

  // --- Volltonpunkte ------------------------------------------------------
  // Gezaehlt wird der genaue Farbwert, nicht ein aehnlicher: Die Frage ist, ob
  // die Flaeche *gemalt* ist. Ein einziger Ton heisst gemalt, tausend Toene
  // heissen gerendert.
  const zaehler = new Map();
  let haarpunkte = 0;
  for (let i = 0, k = 0; i < p.length; i += 4, k++) {
    if (!z.haar[k] || p[i + 3] !== 255) continue;
    haarpunkte++;
    const key = (p[i] << 16) | (p[i + 1] << 8) | p[i + 2];
    zaehler.set(key, (zaehler.get(key) ?? 0) + 1);
  }
  let besterTon = null;
  let besterZahl = 0;
  for (const [key, c] of zaehler) {
    if (c > besterZahl) {
      besterZahl = c;
      besterTon = key;
    }
  }
  aus.punkte = z.zahl;
  aus.haarflaeche = z.zahl.haar - z.splitter;
  aus.haarpunkteVoll = haarpunkte;
  aus.haarsplitter = z.splitter;
  aus.haarinseln = z.inselzahl;
  aus.haartoene = zaehler.size;
  aus.volltonAnteil = haarpunkte ? Number((besterZahl / haarpunkte).toFixed(5)) : null;
  aus.volltonFarbe = besterTon === null ? null : '#' + besterTon.toString(16).padStart(6, '0').toUpperCase();

  // --- Haar innerhalb des Hautumrisses ------------------------------------
  const hautVoll = mitLoechern(z.haut, n);
  let vorHaut = 0;
  let brauen = 0;
  for (let i = 0; i < n * n; i++) {
    if (!hautVoll[i]) continue;
    if (z.haar[i]) vorHaut++;
    if (z.splitterMaske[i]) brauen++;
  }
  aus.haarVorHaut = vorHaut;
  aus.splitterVorHaut = brauen;

  // --- Gesicht, Augenzeile, Stirnkante ------------------------------------
  const hautInseln = inseln(z.haut, n);
  const gesichtsInsel = hautInseln[0] ?? null;
  aus.stirnwechsel = null;
  aus.stirnbreite = null;
  aus.augenzeile = null;
  aus.haartiefe = null;
  aus.augenschranke = null;
  aus.gesichtsbreite = null;
  aus.rauheitGesicht = null;

  if (gesichtsInsel && figur) {
    const gesicht = new Uint8Array(n * n);
    for (const i of gesichtsInsel) gesicht[i] = 1;
    const gVoll = mitLoechern(gesicht, n);
    const gk = kasten(gesicht, n);
    aus.gesichtsbreite = Number((gk.w / PPL).toFixed(3));

    // Die zweite Eichung, und die wichtigere: dieselbe Rauheit, gemessen an
    // einer Form, von der man weiss, dass sie glatt ist — dem Gesicht (Augen
    // und Mund zugefuellt, sonst zaehlten ihre Raender mit).
    //
    // Die Scheibe weiter oben ist gerechnet; dieses Gesicht ist gemalt, liegt
    // auf demselben Blatt, hat dieselbe Kantenglaettung und dieselbe Groesse.
    // Was es misst, ist der Nullpunkt fuer die Haarzahl daneben: Liegt das
    // Gesicht bei 1,1 und das Haar bei 1,4, dann sind die 0,3 Unterschied die
    // Frisur und nicht das Werkzeug.
    aus.rauheitGesicht = rauheit(gVoll, n);
    if (aus.rauheitGesicht !== null) aus.rauheitGesicht = Number(aus.rauheitGesicht.toFixed(4));

    // Augen: die dunkelsten Flecken im Gesicht. Die Grenze folgt der gemessenen
    // Gesichtshelligkeit — halb so hell wie der Mittelwert der Haut ist keine
    // Haut mehr. Gesucht wird nur im oberen Teil des Gesichts, sonst zaehlt der
    // Mund mit; Haar (also auch die blauen Brauen) bleibt aussen vor.
    const hell = [];
    for (const i of gesichtsInsel) hell.push(hsv(p[i * 4], p[i * 4 + 1], p[i * 4 + 2]).v);
    hell.sort((a, b) => a - b);
    const mittel = hell[hell.length >> 1];
    const dunkelAb = mittel * 0.5;
    const stirnGrenze = gk.y0 + gk.h * 0.65;
    const zeilen = new Float64Array(n);
    const dunkel = [];
    for (let y = gk.y0; y <= Math.min(gk.y1, Math.floor(stirnGrenze)); y++) {
      for (let x = gk.x0; x <= gk.x1; x++) {
        const i = y * n + x;
        if (!gVoll[i] || z.haarRoh[i] || p[i * 4 + 3] < 128) continue;
        if (hsv(p[i * 4], p[i * 4 + 1], p[i * 4 + 2]).v <= dunkelAb) {
          dunkel.push([x, y]);
          zeilen[y]++;
        }
      }
    }
    if (dunkel.length) {
      let gipfel = gk.y0;
      for (let y = 0; y < n; y++) if (zeilen[y] > zeilen[gipfel]) gipfel = y;
      // Der Schwerpunkt der Punkte um die staerkste Zeile herum — bei geneigtem
      // Kopf liegen die Pupillen nicht auf einer Zeile.
      let sy = 0;
      let sz = 0;
      for (const [, y] of dunkel) {
        if (Math.abs(y - gipfel) <= 2) {
          sy += y + 0.5;
          sz++;
        }
      }
      aus.augenzeile = Number((sy / sz).toFixed(2));
      aus._dunkel = dunkel; aus._gipfelZeile = gipfel;
    }

    // Stirnkante: die oberste Hautzeile je Spalte, dort wo Haar darueber sitzt
    // und die Stelle ueber der Augenzeile liegt. Genau das ist der Haaransatz.
    const kante = [];
    const augen = aus.augenzeile ?? gk.y0 + gk.h * 0.65;
    for (let x = gk.x0; x <= gk.x1; x++) {
      let y = -1;
      for (let yy = gk.y0; yy <= gk.y1; yy++) {
        if (gesicht[yy * n + x]) {
          y = yy;
          break;
        }
      }
      if (y < 0 || y + 0.5 >= augen) continue;
      // Sitzt Haar darueber? Zwei Punkte Luft fuer den weichen Uebergang.
      let haarDrueber = false;
      for (let d = 1; d <= 3 && y - d >= 0; d++) if (z.haar[(y - d) * n + x]) haarDrueber = true;
      if (haarDrueber) kante.push({ x, y: y + 0.5 });
    }
    // Nur die zusammenhaengende Strecke um die Gesichtsmitte — ein Haarzipfel
    // weiter aussen ist keine Stirn.
    if (kante.length) {
      const mitte = (gk.x0 + gk.x1) / 2;
      let treffer = 0;
      for (let i = 0; i < kante.length; i++) {
        if (Math.abs(kante[i].x - mitte) < Math.abs(kante[treffer].x - mitte)) treffer = i;
      }
      let von = treffer;
      let bis = treffer;
      while (von > 0 && kante[von - 1].x === kante[von].x - 1) von--;
      while (bis < kante.length - 1 && kante[bis + 1].x === kante[bis].x + 1) bis++;
      const strecke = kante.slice(von, bis + 1);
      aus.stirnbreite = Number((strecke.length / PPL).toFixed(3));
      aus.stirnwechsel = richtungswechsel(strecke.map((k) => k.y), WELLEN_SCHWELLE * PPL);
      aus._kante = strecke; aus._kanteAlle = kante;
    }

    // Augenschranke: wie weit bleibt das Haar im mittleren Drittel der
    // Gesichtsbreite ueber der Augenzeile? Negativ hiesse: es haengt darunter.
    const drittelVon = gk.x0 + gk.w / 3;
    const drittelBis = gk.x0 + (2 * gk.w) / 3;
    let tiefstes = null;
    for (let i = 0; i < n * n; i++) {
      if (!z.haar[i]) continue;
      const x = (i % n) + 0.5;
      if (x < drittelVon || x > drittelBis) continue;
      const y = ((i / n) | 0) + 0.5;
      if (tiefstes === null || y > tiefstes) tiefstes = y;
    }
    aus.haartiefe = tiefstes;
    if (tiefstes !== null && aus.augenzeile !== null) {
      aus.augenschranke = Number(((aus.augenzeile - tiefstes) / PPL).toFixed(3));
    }
  }

  // --- Kopfanteil ---------------------------------------------------------
  // Haar plus Kopfoberteil: vom Scheitel bis zum untersten Haarpunkt. Bei einer
  // Kappe, die den Schaedel umschliesst, endet dort der Kopf und faengt der Hals
  // an — das ist der Block, der bei einem Chibi die Figur beherrscht.
  const hk = kasten(z.haar, n);
  if (hk && figur) {
    aus.kopfanteil = Number(((hk.y1 - figur.y0 + 1) / figur.h).toFixed(4));
  } else {
    aus.kopfanteil = null;
  }

  return aus;
}

// ---------------------------------------------------------------------------
// Lauf
// ---------------------------------------------------------------------------

const ergebnisse = [];
/** Farbtoene der Haarflaeche ueber das ganze Blatt — fuer den Volltonbefund. */
const gesamtToene = new Map();
const gesamtPunkte = { deckend: 0, haar: 0, haut: 0, tunika: 0, unbunt: 0 };
let gesamtHaar = 0;

for (let i = 0; i < BILDER.length; i++) {
  const b = BILDER[i];
  const gross = zerlegen(felder[i].blatt);
  const klein = zerlegen(felder[i].telefon);
  const m = vermessen(gross);
  m.rauheitTelefon = rauheit(klein.haar, klein.n);
  m.haarflaecheTelefon = klein.zahl.haar - klein.splitter;
  for (const k of ['rauheitBlatt', 'rauheitTelefon', 'rauheitOhneLoecher']) {
    if (m[k] !== null) m[k] = Number(m[k].toFixed(4));
  }
  ergebnisse.push({ clip: b.clip, bild: b.bild, ...m });

  for (const k of Object.keys(gesamtPunkte)) gesamtPunkte[k] += gross.zahl[k];
  const { p } = felder[i].blatt;
  for (let k = 0; k < gross.haar.length; k++) {
    if (!gross.haar[k] || p[k * 4 + 3] !== 255) continue;
    gesamtHaar++;
    const key = (p[k * 4] << 16) | (p[k * 4 + 1] << 8) | p[k * 4 + 2];
    gesamtToene.set(key, (gesamtToene.get(key) ?? 0) + 1);
  }
}

let blattTon = null;
let blattTonZahl = 0;
for (const [key, c] of gesamtToene) {
  if (c > blattTonZahl) {
    blattTonZahl = c;
    blattTon = key;
  }
}

const spanne = (feld) => {
  const w = ergebnisse.map((e) => e[feld]).filter((v) => v !== null && v !== undefined);
  if (!w.length) return null;
  const s = [...w].sort((a, b) => a - b);
  const summe = w.reduce((a, b) => a + b, 0);
  return {
    min: Number(s[0].toFixed(4)),
    max: Number(s[s.length - 1].toFixed(4)),
    mittel: Number((summe / w.length).toFixed(4)),
    median: Number(s[s.length >> 1].toFixed(4)),
  };
};

const bericht = {
  _warum:
    'Gemessene Haarwerte je Einzelbild. Der SHA-256 gehoert zum Blatt, gegen das gemessen wurde — ' +
    'stimmt er nicht mehr, ist dieser Bericht veraltet. Erzeugt von scripts/haar-messen.mjs.',
  blatt: BLATT,
  sha256: SHA,
  manifest: manifestPfad,
  gemessen: new Date().toISOString(),
  zelle: { blatt: ZELLE, telefon: TELEFON, logisch: manifest.cell.w, ppl: PPL },
  eichung: {
    _warum:
      'Rauheit von Formen, deren Wert feststeht. Die Scheibe ist glatt und misst trotzdem ueber 1 — ' +
      'das ist der Beitrag des Punktrasters und gilt fuer jede gemessene Form gleich. Das Gesicht ' +
      '(spannen.rauheitGesicht) ist dieselbe Probe an einer gemalten glatten Form auf diesem Blatt.',
    ...EICHUNG,
  },
  farben: {
    _warum:
      'Klassengrenzen aus dem Farbtonhistogramm des Blattes, nicht geraten. gipfel = Lage der drei ' +
      'Farbtongipfel in Grad, grenzen = die Taeler dazwischen. punkte = wie viele deckende Punkte ' +
      'ueber alle 66 Einzelbilder in jede Klasse fallen.',
    gipfel: sektoren.namen,
    grenzen: sektoren.grenzen,
    punkte: gesamtPunkte,
    haarVollton: blattTon === null ? null : '#' + blattTon.toString(16).padStart(6, '0').toUpperCase(),
    haarVolltonAnteil: gesamtHaar ? Number((blattTonZahl / gesamtHaar).toFixed(5)) : null,
    haarpunkteBlatt: gesamtHaar,
    haartoeneBlatt: gesamtToene.size,
  },
  spannen: {
    rauheitBlatt: spanne('rauheitBlatt'),
    rauheitTelefon: spanne('rauheitTelefon'),
    rauheitOhneLoecher: spanne('rauheitOhneLoecher'),
    rauheitGesicht: spanne('rauheitGesicht'),
    stirnwechsel: spanne('stirnwechsel'),
    haarVorHaut: spanne('haarVorHaut'),
    volltonAnteil: spanne('volltonAnteil'),
    kopfanteil: spanne('kopfanteil'),
    figurbreite: spanne('figurbreite'),
    augenschranke: spanne('augenschranke'),
  },
  bilder: ergebnisse,
};
writeFileSync(P(ZIEL), JSON.stringify(bericht, null, 2) + '\n');

// --- Ausgabe ---------------------------------------------------------------
const z3 = (v, s = 2) => (v === null || v === undefined ? '  --  ' : v.toFixed(s).padStart(6));
console.log(`\n=== ${BLATT} ===`);
console.log(`SHA-256     ${SHA}`);
console.log(`Manifest    ${manifestPfad}`);
console.log(`Zelle       ${ZELLE} Punkte im Blatt, ${TELEFON} auf dem Telefon, ${PPL.toFixed(3)} je logischem Pixel`);
console.log(`Eichprobe   Scheibe ${EICHUNG.scheibe} (glatt)   Zackenstern ${EICHUNG.zackenstern} (rau)`);
console.log(
  `Farben      Gipfel bei Haar ${sektoren.namen.haar} Grad, Haut ${sektoren.namen.haut} Grad, ` +
    `Tunika ${sektoren.namen.tunika} Grad; Grenzen bei ${sektoren.grenzen.join(', ')} Grad`,
);
console.log(
  `            ${gesamtPunkte.deckend} deckende Punkte: ${gesamtPunkte.haar} Haar, ${gesamtPunkte.haut} Haut, ` +
    `${gesamtPunkte.tunika} Tunika, ${gesamtPunkte.unbunt} unbunt (Augenweiss, Pupille, Glanz)`,
);
console.log(
  `Vollton     ${bericht.farben.haarVollton} in ${(bericht.farben.haarVolltonAnteil * 100).toFixed(2)} % der ` +
    `${gesamtHaar} Haarpunkte; ${gesamtToene.size} verschiedene Toene`,
);

const zeile = (name, zahl, spalten) =>
  name.padEnd(12) + String(zahl).padStart(6) + spalten.map((s) => String(s).padStart(10)).join('');

console.log('\n--- je Ablauf (Mittel ueber die Bilder) ---');
console.log(
  zeile('Ablauf', 'Bilder', [
    'RauhBlatt', 'RauhTel', 'RauhGes', 'Stirn', 'vorHaut', 'Vollton%', 'Kopf%', 'Breite', 'Schranke',
  ]),
);
for (const clip of Object.keys(manifest.clips)) {
  const e = ergebnisse.filter((r) => r.clip === clip);
  const m = (f, faktor = 1) => {
    const w = e.map((r) => r[f]).filter((v) => v !== null && v !== undefined);
    return w.length ? (w.reduce((a, b) => a + b, 0) / w.length) * faktor : null;
  };
  console.log(
    zeile(clip, e.length, [
      z3(m('rauheitBlatt'), 3),
      z3(m('rauheitTelefon'), 3),
      z3(m('rauheitGesicht'), 3),
      z3(m('stirnwechsel'), 1),
      z3(m('haarVorHaut'), 1),
      z3(m('volltonAnteil', 100), 2),
      z3(m('kopfanteil', 100), 1),
      z3(m('figurbreite'), 2),
      z3(m('augenschranke'), 2),
    ]),
  );
}

console.log('\n--- Spannen ueber alle Bilder ---');
for (const [k, v] of Object.entries(bericht.spannen)) {
  if (!v) continue;
  console.log(`${k.padEnd(19)} ${z3(v.min, 3)} bis ${z3(v.max, 3)}   Mittel ${z3(v.mittel, 3)}`);
}
const splitterGesamt = ergebnisse.reduce((s, e) => s + e.haarsplitter, 0);
const brauenGesamt = ergebnisse.reduce((s, e) => s + e.splitterVorHaut, 0);
console.log(
  `\nSplitter         ${splitterGesamt} blaue Punkte in kleinen Inseln, davon ${brauenGesamt} im Hautumriss ` +
    `(die Augenbrauen — deshalb zaehlen sie nicht als Haarflaeche)`,
);
console.log(`\nGeschrieben: ${ZIEL}`);

// ===========================================================================
// ANHANG 3: Gemessene Augenzeile gegen die UNABHAENGIGE Landmarke aus dem
// Manifest (aus dem 3D-Modell projiziert, kennt die Bildpunkte nicht).
// ===========================================================================
console.log('\n=== Augenzeile gemessen vs. Manifest-Landmarke "anchors" ===');
console.log('anchors/stirn stehen in logischen Pixeln; * PPL gibt Blattzeilen.');
console.log('Bild            augenzeile  anchors*PPL   Abw.  | Stirnkante  stirn*PPL   Abw. | haartiefe');
const abwA = [];
const abwS = [];
for (let i = 0; i < BILDER.length; i++) {
  const b = BILDER[i];
  const def = manifest.clips[b.clip];
  const z = zerlegen(felder[i].blatt);
  const m = vermessen(z);
  const anker = def.anchors?.[b.bild];
  const st = def.stirn?.[b.bild];
  const ankerY = anker ? anker[1] * PPL : null;
  const stirnY = st ? st[1] * PPL : null;
  const kanteY = m._kante?.length ? m._kante.reduce((a, k) => a + k.y, 0) / m._kante.length : null;
  const dA = m.augenzeile !== null && ankerY !== null ? m.augenzeile - ankerY : null;
  const dS = kanteY !== null && stirnY !== null ? kanteY - stirnY : null;
  if (dA !== null) abwA.push(dA);
  if (dS !== null) abwS.push(dS);
  const f = (v, k = 2) => (v === null ? '   --  ' : v.toFixed(k).padStart(7));
  console.log(
    `${(b.clip + '[' + b.bild + ']').padEnd(14)}${f(m.augenzeile)}${f(ankerY)}${f(dA)}  |` +
      `${f(kanteY)}${f(stirnY)}${f(dS)} |${f(m.haartiefe)}`,
  );
}
const stat = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const mit = a.reduce((x, y) => x + y, 0) / a.length;
  const sd = Math.sqrt(a.reduce((x, y) => x + (y - mit) ** 2, 0) / a.length);
  return `n=${a.length} Mittel ${mit.toFixed(3)} SD ${sd.toFixed(3)} min ${s[0].toFixed(2)} max ${s[s.length - 1].toFixed(2)} |max| ${Math.max(...a.map(Math.abs)).toFixed(2)}`;
};
console.log('\nAbweichung Augenzeile - anchors*PPL (Blattpunkte): ' + stat(abwA));
console.log('Abweichung Stirnkante - stirn*PPL   (Blattpunkte): ' + stat(abwS));
console.log(`(1 logischer Pixel = ${PPL.toFixed(3)} Blattpunkte)`);
