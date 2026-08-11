/**
 * Backt das Sprite-Blatt aus dem Ankermodell.
 *
 * Weg: Modell laden → in jede Pose aus `art-src/posen/` stellen → orthografisch
 * rendern → auf Zellgrösse verkleinern → auf die Palette einrasten → Umriss
 * ziehen → alle Bilder zu einem Blatt setzen → `src/art/wusel.png` schreiben.
 *
 * Die drei Entscheidungen, die das Ergebnis tragen:
 *
 * 1. **Der Massstab kommt aus dem Modell, nicht aus einer Zahl.** Die Höhe der
 *    Figur ohne Haar ist im Spiel `WUSEL_H = 12`. Der Backweg misst diese Höhe
 *    an der Geometrie und stellt die Kamera danach. Ein anderes Modell braucht
 *    deshalb keine Handarbeit.
 * 2. **Gerendert wird überabgetastet und dann mit Mehrheitsentscheid
 *    verkleinert.** Ein Mittelwert würde bei 6 × 6 Bildpunkten je Zelle
 *    Zwischentöne erzeugen, die es in der Palette nicht gibt; die Mehrheit
 *    erhält Flächen und harte Kanten.
 * 3. **Die Farbe wird zweistufig eingerastet**: erst die Fläche (Haar, Haut,
 *    Anzug) über das Kanalverhältnis, dann die Helligkeitsstufe darin. So
 *    entsteht die Dreierrampe aus `grafik-katalog.md` §3.2, statt dass die
 *    Beleuchtung beliebige Töne einstreut.
 *
 *   node scripts/bake-atlas.mjs [--clip walking] [--blick 30]
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { pathToFileURL } from 'node:url';

const GLB = 'art-src/wuselwerker-v4.glb';
const POSEN = 'art-src/posen';
const ZIEL = 'src/art';
const SS = 6; // Überabtastung je Achse

const args = process.argv.slice(2);
const nurClip = args.includes('--clip') ? args[args.indexOf('--clip') + 1] : null;

/**
 * Blickwinkel der Kamera in Grad, 0 = strenges Profil.
 *
 * Nicht 0, und das ist eine Abkehr vom alten Kanon. Im strengen Profil ist von
 * dieser Figur fast nichts zu sehen: Der Hinterkopf ist im Modell vollständig
 * Haar, sichtbar bleibt ein Gesichtsstreifen von zwei Pixeln, und der Rumpf
 * misst in der Tiefe ebenfalls zwei. Übrig bliebe eine rote Masse auf einem
 * türkisen Strich. Leicht gedreht zeigt die Figur Gesicht und Rumpfbreite —
 * genau das, was das Ankerbild ausmacht. Die Laufrichtung bleibt eindeutig,
 * und die Spiegelung ergibt sauber die andere Dreiviertelansicht.
 */
const BLICK = args.includes('--blick') ? Number(args[args.indexOf('--blick') + 1]) : 30;

// --- Vertrag aus dem Code lesen ---------------------------------------------
// Zellmass und Bildzahlen stehen in src/render/atlas.ts. Sie hier noch einmal
// hinzuschreiben hiesse, zwei Wahrheiten zu pflegen.
const atlasSrc = readFileSync('src/render/atlas.ts', 'utf8');
const zahl = (name) => Number(atlasSrc.match(new RegExp(`${name} = (\\d+)`))[1]);
const CELL_W = zahl('CELL_W');
const CELL_H = zahl('CELL_H');
const ANCHOR_X = zahl('ANCHOR_X');
const ANCHOR_Y = zahl('ANCHOR_Y');

const manifestBlock = atlasSrc.slice(atlasSrc.indexOf('clips: {'));
const CLIPS = [];
for (const m of manifestBlock.matchAll(
  /(\w+): \{ row: (\d+), holds: \[([\d, ]+)\](, once: true)? \}/g,
)) {
  CLIPS.push({
    name: m[1],
    row: Number(m[2]),
    frames: m[3].split(',').length,
    once: Boolean(m[4]),
    holds: m[3].split(',').map((s) => Number(s.trim())),
  });
}
if (CLIPS.length !== 12) throw new Error(`12 Clips erwartet, ${CLIPS.length} gelesen`);
const SPALTEN = Math.max(...CLIPS.map((c) => c.frames));

// --- Palette ----------------------------------------------------------------
// Dieselben Werte wie im prozeduralen Zeichner und im Katalog §3.2.
const PALETTE = {
  haar: ['#ff8f5e', '#e5372c', '#8f1d1c'],
  haut: ['#fff0d2', '#f4d7ac', '#bd9e74'],
  anzug: ['#57e2d0', '#2fc9b8', '#1d8f85'],
};
const UMRISS = '#0c1119';

// --- Posen einsammeln -------------------------------------------------------
const posen = {};
if (existsSync(POSEN)) {
  for (const f of readdirSync(POSEN).filter((f) => f.endsWith('.mjs'))) {
    const mod = (await import(pathToFileURL(join(process.cwd(), POSEN, f)).href)).default;
    posen[mod.clip] = mod;
  }
}

/** Alle Bilder als reine Daten — die Posenfunktionen laufen hier, nicht im Browser. */
const auftrag = [];
for (const c of CLIPS) {
  if (nurClip && c.name !== nurClip) continue;
  const mod = posen[c.name];
  if (mod && mod.frames !== c.frames) {
    throw new Error(`${c.name}: Posendatei hat ${mod.frames} Bilder, der Vertrag ${c.frames}`);
  }
  for (let i = 0; i < c.frames; i++) {
    const roh = mod ? mod.pose(i, i / c.frames) : {};
    const versatz = roh._versatz ?? [0, 0];
    const dreh = { ...roh };
    delete dreh._versatz;
    auftrag.push({ clip: c.name, row: c.row, frame: i, dreh, versatz, gestellt: Boolean(mod) });
  }
}
const ohnePose = CLIPS.filter((c) => !posen[c.name]).map((c) => c.name);

// --- Seite ------------------------------------------------------------------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

const PAGE = `<!doctype html><meta charset="utf-8">
<script type="importmap">
{"imports":{"three":"/node_modules/three/build/three.module.js",
            "three/addons/":"/node_modules/three/examples/jsm/"}}
</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const CELL_W = ${CELL_W}, CELL_H = ${CELL_H};
const ANCHOR_X = ${ANCHOR_X}, ANCHOR_Y = ${ANCHOR_Y};
const SS = ${SS};
const BLICK = ${BLICK} * Math.PI / 180;
const PALETTE = ${JSON.stringify(PALETTE)};
const UMRISS = '${UMRISS}';

const hex = (h) => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
const RAMPEN = Object.fromEntries(Object.entries(PALETTE).map(([k,v]) => [k, v.map(hex)]));
const UMRISS_RGB = hex(UMRISS);

window.__ready = (async () => {
  const gltf = await new GLTFLoader().loadAsync('/model.glb');
  const root = gltf.scene;
  root.updateMatrixWorld(true);

  let mesh = null;
  root.traverse((o) => { if (o.isMesh && !mesh) mesh = o; });

  // --- Körperhöhe bestimmen ------------------------------------------------
  // Nur der Körper zählt, nicht das Haar: WUSEL_H = 12 misst Sohle bis
  // Scheitel. Die Trennung läuft über die Textur, weil im beleuchteten Bild
  // Haarglanz und Haut nicht zu unterscheiden sind.
  const tex = mesh.material.map.image;
  const tc = document.createElement('canvas');
  tc.width = tex.width; tc.height = tex.height;
  const tctx = tc.getContext('2d', { willReadFrequently: true });
  tctx.drawImage(tex, 0, 0);
  const td = tctx.getImageData(0, 0, tc.width, tc.height).data;

  const geo = mesh.geometry;
  const idx = geo.index.array;
  const uv = geo.attributes.uv.array;
  const pos = geo.attributes.position.array;
  const istHaar = (v) => {
    const px = Math.min(tc.width-1, Math.max(0, Math.round(uv[v*2] * tc.width)));
    const py = Math.min(tc.height-1, Math.max(0, Math.round(uv[v*2+1] * tc.height)));
    const o = (py * tc.width + px) * 4;
    const r = td[o], g = td[o+1], b = td[o+2];
    return r > 70 && g < r * 0.55 && b < r * 0.55;
  };
  let minY = 1e9, maxY = -1e9, fussZ0 = 1e9, fussZ1 = -1e9;
  const körperV = new Set();
  for (let t = 0; t < idx.length; t += 3) {
    if (istHaar(idx[t]) && istHaar(idx[t+1]) && istHaar(idx[t+2])) continue;
    for (let k = 0; k < 3; k++) körperV.add(idx[t+k]);
  }
  for (const v of körperV) {
    minY = Math.min(minY, pos[v*3+1]); maxY = Math.max(maxY, pos[v*3+1]);
  }
  const höhe = maxY - minY;
  // Fussmitte in der Tiefe: nur das unterste Sechstel der Figur zählt.
  for (const v of körperV) {
    if (pos[v*3+1] > minY + höhe/6) continue;
    fussZ0 = Math.min(fussZ0, pos[v*3+2]); fussZ1 = Math.max(fussZ1, pos[v*3+2]);
  }
  const einheit = höhe / 12;                 // Weltmass eines logischen Pixels
  const mitteZ = (fussZ0 + fussZ1) / 2;

  // --- Kamera --------------------------------------------------------------
  // Von der Seite, damit die Figur nach rechts schaut. Sie blickt in ihr
  // eigenes +Z; eine Kamera bei −X bildet das auf "rechts im Bild" ab.
  const halb = (CELL_H / 2) * einheit;
  const cam = new THREE.OrthographicCamera(-halb, halb, halb, -halb, 0.01, 100);
  const kamY = minY + (CELL_H / 2 - (CELL_H - ANCHOR_Y)) * einheit;
  cam.up.set(0, 1, 0);

  const scene = new THREE.Scene();
  scene.add(root);
  scene.add(new THREE.AmbientLight(0xffffff, 2.3));
  // Schlüssellicht von vorn oben. Es darf nicht von der Seite kommen: Der
  // Renderer spiegelt die Figur, und ein seitliches Licht wäre bei jeder
  // zweiten Figur auf der falschen Seite (grafik-katalog.md §2.7).
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(0, 3, 2);
  scene.add(key);

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setSize(CELL_W * SS, CELL_H * SS, false);
  renderer.setClearColor(0x000000, 0);

  // --- Skelett -------------------------------------------------------------
  const knochen = {};
  const bind = {};
  root.traverse((o) => {
    if (!o.isBone) return;
    knochen[o.name] = o;
    bind[o.name] = o.quaternion.clone();
  });

  const heim = root.position.clone();
  const _q = new THREE.Quaternion(), _p = new THREE.Quaternion(), _i = new THREE.Quaternion();
  /**
   * Setzt eine Pose. Die Winkel gelten in *Weltachsen*: Ein Rig benennt seine
   * Knochenachsen beliebig, und dieselbe lokale Achse bedeutet an Schulter und
   * Hüfte Verschiedenes. Umgerechnet wird mit q' = Rp⁻¹ · Qwelt · Rp · qBind,
   * wobei Rp die Weltdrehung des Elternknochens ist. Deshalb muss von der
   * Wurzel zu den Spitzen gearbeitet werden — der Elternwert muss stehen.
   */
  const stellen = (dreh) => {
    for (const [name, b] of Object.entries(knochen)) b.quaternion.copy(bind[name]);
    root.updateMatrixWorld(true);
    const namen = Object.keys(dreh).sort(
      (a, b) => tiefe(knochen[a]) - tiefe(knochen[b]),
    );
    for (const name of namen) {
      const b = knochen[name];
      if (!b) { window.__fehlend = (window.__fehlend ?? []).concat(name); continue; }
      const [rx, ry, rz] = dreh[name];
      _q.setFromEuler(new THREE.Euler(rx*Math.PI/180, ry*Math.PI/180, rz*Math.PI/180, 'XYZ'));
      b.parent.getWorldQuaternion(_p);
      _i.copy(_p).invert();
      b.quaternion.copy(_i).multiply(_q).multiply(_p).multiply(bind[name]);
      root.updateMatrixWorld(true);
    }
  };
  const tiefe = (b) => { let n = 0, o = b; while (o) { n++; o = o.parent; } return n; };

  // --- Farbe einrasten ------------------------------------------------------
  const familie = (r, g, b) => {
    if (r < 40 && g < 40 && b < 40) return null;
    if (g > r + 12) return 'anzug';
    const gr = g / Math.max(1, r), br = b / Math.max(1, r);
    if (gr < 0.52 && br < 0.42) return 'haar';
    return 'haut';
  };
  // Die Schwellen werden aus der Palette gerechnet, nicht gesetzt: Sie liegen
  // bei 122 % und 70 % der Helligkeit des jeweiligen Grundtons. Feste Zahlen
  // würden bei Rot (Grundton-Helligkeit 91) und Haut (218) dasselbe bedeuten
  // und eine der beiden Rampen flachlegen.
  const lum = ([r,g,b]) => 0.2126*r + 0.7152*g + 0.0722*b;
  const SCHWELLE = Object.fromEntries(
    Object.entries(RAMPEN).map(([k, ramp]) => [k, [lum(ramp[1]) * 1.22, lum(ramp[1]) * 0.7]]),
  );
  const stufe = (r, g, b, fam) => {
    const l = 0.2126*r + 0.7152*g + 0.0722*b;
    const s = SCHWELLE[fam];
    return l >= s[0] ? 0 : l >= s[1] ? 1 : 2;
  };

  window.__bake = (auftrag) => {
    const out = document.createElement('canvas');
    out.width = CELL_W * SS; out.height = CELL_H * SS;
    const octx = out.getContext('2d', { willReadFrequently: true });

    stellen(auftrag.dreh);
    // Der Versatz bewegt die Figur, nicht die Kamera. Sonst müsste er in die
    // Kameraachsen umgerechnet werden und hinge am Blickwinkel.
    const [vx, vy] = auftrag.versatz;
    root.position.set(heim.x, heim.y + vy * einheit, heim.z + vx * einheit);
    root.updateMatrixWorld(true);

    const R = 10;
    cam.position.set(-Math.cos(BLICK) * R, kamY, mitteZ + Math.sin(BLICK) * R);
    cam.lookAt(0, kamY, mitteZ);
    renderer.render(scene, cam);

    octx.clearRect(0, 0, out.width, out.height);
    octx.drawImage(renderer.domElement, 0, 0);
    const d = octx.getImageData(0, 0, out.width, out.height).data;

    // Verkleinern mit Mehrheitsentscheid je Block.
    const zelle = new Array(CELL_W * CELL_H).fill(null);
    for (let cy = 0; cy < CELL_H; cy++) {
      for (let cx = 0; cx < CELL_W; cx++) {
        const zähler = new Map();
        let deckung = 0;
        for (let sy = 0; sy < SS; sy++) {
          for (let sx = 0; sx < SS; sx++) {
            const o = (((cy*SS + sy) * out.width) + (cx*SS + sx)) * 4;
            if (d[o+3] < 128) continue;
            deckung++;
            const fam = familie(d[o], d[o+1], d[o+2]);
            if (!fam) continue;
            const k = fam + stufe(d[o], d[o+1], d[o+2], fam);
            zähler.set(k, (zähler.get(k) ?? 0) + 1);
          }
        }
        if (deckung < SS * SS * 0.42) continue;
        let best = null, n = -1;
        for (const [k, v] of zähler) if (v > n) { n = v; best = k; }
        if (best) zelle[cy*CELL_W + cx] = best;
      }
    }

    // Umriss nach aussen, aber nicht unter den Fusspunkt — dort steht der
    // Boden, und ein Pixel darunter würde die Figur schweben lassen.
    const umriss = new Set();
    for (let y = 0; y < CELL_H; y++) {
      for (let x = 0; x < CELL_W; x++) {
        if (zelle[y*CELL_W + x]) continue;
        if (y >= ANCHOR_Y) continue;
        const nach = [[1,0],[-1,0],[0,1],[0,-1]];
        if (nach.some(([dx,dy]) => {
          const nx = x+dx, ny = y+dy;
          return nx>=0 && nx<CELL_W && ny>=0 && ny<CELL_H && zelle[ny*CELL_W+nx];
        })) umriss.add(y*CELL_W + x);
      }
    }

    const klein = document.createElement('canvas');
    klein.width = CELL_W; klein.height = CELL_H;
    const kctx = klein.getContext('2d');
    const img = kctx.createImageData(CELL_W, CELL_H);
    let belegt = 0;
    for (let i = 0; i < CELL_W * CELL_H; i++) {
      let rgb = null;
      if (zelle[i]) {
        const fam = zelle[i].slice(0, -1);
        rgb = RAMPEN[fam][Number(zelle[i].slice(-1))];
        belegt++;
      } else if (umriss.has(i)) {
        rgb = UMRISS_RGB;
      }
      if (!rgb) continue;
      img.data[i*4] = rgb[0]; img.data[i*4+1] = rgb[1];
      img.data[i*4+2] = rgb[2]; img.data[i*4+3] = 255;
    }
    kctx.putImageData(img, 0, 0);
    return { png: klein.toDataURL('image/png'), belegt };
  };

  window.__masse = { höhe, einheit, minY, mitteZ, knochen: Object.keys(knochen).length };
  return true;
})();
</script>`;

const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (url === '/') {
    res.writeHead(200, { 'content-type': TYPES['.html'] });
    return res.end(PAGE);
  }
  const file = url === '/model.glb' ? GLB : normalize(join('.', url));
  if (!existsSync(file)) {
    res.writeHead(404);
    return res.end('weg');
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
// Freien Port nehmen lassen: Der Backweg läuft je Zustand einzeln und dabei
// oft mehrfach gleichzeitig. Eine feste Nummer würde sich selbst blockieren.
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 400, height: 400 } });
const probleme = [];
page.on('pageerror', (e) => probleme.push(String(e)));
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready, null, { timeout: 60000 });
const masse = await page.evaluate(() => window.__masse);

// --- Alle Bilder backen und zum Blatt setzen --------------------------------
const bilder = [];
for (const a of auftrag) {
  const r = await page.evaluate((x) => window.__bake(x), a);
  bilder.push({ ...a, ...r });
}
const fehlend = await page.evaluate(() => window.__fehlend ?? []);

const { blatt, gross } = await page.evaluate(
  async ([bilder, cw, ch, spalten, zeilen, einzeln]) => {
    const c = document.createElement('canvas');
    c.width = cw * spalten;
    c.height = ch * zeilen;
    const x = c.getContext('2d');
    for (const b of bilder) {
      const img = new Image();
      img.src = b.png;
      await img.decode();
      x.drawImage(img, b.frame * cw, b.row * ch);
    }
    const blatt = c.toDataURL('image/png');
    if (!einzeln) return { blatt, gross: null };

    // Kontrollbild: nur die Zeile dieses Zustands, zehnfach, auf neutralem
    // Grund. Ein Blatt in Originalgrösse kann kein Mensch beurteilen.
    const S = 10;
    const zeile = bilder[0].row;
    const g = document.createElement('canvas');
    g.width = cw * spalten * S;
    g.height = ch * S;
    const gx = g.getContext('2d');
    gx.fillStyle = '#2a2018';
    gx.fillRect(0, 0, g.width, g.height);
    gx.imageSmoothingEnabled = false;
    gx.drawImage(c, 0, zeile * ch, cw * spalten, ch, 0, 0, g.width, g.height);
    return { blatt, gross: g.toDataURL('image/png') };
  },
  [bilder, CELL_W, CELL_H, SPALTEN, CLIPS.length, Boolean(nurClip)],
);

await browser.close();
server.close();
if (probleme.length) {
  console.error(probleme.join('\n'));
  process.exit(1);
}

mkdirSync(ZIEL, { recursive: true });
const png = Buffer.from(blatt.split(',')[1], 'base64');
if (!nurClip) {
  writeFileSync(join(ZIEL, 'wusel.png'), png);
  const manifest = {
    version: 1,
    cell: { w: CELL_W, h: CELL_H },
    anchor: { x: ANCHOR_X, y: ANCHOR_Y },
    facing: 'right',
    clips: Object.fromEntries(
      CLIPS.map((c) => [c.name, { row: c.row, holds: c.holds, ...(c.once ? { once: true } : {}) }]),
    ),
  };
  writeFileSync(join(ZIEL, 'wusel.atlas.json'), `${JSON.stringify(manifest, null, 2)}\n`);
} else {
  mkdirSync('art-src/proben', { recursive: true });
  writeFileSync(join('art-src/proben', `${nurClip}.png`), png);
  if (gross) {
    writeFileSync(join('art-src/proben', `${nurClip}-gross.png`), Buffer.from(gross.split(',')[1], 'base64'));
  }
}

// --- Bericht ----------------------------------------------------------------
const leer = bilder.filter((b) => b.belegt < 12);
console.log(`Modell    Körperhöhe ${masse.höhe.toFixed(3)}, ${masse.knochen} Knochen`);
console.log(`Zelle     ${CELL_W} × ${CELL_H}, Fusspunkt (${ANCHOR_X}, ${ANCHOR_Y})`);
console.log(`Blatt     ${CELL_W * SPALTEN} × ${CELL_H * CLIPS.length}, ${bilder.length} Bilder, ${Math.round(png.length / 1024)} kB`);
console.log(`Deckung   ${Math.min(...bilder.map((b) => b.belegt))} bis ${Math.max(...bilder.map((b) => b.belegt))} Pixel je Bild`);
if (ohnePose.length && !nurClip) console.log(`Ohne Pose ${ohnePose.join(', ')} — stehen in der Bindepose`);
if (fehlend.length) console.log(`WARNUNG   unbekannte Gelenke: ${[...new Set(fehlend)].join(', ')}`);
if (leer.length) {
  console.error(`FEHLER    ${leer.length} Bilder fast leer: ${leer.map((b) => `${b.clip}#${b.frame}`).join(', ')}`);
  process.exit(1);
}
console.log(
  nurClip
    ? `art-src/proben/${nurClip}.png und ${nurClip}-gross.png (10×, zum Anschauen)`
    : `${ZIEL}/wusel.png + wusel.atlas.json`,
);
