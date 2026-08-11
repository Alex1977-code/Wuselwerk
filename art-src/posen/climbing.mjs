/**
 * Wandaufstieg.
 *
 * Vier Bilder, Zyklus. Die Figur klebt an einer senkrechten Wand rechts von
 * ihr und hangelt sich hoch: ein Arm weit über dem Kopf am Griff, der andere
 * tiefer, die Beine angezogen.
 *
 * ## Die Achse, um die ein Arm gehoben wird
 *
 * Das Modell steht in der **T-Haltung**: Schulter, Ellbogen und Hand liegen
 * in der Bindepose alle auf derselben Höhe (y = 0,382) und reihen sich
 * entlang der Weltachse X auf. Ein Arm wird deshalb **nicht mit X gehoben,
 * sondern mit Z** — X ist genau die Achse, auf der der Arm liegt; eine
 * Drehung darum verdreht ihn und bewegt ihn keinen Millimeter. Das ist auch
 * die Auflösung der Beobachtung in `falling.mjs`, die Arme hätten "bei 55°,
 * 95°, 140° und −120°" um X den Umriss kein einziges Mal verändert: Das ist
 * kein Befund über die Bildgrösse, das ist diese Achse. Weil das Rig
 * gespiegelt ist, hebt `L_` (bei +X) mit **+Z**, `R_` (bei −X) mit **−Z**;
 * nach vorn an die Wand kommt ein Arm mit **Y**, ebenfalls seitenverkehrt.
 *
 * ## Warum der erhobene Arm trotzdem ein Anbauteil ist
 *
 * Am Netz ausgemessen, in logischen Pixeln über der Sohle: Die Schulter sitzt
 * auf 5,4, die gestreckte Hand reicht bis 8,3, ein Schulterzucken über die
 * Klavikel bringt 0,9 dazu — und die Mähne steht bis **14,0**. Es fehlen fünf
 * Pixel, und fünf Pixel sind bei dieser Figur ein Drittel ihrer Höhe. Kein
 * Winkel ändert daran etwas: Der echte Arm liegt in *jedem* Bild dieses
 * Blattes unter dem Haar begraben.
 *
 * Der Zustand heisst aber Klettern, und Klettern heisst "greift über sich".
 * Der sichtbare Arm wird deshalb gebaut — dieselbe Entscheidung wie beim
 * Schirm in `floating.mjs`, wo die Arme ebenfalls nicht zu sehen sind und die
 * sichtbare Aufhängung aus zwei Streben besteht. Der prozedurale Zeichner
 * macht es seit jeher genauso: `sprites.ts` setzt für `CLIMBING` zwei Klötze
 * über den Kopf, einen vorn und einen hinten. Diese Datei baut dieselbe
 * Aussage in drei Dimensionen nach. Der echte Arm steht darunter trotzdem
 * richtig im Modell — wird die Kamera je geändert, ist er schon in Position.
 *
 * ## Was am Bild erlaufen ist
 *
 * Die Figur ist ein Lutscher: acht Reihen Kopf, sechs Reihen Körper, der Kopf
 * zehn Pixel breit, die Beinsäule drei. Wer hier eine Haltung erzählen will,
 * erzählt sie am Kopf und an dem, was daneben steht — sonst an niemanden.
 *
 * - **Zwei Arme, nicht einer.** Ein einzelner Stab über diesem Kopf ist keine
 *   Geste, sondern eine Feder: gebacken und angesehen, senkrecht wie schräg —
 *   beides las als Haarschopf. Erst zwei Stäbe in *verschiedenen* Höhen, die
 *   den Kopf flankieren, lesen als Arme. Der Kopf ist hier die halbe Figur;
 *   alles Einzelne, was ihn berührt, wird zu Kopfschmuck.
 * - **Gelb, nicht dunkel.** In `dunkel` gebacken verschwanden beide Arme in
 *   der Mähne — die Teilfarbe ist dieselbe wie der Umriss, und neben acht
 *   Reihen Haar wird daraus Haar. In `werkzeug` stehen sie als Ärmel der
 *   Kletterausrüstung neben dem Helm und gehören sichtbar zusammen.
 * - **Der Helm** schneidet die runde Mähne oben gerade ab. Bei drei Farben
 *   und fünfzehn Pixeln Höhe ist eine gerade Oberkante das Deutlichste, was
 *   ein Kopf haben kann; `sprites.ts` benutzt für `hasClimber` denselben
 *   gelben Riegel. Die Höhe ist erlaufen: einen Pixel höher schwebt er über
 *   dem Haar wie ein Tablett, einen tiefer verschwindet er darin.
 * - **Angezogene Beine, Füsse am Fusspunkt.** Das Knie der ziehenden Seite
 *   geht nach vorn an die Wand, die Beinsäule bleibt drei Pixel schmal.
 *   Laufen spreizt die Beine, Fallen stellt sie weit vor und hinter den
 *   Körper und lässt zwei Reihen unter den Füssen frei — Klettern zieht sie
 *   an und bleibt am Boden der Zelle. Viel ist das nicht: Bei drei Pixeln
 *   Breite entscheidet hier ohnehin der Kopf. Es reicht, dass die Beine
 *   keinem der beiden anderen Zustände widersprechen.
 *
 * Der Rumpf bleibt aufrecht (Spine01 unter 12°): Beugt sich die Figur vor,
 * kippt die Mähne über den Körper und übrig bleibt ein roter Fleck. Die
 * Bewegung tragen die Arme.
 *
 * ## Der Takt
 *
 * **Die greifende Hand steht im Bild still, der Körper steigt zu ihr.** Genau
 * darum geht es beim Klettern, und deshalb sind die Armhöhen hier absolut
 * über der Sohle angegeben und nicht als Versatz zum Kopf: Hebt der Versatz
 * die Figur, wird der Arm von selbst kürzer, statt mitzuwandern. Greifen
 * (Bild 0 und 2), Ziehen (Bild 1 und 3), dann wechselt die Seite.
 */

/** Vorzeichen der Seite: `L_` liegt bei +X, `R_` bei −X. */
const S = (s) => (s > 0 ? 'L_' : 'R_');

/** Welche Seite greift oben, und wie weit ist der Zug schon? */
const SEITE = [1, 1, -1, -1];
const ZUG = [0, 1, 0, 1];

/** Höhe des Kopfgelenks über der Sohle, ohne Versatz — am Modell gemessen. */
const KOPF = 6.05;

/**
 * Ein sichtbarer Arm als Kasten, angegeben von `unten` bis `oben` über der
 * Sohle. Schmal gehalten: Ein Anbauteil bekommt links und rechts einen
 * Umriss, ist also nie schmaler als drei Pixel — mehr Fülle daneben, und aus
 * dem Arm wird ein Balken.
 */
/**
 * Ein nachgebauter Arm: Ärmel plus Hand.
 *
 * Zwei Teile statt einem, und beide nicht in Werkzeuggelb. Als einzelner
 * gelber Balken las der Arm als Gerät — drei gelbe Flächen um einen Kopf
 * ergeben Kletterhelm, Kletterhelm und Kletterhelm. Türkis ist die Farbe des
 * Anzugs und damit dieselbe Aussage wie am Rumpf, und die sandfarbene Kuppe
 * obendrauf ist das, was einen Arm zum Greifen macht: eine Hand.
 */
const arm = (vorn, seitlich, unten, oben, kopfHoch) => [
  {
    an: 'Head',
    pos: [vorn, (oben + unten) / 2 - kopfHoch - 0.5, seitlich],
    mass: [1.1, oben - unten - 1.0, 1.0],
    farbe: 'anzug',
  },
  {
    an: 'Head',
    pos: [vorn, oben - kopfHoch - 0.5, seitlich],
    mass: [1.3, 1.2, 1.2],
    farbe: 'haut',
  },
];

export default {
  clip: 'climbing',
  frames: 4,

  pose(i) {
    const s = SEITE[i];
    const z = ZUG[i];
    const O = S(s); // greifende Seite
    const U = S(-s); // ziehende Seite; das Knie dieser Seite steht hoch

    return {
      // Aufrecht an der Wand. Der Zug geht durch den Rumpf, nicht in ihn.
      Waist: [3, 0, 0],
      Spine01: [4 + 2 * z, 0, 0],
      Spine02: [2, -7 * s, 0],
      // Der Kopf wiegt mit — er trägt die Mähne, die grösste Fläche der
      // Figur, und ohne ihn wäre die Bewegung bei Spielgrösse nicht zu sehen.
      // Beim Greifen geht der Blick hoch, beim Ziehen kommt er herunter.
      Head: [-7 + 6 * z, -5 * s, 0],

      // --- Greifender Arm: Schulter hoch, Arm senkrecht --------------------
      // Im Bild unsichtbar (siehe oben), im Modell richtig.
      [`${O}Clavicle`]: [0, 0, 52 * s],
      [`${O}Upperarm`]: [0, 0, (88 - 22 * z) * s],
      [`${O}Forearm`]: [26 * z, 0, 0],

      // --- Ziehender Arm: nach vorn an die Wand, unter der Schulter --------
      [`${U}Clavicle`]: [0, 0, 12 * s],
      [`${U}Upperarm`]: [-24 + 30 * z, 86 * s, 0],
      [`${U}Forearm`]: [-14, 0, 0],

      // --- Beine: angezogen, Knie und Fuss an die Wand ---------------------
      // Das Knie der ziehenden Seite steht hoch — so geht ein Wechselschritt.
      // Getrennt wird in der *Tiefe*, nicht zur Seite: Weltachse Z bildet
      // sich mit cos 30° = 0,87 auf die Bildbreite ab, die Seitwärtsachse X
      // nur mit 0,50.
      [`${U}Thigh`]: [-80 + 14 * z, 0, 0],
      [`${U}Calf`]: [62, 0, 0],
      [`${U}Foot`]: [30, 0, 0],
      [`${O}Thigh`]: [-32 - 12 * z, 0, 0],
      [`${O}Calf`]: [48, 0, 0],
      [`${O}Foot`]: [18, 0, 0],

      // An die Wand gedrückt, und beim Zug ein Stück höher.
      _versatz: [0.8, 0.3 + 0.5 * z],
    };
  },

  teile(i) {
    const s = SEITE[i];
    const z = ZUG[i];
    const kopfHoch = KOPF + 0.3 + 0.5 * z;

    // Die beiden Arme stehen in der *Tiefe* auseinander, einer zur Wand hin
    // und einer dahinter — und zwar weit. Das ist die Zahl, an der die ganze
    // Datei hängt: Berühren sich Arm und Helm auch nur in einer Zeile,
    // verschmelzen die drei gelben Flächen zu einer Krone. Gebacken bei 3,0 /
    // −2,2 und 4,0 / −3,2: beide Male eine Krone. Erst bei 5,2 / −4,2 bleibt
    // zwischen Arm und Helm eine Spalte Umriss stehen, und erst dann sind es
    // zwei Arme. Deshalb ist der Helm hier auch nur 1,8 breit statt 3,6 — er
    // soll lang aussehen, nicht ausladend.
    const VORN = [5.2, 1.2];
    const HINTEN = [-4.2, -1.2];
    const griff = s > 0 ? VORN : HINTEN; // die greifende Hand
    const nach = s > 0 ? HINTEN : VORN; // die nachziehende

    return [
      // Kletterhelm. Anbauteile folgen dem Gelenk nur in der Lage, nicht in
      // der Drehung — die Kopfneigung wird deshalb von Hand nachgeführt.
      {
        an: 'Head',
        pos: [0.6, 6.4, 0],
        mass: [5.0, 1.4, 1.8],
        dreh: [-7 + 6 * z, 0, 0],
        farbe: 'werkzeug',
      },
      // Die greifende Hand bleibt auf 17,2 stehen, während die Schulter unter
      // ihr steigt: Der Arm wird im Zug von selbst um einen halben Pixel
      // kürzer. So zieht sich die Figur hoch, statt den Griff mitzunehmen.
      ...arm(griff[0], griff[1], 11.4 + 0.5 * z, 17.2, kopfHoch),
      // Die andere Hand holt auf und ist beim nächsten Greifen oben.
      ...arm(nach[0], nach[1], 11.0 + 0.5 * z, 14.4 + 1.6 * z, kopfHoch),
    ];
  },
};
