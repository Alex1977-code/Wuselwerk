/**
 * Das Erdmaennchen — Geometrie und Rig, im Code gebaut.
 *
 * ## Warum gebaut und nicht geliefert
 *
 * Die Murmel kam als geriggtes Modell mit zwoelf fertigen Animationen. Fuer das
 * Erdmaennchen gibt es das nicht, also entsteht es hier aus Grundkoerpern —
 * genau wie die Vorgaengerfigur dieses Projekts, deren Posen ebenfalls
 * Winkeltabellen waren. Der Backvorgang bleibt derselbe: orthografisch
 * rendern, ueberabtasten, verkleinern, Blatt zusammensetzen.
 *
 * ## Der Massstab ist Vertrag, nicht Geschmack
 *
 * Vom Fusspunkt bis zum **Scheitel ohne Ohren** misst die Figur
 * `FIGUR_EINHEITEN` Modelleinheiten, und die Zelle deckt `SICHT` ab. Beide
 * Zahlen sind dieselben wie bei der Murmel, und das ist Absicht: Daran haengen
 * die Zellgroesse, `ppl`, der Fusspunkt und die Pruefungen in
 * `tests/atlas.test.ts`. Was darueber hinausragt — die Ohren — ragt hinaus, so
 * wie es beim Schopf der Murmel war.
 *
 * ## Warum die Ruhelage schon eine Pose ist
 *
 * Die Ruhelage **ist** die Wachpose: aufrecht, Vorderpfoten am Bauch,
 * Schwanz als Stuetze. Das ist der Grund, warum diese Figur fuer dieses Spiel
 * gewaehlt wurde — die bekannteste Haltung des Tieres ist der Blocker. Alle
 * anderen Posen sind Abweichungen davon, und das macht die Winkeltabellen
 * kurz: Was nicht dasteht, bleibt in der Ruhelage.
 *
 * ## Die Aufteilung der Lesbarkeit
 *
 * | Kanal | wo |
 * |---|---|
 * | Blickrichtung | Schnauze — sie bricht die Silhouette nach vorn |
 * | Beruf | Augenmaske, zur Laufzeit gefaerbt (`maske.ts`) |
 * | Haltung | Rumpfneigung, Arme, Schwanz |
 * | Werkzeug | vordere Pfote, aus dem Rig gemessen |
 *
 * Die Maske wird **nicht** mitgebacken: Sie traegt die Berufsfarbe und muss
 * deshalb zur Laufzeit entstehen. Gebacken werden die Augen — sie sind
 * Geometrie, drehen sich mit dem Kopf und sitzen dadurch immer richtig. Genau
 * das war bei der Murmel der Unterschied zwischen „sieht in die Laufrichtung"
 * und „aufgeklebt".
 */
import * as THREE from 'three';

/** Hoehe vom Boden bis zum Scheitel ohne Ohren. Vertrag mit dem Backvorgang. */
export const FIGUR_EINHEITEN = 0.861;

const H = FIGUR_EINHEITEN;

/**
 * Die Farben.
 *
 * Sandbraun mit dunklerem Ruecken und heller Brust — das ist ein Erdmaennchen,
 * und es ist zugleich der einzige Ton, der vor **beiden** Welten steht: vor dem
 * Wiesengruen und vor dem Hoehlenblau. Ein grauer Pelz verschwaende sich im
 * Gestein, ein rotbrauner im Boden.
 *
 * Gesaettigt ist hier nichts. Saettigung ist in diesem Spiel Information und
 * gehoert der Maske.
 */
const FELL = 0xd6b98c;
const FELL_RUECKEN = 0x8f6f45;
const FELL_BAUCH = 0xead7b6;
const PFOTE = 0x6f5334;
const AUGE = 0x201c18;
const NASE = 0x2a2320;

function stoff(farbe) {
  return new THREE.MeshStandardMaterial({ color: farbe, roughness: 0.95, metalness: 0 });
}

/** Ein benanntes Gelenk: leeres Objekt, an dem gedreht wird. */
function gelenk(name, x, y, z) {
  const g = new THREE.Object3D();
  g.name = name;
  g.position.set(x, y, z);
  return g;
}

/**
 * Baut die Figur und liefert Wurzel und Gelenktabelle.
 *
 * Alle Laengen sind Anteile von `H`, damit ein anderes `WUSEL_H` nur eine Zahl
 * kostet und nicht eine Runde Handarbeit.
 */
export function baueErdmaennchen() {
  const m = {
    fell: stoff(FELL),
    ruecken: stoff(FELL_RUECKEN),
    bauch: stoff(FELL_BAUCH),
    pfote: stoff(PFOTE),
    auge: stoff(AUGE),
    nase: stoff(NASE),
  };

  const wurzel = new THREE.Object3D();
  wurzel.name = 'Wurzel';

  // --- Beine und Huefte ------------------------------------------------------
  //
  // Kurz und dick. Ein Erdmaennchen steht auf den Hinterlaeufen und der
  // Schwanzwurzel — die Beine tragen nur ein Drittel der Hoehe, alles darueber
  // ist Rumpf. Genau das macht die Silhouette unten breit und oben schmal, und
  // eine unten breite Silhouette liest sich als *stehend*.
  const hueftY = H * 0.3;
  const huefte = gelenk('Huefte', 0, hueftY, 0);
  wurzel.add(huefte);

  for (const [name, seite] of [
    ['L', -1],
    ['R', 1],
  ]) {
    const bein = gelenk(`${name}_Bein`, seite * H * 0.075, 0, 0);
    huefte.add(bein);
    const ober = new THREE.Mesh(
      new THREE.CapsuleGeometry(H * 0.055, H * 0.1, 4, 10),
      m.fell,
    );
    ober.position.y = -H * 0.075;
    bein.add(ober);
    const knie = gelenk(`${name}_Knie`, 0, -H * 0.145, 0);
    bein.add(knie);
    const unter = new THREE.Mesh(
      new THREE.CapsuleGeometry(H * 0.042, H * 0.075, 4, 10),
      m.fell,
    );
    unter.position.y = -H * 0.055;
    knie.add(unter);
    // Der Fuss. Flach und nach vorn, damit die Figur wirklich zu stehen scheint
    // und nicht auf Stelzen balanciert.
    const fuss = new THREE.Mesh(new THREE.SphereGeometry(H * 0.05, 10, 8), m.pfote);
    fuss.scale.set(0.8, 0.45, 1.5);
    fuss.position.set(0, -H * 0.115, H * 0.045);
    knie.add(fuss);
  }

  // --- Rumpf -----------------------------------------------------------------
  //
  // Eine Kegelkapsel: unten breit (der Bauch), oben schmal (die Schultern).
  // Erdmaennchen sind schlank; ein tonnenfoermiger Rumpf saehe nach Murmeltier
  // aus, und das ist ein anderes Tier mit einer anderen Aussage.
  const wirbel = gelenk('Wirbel', 0, 0, 0);
  huefte.add(wirbel);
  const rumpf = new THREE.Mesh(new THREE.CapsuleGeometry(H * 0.108, H * 0.16, 6, 16), m.fell);
  rumpf.position.set(0, H * 0.155, 0);
  rumpf.scale.set(1, 1, 0.86);
  wirbel.add(rumpf);
  // Der helle Bauch, als flache Schale davor. Er gibt der Silhouette Tiefe,
  // ohne sie zu veraendern.
  const bauch = new THREE.Mesh(new THREE.SphereGeometry(H * 0.125, 14, 12), m.bauch);
  bauch.scale.set(1.02, 0.86, 0.78);
  bauch.position.set(0, H * 0.105, H * 0.035);
  wirbel.add(bauch);
  // Der dunklere Ruecken. Bei einem Erdmaennchen laeuft er quer gebaendert;
  // bei zwoelf Pixeln waeren Baender Rauschen, also nur der Tonwechsel.
  const ruecken = new THREE.Mesh(new THREE.SphereGeometry(H * 0.132, 14, 12), m.ruecken);
  ruecken.scale.set(0.92, 1.1, 0.62);
  ruecken.position.set(0, H * 0.185, -H * 0.045);
  wirbel.add(ruecken);

  // --- Arme ------------------------------------------------------------------
  //
  // Sie sitzen hoch und kurz. Das Werkzeug waechst aus der vorderen Pfote, und
  // der Backvorgang misst deren Spitze — dieselbe Rechnung wie bei der Murmel,
  // deshalb dieselbe Armlaenge.
  const schulterY = H * 0.28;
  for (const [name, seite] of [
    ['L', -1],
    ['R', 1],
  ]) {
    const arm = gelenk(`${name}_Arm`, seite * H * 0.082, schulterY, 0);
    wirbel.add(arm);
    const ober = new THREE.Mesh(new THREE.CapsuleGeometry(H * 0.032, H * 0.1, 4, 10), m.fell);
    ober.position.y = -H * 0.06;
    arm.add(ober);
    const ellbogen = gelenk(`${name}_Ellbogen`, 0, -H * 0.12, 0);
    arm.add(ellbogen);
    const unter = new THREE.Mesh(new THREE.CapsuleGeometry(H * 0.026, H * 0.08, 4, 10), m.fell);
    unter.position.y = -H * 0.05;
    ellbogen.add(unter);
    // Die Pfote. Dunkler als das Fell, weil ein Erdmaennchen dunkle Pfoten hat
    // und weil ein dunkler Punkt am Armende die Grabgeste lesbar macht.
    const pfote = new THREE.Mesh(new THREE.SphereGeometry(H * 0.036, 10, 8), m.pfote);
    pfote.scale.set(0.9, 1, 1.2);
    pfote.position.y = -H * 0.1;
    ellbogen.add(pfote);
  }

  // --- Hals und Kopf ---------------------------------------------------------
  const hals = gelenk('Hals', 0, H * 0.32, 0);
  wirbel.add(hals);
  const halsMesh = new THREE.Mesh(new THREE.CapsuleGeometry(H * 0.062, H * 0.05, 4, 12), m.fell);
  halsMesh.position.y = H * 0.03;
  hals.add(halsMesh);

  const kopf = gelenk('Kopf', 0, H * 0.105, 0);
  hals.add(kopf);
  // Der Schaedel. Leicht in die Laenge gezogen, denn die Schnauze ist der
  // Richtungszeiger und darf nicht in einer Kugel verschwinden.
  const schaedel = new THREE.Mesh(new THREE.SphereGeometry(H * 0.115, 16, 14), m.fell);
  schaedel.scale.set(0.86, 0.88, 1.08);
  kopf.add(schaedel);

  // Die Schnauze — **der wichtigste Teil der ganzen Figur**.
  //
  // Sie ist der Grund, warum ein Tier das Richtungsproblem nicht hat: Zwei
  // Bildpunkte, die die Silhouette nach vorn durchbrechen, sagen unmissver-
  // staendlich, wohin die Figur schaut. Bei der Murmel musste dafuer das ganze
  // Modell um 42 Grad gedreht werden.
  const schnauze = new THREE.Mesh(new THREE.ConeGeometry(H * 0.052, H * 0.215, 12), m.fell);
  schnauze.rotation.x = Math.PI / 2 + 0.16;
  schnauze.position.set(0, -H * 0.032, H * 0.145);
  schnauze.scale.set(0.92, 1, 0.8);
  kopf.add(schnauze);
  const nase = new THREE.Mesh(new THREE.SphereGeometry(H * 0.022, 8, 8), m.nase);
  nase.position.set(0, -H * 0.062, H * 0.245);
  kopf.add(nase);

  // Die Augen. Gebacken, nicht gezeichnet: Sie sind Geometrie, drehen sich mit
  // dem Kopf und sitzen dadurch in jeder Pose richtig. Die **Maske** darum
  // herum entsteht zur Laufzeit und traegt die Berufsfarbe.
  for (const seite of [-1, 1]) {
    const auge = new THREE.Mesh(new THREE.SphereGeometry(H * 0.028, 10, 10), m.auge);
    auge.position.set(seite * H * 0.055, H * 0.03, H * 0.088);
    kopf.add(auge);
  }

  // Die Ohren. Klein und rund und seitlich — das ist der Unterschied zu einem
  // Hasen, und er ist wichtig: Diese Ohren tragen **keine** Information. Sie
  // gehoeren zur Silhouette, sonst nichts. Wer ihnen eine Aufgabe gibt, gibt
  // sie einem Ding, das drei Bildpunkte gross ist.
  for (const [name, seite] of [
    ['L', -1],
    ['R', 1],
  ]) {
    const ohr = gelenk(`${name}_Ohr`, seite * H * 0.088, H * 0.062, -H * 0.018);
    kopf.add(ohr);
    const muschel = new THREE.Mesh(new THREE.SphereGeometry(H * 0.042, 10, 8), m.fell);
    muschel.scale.set(0.42, 0.95, 0.9);
    ohr.add(muschel);
  }

  // --- Schwanz ---------------------------------------------------------------
  //
  // Hoch getragen und leicht gebogen, nicht waagerecht.
  //
  // Das ist eine Stilisierung mit einem harten Grund: Ein waagerechter Schwanz
  // haengt fuenf logische Pixel hinter der Figur, also **ausserhalb der einen
  // Spalte**, mit der die Simulation rechnet. Er ueberlappte im Pulk die
  // Nachbarn und ragte durch Waende, an denen die Figur richtig steht. Hoch
  // getragen bleibt er im Umriss und wird zugleich zum Bewegungsanzeiger: Er
  // laeuft nach, wenn die Figur laeuft.
  let vorher = gelenk('Schwanz1', 0, -H * 0.015, -H * 0.085);
  huefte.add(vorher);
  const glieder = [0.135, 0.125, 0.115, 0.1];
  const dicken = [0.038, 0.032, 0.026, 0.018];
  for (let i = 0; i < glieder.length; i++) {
    const seg = new THREE.Mesh(
      new THREE.CapsuleGeometry(H * dicken[i], H * glieder[i], 4, 10),
      i === glieder.length - 1 ? m.pfote : m.fell,
    );
    seg.position.y = H * (glieder[i] / 2);
    vorher.add(seg);
    if (i < glieder.length - 1) {
      const naechstes = gelenk(`Schwanz${i + 2}`, 0, H * glieder[i], 0);
      vorher.add(naechstes);
      vorher = naechstes;
    }
  }

  // --- Messpunkte ------------------------------------------------------------
  //
  // Zwei leere Objekte, die der Backvorgang ausliest. Sie sind das Gegenstueck
  // zum Knochen `Crown` der Murmel: Woher der Zeichner weiss, wo Gesicht und
  // Werkzeug sitzen, darf nicht in einer zweiten Tabelle stehen, die von Hand
  // gepflegt wird.
  // Auf der **Augenlinie**, nicht auf der Schnauze.
  //
  // Der erste Versuch setzte ihn an den Schnauzenansatz; die Maske sass damit
  // vor dem Gesicht und las sich als heller Schnabel. Ein Erdmaennchen traegt
  // seine Augenringe um die Augen — und die sitzen weiter hinten und hoeher,
  // als es im Modell aussieht.
  const gesicht = gelenk('Gesicht', 0, H * 0.032, H * 0.052);
  kopf.add(gesicht);

  const gelenke = {};
  wurzel.traverse((o) => {
    if (o.name) gelenke[o.name] = o;
  });
  return { wurzel, gelenke, gesicht };
}

/**
 * Die Ruhelage: die Wachpose.
 *
 * Alle Winkel in Grad. Was hier steht, gilt als Ausgangspunkt jeder Pose — eine
 * Posentabelle nennt nur, was davon abweicht.
 */
export const RUHE = {
  Huefte: [0, 0, 0],
  Wirbel: [-2, 0, 0],
  Hals: [4, 0, 0],
  Kopf: [-2, 0, 0],
  // Die Vorderpfoten haengen vor dem Bauch — das ist die Haltung, an der man
  // ein wachendes Erdmaennchen erkennt.
  L_Arm: [18, 0, 14],
  R_Arm: [18, 0, -14],
  L_Ellbogen: [42, 0, 0],
  R_Ellbogen: [42, 0, 0],
  L_Bein: [-4, 0, 3],
  R_Bein: [-4, 0, -3],
  L_Knie: [10, 0, 0],
  R_Knie: [10, 0, 0],
  L_Ohr: [0, 0, -8],
  R_Ohr: [0, 0, 8],
  // Der Schwanz steht schraeg nach hinten und biegt sich zur Spitze auf.
  // Nach hinten **unten**, bis die Spitze den Boden streift, dabei zur Seite
  // geschwenkt.
  //
  // Ein stehendes Erdmaennchen stuetzt sich auf den Schwanz — er ist das dritte
  // Bein. Mein erster Versuch liess ihn nach oben stehen; er verschwand damit
  // vollstaendig hinter dem Rumpf, weil „hinten" in der Vorderansicht nichts
  // ist. Der Schwenk zur Seite macht ihn zum Teil der Silhouette, und erst dann
  // kann er Bewegung anzeigen.
  Schwanz1: [122, 30, 0],
  Schwanz2: [-8, 6, 0],
  Schwanz3: [-8, 4, 0],
  Schwanz4: [-8, 2, 0],
};

/**
 * Winkeltabelle auf das Rig anwenden. Fehlende Gelenke bleiben in Ruhe.
 *
 * Zwei Eintraege sind keine Gelenke und werden getrennt behandelt: `skala`
 * schrumpft die ganze Figur (Rettung, Tod), `versatz` schiebt sie senkrecht
 * (Sterben, Fallen). Beides gehoert ins Blatt und nicht in den Zeichner — bei
 * der Murmel steckte das Schrumpfen in beidem, und die Figur schrumpfte dadurch
 * zweimal.
 */
export function stelle(gelenke, pose) {
  const grad = Math.PI / 180;
  for (const [name, o] of Object.entries(gelenke)) {
    if (name === 'Wurzel') continue;
    const w = pose[name] ?? RUHE[name];
    if (w) o.rotation.set(w[0] * grad, w[1] * grad, w[2] * grad);
    else o.rotation.set(0, 0, 0);
  }
}
