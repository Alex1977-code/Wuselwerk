/**
 * Rettung — sechs Bilder, einmalig.
 *
 * Der einzige fröhliche Zustand des Spiels: Die Figur hat es geschafft und
 * steigt in den Ausgang. Der Ablauf friert auf Bild 5 ein (`once` in
 * `src/render/atlas.ts`); dieses Bild bleibt stehen und muss für sich allein
 * lesbar sein.
 *
 * **Der Versatz ist der Vorgang.** Von der Fusspunktlinie (Bild 0) bis sechs
 * Pixel darüber (Bild 5), in fünf gleichen Schritten von 1,2 — bei zwölf Pixeln
 * Figurenhöhe eine halbe Figur. Der Ausgang selbst wird nie gezeichnet, das
 * Steigen ist also der ganze Vorgang.
 *
 * Sechs Pixel sind zugleich das Höchstmass. Die längste Haarsträhne steht knapp
 * zehn Pixel über dem Kopfgelenk, das Kopfgelenk 6,1 über der Sohle, und über
 * dem Fusspunkt hat die Zelle 22 Zeilen. Bei sechs Pixeln Hub liegt die
 * Haarspitze auf Zeile 1 und ihr Umriss auf Zeile 0 — genau aufgebraucht.
 *
 * **Warum die Arme nicht jubeln können.** Am Modell gemessen: Ein erhobener Arm
 * hebt die Faust nur rund anderthalb Pixel über die Schulter, die Mähne steht
 * acht über dem Kopfgelenk und reicht bis auf die Schultern herab. Sechs
 * Armstellungen von senkrecht hoch bis waagerecht nach hinten wurden gebacken
 * und verglichen: Bis auf eine sind sie im Bild überhaupt nicht vorhanden, die
 * Mähne schluckt sie. Dasselbe steht in `hoisting.mjs` und `floating.mjs`.
 *
 * Sichtbar bleibt allein die Richtung **nach vorn**, und zwar aus zwei Gründen:
 * Vor dem Gesicht steht kein Haar, und die Kamera bildet ein Mass nach vorn mit
 * cos 30° ≈ 0,87 ab, eines zur Seite nur mit sin 30° = 0,5. Ein Arm, der 30°
 * über die Waagerechte nach vorn greift, setzt einen Hautfleck genau auf die
 * vordere Umrisskante — ein Pixel, das über die Schulterlinie hinausragt. Mehr
 * Jubel gibt diese Figur nicht her, und darum tragen ihn die drei Formen, die
 * gross genug sind:
 *
 *   **Mähne** — sie ist die grösste Fläche der Figur. Der Kopf legt sich bis auf
 *   52° zurück, die Haarmasse kippt mit ihm nach hinten und unten und zieht als
 *   Schweif hinter der steigenden Figur her. Dazu der Strähnenschlag (`_haar`):
 *   Er springt beim Absprung auf und lässt die Mähne auffächern, statt sie als
 *   Klotz stehen zu lassen. Eine Strähne bleibt dabei senkrecht und steht als
 *   Spitze über allem — die Linie, an der das Auge das Steigen festmacht.
 *   **Rumpf** — zurückgelehnt, Brust voran, Blick nach oben zum Ausgang. Nur
 *   zehn Grad; nach vorn wären schon zwölf zu viel, weil die Mähne dann den
 *   ganzen Körper zudeckt, nach hinten räumt sie das Gesicht frei.
 *   **Beine** — Bild 0 steht mit flachen Sohlen auf der Linie, ab Bild 2 hängen
 *   sie gestreckt und die Füsse spitzen sich nach unten. Zwei Pixel Fuss sind
 *   wenig, aber es ist der einzige Unterschied zwischen „steht" und „schwebt",
 *   den diese Figur hergibt.
 *
 * Zusammen ist das eine nach hinten gebogene Figur mit Schweif und Spitze,
 * deren Sohlen über der Bodenlinie stehen — im ganzen Blatt gibt es das sonst
 * nicht.
 */

/**
 * Bildweise Schlüsselwerte. Sechs Bilder sind zu wenig für eine Formel, und
 * jedes hat seine eigene Aufgabe:
 *
 *   0 stehen, Arme hinten · 1 Absprung · 2 abheben · 3 steigen · 4 steigen
 *   · 5 schweben (dieses Bild bleibt stehen)
 */
const K = {
  //          0     1     2     3     4     5
  hoch: [0, 1.2, 2.4, 3.6, 4.8, 6.0],

  // Rumpf: ein Hauch nach vorn im Absprung, danach zurückgelehnt.
  spine01: [3, 0, -5, -8, -10, -10],
  spine02: [1, 0, -2, -3, -4, -4],
  // Kopfneigung gegen den Rumpf, negativ heisst zurück. Im Bild ankommt die
  // Summe der Kette: 6, -6, -27, -43, -52, -52.
  kopf: [2, -6, -20, -32, -38, -38],

  /**
   * Arme. Z klappt sie aus dem T heraus: ∓90 stellt sie senkrecht nach oben,
   * der Betrag darunter ist die seitliche Spreizung. X kippt sie danach aus der
   * Senkrechten nach vorn — 0 senkrecht hoch, 60 schräg hoch nach vorn, 90
   * waagerecht, 150 nach hinten unten.
   *
   * Die beiden Arme dürfen nicht dasselbe tun: Aus 30° zum Profil lägen sie
   * sonst übereinander. Der ferne Arm (L) spreizt weit zur Seite — die
   * Figurenlinke zeigt im Bild nach rechts, seitliches Ausbreiten schiebt ihn
   * also aus dem Körper heraus —, der nahe (R) greift schmal und höher.
   */
  vornV: [150, 100, 46, 30, 24, 22],
  vornH: [160, 114, 84, 74, 68, 66],
  seitV: [4, 6, 8, 10, 10, 10],
  seitH: [10, 18, 28, 34, 36, 36],
  // Ellbogen leicht gebeugt — ein völlig gerader Arm liest als Stock.
  unterarmV: [10, 18, 10, 4, 0, -2],
  unterarmH: [8, 14, 8, 4, 2, 0],

  // Beine. Die Summe Schenkel + Wade + Fuss ist der Winkel der Sohle: null
  // heisst flach auf dem Boden, positiv heisst Fussspitze nach unten. Bild 0
  // steht deshalb auf beiden Sohlen, ohne dass ein Bein gestreckt sein müsste.
  schenkelV: [-14, -20, -2, 14, 20, 22],
  wadeV: [14, 22, 6, 2, 0, 0],
  fussV: [0, -2, 14, 14, 10, 8],
  schenkelH: [10, 16, 6, -6, -12, -14],
  wadeH: [0, 0, 6, 12, 14, 14],
  fussH: [-10, -16, 14, 20, 24, 26],

  // Strähnenschlag: ruhig am Boden, voll ab dem Absprung, danach wieder etwas
  // zurück — sonst schlägt das Haar im Standbild 5 unruhig aus, und gerade
  // dieses Bild bleibt am längsten stehen.
  haar: [0.25, 0.5, 1.0, 1.15, 0.95, 0.85],
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

      // Seitlich leicht gespreizt. Zwei Beine sind bei drei Pixeln Länge im
      // Bild ohnehin nie zu trennen — die Spreizung verhindert nur, dass sie
      // zu einer Fläche verschmelzen.
      R_Thigh: [K.schenkelV[i], 0, 5],
      L_Thigh: [K.schenkelH[i], 0, -5],
      R_Calf: [K.wadeV[i], 0, 0],
      L_Calf: [K.wadeH[i], 0, 0],
      R_Foot: [K.fussV[i], 0, 0],
      L_Foot: [K.fussH[i], 0, 0],

      _versatz: [0, K.hoch[i]],
      _haar: K.haar[i],
    };
  },
};
