/**
 * Über die Kante ziehen — sechs Bilder, einmalig.
 *
 * Der Ablauf läuft von Bild 0 bis 5 und friert dann ein (`once` in
 * `src/render/atlas.ts`). Die Kante wird nie gezeichnet; sie liegt auf der
 * Fusspunktlinie der Zelle. Was hier geschieht, muss deshalb allein aus der
 * Figur selbst ablesbar sein — es gibt nichts, woran sie sich sichtbar hält.
 *
 * **Der Versatz ist das Hauptmittel.** Die Simulation hebt die Figur zwar
 * selbst (`w.y--`), aber über 52 Ticks verteilt; für das Auge ist das ein
 * gleichmässiges Kriechen ohne Ereignis. Der Versatz gibt dem Vorgang eine
 * Gestalt: Bild 0 hängt drei Pixel unter der Kante, Bild 5 steht auf ihr, und
 * dazwischen liegen fünf gleiche Schritte von 0,6. Bei zwölf Pixeln
 * Figurenhöhe ist das ein Viertel der Figur.
 *
 * Der zweite Träger sind die **Beine**, und zwar nicht wegen ihrer Haltung,
 * sondern wegen ihrer Lage zur Fusspunktlinie:
 *
 *   0–2  beide Sohlen hängen unter der Linie — die Figur ist noch nicht oben
 *   3    der vordere Stiefel steht auf der Linie, der hintere hängt noch
 *   4    beide stehen, tief in der Hocke
 *   5    beide stehen, gestreckt
 *
 * Das ist der einzige Teil der Figur, der die Kante überhaupt berühren kann,
 * und deshalb der einzige, der „oben" von „unten" unterscheidet. Die Winkel
 * dafür sind ausgerechnet, nicht geschätzt: Oberschenkel 1,01 und Unterschenkel
 * 1,56 lange Glieder, Sohle 0,37 unter dem Fussgelenk (am Modell gemessen).
 * Wo eine Sohle stehen soll, muss sie um genau den Versatz dieses Bildes
 * angehoben sein — sonst steht die Figur in der Luft oder im Boden.
 *
 * **Was die Arme nicht können.** Das Modell steht im T, die Arme zeigen also
 * zur Seite; sie müssen mit der Z-Achse erst heruntergeklappt werden, bevor die
 * X-Achse sie schwingen lässt. Und sie sind vom Schultergelenk bis zur
 * Fäustlingsspitze nur drei Pixel lang, während die Mähne vom Kopfgelenk aus
 * knapp acht Pixel hoch steht. Ein erhobener Arm endet damit mitten im Haar und
 * ist im Bild nicht vorhanden — probiert und verworfen. Sichtbar wird eine Hand
 * erst **vor der Brust**, wo Hautton auf Anzugtürkis trifft. Die Arme greifen
 * deshalb nach vorn statt nach oben, und ihr Ausschlag geht Bild für Bild
 * abwärts: erst über dem Kopf (verdeckt), dann vor dem Gesicht, dann vor der
 * Brust, zuletzt am Körper. Der Fleck wandert im Bild nach unten, während die
 * Figur steigt — genau das liest als Hochziehen.
 *
 * Der Rumpf beugt sich nie über 11°. Der Kopf ist die halbe Figur, die Mähne
 * hängt an ihm — wer sich weiter vorbeugt, deckt den Körper mit Haar zu.
 */

/**
 * Bildweise Schlüsselwerte. Sechs Bilder sind zu wenig für eine Formel, und
 * jedes hat eine eigene Aufgabe im Ablauf:
 *
 *   0 hängen · 1 ziehen · 2 Brust über die Kante · 3 Knie auf · 4 aufrichten
 *   · 5 stehen (dieses Bild hält am längsten und muss ruhig wirken)
 */
const K = {
  //          0      1      2      3      4      5
  hoch: [-3.0, -2.4, -1.8, -1.2, -0.6, 0.0],
  // Ein Hauch nach vorn, mehr nicht: Nach dem Ablauf tritt die Figur zur
  // Seite, ein grösserer Versatz würde dabei zurückspringen.
  vorn: [-0.6, -0.5, -0.3, -0.1, 0.0, 0.0],

  spine01: [-3, 0, 9, 11, 6, -1],
  spine02: [0, 0, 3, 4, 2, 0],
  // Kopfneigung gegen den Rumpf. Was im Bild ankommt, ist die Summe mit der
  // Wirbelsäule: −12, −10, +6, +12, +5, −5. Bild 0 sieht damit nach oben zur
  // Kante, Bild 3 hinunter auf sie, und weil die Mähne am Kopf hängt, ist
  // dieser Blickwechsel die grösste Flächenbewegung im ganzen Ablauf. Nach
  // hinten bleibt es bei 12°: Ein weit zurückgelegter Kopf hebt die Mähne und
  // arbeitet gegen den Versatz, der die Figur gerade tief halten soll.
  kopf: [-9, -10, -6, -3, -3, -4],

  // Arme: Z klappt sie aus dem T herunter, X schwingt sie dann nach vorn.
  oberarm: [-152, -135, -110, -85, -52, -12],
  unterarm: [8, 45, 55, 45, 12, -8],

  // Führendes Bein (R) und nachziehendes Bein (L). Bis Bild 1 hängen beide
  // gestreckt, erst danach wird gefaltet — sonst verliert der Anfang die
  // lange, schmale Hängeform.
  schenkelV: [6, -4, -60, -88, -50, -14],
  wadeV: [0, 6, 85, 122, 82, 14],
  fussV: [22, 16, -20, -28, -32, 0],
  schenkelH: [11, 6, 6, 5, -18, 10],
  wadeH: [0, 4, 8, 8, 68, -10],
  fussH: [26, 22, 18, 16, -40, 0],
};

/**
 * Der Kletterhelm — **derselbe Kasten wie in `climbing.mjs`**, damit ein Wusel
 * beim Übergang vom Klettern aufs Aufsteigen nicht die Ausrüstung wechselt.
 *
 * Ein einziger flacher Balken quer über dem Haar, `[0.6, 6.4]` über dem
 * Kopfgelenk. Er schneidet die runde Mähne oben gerade ab, und diese gerade
 * Oberkante ist der Beruf: Bei zwölf Pixeln Figurenhöhe unterscheidet nichts
 * anderes den Kletterer so zuverlässig vom Läufer.
 *
 * Ein Helm auf der Stirn, mit Schale und Schirm, war der erste Versuch und ist
 * verworfen. Er endete unter dem Haar statt darüber, und was von ihm übrig
 * blieb, war ein gelber Fleck vor dem Gesicht — bei geneigtem Kopf ein
 * Schnabel. Der Scheitel liegt 5,9 über dem Kopfgelenk, die Mähne steht bis
 * 7,9: Alles, was tiefer sitzt als sie, ist verdeckt.
 *
 * Anbauteile folgen ihrem Gelenk nur in der Lage, nicht in der Drehung — der
 * Backweg setzt ihre Winkel in Weltachsen. Neigung und Scheitellage müssen hier
 * deshalb selbst nachgerechnet werden: Ein geneigter Kopf trägt seinen Scheitel
 * nach vorn, und bei 6,4 Pixeln Hebelarm sind das aus 12° schon 1,3 Pixel. Ein
 * Helm, der das nicht mitmacht, schwebt neben dem Kopf.
 */
function helm(neigung) {
  const b = (neigung * Math.PI) / 180;
  const cos = Math.cos(b);
  const sin = Math.sin(b);
  // Drehung des Versatzes um die Weltachse X: z' = y·sin + z·cos, y' = y·cos − z·sin
  const um = (z, y) => [y * sin + z * cos, y * cos - z * sin, 0];

  return [
    { an: 'Head', pos: um(0.6, 6.4), mass: [5.0, 1.4, 3.6], dreh: [neigung, 0, 0], farbe: 'werkzeug' },
  ];
}

export default {
  clip: 'hoisting',
  frames: 6,

  pose(i) {
    return {
      Spine01: [K.spine01[i], 0, 0],
      Spine02: [K.spine02[i], 0, 0],
      Head: [K.kopf[i], 0, 0],

      // Der hintere Arm läuft dem vorderen um sechs Grad nach. Aus 30° zum
      // Profil lägen zwei gleich gestellte Arme sonst genau übereinander und
      // wären im Bild ein einziger Balken.
      R_Upperarm: [K.oberarm[i], 0, 90],
      L_Upperarm: [K.oberarm[i] + 6, 0, -90],
      R_Forearm: [K.unterarm[i], 0, 0],
      L_Forearm: [K.unterarm[i] - 6, 0, 0],

      R_Thigh: [K.schenkelV[i], 0, 5],
      L_Thigh: [K.schenkelH[i], 0, -5],
      R_Calf: [K.wadeV[i], 0, 0],
      L_Calf: [K.wadeH[i], 0, 0],
      R_Foot: [K.fussV[i], 0, 0],
      L_Foot: [K.fussH[i], 0, 0],

      _versatz: [K.vorn[i], K.hoch[i]],
    };
  },

  teile(i) {
    // Alle Drehungen um X laufen in derselben Weltachse und addieren sich —
    // die Neigung des Kopfes ist die Summe der Kette unter ihm.
    return helm(K.spine01[i] + K.spine02[i] + K.kopf[i]);
  },
};
