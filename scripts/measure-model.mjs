/**
 * Vermisst das 3D-Ankermodell und leitet daraus das Zellmass her.
 *
 * Warum überhaupt messen: Das 2D-Ankerbild und das daraus erzeugte 3D-Modell
 * sind nicht dasselbe Ding. Bild-zu-3D zieht eine gemalte Silhouette in ein
 * plausibles Volumen und macht dabei aus einer weit wehenden Mähne regelmässig
 * eine kompaktere Masse. Welche von beiden Grössen gilt, darf nicht geschätzt
 * werden — sonst ist die Sprite-Zelle entweder zu klein (Haar wird beschnitten)
 * oder unnötig gross (jedes Bild trägt leere Ränder mit).
 *
 * Gemessen wird nicht an der Geometrie, sondern am *Bild*: Das Modell wird
 * orthografisch von der Seite und von vorn gerendert, und die Pixel werden
 * über ihren Farbton in Haar, Haut und Anzug getrennt. Das ist genau die
 * Trennung, die im Spiel zählt — die Mähne ist das, was rot aussieht, nicht
 * das, was am Kopfgelenk hängt.
 *
 *   node scripts/measure-model.mjs [pfad.glb]
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const GLB = process.argv[2] ?? 'art-src/wuselwerker-v4.glb';
const OUT = 'art-src/ansichten';
const PORT = 4327;
const RES = 512;

if (!existsSync(GLB)) throw new Error(`Kein Modell unter ${GLB}`);
mkdirSync(OUT, { recursive: true });

// Das Zellmass wird nicht abgeschrieben, sondern aus dem Code gelesen — sonst
// prüft dieses Werkzeug irgendwann gegen Zahlen, die nicht mehr gelten.
const atlasSrc = readFileSync('src/render/atlas.ts', 'utf8');
const konstante = (name) => Number(atlasSrc.match(new RegExp(`${name} = (\\d+)`))[1]);
const CELL = {
  w: konstante('CELL_W'),
  h: konstante('CELL_H'),
  ax: konstante('ANCHOR_X'),
  ay: konstante('ANCHOR_Y'),
};

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.glb': 'model/gltf-binary',
};

const PAGE = `<!doctype html><meta charset="utf-8">
<script type="importmap">
{"imports":{"three":"/node_modules/three/build/three.module.js",
            "three/addons/":"/node_modules/three/examples/jsm/"}}
</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

window.__ready = (async () => {
  const gltf = await new GLTFLoader().loadAsync('/model.glb');
  const root = gltf.scene;

  // --- Haar von Körper trennen ---------------------------------------------
  // Farbe im *Bild* trennt die beiden nicht: Der Glanz auf den Haarspitzen ist
  // von Haut nicht zu unterscheiden, sobald Licht darauf liegt. In der
  // *Textur* dagegen schon, weil dort kein Licht drin ist. Also wird jedes
  // Dreieck einmal an seinem Schwerpunkt in der Textur abgetastet und
  // einsortiert; danach lassen sich beide Teile getrennt rendern.
  let mesh = null;
  root.traverse((o) => { if (o.isMesh && !mesh) mesh = o; });
  const tex = mesh.material.map.image;
  const tc = document.createElement('canvas');
  tc.width = tex.width; tc.height = tex.height;
  const tx = tc.getContext('2d', { willReadFrequently: true });
  tx.drawImage(tex, 0, 0);
  const td = tx.getImageData(0, 0, tc.width, tc.height).data;

  const geo = mesh.geometry;
  const idx = geo.index.array;
  const uv = geo.attributes.uv.array;
  const körper = [];
  const haar = [];
  for (let t = 0; t < idx.length; t += 3) {
    let u = 0, v = 0;
    for (let k = 0; k < 3; k++) { u += uv[idx[t + k] * 2]; v += uv[idx[t + k] * 2 + 1]; }
    const px = Math.min(tc.width - 1, Math.max(0, Math.round((u / 3) * tc.width)));
    // glTF zählt V von oben — nicht spiegeln. Deshalb steht auch flipY der
    // Textur auf false; wer hier 1-v rechnet, tastet die falsche Zeile ab.
    const py = Math.min(tc.height - 1, Math.max(0, Math.round((v / 3) * tc.height)));
    const o = (py * tc.width + px) * 4;
    const r = td[o], g = td[o + 1], b = td[o + 2];
    // Rot heisst Haar. In der unbeleuchteten Textur ist das eindeutig.
    (r > 70 && g < r * 0.55 && b < r * 0.55 ? haar : körper).push(idx[t], idx[t + 1], idx[t + 2]);
  }
  const alle = geo.index.clone();
  window.__teil = (welches) => {
    const list = welches === 'haar' ? haar : welches === 'körper' ? körper : null;
    if (!list) { geo.setIndex(alle); return; }
    geo.setIndex(new THREE.BufferAttribute(new Uint32Array(list), 1));
  };
  window.__anteil = { haar: haar.length / 3, körper: körper.length / 3 };

  // Bindepose, kein Umrechnen: Der Renderer soll genau das zeigen, was im
  // Modell steht, sonst misst man die eigene Korrektur mit.
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const mid = box.getCenter(new THREE.Vector3());

  const scene = new THREE.Scene();
  scene.add(root);
  // Flaches, gleichmässiges Licht — es wird die Fläche vermessen, nicht die
  // Plastizität. Schatten würden Farbtöne verfälschen und Pixel umklassieren.
  scene.add(new THREE.AmbientLight(0xffffff, 2.6));

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setSize(${RES}, ${RES}, false);
  renderer.setClearColor(0x000000, 0);

  const span = Math.max(size.x, size.y, size.z) * 1.08;
  const cam = new THREE.OrthographicCamera(-span / 2, span / 2, span / 2, -span / 2, 0.01, 100);

  window.__meta = { size: size.toArray(), min: box.min.toArray(), max: box.max.toArray(), span };

  window.__shot = (yaw) => {
    root.rotation.y = yaw;
    cam.position.set(0, mid.y, span * 2);
    cam.lookAt(0, mid.y, 0);
    renderer.render(scene, cam);
    return renderer.domElement.toDataURL('image/png');
  };
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
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 640, height: 640 } });
const problems = [];
page.on('pageerror', (e) => problems.push(String(e)));
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready, null, { timeout: 60000 });

const meta = await page.evaluate(() => window.__meta);
const VIEWS = [
  ['vorn', 0],
  ['seite', Math.PI / 2],
  ['hinten', Math.PI],
  ['seite-links', -Math.PI / 2],
];

/** Umriss eines Teilrenders: Kasten über alle deckenden Pixel. */
const bbox = async (dataUrl) =>
  page.evaluate(async (u) => {
    const img = new Image();
    img.src = u;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    const b = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9, n: 0 };
    for (let py = 0; py < c.height; py++) {
      for (let px = 0; px < c.width; px++) {
        if (d[(py * c.width + px) * 4 + 3] < 128) continue;
        b.x0 = Math.min(b.x0, px);
        b.x1 = Math.max(b.x1, px);
        b.y0 = Math.min(b.y0, py);
        b.y1 = Math.max(b.y1, py);
        b.n++;
      }
    }
    return b;
  }, dataUrl);

const anteil = await page.evaluate(() => window.__anteil);
const results = {};
for (const [name, yaw] of VIEWS) {
  const boxes = {};
  for (const teil of ['alle', 'körper', 'haar']) {
    await page.evaluate((t) => window.__teil(t), teil);
    const shot = await page.evaluate((y) => window.__shot(y), yaw);
    if (teil !== 'alle' || name === 'seite') {
      writeFileSync(
        join(OUT, teil === 'alle' ? `${name}.png` : `${name}-${teil}.png`),
        Buffer.from(shot.split(',')[1], 'base64'),
      );
    }
    boxes[teil] = await bbox(shot);
  }
  results[name] = { boxes };
}

await browser.close();
server.close();
if (problems.length) console.error(problems.join('\n'));

// --- Auswertung -------------------------------------------------------------
const z = (v) => v.toFixed(1);
console.log(`Modell    ${GLB}`);
console.log(`Rohmass   ${meta.size.map((v) => v.toFixed(3)).join(' × ')} (x × y × z)`);
console.log(`Dreiecke  ${anteil.körper} Körper, ${anteil.haar} Haar`);
console.log('');

let maxOben = 0;
let maxSeite = 0;
for (const [name] of VIEWS) {
  const { körper, haar } = results[name].boxes;
  // Bezugsstrecke: Sohle bis Scheitel, beides am Körper ohne Haar gemessen.
  // Genau diese Strecke ist im Spiel WUSEL_H = 12 logische Pixel.
  const koerperPx = körper.y1 - körper.y0;
  const proPixel = 12 / koerperPx;
  const mitteX = (körper.x0 + körper.x1) / 2;

  const oben = (körper.y0 - haar.y0) * proPixel;
  const hinten = (mitteX - haar.x0) * proPixel;
  const vorn = (haar.x1 - mitteX) * proPixel;
  const unten = (haar.y1 - körper.y0) * proPixel;

  maxOben = Math.max(maxOben, oben);
  maxSeite = Math.max(maxSeite, hinten, vorn);

  console.log(`${name} — Massstab ${koerperPx} Bildpixel = 12 logische`);
  console.log(`  Kopf breit             ${z((körper.x1 - körper.x0) * proPixel)}`);
  console.log(`  Haar über dem Scheitel ${z(oben)}`);
  console.log(`  Haar neben der Mitte   ${z(hinten)} / ${z(vorn)}`);
  console.log(`  Haar reicht herab bis  ${z(unten)} unter den Scheitel`);
}

console.log('');
const nötigOben = Math.ceil(12 + maxOben) + 2;
const nötigSeite = Math.ceil(maxSeite) + 2;
console.log(`Grösster Überstand: ${z(maxOben)} über dem Scheitel, ${z(maxSeite)} neben der Mitte`);
console.log(`Daraus nötig: ${nötigOben} Zeilen über dem Fusspunkt, ${nötigSeite} Spalten je Seite`);
console.log('(je 1 px Umriss und 1 px Nachschwung sind in den +2 enthalten)');
console.log(`Zelle im Code: ${CELL.w} × ${CELL.h}, Fusspunkt (${CELL.ax}, ${CELL.ay})`);
const passt = CELL.ay >= nötigOben && CELL.ax >= nötigSeite && CELL.w - CELL.ax >= nötigSeite;
console.log(passt ? '→ Die Zelle trägt das Modell.' : '→ ZU KLEIN für das Modell.');
console.log(`Ansichten in ${OUT}/`);
if (!passt) process.exit(1);
