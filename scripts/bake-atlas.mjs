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
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { pathToFileURL } from 'node:url';

const GLB = 'art-src/wuselwerker-v4.glb';
const POSEN = 'art-src/posen';
const ZIEL = 'src/art';
const SS = 9; // Überabtastung je Achse — fein genug für einzelne Strähnen

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

/**
 * Zwei Ausgabearten aus demselben Modell.
 *
 * **Fein** (Vorgabe): Das Blatt hat mehrere Bildpunkte je logischem Pixel,
 * bleibt weich schattiert und bekommt statt einer harten Kontur einen weichen
 * dunklen Saum. So sieht die Figur aus wie das Ankerbild — gemalt, mit Volumen.
 *
 * **Pixel** (`--pixel`): der alte Weg. Mehrheitsentscheid je Zelle, Einrasten
 * auf neun Farben, harter Umriss. Bleibt erhalten, weil er die Rückfallebene
 * und die Malvorlage bedient und weil man beides nebeneinander sehen können
 * soll.
 *
 * Die Simulation ist von der Wahl nicht berührt: Sie kennt nur den Fusspunkt
 * und die Figurenhöhe, beides in logischen Pixeln. Das Blatt sagt über `ppl`,
 * wie viele Bildpunkte auf einen logischen Pixel kommen.
 */
const PIXEL = args.includes('--pixel');
const PPL = PIXEL ? 1 : 4;

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

/**
 * Kleidung in drei Teilen statt einem Overall.
 *
 * Das Modell trägt einen einteiligen türkisen Anzug; die Trennung entsteht
 * hier. Warum überhaupt: Bei 26 Bildschirmpixeln ist eine einfarbige Säule von
 * der Schulter bis zum Boden die halbe Figur, und sie erzählt nichts. Drei
 * Tonwerte übereinander geben ihr eine Gliederung, an der das Auge Hüfte und
 * Boden ablesen kann.
 *
 * Die Farbwahl folgt dem Untergrund, auf dem die Figur steht: Türkis oben hält
 * sowohl gegen Nachthimmel als auch gegen braune Erde, das Schiefer­blau der
 * Hose liegt zwischen beiden, und die Schuhe sind der dunkelste Wert der Figur
 * — sie setzen sie auf den Boden, statt sie schweben zu lassen.
 */
const KLEIDUNG = {
  oberteil: '#2fc9b8',
  hose: '#3d5b78',
  schuhe: '#2a2018',
};
const UMRISS = '#0c1119';

/**
 * Anbauteile — Werkzeuge, Helm, Schirm, Bombe.
 *
 * Das Modell hat keines davon, und ohne sie ist kein Beruf ablesbar (GDD §6).
 * Sie entstehen deshalb als einfache Kästen im Backweg. Gerendert werden sie
 * unbeleuchtet in einer Markerfarbe, die am Körper nirgends vorkommt, und erst
 * beim Einrasten in ihre echte Farbe übersetzt. Der Umweg ist nötig, weil
 * Werkzeuggelb im Kanalverhältnis wie Haut aussieht und sonst im Gesicht
 * landen würde.
 */
const TEILFARBEN = {
  werkzeug: { marker: [255, 0, 255], farbe: '#ffd23f' },
  dunkel: { marker: [0, 255, 0], farbe: '#0c1119' },
  signal: { marker: [0, 128, 255], farbe: '#ff7a45' },
  haar: { marker: [255, 255, 0], farbe: '#e5372c' },
  haarglanz: { marker: [0, 255, 255], farbe: '#ff8f5e' },
  // Für nachgebaute Körperteile: Ein Arm, der im Modell unter der Mähne
  // begraben liegt, wird als Anbauteil neu gestellt — dann aber in der Farbe
  // des Anzugs und der Haut, nicht in Werkzeuggelb. Gelb sagt "Gerät".
  anzug: { marker: [0, 0, 255], farbe: '#2fc9b8' },
  haut: { marker: [160, 0, 255], farbe: '#f4d7ac' },
};

/**
 * Die Zotteln — einzelne Haarsträhnen, die über die Mähne hinausstehen.
 *
 * Warum sie hier stehen und nicht im Modell: Das Haar des Modells ist an das
 * Kopfgelenk gebunden und damit starr. Es kippt mit dem Kopf, aber es schwingt
 * nicht. Bei 12 Pixeln Figurenhöhe ist genau dieses Nachschwingen aber das
 * Erkennungszeichen der Figur — eine Masse, die sich nie bewegt, liest als
 * Mütze, egal wie zackig ihr Rand ist.
 *
 * Also bekommt jede Figur einen festen Satz Strähnen, angehängt an den Kopf.
 * Sie gehören zur Art, nicht zur Pose, und stehen deshalb im Backweg und nicht
 * in den Posendateien. Lage in logischen Pixeln vom Kopfgelenk aus,
 * [vorn, hoch, seitlich]. `phase` verschiebt den Nachlauf: Ohne sie schlügen
 * alle Strähnen im Gleichtakt, und das sieht aus wie ein Kamm.
 */
// Das Kopfgelenk sitzt 6,1 logische Pixel über der Sohle, die Mähne reicht bis
// gut 11 darüber hinaus. Eine Strähne muss also länger als 11 sein, sonst
// steckt sie in der Masse und man sieht nichts von ihr. `pos` ist ihr Ansatz,
// `mass[1]` ihre Länge nach aussen.
const ZOTTELN = [
  { pos: [-0.8, 3.6, 0.2], mass: [1.5, 8.4, 1.5], dreh: [26, 0, 2], phase: 0.0, farbe: 'haarglanz' },
  { pos: [-2.2, 3.0, 1.2], mass: [1.4, 8.0, 1.4], dreh: [58, 0, 14], phase: 0.35, farbe: 'haar' },
  { pos: [-2.8, 1.6, -1.3], mass: [1.3, 7.4, 1.3], dreh: [92, 0, -10], phase: 0.7, farbe: 'haar' },
  { pos: [0.8, 3.4, -1.1], mass: [1.3, 6.8, 1.3], dreh: [2, 0, -10], phase: 0.2, farbe: 'haar' },
  { pos: [-1.8, 3.4, -1.8], mass: [1.3, 7.6, 1.3], dreh: [44, 0, -20], phase: 0.55, farbe: 'haar' },
  { pos: [0.2, 3.8, 1.5], mass: [1.2, 7.0, 1.2], dreh: [16, 0, 22], phase: 0.85, farbe: 'haarglanz' },
  { pos: [-3.2, 2.6, 0.2], mass: [1.2, 6.6, 1.2], dreh: [74, 0, 4], phase: 0.15, farbe: 'haar' },
  { pos: [1.6, 2.6, 0.4], mass: [1.1, 5.8, 1.1], dreh: [-16, 0, 8], phase: 0.45, farbe: 'haar' },
  { pos: [-1.2, 3.9, -0.6], mass: [1.1, 9.0, 1.1], dreh: [34, 0, -6], phase: 0.62, farbe: 'haar' },
  { pos: [-2.6, 3.2, -0.9], mass: [1.1, 6.2, 1.1], dreh: [66, 0, -14], phase: 0.28, farbe: 'haarglanz' },
];

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
    const teile = mod?.teile ? mod.teile(i, i / c.frames) : [];

    // Nachschwingen der Strähnen. Steht nichts in der Pose, schwingt es sanft
    // über den Zyklus — auch ein stehender Blocker soll nicht erstarrt wirken.
    const schwung = roh._haar ?? Math.sin((i / c.frames) * Math.PI * 2) * 0.5;
    delete dreh._haar;
    for (const z of ZOTTELN) {
      const w = Math.sin(((i / c.frames) + z.phase) * Math.PI * 2) * schwung;
      teile.push({
        an: 'Head',
        form: 'spitz',
        folgt: true,
        pos: z.pos,
        mass: z.mass,
        dreh: [z.dreh[0] + w * 19, z.dreh[1], z.dreh[2] + w * 8],
        farbe: z.farbe,
      });
    }
    auftrag.push({ clip: c.name, row: c.row, frame: i, dreh, versatz, teile, gestellt: Boolean(mod) });
  }
}
const ohnePose = CLIPS.filter((c) => !posen[c.name]).map((c) => c.name);

// --- Seite ------------------------------------------------------------------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

// Achtung beim Bearbeiten: Alles bis zum schliessenden Zeichen ist eine
// Vorlagenzeichenkette. Ein einzelnes Rückwärtshochkomma darin — auch in einem
// Kommentar — beendet sie vorzeitig, und der Fehler zeigt auf eine harmlose
// Kommentarzeile. Deshalb steht hier drinnen kein Wort in Hochkommata.
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
const PPL = ${PPL};
const PIXEL = ${PIXEL};
const BLICK = ${BLICK} * Math.PI / 180;
const PALETTE = ${JSON.stringify(PALETTE)};
const KLEIDUNG = ${JSON.stringify(KLEIDUNG)};
const UMRISS = '${UMRISS}';
const TEILFARBEN = ${JSON.stringify(TEILFARBEN)};

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
  const haarDreieck = [];
  for (let t = 0; t < idx.length; t += 3) {
    const h = istHaar(idx[t]) && istHaar(idx[t+1]) && istHaar(idx[t+2]);
    haarDreieck.push(h);
    if (h) continue;
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
  // Wenig Grundhelligkeit, dafür ein deutliches Licht von oben.
  //
  // Flaches Licht wäre bequem, macht aber aus der Mähne eine einzige Fläche:
  // Alle Strähnen bekommen denselben Ton, die Zwischenräume auch, und beim
  // Einrasten auf drei Stufen bleibt ein Klotz übrig. Erst der Helligkeits-
  // unterschied zwischen Strähnenrücken und Zwischenraum lässt daraus Haar
  // werden — hell oben auf den Spitzen, dunkel in den Furchen.
  scene.add(new THREE.AmbientLight(0xffffff, 1.35));
  // Schlüssellicht von vorn oben. Es darf nicht von der Seite kommen: Der
  // Renderer spiegelt die Figur, und ein seitliches Licht wäre bei jeder
  // zweiten Figur auf der falschen Seite (grafik-katalog.md §2.7).
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(0, 3, 2);
  scene.add(key);
  // Senkrecht von oben — das ist das Licht, das die Strähnen trennt.
  const oben = new THREE.DirectionalLight(0xffffff, 1.15);
  oben.position.set(0, 5, -0.4);
  scene.add(oben);

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

  // --- Kleidung trennen -----------------------------------------------------
  // Das Modell hat ein Material fuer alles. Getrennt wird deshalb hier, in drei
  // Schritten: Haar steht schon fest (Textur), Haut ebenfalls (Textur), und der
  // Stoff dazwischen wird nach *Hoehe* aufgeteilt - oberhalb der Huefte
  // Oberteil, darunter Hose, unterhalb der Knoechel Schuhe. Die Hoehen kommen
  // aus dem Skelett, nicht aus geratenen Zahlen.
  const _w = new THREE.Vector3();
  knochen.Waist.getWorldPosition(_w);
  const hueftY = _w.y;
  knochen.L_Foot.getWorldPosition(_w);
  // Nicht am Fussgelenk selbst: Der Schaft des Stiefels gehoert zum Schuh,
  // sonst ist er im Bild nur eine Zeile und verschwindet gegen die Hose.
  const knoechelY = minY + höhe * 0.17;

  const istHaut = (v) => {
    const px = Math.min(tc.width-1, Math.max(0, Math.round(uv[v*2] * tc.width)));
    const py = Math.min(tc.height-1, Math.max(0, Math.round(uv[v*2+1] * tc.height)));
    const o = (py * tc.width + px) * 4;
    const r = td[o], g = td[o+1], b = td[o+2];
    // Haut ist warm und hell, Stoff ist gruenstichig.
    return r > 90 && g < r * 0.92 && b < r * 0.8 && g > b;
  };

  const GRUPPEN = ['haar', 'haut', 'oberteil', 'hose', 'schuhe'];
  const eimer = { haar: [], haut: [], oberteil: [], hose: [], schuhe: [] };
  for (let t = 0, d = 0; t < idx.length; t += 3, d++) {
    const a = idx[t], b = idx[t+1], c = idx[t+2];
    let g;
    if (haarDreieck[d]) g = 'haar';
    else if (istHaut(a) || istHaut(b) || istHaut(c)) g = 'haut';
    else {
      const y = (pos[a*3+1] + pos[b*3+1] + pos[c*3+1]) / 3;
      g = y > hueftY ? 'oberteil' : y > knoechelY ? 'hose' : 'schuhe';
    }
    eimer[g].push(a, b, c);
  }

  const neuIdx = [];
  const gruppen = [];
  for (let i = 0; i < GRUPPEN.length; i++) {
    const list = eimer[GRUPPEN[i]];
    gruppen.push({ start: neuIdx.length, count: list.length, name: GRUPPEN[i] });
    for (const v of list) neuIdx.push(v);
  }
  geo.setIndex(new THREE.BufferAttribute(new Uint32Array(neuIdx), 1));
  geo.clearGroups();
  for (let i = 0; i < gruppen.length; i++) {
    geo.addGroup(gruppen[i].start, gruppen[i].count, i);
  }
  // Haar und Haut behalten die gemalte Textur - dort steckt das Gesicht. Die
  // Kleidungsteile bekommen glatte Farben; ihre Textur war ohnehin einfarbig.
  const mitTextur = () => new THREE.MeshStandardMaterial({
    map: mesh.material.map, roughness: 0.78, metalness: 0,
  });
  const einfarbig = (hex) => new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex), roughness: 0.78, metalness: 0,
  });
  mesh.material = [
    mitTextur(),
    mitTextur(),
    einfarbig(KLEIDUNG.oberteil),
    einfarbig(KLEIDUNG.hose),
    einfarbig(KLEIDUNG.schuhe),
  ];
  window.__gruppen = gruppen.map((g) => g.name + ' ' + (g.count / 3));

  // --- Maehne ausduennen ----------------------------------------------------
  // Das Modell traegt eine dichte, geschlossene Haarkugel. Bei Spielgroesse
  // liest sie als Flaeche, und einzelne Straehnen gehen darin unter. Die Masse
  // wird deshalb zum Kopf hin geschrumpft; was danach heraussteht, sind die
  // Zotteln - und die stehen dann einzeln, statt in der Kugel zu versinken.
  {
    const nurHaar = new Set();
    for (let t = 0, d = 0; t < idx.length; t += 3, d++) {
      if (!haarDreieck[d]) continue;
      for (let k = 0; k < 3; k++) nurHaar.add(idx[t+k]);
    }
    for (const v of körperV) nurHaar.delete(v);
    knochen.Head.getWorldPosition(_w);
    const mitte = mesh.worldToLocal(_w.clone());
    const P = geo.attributes.position;
    // Waagerecht staerker als senkrecht: Die Hoehe der Maehne ist die
    // Silhouette, die Breite ist die Dichte.
    for (const v of nurHaar) {
      P.setX(v, mitte.x + (P.getX(v) - mitte.x) * 0.74);
      P.setY(v, mitte.y + (P.getY(v) - mitte.y) * 0.86);
      P.setZ(v, mitte.z + (P.getZ(v) - mitte.z) * 0.74);
    }
    P.needsUpdate = true;
    window.__haarPunkte = nurHaar.size;
  }

  const heim = root.position.clone();
  // Weltdrehung jedes Knochens in der Bindepose. Sie ist der Bezugspunkt für
  // Anbauteile, die dem Knochen folgen sollen (siehe folgt in anbauen()).
  const bindWelt = {};
  root.updateMatrixWorld(true);
  for (const [name, b] of Object.entries(knochen)) {
    bindWelt[name] = b.getWorldQuaternion(new THREE.Quaternion());
  }
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
  // Anbauteile werden in Markerfarben gerendert, unbeleuchtet und weit weg von
  // allem, was am Körper vorkommt. Sie werden zuerst geprüft: Werkzeuggelb
  // würde sonst als Haut durchgehen (Kanalverhältnis 0,82 zu 0,25).
  const MARKER = Object.entries(TEILFARBEN).map(([k, v]) => [k, v.marker]);
  const marke = (r, g, b) => {
    for (const [k, m] of MARKER) {
      if (Math.abs(r-m[0]) < 20 && Math.abs(g-m[1]) < 20 && Math.abs(b-m[2]) < 20) return k;
    }
    return null;
  };
  const familie = (r, g, b) => {
    if (r < 40 && g < 40 && b < 40) return null;
    // Sehr dunkel heisst Kleidung, nicht Haut: Schuhe und Hosenschatten liegen
    // im Kanalverhaeltnis dicht bei Haut, aber weit unter ihr in der
    // Helligkeit. Ohne diese Zeile bekaeme die Figur sandfarbene Stiefel.
    if (0.2126*r + 0.7152*g + 0.0722*b < 72) return 'anzug';
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
  // Haar bekommt ein engeres Band um den Grundton als Haut und Anzug.
  //
  // Bei Haut und Anzug ist eine grosse ruhige Fläche gewollt — dort sollen nur
  // deutliche Lichter und Schatten abweichen. Beim Haar ist es umgekehrt: Jede
  // Furche zwischen zwei Strähnen soll auf die dunkle Stufe fallen und jeder
  // Strähnenrücken auf die helle. Sonst steht die Mähne als eine einzige rote
  // Fläche da, und eine einzige Fläche liest als Mütze, nicht als Haar.
  const BAND = { haar: [1.07, 0.83], haut: [1.22, 0.7], anzug: [1.22, 0.7] };
  const SCHWELLE = Object.fromEntries(
    Object.entries(RAMPEN).map(([k, ramp]) => [
      k,
      [lum(ramp[1]) * BAND[k][0], lum(ramp[1]) * BAND[k][1]],
    ]),
  );
  const stufe = (r, g, b, fam) => {
    const l = 0.2126*r + 0.7152*g + 0.0722*b;
    const s = SCHWELLE[fam];
    return l >= s[0] ? 0 : l >= s[1] ? 1 : 2;
  };

  // --- Anbauteile ----------------------------------------------------------
  const teileGruppe = new THREE.Group();
  scene.add(teileGruppe);
  /**
   * Markerfarben müssen den Renderer unverändert überstehen.
   *
   * Genau das taten sie nicht: new THREE.Color(r, g, b) setzt Werte im
   * *linearen* Arbeitsraum, der Ausgang rechnet sie nach sRGB — aus dem Marker
   * (0, 128, 255) wurde im Bild (0, 188, 255). Reine 0 und 255 überleben das,
   * alles dazwischen nicht. Der Blockermarker fiel dadurch mit exakt 60 Stufen
   * Abstand knapp aus der Erkennung und wurde als Anzugstürkis eingerastet —
   * die orangen Arme verschwanden im eigenen Ärmel.
   *
   * Mit setRGB(..., SRGBColorSpace) rechnet three die Farbe beim Setzen nach
   * linear und am Ausgang zurück; sie kommt exakt so an, wie sie hier steht.
   * Deshalb darf die Erkennung unten auch eng sein.
   */
  const teilStoffe = Object.fromEntries(
    Object.entries(TEILFARBEN).map(([k, v]) => [
      k,
      // Markerfarben braucht nur der Pixelweg, um das Teil beim Einrasten
      // wiederzuerkennen. Der feine Weg rastet nichts ein - dort steht das
      // Teil gleich in seiner echten Farbe und wird beleuchtet wie der Rest,
      // sonst haette ein Werkzeug kein Volumen und eine Haarstraehne wuerde
      // sich nicht in die Maehne einfuegen.
      PIXEL
        ? new THREE.MeshBasicMaterial({
            color: new THREE.Color().setRGB(
              v.marker[0]/255, v.marker[1]/255, v.marker[2]/255, THREE.SRGBColorSpace,
            ),
            toneMapped: false,
          })
        : new THREE.MeshStandardMaterial({
            color: new THREE.Color(v.farbe),
            roughness: 0.72,
            metalness: 0,
          }),
    ]),
  );
  const _v = new THREE.Vector3(), _o = new THREE.Vector3();
  const _f = new THREE.Quaternion(), _g = new THREE.Quaternion(), _h = new THREE.Quaternion();
  /**
   * Setzt die Anbauteile dieses Bildes.
   *
   * Lage und Mass stehen in logischen Pixeln und in Figurenachsen:
   * [vorn, hoch, seitlich] in Figurenachsen. Das ist dieselbe Sprache wie bei
   * den Winkeln — wer eine Pose schreiben kann, kann auch ein Werkzeug
   * anhängen, ohne die Achsen eines Knochens zu kennen.
   */
  const anbauen = (teile) => {
    while (teileGruppe.children.length) {
      const k = teileGruppe.children.pop();
      k.geometry.dispose();
    }
    for (const t of teile) {
      const bone = knochen[t.an];
      if (!bone) { window.__fehlend = (window.__fehlend ?? []).concat(t.an); continue; }
      /**
       * folgt heisst: Das Teil dreht sich mit dem Knochen, nicht nur mit.
       *
       * Ohne das folgt ein Anbauteil dem Gelenk nur in der *Lage*. Für ein
       * Werkzeug in der Faust ist das brauchbar — man richtet es ohnehin von
       * Hand aus. Für Haarsträhnen ist es falsch: Sie standen bei jeder Pose
       * gleich, egal wie der Kopf lag, und ragten immer rund zehn Pixel über
       * das Kopfgelenk. Ein zusammenbrechender Wusel behielt so eine
       * kerzengerade Frisur, und der Zustand konnte nicht flach werden.
       *
       * Gerechnet wird mit der *Differenz* zur Bindepose: In ihr gelten die
       * angegebenen Achsen wie überall in dieser Datei, und alles, was der
       * Knochen seither gedreht hat, kommt obendrauf.
       */
      const folge = t.folgt ? _f.copy(bone.getWorldQuaternion(_g)).multiply(
        _h.copy(bindWelt[t.an]).invert(),
      ) : null;
      const [mv, mh, ms] = t.mass;
      // Zwei Formen: Kasten für Werkzeuge (harte Ecken, Katalog §2.4) und
      // Spitze für Haarsträhnen. Vier Seiten genügen — bei dieser Grösse ist
      // jede weitere Kante ein Pixel, das es nicht gibt.
      const geom = t.form === 'spitz'
        ? new THREE.ConeGeometry((ms / 2) * einheit, mh * einheit, 4)
        : new THREE.BoxGeometry(ms * einheit, mh * einheit, mv * einheit);
      if (t.form === 'spitz') {
        if (mv !== ms) geom.scale(1, 1, mv / ms);
        // Die Spitze wächst aus ihrem Ansatz heraus, statt um ihn zu stehen:
        // So ist pos der Punkt am Kopf und mass[1] die Länge nach aussen —
        // sonst müsste man beim Verlängern jedes Mal auch die Lage nachziehen.
        geom.translate(0, (mh / 2) * einheit, 0);
      }
      const box = new THREE.Mesh(
        geom,
        teilStoffe[t.farbe ?? 'werkzeug'] ?? teilStoffe.werkzeug,
      );
      bone.getWorldPosition(_v);
      const [pv, ph, ps] = t.pos ?? [0, 0, 0];
      _o.set(ps * einheit, ph * einheit, pv * einheit);
      if (folge) _o.applyQuaternion(folge);
      box.position.copy(_v).add(_o);
      const [rx, ry, rz] = t.dreh ?? [0, 0, 0];
      box.quaternion.setFromEuler(
        new THREE.Euler(rx*Math.PI/180, ry*Math.PI/180, rz*Math.PI/180, 'XYZ'),
      );
      if (folge) box.quaternion.premultiply(folge);
      teileGruppe.add(box);
    }
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
    anbauen(auftrag.teile ?? []);

    const R = 10;
    cam.position.set(-Math.cos(BLICK) * R, kamY, mitteZ + Math.sin(BLICK) * R);
    cam.lookAt(0, kamY, mitteZ);
    renderer.render(scene, cam);

    octx.clearRect(0, 0, out.width, out.height);
    octx.drawImage(renderer.domElement, 0, 0);
    const d = octx.getImageData(0, 0, out.width, out.height).data;

    // --- Verkleinern -------------------------------------------------------
    // Erst je Block auszählen, entschieden wird danach: Die Haarkante braucht
    // die Nachbarschaft, und die kennt ein Block für sich allein nicht.
    const zelle = new Array(CELL_W * CELL_H).fill(null);
    const haaranteil = new Float32Array(CELL_W * CELL_H);
    const sieger = new Array(CELL_W * CELL_H).fill(null);
    const gedeckt = new Float32Array(CELL_W * CELL_H);

    for (let cy = 0; cy < CELL_H; cy++) {
      for (let cx = 0; cx < CELL_W; cx++) {
        const zähler = new Map();
        let deckung = 0, haar = 0;
        for (let sy = 0; sy < SS; sy++) {
          for (let sx = 0; sx < SS; sx++) {
            const o = (((cy*SS + sy) * out.width) + (cx*SS + sx)) * 4;
            if (d[o+3] < 128) continue;
            deckung++;
            const m = marke(d[o], d[o+1], d[o+2]);
            if (m) {
              // Anbauteile zaehlen doppelt: Ein Werkzeug ist duenn und wuerde
              // im Mehrheitsentscheid gegen den Koerper dahinter verlieren --
              // dabei ist genau es das, was den Beruf lesbar macht.
              zähler.set('T' + m, (zähler.get('T' + m) ?? 0) + 2);
              continue;
            }
            const fam = familie(d[o], d[o+1], d[o+2]);
            if (!fam) continue;
            if (fam === 'haar') haar++;
            const k = fam + stufe(d[o], d[o+1], d[o+2], fam);
            zähler.set(k, (zähler.get(k) ?? 0) + 1);
          }
        }
        let best = null, n = -1;
        for (const [k, v] of zähler) if (v > n) { n = v; best = k; }
        const i = cy*CELL_W + cx;
        sieger[i] = best;
        gedeckt[i] = deckung / (SS*SS);
        haaranteil[i] = haar / (SS*SS);
      }
    }

    /**
     * Entscheiden — für Haar anders als für den Rest.
     *
     * Am Rumpf ist eine halb gedeckte Randzelle Teil einer glatten Kante und
     * gehört dazu. Am Rand der Mähne ist sie etwas anderes: entweder der
     * Zwischenraum zwischen zwei Strähnen oder die Spitze einer einzelnen.
     * Beides gleich zu behandeln füllt die Lücken und kappt die Spitzen — und
     * genau daraus entsteht der Eindruck einer Mütze.
     *
     * Deshalb zwei Regeln fürs Haar:
     *   Kern     — ab drei Vierteln Deckung steht die Fläche.
     *   Zacke    — darunter nur, wenn die Zelle mehr Haar trägt als ihre
     *              Nachbarschaft im Mittel. Das ist genau eine herausstehende
     *              Strähne; ein Zwischenraum liegt unter dem Mittel und fällt
     *              heraus. Die Zacken folgen damit dem Modell und sind nicht
     *              aufgestreutes Rauschen.
     */
    const umfeld = (x, y) => {
      let summe = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = x+dx, ny = y+dy;
          if (nx < 0 || nx >= CELL_W || ny < 0 || ny >= CELL_H) continue;
          summe += haaranteil[ny*CELL_W + nx]; n++;
        }
      }
      return n ? summe / n : 0;
    };

    for (let cy = 0; cy < CELL_H; cy++) {
      for (let cx = 0; cx < CELL_W; cx++) {
        const i = cy*CELL_W + cx;
        const best = sieger[i];
        if (!best) continue;
        if (!best.startsWith('haar')) {
          if (gedeckt[i] >= 0.42) zelle[i] = best;
          continue;
        }
        const h = haaranteil[i];
        if (h >= 0.74) { zelle[i] = best; continue; }
        if (h >= 0.24 && h > umfeld(cx, cy) + 0.03) zelle[i] = best;
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

    if (!PIXEL) {
      // Feiner Weg: aus der Überabtastung glatt herunterrechnen, dann einen
      // weichen dunklen Saum darunterlegen. Der Saum ersetzt die harte Kontur
      // - ohne ihn verliert die Figur auf brauner Erde ihre Kante, mit einer
      // harten Linie sähe sie wieder gezeichnet statt gemalt aus.
      const zw = CELL_W * PPL, zh = CELL_H * PPL;
      const fein = document.createElement('canvas');
      fein.width = zw; fein.height = zh;
      const fx = fein.getContext('2d', { willReadFrequently: true });
      fx.imageSmoothingEnabled = true;
      fx.imageSmoothingQuality = 'high';
      fx.save();
      fx.shadowColor = 'rgba(6, 9, 15, 0.7)';
      fx.shadowBlur = PPL * 1.1;
      for (let i = 0; i < 3; i++) fx.drawImage(out, 0, 0, zw, zh);
      fx.restore();
      fx.drawImage(out, 0, 0, zw, zh);
      const fd = fx.getImageData(0, 0, zw, zh).data;
      let n = 0;
      for (let i = 3; i < fd.length; i += 4) if (fd[i] > 40) n++;
      return { png: fein.toDataURL('image/webp', 0.92), belegt: Math.round(n / (PPL * PPL)) };
    }

    const klein = document.createElement('canvas');
    klein.width = CELL_W; klein.height = CELL_H;
    const kctx = klein.getContext('2d');
    const img = kctx.createImageData(CELL_W, CELL_H);
    let belegt = 0;
    for (let i = 0; i < CELL_W * CELL_H; i++) {
      let rgb = null;
      if (zelle[i]) {
        if (zelle[i][0] === 'T') {
          rgb = hex(TEILFARBEN[zelle[i].slice(1)].farbe);
        } else {
          const fam = zelle[i].slice(0, -1);
          rgb = RAMPEN[fam][Number(zelle[i].slice(-1))];
        }
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

  // Gelenkhöhen in logischen Pixeln über der Sohle — ohne sie rät man beim
  // Anhängen von Werkzeugen und Strähnen.
  const _t = new THREE.Vector3();
  const höhen = {};
  for (const n of ['Head', 'Spine02', 'Pelvis', 'R_Hand', 'R_Foot']) {
    if (!knochen[n]) continue;
    knochen[n].getWorldPosition(_t);
    höhen[n] = Math.round(((_t.y - minY) / einheit) * 10) / 10;
  }
  window.__masse = { höhe, einheit, minY, mitteZ, höhen, knochen: Object.keys(knochen).length };
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
const gruppen = await page.evaluate(() => window.__gruppen ?? []);

// --- Alle Bilder backen und zum Blatt setzen --------------------------------
const bilder = [];
for (const a of auftrag) {
  const r = await page.evaluate((x) => window.__bake(x), a);
  bilder.push({ ...a, ...r });
}
const fehlend = await page.evaluate(() => window.__fehlend ?? []);

const { blatt, gross } = await page.evaluate(
  async ([bilder, cw, ch, spalten, zeilen, einzeln, fein]) => {
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
    // WebP fuer das gemalte Blatt: Bei weicher Schattierung ist PNG rund
    // viermal so gross, und das Blatt liegt eingebettet in der Einzeldatei.
    const blatt = c.toDataURL(einzeln && !fein ? 'image/png' : fein ? 'image/webp' : 'image/png', 0.92);
    if (!einzeln) return { blatt, gross: null };

    // Kontrollbild: nur die Zeile dieses Zustands, zehnfach, auf neutralem
    // Grund. Ein Blatt in Originalgrösse kann kein Mensch beurteilen.
    const S = Math.max(2, Math.round(40 / (cw / 28)));
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
  [bilder, CELL_W * PPL, CELL_H * PPL, SPALTEN, CLIPS.length, Boolean(nurClip), !PIXEL],
);

await browser.close();
server.close();
if (probleme.length) {
  console.error(probleme.join('\n'));
  process.exit(1);
}

mkdirSync(ZIEL, { recursive: true });
const png = Buffer.from(blatt.split(',')[1], 'base64');
const ENDUNG = PIXEL ? 'png' : 'webp';
if (!nurClip) {
  // Nur eine Blattdatei im Ordner: Der Lader nimmt sonst die falsche.
  for (const alt of ['png', 'webp']) {
    if (alt !== ENDUNG && existsSync(join(ZIEL, `wusel.${alt}`))) rmSync(join(ZIEL, `wusel.${alt}`));
  }
  writeFileSync(join(ZIEL, `wusel.${ENDUNG}`), png);
  const manifest = {
    version: 1,
    cell: { w: CELL_W, h: CELL_H },
    anchor: { x: ANCHOR_X, y: ANCHOR_Y },
    // Bildpunkte je logischem Pixel. 1 heisst Pixelgrafik.
    ppl: PPL,
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
console.log(`Gelenke   ${Object.entries(masse.höhen).map(([k, v]) => `${k} ${v}`).join(', ')} (logische Pixel über der Sohle)`);
console.log(`Teile     ${gruppen.join(', ')} Dreiecke`);
console.log(`Zelle     ${CELL_W} × ${CELL_H}, Fusspunkt (${ANCHOR_X}, ${ANCHOR_Y})`);
console.log(`Blatt     ${CELL_W * PPL * SPALTEN} × ${CELL_H * PPL * CLIPS.length}, ${bilder.length} Bilder, ${Math.round(png.length / 1024)} kB, ${PIXEL ? 'Pixel' : `fein ${PPL}×`}`);
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
    : `${ZIEL}/wusel.${ENDUNG} + wusel.atlas.json`,
);
