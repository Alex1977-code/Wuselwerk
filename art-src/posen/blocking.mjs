/**
 * Blockieren — zwei Bilder, Zyklus, Haltedauer 8 je Bild.
 *
 * Das ist die **breiteste Silhouette des Blattes** und zugleich ein Haltesignal:
 * Der Blocker steht im Weg, und alle anderen laufen auf ihn zu. Er muss von
 * weitem und mitten im Gedränge sofort auffallen, und zwar allein an der Form
 * (GDD §6). Alles andere auf diesem Blatt ist **hoch** — eine schmale Säule mit
 * Mähne obendrauf, aus der höchstens nach vorn ein Werkzeug herausragt. Nur
 * dieser Zustand ist **quer**: ein waagerechter Riegel auf Schulterhöhe, der
 * nach **beiden** Seiten gleich weit aus der Figur heraussteht. Als schwarzer
 * Umriss allein bleibt ein T — und ein T gibt es sonst nirgends.
 *
 * Die Figur misst damit im Bild 18 Pixel in der Breite bei 12 Pixeln Körper-
 * höhe. Das ist absichtlich zu viel für einen Menschen und gerade richtig für
 * ein Zeichen, das in einer Traube aus zehn Läufern gefunden werden muss.
 *
 * ## Die Arme müssen über die Mähne hinausreichen
 *
 * Das ist die ganze Schwierigkeit dieses Zustands, und der erste Anlauf ist
 * genau daran gescheitert. Am gebackenen Bild gemessen steht die Mähne fünf
 * Pixel hinter der Körpermitte und dreieinhalb davor — sie ist die breiteste
 * Fläche, die die Figur ohnehin schon hat. Ein Arm, der dort **endet**, ist im
 * Umriss nicht vorhanden: Der erste Versuch schloss hinten bündig mit dem
 * Haarrand ab, und aus Mähne und Armende wurde ein einziger Klumpen, der nach
 * unten breiter wird. Vorn stand ein Flügel, hinten nichts — also dieselbe
 * Silhouette wie beim Rammer, nur unschärfer.
 *
 * Der Arm allein kann das nicht leisten: Von der Schulter bis zur Faust sind es
 * gut drei Pixel (dieselbe Messung wie in `bashing.mjs`), und länger wird er
 * nicht. Die Weite kommt deshalb aus den Anbauteilen, und sie sind grösser
 * geraten, als „kleiner Kasten an der Hand" vermuten lässt: 4,6 lang, gemessen
 * vom Handgelenk aus nach aussen. Damit steht das Armende bei 8,4 — **drei
 * Pixel jenseits der Mähne auf jeder Seite**. Erst diese drei Pixel machen aus
 * dem Umriss ein Kreuz statt einer Beule. Was den Zustand trägt, muss grösser
 * sein als das, was ihn verdeckt.
 *
 * Die Kästen sind ausserdem nötig, weil der Ärmel im Bild eine Zeile dünn ist
 * und im Mehrheitsentscheid kaum besteht. Anbauteile zählen beim Verkleinern
 * doppelt (`scripts/bake-atlas.mjs`) — die Enden der Arme sind damit die
 * einzigen Pixel dort draussen, die sicher stehen.
 *
 * ## Warum der zurückgestreckte Arm der kameranahe ist
 *
 * Er greift in den Raum, in dem die Mähne hängt. Er hängt deshalb an der
 * **kameranahen** Seite (`R_` liegt bei −X, die Kamera steht bei −X): So liegt
 * sein Kasten vor dem Haar und nicht dahinter. Der nach vorn gestreckte Arm
 * braucht diesen Schutz nicht — vor der Figur ist nichts.
 *
 * ## Rumpf und Beine
 *
 * Spine01 bleibt unter 4°. Der Kopf ist fast die halbe Figur, die Mähne hängt
 * an ihm, und über etwa 12° Beugung deckt sie den Körper zu (dieselbe Grenze
 * wie in `digging.mjs`, `building.mjs` und `climbing.mjs`). Hier wäre eine
 * Beugung ohnehin falsch: Der Blocker stemmt sich, er arbeitet nicht.
 *
 * ## Was sich zwischen den beiden Bildern bewegt
 *
 * **Die Arme nicht.** Acht Ticks je Bild sind eine lange Standzeit, und der
 * Riegel ist die Aussage des Zustands; was blockiert, wackelt nicht. Probiert
 * war es trotzdem: Die Arme 88° und 97° statt zweimal 90 heben die Hand um
 * einen halben Pixel. Im Bild verschiebt sich der Kasten davon nicht, sondern
 * verliert eine Zeile — er stand einmal drei und einmal zwei Zeilen hoch, und
 * ein Balken, der seine Dicke wechselt, liest als Fehler und nicht als Atem.
 *
 * Das Atmen liegt deshalb ganz oben, wo die Fläche ist: Der Kopf senkt sich um
 * vier Grad, und weil die Mähne an ihm hängt, wandert ihre Spitze bei sieben
 * Pixeln Hebelarm einen halben Pixel. Dazu schlagen die Haarsträhnen gegen-
 * einander aus — `_haar` ist in beiden Bildern gleich gross, und der Nachlauf
 * dreht über den halben Zyklus von selbst das Vorzeichen. Ohne diesen Eintrag
 * stünde hier gar nichts: Der Standwert ist sin(t · 2π) und wird bei zwei
 * Bildern für t = 0 und t = 0,5 beide Male null — ausgerechnet der Blocker wäre
 * der einzige erstarrte Zustand des Blattes.
 */

/** Bildweise Schlüsselwerte. 0 = aufgerichtet, 1 = einen Hauch gesenkt. */
const K = {
  //        0   1
  spine01: [3, 1],
  spine02: [2, 1],
  // Kopfneigung gegen den Rumpf. Im Bild zählt die Summe der Kette: 0 und 4.
  // Der Kopf steht also aufrecht und nickt zwischen den Bildern vier Grad —
  // die einzige Flächenbewegung, die dieser Zustand sich leistet.
  kopf: [-5, 2],
};

/**
 * Weltwinkel des ganzen Arms, aus der Senkrechten gemessen: 90 ist genau
 * waagerecht. In beiden Bildern derselbe Wert — siehe oben.
 */
const ARM = 90;

/**
 * Spreizung der gestreckten Beine in der Tiefe. Getrennt wird in der Tiefe und
 * nicht zur Seite: Die Weltachse Z bildet sich mit cos 30° = 0,87 auf die
 * Bildbreite ab, die Seitwärtsachse X nur mit 0,50.
 *
 * **Mehr als 25° macht den Stand nicht breiter, sondern kaputt**, und das ist
 * gebacken und nachgezählt: Mit 40° stünden die Sohlen rechnerisch 2,9 Pixel
 * auseinander, im Bild blieb dieselbe zwei Pixel breite Säule wie mit 25° — nur
 * zwei statt drei Zeilen hoch, weil das Spreizen die Figur absenkt. Ein Bein
 * ist im Bild knapp einen Pixel dick; sobald es schräg steht, verteilt es sich
 * auf zwei Spalten, und keine davon erreicht die 42 % Deckung, ab der eine
 * Zelle gesetzt wird. Das Bein löst sich auf, statt zur Seite zu wandern —
 * dieselbe Klage steht in `bashing.mjs` als „breiter als vier Pixel wird der
 * Stand nicht".
 *
 * Also gerade so viel Spreizung, dass zwei Beine erkennbar bleiben. Die
 * Standfestigkeit kommt aus der vollen Höhe: drei Zeilen Bein unter einem quer
 * stehenden Riegel lesen fester als zwei.
 */
const BEIN = 25;

/**
 * Absenkung. Kein Effekt, sondern Folge des Spreizens: Ein Bein steht 2,57 vom
 * Hüftgelenk zur Sohle, bei 25° Neigung sind davon nur noch 2,33 senkrecht.
 * Ohne Gegenversatz schwebte die Figur um genau diesen Unterschied.
 */
const HOCH = -(2.57 - 2.57 * Math.cos((BEIN * Math.PI) / 180));

export default {
  clip: 'blocking',
  frames: 2,

  pose(i) {
    return {
      Spine01: [K.spine01[i], 0, 0],
      Spine02: [K.spine02[i], 0, 0],
      Head: [K.kopf[i], 0, 0],

      // Z klappt die Arme aus der T-Haltung herunter (`L_` liegt bei +X und
      // senkt mit −Z, `R_` bei −X mit +Z), erst danach schwingt X sie. Ohne das
      // Herunterklappen lägen sie auf der Achse X, und keine Drehung um X
      // bewegte sie auch nur einen Millimeter.
      //
      // Winkel addieren sich in Weltachsen entlang der Kette: Oberarm plus
      // Unterarm ist die Weltrichtung des Unterarms. Beide Arme sind deshalb
      // fast ganz im Oberarm gestreckt, der Rest bleibt für den Unterarm — ein
      // durchgedrückter Arm ist ein gerader Balken, und der Balken ist hier
      // alles. Die vier Grad Restwinkel im Ellbogen sind kein Zufallswert: Aus
      // 30° zum Profil lägen zwei völlig gleich gestellte Arme im Bild genau
      // übereinander, und die Rundung an der Schulter fiele weg.
      R_Upperarm: [ARM - 4, 0, 90], // nach hinten, kameranah
      R_Forearm: [4, 0, 0],
      L_Upperarm: [-(ARM - 4), 0, -90], // nach vorn, kamerafern
      L_Forearm: [-4, 0, 0],

      // Gestreckter Stand, in der Tiefe gespreizt: das kameranahe Bein (R) vorn.
      // Die Waden bleiben in der Verlängerung des Oberschenkels — 0 heisst
      // „kein zusätzlicher Winkel", das Bein ist also durchgedrückt. Die Füsse
      // drehen die Summe der Kette wieder heraus, damit die Sohlen flach
      // stehen; eine schräge Sohle kippt im Bild die ganze Figur.
      //
      // Der seitliche Anteil (Z) spreizt zusätzlich nach aussen: `R_` liegt bei
      // −X und geht mit −Z hinaus, `L_` bei +X mit +Z. Viel kommt davon nicht
      // an — ein halber Pixel —, aber er kostet auch nichts.
      R_Thigh: [-BEIN, 0, -6],
      L_Thigh: [BEIN, 0, 6],
      R_Calf: [0, 0, 0],
      L_Calf: [0, 0, 0],
      R_Foot: [BEIN, 0, 0],
      L_Foot: [-BEIN, 0, 0],

      _versatz: [0, HOCH],
      // Gleich gross in beiden Bildern — der Nachlauf dreht das Vorzeichen von
      // selbst, und daraus wird das Gegenschlagen der Strähnen.
      _haar: 0.5,
    };
  },

  teile() {
    // Der Signalkasten an jeder Hand: vom Handgelenk aus nach aussen, in der
    // Achse des Arms. Er ist das äusserste Ende der Silhouette und deshalb
    // lieber ein Klotz als ein Plättchen — 2,4 hoch steht er im Bild drei
    // Zeilen und ragt damit über den zwei Zeilen dünnen Ärmel hinaus. Aus dem
    // Riegel wird eine Hantel, und die liest auch dort noch, wo ihr inneres
    // Ende den Haarrand streift.
    //
    // **`haarglanz` und nicht `signal`, und das ist kein Versehen.** Gewollt ist
    // die Signalfarbe; sie ist im Backweg aber nicht zu bekommen. Anbauteile
    // werden in einer Markerfarbe gerendert und erst beim Einrasten übersetzt,
    // und der Renderer rechnet beim Ausgeben von linear nach sRGB um: Aus dem
    // Marker (0, 128, 255) von `signal` werden im Bild (0, 188, 255). Die
    // Erkennung lässt weniger als 60 Stufen Abstand zu — es sind genau 60, also
    // fällt sie durch, der Kasten gilt über das Kanalverhältnis als Anzug und
    // wird türkis. Genau so gebacken und gesehen: Die Arme verschwanden im
    // eigenen Ärmel. Alle anderen Marker benutzen nur 0 und 255 und überstehen
    // die Umrechnung unverändert; `haarglanz` (0, 255, 255) ist der einzige,
    // der orange einrastet — #ff8f5e gegen #ff7a45, im Bild derselbe Ton.
    // Sobald die Toleranz in `scripts/bake-atlas.mjs` sitzt, gehört hier
    // `signal` hin.
    const kasten = (an, vorn, seitlich) => ({
      an,
      pos: [vorn, -0.3, seitlich],
      mass: [4.6, 2.4, 1.8],
      farbe: 'signal',
    });

    return [
      // Hinten: eine Spur zur Kamera gezogen, damit er sicher vor der Mähne
      // liegt und nicht in ihr verschwindet.
      kasten('R_Hand', -2.9, -0.5),
      // Vorn: vor der Figur ist nichts, was ihn verdecken könnte.
      kasten('L_Hand', 2.9, 0),
    ];
  },
};
