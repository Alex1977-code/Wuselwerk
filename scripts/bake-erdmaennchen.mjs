/**
 * Backt das Figurenblatt des **Erdmaennchens** aus `art-src/erdmaennchen/`.
 *
 * ## Drei Modelle, drei Wege
 *
 * Die Murmel kam geriggt **und animiert**; dort wurde nur abgetastet. Das
 * geliefertes Erdmaennchen kommt geriggt, aber **ohne eine einzige Animation**
 * — und ohne Schwanzknochen, die `scripts/rig-schwanz.mjs` nachtraegt. Seine
 * Posen stehen deshalb als Tabellen in `art-src/erdmaennchen/posen/*.json`, eine
 * Datei je Pose. An zwoelf Posen kann man so unabhaengig arbeiten, ohne sich in
 * dieselbe Datei zu schreiben.
 *
 * ## Warum die Posen **Richtungen** nennen und keine Winkel
 *
 * Weil ich die Achsen dieses Rigs nicht kenne. Es ist nicht meins: Die Knochen
 * haben ihre eigenen Bindedrehungen, und welche Achse einen Arm hebt statt ihn
 * zu schwenken, sieht man ihnen nicht an. Beim prozeduralen Vorgaengermodell
 * hatte ich genau das geraten — Arme heben laeuft ueber Z, nicht ueber X —, und
 * drei Posen sahen deshalb aus wie Stehen.
 *
 * Eine Posentabelle sagt hier stattdessen, **wohin ein Knochen zeigen soll**:
 * ein Vektor im Modellraum, +z nach vorn, +y nach oben, +x zur linken Seite der
 * Figur. Der Backvorgang misst die Ruherichtung des Knochens (die Stelle seines
 * Kindes) und rechnet die Drehung aus, die daraus die Zielrichtung macht. Das
 * ist rigunabhaengig, es ist lesbar („Arm zeigt nach vorn unten"), und es kann
 * nicht am falschen Vorzeichen scheitern.
 *
 * ## Der Massstab ist derselbe wie bei der Murmel
 *
 * `FIGUR_EINHEITEN` und `SICHT` sind unveraendert uebernommen, und das ist
 * Absicht: Daran haengen Zellgroesse, `ppl`, Fusspunkt und die Pruefungen in
 * `tests/atlas.test.ts`. Eine zweite Figur, die ein anderes Mass mitbraechte,
 * waere eine zweite Zellgeometrie — und damit zwei Wahrheiten im Renderer.
 *
 * ## Die Probe
 *
 * Es gibt keine gelieferte Ankertabelle, gegen die sich rechnen liesse. Geprueft
 * wird deshalb, was sich aus dem Modell selbst ergibt und trotzdem schiefgehen
 * kann:
 *
 * 1. **Die Figurenhoehe.** Vom Fusspunkt bis zum Scheitel ohne Ohren muessen es
 *    `FIGUR_EINHEITEN` sein. Weicht das ab, ist der gezeichnete Koerper nicht so
 *    hoch wie der, mit dem die Simulation rechnet — der Fehler, der bei der
 *    Murmel zur zurueckgerechneten Zellgroesse gefuehrt hat.
 * 2. **Kein Anschnitt.** Kein undurchsichtiger Bildpunkt darf den Zellrand
 *    beruehren. Eine Pose, die aus der Zelle laeuft, sieht man auf dem Blatt
 *    nicht — man sieht sie im Spiel als abgeschnittenen Arm.
 * 3. **Gesicht und Pfote liegen in der Zelle.** Beide werden aus dem Rig
 *    gemessen und ins Manifest geschrieben; ein Punkt ausserhalb hiesse, dass
 *    Maske oder Werkzeug neben der Figur schweben.
 *
 * Aufruf: `node scripts/bake-erdmaennchen.mjs [--pose walking] [--probe] [--name x]`
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';

const QUELLE = 'art-src/erdmaennchen';
const POSEN = join(QUELLE, 'posen');
/** Das gelieferte Modell **mit** nachgetragener Schwanzkette. */
const GLB = join(QUELLE, 'erdmaennchen-rig.glb');
const ZIEL = 'src/art';

const args = process.argv.slice(2);
const nurPose = args.includes('--pose') ? args[args.indexOf('--pose') + 1] : null;
const probe = args.includes('--probe');
const probeName = args.includes('--name') ? args[args.indexOf('--name') + 1] : 'erdmaennchen-blatt';

/** Ueberabtastung je Achse. Runde Kanten und duenne Arme brauchen sie. */
const SS = 6;
const ZELLE = 112;
const SPALTEN = 8;

/**
 * Die Reihenfolge der Zeilen und die Haltedauern.
 *
 * **Nicht frei waehlbar.** Sie haengen an den Taktraten der Simulation
 * (`DIG_INTERVAL` ist prim, deshalb sind die Haltedauern beim Graben ungleich)
 * und muessen mit `DEFAULT_MANIFEST` in `src/render/atlas.ts` uebereinstimmen.
 * Hier stehen sie ausgeschrieben statt importiert, weil dieses Skript kein
 * TypeScript laedt — eine Pruefung im Testlauf haelt beide zusammen.
 */
const ZEILEN = [
  { name: 'walking', holds: [3, 3, 3, 3, 3, 3, 3, 3] },
  { name: 'falling', holds: [4, 4, 4, 4] },
  { name: 'floating', holds: [3, 3, 3, 3] },
  { name: 'climbing', holds: [4, 4, 4, 4] },
  { name: 'hoisting', holds: [8, 8, 8, 8, 8, 12], once: true },
  { name: 'building', holds: [3, 3, 3, 3, 3, 3, 3, 3] },
  { name: 'bashing', holds: [3, 3, 3] },
  { name: 'mining', holds: [3, 3, 3, 3] },
  { name: 'digging', holds: [3, 2, 2] },
  { name: 'blocking', holds: [8, 8] },
  { name: 'saving', holds: [3, 3, 3, 3, 3, 3], once: true },
  { name: 'dying', holds: [3, 3, 3, 3, 3, 3, 4, 4], once: true },
];

/**
 * Wie weit sich jede Pose aus der Kamera wegdreht, in Grad.
 *
 * Deutlich **mehr** als bei der Murmel, und zwar aus dem umgekehrten Grund.
 *
 * Die Murmel musste gedreht werden, damit ihre mittigen Augen ueberhaupt eine
 * Seite bekamen; ueber 48 Grad verlor sie dabei ihr Gesicht. Dieses Tier hat
 * eine **Schnauze**, und die gewinnt mit jedem Grad: Im Profil ist sie ein
 * spitzes Dreieck, das die Silhouette nach vorn durchbricht, und damit ist die
 * Laufrichtung ohne jeden Zweifel gesagt. Sechzig Grad zeigen sie voll und
 * lassen den Koerper trotzdem breit genug, dass man die Arbeit daran sieht.
 *
 * Der Blocker steht frontal. Seine Wachpose ist die Aussage „bis hierher und
 * nicht weiter", und die richtet sich an den Betrachter.
 */
const DREHUNG_GRAD = {
  walking: 62,
  falling: 40,
  floating: 30,
  climbing: 46,
  hoisting: 56,
  building: 58,
  bashing: 60,
  mining: 62,
  digging: 44,
  // Zwoelf Grad statt null. Der Blocker soll den Betrachter ansehen — aber
  // schnurgerade frontal steht dieser Kopf als flache Scheibe mit zwei dunklen
  // Loechern da, und die Schnauze, das freundlichste Merkmal der Figur, zeigt
  // in die Kamera und verschwindet. Zwoelf Grad lassen sie erscheinen, ohne die
  // Aussage „bis hierher und nicht weiter" zu schwaechen.
  blocking: 12,
  saving: 12,
  dying: 0,
};

const FIGUR_EINHEITEN = 0.861;
const SICHT = 1.22;
const FUSS_PX = 3;
const ARM_LAENGE = 0.21;
/** Zulaessige Abweichung der gemessenen Figurenhoehe, in Modelleinheiten. */
const HOEHE_TOLERANZ = 0.02;

const WUSEL_H = Number(readFileSync('src/core/constants.ts', 'utf8').match(/WUSEL_H = (\d+)/)[1]);
const LOGISCH = Number((WUSEL_H / (FIGUR_EINHEITEN / SICHT)).toFixed(3));
const PPL = ZELLE / LOGISCH;

const zeilen = nurPose ? ZEILEN.filter((z) => z.name === nurPose) : ZEILEN;
if (zeilen.length === 0) throw new Error(`Pose ${nurPose} steht nicht in der Zeilentabelle`);

/** Die Richtungstabellen. Fehlt eine Datei, steht die Pose in Ruhelage. */
const posen = {};
if (existsSync(POSEN)) {
  for (const datei of readdirSync(POSEN).filter((d) => d.endsWith('.json'))) {
    posen[datei.replace(/\.json$/, '')] = JSON.parse(readFileSync(join(POSEN, datei), 'utf8'));
  }
}
const fehlend = ZEILEN.filter((z) => !posen[z.name]).map((z) => z.name);
if (fehlend.length) console.log(`  (noch ohne Richtungstabelle, stehen in Ruhe: ${fehlend.join(', ')})`);

// --- Seite -------------------------------------------------------------------
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

// Achtung beim Bearbeiten: Alles bis zum schliessenden Zeichen ist eine
// Vorlagenzeichenkette. Ein einzelnes Rueckwaertshochkomma darin — auch in einem
// Kommentar — beendet sie vorzeitig, und der Fehler zeigt dann auf eine
// harmlose Kommentarzeile. Deshalb steht hier drinnen keins. (Dieselbe Falle
// steht in `bake-murmel.mjs`; ich bin trotzdem hineingelaufen.)
const PAGE = `<!doctype html><meta charset="utf-8"><title>Backofen</title>
<script type="importmap">
{"imports":{"three":"/node_modules/three/build/three.module.js",
            "three/addons/":"/node_modules/three/examples/jsm/"}}
</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const ZELLE = ${ZELLE};
const SS = ${SS};
const SICHT = ${SICHT};
const FUSS_PX = ${FUSS_PX};
const FIGUR_EINHEITEN = ${FIGUR_EINHEITEN};
const GROESSE = ZELLE * SS;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(GROESSE, GROESSE, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8f80, 2.0));
const key = new THREE.DirectionalLight(0xfff4e2, 1.5);
key.position.set(-0.5, 1.2, 1.5);
scene.add(key);
const rim = new THREE.DirectionalLight(0xdfe8ff, 0.6);
rim.position.set(0.8, -0.3, -1.0);
scene.add(rim);

const unten = -(FUSS_PX / ZELLE) * SICHT;
const oben = unten + SICHT;
const camera = new THREE.OrthographicCamera(-SICHT / 2, SICHT / 2, oben, unten, 0.01, 40);
camera.position.set(0, 0, 12);
camera.lookAt(0, 0, 0);

const HOCHACHSE = new THREE.Vector3(0, 1, 0);
let wurzel = null;
let netz = null;
const knochen = {};
/** Ruhedrehung und Achse je Knochen — die Grundlage der Richtungsposen. */
const ruhe = {};
let ordnung = [];
let eichFaktor = 1;
let eichVersatz = 0;

window.laden = async (url) => {
  const gltf = await new GLTFLoader().loadAsync(url);
  wurzel = new THREE.Object3D();
  wurzel.add(gltf.scene);
  scene.add(wurzel);
  wurzel.updateMatrixWorld(true);
  gltf.scene.traverse((o) => {
    if (o.isBone) knochen[o.name] = o;
    if (o.isSkinnedMesh) {
      netz = o;
      o.frustumCulled = false;
      const m = o.material;
      if (m && m.roughness !== undefined) m.roughness = 0.92;
      if (m && m.metalness !== undefined) m.metalness = 0.0;
    }
  });

  // Der Kopf einen Hauch groesser.
  //
  // Das ist die aelteste Regel der Niedlichkeit und die einzige, die sich an
  // einem fertigen Modell noch anwenden laesst: Ein grosser Kopf auf einem
  // kleinen Koerper ist ein Jungtier, und Jungtiere sind das, was Menschen
  // suess finden. Zwoelf Prozent — genug, dass es wirkt, wenig genug, dass es
  // niemand als Verzerrung bemerkt.
  //
  // Am Knochen und nicht am Netz, damit die Haut sauber mitwaechst.
  if (knochen.Head) knochen.Head.scale.setScalar(1.12);

  // Ruhelage festhalten: die Eigendrehung jedes Knochens und seine **Achse**,
  // also die Richtung zu seinem Kind im eigenen Raum. Ohne diese Achse laesst
  // sich keine Zielrichtung ausrechnen — sie ist das, was gedreht wird.
  for (const [name, b] of Object.entries(knochen)) {
    const kind = b.children.find((c) => c.isBone);
    const achse = kind
      ? kind.position.clone().normalize()
      : new THREE.Vector3(0, 1, 0);
    ruhe[name] = { q: b.quaternion.clone(), achse, hatKind: !!kind };
  }
  // Nach Tiefe sortieren: Eltern zuerst. Die Weltdrehung eines Kindes haengt an
  // der schon gesetzten Drehung seines Elternteils.
  ordnung = Object.keys(knochen).sort((x, y) => {
    const tiefe = (o) => { let n = 0; for (let p = o; p; p = p.parent) n++; return n; };
    return tiefe(knochen[x]) - tiefe(knochen[y]);
  });
  return { knochen: Object.keys(knochen).length, netz: !!netz };
};

/**
 * Eine Pose setzen: je Knochen eine Zielrichtung im Modellraum.
 *
 * Gerechnet wird von aussen nach innen — erst Eltern, dann Kinder —, weil die
 * Weltdrehung eines Knochens die schon gesetzte seines Elternteils enthaelt.
 */
function stelle(richtungen, winkel) {
  // Die Wurzeldrehung **zuruecksetzen**, bevor irgendetwas gerechnet wird.
  //
  // Zielrichtungen sind Weltrichtungen: Der Backvorgang rechnet sie ueber die
  // Weltdrehung des Elternteils in den lokalen Raum. Steht die Wurzel dabei
  // schon auf dem Blickwinkel dieser Pose, kommt alles um genau diesen Winkel
  // verdreht heraus.
  //
  // Genau das ist passiert, und der Fehler war so still, wie er nur sein kann:
  // Beim **ersten** Bild stand die Wurzel noch auf null, also stimmte es. Ab dem
  // zweiten stand dort die Drehung des vorigen Aufrufs. Auf dem Blatt sah man
  // ein Bild mit Schwanz und sieben ohne — man haelt so etwas fuer ein Flackern
  // des Schwanzes und sucht am Schwanz.
  wurzel.rotation.set(0, 0, 0);
  for (const name of ordnung) {
    const b = knochen[name];
    b.quaternion.copy(ruhe[name].q);
  }
  // Der Kopfmassstab gehoert zur Figur, nicht zur Pose — er ueberlebt jede
  // Ruecksetzung.
  if (knochen.Head) knochen.Head.scale.setScalar(1.12);
  wurzel.updateMatrixWorld(true);
  // Knochen **ohne Kind** haben keine Achse, auf die sich eine Zielrichtung
  // beziehen liesse — der Kopf ist der wichtige Fall. Fuer sie gibt es die
  // Eulerdrehung, und nur fuer sie: Ueberall sonst waere sie das Raten, das
  // dieser Umbau gerade abgeschafft hat.
  if (winkel) {
    const grad = Math.PI / 180;
    for (const [name, w] of Object.entries(winkel)) {
      const b = knochen[name];
      if (!b) continue;
      b.quaternion.copy(ruhe[name].q);
      b.rotateX((w[0] || 0) * grad);
      b.rotateY((w[1] || 0) * grad);
      b.rotateZ((w[2] || 0) * grad);
    }
    wurzel.updateMatrixWorld(true);
  }
  if (!richtungen) return;
  const eltern = new THREE.Quaternion();
  const ziel = new THREE.Vector3();
  for (const name of ordnung) {
    const soll = richtungen[name];
    if (!soll || !knochen[name] || !ruhe[name].hatKind) continue;
    const b = knochen[name];
    b.parent.updateWorldMatrix(true, false);
    b.parent.getWorldQuaternion(eltern);
    // Zielrichtung vom Modellraum in den Raum des Elternteils.
    ziel.set(soll[0], soll[1], soll[2]).normalize().applyQuaternion(eltern.clone().invert());
    b.quaternion.setFromUnitVectors(ruhe[name].achse, ziel);
    b.updateWorldMatrix(false, true);
  }
  wurzel.updateMatrixWorld(true);
}

function spanne() {
  wurzel.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(wurzel);
  return { oben: box.max.y, unten: box.min.y };
}

window.eiche = () => {
  wurzel.scale.setScalar(1);
  wurzel.position.set(0, 0, 0);
  wurzel.rotation.set(0, 0, 0);
  stelle(null, null);
  const s = spanne();
  const faktor = FIGUR_EINHEITEN / (s.oben - s.unten);
  wurzel.scale.setScalar(faktor);
  wurzel.position.y = -s.unten * faktor;
  eichFaktor = faktor;
  eichVersatz = wurzel.position.y;
  wurzel.updateMatrixWorld(true);
  const n = spanne();
  return { roh: s.oben - s.unten, faktor, geeicht: n.oben - n.unten };
};

const zelle = (v) => [(v.x / SICHT + 0.5) * ZELLE, ((oben - v.y) / SICHT) * ZELLE];

window.bild = (bild, dreh) => {
  stelle(bild && bild.richtung ? bild.richtung : null, bild && bild.winkel ? bild.winkel : null);
  const skala = bild && bild.skala != null ? bild.skala : 1;
  // Stauchen und Strecken — das aelteste Mittel der Zeichentrickbewegung.
  //
  // Ein Koerper, der beim Aufsetzen breiter und flacher wird und beim Abstossen
  // schmaler und hoeher, hat **Gewicht**. Ohne das bewegen sich starre Teile
  // durch die Gegend, und genau so sah es aus: „alles sehr statisch".
  //
  // Die Werte sind winzig — drei bis fuenf Prozent. Mehr macht aus dem Tier
  // einen Gummiball; weniger sieht man bei zwoelf Bildpunkten nicht.
  const st = (bild && bild.stauch) || [1, 1, 1];
  wurzel.scale.set(
    eichFaktor * skala * st[0],
    eichFaktor * skala * st[1],
    eichFaktor * skala * st[2],
  );
  wurzel.position.y = eichVersatz + (bild && bild.versatz ? bild.versatz : 0) * FIGUR_EINHEITEN;
  wurzel.rotation.set(0, dreh, 0);
  wurzel.updateMatrixWorld(true);
  renderer.render(scene, camera);

  const vorn = (v) => v.clone().applyAxisAngle(HOCHACHSE, -dreh);

  // Der Gesichtspunkt: die Kopfstelle, nach vorn und oben versetzt, damit er
  // zwischen den Augen liegt und nicht im Schaedelmittelpunkt.
  const kopf = knochen.Head;
  const g = kopf.localToWorld(new THREE.Vector3(0, 0.06, 0.06));

  // Der Werkzeugansatz: die vordere **Hand**. Dieses Rig hat welche — bei der
  // Murmel musste die Armspitze geschaetzt werden.
  let hand = null;
  let handVorn = null;
  for (const name of ['L_Hand', 'R_Hand']) {
    const h = knochen[name];
    if (!h) continue;
    const p = new THREE.Vector3();
    h.getWorldPosition(p);
    const v = vorn(p);
    if (!handVorn || v.z > handVorn.z) { hand = p; handVorn = v; }
  }

  // Anschnitt: beruehrt etwas Undurchsichtiges den Zellrand?
  const gl = renderer.getContext();
  const zeile = new Uint8Array(GROESSE * 4);
  let anschnitt = 0;
  for (const y of [0, GROESSE - 1]) {
    gl.readPixels(0, y, GROESSE, 1, gl.RGBA, gl.UNSIGNED_BYTE, zeile);
    for (let i = 3; i < zeile.length; i += 4) if (zeile[i] > 24) anschnitt++;
  }
  const spalte = new Uint8Array(GROESSE * 4);
  for (const x of [0, GROESSE - 1]) {
    gl.readPixels(x, 0, 1, GROESSE, gl.RGBA, gl.UNSIGNED_BYTE, spalte);
    for (let i = 3; i < spalte.length; i += 4) if (spalte[i] > 24) anschnitt++;
  }

  return {
    bild: renderer.domElement.toDataURL('image/png'),
    gesicht: zelle(g),
    hand: hand ? zelle(hand) : null,
    anschnitt,
  };
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
  try {
    const inhalt = readFileSync(url.replace(/^\//, ''));
    res.writeHead(200, { 'content-type': TYPES[extname(url)] ?? 'application/octet-stream' });
    res.end(inhalt);
  } catch {
    res.writeHead(404);
    res.end('nix');
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
page.on('pageerror', (e) => console.error('Seitenfehler:', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.error('Konsole:', m.text());
});
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.bereit === true, null, { timeout: 30000 });

const geladen = await page.evaluate((u) => window.laden(u), `/${GLB}`);
console.log(`Modell geladen — ${geladen.knochen} Knochen, Netz ${geladen.netz ? 'da' : 'FEHLT'}`);
if (!geladen.netz) throw new Error('Kein gehaeutetes Netz im Modell');

// --- Probe 1: die Figurenhoehe ----------------------------------------------
//
// Geeicht statt nachgerechnet. Was danach noch schiefgehen kann, ist ein Modell,
// dessen Proportionen so weit daneben liegen, dass die Eichung sie stemmen
// muesste — und genau das faengt die Schranke ab. Sie ist kein Massband,
// sondern eine Notbremse.
const eichung = await page.evaluate(() => window.eiche());
console.log(
  `Figurenhoehe: roh ${eichung.roh.toFixed(4)}, Eichfaktor ${eichung.faktor.toFixed(4)}, ` +
    `geeicht ${eichung.geeicht.toFixed(4)} (soll ${FIGUR_EINHEITEN})`,
);
if (Math.abs(eichung.geeicht - FIGUR_EINHEITEN) > HOEHE_TOLERANZ) {
  await browser.close();
  server.close();
  throw new Error(`Die Eichung greift nicht: ${eichung.geeicht.toFixed(4)} statt ${FIGUR_EINHEITEN}.`);
}
if (eichung.faktor < 0.6 || eichung.faktor > 1.7) {
  await browser.close();
  server.close();
  throw new Error(
    `Eichfaktor ${eichung.faktor.toFixed(2)} — die Proportionen des Modells liegen so weit ` +
      `daneben, dass die Eichung sie ausgleichen muesste. Das ist keine Groessenfrage mehr.`,
  );
}

// --- Backen ------------------------------------------------------------------
const bilder = [];
const gesichter = [];
const haende = [];
let anschnitte = 0;
for (const z of zeilen) {
  const reihe = ZEILEN.findIndex((x) => x.name === z.name);
  const tabelle = posen[z.name];
  const dreh = ((DREHUNG_GRAD[z.name] ?? 0) * Math.PI) / 180;
  for (let i = 0; i < z.holds.length; i++) {
    const bild = tabelle?.frames?.[i] ?? tabelle?.frames?.[0] ?? null;
    const r = await page.evaluate(([b, d]) => window.bild(b, d), [bild, dreh]);
    bilder.push({ pose: z.name, reihe, spalte: i, png: r.bild });
    gesichter.push({ pose: z.name, bild: i, punkt: r.gesicht });
    haende.push({ pose: z.name, bild: i, punkt: r.hand ?? r.gesicht });
    if (r.anschnitt > 0) {
      anschnitte++;
      console.log(`  ! ${z.name} Bild ${i} beruehrt den Zellrand`);
    }
  }
  process.stdout.write(`  ${z.name} (${z.holds.length})${tabelle ? '' : ' — Ruhelage'}\n`);
}

// --- Probe 2 und 3 -----------------------------------------------------------
if (anschnitte > 0) {
  console.log(`\nWARNUNG: ${anschnitte} Bilder beruehren den Zellrand.`);
}
for (const [was, liste] of [
  ['Gesicht', gesichter],
  ['Pfote', haende],
]) {
  const raus = liste.filter(
    (g) => g.punkt[0] < 0 || g.punkt[0] > ZELLE || g.punkt[1] < 0 || g.punkt[1] > ZELLE,
  );
  if (raus.length) {
    await browser.close();
    server.close();
    throw new Error(
      `${was}punkt liegt bei ${raus.length} Bildern ausserhalb der Zelle ` +
        `(zuerst ${raus[0].pose} Bild ${raus[0].bild}).`,
    );
  }
}

// --- Blatt zusammensetzen ----------------------------------------------------
const blatt = await page.evaluate(
  async ([teile, zelle, ss, spalten, reihen]) => {
    const c = document.createElement('canvas');
    c.width = spalten * zelle;
    c.height = reihen * zelle;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    for (const t of teile) {
      const img = new Image();
      await new Promise((r) => {
        img.onload = r;
        img.src = t.png;
      });
      ctx.drawImage(img, 0, 0, zelle * ss, zelle * ss, t.spalte * zelle, t.reihe * zelle, zelle, zelle);
    }
    return c.toDataURL('image/webp', 0.9);
  },
  [bilder, ZELLE, SS, SPALTEN, ZEILEN.length],
);

const daten = Buffer.from(blatt.split(',')[1], 'base64');

if (probe) {
  mkdirSync('art-src/proben', { recursive: true });
  writeFileSync(`art-src/proben/${probeName}.webp`, daten);
  console.log(`\nProbe: art-src/proben/${probeName}.webp (${Math.round(daten.length / 1024)} kB)`);
} else {
  mkdirSync(ZIEL, { recursive: true });
  writeFileSync(join(ZIEL, 'erdmaennchen.webp'), daten);
  const manifest = {
    image: 'erdmaennchen.webp',
    // Welche Figur das Blatt zeigt. Der Renderer braucht das, weil die
    // Signalschicht figurabhaengig ist: Die Murmel traegt einen Schopf, das
    // Erdmaennchen eine Augenmaske. Ohne diese Angabe muesste er es raten.
    figur: 'erdmaennchen',
    cell: { w: LOGISCH, h: LOGISCH },
    anchor: { x: LOGISCH / 2, y: LOGISCH - FUSS_PX / PPL },
    ppl: PPL,
    clips: Object.fromEntries(
      ZEILEN.map((z, reihe) => [
        z.name,
        {
          row: reihe,
          holds: z.holds,
          ...(z.once ? { once: true } : {}),
          dreh: DREHUNG_GRAD[z.name] ?? 0,
          // Der Gesichtspunkt je Einzelbild. Er tritt an die Stelle des
          // Schopfankers der Murmel: Dort haengt die Berufsfarbe daran, hier
          // die Augenmaske. Gemessen aus dem Rig, nicht von Hand gepflegt.
          anchors: gesichter
            .filter((g) => g.pose === z.name)
            .sort((a, b) => a.bild - b.bild)
            .map((g) => [
              Number(((g.punkt[0] / ZELLE) * LOGISCH).toFixed(2)),
              Number(((g.punkt[1] / ZELLE) * LOGISCH).toFixed(2)),
            ]),
          // Zustand der Maske je Einzelbild. Die Tabelle im Zeichner sagt, was
          // die Zahlen bedeuten.
          tuff: (posen[z.name]?.frames ?? []).map((f) => f.maske ?? 0),
          hands: haende
            .filter((h) => h.pose === z.name)
            .sort((a, b) => a.bild - b.bild)
            .map((h) => [
              Number(((h.punkt[0] / ZELLE) * LOGISCH).toFixed(2)),
              Number(((h.punkt[1] / ZELLE) * LOGISCH).toFixed(2)),
            ]),
        },
      ]),
    ),
  };
  // Fehlt eine Winkeltabelle, waere `tuff` leer — der Renderer braucht aber je
  // Bild einen Eintrag. Auffuellen statt weglassen: Ein fehlender Eintrag
  // liesse die Maske stillschweigend verschwinden.
  for (const z of ZEILEN) {
    const c = manifest.clips[z.name];
    while (c.tuff.length < c.holds.length) c.tuff.push(0);
    c.tuff.length = c.holds.length;
  }
  writeFileSync(join(ZIEL, 'erdmaennchen.atlas.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nsrc/art/erdmaennchen.webp        ${Math.round(daten.length / 1024)} kB`);
  console.log('src/art/erdmaennchen.atlas.json  Aufteilung, Haltedauern, Gesicht und Pfote');
}

await browser.close();
server.close();
