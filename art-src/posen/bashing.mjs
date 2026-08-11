/**
 * Waagerecht graben — der Rammer.
 *
 * Drei Bilder, Zyklus. **Bild 0 ist das Wirkungsbild**: Dort trifft der Hammer
 * die Wand, er steht also ganz vorn und gestreckt. Bild 1 hebt ihn an, Bild 2
 * zieht ihn an den Körper zurück. Gespielt wird 0 → 1 → 2 → 0; der Schlag
 * selbst liegt zwischen dem letzten und dem ersten Bild und ist damit der
 * grösste Sprung des Zyklus — zurück geht es in zwei Schritten, vor in einem.
 *
 * ## Was diesen Zustand von seinen Nachbarn trennt
 *
 * Drei Zustände graben, und alle drei tragen ein gelbes Werkzeug:
 *
 *   digging  Spaten **unten** vor den Füssen
 *   mining   Werkzeug **schräg abwärts**
 *   bashing  Hammer **waagerecht auf Brusthöhe**
 *
 * Die Unterscheidung liegt allein in Höhe und Neigung des Anbauteils, nicht in
 * seiner Farbe (GDD §6). Deshalb ist der Hammer hier in **jedem** Bild
 * waagerecht, nicht nur im Wirkungsbild. Ausgeholt wird nach hinten und oben,
 * nicht durch Kippen.
 *
 * Das ist erlaufen, nicht entschieden: Gebacken mit 15°/32° und mit 12°/22°
 * Neigung in den Ausholbildern. Ein Stiel ist 0,9 dick und damit im Bild eine
 * Zeile hoch; sobald er schräg steht, tritt er über zwei Zeilen und wird
 * doppelt so dick, und der gekippte Kopf legt sich mit seiner Ecke genau in
 * diesen Absatz. Aus Stiel und Kopf wird ein einziger Klumpen — bei 15° ein
 * Stiefel, bei 32° ein Keil. Zwei von drei Bildern zeigten damit kein Werkzeug
 * mehr. Waagerecht bleibt der Stiel eine saubere Linie und der Kopf ein
 * eigener Klotz daran, und genau dieses Paar ist die Silhouette des Berufs.
 *
 * ## Wohin der Hammer passt und wohin nicht
 *
 * Am Modell gemessen, in logischen Pixeln über der Sohle: Schultergelenk 5,6,
 * Brustwirbel 4,4, Haarsaum 6,7, Mähnenspitze 14. Der Streifen zwischen
 * Haarsaum und Gürtel ist der einzige Ort, an dem ein Werkzeug **neben** dem
 * Kopf steht und nicht in ihm. Dort liegt der Stiel: im Treffer auf 5,5, im
 * Ausholen auf 6,2. Höher wandert er in den Haarsaum und wird zum gelben Fleck
 * im Haar, tiefer sinkt er auf Gürtelhöhe und wird zum Spaten.
 *
 * Die Länge ist ebenfalls erlaufen. Mit 4,4 langem Stiel verschmolzen Stiel und
 * Kopf zu einem Fausthandschuh — im Bild blieben zwischen Rumpf und Kopf nur
 * zwei Pixel Stiel übrig. Erst 6,2 schiebt den Kopf so weit hinaus, dass vier
 * Pixel Linie zwischen Faust und Klotz stehen. Der Hammer ist damit fast so
 * lang wie die Figur breit ist. Das ist Absicht: Was den Beruf trägt, muss
 * grösser sein als das, was ihn verdeckt.
 *
 * ## Der Hammer hängt an der Hand, nicht am Becken
 *
 * `an: 'R_Hand'` — ein Anbauteil übernimmt die *Lage* seines Gelenks. Der
 * Hammer folgt damit von selbst dem, was die Arme tun; die Armwinkel werden
 * nirgends ein zweites Mal nachgerechnet, und die Faust liegt in jedem Bild am
 * Griff. Die rechte Hand ist die kameranahe (`R_` liegt bei −X, die Kamera
 * steht bei −X): Das Werkzeug steht damit vor dem Rumpf und wird nie von ihm
 * verdeckt.
 *
 * Der Arm selbst ist unsichtbar — Schulter bis Faust misst knapp drei Pixel und
 * liegt zwischen Mähne und Rumpf (dieselbe Beobachtung wie in `climbing.mjs`
 * und `hoisting.mjs`). Sichtbar ist von ihm nur das eine Hautpixel der Faust am
 * Stielanfang. Die Winkel sind deshalb danach gewählt, wo die **Faust** landen
 * soll, und nicht danach, wie der Ellbogen dabei steht.
 *
 * ## Der Rumpf bleibt aufrecht
 *
 * Spine01 geht nie über 8°. Der Kopf ist fast die halbe Figur und die Mähne
 * hängt an ihm — wer sich vorbeugt, deckt den Körper mit Haar zu und der
 * Hammer verschwindet darunter. Die Bewegung tragen die Arme. Was der Rumpf
 * beiträgt, ist das Aufschaukeln: im Ausholen zurück, im Treffer nach vorn,
 * und der Kopf gegenläufig, damit die Mähne nachschlägt.
 */

/**
 * Bildweise Schlüsselwerte.
 *
 *   0 Treffer · 1 anheben · 2 ausgeholt (steht vor dem nächsten Schlag)
 */
const K = {
  //             0      1      2
  // Oberarm um die Weltachse X, *nachdem* Z ihn aus der T-Haltung
  // heruntergeklappt hat. −90 heisst waagerecht nach vorn, 0 hängend, und
  // jenseits von ±180 zeigt er nach oben hinten. Daraus folgt die Faust:
  //
  //   vorn = 1,4 − 1,5·sin(oberarm)      hoch = 5,6 − 1,5·cos(oberarm)
  //
  //   −86 → Faust auf (2,9 | 5,5)   ganz vorn, Arm gestreckt
  //  −114 → Faust auf (2,8 | 6,2)   eine Zeile höher, kaum zurück
  //  +114 → Faust auf (0,0 | 6,2)   gleiche Höhe, drei Pixel zurückgezogen
  //
  // Der Ellbogen fährt dabei hoch über die Schulter. Bei einem beidhändigen
  // Vorschlaghammer ist das die übliche Haltung, und zu sehen ist davon
  // ohnehin nichts.
  oberarm: [-86, -114, 114],

  spine01: [8, 2, -3],
  spine02: [4, 1, -1],
  // Kopf gegen den Rumpf. Im Bild ankommend: 11, 0, −11 — der Blick geht mit
  // dem Schlag nach vorn und im Ausholen zurück. Weil die Mähne am Kopf hängt,
  // ist das die grösste Flächenbewegung des Zyklus.
  kopf: [-1, -3, -7],

  // Ausfallschritt: das kameranahe Bein (R) vorn, das andere stemmt hinten.
  // Getrennt wird in der Tiefe, nicht zur Seite — Weltachse Z bildet sich mit
  // cos 30° = 0,87 auf die Bildbreite ab, die Seitwärtsachse X nur mit 0,50.
  // Viel kommt davon nicht an: Vom Becken (2,9) bis zur Sohle sind es drei
  // Zeilen, und breiter als vier Pixel wird der Stand darin nicht.
  schenkelV: [-52, -49, -46],
  wadeV: [24, 23, 22],
  fussV: [28, 26, 24],
  schenkelH: [34, 32, 30],
  wadeH: [8, 8, 8],
  fussH: [-22, -20, -18],

  // Der Körper stösst mit dem Schlag nach vorn und lädt im Ausholen zurück.
  // Das ist die halbe Bewegung: Der Arm allein zieht den Hammerkopf nur drei
  // Pixel zurück, weil er von der Schulter bis zur Faust knapp drei Pixel lang
  // ist und damit am Anschlag arbeitet. Der Rumpf legt anderthalb dazu.
  vorn: [1.0, 0.1, -0.6],
  // Der Höhenwert ist keine Wahl, sondern Folge des Ausfallschritts: Gespreizte
  // Beine sind kürzer als gestreckte, ohne Absenkung schwebte die Figur.
  hoch: [-0.58, -0.54, -0.5],
  // Nachschwung der Strähnen: im Treffer schlagen sie durch, danach beruhigt
  // es sich. Ein ruhiger Kopf liesse die Figur bei Spielgrösse tot wirken.
  haar: [1.1, 0.3, 0.5],
};

/**
 * Unterarmwinkel, so dass der Unterarm waagerecht nach vorn zeigt — in der
 * Achse des Stiels. Winkel gelten in Weltachsen und addieren sich deshalb
 * entlang der Kette: Oberarm + Unterarm ist die Weltrichtung des Unterarms,
 * und −90 ist waagerecht nach vorn.
 */
const unterarm = (i) => -90 - K.oberarm[i];

// Der Hammer in logischen Pixeln, gemessen vom Handgelenk aus nach vorn.
const GRIFF = 0.4; // Handgelenk bis Stielanfang
const STIEL = 6.2; // freie Stiellänge
const KOPF = 2.0; // Tiefe des Kopfes entlang des Stiels
// Seitlicher Versatz von der rechten Hand zur Mitte zwischen beiden Händen.
// Nicht die volle Strecke: Ein Rest auf der Kameraseite hält den Hammer vor
// dem Rumpf, und die Achse bildet sich ohnehin nur mit 0,50 aufs Bild ab.
const SEITLICH = 0.8;

export default {
  clip: 'bashing',
  frames: 3,

  pose(i) {
    return {
      Spine01: [K.spine01[i], 0, 0],
      Spine02: [K.spine02[i], 0, 0],
      Head: [K.kopf[i], 0, 0],

      // Z klappt die Arme aus der T-Haltung herunter (`L_` liegt bei +X und
      // senkt mit −Z, `R_` bei −X mit +Z), erst danach schwingt X sie nach
      // vorn. Ohne das Herunterklappen läge der Arm auf der Achse X, und keine
      // Drehung um X bewegte ihn auch nur einen Millimeter.
      R_Upperarm: [K.oberarm[i], 0, 90],
      L_Upperarm: [K.oberarm[i] + 4, 0, -90],
      R_Forearm: [unterarm(i), 0, 0],
      L_Forearm: [unterarm(i) - 4, 0, 0],

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

  teile() {
    return [
      // Stiel: dünn und waagerecht. Ein Anbauteil bekommt links und rechts
      // einen Umriss und ist im Bild nie schmaler als drei Pixel — mehr Fülle,
      // und aus der Linie wird ein Balken.
      {
        an: 'R_Hand',
        pos: [GRIFF + STIEL / 2, 0, SEITLICH],
        mass: [STIEL, 0.9, 0.9],
        farbe: 'werkzeug',
      },
      // Kopf: dick und quer zum Stiel. Er ist der eine Klotz, der aus dem
      // Umriss heraussteht, und trägt damit den ganzen Beruf. Schmal in der
      // Seitwärtsachse gehalten — dort ist er ohnehin kaum zu sehen, und jedes
      // Pixel Breite dort geht auf Kosten der Höhe, die man sieht.
      {
        an: 'R_Hand',
        pos: [GRIFF + STIEL + KOPF / 2, 0, SEITLICH],
        mass: [KOPF, 3.4, 1.8],
        farbe: 'werkzeug',
      },
    ];
  },
};
