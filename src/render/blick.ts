import type { Wusel } from '../core/types';

/**
 * In welche Richtung eine Figur **gezeichnet** wird.
 *
 * ## Warum das nicht einfach `w.dir` ist
 *
 * Weil `w.dir` zwanzig Mal je Sekunde kippen kann. Steht eine Figur in einem
 * Schacht, dessen Waende hoeher sind als `MAX_STEP`, dann laeuft sie bei jedem
 * Schritt gegen die eine Wand, dreht um, laeuft gegen die andere und dreht
 * wieder — und `stepWalking` kommt alle drei Ticks dran. Die Simulation ist
 * damit im Recht: Eine eingesperrte Figur laeuft auf und ab.
 *
 * Gezeichnet ist es eine Katastrophe. Das Blatt wird beim Richtungswechsel
 * gespiegelt, und seit die Figur auf allen vieren laeuft, springt dabei ein
 * dreizehn Pixel breiter Koerper von links nach rechts. Bei zwanzig Hertz ist
 * das kein Umdrehen mehr, das ist Flimmern — und in einer Grube voller Figuren
 * flimmert dann das halbe Bild.
 *
 * ## Was hier stattdessen entschieden wird
 *
 * **Gezeichnet wird die Richtung, in die sich die Figur zuletzt wirklich bewegt
 * hat.** Wer laeuft, aendert seine Stelle — dann folgt das Bild sofort. Wer nur
 * an Ort und Stelle umdreht, weil es links und rechts nicht weitergeht,
 * veraendert nichts, und dann bleibt auch das Bild stehen.
 *
 * Der Preis ist ein halber Schritt Verzoegerung an einer gewoehnlichen Wand:
 * Die Figur dreht sich erst, wenn sie den ersten Schritt zurueck getan hat, drei
 * Ticks spaeter. Das ist keine fuenfzigstel Sekunde und faellt nicht auf.
 *
 * ## Warum es hier steht und nicht in der Simulation
 *
 * Weil es **keine** Aussage ueber die Welt ist, sondern ueber das Bild. Die
 * Simulation muss deterministisch bleiben; sie darf von dieser Datei nichts
 * wissen. Hier liegt reiner Ansichtszustand, und er wird nach Figurennummer
 * gefuehrt, nicht nach Reihenfolge im Feld — die kann sich aendern.
 */
interface Blickstand {
  dir: -1 | 1;
  x: number;
  zustand: number;
}

const stand = new Map<number, Blickstand>();

/**
 * Die zu zeichnende Blickrichtung einer Figur.
 *
 * Aufrufen genau **einmal je Figur und Bild** — der Aufruf schreibt fort.
 */
export function blickrichtung(w: Wusel): -1 | 1 {
  const alt = stand.get(w.id);
  if (!alt) {
    stand.set(w.id, { dir: w.dir, x: w.x, zustand: w.state });
    return w.dir;
  }
  // Ein Ortswechsel oder ein Zustandswechsel ist eine echte Aussage ueber die
  // Richtung. Ein blosses Umdrehen auf der Stelle ist keine.
  if (w.x !== alt.x || w.state !== alt.zustand) alt.dir = w.dir;
  alt.x = w.x;
  alt.zustand = w.state;
  return alt.dir;
}

/**
 * Vergessen, was zu keiner Figur mehr gehoert.
 *
 * Ohne das waechst die Tabelle ueber ein langes Spiel mit jeder Figur jedes
 * Levels weiter. Aufgerufen wird sie beim Levelwechsel, nicht je Bild.
 */
export function blickVergessen(): void {
  stand.clear();
}
