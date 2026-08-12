import type { Wusel } from '../core/types';

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

/** Die Pose, die kein Simulationszustand ist. */
export const SPAEHEN = 'spaehen';

interface Stand {
  dir: -1 | 1;
  x: number;
  zustand: number;
  pose: string;
  /** Eigener Takt fuer Posen, die nicht die der Simulation sind. */
  takt: number;
  /** Bilder ohne Fortkommen. */
  still: number;
  /** Die Spanne, in der sie sich dabei bewegt hat. */
  von: number;
  bis: number;
}

const stand = new Map<number, Stand>();

export interface Ansicht {
  dir: -1 | 1;
  pose: string;
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
export function ansicht(w: Wusel, sim: string, kannSpaehen = false): Ansicht {
  const alt = stand.get(w.id);
  if (!alt) {
    const neu: Stand = {
      dir: w.dir, x: w.x, zustand: w.state, pose: sim,
      takt: 0, still: 0, von: w.x, bis: w.x,
    };
    stand.set(w.id, neu);
    return { dir: neu.dir, pose: sim, takt: w.timer };
  }

  const bewegt = w.x !== alt.x;
  if (bewegt || w.state !== alt.zustand) alt.dir = w.dir;
  alt.x = w.x;
  alt.zustand = w.state;

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

  if (pose !== alt.pose) {
    alt.pose = pose;
    alt.takt = 0;
  } else {
    alt.takt++;
  }
  return { dir: alt.dir, pose, takt: pose === sim ? w.timer : alt.takt };
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
