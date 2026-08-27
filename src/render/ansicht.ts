import { FALL_DEATH_PX, SCHREI_AB } from '../core/constants';
import type { Wusel } from '../core/types';
import { TEMPO_GLATT, type Glied, ketteNeu, kettenschritt } from './haarkette';

/**
 * Was von einer Figur **gezeichnet** wird — Blickrichtung, Pose und deren Takt.
 *
 * ## Warum das nicht einfach der Simulationszustand ist
 *
 * Weil die Simulation an manchen Stellen zwanzig Mal je Sekunde die Meinung
 * aendert, und zwar voellig zu Recht. Zwei Faelle sind aufgetreten, beide im
 * Schacht, beide im Bild eine Katastrophe:
 *
 * **Die Richtung.** Steht eine Figur zwischen zwei Waenden, die hoeher sind als
 * `MAX_STEP`, laeuft sie gegen die eine, dreht um, laeuft gegen die andere und
 * dreht wieder — und `stepWalking` kommt alle drei Ticks dran. Gezeichnet
 * springt dabei ein dreizehn Pixel breiter waagerechter Koerper von links nach
 * rechts.
 *
 * **Die Pose.** Ein Graeber raeumt alle sieben Ticks eine Zeile. Wer darueber
 * steht, verliert den Boden, faellt einen Pixel, landet, laeuft, verliert den
 * Boden. `walking` und `falling` wechseln sich damit rund fuenfzehn Mal je
 * Sekunde ab — und seit die eine Pose waagerecht auf vier Beinen und die andere
 * aufrecht ist, ist das kein Uebergang mehr, sondern ein Zucken.
 *
 * ## Die drei Regeln
 *
 * 1. **Gezeichnet wird die Richtung, in die sich die Figur zuletzt wirklich
 *    bewegt hat.** Wer laeuft, aendert seine Stelle — dann folgt das Bild
 *    sofort. Wer nur auf der Stelle umdreht, aendert nichts.
 * 2. **Ein Fall unter `FALL_ZEIGEN` Pixeln ist kein Fall**, sondern ein
 *    Absacken. Die vorige Pose bleibt stehen.
 * 3. **Wer laufen will und seit `SPAEH_RUHE` Bildern nicht ueber `SPAEH_SPANNE`
 *    Pixel hinauskommt, spaeht.** Er steht auf, nimmt die Pfoten vor die Brust
 *    und sichert — die Pose, wegen der diese Figur gewaehlt wurde. Das ersetzt
 *    das Zappeln durch eine Aussage, die stimmt: Dieser hier kommt nicht weiter.
 *    Und es passt: Aufrecht ist die Figur knapp sechs Pixel breit, auf allen
 *    vieren fuenfzehn — in einen Schacht passt nur die eine von beiden.
 *
 * ## Warum es hier steht und nicht in der Simulation
 *
 * Weil es **keine** Aussage ueber die Welt ist, sondern ueber das Bild. Die
 * Simulation muss deterministisch bleiben; sie darf von dieser Datei nichts
 * wissen. Hier liegt reiner Ansichtszustand, und er wird nach Figurennummer
 * gefuehrt, nicht nach Reihenfolge im Feld — die kann sich aendern.
 */

/**
 * Ab wie vielen Pixeln Fallhoehe die Fallpose gezeigt wird.
 *
 * Drei. Ein Pixel ist das, was ein Graeber unter einem wegnimmt, zwei ist eine
 * Bodenwelle. Erst darueber faellt jemand.
 */
const FALL_ZEIGEN = 3;

/**
 * Nach wie vielen Bildern ohne Fortkommen eine laufende Figur spaeht.
 *
 * Eine gute halbe Sekunde. Kuerzer, und jeder gewoehnliche Wandkontakt liesse
 * sie kurz aufstehen; laenger, und in einer Grube zappelt sie erst eine Weile.
 */
const SPAEH_RUHE = 34;

/**
 * Wie weit sie sich dabei bewegen darf, in logischen Pixeln.
 *
 * Nicht null. „Gar nicht von der Stelle" war die erste Fassung, und im Schacht
 * eines Graebers greift sie nicht: Der ist drei Pixel breit, die Figur pendelt
 * darin hin und her, und der Zaehler faellt bei jedem Schritt zurueck. Sie
 * bewegt sich — sie kommt nur nicht **weg**. Drei Pixel sind die Breite eines
 * Grabschachts und damit die Grenze zwischen Pendeln und Gehen.
 */
const SPAEH_SPANNE = 3;

/**
 * Ab wie vielen Fallpixeln das Haar beim Aufkommen nachschlaegt.
 *
 * Dieselbe Schwelle wie fuer die Fallpose: Was nicht als Fall gezeigt wird, ist
 * auch kein Aufprall. Ein Graeber nimmt unter einer Figur einen Pixel weg —
 * daraus darf kein Peitschen werden, sonst zappelt das ganze Feld.
 */
const PRALL_AB = FALL_ZEIGEN;

/** Fallhoehe, ab der der Nachschlag seine volle Staerke hat. */
const PRALL_VOLL = 40;

/**
 * Der Ausschlag eines Anstosses ueber die Zeit — ein gedaempfter Schwinger.
 *
 * Nicht ein blosses Abklingen, sondern eine halbe Schwingung und zurueck: Beim
 * Aufkommen faellt das Haar erst nach unten durch, dann federt es darueber
 * hinaus und pendelt sich ein. Ein reines Abklingen sieht aus, als zoege
 * jemand daran; erst der Vorzeichenwechsel macht daraus Traegheit.
 *
 * Die Zahlen: Der Sinus erreicht sein Maximum nach knapp drei Bildern, kreuzt
 * nach sechs die Null und ist nach rund zwanzig unter einem Hundertstel — bei
 * sechzig Bildern je Sekunde also ein Drittel einer Sekunde.
 */
function schwinger(takt: number): number {
  return Math.sin(takt * 0.55) * Math.exp(-takt * 0.16);
}

/** Unter diesem Ausschlag ist ein Anstoss vorbei. */
const SCHWUNG_AUS = 0.01;

/** Die Pose, die kein Simulationszustand ist. */
export const SPAEHEN = 'spaehen';

/**
 * Die Haarkette liegt in `haarkette.ts` — hier haengt nur ihr Gedaechtnis.
 *
 * Die Trennung hat einen Grund: Die Weltkarte und die Profilauswahl brauchen
 * dieselbe Frisur, haben aber keine Figur und keine Uhr. Sie holen sich mit
 * `ketteRuhe` die ausgependelte Kette derselben Physik, statt eine
 * abgeschriebene Zahlenreihe zu fuehren.
 */

interface Stand {
  dir: -1 | 1;
  x: number;
  zustand: number;
  pose: string;
  /** Eigener Takt fuer Posen, die nicht die der Simulation sind. */
  takt: number;
  /**
   * Ob dieser Posenlauf am eigenen Takt haengt.
   *
   * **Der Punkt, an dem die erste Fassung gescheitert ist.** Sie hat je Bild
   * entschieden: „zeigt der Zeichner gerade die Pose der Simulation? dann
   * `w.timer`, sonst der eigene." Im Schacht wechselt die Simulation staendig
   * zwischen Laufen und Fallen — und damit wechselte auch die Uhr, Bild fuer
   * Bild, zwischen zwei voellig verschiedenen Zahlen: 176, 1, 3, 5, 180, 1,
   * 182, 0. Der Bildindex sprang dadurch jedes Bild an eine andere Stelle des
   * Gangzyklus. Das war das Flackern, das nach zwei Behebungen uebrig blieb.
   *
   * Entschieden wird deshalb **je Posenlauf**, nicht je Bild: Wer einmal auf den
   * eigenen Takt gewechselt ist, bleibt darauf, bis die Pose wechselt.
   */
  eigen: boolean;
  /** Bildstempel des letzten Fortschreibens. */
  stempel: number;
  /** Das Ergebnis dieses Bildes, fuer den zweiten Aufruf. */
  letzte: Ansicht;
  /** Bilder ohne Fortkommen. */
  still: number;
  /** Die Spanne, in der sie sich dabei bewegt hat. */
  von: number;
  bis: number;
  /**
   * Die zuletzt gesehene Fallhoehe, solange sie groesser als null war.
   *
   * Gebraucht wird sie **nach** dem Aufkommen, und dort ist sie schon weg:
   * Die Simulation setzt `fallDist` in demselben Tick auf null, in dem der
   * Zustand das Fallen verlaesst. Wer den Aufprall bemessen will, muss sich
   * die Zahl vorher gemerkt haben.
   */
  sturz: number;
  /** Staerke und Alter des Aufprall-Nachschlags. */
  prallStaerke: number;
  prallTakt: number;
  /** Staerke und Alter des Ausschlags beim Umdrehen. */
  wendeStaerke: number;
  wendeTakt: number;
  /**
   * Die Haarkette — drei Massepunkte, die dem Kopf nachlaufen.
   *
   * Sie steht hier und nicht im Zeichner, weil sie ein GEDAECHTNIS hat: Haar,
   * das nachschwingt, muss wissen, wo es im letzten Bild war. Der Zeichner
   * kennt nur das aktuelle Bild.
   *
   * Und sie steht hier und nicht in der Simulation, weil sie dort nichts zu
   * suchen hat: Sie beeinflusst kein Ergebnis, nur das Aussehen. Der
   * Zeitruecklauf springt deshalb sauber — beim Levelwechsel leert
   * `ansichtVergessen` die Tabelle, und eine zurueckgedrehte Figur baut ihre
   * Kette in wenigen Bildern neu auf, statt eine falsche Vergangenheit
   * mitzuschleppen.
   *
   * Gerechnet wird in FIGURENKOORDINATEN mit dem Haaransatz als Ursprung:
   * x zeigt nach vorn (in Blickrichtung), y nach unten, Einheit logischer
   * Pixel. Damit ist die Kette von der Spiegelung unabhaengig — eine Figur,
   * die nach links laeuft, bekommt dieselben Zahlen wie eine nach rechts.
   */
  kette: Glied[];
  /**
   * Das geglaettete Tempo der Figur, 0 bis 1.
   *
   * Roh ist die Bewegung ein Stakkato: Beim Gehen kommt die Figur nur in jedem
   * dritten Bild einen Pixel weiter (WALK_INTERVAL 3), beim Fallen in jedem.
   * Wer diesen Nullen-und-Einsen-Takt direkt in die Kette gibt, treibt sie mit
   * zwanzig Stoessen in der Sekunde an, und das Haar zappelt statt zu wehen.
   * Geglaettet wird mit einem einfachen Tiefpass; die Zeitkonstante ist so
   * gewaehlt, dass ein Gangzyklus von zehn Ticks knapp zwei Zeitkonstanten
   * ausmacht — das Haar steht also am Ende eines Zyklus, nicht erst nach
   * dreien.
   */
  tempo: number;
}

const stand = new Map<number, Stand>();

export interface Ansicht {
  dir: -1 | 1;
  pose: string;
  /**
   * Der Nachschlag beim Aufkommen, positiv nach unten, danach ueberschwingend.
   *
   * Null, solange nichts aufkommt. Der Zeichner legt ihn auf den Nachlauf des
   * Haares — die Figur steht mit einem Schlag still, das Haar noch nicht.
   */
  prall: number;
  /**
   * Der Ausschlag beim Umdrehen, positiv nach **vorn** im Figurenkoordinaten-
   * system (also in Blickrichtung).
   *
   * Das Vorzeichen braucht keine Richtung: Was vor der Wende hinter der Figur
   * hing, liegt danach vor ihr — der Koerper hat sich gedreht, das Haar steht
   * noch im Raum. Deshalb schwingt es immer nach vorn und pendelt zurueck.
   */
  wende: number;
  /**
   * Die Haarkette, je Glied ein Punkt in logischen Pixeln vom Haaransatz aus.
   *
   * x zeigt nach vorn in Blickrichtung, y nach unten. Der Zeichner setzt sie
   * an die gebackene Wurzel und braucht nichts weiter zu wissen.
   */
  kette: readonly (readonly [number, number])[];
  /**
   * Der Takt, aus dem der Bildindex faellt.
   *
   * Solange die gezeichnete Pose die der Simulation ist, bleibt es `w.timer` —
   * daran haengt die Zusage, dass Bild eins das Wirkungsbild ist. Nur wenn der
   * Zeichner eine **andere** Pose einsetzt, laeuft ein eigener Takt: Sonst
   * bliebe die Bewegung stehen, denn `setState` setzt `w.timer` bei jedem
   * Zustandswechsel auf null — und genau die wechseln im Schacht staendig.
   */
  takt: number;
}

/**
 * Blickrichtung, Pose und Takt einer Figur.
 *
 * Aufrufen genau **einmal je Figur und Bild** — der Aufruf schreibt fort.
 *
 * @param sim Die Pose, die sich aus dem Simulationszustand ergibt.
 * @param kannSpaehen Ob das Blatt die Spaehpose ueberhaupt kennt.
 */
export function ansicht(w: Wusel, sim: string, kannSpaehen = false, bild = 0): Ansicht {
  const alt = stand.get(w.id);
  if (!alt) {
    const kette = ketteNeu();
    const erste: Ansicht = {
      dir: w.dir, pose: sim, takt: w.timer, prall: 0, wende: 0,
      kette: kette.map((k) => [k.x, k.y] as [number, number]),
    };
    stand.set(w.id, {
      dir: w.dir, x: w.x, zustand: w.state, pose: sim,
      takt: 0, still: 0, von: w.x, bis: w.x,
      eigen: false, stempel: bild, letzte: erste,
      sturz: 0, prallStaerke: 0, prallTakt: 0, wendeStaerke: 0, wendeTakt: 0,
      kette, tempo: 0,
    });
    return erste;
  }
  // Zweimal im selben Bild: Die Lupe zeichnet die Szene ein zweites Mal. Ohne
  // diesen Riegel liefe jeder Zaehler doppelt so schnell, sobald jemand zielt.
  if (bild === alt.stempel) return alt.letzte;
  alt.stempel = bild;

  const bewegt = w.x !== alt.x;
  const vorherDir = alt.dir;
  if (bewegt || w.state !== alt.zustand) alt.dir = w.dir;
  alt.x = w.x;
  alt.zustand = w.state;

  // Umgedreht — und zwar wirklich, nicht nur in der Absicht.
  //
  // Geprueft wird die GEZEICHNETE Richtung, nicht `w.dir`. Zwischen zwei
  // Waenden dreht die Simulation alle drei Ticks um; die Zeile darueber faengt
  // das bereits ab, und ohne sie stuende das Haar bei so einer Figur dauerhaft
  // waagerecht in der Luft.
  if (alt.dir !== vorherDir) {
    alt.wendeStaerke = 1;
    alt.wendeTakt = 0;
  } else if (alt.wendeStaerke > 0) {
    alt.wendeTakt++;
    if (Math.abs(schwinger(alt.wendeTakt)) < SCHWUNG_AUS) alt.wendeStaerke = 0;
  }

  // Erst die Fallregel, dann der Stillstand — in dieser Reihenfolge.
  //
  // Andersherum sah es zuerst aus, und es hat nicht funktioniert: Im Schacht
  // eines Graebers wechselt der Zustand alle paar Ticks nach `FALLING`, und
  // jeder dieser Ticks setzte den Stillstandszaehler zurueck. Die Figuren kamen
  // nie ueber ein paar Bilder hinaus und haben nie gespaeht — dabei waren sie
  // genau die, die es gebraucht haetten. Gezaehlt wird deshalb, was **gezeichnet
  // wuerde**, nicht was die Simulation gerade meint.
  let basis = sim;
  if (sim === 'falling' && w.fallDist < FALL_ZEIGEN) {
    // Absacken, kein Fall: Die vorige Pose bleibt — es sei denn, es gab noch
    // keine, dann ist der Fall der Anfang (die Figur kommt aus der Luke).
    basis = alt.pose === 'falling' || alt.pose === sim ? sim : alt.pose;
  }
  // Spaehen zaehlt als Laufen. Es **ist** das Laufen, nur ohne Fortkommen —
  // und ohne diese Zeile bricht der Zaehler beim ersten Absacken zusammen und
  // die Figur faellt fuer ein Bild in den Gang zurueck, bevor sie wieder
  // aufsteht: dasselbe Zucken, nur seltener.
  const laeuft = basis === 'walking' || basis === SPAEHEN;
  alt.von = Math.min(alt.von, w.x);
  alt.bis = Math.max(alt.bis, w.x);
  if (!laeuft || alt.bis - alt.von > SPAEH_SPANNE) {
    alt.still = 0;
    alt.von = w.x;
    alt.bis = w.x;
  } else {
    alt.still++;
  }

  let pose = basis;
  if (laeuft && kannSpaehen && alt.still >= SPAEH_RUHE) pose = SPAEHEN;

  // Aufgekommen: Bis eben wurde ein Fall gezeichnet, jetzt nicht mehr.
  //
  // Am gezeichneten Fall festgemacht und nicht am Zustand — die Regel oben
  // laesst ein Absacken unter drei Pixeln gar nicht erst als Fall durch, und
  // genau diese Faelle sollen auch nicht peitschen.
  if (alt.pose === 'falling' && pose !== 'falling' && alt.sturz >= PRALL_AB) {
    alt.prallStaerke = Math.min(1, alt.sturz / PRALL_VOLL);
    alt.prallTakt = 0;
  } else if (alt.prallStaerke > 0) {
    alt.prallTakt++;
    if (Math.abs(schwinger(alt.prallTakt)) < SCHWUNG_AUS) alt.prallStaerke = 0;
  }
  // Erst danach merken: Sonst steht beim Aufkommen schon die Null da.
  if (w.fallDist > 0) alt.sturz = w.fallDist;

  if (pose !== alt.pose) {
    alt.pose = pose;
    alt.takt = 0;
    alt.eigen = pose !== sim;
  } else {
    alt.takt++;
    if (pose !== sim) alt.eigen = true;
  }
  // Die Kette einen Schritt weiter.
  //
  // Getrieben wird sie von dem, was die Figur TUT, nicht von dem, was das
  // Blatt zeigt. Das ist der Unterschied, an dem der einfachere Entwurf
  // gescheitert waere: Beim Klettern steht der Kopfrahmen im Blatt dreizehn
  // Bilder lang voellig still, und eine Kette, die ihren Antrieb aus der
  // Wurzelbewegung zoege, hinge dort starr wie ein Brett.
  //
  // `bewegt` ist wahr, wenn die Figur in diesem Bild einen Pixel weiter
  // gekommen ist. Beim Gehen geschieht das alle drei Ticks, beim Fallen
  // jeden — daraus faellt das Tempo von selbst richtig heraus.
  alt.tempo += ((bewegt ? 1 : 0) - alt.tempo) * TEMPO_GLATT;
  const tempo = alt.tempo;
  const prall = alt.prallStaerke > 0 ? alt.prallStaerke * schwinger(alt.prallTakt) : 0;
  const wende = alt.wendeStaerke > 0 ? alt.wendeStaerke * schwinger(alt.wendeTakt) : 0;
  // Wie tief der Sturz schon geht, null bis eins. Dieselben Marken wie beim
  // Ton: bei SCHREI_AB faengt die Figur an zu schreien, bei FALL_DEATH_PX ist
  // es vorbei. Auge und Ohr sagen damit dasselbe.
  const sturzMass =
    pose === 'falling'
      ? Math.min(1, Math.max(0, (w.fallDist - SCHREI_AB) / (FALL_DEATH_PX - SCHREI_AB)))
      : 0;
  // Aufkommen und Umdrehen sind keine Sonderfaelle mehr, sondern Anstoesse in
  // dieselbe Kette: einer nach unten, einer nach vorn. Die Pose steuert nicht
  // mehr einen Versatz bei, sondern die Luft, in der die Kette haengt.
  kettenschritt(alt.kette, tempo, wende * 0.5, prall * 0.6, pose, sturzMass);

  alt.letzte = {
    dir: alt.dir,
    pose,
    takt: alt.eigen ? alt.takt : w.timer,
    prall,
    wende,
    kette: alt.kette.map((k) => [Number(k.x.toFixed(3)), Number(k.y.toFixed(3))] as [number, number]),
  };
  return alt.letzte;
}

/**
 * Vergessen, was zu keiner Figur mehr gehoert.
 *
 * Ohne das waechst die Tabelle ueber ein langes Spiel mit jeder Figur jedes
 * Levels weiter. Aufgerufen wird sie beim Levelwechsel, nicht je Bild.
 */
export function ansichtVergessen(): void {
  stand.clear();
}
