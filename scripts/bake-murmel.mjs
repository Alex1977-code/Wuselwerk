/**
 * Backt das Figurenblatt der **Murmel** aus `art-src/murmel/murmel_posen.glb`.
 *
 * ## Warum dieser Weg ein anderer ist als bei der Vorgaengerfigur
 *
 * Das alte Blatt entstand aus einem Modell **ohne** Animationen: Jede Pose war
 * eine von Hand geschriebene Winkeltabelle, und der Backvorgang musste die
 * Knochen selbst stellen. Die Murmel bringt ihre zwoelf Animationen mit, mit
 * Stufeninterpolation und den Taktzeiten aus der Integrationsdatei. Damit faellt
 * der ganze schwierige Teil weg — es wird nur noch abgetastet.
 *
 * ## Die Probe, die diesen Vorgang absichert
 *
 * Das Modell wird nicht nur gerendert. Zu jedem Einzelbild wird zusaetzlich die
 * Weltposition des Knochens `Crown` in Zellkoordinaten umgerechnet und **gegen
 * die mitgelieferte Ankertabelle geprueft**. Diese Tabelle sagt, wo der Schopf
 * sitzt; stimmt sie nicht mit dem Bild ueberein, sitzt er in jedem Bild des
 * Spiels falsch — und zwar unauffaellig genug, dass man es fuer schlechtes
 * Zeichnen haelt statt fuer einen Rechenfehler. Weicht ein Bild um mehr als
 * `TOLERANZ` Bildpunkte ab, bricht der Vorgang ab.
 *
 * ## Die Ansicht
 *
 * Gebacken wird in **Dreiviertelansicht**, je Pose verschieden weit — siehe
 * `DREHUNG_GRAD`. Das ist die Antwort auf „laeuft seitwaerts" und die einzige
 * Stelle, an der sie zu geben ist: Im Zeichner bleiben die Augen in der Mitte,
 * weil sie ins Bild gebacken sind.
 *
 * Aufruf: `node scripts/bake-murmel.mjs [--pose walking] [--probe]`
 *         `[--dreh 42] [--name w42]` — beides nur zum Ausprobieren einzelner
 *         Winkel; die verbindliche Tabelle steht unten.
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { extname, join } from 'node:path';

const GLB = 'art-src/murmel/murmel_posen.glb';
const ANKER = 'art-src/murmel/murmel_posen_anker.json';
const ZIEL = 'src/art';

const args = process.argv.slice(2);
const nurPose = args.includes('--pose') ? args[args.indexOf('--pose') + 1] : null;
const probe = args.includes('--probe');
/** Alle Posen mit demselben Winkel backen — nur zum Ausprobieren. */
const drehAlle = args.includes('--dreh') ? Number(args[args.indexOf('--dreh') + 1]) : null;
/** Abweichender Ausgabename der Probe, damit man Winkel nebeneinander legen kann. */
const probeName = args.includes('--name') ? args[args.indexOf('--name') + 1] : 'murmel-blatt';

/**
 * Wie weit sich die Figur je Pose aus der Kamera **wegdreht**, in Grad.
 *
 * ## Das Problem, das nur hier zu loesen ist
 *
 * „Laeuft seitwaerts." Die Rueckmeldung kam zweimal, und beim zweiten Mal war
 * klar, dass es keine Frage der Neigung ist: Die Murmel wurde bis dahin in
 * **reiner Vorderansicht** gebacken. Augen mittig, Arme nach beiden Seiten,
 * spiegelsymmetrischer Umriss. So eine Figur kann sich waagerecht bewegen,
 * soviel sie will — das Auge liest Verschiebung, nicht Gang. Sie sieht den
 * Betrachter an und rutscht dabei zur Seite.
 *
 * Im Zeichner laesst sich das nicht beheben. Neigen, stauchen, scheren: Alles
 * davon verschiebt Pixel, aber **die Augen bleiben in der Mitte**, weil sie ins
 * Bild gebacken sind. Und die Blickrichtung ist der staerkste Richtungshinweis,
 * den eine Figur ueberhaupt hat.
 *
 * ## Warum eine Drehung um die Hochachse
 *
 * Weil sie genau das tut, was fehlt, und sonst nichts: Ein Koerper, der sich um
 * seine Hochachse dreht, behaelt seine Hoehe, seinen Fusspunkt und seine
 * Silhouettenbreite ungefaehr — aber seine Augen wandern in die Blickrichtung,
 * und der vordere Arm kommt nach vorn. Das ist die Dreiviertelansicht, mit der
 * jedes Zeichentrickstudio seit hundert Jahren Bewegungsrichtung erzaehlt.
 *
 * ## Warum nicht alle Posen gleich
 *
 * Weil nicht jede Pose eine Richtung hat. Ein Blocker steht ausdruecklich
 * frontal — das ist seine ganze Aussage („bis hierher und nicht weiter"), und
 * ihn wegzudrehen hiesse, ihm zu widersprechen. Rettung und Tod sind
 * Zustaende, keine Bewegungen. Der Rest dreht sich, und zwar unterschiedlich
 * weit: Wer geht, zeigt am meisten Profil; wer an einer Wand steht und
 * hineinhaemmert, weniger, weil er sonst aus der Wand herausdreht.
 *
 * Positiv heisst: nach rechts, in die Blickrichtung des ungespiegelten Blatts.
 */
const DREHUNG_GRAD = {
  walking: 42,
  falling: 24,
  floating: 18,
  climbing: 30,
  hoisting: 34,
  building: 38,
  bashing: 34,
  mining: 36,
  digging: 26,
  // Der Blocker bleibt frontal. Siehe oben.
  blocking: 0,
  saving: 16,
  dying: 0,
};

/**
 * Ueberabtastung je Achse.
 *
 * Gerendert wird neunmal so gross und danach verkleinert. Das ist kein Luxus:
 * Die Murmel hat runde Kanten und duenne Arme, und eine Kante, die direkt in
 * Zielaufloesung entsteht, franst an jeder Rundung aus.
 */
const SS = 6;

const anker = JSON.parse(readFileSync(ANKER, 'utf8'));
const ZELLE = anker.zelle_px; // 112

/**
 * Wie gross die Figur im Spiel erscheint.
 *
 * Die Integrationsdatei nennt die Zelle „28 x 28 logisch". Das ist die Groesse,
 * in der die Vorlage gedacht ist — sie passt aber nicht zu **dieser**
 * Simulation: Der Koerper der Murmel fuellt 0,861 von 1,22 Modelleinheiten,
 * also gut 70 % der Zelle. Bei 28 logischen Pixeln waere er 19,8 hoch, waehrend
 * die Simulation mit `WUSEL_H = 12` rechnet.
 *
 * Das ist kein Schoenheitsfehler. Die Figur waere dann eineinhalbmal so hoch
 * wie ihr eigener Koerper in der Welt: Der Kopf ragte durch Decken, unter denen
 * sie hindurchlaeuft, und stuende neben Tueren, durch die sie passt. Deshalb
 * wird die **logische** Zellgroesse aus der Figurenhoehe zurueckgerechnet. Das
 * Bild bleibt unveraendert 112 Bildpunkte gross — es aendert sich nur, wie
 * viele logische Pixel es beschreibt, und das ist genau die Aufgabe von `ppl`.
 */
const FIGUR_EINHEITEN = 0.861;
const WUSEL_H = Number(
  readFileSync('src/core/constants.ts', 'utf8').match(/WUSEL_H = (\d+)/)[1],
);
const LOGISCH = Number((WUSEL_H / (FIGUR_EINHEITEN / 1.22)).toFixed(3));
const PPL = ZELLE / LOGISCH;
const SPALTEN = anker.spalten; // 8
const REIHEN = anker.reihenfolge;

/**
 * Was die Zelle abdeckt, in Modelleinheiten — aus der Integrationsdatei §3.
 * Bewusst 8 % weiter als noetig, damit die breiteste Pose (`dying`,
 * flachgedrueckt) nicht beschnitten wird.
 */
const SICHT = 1.22;
/** Die Fusslinie liegt drei Bildpunkte ueber der Zellunterkante. */
const FUSS_PX = 3;
/**
 * Wie weit die Hand vom Armknochen entfernt liegt, in Modelleinheiten.
 *
 * Das Rig hat keinen Handknochen — der Arm ist ein einzelner Knochen bei
 * y = 0,455, und alles davor ist nur Haut. Gemessen an der Figurenhoehe von
 * 0,861 reicht ein Arm etwa ein Viertel davon nach aussen. Die Zahl muss nicht
 * genau sein: Laut Vorlage liest der Spieler die **Achse** des Werkzeugs, nicht
 * seine Ansatzstelle. Ein paar Hundertstel daneben sieht niemand, eine falsche
 * Achse jeder.
 */
const ARM_LAENGE = 0.21;

/** Zulaessige Abweichung der nachgerechneten Ankerpunkte, in Bildpunkten. */
const TOLERANZ = 1.5;

const posenListe = nurPose ? [nurPose] : REIHEN;
for (const p of posenListe) {
  if (!anker.posen[p]) throw new Error(`Pose ${p} steht nicht in der Ankertabelle`);
}

/**
 * Startzeit jedes Einzelbildes in Sekunden.
 *
 * Die Animationen liegen mit Stufeninterpolation vor, jedes Bild haelt seine
 * Taktzahl. Abgetastet wird in der **Mitte** des Haltefensters und nicht an
 * seinem Anfang: Genau auf einer Stufenkante haengt es vom Rundungsverhalten
 * ab, welches der beiden Bilder man bekommt, und ein einziges falsch getroffenes
 * Bild verschiebt die ganze Pose um eins.
 */
function zeitpunkte(pose) {
  const f = anker.posen[pose].frames;
  const t = [];
  let s = 0;
  for (const fr of f) {
    t.push((s + fr.ticks / 2) / 60);
    s += fr.ticks;
  }
  return t;
}

const AUFTRAG = posenListe.map((name, i) => ({
  name,
  reihe: REIHEN.indexOf(name),
  spalte0: 0,
  zeiten: zeitpunkte(name),
  anker: anker.posen[name].frames.map((f) => f.anchor_px),
  dreh: ((drehAlle ?? DREHUNG_GRAD[name] ?? 0) * Math.PI) / 180,
  index: i,
}));

// --- Seite -------------------------------------------------------------------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

// Achtung beim Bearbeiten: Alles bis zum schliessenden Zeichen ist eine
// Vorlagenzeichenkette. Ein einzelnes Rueckwaertshochkomma darin — auch in einem
// Kommentar — beendet sie vorzeitig, und der Fehler zeigt dann auf eine
// harmlose Kommentarzeile. Deshalb steht hier drinnen keins.
const PAGE = `<!doctype html><meta charset="utf-8">
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
const ARM_LAENGE = ${ARM_LAENGE};
const GROESSE = ZELLE * SS;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(GROESSE, GROESSE, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Beleuchtung. Weich und von schraeg oben vorn, dazu viel Grundlicht: Die
// Murmel ist ein heller, matter Kiesel — harte Schlaglichter wuerden aus ihr
// einen Plastikball machen. Das Gegenlicht von hinten unten hebt die Silhouette
// vom Hintergrund ab, ohne dass eine Kontur gezeichnet werden muesste.
scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8f80, 2.1));
const key = new THREE.DirectionalLight(0xfff4e2, 1.5);
key.position.set(-0.6, 1.2, 1.4);
scene.add(key);
const rim = new THREE.DirectionalLight(0xdfe8ff, 0.55);
rim.position.set(0.8, -0.4, -1.0);
scene.add(rim);

// Die Fusslinie soll FUSS_PX ueber der Zellunterkante liegen. Die Kamera
// umfasst SICHT Einheiten; daraus folgt, wie weit ihr unterer Rand unter y = 0
// liegen muss.
const unten = -(FUSS_PX / ZELLE) * SICHT;
const oben = unten + SICHT;
const camera = new THREE.OrthographicCamera(-SICHT / 2, SICHT / 2, oben, unten, 0.01, 20);
camera.position.set(0, 0, 6);
camera.lookAt(0, 0, 0);

let mixer = null;
let wurzel = null;
let crown = null;
const arme = [];
const clips = {};

window.laden = async (url) => {
  const gltf = await new GLTFLoader().loadAsync(url);
  wurzel = gltf.scene;
  scene.add(wurzel);
  wurzel.traverse((o) => {
    if (o.isBone && o.name === 'Crown') crown = o;
    if (o.isBone && (o.name === 'L_Arm' || o.name === 'R_Arm')) arme.push(o);
    if (o.isMesh) {
      o.frustumCulled = false;
      const m = o.material;
      if (m) {
        // Matt: Die Vorlage zeigt einen kreidigen Kiesel, keinen Kunststoff.
        if (m.roughness !== undefined) m.roughness = 0.92;
        if (m.metalness !== undefined) m.metalness = 0.0;
      }
    }
  });
  mixer = new THREE.AnimationMixer(wurzel);
  for (const c of gltf.animations) clips[c.name] = c;
  return { clips: Object.keys(clips), crown: !!crown };
};

/**
 * Ein Einzelbild rendern und zugleich den Schopfanker nachrechnen.
 *
 * Der Anker ist die Weltposition des Knochens Crown, in Zellkoordinaten
 * umgerechnet. Genau so ist er laut Integrationsdatei entstanden — wenn beides
 * uebereinstimmt, stimmt der Backvorgang.
 */
const HOCHACHSE = new THREE.Vector3(0, 1, 0);

window.bild = (pose, zeit, dreh) => {
  const clip = clips[pose];
  if (!clip) throw new Error('Kein Clip ' + pose);
  mixer.stopAllAction();
  const action = mixer.clipAction(clip);
  action.reset();
  action.play();
  // Die Dreiviertelansicht: Die Figur dreht sich um ihre Hochachse aus der
  // Kamera weg. Begruendung siehe DREHUNG_GRAD im Backskript.
  wurzel.rotation.set(0, dreh, 0);
  mixer.setTime(zeit);
  wurzel.updateMatrixWorld(true);

  renderer.render(scene, camera);

  const zelle = (v) => [(v.x / SICHT + 0.5) * ZELLE, ((oben - v.y) / SICHT) * ZELLE];
  // Zurueck in die Vorderansicht. Die mitgelieferte Ankertabelle ist dort
  // gemessen worden, also muss die Probe auch dort stattfinden — sonst
  // prueft man die Drehung gegen eine Tabelle, die sie nicht kennt, und
  // verliert genau die Absicherung, um die es geht.
  const vorn = (v) => v.clone().applyAxisAngle(HOCHACHSE, -dreh);

  const p = new THREE.Vector3();
  crown.getWorldPosition(p);

  // Der Werkzeugansatz: die **vordere** Hand.
  //
  // Das Rig hat keinen Handknochen, nur die beiden Arme. Genommen wird die
  // Spitze des Armes, der weiter vorn steht — also der, mit dem gearbeitet
  // wird. Die Spitze ist der Armknochen, entlang seiner eigenen Achse
  // verlaengert; ein Knochenursprung allein saesse an der Schulter, und ein
  // Werkzeug aus der Schulter sieht aus wie ein Pfeil im Ruecken.
  //
  // Ausgewaehlt wird in der **Vorderansicht**. Nach einer Drehung um die
  // Hochachse kann der hintere Arm im Bild weiter rechts stehen als der
  // vordere; wer dort auswaehlt, gibt der Figur das Werkzeug in die falsche
  // Hand — und zwar erst ab einem bestimmten Winkel, was die schlechteste
  // Sorte Fehler ist.
  let hand = null;
  let handVorn = null;
  for (const a of arme) {
    const t = a.localToWorld(new THREE.Vector3(0, ARM_LAENGE, 0));
    const v = vorn(t);
    if (!handVorn || v.x > handVorn.x) {
      hand = t;
      handVorn = v;
    }
  }

  return {
    bild: renderer.domElement.toDataURL('image/png'),
    anker: zelle(p),
    ankerVorn: zelle(vorn(p)),
    hand: zelle(hand),
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
    const datei = url.replace(/^\//, '');
    const inhalt = readFileSync(datei);
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
page.on('pageerror', (e) => {
  console.error('Seitenfehler:', e.message);
});
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.bereit === true, null, { timeout: 30000 });

const geladen = await page.evaluate((u) => window.laden(u), `/${GLB}`);
console.log(`Modell geladen — ${geladen.clips.length} Clips, Crown-Knochen ${geladen.crown ? 'da' : 'FEHLT'}`);
if (!geladen.crown) throw new Error('Ohne den Knochen Crown laesst sich der Schopfanker nicht pruefen');

// --- Backen ------------------------------------------------------------------
const bilder = [];
const haende = [];
const anker_gemessen = [];
const abweichungen = [];
for (const a of AUFTRAG) {
  for (let i = 0; i < a.zeiten.length; i++) {
    const r = await page.evaluate(
      ([p, t, d]) => window.bild(p, t, d),
      [a.name, a.zeiten[i], a.dreh],
    );
    bilder.push({ pose: a.name, reihe: a.reihe, spalte: i, png: r.bild });
    haende.push({ pose: a.name, bild: i, hand: r.hand });
    // Der **gemessene** Anker geht ins Blatt, nicht der aus der Tabelle: Er
    // gehoert zu dem Bild, das gerade entstanden ist. Solange nicht gedreht
    // wird, sind beide dasselbe (die groesste Abweichung lag bei 0,30 px) —
    // sobald gedreht wird, ist nur der gemessene richtig.
    anker_gemessen.push({ pose: a.name, bild: i, punkt: r.anker });
    const soll = a.anker[i];
    const dx = r.ankerVorn[0] - soll[0];
    const dy = r.ankerVorn[1] - soll[1];
    abweichungen.push({ pose: a.name, bild: i, dx, dy, ist: r.ankerVorn, soll });
  }
  process.stdout.write(`  ${a.name} (${a.zeiten.length})\n`);
}

// --- Die Probe ---------------------------------------------------------------
let schlimmste = { d: 0 };
for (const w of abweichungen) {
  const d = Math.hypot(w.dx, w.dy);
  if (d > schlimmste.d) schlimmste = { ...w, d };
}
console.log(
  `\nSchopfanker gegen Tabelle: groesste Abweichung ${schlimmste.d.toFixed(2)} px ` +
    `(${schlimmste.pose} Bild ${schlimmste.bild}, ist ${schlimmste.ist.map((v) => v.toFixed(1))} ` +
    `soll ${schlimmste.soll})`,
);
if (schlimmste.d > TOLERANZ) {
  await browser.close();
  server.close();
  throw new Error(
    `Der nachgerechnete Schopfanker weicht um ${schlimmste.d.toFixed(2)} px ab (erlaubt ${TOLERANZ}). ` +
      `Entweder passt die Zellgeometrie nicht oder die Tabelle gehoert zu einem anderen Modell.`,
  );
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
      // Verkleinern in einem Zug: Der Browser mittelt dabei ueber alle
      // Ueberabtastungspunkte, und genau das ist an runden Kanten gewollt.
      ctx.drawImage(img, 0, 0, zelle * ss, zelle * ss, t.spalte * zelle, t.reihe * zelle, zelle, zelle);
    }
    return c.toDataURL('image/webp', 0.9);
  },
  [bilder, ZELLE, SS, SPALTEN, REIHEN.length],
);

mkdirSync(ZIEL, { recursive: true });
const daten = Buffer.from(blatt.split(',')[1], 'base64');

if (probe) {
  mkdirSync('art-src/proben', { recursive: true });
  writeFileSync(`art-src/proben/${probeName}.webp`, daten);
  console.log(`\nProbe: art-src/proben/${probeName}.webp (${Math.round(daten.length / 1024)} kB)`);
} else {
  // Das alte Blatt weicht. Beide Endungen weg, sonst findet `findAtlasSource`
  // womoeglich noch das Vorgaengerbild.
  for (const alt of ['png', 'webp']) {
    const p = join(ZIEL, `wusel.${alt}`);
    if (existsSync(p)) rmSync(p);
  }
  writeFileSync(join(ZIEL, 'murmel.webp'), daten);

  const manifest = {
    image: 'murmel.webp',
    // Welche Figur das Blatt zeigt — siehe `bake-erdmaennchen.mjs`.
    figur: 'murmel',
    cell: { w: LOGISCH, h: LOGISCH },
    // Der Fusspunkt: waagerecht Zellmitte, senkrecht drei Bildpunkte ueber der
    // Unterkante — also in logischen Pixeln.
    anchor: { x: LOGISCH / 2, y: LOGISCH - FUSS_PX / PPL },
    ppl: PPL,
    clips: Object.fromEntries(
      REIHEN.map((name, reihe) => [
        name,
        {
          row: reihe,
          holds: anker.posen[name].frames.map((f) => f.ticks),
          // Wie weit diese Pose aus der Kamera weggedreht gebacken wurde.
          //
          // Steht hier, damit **das Blatt selbst sagt, was es zeigt**. Ohne
          // diese Zahl laesst sich ein altes, frontal gebackenes Blatt nicht
          // von einem neuen unterscheiden — und genau das ist der Fehler, der
          // hier zweimal passiert ist: Man sieht dem Bild nicht an, dass es
          // veraltet ist, man sieht nur, dass die Figur seitwaerts laeuft. Ein
          // Test haelt sich daran fest (siehe `tests/atlas.test.ts`).
          dreh: Number((drehAlle ?? DREHUNG_GRAD[name] ?? 0).toFixed(1)),
          ...(anker.posen[name].loop ? {} : { once: true }),
          // Der Schopf hat je Einzelbild eine eigene Stelle und einen eigenen
          // Zustand. Beides gehoert ins Manifest und nicht in eine zweite
          // Tabelle im Spielcode: Wer neu backt, bekommt es automatisch mit —
          // und genau daran scheitert sonst jede Handpflege.
          // Die Tabelle rechnet in der 28er-Zelle der Vorlage. Hier gilt das
          // aus der Figurenhoehe zurueckgerechnete Mass, also wird umgerechnet
          // — sonst sitzt der Schopf in einer anderen Einheit als der Koerper.
          //
          // Genommen wird der **gemessene** Wert, nicht der aus der Tabelle.
          // Die Tabelle beschreibt die Vorderansicht; das Blatt zeigt seit der
          // Dreiviertelansicht etwas anderes, und der Schopf gehoert auf den
          // Kopf im Bild und nicht auf den in der Tabelle. Dass die Tabelle
          // trotzdem stimmt, prueft der Abgleich weiter oben — dort wird
          // zurueckgedreht.
          anchors: anker_gemessen
            .filter((g) => g.pose === name)
            .sort((a, b) => a.bild - b.bild)
            .map((g) => [
              Number(((g.punkt[0] / ZELLE) * LOGISCH).toFixed(2)),
              Number(((g.punkt[1] / ZELLE) * LOGISCH).toFixed(2)),
            ]),
          tuff: anker.posen[name].frames.map((f) => f.tuff),
          // Ansatz des Werkzeugs je Einzelbild — die vordere Hand, aus dem
          // Modell gemessen. Der Zeichner entscheidet anhand der Pose, ob und
          // welches Geraet daraus waechst.
          hands: haende
            .filter((h) => h.pose === name)
            .sort((a, b) => a.bild - b.bild)
            .map((h) => [
              Number(((h.hand[0] / ZELLE) * LOGISCH).toFixed(2)),
              Number(((h.hand[1] / ZELLE) * LOGISCH).toFixed(2)),
            ]),
        },
      ]),
    ),
  };
  writeFileSync(join(ZIEL, 'murmel.atlas.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nsrc/art/murmel.webp        ${Math.round(daten.length / 1024)} kB`);
  console.log('src/art/murmel.atlas.json  Aufteilung, Haltedauern und Anker');
}

await browser.close();
server.close();
