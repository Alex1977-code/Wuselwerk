/**
 * Zusammenbruch — acht Bilder, einmalig.
 *
 * Der allgemeine Rückfall für jede Todesart. Läuft von Bild 0 bis 7 und friert
 * dann ein (`once` in `src/render/atlas.ts`). Was am Ende steht, bleibt stehen,
 * bis der Wusel aus der Liste fällt — das letzte Bild ist deshalb das
 * wichtigste des ganzen Ablaufs.
 *
 * ## Die Silhouette
 *
 * Der Zustand hat genau eine Aussage, und sie ist eine Formaussage: **aufrecht
 * und schmal wird liegend und breit.** Am gebackenen Bild ausgemessen, Höhe ×
 * Breite in Zellpixeln:
 *
 *   Bild  0     1     2     3     4     5     6     7
 *         16×11 15×12 15×11 15× 9 14×10 14×13 12×14 12×14
 *
 * Bild 0 ist um die Hälfte höher als breit, Bild 7 breiter als hoch. Dieses
 * Kippen des Seitenverhältnisses ist der Unterschied, der auch als schwarzer
 * Umriss trägt (GDD §6): Kein anderer Zustand auf dem Blatt wird jemals breiter
 * als hoch. Die Oberkante fällt dabei von Zeile 6 auf Zeile 12 — sechs Zeilen,
 * die Hälfte der Figurenhöhe.
 *
 * Der Ablauf zerfällt in zwei Hälften, die einander widersprechen sollen:
 *
 *   0–2  **Erschrecken.** Die Figur streckt sich, geht auf die Zehen, der Kopf
 *        fliegt in den Nacken, die Arme hoch. Sie ist hier *höher* als im
 *        Stand. Ohne diese Gegenbewegung liest der Rest als Hinsetzen.
 *   3–7  **Sacken.** Die Knie geben nach, die Figur kippt über ihr eigenes
 *        Becken nach vorn, die Beine schleifen flach nach hinten hinaus.
 *
 * ## Was die Figur flach macht — und was nicht
 *
 * Drei Versuche, gebacken und gemessen, bevor die Form stand:
 *
 * 1. **Nur `_versatz` nach unten reicht nicht.** Er verschiebt Ober- *und*
 *    Unterkante gleich weit; die Figur wandert nach unten, aber ihre Höhe
 *    bleibt bis aufs Pixel dieselbe. Mit −2,8 allein blieb es bei 16 Zeilen.
 * 2. **Den Kopf nach vorn zu drehen reicht auch nicht.** Naheliegend, weil die
 *    Mähne am Kopfgelenk hängt — aber sie ist eine Kugel, und eine Kugel wird
 *    durchs Drehen nicht flacher. 86° Kopfneigung brachten null Zeilen.
 *    Dazu kommt: Die Zotteln, die der Backweg oben aufsetzt, stehen in
 *    *Welt*achsen und folgen dem Kopf gar nicht erst. Sie ragen bei jeder Pose
 *    rund 10 Pixel über das Kopfgelenk hinaus — die Oberkante des Bildes ist
 *    damit schlicht `Kopfgelenk + 10`, ganz gleich, wie der Kopf steht.
 * 3. **Es geht nur über die Höhe des Kopfgelenks selbst.** Und dafür gibt es
 *    genau ein Gelenk: `Hip` sitzt über Becken *und* Beinen und kippt als
 *    einziges die ganze Figur. 76° Sturz holen das Kopfgelenk von 6,1 Pixeln
 *    über der Sohle auf 3,4 herunter, der Versatz die restlichen 2,4.
 *
 * Der **Rücken** trägt bewusst fast nichts bei: `Spine01` geht nie über 10°.
 * Weiter gebeugt legt sich die Mähne über den ganzen Körper, und übrig bliebe
 * ein roter Fleck. Der Sturz aus `hip` erreicht dasselbe, ohne dass sich Kopf
 * und Rumpf gegeneinander verschieben — die Figur fällt als Stück.
 *
 * ## Die Beine liegen ungleich
 *
 * Nicht gekniet, sondern gestaffelt: Das vordere Bein knickt zuerst weg, das
 * hintere folgt versetzt, und am Ende schleifen beide flach nach hinten hinaus.
 * Symmetrisch angezogene Beine geben einen Klumpen, und ein Klumpen ist im
 * Umriss von einem sitzenden Wusel nicht zu unterscheiden. Die Staffelung macht
 * die Form lang und niedrig — und lang und niedrig ist das Gegenteil von allem
 * anderen auf dem Blatt.
 *
 * Unter der Fusspunktlinie liegt im letzten Bild eine Zeile Haar. Das ist kein
 * Versehen: Die Mähne reicht rund zweieinhalb Pixel unter das Kopfgelenk, und
 * wenn das Kopfgelenk auf dem Boden liegt, liegt sie eben daneben. Im Spiel
 * sieht das aus wie ausgebreitetes Haar auf der Erde. Abgeschnitten wird erst
 * ab Zeile 28, davon ist die Figur weit entfernt.
 */

/**
 * Bildweise Schlüsselwerte. Acht Bilder mit zwei gegenläufigen Hälften sind
 * keine Formel; jedes Bild hat seine Aufgabe:
 *
 *   0 zucken · 1 aufbäumen · 2 halten · 3 Knie geben nach · 4 sinken
 *   · 5 einknicken · 6 aufschlagen · 7 liegen (dieses Bild bleibt stehen)
 */
const K = {
  //           0     1     2     3     4     5     6     7
  // Sohle auf der Fusspunktlinie, nur Bild 1 hebt sich um einen halben Pixel —
  // der Schreck als kurzer Ruck. Danach hinunter, aber nicht tiefer als bis zur
  // Linie: Ein Häufchen unter dem eigenen Fusspunkt sähe eingegraben aus.
  //
  // Die Werte sind nicht geschätzt, sondern ausgerechnet. Der Oberschenkel ist
  // 1,01 lang, der Unterschenkel 1,56, das Fussgelenk sitzt 0,4 über der Sohle
  // (am Modell gemessen). Beim Beugen bleibt in dieser Kette das *Becken*
  // stehen und der Fuss steigt — der Versatz muss ihn also um genau den Betrag
  // wieder herunterholen, den das Beugen ihn gehoben hat:
  //
  //   hoch = 0,4 − 2,9 + 1,01·cos(Schenkel) + 1,56·cos(Schiene)
  //
  // Daher auch die Grenze des ganzen Zustands: Das Bein ist vom Becken bis zur
  // Sohle nur 2,6 Pixel lang. Tiefer als 2,6 kann eine Figur nicht sacken, ohne
  // in den Boden zu sinken — und deshalb endet `hoch` bei −2,4 und nicht bei
  // den −4, ab denen die Zelle unten abschneidet.
  hoch: [0.0, 0.5, 0.2, -0.3, -0.85, -1.6, -2.1, -2.4],
  // Nach *hinten*, und das ist Absicht. Der Sturz aus `hip` trägt Kopf und
  // Mähne — die schwerste Fläche der Figur — gut drei Pixel nach vorn; ohne
  // Gegenzug stünde das Häufchen am rechten Zellrand statt über seinem
  // Fusspunkt. Der Versatz holt es zurück auf die Mitte.
  vorn: [0.0, 0.0, 0.0, -0.1, -0.5, -0.9, -1.2, -1.4],

  // **Das Hauptgelenk dieses Ablaufs.** `Hip` sitzt über Becken *und* Beinen und
  // ist damit das einzige, das die ganze Figur kippt. Beim Erschrecken lehnt sie
  // als Stück zurück (Rückstoss), am Ende kippt sie über ihr eigenes Becken nach
  // vorn — und *nur* so kommt das Kopfgelenk von 6,1 Pixeln über der Sohle
  // hinunter auf gut 1,5. Ohne diesen Sturz bliebe die Mähne oben stehen: Sie
  // ist eine Kugel, und eine Kugel wird durch Drehen nicht flacher.
  hip: [-5, -11, -9, 4, 32, 55, 68, 76],

  // Rücken zusätzlich, aber sparsam. Nie über 10° — was die Figur flach macht,
  // ist der Sturz aus `hip`, nicht ein krummer Rücken.
  spine01: [-5, -9, -7, 0, 5, 8, 10, 10],
  spine02: [-3, -5, -4, 0, 3, 5, 6, 6],
  // Hals und Kopf legen nur noch nach. Im Bild ankommt die Summe der ganzen
  // Kette: −22, −40, −33, −4, +46, +74, +90, +96. Bild 1 schaut senkrecht nach
  // oben, Bild 7 liegt mit dem Gesicht im Boden.
  nacken: [-4, -6, -5, -3, 2, 2, 2, 1],
  kopf: [-5, -9, -8, -5, 4, 4, 4, 3],

  // Arme: Z klappt sie aus dem T herunter, X schwingt sie dann nach vorn-oben.
  // −160 ist über dem Kopf, −20 hängt aus der gekippten Brust nach vorn-unten.
  // Im Bild sind sie fast nie zu sehen — bei drei Pixeln Armlänge gegen acht
  // Pixel Mähne überlebt kein Arm den Mehrheitsentscheid beim Verkleinern. Sie
  // stehen trotzdem richtig: Wird die Kamera je geändert, stimmt die Haltung.
  oberarm: [-115, -162, -152, -120, -85, -50, -28, -20],
  unterarm: [26, 6, 12, 40, 50, 34, 16, 6],

  // Die Beine stehen hier in **Weltwinkeln**, nicht gegen `hip` — sonst müsste
  // man beim Ändern des Sturzes jeden Beinwert nachziehen. Abgezogen wird erst
  // in `pose()`. 0 ist senkrecht, positiv nach hinten.
  //
  // Ablauf: stehen · Knie knicken nach vorn weg · die Figur kippt über die Knie
  // hinweg nach vorn · die Beine schleifen flach nach hinten hinaus.
  weltSchenkelV: [2, 3, 5, -45, -70, 0, 60, 80],
  // Das hintere Bein bleibt in Bild 3 und 4 stärker gebeugt als das vordere,
  // statt weiter ausgestreckt: Gestreckt reicht seine Sohle unter die des
  // vorderen, die Zelle bekommt unten eine Zeile dazu, und die Figur wird in
  // genau den Bildern wieder höher, in denen sie sacken soll.
  weltSchenkelH: [-2, -1, 0, -20, -25, 30, 75, 92],
  wadeV: [2, 0, 3, 65, 105, 95, 35, 15],
  wadeH: [2, 0, 2, 60, 90, 70, 25, 5],
  fussV: [10, 26, 20, 6, -10, -25, -30, -32],
  fussH: [10, 26, 20, 10, -6, -20, -26, -30],

  // Seitliche Spreizung — nur damit die beiden Beine im Bild nicht zu einem
  // Strich zusammenfallen. Breite holt sie keine: Aus 30° zum Profil sieht die
  // Kamera von einer seitlichen Spreizung fast nichts. Was die Figur breit
  // macht, ist die Staffelung nach vorn und hinten in den Weltwinkeln oben.
  spreiz: [2, 1, 2, 4, 6, 8, 9, 10],

  // Ausschlag der Haarsträhnen. Beim Aufbäumen fliegen sie, im letzten Bild
  // liegen sie still: Ein weiterschwingendes Haar nähme dem Ende die Ruhe.
  haar: [0.5, 1.5, 1.2, 0.8, 1.1, 1.3, 0.5, 0.0],
};

export default {
  clip: 'dying',
  frames: 8,

  pose(i) {
    return {
      Hip: [K.hip[i], 0, 0],
      Spine01: [K.spine01[i], 0, 0],
      Spine02: [K.spine02[i], 0, 0],
      NeckTwist01: [K.nacken[i], 0, 0],
      Head: [K.kopf[i], 0, 0],

      // Der hintere Arm läuft dem vorderen nach. Aus 30° zum Profil lägen zwei
      // gleich gestellte Arme im Bild genau übereinander.
      R_Upperarm: [K.oberarm[i], 0, 90],
      L_Upperarm: [K.oberarm[i] + 8, 0, -90],
      R_Forearm: [K.unterarm[i], 0, 0],
      L_Forearm: [K.unterarm[i] - 8, 0, 0],

      // Der Sturz aus `hip` steckt in den Beinen schon drin und wird deshalb
      // wieder abgezogen — übrig bleibt der Weltwinkel aus der Tabelle.
      R_Thigh: [K.weltSchenkelV[i] - K.hip[i], 0, K.spreiz[i]],
      L_Thigh: [K.weltSchenkelH[i] - K.hip[i], 0, -K.spreiz[i]],
      R_Calf: [K.wadeV[i], 0, 0],
      L_Calf: [K.wadeH[i], 0, 0],
      R_Foot: [K.fussV[i], 0, 0],
      L_Foot: [K.fussH[i], 0, 0],

      _versatz: [K.vorn[i], K.hoch[i]],
      _haar: K.haar[i],
    };
  },
};
