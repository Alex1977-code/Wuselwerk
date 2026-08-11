/**
 * Freier Fall.
 *
 * Das Warnsignal des Spiels: Wer das sieht, hat wenige Takte, bis der Wusel
 * aufschlägt. Die Pose muss sich deshalb auf einen Blick vom Laufen
 * unterscheiden — an der Silhouette (GDD §6), nicht an einer Einzelheit, die
 * bei 12 Pixeln Figurenhöhe ohnehin niemand sieht.
 *
 * ## Was bei dieser Figur überhaupt trägt
 *
 * Am gebackenen Bild ausgemessen: Von den rund 58 farbigen Pixeln sind etwa 31
 * Haar, 11 Gesicht und 15 Anzug — und von diesen 15 liegen nur 4 unterhalb des
 * Beckens. Die Arme überleben den Mehrheitsentscheid beim Verkleinern **gar
 * nicht**: bei 55°, 95°, 140° und −120° gebacken, haben sie den Umriss kein
 * einziges Mal verändert. Wer hier mit Armhaltung erzählen will, erzählt an
 * niemanden.
 *
 * Es bleiben drei Hebel, und die Pose baut auf allen dreien:
 *
 * 1. **Die Figur hängt in der Luft.** `_versatz` hebt sie gut einen Pixel über
 *    den Fusspunkt; unter den Füssen bleiben zwei leere Reihen. Laufen hat dort
 *    immer Boden. Das ist der stärkste Unterschied, den dieses Blatt hergibt,
 *    und der einzige, der auch als schwarzer Umriss sofort liest.
 * 2. **Die Mähne steht so hoch wie möglich.** Sie hängt am Kopfgelenk, und ihre
 *    Masse sitzt hinten: Legt man den Kopf weit in den Nacken, kippt die Masse
 *    nach hinten-unten, deckt den Rumpf zu, und die Figur wird drei Reihen
 *    kürzer und zwei breiter — gemessen, nicht vermutet. Gebacken bei −70, −45,
 *    −20, 0, +35 und +75: Bei 0 steht der Scheitel am höchsten, bei −70 wie bei
 *    +75 wird daraus ein breiter roter Fleck. Der Kopf geht deshalb nur so weit
 *    zurück, dass das Gesicht nach oben zeigt. Die Mähne bleibt oben und steht
 *    im Bild als hohe Masse über einem schmalen Rumpf.
 * 3. **Die Beine stehen weit vorn und hinten.** So sieht kein Schritt aus: Im
 *    Lauf hängt immer ein Bein senkrecht unter dem Becken, hier keines. Ganz
 *    angezogen dürfen sie nicht sein — dann verschwinden die 4 Pixel Bein
 *    vollends und die Figur endet als Klumpen.
 *
 * Der Rumpf bleibt fast aufrecht. Weit gebeugt legt sich die Mähne über den
 * ganzen Körper, und übrig bleibt ein roter Fleck.
 *
 * Über die vier Bilder flattert alles leicht gegeneinander. Der Fall ist
 * unruhig — aber er hat keinen Takt wie das Laufen, deshalb schwingt nichts
 * im Gleichschritt.
 */
const sin = Math.sin;

export default {
  clip: 'falling',
  frames: 4,

  pose(i) {
    const p = (i / 4) * Math.PI * 2;
    const f = sin(p);
    const g = sin(p + Math.PI / 2); // versetzt, damit nichts im Gleichtakt zuckt

    return {
      // Nur ein Anflug von Hohlkreuz. Mehr wäre Selbstmord an der Silhouette.
      Spine01: [-9 + 2 * f, 0, 0],
      Spine02: [-4, 0, 4 * f],

      // Kopf zurück, aber gemessen: Gesicht nach oben, Mähne bleibt hoch.
      NeckTwist01: [-8, 0, 0],
      Head: [-16 + 7 * f, 0, 6 * g],

      // Arme nach oben-hinten gerissen. Im Bild sind sie nicht zu sehen (siehe
      // oben), aber die Haltung soll im Modell stimmen: Wird die Figur je
      // grösser gezeigt oder die Kamera geändert, steht sie schon richtig.
      L_Upperarm: [144 + 14 * f, 0, -24],
      R_Upperarm: [156 - 14 * f, 0, 24],
      L_Forearm: [-30 - 12 * g, 0, 0],
      R_Forearm: [-24 + 12 * g, 0, 0],

      // Gespreizt in die Tiefe, nicht zur Seite: Aus 30° sieht die Kamera von
      // einer seitlichen Spreizung fast nichts, von vorn/hinten alles.
      // Das Knie darf nicht zu weit zuknicken — ab etwa 75° schlägt der
      // Unterschenkel unter das Becken zurück, die beiden Beine fallen im Bild
      // zusammen, und aus der Spreizung wird wieder ein Strich.
      L_Thigh: [-68 + 6 * f, 0, -12],
      R_Thigh: [36 - 6 * f, 0, 12],
      L_Calf: [58 + 8 * g, 0, 0],
      R_Calf: [34 - 8 * g, 0, 0],
      L_Foot: [-20, 0, 0],
      R_Foot: [14, 0, 0],

      // Die Figur hängt über ihrem Fusspunkt. Der Wert flattert bewusst kaum:
      // Die leeren Reihen unter den Füssen sind das Erkennungszeichen, und ein
      // Bild, in dem sie zugehen, nimmt dem Zustand die halbe Aussage.
      // Volles Nachschwingen der Strähnen. Im Fall gibt es keinen Halt, an dem
      // sich Haar beruhigen könnte — und der Zustand ist das Warnsignal des
      // Spiels, er darf der unruhigste sein.
      _haar: 1,

      _versatz: [0, 1.4 + 0.15 * f],
    };
  },
};
