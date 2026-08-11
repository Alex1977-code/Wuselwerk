/**
 * Sinkflug am Schirm.
 *
 * Vier Bilder, Zyklus. Das Erkennungszeichen ist nicht die Haltung, sondern
 * die Silhouette: **oben am breitesten.** Das Dach misst im Bild 17 Pixel, die
 * Mähne 9 — nur dieser Abstand unterscheidet den Zustand von `falling`, denn
 * an der Figur selbst ist bei zwölf Pixeln Höhe nichts zu sehen, was ein
 * Fallschirm wäre.
 *
 * Die Breite kommt aus *zwei* Achsen. Die Kamera steht 30° aus dem Profil: Ein
 * Mass nach vorn erscheint im Bild mit cos 30° ≈ 0,87, ein Mass zur Seite nur
 * mit sin 30° = 0,5. Ein Dach von 12 zur Seite wäre im Bild 6 breit und damit
 * schmaler als die Mähne. Die Tiefe trägt hier also die Hauptlast: 13 nach
 * vorn und 11 zur Seite ergeben zusammen die 17.
 *
 * **Die Arme sind nicht zu sehen, und das ist keine Nachlässigkeit.** Der Arm
 * dieser Figur ist rund vier Pixel lang, die Mähne neun hoch — eine erhobene
 * Hand endet mitten im Haar, egal wie sie gedreht wird. Die Arme stehen
 * trotzdem hoch, weil die Schulterlinie davon lebt; die *sichtbare* Aufhängung
 * machen die beiden Streben.
 */
const grad = (x) => (x * 180) / Math.PI;

/**
 * Höhe des Dachs über dem Kopfgelenk.
 *
 * Der Wert ist erlaufen, nicht gerechnet: Bei 8,4 sass das Dach der Mähne auf,
 * und die beiden Streben dazwischen liefen zu einem schwarzen Klotz zusammen.
 * Jede Strebe ist im Bild ein Pixel breit und bekommt links und rechts einen
 * Umriss — sie ist also nie schmaler als drei. Damit zwischen ihnen ein Loch
 * bleibt statt einer Fläche, braucht es vier freie Zeilen unter dem Dach.
 */
const DACH_H = 13.6;
/** Dachmass in logischen Pixeln: [nach vorn, hoch, zur Seite]. */
const DACH_MASS = [13, 1.8, 11];
/**
 * Wo die Streben oben ansetzen — ganz aussen an der Dachkante.
 *
 * Weiter innen wäre statisch vernünftiger und im Bild schlechter: Die Streben
 * stünden dann als zwei Pfosten mitten unter einem überstehenden Brett. Aussen
 * angesetzt schliessen sie die Form zu einem Gestell.
 */
const DACH_R = 6;
/**
 * Die beiden Hände, vorn und hinten getrennt.
 *
 * Beide Arme gleich hoch zu nehmen wäre richtig gedacht und im Bild falsch:
 * Aus 30° zum Profil lägen die Hände übereinander, die zwei Streben fielen zu
 * einer zusammen, und mit dem Umriss daneben stünde dort ein schwarzer Klotz.
 */
const HAND_VORN = [1.8, 4.0];
const HAND_HINTEN = [-1.6, 4.4];

/**
 * Eine Strebe aus zwei Punkten in der Bildebene (vorn, hoch).
 * Kästen kennen nur Mitte, Mass und Drehung — das hier rechnet es um.
 */
function strebe(zOben, yOben, zUnten, yUnten) {
  const dz = zOben - zUnten;
  const dy = yOben - yUnten;
  return {
    an: 'Head',
    pos: [(zOben + zUnten) / 2, (yOben + yUnten) / 2, 0],
    mass: [0.8, Math.hypot(dz, dy), 0.8],
    // Positives X kippt die Kastenoberseite nach vorn (+Z).
    dreh: [grad(Math.atan2(dz, dy)), 0, 0],
    farbe: 'dunkel',
  };
}

/**
 * Das Pendel, mit Phase.
 *
 * Ohne Phasenversatz sind bei vier Bildern das erste und das dritte
 * zahlengleich — der Sinus ist an 0 und an π beides Mal null. Von vier Bildern
 * wären dann nur drei verschieden. Kopf und Beine laufen deshalb nach: Sie
 * hängen dem Rumpf hinterher, wie es ein Pendel tut, und genau dieser
 * Nachlauf trennt die beiden Nulldurchgänge wieder.
 */
const pendel = (i, nachlauf) => Math.sin((i / 4) * Math.PI * 2 - nachlauf);

/** Ausschlag des Rumpfes in logischen Pixeln, nach vorn positiv. */
const ausschlag = (i) => 0.6 * pendel(i, 0);

export default {
  clip: 'floating',
  frames: 4,

  pose(i) {
    const s = ausschlag(i);
    const rumpf = pendel(i, 0);
    const kopf = pendel(i, 0.6);
    const beine = pendel(i, 1.2);

    return {
      // Kaum gebeugt, leicht zurückgelehnt: Die Figur hängt an den Armen.
      // Über 12° würde die Mähne nach vorn kippen und den Körper zudecken.
      Spine01: [5 + 4 * rumpf, 0, 0],
      Spine02: [2, 0, 0],
      // Der Kopf wiegt mit — er trägt die Mähne, die grösste Fläche der Figur,
      // und ohne ihn wäre die Bewegung bei Spielgrösse nicht zu sehen.
      Head: [6 - 3 * kopf, 0, 6 * kopf],

      // Beide Arme hoch: −152° heisst, aus der Hängelage 152° nach vorn, also
      // fast senkrecht. Der nahe Arm (L, kameraseitig) greift etwas weiter
      // nach vorn als der ferne — dieselbe Trennung wie bei den Streben.
      L_Upperarm: [-152, 0, -20],
      R_Upperarm: [-174, 0, 20],
      L_Forearm: [16, 0, 0],
      R_Forearm: [6, 0, 0],

      // Beine hängen und schleppen nach. Sie stehen bewusst in der Tiefe
      // auseinander: übereinander gelegt ergäben sie eine einzige Säule, und
      // die Figur hätte im Bild nur ein Bein.
      L_Thigh: [-26 - 8 * beine, 0, -4],
      R_Thigh: [2 - 8 * beine, 0, 4],
      L_Calf: [14 + 6 * beine, 0, 0],
      R_Calf: [34, 0, 0],
      L_Foot: [-16, 0, 0],
      R_Foot: [-6, 0, 0],

      // Ein Stück tiefer in der Zelle, damit das Dach oben nicht anstösst.
      // Für eine Figur in der Luft ist der Fusspunkt ohnehin nur Rechengrösse.
      _versatz: [s, -0.8],
    };
  },

  teile(i) {
    const s = ausschlag(i);
    // Das Dach steht still und der Körper schwingt darunter — so hängt ein
    // Pendel. Das Dach hängt aber am Kopf und machte jede Körperbewegung mit;
    // der Versatz wird deshalb hier wieder abgezogen. Die Streben verbinden
    // das stehende Dach mit den wandernden Händen und stellen sich dabei von
    // selbst schräg, ohne dass ein Winkel von Hand gesetzt werden müsste.
    const dz = -s;
    const oben = DACH_H - DACH_MASS[1] / 2;

    return [
      // Das Dach bleibt waagerecht, und das ist erlaufen: Ein Balken von 17
      // Pixeln Breite springt schon ab etwa 3° Neigung um eine Rasterzeile.
      // Bei 4° sass der Sprung ganz aussen und sah nach einer abgebrochenen
      // Ecke aus, bei 8° lief der Balken über sechs Zeilen treppab und in die
      // Streben hinein. Dazwischen gibt es nichts — eine Zeile ist eine Zeile.
      // Ein ruhiges Dach ist ohnehin das richtige Bild: Es ist der
      // Aufhängepunkt, und die Bewegung gehört unter ihn.
      { an: 'Head', pos: [dz, DACH_H, 0], mass: DACH_MASS, farbe: 'werkzeug' },
      strebe(dz + DACH_R, oben, HAND_VORN[0], HAND_VORN[1]),
      strebe(dz - DACH_R, oben, HAND_HINTEN[0], HAND_HINTEN[1]),
    ];
  },
};
