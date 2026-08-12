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
 * Dazu meldet jede Zeile ihr Mass: Breite und Hoehe des Umrisses in logischen
 * Pixeln und wie weit die Sohle vom Boden abweicht. Das ist die Zahl, an der
 * sich eine Pose entscheidet, bevor jemand sie im Spiel sieht — die Simulation
 * stoesst mit **einer** Spalte an, und was seitlich darueber hinaussteht, kann
 * in einer Wand stecken, ohne dass sie davon weiss.
 *
 * ## Was eine Pose ueber ihren Platz sagen darf
 *
 * Vier Angaben duerfen in der Posendatei stehen und gelten fuer die ganze Zeile:
 * `dreh` setzt den Blickwinkel (sonst gilt `DREHUNG_GRAD`), `boden` setzt die
 * Sohle des tiefsten Bildes auf die Standlinie, `mitte` legt den Umriss in die
 * Zellmitte, `lehne` ueberschreibt die Neigung im Zeichner. Die mittleren beiden
 * braucht jede Pose, die den Koerper aus der Senkrechten nimmt: Die Eichung
 * setzt die Sohle nur einmal, in der aufrechten Ruhelage.
 *
 * Die Uebersicht ueber alle zwoelf Posen steht in `docs/erdmaennchen-posen.md`.
 *
 * Aufruf: `node scripts/bake-erdmaennchen.mjs [--pose walking] [--probe] [--name x]`
 * Zum Ausprobieren: `--variante <datei.json>` ersetzt eine Zeile, `--weit 1.8`
 * zeichnet mit weiterem Blickfeld (nur zum Ansehen, nie zum Backen).
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
/**
 * Eine Posendatei, die eine Zeile **ersetzt**, ohne im Posenordner zu liegen.
 *
 * Damit laesst sich ein Gang bauen und ansehen, bevor er den vorhandenen
 * ueberschreibt: `--pose walking --variante .../vierfuessig.json --probe`. Ohne
 * diesen Weg muesste man die gute Fassung erst wegwerfen, um die neue zu sehen.
 */
const variante = args.includes('--variante') ? args[args.indexOf('--variante') + 1] : null;
/**
 * Nur zum Ansehen: die Zellen mit weiterem Blickfeld zeichnen.
 *
 * Eine Pose, die noch nicht sitzt, laeuft aus der Zelle — und dann sieht man auf
 * dem Kontrollbild genau das nicht, was schiefgeht. Mit `--weit 1.8` steht die
 * ganze Figur im Bild, wenn auch kleiner. Zum Backen ist das verboten: Der
 * Massstab der Zelle haengt an `SICHT`.
 */
const weit = args.includes('--weit') ? Number(args[args.indexOf('--weit') + 1]) : 1;
if (weit !== 1 && !probe) throw new Error('--weit gibt es nur mit --probe: es verstellt den Massstab.');

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
  // Die dreizehnte Zeile, und die einzige, die **keinem** Simulationszustand
  // entspricht. Der Zeichner setzt sie ein, wenn eine laufende Figur nicht von
  // der Stelle kommt; `DEFAULT_MANIFEST` kennt sie deshalb nicht, und ein Blatt
  // ohne sie funktioniert weiter.
  { name: 'spaehen', holds: [14, 14, 14, 14, 14, 14] },
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
  // Fast frontal. Das Sichern richtet sich an den Betrachter, und der Blick
  // wandert nach links und rechts — im Profil saehe man davon nichts.
  spaehen: 16,
};

const FIGUR_EINHEITEN = 0.861;
const SICHT = 1.22;
const FUSS_PX = 3;
/**
 * Wie weit die ganze Figur in der Zelle nach hinten rueckt, in logischen Pixeln.
 *
 * Eine Eigenschaft des **Modells**, nicht der Pose: Sein Nullpunkt sitzt im
 * Becken, ein gutes Stueck hinter der Koerpermitte. Ungerueckt steht deshalb
 * jede Pose rechtslastig in der Zelle — beim Rammen 4,7 Pixel links gegen 8,9
 * rechts —, und was ueber 8,5 hinausgeht, schneidet die Zelle ab.
 *
 * **Ein** Wert fuer alle Posen, und das ist der Punkt. Jede Pose einzeln zu
 * mitteln waere naheliegend und falsch: Die Verschiebung fiele je Pose anders
 * aus (beim Hochziehen 2,8 Pixel, beim Sterben 0,3), und die Figur spraenge beim
 * Wechsel der Pose seitwaerts. Der Versatz gehoert zur Figur, also gilt er
 * ueberall gleich.
 *
 * Bemessen wird er an der Pose, die am weitesten nach vorn reicht — das ist der
 * Gang auf allen vieren mit vorgestreckter Vorderpfote. Die Gegenprobe ist die
 * linke Seite: Nach der Verschiebung darf auch die weiteste Pose dort die
 * Zellhaelfte von 8,5 nicht ueberschreiten (weitester Wert: Rettung, 7,0).
 */
const SEITENVERSATZ = 2.2;
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
if (variante) {
  if (!nurPose) throw new Error('--variante braucht --pose: welche Zeile soll ersetzt werden?');
  posen[nurPose] = JSON.parse(readFileSync(variante, 'utf8'));
  console.log(`Variante: ${nurPose} kommt aus ${variante}`);
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
const LOGISCH = ${LOGISCH};
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
  //
  // Das Kind wird nach **Abstand** gewaehlt und nicht nach Reihenfolge. Dieses
  // Rig haengt an mehrere Gelenke einen Verdrehknochen, der an genau derselben
  // Stelle sitzt wie sein Elternteil — bei fuenf Knochen steht so einer an
  // erster Stelle. Sein Abstand ist 0,0001; normalisiert ergibt das den
  // Nullvektor, und setFromUnitVectors bekommt eine Achse, die keine ist.
  //
  // Der Fehler war vollkommen still. Er meldet nichts, er stuerzt nicht ab, die
  // Pose sieht nur nicht so aus wie ihre Tabelle: Nahseitiger Oberarm,
  // nahseitiger Oberschenkel und **beide** Unterarme haben ihre Zielrichtung in
  // allen zwoelf Posen verworfen und sind in Ruhelage stehengeblieben. Man
  // haelt das fuer eine schlecht getroffene Pose und stellt an den Zahlen
  // nach — die richtig waren.
  const ohneAchse = [];
  for (const [name, b] of Object.entries(knochen)) {
    let kind = null;
    for (const c of b.children) {
      if (!c.isBone) continue;
      if (!kind || c.position.lengthSq() > kind.position.lengthSq()) kind = c;
    }
    const brauchbar = !!kind && kind.position.length() > 1e-3;
    if (kind && !brauchbar) ohneAchse.push(name);
    const achse = brauchbar ? kind.position.clone().normalize() : new THREE.Vector3(0, 1, 0);
    ruhe[name] = { q: b.quaternion.clone(), achse, hatKind: brauchbar };
  }
  // Nach Tiefe sortieren: Eltern zuerst. Die Weltdrehung eines Kindes haengt an
  // der schon gesetzten Drehung seines Elternteils.
  ordnung = Object.keys(knochen).sort((x, y) => {
    const tiefe = (o) => { let n = 0; for (let p = o; p; p = p.parent) n++; return n; };
    return tiefe(knochen[x]) - tiefe(knochen[y]);
  });
  return { knochen: Object.keys(knochen).length, netz: !!netz, ohneAchse };
};

/**
 * Eine Pose setzen: je Knochen eine Zielrichtung im Modellraum.
 *
 * Gerechnet wird von aussen nach innen — erst Eltern, dann Kinder —, weil die
 * Weltdrehung eines Knochens die schon gesetzte seines Elternteils enthaelt.
 */
function stelle(richtungen, winkel, skala) {
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
    // Auch den Massstab, und das ist kein Beiwerk: Der gestreckte Hals des
    // vierfuessigen Gangs blieb sonst stehen und machte aus allen elf folgenden
    // Posen Giraffen. Zurueckgesetzt wird, was gesetzt werden kann.
    b.scale.set(1, 1, 1);
  }
  // Der Kopfmassstab gehoert zur Figur, nicht zur Pose — er ueberlebt jede
  // Ruecksetzung.
  if (knochen.Head) knochen.Head.scale.setScalar(1.12);
  // Einzelne Knochen laenger machen.
  //
  // Fuer den Hals unverzichtbar. Er misst in diesem Modell 0,068 Einheiten —
  // keinen ganzen logischen Pixel. Aufrecht faellt das nicht auf; waagerecht
  // sitzt der Kopf damit unmittelbar auf den Schultern, und die Vorderbeine
  // sehen aus, als waeren sie am Kopf angewachsen. Genau so kam es zurueck.
  //
  // Der Massstab eines Knochens vererbt sich an seine Kinder, deshalb wird der
  // Kopf gegengerechnet: Sonst waechst er mit dem Hals mit.
  if (skala) {
    for (const [name, k] of Object.entries(skala)) {
      if (knochen[name]) knochen[name].scale.setScalar(k);
    }
    const kette = ['NeckTwist01', 'NeckTwist02'].reduce((a, nm) => a * (skala[nm] ?? 1), 1);
    if (knochen.Head && kette !== 1) knochen.Head.scale.setScalar(1.12 / kette);
  }
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
  const rueck = new THREE.Quaternion();
  const dreh = new THREE.Quaternion();
  const ziel = new THREE.Vector3();
  const ruheRichtung = new THREE.Vector3();
  for (const name of ordnung) {
    const soll = richtungen[name];
    if (!soll || !knochen[name] || !ruhe[name].hatKind) continue;
    const b = knochen[name];
    b.parent.updateWorldMatrix(true, false);
    b.parent.getWorldQuaternion(eltern);
    // Zielrichtung vom Modellraum in den Raum des Elternteils.
    rueck.copy(eltern).invert();
    ziel.set(soll[0], soll[1], soll[2]).normalize().applyQuaternion(rueck);
    // Die Eigendrehung des Knochens **behalten** und nur die Achse umlegen.
    //
    // Vorher stand hier setFromUnitVectors(achse, ziel) — die Eigendrehung war
    // damit weg, ersetzt durch die kuerzeste Drehung aus der Kinderrichtung. Die
    // Achse stimmte danach, alles was quer daran haengt aber nicht: An Spine02
    // sitzen die beiden Schluesselbeine seitlich ab, und die Ersatzdrehung
    // verkippte sie gegeneinander. Gemessen stand die **linke Schulter 0,144
    // Einheiten hoeher als die rechte**, in jeder Pose, und die linke Vorderpfote
    // erreichte den Boden nie. Auf dem Blatt sah das nach einer schlecht
    // getroffenen Pose aus.
    //
    // Jetzt wird von der **Ruherichtung** des Kindes auf das Ziel gedreht und
    // die Drehung auf die Ruhelage gesetzt. Die Achse landet genauso, die
    // Verdrehung des Knochens ueberlebt.
    ruheRichtung.copy(ruhe[name].achse).applyQuaternion(ruhe[name].q);
    dreh.setFromUnitVectors(ruheRichtung, ziel);
    b.quaternion.copy(dreh).multiply(ruhe[name].q);
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

/**
 * Der Umriss des gerenderten Bildes: die Grenzen aller undurchsichtigen Punkte,
 * in Zellkoordinaten mit Ursprung oben links.
 *
 * Gemessen an den **Bildpunkten**, nicht an einer Huellbox des Modells. Eine
 * Huellbox von THREE.Box3 kennt nur die Bindepose — sie wuerde jede Pose gleich
 * gross melden. Und der Anschnitt, die Bodenlage und der Ueberstand haengen alle
 * drei am tatsaechlich sichtbaren Umriss, nicht am ungeposten Netz.
 */
function kasten() {
  const gl = renderer.getContext();
  const px = new Uint8Array(GROESSE * GROESSE * 4);
  gl.readPixels(0, 0, GROESSE, GROESSE, gl.RGBA, gl.UNSIGNED_BYTE, px);
  let x0 = GROESSE, x1 = -1, y0 = GROESSE, y1 = -1;
  // Je Bildzeile die Randpunkte merken — daraus faellt gleich die Standflaeche ab.
  const zl = new Int32Array(GROESSE).fill(GROESSE);
  const zr = new Int32Array(GROESSE).fill(-1);
  for (let gy = 0; gy < GROESSE; gy++) {
    // readPixels zaehlt von unten, das Bild von oben.
    const y = GROESSE - 1 - gy;
    const basis = gy * GROESSE * 4;
    for (let x = 0; x < GROESSE; x++) {
      if (px[basis + x * 4 + 3] <= 24) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      if (x < zl[y]) zl[y] = x;
      if (x > zr[y]) zr[y] = x;
    }
  }
  if (x1 < 0) return null;
  // Die Standflaeche: die Breite des Umrisses im untersten Streifen.
  //
  // Nicht die Breite der ganzen Figur. Ein aufrechtes Erdmaennchen ist mit
  // Schwanz elf Pixel breit und steht auf dreien; sein Schatten gehoert unter
  // die Fuesse und nicht unter den Schwanz. Zwei logische Pixel Streifen —
  // hoch genug, dass beide Sohlen hineinfallen, flach genug, dass die Waden
  // draussen bleiben.
  const streifen = Math.round(2 * (GROESSE / LOGISCH));
  let fl = GROESSE;
  let fr = -1;
  for (let y = Math.max(0, y1 - streifen); y <= y1; y++) {
    if (zr[y] < 0) continue;
    if (zl[y] < fl) fl = zl[y];
    if (zr[y] > fr) fr = zr[y];
  }
  // Ueber die **Kamera** in Zellkoordinaten und nicht ueber die Bildgroesse.
  // Beim Messen steht das Blickfeld weiter (siehe blick), und dann sind
  // Bildpunkt und Zellpunkt nicht mehr dasselbe.
  const bw = camera.right - camera.left;
  const bh = camera.top - camera.bottom;
  const zx = (p) => ((camera.left + (p / GROESSE) * bw) / SICHT + 0.5) * ZELLE;
  const zy = (p) => ((oben - (camera.top - (p / GROESSE) * bh)) / SICHT) * ZELLE;
  const k = {
    links: zx(x0),
    rechts: zx(x1 + 1),
    oben: zy(y0),
    unten: zy(y1 + 1),
    fuss: fr < 0 ? 0 : zx(fr + 1) - zx(fl),
  };
  k.randberuehrung = k.links < 0.5 || k.oben < 0.5 || k.rechts > ZELLE - 0.5 || k.unten > ZELLE - 0.5;
  return k;
}

/**
 * Das Blickfeld voruebergehend weiten.
 *
 * Zum Messen unverzichtbar. Eine Pose, die aus der Zelle laeuft, wird von ihr
 * **abgeschnitten** — und ein abgeschnittener Umriss meldet genau die Zellbreite
 * zurueck. Man liest dann „passt gerade so", wo in Wahrheit etwas fehlt, und die
 * Mittenkorrektur rechnet gegen eine Kante statt gegen die Figur. Zum Backen
 * bleibt das Blickfeld die Zelle; nur die Messung sieht weiter.
 */
function blick(weite) {
  const mitte = (oben + unten) / 2;
  camera.left = (-SICHT * weite) / 2;
  camera.right = (SICHT * weite) / 2;
  camera.top = mitte + (SICHT * weite) / 2;
  camera.bottom = mitte - (SICHT * weite) / 2;
  camera.updateProjectionMatrix();
}

function zeichne(bild, dreh, grund, seite) {
  stelle(
    bild && bild.richtung ? bild.richtung : null,
    bild && bild.winkel ? bild.winkel : null,
    bild && bild.knochenSkala ? bild.knochenSkala : null,
  );
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
  const hub = (bild && bild.versatz ? bild.versatz : 0) + (grund || 0);
  wurzel.position.y = eichVersatz + hub * FIGUR_EINHEITEN;
  wurzel.position.x = seite || 0;
  wurzel.rotation.set(0, dreh, 0);
  wurzel.updateMatrixWorld(true);
  renderer.render(scene, camera);
}

/**
 * Wieviel eine Pose absacken muss, damit sie auf dem Boden steht.
 *
 * Die Eichung setzt die Sohle **einmal** auf null — in der aufrechten Ruhelage.
 * Das genuegt, solange jede Pose aufrecht ist. Eine Pose auf allen vieren aber
 * legt den Rumpf waagerecht: Ihre tiefste Stelle liegt woanders, und mit dem
 * Versatz der Ruhelage schwebte sie in der Luft.
 *
 * Gemessen wird am **ersten Bild** der Pose, nicht am tiefsten aller Bilder.
 * Sonst zoege der Schritt, der am tiefsten sinkt, die ganze Reihe mit sich, und
 * das Anheben der Pfoten waehrend des Durchschwingens waere weggerechnet. Bild
 * null ist deshalb das Aufsetzbild: Dort steht die Pfote, dort gilt der Boden.
 */
/** Der Umriss eines Einzelbildes ohne jede Platzkorrektur — die Rohmessung. */
window.umriss = (bild, dreh) => {
  blick(1.8);
  zeichne(bild, dreh, 0, 0);
  const k = kasten();
  blick(1);
  return k;
};

/**
 * Aus den Rohumrissen einer Pose: wie weit sie absacken und zur Seite ruecken muss.
 *
 * Beide Achsen nehmen **alle** Bilder, aber verschieden.
 *
 * Senkrecht zaehlt das **tiefste**. Zuerst stand hier das erste Bild — das
 * Aufsetzbild, wo die Pfote steht —, und die Ueberlegung war, dass das tiefste
 * Bild sonst die ganze Reihe mitzoege und das Abheben der Pfoten wegrechnete.
 * Der Gang auf allen vieren hat das widerlegt: Dort setzen zwei Pfoten
 * gleichzeitig auf, und nicht im ersten Bild am tiefsten — sieben Zehntel Pixel
 * standen unter dem Boden. Ein Fuss im Boden ist der schlimmere Fehler, und die
 * befuerchtete Nebenwirkung tritt nicht ein: Beim aufrechten Gang **ist** das
 * erste Bild das tiefste, dort aendert sich nichts.
 *
 * Waagerecht zaehlen alle Bilder zusammen. Eine Seitwaertsverschiebung je Bild
 * gaebe es nicht: Sie waere ein Ruckeln der ganzen Figur. Also eine fuer die
 * Pose, und die muss den gesamten Umriss fassen.
 */
window.platz = (umrisse) => {
  if (!umrisse.length || !umrisse[0]) return { grund: 0, seite: 0 };
  const tiefste = Math.max(...umrisse.map((k) => k.unten));
  const untenWelt = oben - (tiefste / ZELLE) * SICHT;
  // Die Mitte des Umrisses auf die Zellmitte legen.
  //
  // Der Nullpunkt des Modells liegt nicht in der Mitte des Tieres, sondern dort,
  // wo der Bildhauer ihn gelassen hat — bei diesem im Becken, ein gutes Stueck
  // hinter der Koerpermitte. Aufrecht faellt das nicht auf. Waagerecht schon:
  // Dann steht die Schnauze weit vor der Spalte, mit der die Simulation
  // anstoesst, und das Tier beruehrt eine Wand, von der die Simulation nichts
  // weiss. Die Verschiebung sitzt an der Wurzel und damit **hinter** der Drehung
  // — sie ist eine reine Bildverschiebung und kann die Pose nicht verbiegen.
  const links = Math.min(...umrisse.map((k) => k.links));
  const rechts = Math.max(...umrisse.map((k) => k.rechts));
  const mitteWelt = (((links + rechts) / 2 / ZELLE) - 0.5) * SICHT;
  return { grund: -untenWelt / FIGUR_EINHEITEN, seite: -mitteWelt };
};

/** Weltstellen benannter Knochen nach dem letzten Zeichnen — nur zur Diagnose. */
window.knochenOrt = (namen) => {
  const aus = {};
  for (const nm of namen) {
    const b = knochen[nm];
    if (!b) continue;
    const p = new THREE.Vector3();
    b.getWorldPosition(p);
    aus[nm] = [Number(p.x.toFixed(4)), Number(p.y.toFixed(4)), Number(p.z.toFixed(4))];
  }
  return aus;
};

window.bild = (bild, dreh, grund, seite, weit) => {
  if (weit && weit !== 1) blick(weit);
  zeichne(bild, dreh, grund, seite);
  const png = renderer.domElement.toDataURL('image/png');
  if (weit && weit !== 1) blick(1);

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

  // Nachgemessen im weiten Blickfeld: Was ueber die Zelle hinaussteht, soll als
  // Ueberstand in der Zahl stehen und nicht am Zellrand aufhoeren.
  blick(1.8);
  zeichne(bild, dreh, grund, seite);
  const k = kasten();
  blick(1);

  return {
    bild: png,
    gesicht: zelle(g),
    hand: hand ? zelle(hand) : null,
    anschnitt: k && k.randberuehrung ? 1 : 0,
    kasten: k,
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

// Wer keine brauchbare Achse hat, kann keine Zielrichtung annehmen. Das laut zu
// sagen ist der ganze Unterschied: Ohne diese Zeile bleibt so ein Knochen
// stumm in Ruhelage stehen, und man sucht den Fehler in der Posentabelle.
const stumm = geladen.ohneAchse.filter((n) =>
  Object.values(posen).some((p) => p.frames?.some((f) => f.richtung?.[n])),
);
if (stumm.length) {
  console.log(`  ! ohne brauchbare Achse, Richtung wird verworfen: ${stumm.join(', ')}`);
}

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
/** Der gemessene Drehwinkel je Pose — die Variante darf ihn mitbringen. */
const drehungen = {};
/** Die gemessene Standflaeche je Pose, in logischen Pixeln. */
const standflaechen = {};
let anschnitte = 0;
for (const z of zeilen) {
  const reihe = ZEILEN.findIndex((x) => x.name === z.name);
  const tabelle = posen[z.name];
  const drehGrad = tabelle?.dreh ?? DREHUNG_GRAD[z.name] ?? 0;
  drehungen[z.name] = drehGrad;
  const dreh = (drehGrad * Math.PI) / 180;

  // Eine Pose, die ihren Platz in der Zelle selbst sucht. Siehe `window.platz`.
  let grund = 0;
  let seite = -(SEITENVERSATZ / LOGISCH) * SICHT;
  if (tabelle?.boden) {
    const umrisse = [];
    for (let i = 0; i < z.holds.length; i++) {
      const b = tabelle.frames[i] ?? tabelle.frames[0];
      umrisse.push(await page.evaluate(([x, d]) => window.umriss(x, d), [b, dreh]));
    }
    const p = await page.evaluate((u) => window.platz(u), umrisse);
    grund = p.grund;
    if (tabelle.mitte) seite = p.seite;
  }

  const masse = [];
  for (let i = 0; i < z.holds.length; i++) {
    const bild = tabelle?.frames?.[i] ?? tabelle?.frames?.[0] ?? null;
    const r = await page.evaluate(
      ([b, d, g, s, w]) => window.bild(b, d, g, s, w),
      [bild, dreh, grund, seite, weit],
    );
    bilder.push({ pose: z.name, reihe, spalte: i, png: r.bild });
    gesichter.push({ pose: z.name, bild: i, punkt: r.gesicht });
    haende.push({ pose: z.name, bild: i, punkt: r.hand ?? r.gesicht });
    if (r.kasten) masse.push(r.kasten);
    if (process.env.FUESSE) {
      const o = await page.evaluate(
        (nm) => window.knochenOrt(nm),
        ['L_Upperarm', 'R_Upperarm', 'L_Forearm', 'R_Forearm', 'L_Hand', 'R_Hand'],
      );
      const sp = (a, b) => `${a[1].toFixed(3)}/${b[1].toFixed(3)}`;
      console.log(
        `    Bild ${i}: Schulter ${sp(o.L_Upperarm, o.R_Upperarm)}  ` +
          `Ellbogen ${sp(o.L_Forearm, o.R_Forearm)}  Hand ${sp(o.L_Hand, o.R_Hand)}`,
      );
    }
    if (r.anschnitt > 0) {
      anschnitte++;
      console.log(`  ! ${z.name} Bild ${i} beruehrt den Zellrand`);
    }
  }

  // Der Umriss in logischen Bildpunkten — das Mass, an dem sich eine waagerechte
  // Figur entscheidet. Die Simulation stoesst mit **einer** Spalte an, gezeichnet
  // wird um diese Spalte herum; was seitlich darueber hinaussteht, kann an einer
  // Wand stecken, ohne dass die Simulation davon weiss.
  if (masse.length) {
    const inPx = (v) => (v / ZELLE) * LOGISCH;
    const mitte = LOGISCH / 2;
    const links = Math.max(...masse.map((k) => mitte - inPx(k.links)));
    const rechts = Math.max(...masse.map((k) => inPx(k.rechts) - mitte));
    const hoch = Math.max(...masse.map((k) => inPx(k.unten - k.oben)));
    const sohle = masse.map((k) => LOGISCH - FUSS_PX / PPL - inPx(k.unten));
    // Zwei Diagnosen hinter Umgebungsvariablen. Beide sind aus je einem Fehler
    // entstanden, den man dem Blatt nicht ansah: SOHLE=1 zeigt, welches Bild
    // schwebt oder einsinkt; FUESSE=1 zeigt Weltstellen einzelner Knochen und
    // hat die verkippten Schultern gefunden.
    if (process.env.SOHLE) console.log('    Sohlen je Bild: ' + sohle.map((x) => x.toFixed(2)).join(' '));
    standflaechen[z.name] = Number(
      Math.max(...masse.map((m) => inPx(m.fuss))).toFixed(2),
    );
    process.stdout.write(
      `  ${z.name} (${z.holds.length})${tabelle ? '' : ' — Ruhelage'}  ` +
        `${drehGrad}gr  breit ${(links + rechts).toFixed(1)}px ` +
        `(li ${links.toFixed(1)}/re ${rechts.toFixed(1)}), hoch ${hoch.toFixed(1)}px, ` +
        `Stand ${Math.max(...masse.map((m) => inPx(m.fuss))).toFixed(1)}px, ` +
        `Sohle ${Math.min(...sohle).toFixed(2)}..${Math.max(...sohle).toFixed(2)}px ueber Grund\n`,
    );
  }
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
    const text =
      `${was}punkt liegt bei ${raus.length} Bildern ausserhalb der Zelle ` +
      `(zuerst ${raus[0].pose} Bild ${raus[0].bild}).`;
    // Im weiten Blickfeld ist das kein Abbruchgrund, sondern der Befund: Diese
    // Betriebsart gibt es nur, um eine Pose anzusehen, die noch nicht sitzt.
    if (weit !== 1) {
      console.log(`  ! ${text}`);
    } else {
      await browser.close();
      server.close();
      throw new Error(text);
    }
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
          dreh: drehungen[z.name] ?? DREHUNG_GRAD[z.name] ?? 0,
          // Die Standflaeche in logischen Pixeln — die Breite des Umrisses im
          // untersten Streifen. Der Kontaktschatten haengt daran: Ein aufrecht
          // stehendes Tier steht auf drei Pixeln, eines auf allen vieren auf
          // zehn, und ein Schatten, der das nicht weiss, gehoert zur falschen
          // Figur.
          fuss: standflaechen[z.name] ?? 0,
          // Wie weit der Zeichner das Bild zusaetzlich neigt. Steht sie in der
          // Posendatei, gilt sie; sonst die Tabelle `LEHNE` im Zeichner. Eine
          // Pose, die die Neigung schon im Koerper hat, braucht keine zweite.
          ...(posen[z.name]?.lehne !== undefined ? { lehne: posen[z.name].lehne } : {}),
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
