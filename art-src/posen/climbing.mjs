/**
 * Wandaufstieg.
 *
 * Vier Bilder, Zyklus. Die Figur klebt an einer senkrechten Wand rechts von
 * ihr und hangelt sich hoch.
 *
 * ## Zwei Messungen, die diese Pose bestimmen
 *
 * **1. Das Modell steht in der T-Haltung.** Schulter, Ellbogen und Hand
 * liegen in der Bindepose alle auf derselben Höhe (y = 0,382) und reihen sich
 * entlang der Weltachse X auf. Ein Arm wird deshalb nicht mit X gehoben,
 * sondern mit **Z** — X ist genau die Achse, auf der der Arm liegt, eine
 * Drehung darum verdreht ihn und bewegt ihn nicht. Weil das Rig gespiegelt
 * ist, hebt `L_` (bei +X) mit **+Z** und `R_` (bei −X) mit **−Z**. Nach vorn
 * an die Wand kommt der Arm mit **Y**, wieder seitenverkehrt.
 *
 * **2. Der Arm kommt trotzdem nicht über das Haar.** Am Netz ausgemessen, in
 * logischen Pixeln über der Sohle: Die Schulter sitzt auf 5,4, die Hand
 * reicht gestreckt bis 8,3 — und die Mähne steht bis **14,0**. Ein
 * Schulterzucken über die Klavikel bringt 0,9 dazu. Es fehlen fünf Pixel, und
 * fünf Pixel sind bei einer vierzehn Pixel hohen Figur ein Drittel. Der
 * erhobene Arm ist in jedem Bild dieses Blattes unsichtbar; er steht hier
 * richtig da, damit er es bei einer anderen Kamera nicht neu erfunden werden
 * muss, aber die Silhouette trägt er nicht.
 *
 * ## Was die Silhouette dann trägt
 *
 * Die Figur ist ein Lutscher: acht Reihen Kopf, sechs Reihen Körper. Wer hier
 * erzählen will, hat drei Flächen — Mähne, Helm, Beinsäule.
 *
 * 1. **Eine gerade Kante zur Wand hin.** Das ist das eigentliche Bild. Knie
 *    und Fuss werden so weit nach vorn gedreht, dass sie unter dem Gesicht
 *    dieselbe Bildspalte erreichen; die Mähne hängt dahinter nach hinten
 *    über. Rechts eine senkrechte Kante, links eine rote Wolke — so sieht
 *    niemand aus, der geht oder fällt, und so sieht jemand aus, der an etwas
 *    klebt. Die Tiefe trägt das: Weltachse Z bildet sich mit cos 30° = 0,87
 *    auf die Bildbreite ab, die Seitwärtsachse X nur mit 0,50.
 * 2. **Der Helm.** Ein flacher gelber Riegel, der die runde Mähne oben
 *    gerade abschneidet. Bei drei Farben und fünfzehn Pixeln Höhe ist eine
 *    gerade Oberkante das Deutlichste, was ein Kopf haben kann. Erlaufen:
 *    einen Pixel höher schwebt er über dem Haar wie ein Tablett, einen
 *    tiefer verschwindet er darin.
 * 3. **Angezogene Beine.** Die Beinsäule schrumpft von vier Reihen auf zwei
 *    und rückt nach vorn. Laufen spreizt die Beine, Fallen stellt sie weit
 *    vor und hinter den Körper — Klettern zieht sie an.
 *
 * Der Rumpf bleibt aufrecht (Spine01 unter 12°): Beugt sich die Figur vor,
 * kippt die Mähne über den Körper und übrig bleibt ein roter Fleck.
 */

/** Vorzeichen der Seite: `L_` liegt bei +X, `R_` bei −X. */
const S = (s) => (s > 0 ? 'L_' : 'R_');

export default {
  clip: 'climbing',
  frames: 4,

  pose(i) {
    // Zwei Griffe je Zyklus. `s` sagt, welche Seite oben greift, `z`, ob
    // gegriffen wird (0, Arm gestreckt) oder gezogen (1, Körper nachgeholt).
    const s = [1, 1, -1, -1][i];
    const z = [0, 1, 0, 1][i];
    const O = S(s); // greifende Seite
    const U = S(-s); // ziehende Seite; das Knie dieser Seite steht hoch

    return {
      // Aufrecht an der Wand. Der Zug geht durch den Rumpf, nicht in ihn.
      Waist: [3, 0, 0],
      Spine01: [4 + 2 * z, 0, 0],
      Spine02: [2, -7 * s, 0],
      // Der Kopf wiegt mit — er trägt die Mähne, die grösste Fläche der
      // Figur. Beim Greifen geht der Blick nach oben, beim Ziehen kommt er
      // wieder herunter.
      Head: [-7 + 6 * z, -5 * s, 4 * s],

      // --- Greifender Arm: Schulter hoch, Arm senkrecht ---------------------
      [`${O}Clavicle`]: [0, 0, 52 * s],
      [`${O}Upperarm`]: [0, 0, (88 - 22 * z) * s],
      [`${O}Forearm`]: [26 * z, 0, 0],

      // --- Ziehender Arm: nach vorn an die Wand, unter der Schulter ---------
      [`${U}Clavicle`]: [0, 0, 12 * s],
      [`${U}Upperarm`]: [-24 + 30 * z, 86 * s, 0],
      [`${U}Forearm`]: [-14, 0, 0],

      // --- Beine: angezogen, Knie und Fuss an die Wand ----------------------
      [`${U}Thigh`]: [-80 + 14 * z, 0, 0],
      [`${U}Calf`]: [62, 0, 0],
      [`${U}Foot`]: [30, 0, 0],
      [`${O}Thigh`]: [-32 - 12 * z, 0, 0],
      [`${O}Calf`]: [48, 0, 0],
      [`${O}Foot`]: [18, 0, 0],

      // An die Wand gedrückt, und beim Zug ein Stück höher.
      _versatz: [0.8, 0.5 + 0.5 * z],
    };
  },

  teile(i) {
    const z = [0, 1, 0, 1][i];
    return [
      // Kletterhelm. Anbauteile folgen dem Gelenk nur in der Lage, nicht in
      // der Drehung — die Neigung wird deshalb von Hand nachgeführt.
      {
        an: 'Head',
        pos: [0.6, 6.4, 0],
        mass: [5.0, 1.4, 3.6],
        dreh: [-7 + 6 * z, 0, 0],
        farbe: 'werkzeug',
      },
    ];
  },
};
