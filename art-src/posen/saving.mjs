/**
 * Rettung — sechs Bilder, einmalig.
 *
 * Der einzige fröhliche Zustand im Spiel. Die Figur hat es geschafft und steigt
 * in den Ausgang: Arme jubelnd hoch, Kopf zurück, Beine baumeln. Der Ablauf
 * friert auf Bild 5 ein (`once` in `src/render/atlas.ts`), dieses Bild muss
 * also für sich allein stehen können.
 *
 * **Der Versatz ist der Vorgang.** Vom Boden (Bild 0) bis sechs Pixel darüber
 * (Bild 5), in fünf gleichen Schritten von 1,2 — bei zwölf Pixeln Figurenhöhe
 * eine halbe Figurenlänge. Nichts anderes im Bild kann „steigt auf" sagen; der
 * Ausgang selbst wird nie gezeichnet. Zugleich ist das die Grenze nach oben:
 * Die längste Haarsträhne steht knapp zehn Pixel über dem Kopfgelenk, das
 * Kopfgelenk 6,1 über der Sohle, und die Zelle hat über dem Fusspunkt 22
 * Zeilen. Mehr als sechs Pixel Hub schneidet die Mähne oben ab.
 *
 * **Was ein erhobener Arm hier kann und was nicht.** Vom Schultergelenk bis zur
 * Fäustlingsspitze misst der Arm drei Pixel, die Mähne steht acht über dem
 * Kopfgelenk und hängt bis auf die Schultern herab. Ein senkrecht erhobener Arm
 * endet mitten im Haar und ist im Bild nicht vorhanden — in `hoisting.mjs`
 * schon einmal probiert und verworfen. Frei ist allein die Richtung **nach vorn
 * und schräg hoch**: Dort steht nur das Gesicht, und die Kamera bildet ein Mass
 * nach vorn mit cos 30° ≈ 0,87 ab, ein Mass zur Seite nur mit sin 30° = 0,5.
 * Die Arme greifen deshalb dem Ausgang entgegen, statt senkrecht zu jubeln.
 *
 * Die beiden Arme dürfen dabei nicht dasselbe tun, sonst liegen sie aus 30° zum
 * Profil übereinander und sind im Bild ein Balken. Der **ferne** Arm (L) geht
 * weit zur Seite: Die Figurenlinke zeigt zur Kamera hin nach rechts, seitliches
 * Ausbreiten schiebt ihn also *aus* dem Kopf heraus. Der **nahe** Arm (R) bleibt
 * schmal am Körper und greift höher. So stehen zwei Hände übereinander vor der
 * Stirn statt einer Fläche daneben.
 *
 * **Der Kopf legt sich weit zurück.** Das ist die zweite Hälfte derselben
 * Rechnung: Die Haarmasse des Modells hängt am Kopf, und zurückgelegt räumt sie
 * die Fläche vor dem Gesicht — genau die, in der die Hände stehen. Der Rumpf
 * lehnt nur wenig mit; über 12° deckt die Mähne den Körper zu und übrig bleibt
 * ein roter Fleck.
 *
 * **Die Beine sagen „hebt ab".** Bild 0 steht mit flachen Sohlen auf der
 * Fusspunktlinie (Schenkel und Wade heben sich gegenseitig auf, die Summe der
 * Kette am Fuss ist null). Ab Bild 2 hängen sie gestreckt, spreizen sich in der
 * Tiefe — übereinander gelegt wären sie im Bild ein einziger Strich — und die
 * Füsse spitzen sich nach unten. Zwei Pixel Fuss sind wenig, aber es ist der
 * einzige Unterschied zwischen „steht" und „schwebt", den diese Figur hergibt.
 */

/**
 * Bildweise Schlüsselwerte. Sechs Bilder sind zu wenig für eine Formel, und
 * jedes hat seine eigene Aufgabe:
 *
 *   0 stehen, Arme zurück · 1 Absprung · 2 abheben · 3 steigen · 4 steigen
 *   · 5 schweben (dieses Bild bleibt stehen und muss ruhig wirken)
 */
const K = {
  //          0     1     2     3     4     5
  hoch: [0, 1.2, 2.4, 3.6, 4.8, 6.0],

  // Rumpf: ein Hauch nach vorn im Absprung, danach zurückgelehnt. Klein
  // halten — die Bewegung tragen die Arme, nicht der Rumpf.
  spine01: [4, 1, -4, -7, -9, -9],
  spine02: [1, 0, -2, -3, -3, -3],
  // Kopfneigung gegen den Rumpf, negativ heisst zurück. Im Bild ankommen tut
  // die Summe der Kette: 7, -5, -22, -32, -37, -38.
  kopf: [2, -6, -16, -22, -25, -26],

  /**
   * Arme. Z klappt sie aus dem T heraus: ∓90 stellt sie senkrecht nach oben,
   * der Betrag darunter ist die seitliche Spreizung nach aussen. X kippt sie
   * danach aus der Senkrechten nach vorn — 0 ist senkrecht hoch, 90 waagerecht
   * nach vorn, über 90 hinunter, 152 nach hinten unten.
   */
  vornV: [152, 96, 44, 30, 26, 24],
  vornH: [162, 112, 62, 50, 46, 44],
  seitV: [4, 6, 8, 10, 10, 10],
  seitH: [8, 16, 26, 34, 36, 36],
  // Ellbogen leicht gebeugt — ein völlig gerader Arm liest als Stock.
  unterarmV: [10, 18, 10, 6, 4, 2],
  unterarmH: [8, 14, 8, 2, 0, -2],

  // Beine. Die Summe Schenkel + Wade + Fuss ist der Winkel der Sohle: null
  // heisst flach auf dem Boden, positiv heisst Fussspitze nach unten.
  schenkelV: [-14, -20, -4, 8, 12, 14],
  wadeV: [14, 22, 6, 0, 0, 0],
  fussV: [0, -2, 12, 18, 18, 18],
  schenkelH: [10, 14, 2, -8, -12, -14],
  wadeH: [0, 0, 4, 8, 10, 10],
  fussH: [-10, -14, 16, 26, 30, 32],

  // Haarschwung. Er wächst mit dem Aufstieg — die Mähne ist die grösste Fläche
  // der Figur, und ihr Auffächern ist der Jubel.
  haar: [0.3, 0.6, 1.0, 1.2, 1.1, 1.0],
};

export default {
  clip: 'saving',
  frames: 6,

  pose(i) {
    return {
      Spine01: [K.spine01[i], 0, 0],
      Spine02: [K.spine02[i], 0, 0],
      Head: [K.kopf[i], 0, 0],

      R_Upperarm: [K.vornV[i], 0, -(90 - K.seitV[i])],
      L_Upperarm: [K.vornH[i], 0, 90 - K.seitH[i]],
      R_Forearm: [K.unterarmV[i], 0, 0],
      L_Forearm: [K.unterarmH[i], 0, 0],

      R_Thigh: [K.schenkelV[i], 0, 4],
      L_Thigh: [K.schenkelH[i], 0, -4],
      R_Calf: [K.wadeV[i], 0, 0],
      L_Calf: [K.wadeH[i], 0, 0],
      R_Foot: [K.fussV[i], 0, 0],
      L_Foot: [K.fussH[i], 0, 0],

      _versatz: [0, K.hoch[i]],
      _haar: K.haar[i],
    };
  },
};
