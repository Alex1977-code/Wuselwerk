/**
 * Laufen — über 90 % aller Figurenbilder im Spiel.
 *
 * Ein Zyklus über 8 Bilder, also ein voller Doppelschritt. Die Beine laufen
 * gegenläufig, die Arme gegenläufig zu den Beinen, und der Körper hebt sich
 * zweimal je Zyklus — einmal je Schritt.
 *
 * Der Kopf nickt bewusst mit: Die Mähne hängt am Kopfgelenk, sie ist die
 * größte Fläche der Figur, und ihr Mitschwingen ist das Erkennungszeichen.
 * Ein ruhiger Kopf würde die Figur bei Spielgröße tot wirken lassen.
 */
const sin = (p) => Math.sin(p);

export default {
  clip: 'walking',
  frames: 8,
  pose(i) {
    const p = (i / 8) * Math.PI * 2;
    const g = p + Math.PI; // Gegenseite

    // Knie knicken nur nach hinten, nie nach vorn — deshalb abgeschnitten.
    const knie = (phase) => Math.max(0, 34 * sin(phase - 1.1));

    return {
      L_Thigh: [-34 * sin(p), 0, 0],
      R_Thigh: [-34 * sin(g), 0, 0],
      L_Calf: [knie(p), 0, 0],
      R_Calf: [knie(g), 0, 0],
      L_Foot: [10 * sin(p + 0.6), 0, 0],
      R_Foot: [10 * sin(g + 0.6), 0, 0],

      // Arme gegen die Beine, sonst watschelt die Figur.
      L_Upperarm: [22 * sin(p), 0, 0],
      R_Upperarm: [22 * sin(g), 0, 0],
      L_Forearm: [-12 - 10 * sin(p), 0, 0],
      R_Forearm: [-12 - 10 * sin(g), 0, 0],

      Spine01: [-3, 5 * sin(p), 0],
      Head: [-5 + 4 * sin(2 * p), 0, 5 * sin(p)],

      _haar: 0.8,

      // Zwei Hebungen je Zyklus, eine je Schritt. Der Wert ist klein: Bei
      // 12 Pixeln Figurenhöhe ist ein halber Pixel schon deutlich sichtbar.
      _versatz: [0, 0.45 * Math.abs(sin(2 * p))],
    };
  },
};
