/**
 * Schräg graben — der Bergmann mit der Spitzhacke.
 *
 * Vier Bilder, Zyklus. **Bild 0 ist das Wirkungsbild**: Dort steht die Hacke
 * schräg nach vorn-unten, der Kopf auf Hüfthöhe vor den Füssen im Berg. Die
 * Bilder 1 bis 3 holen nach hinten-oben aus. Gespielt wird 0 → 1 → 2 → 3 → 0;
 * der Schlag liegt zwischen dem letzten und dem ersten Bild und ist damit der
 * grösste Sprung des Zyklus — hoch geht es in drei Schritten, herunter in einem.
 *
 * ## Die Diagonale ist der Beruf
 *
 * Drei Zustände graben, alle drei tragen ein gelbes Werkzeug, und die Farbe
 * unterscheidet sie nicht (GDD §6):
 *
 *   digging  Spaten **senkrecht** unten vor den Füssen
 *   bashing  Hammer **waagerecht** auf Brusthöhe
 *   mining   Hacke **schräg** über Eck, von der Brust bis vor die Füsse
 *
 * Der Stiel steht deshalb in *jedem* Bild schräg — im Bild zwischen 43° und
 * 47°, nie flacher und nie steiler. Ausgeholt wird, indem die Fäuste steigen
 * und der Stiel sich dabei etwas legt, nicht durch Aufrichten. Eine Hacke, die
 * beim Ausholen senkrecht steht, ist in diesen Bildern der Gräber; eine, die
 * sich legt, ist der Rammer.
 *
 * ## Eine Diagonale muss länger sein als eine Waagerechte
 *
 * Erlaufen, nicht entschieden: Der erste Stiel war 4,4 lang, so lang wie beim
 * Spaten. Im Bild blieb davon nichts — eine Diagonale gibt nur cos 45° ihrer
 * Länge nach rechts ab und der Rest nach unten, und die Tiefenachse schrumpft
 * dabei noch einmal auf 0,87. Aus 4,4 logischen Pixeln wurden 2,7 Bildpunkte
 * Breite: ein gelber Fleck am Gürtel, in dem weder Stiel noch Kopf zu erkennen
 * war. Erst 6,0 freier Stiel plus Kopf reichen so weit hinaus wie der Hammer
 * des Rammers und lesen als Werkzeug.
 *
 * ## Wohin die Hacke passt und wohin nicht
 *
 * Am Modell gemessen, in logischen Pixeln über der Sohle: Schulter 5,6,
 * Brustwirbel 4,4, Becken 2,9, Kopfgelenk 6,1. Die Fäuste hängen an einem Arm
 * von knapp 2,6 Länge und kommen über eine Höhe von 6,0 (Treffer) bis 7,6
 * (ausgeholt) kaum hinaus; die Bewegung des Kopfes der Hacke entsteht deshalb
 * fast ganz aus dem langen Hebel, nicht aus dem Arm.
 *
 * `ANSATZ` hebt die ganze Hacke, damit ihr Kopf im Treffer auf Hüfthöhe steht
 * und nicht am Boden. Viel mehr als ein logisches Pixel darf das nicht sein:
 * Der Stiel steigt mit, und sein hinteres Ende sitzt schon jetzt am Kinn. Wer
 * höher hebt, legt der Figur das Werkzeug übers Gesicht.
 */

const rad = (g) => (g * Math.PI) / 180;

/**
 * Richtung des Stiels, in Grad: 0 = waagerecht nach vorn, +90 = senkrecht hoch,
 * −45 = schräg nach vorn-unten. Zurück kommt der Einheitsvektor in
 * Figurenachsen, [vorn, hoch].
 *
 * Im Bild wirkt der Winkel steiler als er ist: Die Kamera steht 30° aus dem
 * Profil, die Tiefenachse bildet sich deshalb nur mit cos 30° = 0,87 auf die
 * Bildbreite ab, die Höhe voll. Aus −45 werden im Bild 47°.
 */
const achse = (phi) => [Math.cos(rad(phi)), Math.sin(rad(phi))];

/**
 * Bildweise Schlüsselwerte.
 *
 *   0 Treffer · 1 heraus · 2 hoch · 3 ausgeholt (steht vor dem nächsten Schlag)
 */
const K = {
  //     0    1    2    3
  // Der Stiel legt sich beim Ausholen ein wenig flacher. Das ist kein Zierrat:
  // Steigt nur die Faust, wandert der Kopf fast waagerecht nach hinten; erst
  // die flachere Lage hebt ihn zusätzlich, und aus dem Zug nach hinten wird
  // einer nach hinten-oben.
  phi: [-45, -43, -41, -39],

  // Oberarm um die Weltachse X, *nachdem* Z ihn aus der T-Haltung
  // heruntergeklappt hat: −90 ist waagerecht nach vorn, 0 hängend, jenseits von
  // −90 zeigt er nach vorn-oben. Der Arm bleibt lang und vorn — die Fäuste sind
  // der Aufhängepunkt der Hacke, und je weiter vorn sie sitzen, desto mehr
  // Stiel steht frei vor dem Rumpf statt im Haar.
  oberarm: [-102, -116, -130, -146],
  unterarm: [8, 8, 8, 8],

  spine01: [10, 7, 0, -4],
  spine02: [5, 3, 1, -2],
  // Kopf gegen den Rumpf; im Bild ankommend 13, 8, −1, −10 (die Winkel gelten
  // in Weltachsen und addieren sich deshalb entlang der Kette). Der Blick folgt
  // dem Schlag nach unten-vorn und geht beim Ausholen zurück. Weil die Mähne am
  // Kopf hängt, ist das die grösste Flächenbewegung des Zyklus — Spine01 bleibt
  // dagegen unter 12°, sonst deckt das Haar den ganzen Körper zu.
  kopf: [-2, -2, -2, -4],

  // Ausfallschritt, das kameranahe Bein (R) vorn. Getrennt wird in der Tiefe:
  // Weltachse Z bildet sich mit 0,87 auf die Bildbreite ab, die Seitwärtsachse
  // X nur mit 0,50.
  schenkelV: [-34, -32, -30, -28],
  wadeV: [20, 19, 18, 17],
  fussV: [18, 17, 16, 15],
  schenkelH: [26, 25, 24, 23],
  wadeH: [8, 8, 8, 8],
  fussH: [-18, -17, -16, -15],

  vorn: [0.7, 0.3, -0.1, -0.5],
  // Folge des Ausfallschritts: Gespreizte Beine sind kürzer als gestreckte,
  // ohne Absenkung schwebte die Figur.
  hoch: [-0.5, -0.46, -0.42, -0.38],
  haar: [1.2, 0.5, 0.2, 0.4],
};

// Die Hacke in logischen Pixeln, gemessen vom Handgelenk entlang des Stiels.
const HINTEN = 0.3; // Stiel hinter der Faust
const VORN = 6.0; // freie Stiellänge vor der Faust
const KOPF = 2.0; // Tiefe des Kopfes entlang des Stiels
const SEITLICH = 0.7; // Versatz zur Mitte zwischen beiden Fäusten
const ANSATZ = 1.0; // Hebt die ganze Hacke, damit der Kopf nicht am Boden klebt

export default {
  clip: 'mining',
  frames: 4,

  pose(i) {
    return {
      Spine01: [K.spine01[i], 0, 0],
      Spine02: [K.spine02[i], 0, 0],
      Head: [K.kopf[i], 0, 0],

      // Z klappt die Arme aus der T-Haltung herunter (`L_` liegt bei +X und
      // senkt mit −Z, `R_` bei −X mit +Z), erst danach schwingt X sie vor.
      R_Upperarm: [K.oberarm[i], 0, 90],
      L_Upperarm: [K.oberarm[i] + 6, 0, -90],
      R_Forearm: [K.unterarm[i], 0, 0],
      L_Forearm: [K.unterarm[i] - 6, 0, 0],

      R_Thigh: [K.schenkelV[i], 0, 0],
      L_Thigh: [K.schenkelH[i], 0, 0],
      R_Calf: [K.wadeV[i], 0, 0],
      L_Calf: [K.wadeH[i], 0, 0],
      R_Foot: [K.fussV[i], 0, 0],
      L_Foot: [K.fussH[i], 0, 0],

      _versatz: [K.vorn[i], K.hoch[i]],
      _haar: K.haar[i],
    };
  },

  teile(i) {
    const phi = K.phi[i];
    const [uv, uh] = achse(phi);
    // Beide Kästen bekommen dieselbe Drehung. Der Stiel liegt in der Tiefe des
    // Kastens, der Kopf in seiner Höhe — quer zum Stiel ohne zweite Rechnung.
    const dreh = [-phi, 0, 0];
    const mitte = (VORN - HINTEN) / 2;

    return [
      // Stiel: dünne Linie über Eck, bewusst dünner als der Hammerstiel des
      // Rammers. Eine Diagonale tritt ohnehin über zwei Zeilen und wird dadurch
      // im Bild doppelt so dick; mit 0,9 Fülle stand sie zwei Bildpunkte breit
      // da und war vom Kopf nicht mehr zu unterscheiden. Der Umriss ringsum
      // hält sie trotz 0,75 zusammen.
      {
        an: 'R_Hand',
        pos: [mitte * uv, mitte * uh + ANSATZ, SEITLICH],
        mass: [HINTEN + VORN, 0.75, 0.75],
        dreh,
        farbe: 'werkzeug',
      },
      // Kopf: quer zum Stiel und **hinter** dessen Ende, nicht auf ihm. Sitzt
      // er mittig auf der Spitze, kreuzen sich zwei Diagonalen in derselben
      // Zelle, die Kreuzung läuft voll und aus Linie und Klotz wird ein Keil —
      // im Bild ein Stiefel. Erst hintereinander gesetzt bleiben es zwei
      // Formen: eine Linie und der Klotz daran.
      //
      // Das Mass ist die zweite erlaufene Zahl. Länger und dünner (4,8 × 1,5)
      // wäre die schönere Hacke, aber ein schräger Balken dieser Stärke füllt
      // seine Zellen nicht mehr durchgehend: Die obere Spitze fiel als
      // einzelner Punkt aus dem Umriss heraus und schwebte neben dem Werkzeug.
      // 4,2 × 2,0 steht als geschlossener Klotz.
      {
        an: 'R_Hand',
        pos: [(VORN + KOPF / 2) * uv, (VORN + KOPF / 2) * uh + ANSATZ, SEITLICH],
        mass: [KOPF, 4.2, 1.5],
        dreh,
        farbe: 'werkzeug',
      },
    ];
  },
};
