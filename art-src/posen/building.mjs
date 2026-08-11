/**
 * Brückenstufe legen — acht Bilder, Zyklus.
 *
 * **Bild 0 ist das Wirkungsbild.** Genau dort setzt die Simulation den Stein,
 * also muss dort die Planke unten vorn liegen. Danach richtet sich die Figur
 * auf, greift nach hinten, holt die nächste und trägt sie vorn wieder herunter.
 *
 * ## Was diesen Zustand vom Graben unterscheidet
 *
 * Nur eines, und es ist die ganze Silhouette: **die Planke zeigt nach vorn,
 * nicht nach unten.** Der Gräber hat einen kurzen gelben Fleck zwischen den
 * Füssen; der Brückenbauer hat einen sechs Pixel langen Balken, halb so lang
 * wie die Figur hoch ist, der rechts aus ihr herausragt. Als schwarzer Umriss
 * allein bleibt eine Figur mit einem waagerechten Ausleger — und etwas anderes
 * tut auf diesem Blatt niemand.
 *
 * Damit das trägt, muss der Balken **über die Mähne hinausreichen**. Die Mähne
 * steht bis sechs Pixel neben der Körpermitte; eine Planke, die dort endet,
 * liegt im Umriss der Figur und ist keine Silhouette, sondern ein Fleck. Ihr
 * vorderes Ende steht deshalb in jedem der acht Bilder jenseits von sieben.
 *
 * Deshalb bleibt die Planke ausserdem in **jedem** Bild waagerecht und nach
 * vorn gerichtet, und ihre Schleife ist fast senkrecht: unten am Boden
 * (Bild 0), am Körper hoch (1–2), auf Brusthöhe gehalten (3–4) und wieder
 * herunter (5–7). Sie beim Zurückgreifen mitzudrehen oder hinter den Rücken zu
 * nehmen wäre naturgetreuer — beides gebacken und beides verworfen: Die Spitze
 * verschwand hinter der Mähne, und die halbe Schleife sah aus wie ein anderer
 * Beruf. Was „nach hinten greifen" hier zeigt, ist der Kopf, nicht die Planke.
 *
 * ## Warum der Rumpf fast stillsteht
 *
 * Der Kopf ist fast die halbe Figur, und die Mähne hängt an ihm. Über 12°
 * Beugung deckt sie den Körper zu, und übrig bleibt ein roter Fleck (dieselbe
 * Grenze wie in `digging.mjs` und `climbing.mjs`). Spine01 geht deshalb nie
 * über 11°. Die Bewegung tragen die Planke und der Kopf: Beim Legen sieht die
 * Figur auf ihre Arbeit hinunter, beim Greifen hebt sie den Blick — und weil
 * die Mähne am Kopf hängt, ist dieser Blickwechsel die grösste Flächen-
 * bewegung im ganzen Zyklus.
 */

const rad = (g) => (g * Math.PI) / 180;

/**
 * Bildweise Schlüsselwerte. Acht Bilder mit je eigener Aufgabe sind zu wenig
 * für eine Formel:
 *
 *   0 legen · 1 loslassen · 2 aufrichten · 3 zurückgreifen
 *   · 4 nächste Planke gefasst · 5 vorbeugen · 6 senken · 7 ansetzen
 */
const K = {
  //           0      1      2      3      4      5      6      7
  // Wie tief die Figur in den Knien steht. 1 beim Legen, 0 im Aufrichten.
  // Ungleich verteilt: schnell hoch, oben verweilen, langsam wieder herunter.
  // Ein symmetrischer Verlauf sah aus wie ein Pendel, nicht wie Arbeit.
  tief: [1.0, 0.5, 0.15, 0.0, 0.0, 0.3, 0.6, 0.88],

  spine01: [11, 7, 3, 2, 2, 4, 7, 10],
  spine02: [4, 3, 1, 1, 1, 2, 3, 4],
  // Kopfneigung gegen den Rumpf. Im Bild zählt die Summe: 20, 11, 0, −4, −5,
  // 2, 10, 18. Bild 0 schaut auf die Planke, Bild 4 hinter sich.
  kopf: [5, 1, -4, -7, -8, -4, 0, 4],

  // Kopfdrehung. Beim Zurückgreifen sieht die Figur über die Schulter; im Bild
  // dreht sich damit die Mähne, und das ist die einzige Flächenänderung, die
  // dieser Zustand ausser der Planke zu bieten hat.
  kopfDreh: [0, 2, 6, 10, 12, 6, 0, 0],

  // Armschwung nach vorn, aus der Senkrechten gemessen. Die Arme heben die
  // Planke: unten beim Legen, vor der Brust beim Tragen.
  arm: [4, 24, 38, 46, 46, 34, 20, 8],

  // Lage der Plankenmitte, in logischen Pixeln über der Sohle und vor der
  // Körpermitte. Absolut angegeben, nicht als Versatz zur Hand: Die Schleife
  // ist das, was man sieht, und sie soll nicht an der Armlänge hängen.
  //
  // Die Tiefe wandert um einen Pixel, die Höhe um gut drei. Mehr Höhe geht
  // nicht: Über 4,5 stösst der Balken ins Gesicht, und ein gelber Riegel quer
  // vor der Nase liest als Schnabel (dieselbe Falle wie beim Helm in
  // `hoisting.mjs`). Nach unten ist bei 0,9 Schluss — dort liegt er auf dem
  // Boden, und genau das ist das Wirkungsbild.
  plankeVorn: [5.1, 4.8, 4.5, 4.2, 4.1, 4.3, 4.7, 5.0],
  plankeHoch: [0.9, 2.2, 3.3, 4.0, 4.1, 3.0, 2.0, 1.2],
  // Neigung; negativ heisst vorderes Ende hoch. Beim Legen liegt sie flach.
  //
  // Sehr klein gehalten, und das ist erlaufen: Sechs Pixel Länge machen aus
  // 7° schon einen halben Pixel Höhenunterschied zwischen den Enden. Der
  // Balken bleibt dann zwar zusammenhängend, steigt aber auf halber Strecke
  // eine Reihe hoch — und eine Treppe aus zwei Stufen liest bei dieser Grösse
  // nicht als geneigter Balken, sondern als Knick. Unter 4° bleibt er eine
  // Linie, und eine Linie ist die ganze Silhouette.
  plankeKipp: [0, -2, -3, -4, -4, -3, -2, 2],
};

/**
 * Absenkung der Figur. Sie ist kein Effekt, sondern eine Notwendigkeit: Das
 * Becken ist die Wurzel der Beinkette, ein gebeugtes Knie hebt also die Füsse,
 * statt die Hüfte zu senken. Ohne Gegenversatz schwebte die Figur, sobald sie
 * in die Knie geht. Der Wert ist die Verkürzung der Beinkette bei `tief` = 1
 * (Oberschenkel 1,01, Unterschenkel 1,56, Sohle 0,37 unter dem Fussgelenk).
 */
const hoch = (i) => -0.15 - 0.49 * K.tief[i];

/**
 * Wirksame Drehhöhe des Arms über der Sohle, und die Länge seiner Glieder.
 *
 * Die 7,0 sind **am gebackenen Bild kalibriert**, nicht aus dem Skelett
 * gerechnet. Aus der Knochenlage käme 5,3 heraus (Schultergelenk) — mit dieser
 * Zahl lag die Planke im ersten Durchgang in jedem Bild 1,7 Pixel zu hoch,
 * und zwar in jedem gleich viel. Woran das liegt, ist hier nicht geklärt; der
 * Fehler ist ein fester Versatz und keine Verzerrung, also genügt eine Zahl.
 *
 * Und deshalb steht in `plankeVorn`/`plankeHoch` auch der *Sollwert*, nicht
 * das Ergebnis: Die Rechnung trifft die Schleife auf etwa einen halben Pixel,
 * den Rest hat das Bild entschieden. Wer das Modell tauscht, backt einmal und
 * misst nach — die Tabelle ist der Wunsch, das Blatt ist die Wahrheit.
 */
const SCHULTER = 7.0;
const GLIED = 1.45;
/** Höhe des Beugepunkts der Wirbelsäule — darüber wandert die Schulter mit. */
const BEUGE = 2.6;
/** Zusätzliche Ellbogenbeugung nach vorn, über den ganzen Zyklus gleich. */
const ELLBOGEN = 30;

/**
 * Lage des Handgelenks in logischen Pixeln, [vorn, hoch] über der Sohle.
 *
 * Nachgerechnet, weil die Planke an `R_Hand` hängt und der Backweg ihre Lage
 * als *Versatz* zu diesem Gelenk erwartet. Ohne die Rechnung müsste man eine
 * Schleife von Hand gegen eine Hand ausrichten, die sich selbst bewegt.
 * Die Armwinkel gelten in Weltachsen, die Armrichtung hängt also nicht am
 * Rumpf — nur die Schulter wandert mit ihm nach vorn.
 */
function hand(i) {
  const a = rad(K.arm[i]);
  const e = rad(K.arm[i] + ELLBOGEN);
  const neigung = rad(K.spine01[i] + K.spine02[i]);
  const hebel = SCHULTER - BEUGE;
  return {
    vorn: hebel * Math.sin(neigung) + GLIED * (Math.sin(a) + Math.sin(e)),
    hoch:
      BEUGE + hebel * Math.cos(neigung) + hoch(i) - GLIED * (Math.cos(a) + Math.cos(e)),
  };
}

export default {
  clip: 'building',
  frames: 8,

  pose(i) {
    const t = K.tief[i];
    const a = K.arm[i];

    return {
      Spine01: [K.spine01[i], 0, 0],
      Spine02: [K.spine02[i], 0, 0],
      Head: [K.kopf[i], K.kopfDreh[i], 0],

      // Das Modell steht im T: Die Arme liegen auf der Weltachse X, eine
      // Drehung um X verdreht sie nur. Erst Z klappt sie herunter (`L_` liegt
      // bei +X und braucht −90, `R_` bei −X und +90), dann schwingt X sie.
      // Der hintere Arm läuft dem vorderen um fünf Grad nach: Aus 30° zum
      // Profil lägen zwei gleich gestellte Arme sonst genau übereinander.
      R_Upperarm: [-a, 0, 90],
      L_Upperarm: [-a - 5, 0, -90],
      R_Forearm: [-a - ELLBOGEN, 0, 90],
      L_Forearm: [-a - ELLBOGEN - 5, 0, -90],

      // Schrittstellung, das vordere Bein (R) über der neuen Stufe. Beim Legen
      // gibt es nach, das hintere stützt.
      //
      // Getrennt wird in der **Tiefe**, nicht zur Seite: Die Weltachse Z
      // bildet sich mit cos 30° = 0,87 auf die Bildbreite ab, die Seitwärts-
      // achse X nur mit 0,50 (dasselbe Argument wie in `climbing.mjs`). Ein
      // seitlich gespreizter Stand kostet Winkel und bringt kein Pixel; erst
      // ein Schritt nach vorn und hinten macht aus dem Beinstumpf zwei Beine.
      //
      // Die Winkel sind ausgerechnet, nicht geschätzt: Beide Ketten müssen in
      // jedem Bild gleich lang bleiben (Oberschenkel 1,01, Unterschenkel 1,56,
      // Sohle 0,37 unter dem Fussgelenk), sonst steht ein Fuss in der Luft.
      //
      // Der Unterschenkel des vorderen Beins steht **negativ**, also selbst
      // noch nach vorn. Das ist kein Fehler und kein überstrecktes Knie: Der
      // Oberschenkel steht mit −64 weiter vorn, das Knie ist also gebeugt.
      // Nur so kommt der Fuss vor den Körper. Mit hinten stehender Wade zog es
      // beide Füsse unter die Hüfte zurück, und aus den Beinen wurde ein
      // zweispaltiger Stumpf — im ersten Anlauf genau das Bild.
      R_Thigh: [-30 - 34 * t, 0, 0],
      L_Thigh: [20 - 12 * t, 0, 0],
      R_Calf: [-14 - 10 * t, 0, 0],
      L_Calf: [24 + 30 * t, 0, 0],
      // Auf [0, 0, 0] festgehalten heisst: in der Bindelage, also Sohle flach.
      // Ohne Angabe nähme der Fuss die Drehung der Wade mit und die Figur
      // stünde auf den Zehenspitzen.
      R_Foot: [0, 0, 0],
      L_Foot: [0, 0, 0],

      _versatz: [0, hoch(i)],
    };
  },

  teile(i) {
    const h = hand(i);
    return [
      // Die Planke. Sechs Pixel lang bei zwölf Pixeln Figurenhöhe — absichtlich
      // zu gross für einen Menschen und gerade richtig für eine Silhouette, die
      // in einer 28 Pixel breiten Zelle noch etwas sagen soll. Seitlich um 1,3
      // versetzt, weil sie am *rechten* Handgelenk hängt, aber zwischen beiden
      // Händen liegen soll.
      {
        an: 'R_Hand',
        pos: [K.plankeVorn[i] - h.vorn, K.plankeHoch[i] - h.hoch, 1.3],
        mass: [6, 1, 2.5],
        dreh: [K.plankeKipp[i], 0, 0],
        farbe: 'werkzeug',
      },
    ];
  },
};
