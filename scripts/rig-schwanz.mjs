/**
 * Ergaenzt das gelieferte Erdmaennchen-Rig um eine **Schwanzkette** und haeutet
 * den Schwanz darauf neu.
 *
 * ## Warum das noetig ist
 *
 * Das gelieferte Modell bringt ein vollstaendiges Humanoid-Rig mit — Becken,
 * Wirbelsaeule, Arme, Kopf, einundvierzig Knochen. Was es **nicht** mitbringt,
 * ist ein einziger Knochen im Schwanz. Der Schwanz haengt starr am Becken und
 * steht waagerecht nach hinten ab.
 *
 * Das ist fuer dieses Spiel zweimal ein Problem:
 *
 * 1. **Er passt nicht in die Spalte.** Die Simulation fuehrt eine Figur als eine
 *    Spalte von zwoelf Bildpunkten. Ein waagerechter Schwanz haengt gut fuenf
 *    logische Pixel dahinter, also ausserhalb dieser Spalte — er ueberlappte im
 *    Pulk die Nachbarn und ragte durch Waende, an denen die Figur richtig steht.
 * 2. **Er kann nichts sagen.** Ein Schwanz ist das ausdrucksstaerkste Teil
 *    dieses Tieres: Er laeuft beim Gehen nach, stellt sich beim Bremsen auf,
 *    stuetzt beim Stehen. Starr angewachsen ist er ein Stock.
 *
 * ## Was hier passiert
 *
 * Fuenf Knochen vom Becken aus nach hinten, verteilt ueber die tatsaechliche
 * Laenge des Schwanzes — gemessen an der Geometrie, nicht geschaetzt. Danach
 * werden alle Schwanzecken neu gewichtet: jede auf die zwei naechsten
 * Schwanzknochen, linear nach ihrer Stelle auf der Kette.
 *
 * Am Ansatz wird **ueberblendet**. Ohne das reisst die Haut genau dort, wo der
 * Schwanz aus dem Koerper kommt: Die eine Ecke gehoert noch dem Becken, die
 * daneben schon ganz dem ersten Schwanzknochen, und beim Biegen klafft ein
 * Spalt.
 *
 * Herausgeschrieben wird ein **neues Modell**. Der Backvorgang soll ein fertiges
 * Rig laden und nicht bei jedem Lauf eines zusammenbauen — sonst haengt die
 * Figur an einem Skript statt an einer Datei.
 *
 * Aufruf: `node scripts/rig-schwanz.mjs <ein.glb> <aus.glb>`
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';

const [ein, aus] = process.argv.slice(2);
if (!ein || !aus) throw new Error('Aufruf: rig-schwanz.mjs <ein.glb> <aus.glb>');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
};

/** Wie viele Knochen die Kette bekommt. */
const GLIEDER = 5;
/**
 * Ab welchem Anteil der Schwanzlaenge voll auf die Kette gewichtet wird.
 *
 * Davor wird mit dem urspruenglichen Gewicht ueberblendet — das ist die Naht am
 * Ansatz. Ohne sie reisst die Haut beim Biegen.
 */
const NAHT = 0.18;

// Achtung: Vorlagenzeichenkette. Kein Rueckwaertshochkomma hier hinein.
const PAGE = `<!doctype html><meta charset="utf-8"><title>Rig</title>
<script type="importmap">
{"imports":{"three":"/node_modules/three/build/three.module.js",
            "three/addons/":"/node_modules/three/examples/jsm/"}}
</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

const GLIEDER = ${GLIEDER};
const NAHT = ${NAHT};

let wurzel = null;
let netz = null;

window.laden = async (url) => {
  const gltf = await new GLTFLoader().loadAsync(url);
  wurzel = gltf.scene;
  wurzel.updateMatrixWorld(true);
  wurzel.traverse((o) => {
    if (o.isSkinnedMesh && !netz) netz = o;
  });
  if (!netz) throw new Error('Kein gehaeutetes Netz gefunden');
  return { knochen: netz.skeleton.bones.length, ecken: netz.geometry.attributes.position.count };
};

/**
 * Wo faengt der Schwanz an, wo hoert er auf, und an welchem Knochen haengt er
 * bisher? Gemessen wird in Bindeposition, also im Ruhezustand.
 */
window.messen = () => {
  const geo = netz.geometry;
  const pos = geo.attributes.position;
  const si = geo.attributes.skinIndex;
  const sw = geo.attributes.skinWeight;
  const bones = netz.skeleton.bones;

  // Die Beckenstelle als Bezug.
  const becken = bones.find((b) => b.name === 'Pelvis') || bones.find((b) => b.name === 'Hip');
  const bp = new THREE.Vector3();
  becken.getWorldPosition(bp);

  // Alle Ecken in Weltkoordinaten der Bindepose.
  const v = new THREE.Vector3();
  let zmin = Infinity;
  let zmax = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(netz.matrixWorld);
    zmin = Math.min(zmin, v.z);
    zmax = Math.max(zmax, v.z);
  }

  // Der Schwanz ist das, was hinter dem Becken liegt. Gezaehlt wird in Scheiben,
  // damit man sieht, wo der Koerper aufhoert und der Schwanz anfaengt: Der
  // Koerper ist dick, der Schwanz duenn.
  const scheiben = [];
  const N = 24;
  for (let k = 0; k < N; k++) {
    const z0 = zmin + ((zmax - zmin) * k) / N;
    const z1 = zmin + ((zmax - zmin) * (k + 1)) / N;
    let n = 0;
    let rmax = 0;
    const gew = {};
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(netz.matrixWorld);
      if (v.z < z0 || v.z >= z1) continue;
      n++;
      rmax = Math.max(rmax, Math.hypot(v.x - bp.x, v.y - bp.y));
      for (let j = 0; j < 4; j++) {
        const w = sw.getComponent(i, j);
        if (w > 0.2) {
          const nm = bones[si.getComponent(i, j)].name;
          gew[nm] = (gew[nm] || 0) + 1;
        }
      }
    }
    scheiben.push({ z0: Number(z0.toFixed(3)), n, rmax: Number(rmax.toFixed(3)), gew });
  }
  return { zmin, zmax, becken: becken.name, beckenPos: bp.toArray(), scheiben };
};

/**
 * Die Kette bauen und den Schwanz neu haeuten.
 *
 * @param zAnsatz Wo der Schwanz beginnt, in Weltkoordinaten der Bindepose.
 */
window.erweitern = (zAnsatz) => {
  const geo = netz.geometry;
  const pos = geo.attributes.position;
  const si = geo.attributes.skinIndex;
  const sw = geo.attributes.skinWeight;
  const skelett = netz.skeleton;
  const bones = skelett.bones;

  const becken = bones.find((b) => b.name === 'Pelvis') || bones.find((b) => b.name === 'Hip');

  // Schwanzecken sammeln und die Achse messen: Mittelpunkt je Laengsabschnitt.
  const v = new THREE.Vector3();
  const welt = [];
  let zende = Infinity;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(netz.matrixWorld);
    welt.push(v.clone());
    if (v.z < zAnsatz) zende = Math.min(zende, v.z);
  }
  const laenge = zAnsatz - zende;

  // Die Achse: je Abschnitt der Schwerpunkt der Ecken. Ein Schwanz ist nicht
  // exakt gerade, und eine Kette entlang der wirklichen Achse biegt sauberer
  // als eine, die auf einer Geraden liegt.
  const stelle = (t) => {
    const z = zAnsatz - laenge * t;
    const nah = welt.filter((p) => Math.abs(p.z - z) < laenge / (GLIEDER * 2));
    if (nah.length === 0) return new THREE.Vector3(0, 0, z);
    const m = new THREE.Vector3();
    for (const p of nah) m.add(p);
    return m.divideScalar(nah.length);
  };

  const kette = [];
  let eltern = becken;
  for (let g = 0; g < GLIEDER; g++) {
    const p = stelle(g / GLIEDER);
    const b = new THREE.Bone();
    b.name = 'Tail' + String(g + 1).padStart(2, '0');
    // Position im Elternraum: Weltstelle zurueckrechnen.
    const lokal = eltern.worldToLocal(p.clone());
    b.position.copy(lokal);
    eltern.add(b);
    eltern.updateMatrixWorld(true);
    kette.push(b);
    eltern = b;
  }
  wurzel.updateMatrixWorld(true);

  // Die neuen Knochen ans Skelett haengen und **alle** Bindematrizen neu
  // rechnen. Das ist zulaessig, weil nichts bewegt wurde: Die Ruhelage ist die
  // Bindepose, also reproduziert eine Neuberechnung genau dieselbe Haut.
  const alleKnochen = bones.concat(kette);
  const neuesSkelett = new THREE.Skeleton(alleKnochen);
  neuesSkelett.calculateInverses();

  const ersterIndex = bones.length;

  // Neu haeuten. Je Ecke die Stelle auf der Kette bestimmen und auf die zwei
  // naechsten Knochen verteilen.
  let geaendert = 0;
  for (let i = 0; i < pos.count; i++) {
    const p = welt[i];
    if (p.z >= zAnsatz) continue;
    const t = Math.min(1, Math.max(0, (zAnsatz - p.z) / laenge));
    const f = t * (GLIEDER - 1);
    const a = Math.min(GLIEDER - 1, Math.floor(f));
    const b = Math.min(GLIEDER - 1, a + 1);
    const rest = f - a;

    // Am Ansatz ueberblenden, sonst reisst die Haut an der Naht.
    const anteil = t < NAHT ? t / NAHT : 1;

    if (anteil >= 1) {
      si.setXYZW(i, ersterIndex + a, ersterIndex + b, 0, 0);
      sw.setXYZW(i, 1 - rest, rest, 0, 0);
    } else {
      // Zwei Plaetze fuer die Kette, zwei fuer das staerkste bisherige Gewicht.
      let bestI = si.getComponent(i, 0);
      let bestW = sw.getComponent(i, 0);
      for (let j = 1; j < 4; j++) {
        if (sw.getComponent(i, j) > bestW) {
          bestW = sw.getComponent(i, j);
          bestI = si.getComponent(i, j);
        }
      }
      si.setXYZW(i, ersterIndex + a, ersterIndex + b, bestI, 0);
      sw.setXYZW(i, anteil * (1 - rest), anteil * rest, 1 - anteil, 0);
    }
    geaendert++;
  }
  si.needsUpdate = true;
  sw.needsUpdate = true;

  netz.bind(neuesSkelett, netz.bindMatrix);
  wurzel.updateMatrixWorld(true);

  return { geaendert, laenge, zende, kette: kette.map((b) => b.name), knochen: alleKnochen.length };
};

/** Als GLB herausschreiben. */
window.ausgeben = () =>
  new Promise((ok, fehler) => {
    new GLTFExporter().parse(
      wurzel,
      (ergebnis) => {
        const bytes = new Uint8Array(ergebnis);
        let s = '';
        for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
        ok(btoa(s));
      },
      fehler,
      { binary: true, onlyVisible: false },
    );
  });
window.bereit = true;
</script>`;

const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (url === '/') {
    res.writeHead(200, { 'content-type': TYPES['.html'] });
    res.end(PAGE);
    return;
  }
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
const page = await browser.newPage({ viewport: { width: 400, height: 400 } });
page.on('pageerror', (e) => console.error('Seitenfehler:', e.message));
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.bereit === true, null, { timeout: 30000 });

const geladen = await page.evaluate((u) => window.laden(u), `/${ein}`);
console.log(`Geladen: ${geladen.knochen} Knochen, ${geladen.ecken} Ecken`);

const m = await page.evaluate(() => window.messen());
console.log(`\nLaengsausdehnung z: ${m.zmin.toFixed(3)} .. ${m.zmax.toFixed(3)}`);
console.log(`Becken (${m.becken}) bei z = ${m.beckenPos[2].toFixed(3)}`);
console.log('\n  z ab   Ecken  groesster Radius  staerkste Gewichte');
for (const s of m.scheiben) {
  const top = Object.entries(s.gew)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([n, c]) => `${n}:${c}`)
    .join(' ');
  console.log(`  ${String(s.z0).padStart(6)}  ${String(s.n).padStart(5)}  ${String(s.rmax).padStart(15)}  ${top}`);
}

/**
 * Wo der Schwanz anfaengt: dort, wo der Umfang dauerhaft duenn wird.
 *
 * Gemessen statt geschaetzt — der Koerper ist dick, der Schwanz duenn, und
 * zwischen beiden liegt ein deutlicher Sprung. Genommen wird die hinterste
 * Scheibe, deren Radius noch ueber einem Drittel des Koerperradius liegt.
 */
const koerperR = Math.max(...m.scheiben.map((s) => s.rmax));
const duenn = m.scheiben.filter((s) => s.n > 0 && s.rmax < koerperR * 0.34);
const zAnsatz = duenn.length ? Math.max(...duenn.map((s) => s.z0)) + (m.zmax - m.zmin) / 24 : m.zmin;
console.log(`\nKoerperradius ${koerperR.toFixed(3)} — Schwanzansatz bei z = ${zAnsatz.toFixed(3)}`);

const e = await page.evaluate((z) => window.erweitern(z), zAnsatz);
console.log(
  `\nKette: ${e.kette.join(', ')}\n` +
    `Schwanzlaenge ${e.laenge.toFixed(3)}, ${e.geaendert} Ecken neu gehaeutet, ` +
    `jetzt ${e.knochen} Knochen`,
);

const b64 = await page.evaluate(() => window.ausgeben());
writeFileSync(aus, Buffer.from(b64, 'base64'));
console.log(`\n${aus}  ${Math.round(Buffer.from(b64, 'base64').length / 1024)} kB`);

await browser.close();
server.close();
