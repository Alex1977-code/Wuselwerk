/**
 * Die Haarkette — die Physik hinter dem Schopf des Wuselwerkers.
 *
 * ## Warum eine Kette und keine Tabelle
 *
 * Bis zum 26.08.2026 stand hier eine Tabelle: je Pose ein fester Versatz, um
 * den der Zeichner die Straehnen verschob. Das hatte zwei Fehler, und beide
 * hat der Spieler benannt. Erstens sprang das Haar bei jedem Posenwechsel an
 * eine neue Stelle — „angeschraubt". Zweitens kannte die Tabelle nur die
 * dreizehn Eintraege, die jemand vorher hineingeschrieben hatte, und nichts
 * dazwischen.
 *
 * Die Recherche vom 26.08.2026 hat aus drei Richtungen dieselbe Antwort
 * bekommen. Celestes Madeline ist ACHT MAL ELF Bildpunkte gross — kleiner als
 * diese Figur mit 12,3 logischen Pixeln — und hat echtes nachlaufendes Haar;
 * simuliert wird dort keine Straehne, sondern eine MASSE aus vier runden
 * Klecksen, die von voll auf ein Viertel schrumpfen. Spines eigenes
 * Haar-Schaustueck nimmt zwei Knochen je Strang, Live2Ds Beispielfigur zwei
 * Partikel je Gruppe. Und der Grafiker von Celeste schreibt die Regel auf:
 * bei sehr kleinen Bildern zeichnet man keine einzelnen Faeden mehr.
 *
 * Das deckt sich mit dem, was hier laengst gemessen ist: Sechs duenne Faeden
 * fielen mit 71 Prozent verschmolzener Spitzenpaare durch, vier Wurzeln fielen
 * von vorn gesehen in ALLEN Bildern auf 0,02 bis 0,08 lp zusammen. Bei einer
 * Lesegrenze von 0,9 lp und 3,6 lp Haarlaenge sitzen die Gelenke bei drei
 * Gliedern 1,2 lp auseinander, bei fuenf schon 0,72 — und damit unter der
 * Grenze. DREI GLIEDER SIND NICHT SPARSAMKEIT, SONDERN DAS MAXIMUM, DAS DIE
 * FIGUR AUFLOEST.
 *
 * ## Warum die Physik in einer eigenen Datei steht
 *
 * Weil sie zwei Kundschaften hat, die sich sonst nicht kennen. `ansicht.ts`
 * fuehrt je Figur eine Kette mit Gedaechtnis — das ist der Spielweg. Die
 * Weltkarte und die Profilauswahl haben keine Figur und keine Uhr; sie
 * brauchen dieselbe Frisur in Ruhelage. Frueher stand dafuer eine
 * abgeschriebene Zahlenreihe im Zeichner, und die musste bei jeder Aenderung
 * von Hand nachgezogen werden. Jetzt rechnet `ketteRuhe` sie aus derselben
 * Physik aus.
 */

/** Wieviele Glieder. Siehe Kopfkommentar: drei ist das Maximum, nicht das Sparmass. */
export const GLIEDER = 3;

/**
 * Laenge eines Gliedes in logischen Pixeln.
 *
 * **Die erste Fassung stand bei 2,1 und war damit knoechellang.** Der Fehler
 * war eine Annahme statt einer Messung: „drei mal 2,1 ist 6,3, das reicht zur
 * Schulter." Am Blatt nachgemessen stimmt das nicht einmal ungefaehr. Beim
 * Gangbild ist die Figur 12,0 lp hoch, die Tunika — also die Schulter —
 * beginnt 5,9 lp unter dem Scheitel, und der gebackene Haaransatz sitzt schon
 * bei 4,56. Zwischen Ansatz und Schulter liegen also 1,3 lp, nicht 6,3. Die
 * Kette hing der Figur bis an die Fesseln; im Schuss sah sie aus wie ein
 * Umhang.
 *
 * Buchstaeblich schulterlang waeren 1,3 lp — und das waere unsichtbar, weil
 * die gebackene Kappe allein schon 0,6 lp unter den Ansatz reicht. Diese Figur
 * ist ein Chibi: Der Kopf nimmt die halbe Hoehe ein, und an ihm gemessen ist
 * jede Frisur kurz. 1,2 lp je Glied, zusammen 3,6, enden auf halber Tunika —
 * sichtbar Haar und erkennbar kein Banner.
 *
 * Die Lesegrenze haelt das aus: Bei drei Gliedern sitzen die Gelenke 1,2 lp
 * auseinander und damit ueber den 0,9, ab denen zwei Merkmale einzeln lesbar
 * sind.
 */
export const GLIED = 1.2;

/**
 * Steifigkeit und Daempfung je Glied, von der Wurzel zur Spitze.
 *
 * Die Startwerte sind nicht geraten, sondern aus einem ausgelieferten Haar-Rig
 * abgelesen: Spines `celestial-circus` nennt fuer die Haarwurzel `inertia 0.5,
 * damping 0.85` und fuer die Spitze `inertia 0.73, damping 0.81`. Naeher an
 * der Wurzel steifer, an der Spitze traeger und langsamer auslaufend — so
 * haengt Haar.
 */
const STEIF = [0.5, 0.42, 0.34];
const DAEMPF = [0.85, 0.83, 0.81];

/** Wie stark die Schwerkraft an der Kette zieht, in lp je Bild im Quadrat. */
const SCHWERE = 0.055;

/** Wie schnell das geglaettete Tempo dem rohen folgt. */
export const TEMPO_GLATT = 0.18;

/**
 * Die Luft, in der eine Pose haengt.
 *
 * **Das ist der Ersatz fuer die alte Versatztabelle, und der Unterschied ist
 * nicht kosmetisch.** Ein Versatz war ein Ort: „beim Fallen steht das Haar
 * 3,4 Pixel weiter oben." Beim Posenwechsel sprang es dorthin. Eine Luft ist
 * eine RUHELAGE: „beim Fallen will das Haar nach oben hinten." Die Kette
 * laeuft dorthin, in ihrer eigenen Zeit, und sie laeuft auch wieder zurueck —
 * ohne dass jemand einen Uebergang eintragen muesste. Zwischen zwei Posen
 * liegt keine Luecke mehr, sondern ein Weg.
 *
 * ## Warum eine Ruhelage und keine Kraft
 *
 * Der erste Versuch am 27.08.2026 hat die Luft als KRAFT gebaut — Wind und
 * Auftrieb in lp je Bild im Quadrat — und ist gemessen durchgefallen: Bei
 * voller Fallhoehe stand die Kettenspitze immer noch bei 6,299 von 6,3 lp,
 * also kerzengerade nach unten. Der Grund steht in den Zahlen: Die Federkraft
 * betraegt 0,34 bis 0,50, die Schwerkraft 0,055. Die Feder ist SIEBENMAL
 * staerker als alles, was man ihr entgegensetzen koennte, und ihr Ziel ist die
 * Senkrechte. Eine Kraft verschiebt die Kette also um Kraft geteilt durch
 * Steifigkeit — rund einen Zehntelpixel — und der Laengenzwang zieht auch das
 * noch zurueck.
 *
 * Wer die Lage aendern will, muss deshalb das ZIEL der Feder drehen, nicht
 * dagegen druecken. Genau das tun Spine und Live2D auch: Dort hat jeder
 * Haarknochen einen Ruhewinkel, und die Federung schwingt darum herum.
 *
 * ## Woher die Zahlen kommen
 *
 * Aus dem Entwurf, nicht aus einer Messung. Gemessen sind die Kettenlaenge,
 * die Gliederzahl und die Federwerte — die dreizehn Winkel sind gesetzt. Sie
 * muessen es sein: Kein Messgeraet sagt einem, wie weit das Haar eines
 * Sterbenden nach vorn faellt. Was sie stattdessen einhalten, ist eine Regel:
 * Was die Figur TUT, macht das Haar mit; was das Blatt schon zeigt,
 * wiederholt es nicht.
 *
 * - `winkel` Ruhewinkel der Kette gegen die Senkrechte in Grad, positiv nach
 *   VORN (in Blickrichtung). Was das Laufen zurueckliegt, steht hier
 *   ausdruecklich NICHT — das erledigt `tempo` stetig und fuer jede
 *   Zwischengeschwindigkeit. Hier steht nur, was die Pose selbst tut.
 * - `sturzWinkel` Nur beim Fallen: der Winkel bei toedlicher Fallhoehe.
 *   Dazwischen wird gemischt. Das ersetzt den alten festen Versatz nach oben.
 * - `steif` Faktor auf die Federkraft. Kleiner heisst loser und zappeliger,
 *   groesser heisst gefasster.
 */
export interface Luft {
  winkel: number;
  sturzWinkel?: number;
  steif: number;
}

const LUFT: Record<string, Luft> = {
  // Der Gang legt das Haar ueber `tempo` zurueck, nicht ueber die Luft. Sonst
  // haette eine stehende Figur in der Gangpose wehendes Haar.
  walking: { winkel: 0, steif: 1 },
  // Der einzige Eintrag mit zwei Winkeln: Ein kurzer Sturz legt das Haar
  // zurueck, ein toedlicher stellt es auf.
  falling: { winkel: -35, sturzWinkel: -80, steif: 0.85 },
  // Unter dem Schirm sinkt die Figur langsam; das Haar steht in ihrem eigenen
  // Aufwind, aber ruhig.
  floating: { winkel: -25, steif: 0.8 },
  // An der Wand: Das Haar haengt von ihr weg, mehr passiert nicht.
  climbing: { winkel: -10, steif: 1 },
  hoisting: { winkel: -18, steif: 1 },
  building: { winkel: -6, steif: 1 },
  // Die arbeitenden Posen haengen loser: Bei jedem Schlag soll das Haar
  // mitgehen. Das ist der Anteil der Bewegung, den das Blatt NICHT zeigt —
  // dort schlaegt nur das Werkzeug.
  bashing: { winkel: -14, steif: 0.8 },
  mining: { winkel: -12, steif: 0.8 },
  // Der Graeber sieht nach unten, das Haar rutscht ihm nach vorn.
  digging: { winkel: 6, steif: 0.8 },
  // Der Sperrer ist die ruhende Figur im Bild — auch im Haar.
  blocking: { winkel: 0, steif: 1.25 },
  // Beim Entschweben zieht es die Figur nach oben, das Haar bleibt darunter.
  saving: { winkel: -20, steif: 0.9 },
  dying: { winkel: 14, steif: 0.7 },
  spaehen: { winkel: 0, steif: 1.1 },
};

const WINDSTILL: Luft = { winkel: 0, steif: 1 };

/** Die Luft einer Pose. Unbekannte Posen haengen windstill. */
export function luftVon(pose: string): Luft {
  return LUFT[pose] ?? WINDSTILL;
}

/**
 * Wieviel Grad das volle Tempo die Kette zurueckliegt.
 *
 * Die Gewichtung Kopf gegen Koerper ist von Live2Ds Beispielfigur uebernommen,
 * die ihre Haargruppen zu sechzig Prozent aus dem Kopfwinkel und zu vierzig
 * aus dem Koerperwinkel speist. Hier gibt es nur eine Bewegung, also steht die
 * Zahl als eine Zahl da.
 */
const GRAD_JE_TEMPO = 33;

/**
 * Weiter als so weit legt sich die Kette nicht, in Grad.
 *
 * Gemessen und nicht geschaetzt: Ohne diese Grenze stand die Kette beim tiefen
 * Sturz auf -145 Grad — das Haar zeigte nach oben UND nach vorn, also
 * umgeklappt ueber den Kopf und ins Gesicht. Der Grund war das Stapeln: Der
 * Sturzwinkel und der Tempowinkel addieren sich, und beim Fallen ist das Tempo
 * immer eins. Bei -105 Grad steht die Spitze knapp ueber der Waagerechten —
 * das ist Fahrtwind. Alles darueber ist ein Klappmesser.
 */
const WINKEL_MAX = 105;

export interface Glied {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * Einen Schritt der Kette rechnen — Feder, Daempfer, Laengenzwang.
 *
 * Fester Zeitschritt und keine Zufallszahl: Genau das ist die Antwort auf die
 * alte Sorge, ein Haar, das bei jedem Bild woanders steht, flackere. Ein
 * Feder-Daempfer springt nicht, er laeuft aus.
 *
 * @param tempo Geglaettete Eigenbewegung der Figur, 0 bis 1.
 * @param stossX Anstoss nach vorn (Umdrehen).
 * @param stossY Anstoss nach unten (Aufkommen).
 * @param pose Bestimmt die Luft.
 * @param sturzMass Fallfortschritt 0 bis 1; gibt zusaetzlichen Auftrieb.
 */
export function kettenschritt(
  kette: Glied[],
  tempo: number,
  stossX: number,
  stossY: number,
  pose: string,
  sturzMass = 0,
): void {
  const luft = luftVon(pose);
  // Der Ruhewinkel: die Pose, der Sturzfortschritt und das Tempo zusammen.
  const grad =
    luft.sturzWinkel === undefined
      ? luft.winkel
      : luft.winkel + (luft.sturzWinkel - luft.winkel) * sturzMass;
  const roh = grad - tempo * GRAD_JE_TEMPO;
  const winkel = ((Math.max(-WINKEL_MAX, Math.min(WINKEL_MAX, roh)) * Math.PI) / 180);
  // Wohin ein Glied in Ruhe zeigt. Senkrecht nach unten ist der Nullwinkel,
  // positiv dreht nach vorn.
  const richtX = Math.sin(winkel) * GLIED;
  const richtY = Math.cos(winkel) * GLIED;
  let vorX = 0;
  let vorY = 0;
  for (let i = 0; i < kette.length; i++) {
    const k = kette[i];
    const steif = STEIF[i] * luft.steif;
    const zielX = vorX + richtX;
    const zielY = vorY + richtY;
    k.vx += (zielX - k.x) * steif + stossX;
    k.vy += (zielY - k.y) * steif + SCHWERE + stossY;
    k.vx *= DAEMPF[i];
    k.vy *= DAEMPF[i];
    k.x += k.vx;
    k.y += k.vy;
    // Laengenzwang: Ein Glied ist ein Glied und kein Gummi.
    const dx = k.x - vorX;
    const dy = k.y - vorY;
    const l = Math.hypot(dx, dy) || 1;
    k.x = vorX + (dx / l) * GLIED;
    k.y = vorY + (dy / l) * GLIED;
    vorX = k.x;
    vorY = k.y;
  }
}

/** Eine Kette in Ruhelage: senkrecht herunter. */
export function ketteNeu(): Glied[] {
  return Array.from({ length: GLIEDER }, (_, i) => ({
    x: 0,
    y: GLIED * (i + 1),
    vx: 0,
    vy: 0,
  }));
}

/** Wieviele Schritte, bis eine frische Kette in ihrer Luft ausgependelt ist. */
const RUHE_SCHRITTE = 300;

const ruheTabelle = new Map<string, readonly (readonly [number, number])[]>();

/**
 * Die ausgependelte Kette einer Pose — fuer alles, was keine Figur hat.
 *
 * Die Weltkarte und die Profilauswahl zeichnen dieselbe Figur ohne Simulation
 * und ohne Gedaechtnis. Frueher stand dafuer eine von Hand abgeschriebene
 * Zahlenreihe im Zeichner; die war schon beim ersten Nachziehen falsch. Hier
 * laeuft dieselbe Physik einmal aus und wird gemerkt.
 */
export function ketteRuhe(pose: string): readonly (readonly [number, number])[] {
  const fertig = ruheTabelle.get(pose);
  if (fertig) return fertig;
  const kette = ketteNeu();
  for (let i = 0; i < RUHE_SCHRITTE; i++) kettenschritt(kette, 0, 0, 0, pose);
  const punkte = kette.map(
    (k) => [Number(k.x.toFixed(3)), Number(k.y.toFixed(3))] as [number, number],
  );
  ruheTabelle.set(pose, punkte);
  return punkte;
}
