/**
 * Sieht in ein geliefertes Modell hinein: Skelett, Knochennamen, Animationen,
 * Masse, Werkstoffe.
 *
 * ## Wofuer
 *
 * Bevor irgendetwas gebacken wird, muss feststehen, **womit** gebacken wird. Ein
 * Rig laesst sich nicht raten: Ob ein Knochen `Tail_01` oder `Schwanz1` heisst,
 * ob er ueberhaupt existiert, ob das Modell schon Animationen mitbringt oder nur
 * eine Ruhelage — davon haengt der ganze weitere Weg ab. Bei der Murmel stand
 * das in einer mitgelieferten Datei; hier steht es nirgends, also wird gemessen.
 *
 * Ausgegeben wird ausserdem ein Kontrollbild aus vier Richtungen. Zahlen sagen,
 * ob ein Knochen da ist; nur ein Bild sagt, ob er dort sitzt, wo sein Name
 * behauptet.
 *
 * Aufruf: `node scripts/modell-pruefen.mjs <datei.glb> [--name probe]`
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { extname } from 'node:path';

const datei = process.argv[2];
if (!datei) throw new Error('Kein Modell angegeben');
const args = process.argv.slice(3);
const name = args.includes('--name') ? args[args.indexOf('--name') + 1] : 'modell-probe';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
};

// Achtung: Alles bis zum schliessenden Zeichen ist eine Vorlagenzeichenkette.
// Ein Rueckwaertshochkomma darin — auch im Kommentar — beendet sie vorzeitig.
const PAGE = `<!doctype html><meta charset="utf-8"><title>Modellprobe</title>
<script type="importmap">
{"imports":{"three":"/node_modules/three/build/three.module.js",
            "three/addons/":"/node_modules/three/examples/jsm/"}}
</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const G = 420;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(G, G, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8f80, 2.0));
const key = new THREE.DirectionalLight(0xfff4e2, 1.6);
key.position.set(-0.5, 1.2, 1.5);
scene.add(key);

let wurzel = null;
let mixer = null;
const clips = {};

window.laden = async (url) => {
  const gltf = await new GLTFLoader().loadAsync(url);
  wurzel = gltf.scene;
  scene.add(wurzel);
  wurzel.updateMatrixWorld(true);

  const knochen = [];
  const netze = [];
  const werkstoffe = new Set();
  const skelette = [];
  wurzel.traverse((o) => {
    if (o.isBone) {
      const p = new THREE.Vector3();
      o.getWorldPosition(p);
      knochen.push({
        name: o.name,
        eltern: o.parent && o.parent.isBone ? o.parent.name : null,
        pos: [Number(p.x.toFixed(4)), Number(p.y.toFixed(4)), Number(p.z.toFixed(4))],
      });
    }
    if (o.isMesh) {
      o.frustumCulled = false;
      o.geometry.computeBoundingBox();
      const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
      netze.push({
        name: o.name,
        skinned: !!o.isSkinnedMesh,
        ecken: o.geometry.attributes.position.count,
        box: [
          [Number(b.min.x.toFixed(3)), Number(b.min.y.toFixed(3)), Number(b.min.z.toFixed(3))],
          [Number(b.max.x.toFixed(3)), Number(b.max.y.toFixed(3)), Number(b.max.z.toFixed(3))],
        ],
      });
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        if (!m) continue;
        werkstoffe.add(
          JSON.stringify({
            name: m.name || '(ohne)',
            farbe: m.color ? '#' + m.color.getHexString() : null,
            karte: !!m.map,
            rau: m.roughness,
            metall: m.metalness,
          }),
        );
      }
      if (o.isSkinnedMesh && o.skeleton) {
        skelette.push({ netz: o.name, knochen: o.skeleton.bones.length });
      }
    }
  });

  mixer = new THREE.AnimationMixer(wurzel);
  for (const c of gltf.animations) clips[c.name] = c;

  const box = new THREE.Box3().setFromObject(wurzel);
  return {
    animationen: gltf.animations.map((c) => ({
      name: c.name,
      dauer: Number(c.duration.toFixed(3)),
      spuren: c.tracks.length,
      betrifft: [...new Set(c.tracks.map((t) => t.name.split('.')[0]))].slice(0, 40),
    })),
    knochen,
    netze,
    skelette,
    werkstoffe: [...werkstoffe].map((s) => JSON.parse(s)),
    box: [
      [Number(box.min.x.toFixed(3)), Number(box.min.y.toFixed(3)), Number(box.min.z.toFixed(3))],
      [Number(box.max.x.toFixed(3)), Number(box.max.y.toFixed(3)), Number(box.max.z.toFixed(3))],
    ],
  };
};

/**
 * Knochen biegen, um ein neues Rig zu pruefen.
 *
 * Ein Knochen, der im Skelett steht, ist noch kein Knochen, der etwas bewegt:
 * Er kann falsch gewichtet sein, an der falschen Stelle sitzen oder die Haut
 * aufreissen. Das sagt keine Zahl — das sagt nur ein gebogenes Bild.
 */
window.biegen = (paare) => {
  const grad = Math.PI / 180;
  const getroffen = [];
  wurzel.traverse((o) => {
    if (!o.isBone || !(o.name in paare)) return;
    const w = paare[o.name];
    o.rotation.set((w[0] || 0) * grad, (w[1] || 0) * grad, (w[2] || 0) * grad);
    getroffen.push(o.name);
  });
  wurzel.updateMatrixWorld(true);
  return getroffen;
};

/** Vier Ansichten der Ruhelage, oder eine Pose aus einer Animation. */
window.ansichten = (clip, zeit) => {
  if (clip && clips[clip]) {
    mixer.stopAllAction();
    const a = mixer.clipAction(clips[clip]);
    a.reset();
    a.play();
    mixer.setTime(zeit || 0);
  }
  wurzel.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(wurzel);
  const mitte = box.getCenter(new THREE.Vector3());
  const spanne = Math.max(box.max.x - box.min.x, box.max.y - box.min.y) * 1.15;
  const bilder = [];
  for (const winkel of [0, Math.PI / 2, Math.PI, -Math.PI / 4]) {
    const cam = new THREE.OrthographicCamera(-spanne / 2, spanne / 2, spanne / 2, -spanne / 2, 0.01, 100);
    cam.position.set(mitte.x + Math.sin(winkel) * 10, mitte.y, mitte.z + Math.cos(winkel) * 10);
    cam.lookAt(mitte);
    renderer.render(scene, cam);
    bilder.push(renderer.domElement.toDataURL('image/png'));
  }
  return bilder;
};
window.bereit = true;
</script>`;

const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (url === '/') {
    res.writeHead(200, { 'content-type': TYPES['.html'] });
    res.end(PAGE);
    return;
  }
  // Erst lesen, dann antworten. Andersherum steht der Kopf schon auf 200,
  // wenn das Lesen scheitert — und der Fehlerzweig will einen zweiten senden.
  let inhalt = null;
  try {
    inhalt = readFileSync(url.replace(/^\//, ''));
  } catch {
    res.writeHead(404);
    res.end('nix');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(url)] ?? 'application/octet-stream' });
  res.end(inhalt);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 600, height: 600 } });
page.on('pageerror', (e) => console.error('Seitenfehler:', e.message));
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.bereit === true, null, { timeout: 30000 });

const d = await page.evaluate((u) => window.laden(u), `/${datei}`);

/** `--biege Tail01:40,0,10 Tail02:25` — Knochen vor der Aufnahme verdrehen. */
const biegung = {};
for (const a of args) {
  const m = a.match(/^([A-Za-z_0-9]+):(-?[\d.]+)(?:,(-?[\d.]+))?(?:,(-?[\d.]+))?$/);
  if (m) biegung[m[1]] = [Number(m[2]), Number(m[3] ?? 0), Number(m[4] ?? 0)];
}

console.log(`\n=== ${datei} ===`);
console.log(`Ausdehnung  ${JSON.stringify(d.box)}`);
console.log(`Hoehe       ${(d.box[1][1] - d.box[0][1]).toFixed(4)}`);
console.log(`Breite      ${(d.box[1][0] - d.box[0][0]).toFixed(4)}`);
console.log(`Tiefe       ${(d.box[1][2] - d.box[0][2]).toFixed(4)}`);

console.log(`\n--- Netze (${d.netze.length}) ---`);
for (const n of d.netze) {
  console.log(`  ${n.skinned ? '[skin]' : '[fest]'} ${n.name || '(ohne)'} — ${n.ecken} Ecken`);
}
console.log(`\n--- Werkstoffe (${d.werkstoffe.length}) ---`);
for (const m of d.werkstoffe) {
  console.log(`  ${m.name}  ${m.farbe ?? ''}  ${m.karte ? 'mit Textur' : 'ohne Textur'}`);
}

console.log(`\n--- Skelett (${d.knochen.length} Knochen) ---`);
if (d.knochen.length === 0) {
  console.log('  KEINS. Das Modell hat kein Rig — Posen muessten neu aufgebaut werden.');
} else {
  for (const k of d.knochen) {
    console.log(
      `  ${k.name.padEnd(24)} <- ${(k.eltern ?? '(Wurzel)').padEnd(20)} ${JSON.stringify(k.pos)}`,
    );
  }
}

console.log(`\n--- Animationen (${d.animationen.length}) ---`);
for (const a of d.animationen) {
  console.log(`  ${a.name.padEnd(20)} ${a.dauer}s, ${a.spuren} Spuren`);
}

mkdirSync('art-src/proben', { recursive: true });
if (Object.keys(biegung).length) {
  const getroffen = await page.evaluate((b) => window.biegen(b), biegung);
  console.log(`\nGebogen: ${getroffen.join(', ') || 'NICHTS — kein Knochen dieses Namens'}`);
}
const bilder = await page.evaluate(() => window.ansichten(null, 0));
for (let i = 0; i < bilder.length; i++) {
  writeFileSync(
    `art-src/proben/${name}-${['vorn', 'rechts', 'hinten', 'schraeg'][i]}.png`,
    Buffer.from(bilder[i].split(',')[1], 'base64'),
  );
}
console.log(`\nKontrollbilder: art-src/proben/${name}-{vorn,rechts,hinten,schraeg}.png`);

await browser.close();
server.close();
