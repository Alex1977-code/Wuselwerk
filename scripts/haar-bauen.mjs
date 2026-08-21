/**
 * Macht aus der Haarmuetze des Wuselwerkers wieder Haar.
 *
 * Aufruf: `node scripts/haar-bauen.mjs <ein.glb> <aus.glb> [--schaerfe n] [--kegel n]`
 *
 * ## Der Befund
 *
 * Vier Anlaeufe haben versucht, das Haar im ZEICHNER rauh zu machen — Zacken,
 * Straehnen, Kranz, alles zur Laufzeit auf die fertige Blattzelle gemalt. Alle
 * vier haben wenig ausgerichtet, und zwar aus einem Grund, den erst die
 * Messung zeigt: Ein Zeichner, der nur die fertige Zelle sieht, kann Tinte
 * hinzufuegen — aber der grosse Teil davon landet INNERHALB der vorhandenen
 * Kuppel, weil dort schon Haar ist. Umriss kauft man nicht durch Hinzufuegen.
 *
 * ## Was die Messung ausserdem widerlegt hat
 *
 * Die naheliegende Erklaerung lautete: „Das gelieferte Modell hat eine glatte
 * geschlossene Haarschale." **Das stimmt nicht.** Das Kontrollbild des
 * Ausgangsmodells zeigt bereits deutliche Lappen. Was der Schale fehlt, ist
 * nicht Gliederung, sondern **Amplitude**: Ihre Lappen sind rund, ihre Taeler
 * flach, und bei zweiundfuenfzig Geraetepunkten — der Groesse, in der diese
 * Figur wirklich gespielt wird — verschmelzen sie zu einer einzigen blauen
 * Wolke. Genau das ist die Muetze.
 *
 * Daraus folgt der Griff, der hier gemacht wird, und er ist ein anderer als
 * der geplante: Es werden **keine Straehnen angebaut**. Ein Versuch damit
 * steht im Verlauf — siebzehn Straehnen als zweites Netz, 816 Ecken — und er
 * sah bei Spielgroesse aus wie Blaetter, die um den Kopf schweben. Stattdessen
 * wird das VORHANDENE Relief gespreizt: Was herausstand, steht weiter heraus,
 * was dazwischenlag, sinkt ein. Das kostet keine einzige Ecke und keinen
 * einzigen Bildpunkt Blatt, und es wirkt, weil es mit der Form arbeitet, die
 * der Kuenstler schon angelegt hat, statt eine zweite darueberzulegen.
 *
 * ## Was hier passiert
 *
 * 1. Jede Ecke wird ueber ihre Texturstelle als Haar, Haut oder dunkel
 *    eingestuft. **Falle:** glTF zaehlt v von oben. Wer `1-v` abtastet, bekommt
 *    Rauschen und merkt es nicht, weil das Ergebnis plausibel aussieht.
 * 2. Aus den eingestuften Ecken werden die Masse gemessen, an denen alles
 *    haengt — allen voran die Augenlinie, und die ueber DREIECKE, nicht ueber
 *    Ecken: Die Augen sind gemalt, und auf einem Modell mit 3240 Ecken liegt
 *    fast keine davon auf einem gemalten Auge.
 * 3. Das Relief der Haarschale wird gespreizt (`schaerfen`).
 * 4. Ein Knochen `HaarSchwung` kommt unter `Head`, und die Haarschale wird
 *    darauf mitgehaeutet — aussen stark, am Haaransatz gar nicht. Damit hat
 *    die Haarmasse eine eigene Bewegung, die sich in die Posen backen laesst.
 * 5. Herausgeschrieben wird ein neues GLB.
 *
 * ## Die Falle, in die schon gelaufen wurde
 *
 * **Vor dem Posieren ausgeben.** Wird nach dem Posieren exportiert, schreibt
 * der Ausgeber diese Pose als Ruhelage, waehrend die Bindematrizen die alte
 * behalten. Das Modell sieht richtig aus und eicht sich auf 1,053 statt 0,998;
 * die Figur schwebt danach ueber dem Boden. Dieses Skript posiert deshalb
 * ueberhaupt nicht.
 *
 * ## Und was der Scheitel damit zu tun hat
 *
 * Der Backvorgang misst die Huellbox INKLUSIVE Haar und normiert sie auf
 * `FIGUR_EINHEITEN`. Haar, das ueber den Scheitel waechst, macht also nicht
 * die Figur groesser, sondern das Gesicht kleiner. Das Spreizen klemmt deshalb
 * nach oben ab. Dass der Eichfaktor sich dabei um zwei Promille aendert, ist
 * KEIN Fehler und war als Abnahmekriterium falsch gedacht: Die Eichung
 * normiert ja gerade — solange der Faktor nicht SINKT, ist das Gesicht nicht
 * kleiner geworden.
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';

const [ein, aus, ...rest] = process.argv.slice(2);
if (!ein || !aus)
  throw new Error('Aufruf: haar-bauen.mjs <ein.glb> <aus.glb> [--schaerfe n] [--kegel n]');
const flagge = (name, ersatz) => {
  const i = rest.indexOf('--' + name);
  return i >= 0 ? Number(rest[i + 1]) : ersatz;
};

/**
 * Wie stark das vorhandene Relief gespreizt wird (1 = gar nicht).
 *
 * Gemessen an vier Werten und bei echter Spielgroesse angesehen: 1,85 laesst
 * die Lappen noch verschmelzen, 2,8 laesst sie zu Flammen ausfransen und nimmt
 * der Masse ihr Gewicht. 2,4 trennt die Locken sichtbar und haelt die Masse.
 */
const SCHAERFE = flagge('schaerfe', 2.4);

/**
 * Wie weit der Kegel reicht, ueber den der Bezugsradius gemittelt wird.
 *
 * Das ist die Groesse der Kerbe, und sie ist wichtiger als die Staerke: Bei 26
 * Grad wird das grosse Lappenrelief verstaerkt, was in der Dreiviertelansicht
 * — der Ansicht der meisten Posen — fast nichts aendert. Bei 12 Grad entstehen
 * schmale tiefe Kerben zwischen den Locken, und die sieht man auch bei
 * neunundsechzig Bildpunkten Zellgroesse.
 */
const KEGEL_GRAD = flagge('kegel', 12);

/** Groesstes Gewicht, mit dem die Haarschale am Schwungknochen haengt. */
const SCHWUNG_MAX = flagge('schwung', 0.55);

/**
 * Die Halbachsen der Stutzellipse, in **Kopfhalbbreiten**.
 *
 * Nicht in Modelleinheiten, damit die Zahlen etwas bedeuten: 1,0 ist genau der
 * halbe Schaedel, gemessen an der Haut oberhalb der Augen. Alles darueber
 * laesst Haar ueber den Schaedel hinausstehen — das soll es auch, sonst waere
 * es eine Badekappe.
 *
 * Nach oben ist die Zahl folgenlos: Dort reicht das Haar ohnehin nur bis zum
 * Scheitel, und der ist die Eichmarke. Entschieden wird sie **zur Seite**, und
 * zwar an den Straehnen, die spaeter davon abhaengen. Drei Fassungen gebacken
 * und bei Spielgroesse ausgemessen:
 *
 *     1,45 -> Haarmasse 3,50 lp breit, deckt 31,9 % der Figurenhoehe
 *     1,80 -> 3,80 lp, 33,7 %
 *     2,10 -> 3,99 lp, 34,4 %
 *
 * Vorher waren es 9,08 lp und 57,6 % — drei Viertel der Figur waren Haar, und
 * das ist die Kappe.
 *
 * ## Und warum es jetzt noch enger steht: die Kopfhaut zaehlt mit
 *
 * Die erste Wahl fiel auf 2,10, weil fuenf Straehnenwurzeln 3,6 lp Bogen
 * brauchen (0,9 lp Lesegrenze mal vier Zwischenraeume) und 3,99 das gerade
 * hergab. Sie hat eine Groesse uebersehen, die sich hinterher als die
 * wichtigere erwiesen hat: **wieviel Haut der Kopf noch zeigt.**
 *
 * Gemessen am gebackenen Blatt, Kontrast des Haares gegen seine Nachbarn:
 *
 *     Himmel   3,07     Haut   2,50     Hose   1,45     Tunika   1,31     Erde   1,05
 *
 * Die Haut ist nach dem Himmel die beste Nachbarschaft, die diese Figur zu
 * bieten hat — fast doppelt so gut wie die Tunika. Jeder Bildpunkt Haar, der
 * einem Bildpunkt Haut weicht, verkauft also schwachen Kontrast gegen starken.
 * Bei 1,70 / 1,05 kippt das Verhaeltnis Haut zu Haar von 0,88 auf **1,25**:
 * Der Kopf zeigt zum ersten Mal mehr Gesicht als Frisur. Der Haaranteil faellt
 * dabei von 35,5 auf 31,3 Prozent der Hoehe und von 23,2 auf 19,9 der Flaeche.
 *
 * Die Laenge geht dadurch nicht verloren, sie wechselt nur den Ort: Sie kommt
 * aus den gezeichneten Straehnen (`src/render/haar.ts`), und die sind
 * gleichzeitig von fuenf auf vier gegangen, dafuer laenger und dicker. Vier
 * Wurzeln brauchen nur 2,7 lp Bogen — was die engere Kappe noch hergibt.
 */
const STUTZ_SEITE = flagge('stutzSeite', 1.7);
const STUTZ_HOCH = flagge('stutzHoch', 1.05);
const STUTZ_TIEF = flagge('stutzTief', 1.7);
/** Wieviel vom Ueberstand stehenbleibt (0 = harte Kante, siehe `stutzen`). */
const STUTZ_WEICH = flagge('stutzWeich', 0.2);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
};

// Achtung: Vorlagenzeichenkette. Kein Rueckwaertshochkomma hier hinein.
const PAGE = `<!doctype html><meta charset="utf-8"><title>Haar</title>
<script type="importmap">
{"imports":{"three":"/node_modules/three/build/three.module.js",
            "three/addons/":"/node_modules/three/examples/jsm/"}}
</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

let wurzel = null;
let netz = null;
let klasse = null;   // je Ecke: 0 sonstiges, 1 Haar, 2 Haut, 3 dunkel
let texD = null;     // Texturpunkte, fuer die Augenmessung
let texW = 0, texH = 0;

/** Ist diese Texturstelle dunkel? Der Test fuer gemalte Augen und Munde. */
function probeDunkel(u, v) {
  const px = Math.min(texW - 1, Math.max(0, Math.round(u * (texW - 1))));
  const py = Math.min(texH - 1, Math.max(0, Math.round(v * (texH - 1))));
  const o = (py * texW + px) * 4;
  return texD[o] < 80 && texD[o + 1] < 80 && texD[o + 2] < 100;
}

window.laden = async (url) => {
  const gltf = await new GLTFLoader().loadAsync(url);
  wurzel = gltf.scene;
  wurzel.updateMatrixWorld(true);
  wurzel.traverse((o) => { if (o.isSkinnedMesh && !netz) netz = o; });
  if (!netz) throw new Error('Kein gehaeutetes Netz gefunden');
  return {
    knochen: netz.skeleton.bones.length,
    ecken: netz.geometry.attributes.position.count,
    hatTextur: !!(netz.material && netz.material.map),
  };
};

/**
 * Jede Ecke einstufen — ueber die Texturstelle, nicht ueber die Lage.
 *
 * Die Lage wuerde nicht reichen: Haar und Haut stossen an der Stirn
 * aneinander, und dort entscheidet allein die Farbe.
 */
window.einstufen = () => {
  const bild = netz.material.map.image;
  const cv = document.createElement('canvas');
  cv.width = bild.width; cv.height = bild.height;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  cx.drawImage(bild, 0, 0);
  const d = cx.getImageData(0, 0, cv.width, cv.height).data;
  texD = d; texW = cv.width; texH = cv.height;

  const uv = netz.geometry.attributes.uv;
  const n = netz.geometry.attributes.position.count;
  klasse = new Uint8Array(n);
  const zaehl = [0, 0, 0, 0];
  for (let i = 0; i < n; i++) {
    // glTF zaehlt v VON OBEN. Kein 1-v. Wer hier spiegelt, bekommt Rauschen,
    // das plausibel aussieht.
    const u = uv.getX(i), v = uv.getY(i);
    const px = Math.min(cv.width - 1, Math.max(0, Math.round(u * (cv.width - 1))));
    const py = Math.min(cv.height - 1, Math.max(0, Math.round(v * (cv.height - 1))));
    const o = (py * cv.width + px) * 4;
    const r = d[o], g = d[o + 1], b = d[o + 2];
    let k = 0;
    // Dunkel zuerst: Augen und Mund sind auch blaeulich, die Haarregel wuerde
    // sie sonst verschlucken.
    if (r < 80 && g < 80 && b < 100) k = 3;
    else if (b > r + 24 && b > g + 16) k = 1;
    else if (r > 118 && r >= g && r > b) k = 2;
    klasse[i] = k;
    zaehl[k]++;
  }
  return {
    sonstiges: zaehl[0], haar: zaehl[1], haut: zaehl[2], dunkel: zaehl[3],
    textur: [cv.width, cv.height],
  };
};

/** Die Masse, an denen alles haengt — gemessen, nicht uebernommen. */
window.messen = () => {
  const pos = netz.geometry.attributes.position;
  const v = new THREE.Vector3();
  const kasten = (pruef) => {
    const b = new THREE.Box3();
    b.makeEmpty();
    let n = 0;
    for (let i = 0; i < pos.count; i++) {
      if (!pruef(i)) continue;
      v.fromBufferAttribute(pos, i).applyMatrix4(netz.matrixWorld);
      b.expandByPoint(v); n++;
    }
    return { n, min: b.min.toArray(), max: b.max.toArray() };
  };
  const alles = kasten(() => true);
  const haar = kasten((i) => klasse[i] === 1);
  const haut = kasten((i) => klasse[i] === 2);

  // Schaedelmitte: Schwerpunkt der oberen Haarhaelfte. Der Schwerpunkt der
  // GANZEN Haarmasse taugt nicht — die ist ein Hufeisen, ihr Schwerpunkt liegt
  // im Gesicht, und von dort aus zeigt kein Radius mehr auf Haar.
  const grenze = haar.min[1] + (haar.max[1] - haar.min[1]) * 0.5;
  const m = new THREE.Vector3(); let n = 0;
  for (let i = 0; i < pos.count; i++) {
    if (klasse[i] !== 1) continue;
    v.fromBufferAttribute(pos, i).applyMatrix4(netz.matrixWorld);
    if (v.y < grenze) continue;
    m.add(v); n++;
  }
  m.divideScalar(n);

  let hautZ = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    if (klasse[i] !== 2) continue;
    v.fromBufferAttribute(pos, i).applyMatrix4(netz.matrixWorld);
    if (v.z > hautZ) hautZ = v.z;
  }

  // Die Augenlinie ueber DREIECKE. Sie ist die Schranke, unter die kein Haar
  // reichen darf; ein frueherer Anlauf hatte sie nur im Kommentar stehen und
  // endete mitten im Auge.
  const dunkel = [];
  const idx = netz.geometry.index;
  const uvA = netz.geometry.attributes.uv;
  const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3();
  for (let t = 0; t < idx.count; t += 3) {
    const ia = idx.getX(t), ib = idx.getX(t + 1), ic = idx.getX(t + 2);
    va.fromBufferAttribute(pos, ia).applyMatrix4(netz.matrixWorld);
    vb.fromBufferAttribute(pos, ib).applyMatrix4(netz.matrixWorld);
    vc.fromBufferAttribute(pos, ic).applyMatrix4(netz.matrixWorld);
    const mx = (va.x + vb.x + vc.x) / 3;
    const my = (va.y + vb.y + vc.y) / 3;
    const mz = (va.z + vb.z + vc.z) / 3;
    if (mz < hautZ - 0.18 || Math.abs(mx) > 0.26 || my < 0.48 || my > 0.8) continue;
    const u = (uvA.getX(ia) + uvA.getX(ib) + uvA.getX(ic)) / 3;
    const w = (uvA.getY(ia) + uvA.getY(ib) + uvA.getY(ic)) / 3;
    if (probeDunkel(u, w)) dunkel.push(my);
  }
  dunkel.sort((a, b) => b - a);

  // Der KOPF fuer sich, nicht die ganze Figur.
  //
  // Ohne dieses Mass laesst sich keine Kappe stutzen: Die Hautbox reicht bis in
  // die Haende hinunter und ist ueber einen halben Meter breit, waehrend der
  // Schaedel darunter kaum ein Drittel misst. Wer die Ellipse an der Hautbox
  // bemisst, stutzt gar nichts. Gezaehlt wird deshalb nur, was oberhalb der
  // Augenoberkante liegt — das ist sicher Schaedel und sicher keine Schulter.
  const augenOben = dunkel.length ? dunkel[0] : 0;
  const kopf = kasten((i) => {
    if (klasse[i] !== 2) return false;
    v.fromBufferAttribute(pos, i).applyMatrix4(netz.matrixWorld);
    return v.y > augenOben;
  });

  return {
    alles, haar, haut, kopf,
    schaedel: m.toArray(),
    hautVorn: hautZ,
    haarVorn: haar.max[2],
    augen: { n: dunkel.length, oben: augenOben },
  };
};

/**
 * Die Kappe auf eine Ellipse stutzen — der zweite Griff am Haar.
 *
 * ## Warum ueberhaupt
 *
 * Gemessen reicht die Haarmasse des gelieferten Modells von y 0,252 bis 0,998
 * bei einer Figurenhoehe von 0,998: **drei Viertel der Figur sind Haar.** Sie
 * faellt ueber Schultern und Ruecken bis auf Huefthoehe, als geschlossene
 * glatte Schale. Bei neun logischen Pixeln Figurenbreite gibt das keinen
 * Zopf, sondern einen Mantel — und genau das ist die Rueckmeldung „sieht aus
 * wie eine Kappe" gewesen. Kein Spreizen des Reliefs heilt das: Amplitude
 * gliedert eine Flaeche, sie verkleinert sie nicht.
 *
 * ## Was hier passiert
 *
 * Jede Haarecke ausserhalb eines Ellipsoids um die Schaedelmitte wird darauf
 * zurueckgezogen. Nicht geloescht: Geometrie aus einem gehaeuteten Netz zu
 * entfernen hiesse Index, Haut- und Gewichtstabellen neu zu bauen, und der
 * Gewinn waere derselbe. Wer zurueckzieht, behaelt die Naht am Haaransatz.
 *
 * Der Parameter weich laesst einen Bruchteil des Ueberstands stehen. Bei null entsteht am
 * Rand der Ellipse eine harte Kante — ein Topfschnitt, also wieder eine
 * geschlossene Silhouette, nur kuerzer. Ein Fuenftel Ueberstand laesst die
 * Unterkante ausfransen, und die gezeichneten Straehnen haben etwas, woraus
 * sie hervorkommen.
 */
window.stutzen = (schaedelArr, rx, ry, rz, weich) => {
  const schaedel = new THREE.Vector3().fromArray(schaedelArr);
  const pos = netz.geometry.attributes.position;
  const M = netz.matrixWorld;
  const Mi = new THREE.Matrix4().copy(M).invert();
  const v = new THREE.Vector3();
  let bewegt = 0, weiteste = 0, gesamt = 0, unten = Infinity;
  for (let i = 0; i < pos.count; i++) {
    if (klasse[i] !== 1) continue;
    v.fromBufferAttribute(pos, i).applyMatrix4(M);
    const dx = v.x - schaedel.x, dy = v.y - schaedel.y, dz = v.z - schaedel.z;
    const q = Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2 + (dz / rz) ** 2);
    if (q > 1) {
      const k = (1 + (q - 1) * weich) / q;
      v.set(schaedel.x + dx * k, schaedel.y + dy * k, schaedel.z + dz * k);
      const weg = (1 - k) * Math.sqrt(dx * dx + dy * dy + dz * dz);
      gesamt += weg;
      if (weg > weiteste) weiteste = weg;
      bewegt++;
      v.applyMatrix4(Mi);
      pos.setXYZ(i, v.x, v.y, v.z);
      v.applyMatrix4(M);
    }
    if (v.y < unten) unten = v.y;
  }
  pos.needsUpdate = true;
  netz.geometry.computeVertexNormals();
  return { bewegt, weiteste, mittel: bewegt ? gesamt / bewegt : 0, unten };
};

/**
 * Das Relief der Haarschale spreizen — der eine Griff, an dem alles haengt.
 *
 * Fuer jede Haarecke wird ihr Abstand zur Schaedelmitte mit einem geglaetteten
 * Mittelwert ihrer Nachbarschaft verglichen, und die Abweichung wird
 * verstaerkt. Die Flaeche bleibt dabei ungefaehr gleich; was steigt, ist die
 * Amplitude — und Rauheit ist Amplitude ueber Wellenlaenge, nicht Masse.
 *
 * Der Bezugsradius wird ueber einen WINKELKEGEL gemittelt und nicht ueber
 * einen Abstand im Raum: Auf einer Schale sind Nachbarn das, was in derselben
 * Richtung liegt.
 */
window.schaerfen = (schaedelArr, k, kegelGrad, obenGrenze) => {
  const schaedel = new THREE.Vector3().fromArray(schaedelArr);
  const pos = netz.geometry.attributes.position;
  const M = netz.matrixWorld;
  const Mi = new THREE.Matrix4().copy(M).invert();
  const v = new THREE.Vector3();

  const idx = [], dir = [], rad = [];
  for (let i = 0; i < pos.count; i++) {
    if (klasse[i] !== 1) continue;
    v.fromBufferAttribute(pos, i).applyMatrix4(M);
    const d = v.clone().sub(schaedel);
    const r = d.length();
    if (r < 1e-6) continue;
    idx.push(i); dir.push(d.clone().divideScalar(r)); rad.push(r);
  }

  const cosK = Math.cos((kegelGrad * Math.PI) / 180);
  const neu = new Array(idx.length);
  for (let a = 0; a < idx.length; a++) {
    let summe = 0, gewicht = 0;
    for (let b = 0; b < idx.length; b++) {
      const c = dir[a].dot(dir[b]);
      if (c < cosK) continue;
      // Naeher gleich schwerer, sonst zieht der Rand des Kegels den Mittelwert.
      const w = (c - cosK) / (1 - cosK);
      summe += rad[b] * w; gewicht += w;
    }
    const bezug = gewicht > 0 ? summe / gewicht : rad[a];
    neu[a] = bezug + (rad[a] - bezug) * k;
  }

  let maxAus = 0, maxEin = 0, geklemmt = 0;
  for (let a = 0; a < idx.length; a++) {
    const p = schaedel.clone().addScaledVector(dir[a], neu[a]);
    if (p.y > obenGrenze) { p.y = obenGrenze; geklemmt++; }
    const d = neu[a] - rad[a];
    if (d > maxAus) maxAus = d;
    if (d < maxEin) maxEin = d;
    p.applyMatrix4(Mi);
    pos.setXYZ(idx[a], p.x, p.y, p.z);
  }
  pos.needsUpdate = true;
  netz.geometry.computeVertexNormals();
  return { bewegt: idx.length, geklemmt, maxAus, maxEin };
};

/**
 * Den Schwungknochen einhaengen und die Haarschale darauf mithaeuten.
 *
 * Nicht einzelne Straehnenspitzen schwingen, sondern die ganze Masse — aussen
 * mehr als innen. Bei zweiundfuenfzig Geraetepunkten ist das die einzige
 * Haarbewegung, die man ueberhaupt sieht: Eine Locke, die um zwei Bildpunkte
 * nachschleppt, ist unsichtbar; eine Masse, die um zwei Bildpunkte
 * nachschleppt, ist der Ruck.
 *
 * Am Haaransatz bleibt das Gewicht null — sonst reisst dort die Naht zwischen
 * Haar und Stirn auf, und das sieht man sofort.
 */
window.schwungHaeuten = (schaedelArr, maxGewicht) => {
  const schaedel = new THREE.Vector3().fromArray(schaedelArr);
  const geo = netz.geometry;
  const pos = geo.attributes.position;
  const si = geo.attributes.skinIndex;
  const sw = geo.attributes.skinWeight;
  const bones = netz.skeleton.bones;
  const kopf = bones.find((b) => b.name === 'Head');
  if (!kopf) throw new Error('Knochen Head fehlt');

  const schwung = new THREE.Bone();
  schwung.name = 'HaarSchwung';
  schwung.position.copy(kopf.worldToLocal(schaedel.clone()));
  kopf.add(schwung);
  kopf.updateMatrixWorld(true);
  const ende = new THREE.Bone();
  ende.name = 'HaarSchwungEnd';
  ende.position.set(0, 0.12, 0);
  schwung.add(ende);
  wurzel.updateMatrixWorld(true);

  const alleKnochen = bones.concat([schwung, ende]);
  const neuesSkelett = new THREE.Skeleton(alleKnochen);
  neuesSkelett.calculateInverses();
  const iSchwung = bones.length;

  const v = new THREE.Vector3();
  let rMin = Infinity, rMax = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    if (klasse[i] !== 1) continue;
    v.fromBufferAttribute(pos, i).applyMatrix4(netz.matrixWorld);
    const r = v.distanceTo(schaedel);
    if (r < rMin) rMin = r;
    if (r > rMax) rMax = r;
  }
  let gehaeutet = 0, groesstes = 0;
  for (let i = 0; i < pos.count; i++) {
    if (klasse[i] !== 1) continue;
    v.fromBufferAttribute(pos, i).applyMatrix4(netz.matrixWorld);
    const t = Math.min(
      1,
      Math.max(0, (v.distanceTo(schaedel) - rMin) / Math.max(1e-6, rMax - rMin)),
    );
    // Erst ab der halben Tiefe ueberhaupt, dann quadratisch.
    const g = maxGewicht * Math.pow(Math.min(1, Math.max(0, (t - 0.45) / 0.55)), 2);
    if (g <= 0.001) continue;
    // Den schwaechsten der vier Plaetze opfern und die uebrigen herunterwiegen.
    let schwach = 0;
    for (let j = 1; j < 4; j++)
      if (sw.getComponent(i, j) < sw.getComponent(i, schwach)) schwach = j;
    const restAnteil = 1 - g;
    for (let j = 0; j < 4; j++)
      if (j !== schwach) sw.setComponent(i, j, sw.getComponent(i, j) * restAnteil);
    si.setComponent(i, schwach, iSchwung);
    sw.setComponent(i, schwach, g);
    gehaeutet++;
    if (g > groesstes) groesstes = g;
  }
  si.needsUpdate = true;
  sw.needsUpdate = true;

  netz.bind(neuesSkelett, netz.bindMatrix);
  wurzel.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(wurzel);
  return {
    gehaeutet, groesstes, knochen: alleKnochen.length,
    box: { min: box.min.toArray(), max: box.max.toArray() },
  };
};

/** Als GLB herausschreiben. VOR jedem Posieren — siehe Kopfkommentar. */
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
console.log(
  `Geladen: ${geladen.knochen} Knochen, ${geladen.ecken} Ecken, ` +
    `Textur ${geladen.hatTextur ? 'da' : 'FEHLT'}`,
);

const st = await page.evaluate(() => window.einstufen());
console.log(
  `\nEinstufung ueber die Textur ${st.textur[0]}x${st.textur[1]}: ` +
    `${st.haar} Haar, ${st.haut} Haut, ${st.dunkel} dunkel, ${st.sonstiges} sonstiges`,
);
if (st.haar < 300) throw new Error('Zu wenig Haarecken erkannt — die Einstufung stimmt nicht');

const m = await page.evaluate(() => window.messen());
const f = (a) => a.map((x) => Number(x).toFixed(3)).join(' / ');
console.log('\nMasse (Modelleinheiten)');
console.log(`  Figur   ${f(m.alles.min)}  bis  ${f(m.alles.max)}`);
console.log(`  Haar    ${f(m.haar.min)}  bis  ${f(m.haar.max)}   (${m.haar.n} Ecken)`);
console.log(`  Haut    ${f(m.haut.min)}  bis  ${f(m.haut.max)}   (${m.haut.n} Ecken)`);
console.log(`  Schaedelmitte ${f(m.schaedel)}`);
console.log(
  `  vorderste Haut z=${m.hautVorn.toFixed(3)}, vorderstes Haar z=${m.haarVorn.toFixed(3)} ` +
    `-> die Haut steht ${(m.hautVorn - m.haarVorn).toFixed(3)} weiter vorn`,
);
console.log(`  Augenoberkante y=${m.augen.oben.toFixed(3)} (aus ${m.augen.n} dunklen Dreiecken)`);
console.log(`  Kopf    ${f(m.kopf.min)}  bis  ${f(m.kopf.max)}   (${m.kopf.n} Ecken Haut ueber den Augen)`);

const scheitel = m.alles.max[1];

// Erst stutzen, dann spreizen — und dazwischen neu messen.
//
// Die Reihenfolge ist keine Geschmacksfrage. Das Spreizen vergleicht jede Ecke
// mit dem Mittel ihrer Nachbarschaft; solange der Mantel bis zur Huefte
// haengt, sitzt dieses Mittel im Mantel, und die Kerben entstuenden dort statt
// am Kopf. Und die Schaedelmitte selbst haengt an der Haarmasse — sie wird aus
// deren oberer Haelfte gerechnet. Wer nach dem Stutzen mit der alten Mitte
// weiterarbeitet, spreizt um einen Punkt, den es nicht mehr gibt.
const halb = (m.kopf.max[0] - m.kopf.min[0]) / 2;
const stz = await page.evaluate(
  ([s, rx, ry, rz, w]) => window.stutzen(s, rx, ry, rz, w),
  [m.schaedel, halb * STUTZ_SEITE, halb * STUTZ_HOCH, halb * STUTZ_TIEF, STUTZ_WEICH],
);
console.log(
  `\nKappe gestutzt auf ${(halb * STUTZ_SEITE).toFixed(3)} / ` +
    `${(halb * STUTZ_HOCH).toFixed(3)} / ${(halb * STUTZ_TIEF).toFixed(3)} ` +
    `(Kopfhalbbreite ${halb.toFixed(3)}): ${stz.bewegt} Ecken zurueckgezogen, ` +
    `weiteste ${stz.weiteste.toFixed(3)}, im Mittel ${stz.mittel.toFixed(3)}`,
);
console.log(
  `  Haarunterkante y ${m.haar.min[1].toFixed(3)} -> ${stz.unten.toFixed(3)} ` +
    `(Augenoberkante ${m.augen.oben.toFixed(3)})`,
);

const m2 = await page.evaluate(() => window.messen());
console.log(
  `  Schaedelmitte neu ${f(m2.schaedel)} (vorher ${f(m.schaedel)}), ` +
    `Haar jetzt ${f(m2.haar.min)} bis ${f(m2.haar.max)}`,
);

const sch = await page.evaluate(
  ([s, k, kegel, oben]) => window.schaerfen(s, k, kegel, oben),
  [m2.schaedel, SCHAERFE, KEGEL_GRAD, scheitel],
);
console.log(
  `\nRelief gespreizt (Faktor ${SCHAERFE}, Kegel ${KEGEL_GRAD} Grad): ${sch.bewegt} Haarecken, ` +
    `groesster Ausschlag nach aussen ${sch.maxAus.toFixed(3)}, nach innen ${sch.maxEin.toFixed(3)}, ` +
    `${sch.geklemmt} am Scheitel geklemmt`,
);

const hh = await page.evaluate(([s, g]) => window.schwungHaeuten(s, g), [m2.schaedel, SCHWUNG_MAX]);
console.log(
  `HaarSchwung eingehaengt: ${hh.gehaeutet} Haarecken mitgehaeutet, groesstes Gewicht ` +
    `${hh.groesstes.toFixed(2)}, jetzt ${hh.knochen} Knochen`,
);
console.log(`\nHuellbox  ${f(hh.box.min)}  bis  ${f(hh.box.max)}`);
const wuchs = hh.box.max[1] - scheitel;
console.log(
  `Scheitel ${scheitel.toFixed(3)} -> ${hh.box.max[1].toFixed(3)}  ` +
    `(${wuchs >= 0 ? '+' : ''}${wuchs.toFixed(3)})`,
);
if (wuchs > 0.001) throw new Error('Haar waechst ueber den Scheitel — das schrumpft das Gesicht');

const b64 = await page.evaluate(() => window.ausgeben());
writeFileSync(aus, Buffer.from(b64, 'base64'));
console.log(`\n${aus}  ${Math.round(Buffer.from(b64, 'base64').length / 1024)} kB`);

await browser.close();
server.close();
