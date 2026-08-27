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

/**
 * Zwei Anstoesse, die dem Haar Traegheit geben.
 *
 * Beide sind reiner Ansichtszustand: Die Simulation weiss von ihnen nichts und
 * darf es nicht — sie muss deterministisch bleiben. Gefuehrt werden sie hier,
 * weil hier ohnehin je Figurennummer gemerkt wird, was im vorigen Bild war.
 */
describe('Die Anstoesse des Haares', () => {
  /** Einen Sturz aus `hoehe` Pixeln fliegen und aufkommen lassen. */
  function sturzUndLandung(hoehe: number) {
    ansichtVergessen();
    const w = figur({ state: State.FALLING });
    for (let i = 1; i <= hoehe; i++) {
      w.fallDist = i;
      ansicht(w, 'falling');
    }
    w.state = State.WALKING;
    w.fallDist = 0;
    return ansicht(w, 'walking');
  }

  it('gibt im Ruhezustand keinen Ausschlag', () => {
    ansichtVergessen();
    const a = ansicht(figur(), 'walking');
    expect(a.prall).toBe(0);
    expect(a.wende).toBe(0);
  });

  /**
   * Beim Aufkommen faellt das Haar zuerst NACH UNTEN durch — der Koerper steht
   * mit einem Schlag still, das Haar noch nicht. Positiv ist unten.
   */
  it('schlaegt beim Aufkommen nach unten nach', () => {
    const gelandet = sturzUndLandung(30);
    // Das erste Bild nach der Landung startet den Schwinger bei null.
    expect(gelandet.prall).toBe(0);
    const w = figur();
    const zweites = ansicht(w, 'walking');
    expect(zweites.prall, 'kein Nachschlag nach unten').toBeGreaterThan(0);
  });

  it('schwingt danach ueber die Ruhelage hinaus zurueck', () => {
    sturzUndLandung(40);
    const w = figur();
    const werte: number[] = [];
    for (let i = 0; i < 12; i++) werte.push(ansicht(w, 'walking').prall);
    expect(Math.max(...werte), 'kein Ausschlag nach unten').toBeGreaterThan(0.2);
    expect(Math.min(...werte), 'kein Ueberschwingen nach oben').toBeLessThan(0);
  });

  it('klingt aus und laesst nichts stehen', () => {
    sturzUndLandung(40);
    const w = figur();
    for (let i = 0; i < 40; i++) ansicht(w, 'walking');
    expect(ansicht(w, 'walking').prall).toBe(0);
  });

  /**
   * Ein Graeber nimmt unter einer Figur einen Pixel weg. Daraus darf kein
   * Peitschen werden — sonst zappelt ueber jedem Grabschacht das ganze Feld.
   */
  it('laesst ein Absacken unbeachtet', () => {
    ansichtVergessen();
    const w = figur();
    ansicht(w, 'walking');
    w.state = State.FALLING;
    w.fallDist = 1;
    ansicht(w, 'falling');
    w.fallDist = 2;
    ansicht(w, 'falling');
    w.state = State.WALKING;
    w.fallDist = 0;
    ansicht(w, 'walking');
    expect(ansicht(w, 'walking').prall).toBe(0);
  });

  it('schlaegt aus einem hohen Sturz staerker nach als aus einem niedrigen', () => {
    const gipfel = (hoehe: number) => {
      sturzUndLandung(hoehe);
      const w = figur();
      let max = 0;
      for (let i = 0; i < 12; i++) max = Math.max(max, ansicht(w, 'walking').prall);
      return max;
    };
    expect(gipfel(40)).toBeGreaterThan(gipfel(6) * 1.5);
  });

  /**
   * Was vor der Wende hinter der Figur hing, liegt danach vor ihr — der
   * Koerper hat sich gedreht, das Haar steht noch im Raum. Deshalb ist der
   * Ausschlag immer nach vorn, ohne Vorzeichen aus der Richtung.
   */
  it('schwingt beim Umdrehen nach vorn', () => {
    ansichtVergessen();
    const w = figur({ x: 10, dir: 1 });
    ansicht(w, 'walking');
    w.x = 11;
    ansicht(w, 'walking');
    w.x = 12;
    w.dir = -1;
    const wende = ansicht(w, 'walking');
    expect(wende.dir, 'Richtung nicht uebernommen').toBe(-1);
    expect(wende.wende).toBe(0);
    w.x = 11;
    expect(ansicht(w, 'walking').wende, 'kein Ausschlag').toBeGreaterThan(0);
  });

  /**
   * Zwischen zwei Waenden dreht die Simulation alle drei Ticks um. Die
   * Ansichtsregel faengt das ab, indem sie die gezeichnete Richtung nur bei
   * echter Bewegung nachfuehrt — und damit darf auch das Haar nicht ausschlagen.
   */
  it('schlaegt nicht aus, wenn die Figur nur auf der Stelle umdreht', () => {
    ansichtVergessen();
    const w = figur({ x: 10, dir: 1 });
    ansicht(w, 'walking');
    for (let i = 0; i < 6; i++) {
      w.dir = i % 2 === 0 ? -1 : 1;
      const a = ansicht(w, 'walking');
      expect(a.wende, `Bild ${i} schlaegt aus`).toBe(0);
    }
  });
});

/**
 * Die Haarkette — die Physik, die seit dem 26.08.2026 an die Stelle der
 * Versatztabelle getreten ist.
 *
 * Der Umbau kam aus einer Recherche mit einem unerwarteten Befund: Celestes
 * Madeline ist acht mal elf Bildpunkte gross — kleiner als diese Figur — und
 * hat echtes nachlaufendes Haar. Simuliert wird dort keine Straehne, sondern
 * eine Masse. Spines Haar-Beispiel nimmt zwei Knochen je Strang, Live2Ds
 * Beispielfigur zwei Partikel je Gruppe. Drei Glieder sind hier nicht
 * Sparsamkeit, sondern das Maximum, das eine Figur von 12,3 logischen Pixeln
 * bei einer Lesegrenze von 0,9 ueberhaupt aufloest.
 *
 * Was diese Pruefungen festhalten, ist das, was eine Tabelle NICHT kann.
 */
describe('Die Haarkette', () => {
  const wusel = (id: number, x: number, dir: -1 | 1 = 1) =>
    ({ id, x, y: 40, dir, state: State.WALKING, timer: 0, fallDist: 0, fuse: 0 }) as unknown as Wusel;

  /** Eine Figur ueber mehrere Bilder laufen lassen und die Kette holen. */
  function lauf(schritte: number, bewegt: boolean) {
    ansichtVergessen();
    let x = 10;
    let letzte = ansicht(wusel(1, x), 'walking', false, 0);
    for (let b = 1; b <= schritte; b++) {
      if (bewegt) x += 1;
      letzte = ansicht(wusel(1, x), 'walking', false, b);
    }
    return letzte.kette;
  }

  it('haengt im Stand senkrecht und kommt zur Ruhe', () => {
    const k = lauf(240, false);
    for (const [gx] of k) expect(Math.abs(gx), `waagerechter Ausschlag ${gx}`).toBeLessThan(0.2);
    // Und sie haengt nach unten, nicht nach oben.
    expect(k[k.length - 1][1]).toBeGreaterThan(k[0][1]);
  });

  /**
   * Das, wofuer der ganze Umbau da ist: Bewegung legt das Haar zurueck.
   *
   * Eine Tabelle koennte das auch — aber nur in Stufen und nur fuer die
   * dreizehn Posen, die jemand vorher eingetragen hat. Die Kette tut es
   * stetig und fuer jeden Zwischenzustand.
   */
  it('legt sich beim Laufen nach hinten und richtet sich danach wieder auf', () => {
    const laufend = lauf(240, true);
    const stehend = lauf(240, false);
    const weit = (k: readonly (readonly [number, number])[]) => k[k.length - 1][0];
    expect(weit(laufend)).toBeLessThan(weit(stehend) - 0.5);
  });

  /**
   * Und sie ist deterministisch.
   *
   * Das war die alte Sorge gegen jede Haarphysik, und sie steht wortwoertlich
   * im Kopf von `haar.ts`: „ein Haar, das bei jedem Bild woanders steht,
   * flackert." Ein Feder-Daempfer mit festem Zeitschritt springt nicht, er
   * laeuft aus — und er liefert bei gleicher Eingabe dieselbe Ausgabe. Ohne
   * diese Zusage waere die Kette im Zeitruecklauf nicht wiederholbar.
   */
  it('liefert bei gleicher Eingabe dieselbe Kette', () => {
    const a = lauf(60, true);
    const b = lauf(60, true);
    expect(a).toEqual(b);
  });

  /**
   * Zwei Figuren, zwei Ketten.
   *
   * Der Ansichtszustand haengt an der Figurennummer. Ohne das truege der ganze
   * Pulk dieselbe Frisurbewegung — und ein Pulk, der im Gleichschritt weht,
   * ist genau der Eindruck, den der Phasenversatz in `scene.ts` vermeiden soll.
   */
  it('fuehrt je Figur eine eigene Kette', () => {
    ansichtVergessen();
    for (let b = 0; b <= 60; b++) {
      ansicht(wusel(1, 10 + b), 'walking', false, b);
      ansicht(wusel(2, 10), 'walking', false, b);
    }
    const eins = ansicht(wusel(1, 71), 'walking', false, 61).kette;
    const zwei = ansicht(wusel(2, 10), 'walking', false, 61).kette;
    expect(eins).not.toEqual(zwei);
  });
});
