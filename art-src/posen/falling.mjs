/**
 * Freier Fall.
 *
 * Das Warnsignal des Spiels: Wer das sieht, hat wenige Takte Zeit. Die Pose
 * muss sich deshalb auf einen Blick vom Laufen unterscheiden — und zwar an der
 * Silhouette, nicht an einer Einzelheit.
 *
 * Der Gegensatz zum Laufen ist bewusst gebaut:
 * Laufen ist breit unten (Schrittstellung) und ruhig oben. Fallen ist das
 * Gegenteil — schmal unten, weil die Beine angezogen sind, und breit oben,
 * weil Arme und Mähne nach hinten oben stehen.
 *
 * Der Kopf liegt im Nacken (Head stark negativ um X). Die Mähne hängt am
 * Kopfgelenk, also richtet sie sich damit auf: aus dem hängenden roten Klumpen
 * des Laufens wird eine aufgestellte Masse. Das ist der eine Unterschied, der
 * bei 12 Pixeln Figurenhöhe wirklich trägt.
 *
 * Der Rumpf bleibt fast aufrecht. Ein weit gebeugter Rumpf würde die Mähne über
 * den ganzen Körper legen, und übrig bliebe ein roter Fleck.
 */
const sin = Math.sin;

export default {
  clip: 'falling',
  frames: 4,

  pose(i) {
    const p = (i / 4) * Math.PI * 2;
    const f = sin(p); // Flattern
    const g = sin(p + Math.PI / 2); // versetzt, damit nichts im Takt zuckt

    return {
      // Rumpf leicht nach hinten gelegt — die Figur kippt in den Fall hinein.
      Spine01: [-7 + 2 * f, 0, 0],
      Spine02: [-4, 0, 3 * f],

      // Kopf in den Nacken. Das stellt die Mähne senkrecht.
      NeckTwist01: [-10, 0, 0],
      Head: [-24 + 5 * f, 0, 5 * g],

      // Arme nach oben-hinten gerissen. Über 90° hinaus, damit sie über die
      // Schulter hinausgehen und den Umriss oben verbreitern.
      L_Upperarm: [128 + 12 * f, 0, -22],
      R_Upperarm: [152 - 12 * f, 0, 22],
      L_Forearm: [-34 - 10 * g, 0, 0],
      R_Forearm: [-28 + 10 * g, 0, 0],

      // Beine gespreizt und angezogen — vorn/hinten, denn seitlich sieht die
      // Kamera aus 30° fast nichts davon. Das eine Bein hoch nach vorn, das
      // andere nach hinten: ein Zickzack, das kein Schritt sein kann.
      L_Thigh: [-58 + 8 * f, 0, -12],
      R_Thigh: [20 - 8 * f, 0, 12],
      L_Calf: [62 + 10 * g, 0, 0],
      R_Calf: [40 - 10 * g, 0, 0],
      L_Foot: [-16, 0, 0],
      R_Foot: [-10, 0, 0],

      // Angezogene Beine heben den Fusspunkt: Die Figur hängt in der Luft.
      _versatz: [0, 0.6 + 0.2 * f],
    };
  },
};
