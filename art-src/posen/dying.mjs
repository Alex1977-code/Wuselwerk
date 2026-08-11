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
 * Der Zustand hat genau eine Aussage, und sie ist eine Formaussage: **Die Figur
 * wird kürzer.** Aus zwölf Pixeln Höhe werden sechs, und die Masse, die oben
 * verschwindet, taucht seitlich wieder auf. Aufrecht und schmal wird liegend
 * und breit. Das ist der einzige Unterschied, der bei dieser Grösse auch als
 * schwarzer Umriss trägt (GDD §6) — und er ist gegen jeden anderen Zustand
 * eindeutig, weil kein anderer die Figur unter ihre halbe Höhe drückt.
 *
 * Der Ablauf zerfällt in zwei Hälften, die einander widersprechen sollen:
 *
 *   0–2  **Erschrecken.** Die Figur streckt sich, geht auf die Zehen, der Kopf
 *        fliegt in den Nacken, die Arme hoch. Sie ist hier *höher* als im
 *        Stand. Ohne diese Gegenbewegung liest der Rest als Hinsetzen.
 *   3–7  **Sacken.** Die Knie geben nach, `_versatz` trägt die Figur um knapp
 *        drei Pixel hinunter, die Beine legen sich nach vorn und hinten flach,
 *        und der Kopf fällt nach vorn. Bild 7 ist ein Häufchen.
 *
 * ## Warum der Rumpf trotzdem kaum gebeugt wird
 *
 * Der Kopf ist fast die halbe Figur und die Mähne hängt an ihm. Ein weit
 * vorgebeugter Rumpf legt sie über den ganzen Körper, und übrig bleibt ein
 * roter Fleck in Standhöhe — also genau das Bild, das der Zustand *nicht*
 * erzählen soll. `Spine01` geht deshalb nie über 11°.
 *
 * Das Sacken tragen zwei andere Dinge:
 *
 * 1. **`_versatz` nach unten.** Die Beine sind vom Becken bis zur Sohle nur gut
 *    drei Pixel lang; legt man sie flach, fällt das Becken um genau diese drei
 *    Pixel. Der Versatz ist nicht Zierrat, sondern die Rechnung dazu — ohne ihn
 *    stünde die Figur mit angezogenen Beinen in der Luft. Unter −4 schneidet die
 *    Zelle unten ab, deshalb endet er bei −2,8.
 * 2. **Der Kopf, nicht der Rumpf.** Die Mähne folgt dem Kopfgelenk. Ein Kopf,
 *    der nach vorn-unten fällt, kippt die grösste Fläche der Figur nach vorn
 *    aus der Senkrechten heraus — dieselbe Wirkung wie ein gebeugter Rücken,
 *    aber ohne dass der Körper darunter verschwindet.
 *
 * ## Die Beine liegen ungleich
 *
 * Nicht gekniet, sondern gespreizt: das vordere Bein streckt sich nach vorn
 * flach aus, das hintere schleift nach hinten. Symmetrisch angezogene Beine
 * geben einen Klumpen, und ein Klumpen ist im Umriss von einem sitzenden Wusel
 * nicht zu unterscheiden. Die Spreizung macht die Form lang und niedrig — und
 * lang und niedrig ist das Gegenteil von allem anderen auf dem Blatt.
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
  // Erst hoch auf die Zehen, dann hinunter bis knapp über die Abschneidegrenze.
  hoch: [0.3, 0.7, 0.5, -0.6, -1.5, -2.2, -2.6, -2.8],
  // Nur ein Hauch nach vorn: Der Fusspunkt der Zelle muss die Figur halten.
  vorn: [0.0, 0.0, 0.0, 0.05, 0.15, 0.25, 0.35, 0.4],

  // `Hip` sitzt über Becken *und* Beinen — als einziges Gelenk kippt es die
  // ganze Figur. Beim Erschrecken lehnt sie damit als Stück zurück, die Beine
  // rutschen dabei nach vorn; das ist der Rückstoss.
  hip: [-5, -11, -9, -3, 0, 2, 3, 3],

  // Rumpf: erst ins Hohlkreuz, dann sanft nach vorn. Nie über 11°.
  spine01: [-5, -9, -7, -1, 4, 8, 10, 10],
  spine02: [-3, -5, -4, 0, 3, 5, 6, 6],
  // Hals und Kopf tragen den Löwenanteil der Neigung, nicht der Rücken. Im Bild
  // ankommt die Summe der ganzen Kette: −22, −40, −33, −6, +25, +50, +72, +86.
  // Bild 1 schaut senkrecht nach oben, Bild 7 senkrecht nach unten — und weil
  // die Mähne am Kopf hängt, legt sie sich dabei aus der Senkrechten in die
  // Waagerechte. Das ist die eigentliche Flachlegung der Figur.
  nacken: [-4, -6, -5, -1, 7, 14, 21, 27],
  kopf: [-5, -9, -8, -1, 11, 21, 32, 40],

  // Arme: Z klappt sie aus dem T herunter, X schwingt sie dann nach vorn-oben.
  // −160 ist über dem Kopf, −50 ist waagerecht nach vorn.
  oberarm: [-115, -162, -152, -110, -72, -58, -50, -46],
  unterarm: [26, 6, 12, 34, 44, 30, 14, 4],

  // Vorderes Bein (R): stemmt sich erst, streckt sich dann flach nach vorn aus.
  // −88 ist mit dem Rückstoss aus `hip` zusammen genau die Waagerechte.
  schenkelV: [2, 6, 5, -20, -46, -66, -80, -88],
  wadeV: [2, 0, 3, 25, 55, 50, 26, 8],
  fussV: [10, 26, 20, 4, -6, -10, -10, -8],

  // Hinteres Bein (L): schleift nach hinten weg.
  schenkelH: [-2, 2, 0, 16, 40, 58, 70, 77],
  wadeH: [2, 0, 2, 12, 24, 24, 16, 10],
  fussH: [10, 26, 20, 8, -4, -10, -14, -16],

  // Seitliche Spreizung. Beim Erschrecken fast null — schmal und starr —, zum
  // Ende hin weit: Die liegende Figur soll breit sein.
  spreiz: [2, 1, 2, 4, 7, 10, 13, 14],

  // Ausschlag der Haarsträhnen. Beim Aufbäumen fliegen sie, im letzten Bild
  // liegen sie still: Ein weiterschwingendes Haar nähme dem Ende die Ruhe.
  haar: [0.5, 1.5, 1.2, 0.7, 1.0, 1.3, 0.5, 0.0],
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

      R_Thigh: [K.schenkelV[i], 0, K.spreiz[i]],
      L_Thigh: [K.schenkelH[i], 0, -K.spreiz[i]],
      R_Calf: [K.wadeV[i], 0, 0],
      L_Calf: [K.wadeH[i], 0, 0],
      R_Foot: [K.fussV[i], 0, 0],
      L_Foot: [K.fussH[i], 0, 0],

      _versatz: [K.vorn[i], K.hoch[i]],
      _haar: K.haar[i],
    };
  },
};
