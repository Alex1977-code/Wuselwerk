/**
 * Senkrecht graben.
 *
 * Drei Bilder, und die Haltedauern sind ungleich (3, 2, 2): `DIG_INTERVAL` ist
 * 7 und damit prim, eine gleichmässige Aufteilung gibt es nicht.
 *
 * **Bild 0 ist das Wirkungsbild.** Die Simulation trägt genau dann Erde ab,
 * wenn `timer % interval === 0` — und dort steht der Bildindex auf 0. Der
 * Spatenstich muss deshalb auf dem ersten Bild unten sein, sonst laufen
 * Animation und Terrainänderung sichtbar auseinander.
 */
export default {
  clip: 'digging',
  frames: 3,

  pose(i) {
    // 0 = Stich unten, 1 = Anheben, 2 = oben vor dem nächsten Stich
    const hoch = [0, 0.55, 1][i];

    return {
      // Nur leicht vorgebeugt. Der Kopf ist fast die halbe Figur — beugt sie
      // sich weit vor, deckt die Mähne den ganzen Körper zu und übrig bleibt
      // ein roter Fleck. Die Bewegung tragen die Arme, nicht der Rumpf.
      Spine01: [9 - 4 * hoch, 0, 0],
      Spine02: [5 - 2 * hoch, 0, 0],
      Head: [7 - 3 * hoch, 0, 0],

      L_Upperarm: [-52 + 26 * hoch, 0, 0],
      R_Upperarm: [-52 + 26 * hoch, 0, 0],
      L_Forearm: [-24 + 14 * hoch, 0, 0],
      R_Forearm: [-24 + 14 * hoch, 0, 0],

      // Breiter Stand, leicht in die Knie — die Figur steht über ihrem Loch.
      L_Thigh: [-8, 0, -7],
      R_Thigh: [-8, 0, 7],
      L_Calf: [16, 0, 0],
      R_Calf: [16, 0, 0],

      _versatz: [0, -0.5 + 0.4 * hoch],
    };
  },

  teile(i) {
    const hoch = [0, 0.55, 1][i];
    return [
      // Blatt: quer vor den Füssen, im Stich unten, danach angehoben.
      {
        an: 'Pelvis',
        pos: [4.2, -5.4 + 2.8 * hoch, 0],
        mass: [4.2, 1, 3.4],
        dreh: [-12 * hoch, 0, 0],
        farbe: 'werkzeug',
      },
      // Stiel: von den Händen zum Blatt.
      {
        an: 'Pelvis',
        pos: [3.0, -3.0 + 1.4 * hoch, 0],
        mass: [1.4, 3.4, 0.9],
        dreh: [-24 - 10 * hoch, 0, 0],
        farbe: 'werkzeug',
      },
    ];
  },
};
