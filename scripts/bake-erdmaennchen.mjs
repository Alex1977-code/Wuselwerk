/**
 * Backt das Figurenblatt des **Erdmaennchens** aus `art-src/erdmaennchen/`.
 *
 * ## Was hier anders ist als bei der Murmel
 *
 * Die Murmel kam als geriggtes Modell mit zwoelf fertigen Animationen; dieser
 * Backvorgang musste nur abtasten. Das Erdmaennchen entsteht im Code
 * (`modell.mjs`), und seine Posen stehen als **Winkeltabellen** in
 * `art-src/erdmaennchen/posen/*.json` — eine Datei je Pose. Das ist kein
 * Rueckschritt, sondern der Weg, den dieses Projekt bei seiner ersten Figur
 * schon gegangen ist.
 *
 * Eine Datei je Pose hat einen zweiten Grund: An zwoelf Posen kann man
 * unabhaengig voneinander arbeiten, ohne sich gegenseitig in dieselbe Datei zu
 * schreiben.
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
 * Deutlich weniger als bei der Murmel, und das ist der eigentliche Gewinn
 * dieser Figur: Die **Schnauze** zeigt die Richtung an, nicht die Drehung. Ein
 * Tier hat ein Vorderende und kann gar nicht mehrdeutig stehen. Gedreht wird
 * nur so weit, dass der Koerper Tiefe bekommt.
 *
 * Der Blocker steht frontal. Seine Wachpose ist die Aussage „bis hierher und
 * nicht weiter", und die richtet sich an den Betrachter.
 */
const DREHUNG_GRAD = {
  walking: 24,
  falling: 16,
  floating: 12,
  climbing: 20,
  hoisting: 24,
  building: 26,
  bashing: 24,
  mining: 26,
  digging: 18,
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

/** Die Winkeltabellen. Fehlt eine Datei, steht die Pose in Ruhelage. */
const posen = {};
if (existsSync(POSEN)) {
  for (const datei of readdirSync(POSEN).filter((d) => d.endsWith('.json'))) {
    posen[datei.replace(/\.json$/, '')] = JSON.parse(readFileSync(join(POSEN, datei), 'utf8'));
  }
}
const fehlend = ZEILEN.filter((z) => !posen[z.name]).map((z) => z.name);
if (fehlend.length) console.log(`  (noch ohne Winkeltabelle, stehen in Ruhe: ${fehlend.join(', ')})`);

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
import { baueErdmaennchen, stelle, FIGUR_EINHEITEN } from '/art-src/erdmaennchen/modell.mjs';

const ZELLE = ${ZELLE};
const SS = ${SS};
const SICHT = ${SICHT};
const FUSS_PX = ${FUSS_PX};
const ARM_LAENGE = ${ARM_LAENGE};
const GROESSE = ZELLE * SS;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(GROESSE, GROESSE, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Beleuchtung wie bei der Murmel: weich von schraeg oben vorn, viel Grundlicht,
// ein kuehles Gegenlicht fuer die Silhouette. Ein Pelz vertraegt kein hartes
// Schlaglicht — er wird davon zu Kunststoff.
scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8f80, 2.0));
const key = new THREE.DirectionalLight(0xfff4e2, 1.5);
key.position.set(-0.5, 1.2, 1.5);
scene.add(key);
const rim = new THREE.DirectionalLight(0xdfe8ff, 0.6);
rim.position.set(0.8, -0.3, -1.0);
scene.add(rim);

const unten = -(FUSS_PX / ZELLE) * SICHT;
const oben = unten + SICHT;
const camera = new THREE.OrthographicCamera(-SICHT / 2, SICHT / 2, oben, unten, 0.01, 20);
camera.position.set(0, 0, 6);
camera.lookAt(0, 0, 0);

const { wurzel, gelenke, gesicht } = baueErdmaennchen();
scene.add(wurzel);

const HOCHACHSE = new THREE.Vector3(0, 1, 0);
let eichFaktor = 1;
let eichVersatz = 0;
const zelle = (v) => [(v.x / SICHT + 0.5) * ZELLE, ((oben - v.y) / SICHT) * ZELLE];

/**
 * Scheitelhoehe ohne Ohren, aus der Geometrie gemessen — und danach geeicht.
 *
 * **Der Massstab kommt aus dem Modell, nicht aus einer Zahl.** Wer die
 * Proportionen von Hand auf eine Zielhoehe rechnet, rechnet bei jeder Aenderung
 * neu und trifft sie nie ganz; hier wird stattdessen gemessen und einmal
 * skaliert. Das ist derselbe Weg, den der aeltere Backvorgang dieses Projekts
 * geht, und er hat einen weiteren Vorteil: Die **Proportionen** bleiben genau
 * die, die im Modell stehen — nur die Groesse folgt der Simulation.
 */
window.hoehe = () => {
  stelle(gelenke, {});
  wurzel.rotation.set(0, 0, 0);
  wurzel.updateMatrixWorld(true);
  let max = -Infinity;
  wurzel.traverse((o) => {
    if (!o.isMesh) return;
    // Ohren zaehlen nicht zur Figurenhoehe — sie ragen darueber hinaus, so wie
    // der Schopf der Murmel.
    for (let p = o.parent; p; p = p.parent) if (p.name && p.name.endsWith('_Ohr')) return;
    o.geometry.computeBoundingBox();
    const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
    max = Math.max(max, b.max.y);
  });
  return max;
};

/** Tiefster Punkt der Figur in Weltkoordinaten. */
function tiefster() {
  let min = Infinity;
  wurzel.updateMatrixWorld(true);
  wurzel.traverse((o) => {
    if (!o.isMesh) return;
    o.geometry.computeBoundingBox();
    const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
    min = Math.min(min, b.min.y);
  });
  return min;
}

/**
 * Einmal eichen: Scheitel auf FIGUR_EINHEITEN, Sohle auf null.
 *
 * Beides gemessen, nicht gerechnet. Der zweite Teil ist der wichtigere und war
 * mir beim ersten Versuch durchgerutscht: Meine Beinlaengen summierten sich auf
 * mehr als die Hufthoehe, die Figur steckte also im Boden und wurde unten von
 * der Zelle abgeschnitten. Von Hand nachzujustieren waere die falsche Antwort —
 * bei zweiundsechzig Einzelbildern muss die Sohle **von selbst** auf der
 * Standlinie liegen.
 *
 * Geeicht wird in der Ruhelage, und der Versatz bleibt danach stehen. Wuerde je
 * Pose neu gemessen, koennte die Figur nie einen Fuss heben — jede Pose saesse
 * wieder auf dem Boden.
 */
window.eiche = () => {
  wurzel.scale.setScalar(1);
  wurzel.position.set(0, 0, 0);
  // Gemessen wird die Spanne **von der Sohle bis zum Scheitel**, nicht die Hoehe
  // ueber dem Nullpunkt. Der erste Versuch nahm nur den Scheitel, verschob die
  // Figur danach auf die Standlinie — und war um genau den Sohlenabstand zu
  // kurz. Ein Fehler von einem halben Prozent, den keine Pruefung gefangen
  // haette, weil er unter der Toleranz lag.
  const oben = window.hoehe();
  const unten = tiefster();
  const faktor = FIGUR_EINHEITEN / (oben - unten);
  wurzel.scale.setScalar(faktor);
  wurzel.position.y = -unten * faktor;
  eichFaktor = faktor;
  eichVersatz = wurzel.position.y;
  wurzel.updateMatrixWorld(true);
  return { roh: oben - unten, faktor, sohle: unten * faktor, geeicht: window.hoehe() };
};

window.bild = (bild, dreh) => {
  const posenWinkel = (bild && bild.winkel) || {};
  stelle(gelenke, posenWinkel);
  wurzel.rotation.set(0, dreh, 0);
  // Die Eichung aus eiche() ist der Ausgangspunkt; skala und versatz kommen
  // obendrauf. Beide gehoeren ins Blatt: Rettung und Tod schrumpfen im Modell
  // und nicht im Zeichner.
  const skala = (bild && bild.skala) != null ? bild.skala : 1;
  wurzel.scale.setScalar(eichFaktor * skala);
  wurzel.position.y = eichVersatz + ((bild && bild.versatz) || 0) * FIGUR_EINHEITEN;
  wurzel.updateMatrixWorld(true);
  renderer.render(scene, camera);

  const vorn = (v) => v.clone().applyAxisAngle(HOCHACHSE, -dreh);

  const g = new THREE.Vector3();
  gesicht.getWorldPosition(g);

  // Die vordere Pfote — ausgewaehlt in der **Vorderansicht**, damit die Wahl
  // nicht ab einem bestimmten Drehwinkel umspringt.
  let hand = null;
  let handVorn = null;
  for (const name of ['L_Ellbogen', 'R_Ellbogen']) {
    const a = gelenke[name];
    if (!a) continue;
    const t = a.localToWorld(new THREE.Vector3(0, -ARM_LAENGE * 0.5, 0));
    const v = vorn(t);
    if (!handVorn || v.z > handVorn.z) {
      hand = t;
      handVorn = v;
    }
  }

  // Anschnittpruefung: Beruehrt etwas Undurchsichtiges den Zellrand?
  const px = new Uint8Array(GROESSE * 4);
  const gl = renderer.getContext();
  const rand = () => {
    const proben = [];
    for (const y of [0, GROESSE - 1]) {
      gl.readPixels(0, y, GROESSE, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      for (let i = 3; i < GROESSE * 4; i += 4) if (px[i] > 24) proben.push('waagerecht');
    }
    const spalte = new Uint8Array(GROESSE * 4);
    for (const x of [0, GROESSE - 1]) {
      gl.readPixels(x, 0, 1, GROESSE, gl.RGBA, gl.UNSIGNED_BYTE, spalte);
      for (let i = 3; i < GROESSE * 4; i += 4) if (spalte[i] > 24) proben.push('senkrecht');
    }
    return proben.length;
  };

  return {
    bild: renderer.domElement.toDataURL('image/png'),
    gesicht: zelle(g),
    hand: hand ? zelle(hand) : null,
    anschnitt: rand(),
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
