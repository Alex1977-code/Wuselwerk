import { describe, expect, it } from 'vitest';
import { State, type Wusel } from '../src/core/types';
import { SPAEHEN, ansicht as rohAnsicht, ansichtVergessen } from '../src/render/ansicht';

/**
 * Ein Aufruf je Bild, mit fortlaufendem Bildstempel.
 *
 * Den braucht `ansicht` wirklich: Die Lupe zeichnet die Szene ein zweites Mal,
 * und ohne Stempel liefe jeder Zaehler doppelt so schnell, sobald jemand zielt.
 */
let bild = 0;
const ansicht = (w: Wusel, sim: string, kannSpaehen = false) =>
  rohAnsicht(w, sim, kannSpaehen, ++bild);

function figur(over: Partial<Wusel> = {}): Wusel {
  return { id: 1, x: 10, y: 20, dir: 1, state: State.WALKING, timer: 0, fallDist: 0, ...over } as Wusel;
}

/**
 * Die drei Fälle, für die es diese Datei gibt — alle drei im Schacht, alle drei
 * im Bild eine Katastrophe, alle drei in der Simulation völlig korrekt.
 */
describe('Die gezeichnete Ansicht', () => {
  it('gibt im selben Bild zweimal dieselbe Antwort', () => {
    // Die Lupe zeichnet die Szene ein zweites Mal — mit demselben Bildstempel
    // darf das nichts fortschreiben.
    ansichtVergessen();
    const w = figur();
    rohAnsicht(w, 'walking', true, 7);
    const a = rohAnsicht(w, 'walking', true, 8);
    const b = rohAnsicht(w, 'walking', true, 8);
    expect(b).toEqual(a);
  });

  /**
   * Der Fehler, der nach zwei Behebungen uebrig blieb. Im Schacht wechselt die
   * Simulation staendig zwischen Laufen und Fallen. Wer je Bild entscheidet,
   * welche Uhr gilt, springt zwischen `w.timer` (gross) und dem eigenen Zaehler
   * (klein) hin und her — der Bildindex landet jedes Bild an einer anderen
   * Stelle des Gangzyklus, und genau das sieht man als Flackern.
   */
  it('hält die Uhr fest, solange die Pose läuft', () => {
    ansichtVergessen();
    const w = figur({ timer: 200 });
    ansicht(w, 'walking');
    const takte: number[] = [];
    for (let i = 0; i < 20; i++) {
      if (i % 3 === 2) {
        w.state = State.FALLING;
        w.fallDist = 1;
        w.timer = 0;
        takte.push(ansicht(w, 'falling').takt);
      } else {
        w.state = State.WALKING;
        w.fallDist = 0;
        w.timer += 40;
        takte.push(ansicht(w, 'walking').takt);
      }
    }
    // Genau **ein** Sprung zurueck ist erlaubt: der Wechsel von der Uhr der
    // Simulation auf die eigene, wenn das erste Absacken kommt. Danach laeuft
    // sie durch. Vorher waren es neunzehn — je Bild einer.
    const spruenge = takte.filter((t, i) => i > 0 && t <= takte[i - 1]).length;
    expect(spruenge, `Takte: ${takte.join(' ')}`).toBeLessThanOrEqual(1);
  });

  it('hält die Blickrichtung, wenn sich die Figur nicht von der Stelle rührt', () => {
    ansichtVergessen();
    const w = figur();
    expect(ansicht(w, 'walking').dir).toBe(1);
    // Zwanzig Umdrehungen auf der Stelle — genau der Schacht.
    for (let i = 0; i < 20; i++) {
      w.dir = (-w.dir) as -1 | 1;
      expect(ansicht(w, 'walking').dir, `nach ${i + 1} Umdrehungen`).toBe(1);
    }
  });

  it('folgt der Richtung, sobald die Figur einen Schritt getan hat', () => {
    ansichtVergessen();
    const w = figur();
    ansicht(w, 'walking');
    w.dir = -1;
    expect(ansicht(w, 'walking').dir).toBe(1);
    w.x -= 1;
    expect(ansicht(w, 'walking').dir).toBe(-1);
  });

  /**
   * Ein Gräber räumt alle sieben Ticks eine Zeile. Wer darüber steht, verliert
   * den Boden, fällt **einen** Pixel, landet, läuft, verliert den Boden. Ohne
   * diese Regel wechselt die Pose fünfzehn Mal je Sekunde zwischen waagerecht
   * auf vier Beinen und aufrecht.
   */
  it('zeigt ein Absacken um einen Pixel nicht als Fall', () => {
    ansichtVergessen();
    const w = figur();
    expect(ansicht(w, 'walking').pose).toBe('walking');
    for (let i = 0; i < 10; i++) {
      w.state = State.FALLING;
      w.fallDist = 1;
      expect(ansicht(w, 'falling').pose, `Absacken ${i}`).toBe('walking');
      w.state = State.WALKING;
      w.fallDist = 0;
      w.y += 1;
      expect(ansicht(w, 'walking').pose).toBe('walking');
    }
  });

  it('zeigt einen echten Fall als Fall', () => {
    ansichtVergessen();
    const w = figur();
    ansicht(w, 'walking');
    w.state = State.FALLING;
    for (const d of [1, 2]) {
      w.fallDist = d;
      expect(ansicht(w, 'falling').pose, `${d}px`).toBe('walking');
    }
    w.fallDist = 3;
    expect(ansicht(w, 'falling').pose).toBe('falling');
  });

  it('lässt spähen, wer laufen will und nicht von der Stelle kommt', () => {
    ansichtVergessen();
    const w = figur();
    let pose = '';
    for (let i = 0; i < 40; i++) {
      // Umdrehen auf der Stelle, wie in der Grube.
      w.dir = (-w.dir) as -1 | 1;
      pose = ansicht(w, 'walking', true).pose;
    }
    expect(pose).toBe(SPAEHEN);
    // Ein Schritt aus der Spanne heraus beendet es.
    w.x += 4;
    expect(ansicht(w, 'walking', true).pose).toBe('walking');
  });

  /**
   * Der Fall, an dem die erste Fassung gescheitert ist. Im Schacht eines
   * Gräbers wechselt der Zustand alle paar Ticks nach `FALLING`; wer den
   * Stillstand am Simulationszustand zählt, fängt bei jedem dieser Ticks von
   * vorn an — und genau die Figuren, die spähen sollten, taten es nie.
   */
  it('späht auch, wenn die Simulation zwischendurch fallen lässt', () => {
    ansichtVergessen();
    const w = figur();
    let pose = '';
    for (let i = 0; i < 60; i++) {
      // Alle sieben Bilder sackt der Boden weg, wie unter einem Gräber.
      if (i % 7 === 6) {
        w.state = State.FALLING;
        w.fallDist = 1;
        pose = ansicht(w, 'falling', true).pose;
        w.y += 1;
      } else {
        w.state = State.WALKING;
        w.fallDist = 0;
        pose = ansicht(w, 'walking', true).pose;
      }
    }
    expect(pose).toBe(SPAEHEN);
  });

  /**
   * Ein Grabschacht ist drei Pixel breit, und die Figur pendelt darin hin und
   * her. „Gar nicht von der Stelle" greift dort nicht — sie bewegt sich, sie
   * kommt nur nicht weg.
   */
  it('späht auch, wer im Schacht hin und her pendelt', () => {
    ansichtVergessen();
    const w = figur({ x: 20 });
    let pose = '';
    for (let i = 0; i < 60; i++) {
      w.x = 20 + (i % 3);
      pose = ansicht(w, 'walking', true).pose;
    }
    expect(pose).toBe(SPAEHEN);
  });

  it('späht nicht, wer normal weiterläuft', () => {
    ansichtVergessen();
    const w = figur({ x: 0 });
    let pose = '';
    for (let i = 0; i < 200; i++) {
      if (i % 3 === 0) w.x += 1;
      pose = ansicht(w, 'walking', true).pose;
    }
    expect(pose).toBe('walking');
  });

  it('späht nicht, wenn das Blatt die Pose nicht kennt', () => {
    ansichtVergessen();
    const w = figur();
    let pose = '';
    for (let i = 0; i < 60; i++) pose = ansicht(w, 'walking', false).pose;
    expect(pose).toBe('walking');
  });

  /**
   * Solange der Zeichner die Pose der Simulation zeigt, muss der Bildindex aus
   * `w.timer` fallen — daran hängt die Zusage, dass Bild eins das Wirkungsbild
   * ist. Nur bei einer *ersetzten* Pose läuft ein eigener Takt, sonst bliebe die
   * Bewegung stehen: `setState` setzt `w.timer` bei jedem Wechsel auf null.
   */
  it('nimmt den Takt der Simulation, solange die Pose ihre ist', () => {
    ansichtVergessen();
    const w = figur({ timer: 17 });
    expect(ansicht(w, 'digging').takt).toBe(17);
  });

  it('führt einen eigenen Takt, wenn es eine andere Pose zeigt', () => {
    ansichtVergessen();
    const w = figur();
    for (let i = 0; i < 40; i++) ansicht(w, 'walking', true);
    const a = ansicht(w, 'walking', true);
    const b = ansicht(w, 'walking', true);
    expect(a.pose).toBe(SPAEHEN);
    expect(b.takt).toBe(a.takt + 1);
  });

  it('hält die Figuren auseinander und vergisst beim Levelwechsel', () => {
    ansichtVergessen();
    const a = figur({ id: 1, dir: 1 });
    const b = figur({ id: 2, dir: -1 });
    expect(ansicht(a, 'walking').dir).toBe(1);
    expect(ansicht(b, 'walking').dir).toBe(-1);
    a.dir = -1;
    expect(ansicht(a, 'walking').dir).toBe(1);
    ansichtVergessen();
    expect(ansicht(figur({ dir: -1 }), 'walking').dir).toBe(-1);
  });
});
