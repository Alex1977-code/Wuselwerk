import { describe, expect, it } from 'vitest';
import { SKILLS, type SkillCounts } from '../src/core/types';
import { LEVELS } from '../src/levels';
import type { LevelDef } from '../src/levels/types';
import { WELTEN, bahn, bandLaengeFuer, ids, type Welt } from '../src/levels/welten';
import {
  KATALOG,
  figurStand,
  hatKomfort,
  istGeschafft,
  levelZustand,
  naechstesLevel,
  spielReihenfolge,
  stationen,
  verdienteBelohnungen,
  wanderung,
  weltFertig,
  weltkarte,
  werkzeugeFuer,
  zeitlimitFuer,
  type Katalog,
} from '../src/progression';
import type { Progress } from '../src/storage';

/**
 * Prüfungen an den Fortschrittsregeln.
 *
 * Die Regeln stehen bewusst als reine Funktionen in `src/progression.ts`,
 * damit sie hier ohne Bildschirm, ohne `localStorage` und ohne Simulation
 * nachgerechnet werden können. Der grösste Teil arbeitet deshalb mit einem
 * **erfundenen Katalog** aus drei kleinen Welten: Nur so lässt sich der
 * Weltwechsel samt Belohnung prüfen, solange erst eine Welt wirklich gebaut
 * ist. Am Ende steht ein Block, der dieselben Regeln gegen den echten Katalog
 * hält — sonst prüfte man nur seine eigene Erfindung.
 */

// --- Erfundener Katalog ----------------------------------------------------

function sk(partial: Partial<SkillCounts>): SkillCounts {
  const out = {} as SkillCounts;
  for (const s of SKILLS) out[s] = partial[s] ?? 0;
  return out;
}

function testLevel(id: string, chapter: string, skills: Partial<SkillCounts>): LevelDef {
  return {
    id,
    name: id,
    chapter,
    hint: '',
    theme: 'grass',
    width: 200,
    height: 200,
    seed: 1,
    entrance: { x: 20, y: 40 },
    exit: { x: 150, y: 90, w: 20, h: 20 },
    total: 10,
    needed: 5,
    timeLimitSec: 100,
    releaseRate: 50,
    minReleaseRate: 30,
    skills: sk(skills),
    par: 2,
    paint: [{ t: 'ground', x: 0, w: 200, y: 120, h: 80, mat: 1, rough: 0 }],
  };
}

function testWelt(id: string, soll: number, belohnung: Welt['belohnung']): Welt {
  const punkte = bahn(soll);
  const bandLaenge = bandLaengeFuer(soll);
  return {
    id,
    name: `Welt ${id}`,
    thema: '',
    kartenTheme: 'grass',
    farbe: '#000000',
    soll,
    levelIds: ids(id, soll),
    punkte,
    bandLaenge,
    torPunkt: { x: 0.5, y: bandLaenge - 0.1 },
    belohnung,
  };
}

/**
 * Drei Welten: zwei gebaut, eine nur geplant.
 *
 * Welt 1 hat zwei Etappen (`E1` mit zwei Leveln, `E2` mit einem) — daran
 * hängen die Rückenwind-Prüfungen. Welt 3 hat kein einziges gebautes Level und
 * darf deshalb nirgends auftauchen.
 */
const T_WELTEN: Welt[] = [
  testWelt('t1', 3, {
    art: 'werkzeug',
    skill: 'digger',
    anzahl: 1,
    titel: 'Ein Gräber mehr',
    text: '',
  }),
  testWelt('t2', 2, { art: 'zeit', anteil: 0.5, titel: 'Mehr Zeit', text: '' }),
  testWelt('t3', 2, {
    art: 'komfort',
    id: 'meisterschluessel',
    titel: 'Schlüssel',
    text: '',
  }),
];

const T_LEVEL: LevelDef[] = [
  testLevel('t1-01', 'E1', { digger: 2, builder: 1 }),
  testLevel('t1-02', 'E1', { basher: 3 }),
  testLevel('t1-03', 'E2', { digger: 1, floater: 2 }),
  testLevel('t2-01', 'E1', { digger: 4 }),
  testLevel('t2-02', 'E1', { basher: 1 }),
];

const T: Katalog = { welten: T_WELTEN, level: T_LEVEL };

/** Spielstand aus einer Liste geschaffter Level. */
function stand(...ids_: string[]): Progress {
  const p: Progress = {};
  for (const id of ids_) {
    p[id] = { won: true, bestSaved: 10, bestSkills: 2, stars: 3 };
  }
  return p;
}

// --- Freischaltung ---------------------------------------------------------

describe('Freischaltung', () => {
  it('öffnet am Anfang genau ein Level', () => {
    const p: Progress = {};
    expect(levelZustand(p, 't1-01', T)).toBe('offen');
    expect(levelZustand(p, 't1-02', T)).toBe('gesperrt');
    expect(levelZustand(p, 't2-01', T)).toBe('gesperrt');
  });

  it('öffnet mit jedem geschafften Level das nächste', () => {
    const p = stand('t1-01');
    expect(levelZustand(p, 't1-01', T)).toBe('geschafft');
    expect(levelZustand(p, 't1-02', T)).toBe('offen');
    expect(levelZustand(p, 't1-03', T)).toBe('gesperrt');
  });

  it('führt über die Weltgrenze hinweg', () => {
    // Das letzte Level der Welt 1 schaltet das erste der Welt 2 frei — die
    // Kette kennt keine Weltgrenze, nur der Spieler sieht eine.
    const p = stand('t1-01', 't1-02', 't1-03');
    expect(levelZustand(p, 't2-01', T)).toBe('offen');
    expect(levelZustand(p, 't2-02', T)).toBe('gesperrt');
  });

  it('lässt ein Loch in der Mitte nicht überspringen', () => {
    // Ein Spielstand, in dem das zweite Level fehlt (z. B. weil jemand die
    // Datei von Hand bearbeitet hat), darf das dritte nicht öffnen.
    const p = stand('t1-01', 't1-03');
    expect(levelZustand(p, 't1-02', T)).toBe('offen');
    expect(levelZustand(p, 't1-03', T)).toBe('geschafft');
    expect(levelZustand(p, 't2-01', T)).toBe('gesperrt');
  });

  it('nennt das nächste zu spielende Level', () => {
    expect(naechstesLevel({}, T)?.id).toBe('t1-01');
    expect(naechstesLevel(stand('t1-01', 't1-02'), T)?.id).toBe('t1-03');
    expect(naechstesLevel(stand(...T_LEVEL.map((l) => l.id)), T)).toBeNull();
  });

  it('sagt in der Karte dasselbe wie in der Einzelabfrage', () => {
    // `weltkarte` rechnet den Zustand aus Geschwindigkeitsgründen selbst aus,
    // statt `levelZustand` je Level aufzurufen. Dieselbe Regel an zwei Stellen
    // läuft irgendwann auseinander — hier nicht.
    const staende: Progress[] = [
      {},
      stand('t1-01'),
      stand('t1-01', 't1-02'),
      stand('t1-01', 't1-02', 't1-03'),
      stand('t1-01', 't1-03'),
      stand(...T_LEVEL.map((l) => l.id)),
    ];
    for (const p of staende) {
      for (const w of weltkarte(p, T).welten) {
        for (const l of w.level) {
          expect(l.zustand, l.id).toBe(levelZustand(p, l.id, T));
        }
      }
    }
  });

  it('kennt keine ungebauten Level', () => {
    expect(levelZustand({}, 't3-01', T)).toBe('gesperrt');
    expect(spielReihenfolge(T).map((l) => l.id)).toEqual([
      't1-01',
      't1-02',
      't1-03',
      't2-01',
      't2-02',
    ]);
  });
});

// --- Belohnungen -----------------------------------------------------------

describe('Belohnungen', () => {
  it('zahlen erst aus, wenn die ganze Welt steht', () => {
    expect(verdienteBelohnungen(stand('t1-01', 't1-02'), T)).toHaveLength(0);
    expect(weltFertig(stand('t1-01', 't1-02'), 't1', T)).toBe(false);
    const alle = stand('t1-01', 't1-02', 't1-03');
    expect(weltFertig(alle, 't1', T)).toBe(true);
    expect(verdienteBelohnungen(alle, T)).toHaveLength(1);
    expect(verdienteBelohnungen(alle, T)[0].titel).toBe('Ein Gräber mehr');
  });

  it('zahlen für eine Welt ohne gebaute Level gar nichts', () => {
    // Welt 3 hat kein Level. „Alle Level geschafft" wäre für sie formal wahr —
    // und wäre eine Belohnung für nichts.
    const alle = stand(...T_LEVEL.map((l) => l.id));
    expect(verdienteBelohnungen(alle, T)).toHaveLength(2);
    expect(hatKomfort(alle, 'meisterschluessel', T)).toBe(false);
  });

  it('erhöhen nur Berufe, die das Level ohnehin ausgibt', () => {
    const alle = stand('t1-01', 't1-02', 't1-03');
    // t2-02 gibt keinen Gräber aus — der Gräberbonus darf dort keinen erfinden,
    // sonst wäre aus der Belohnung ein anderes Rätsel geworden.
    const ohne = werkzeugeFuer(levelVon('t2-02'), alle, T);
    expect(ohne.digger).toBe(0);
    const mit = werkzeugeFuer(levelVon('t2-01'), alle, T);
    expect(mit.digger).toBe(5);
  });

  it('lassen die Musterlösungszahl in Ruhe', () => {
    // Der dritte Stern hängt an `par`, also an den *benutzten* Werkzeugen.
    // Ein Bonus füllt den Vorrat und rührt `par` nicht an: Er kauft den
    // Durchgang, nie die Meisterschaft.
    const alle = stand('t1-01', 't1-02', 't1-03');
    const def = levelVon('t2-01');
    const vorher = def.par;
    werkzeugeFuer(def, alle, T);
    expect(def.par).toBe(vorher);
    // und der Levelvorrat selbst bleibt unangetastet
    expect(def.skills.digger).toBe(4);
  });

  it('verlängern die Uhr, sobald die Zeitbelohnung verdient ist', () => {
    const alle = stand(...T_LEVEL.map((l) => l.id));
    expect(zeitlimitFuer(levelVon('t1-01'), {}, T)).toBe(100);
    expect(zeitlimitFuer(levelVon('t1-01'), alle, T)).toBe(150);
  });
});

// --- Rückenwind ------------------------------------------------------------

describe('Rückenwind', () => {
  it('wirkt erst, wenn die ganze Etappe steht', () => {
    // t1-01 und t1-02 bilden die Etappe E1.
    const halb = stand('t1-01');
    expect(werkzeugeFuer(levelVon('t1-01'), halb, T).digger).toBe(2);
    const ganz = stand('t1-01', 't1-02');
    expect(werkzeugeFuer(levelVon('t1-01'), ganz, T).digger).toBe(3);
    expect(werkzeugeFuer(levelVon('t1-01'), ganz, T).builder).toBe(2);
  });

  it('rührt Level einer noch offenen Etappe nicht an', () => {
    const ganz = stand('t1-01', 't1-02');
    // t1-03 ist Etappe E2 und noch nicht geschafft.
    expect(werkzeugeFuer(levelVon('t1-03'), ganz, T).floater).toBe(2);
  });

  it('erfindet keine Berufe', () => {
    const ganz = stand('t1-01', 't1-02');
    expect(werkzeugeFuer(levelVon('t1-01'), ganz, T).bomber).toBe(0);
  });
});

// --- Die Figur -------------------------------------------------------------

describe('Die Figur auf der Karte', () => {
  it('steht auf dem ersten Level, das noch offen ist', () => {
    expect(figurStand({}, T)?.levelId).toBe('t1-01');
    expect(figurStand(stand('t1-01'), T)?.levelId).toBe('t1-02');
    expect(figurStand(stand('t1-01', 't1-02', 't1-03'), T)?.levelId).toBe('t2-01');
  });

  it('steht am Ende auf dem letzten Tor', () => {
    const alle = stand(...T_LEVEL.map((l) => l.id));
    const f = figurStand(alle, T);
    expect(f?.levelId).toBeNull();
    expect(f?.weltId).toBe('t2');
  });

  it('bleibt stehen, wenn ein altes Level wiederholt wird', () => {
    // Ein Nachspielen ändert am Stand nichts — also darf sich die Figur nicht
    // rühren, schon gar nicht rückwärts. Sonst wäre Wiederkommen eine Strafe.
    const p = stand('t1-01', 't1-02');
    const w = wanderung(p, p, T);
    expect(w.weg).toHaveLength(1);
    expect(w.nach?.levelId).toBe('t1-03');
    expect(w.neueBelohnungen).toHaveLength(0);
  });

  it('geht einen Schritt weiter, wenn ein Level geschafft wurde', () => {
    const w = wanderung(stand('t1-01'), stand('t1-01', 't1-02'), T);
    expect(w.von?.levelId).toBe('t1-02');
    expect(w.nach?.levelId).toBe('t1-03');
    // Zwischen den beiden Leveln liegt der Rastplatz des Etappenwechsels.
    expect(w.weg).toHaveLength(3);
    expect(w.rasten).toHaveLength(1);
    expect(w.tore).toHaveLength(0);
  });

  it('geht beim Weltwechsel durch das Tor und bringt die Belohnung mit', () => {
    const w = wanderung(stand('t1-01', 't1-02'), stand('t1-01', 't1-02', 't1-03'), T);
    expect(w.tore).toHaveLength(1);
    expect(w.nach?.weltId).toBe('t2');
    expect(w.fertigeWelten.map((x) => x.id)).toEqual(['t1']);
    expect(w.neueBelohnungen.map((b) => b.titel)).toEqual(['Ein Gräber mehr']);
  });

  it('läuft niemals rückwärts, auch wenn der Stand schrumpft', () => {
    // Kann eigentlich nicht vorkommen — `recordResult` nimmt nichts zurück.
    // Wenn es doch passiert (fremder Spielstand, Handbearbeitung), soll die
    // Wanderung eine Strecke liefern und nicht in eine Endlosschleife laufen.
    const w = wanderung(stand('t1-01', 't1-02'), stand('t1-01'), T);
    expect(w.weg.length).toBeGreaterThan(1);
    expect(w.rasten).toHaveLength(0);
    expect(w.tore).toHaveLength(0);
  });
});

// --- Das Band --------------------------------------------------------------

describe('Das Band', () => {
  it('legt die Punkte streng von unten nach oben', () => {
    const karte = weltkarte({}, T);
    const ys = karte.welten.flatMap((w) => w.level.map((l) => l.pos.y));
    for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeGreaterThan(ys[i - 1]);
  });

  it('hält jeden Punkt innerhalb der Bandbreite', () => {
    for (const w of weltkarte({}, KATALOG).welten) {
      for (const l of w.level) {
        expect(l.pos.x).toBeGreaterThanOrEqual(0);
        expect(l.pos.x).toBeLessThanOrEqual(1);
      }
      expect(w.tor.x).toBeGreaterThanOrEqual(0);
      expect(w.tor.x).toBeLessThanOrEqual(1);
    }
  });

  it('setzt die Weltabschnitte lückenlos aneinander', () => {
    const karte = weltkarte({}, T);
    let y = 0;
    for (const w of karte.welten) {
      expect(w.bandStart).toBeCloseTo(y, 3);
      y += w.bandLaenge;
    }
    expect(karte.bandLaenge).toBeCloseTo(y, 3);
  });

  it('stellt das Tor hinter das letzte Level seiner Welt', () => {
    for (const w of weltkarte({}, T).welten) {
      const letztes = w.level[w.level.length - 1];
      expect(w.tor.y).toBeGreaterThan(letztes.pos.y);
      expect(w.tor.y).toBeLessThanOrEqual(w.bandStart + w.bandLaenge);
    }
  });

  it('reiht Level, Rastplätze und Tore in einer Kette auf', () => {
    const halte = stationen(T);
    expect(halte.filter((h) => h.art === 'level')).toHaveLength(5);
    expect(halte.filter((h) => h.art === 'tor')).toHaveLength(2);
    // Ein Rastplatz — zwischen E1 und E2 der Welt 1. Am Weltende steht das Tor
    // und braucht keinen zusätzlichen Halt.
    expect(halte.filter((h) => h.art === 'rast')).toHaveLength(1);
    for (let i = 1; i < halte.length; i++) {
      expect(halte[i].pos.y).toBeGreaterThan(halte[i - 1].pos.y);
    }
  });

  it('zählt Sterne und geschaffte Level zusammen', () => {
    const karte = weltkarte(stand('t1-01', 't1-02'), T);
    expect(karte.geschafft).toBe(2);
    expect(karte.gesamt).toBe(5);
    expect(karte.sterne).toBe(6);
    expect(karte.sterneMoeglich).toBe(15);
    expect(karte.welten[0].etappen.map((e) => e.fertig)).toEqual([true, false]);
  });
});

// --- Ein kaputter Spielstand darf nichts umwerfen --------------------------

describe('Fremde und alte Spielstände', () => {
  it('verträgt einen leeren Stand', () => {
    const karte = weltkarte({}, KATALOG);
    expect(karte.welten.length).toBeGreaterThan(0);
    expect(karte.figur?.levelId).toBe(LEVELS[0].id);
  });

  it('verträgt Unsinn in den Feldern', () => {
    const kaputt = {
      't1-01': { won: 'ja', stars: 'drei' },
      't1-02': null,
      'gibt-es-nicht': { won: true, stars: 3 },
    } as unknown as Progress;
    expect(() => weltkarte(kaputt, T)).not.toThrow();
    expect(istGeschafft(kaputt, 't1-01')).toBe(false);
    expect(weltkarte(kaputt, T).sterne).toBe(0);
    expect(figurStand(kaputt, T)?.levelId).toBe('t1-01');
  });

  it('verliert bei einer unbekannten ID nur dieses eine Level', () => {
    // Genau das passiert, wenn ein Level umbenannt wird. Der Rest des
    // Fortschritts muss stehen bleiben — deshalb steht im Spielstand kein
    // abgeleiteter Wert, sondern nur das Ergebnis je Level.
    const p = { ...stand('t1-01', 't1-02'), 't9-99': { won: true, bestSaved: 1, bestSkills: 1, stars: 3 } };
    expect(weltkarte(p, T).geschafft).toBe(2);
  });
});

// --- Der echte Katalog -----------------------------------------------------

describe('Der ausgelieferte Katalog', () => {
  it('hält sich an zehn bis fünfzehn Level je Welt', () => {
    for (const w of WELTEN) {
      expect(w.soll, w.name).toBeGreaterThanOrEqual(10);
      expect(w.soll, w.name).toBeLessThanOrEqual(15);
      expect(w.levelIds).toHaveLength(w.soll);
      expect(w.punkte).toHaveLength(w.soll);
    }
  });

  it('nennt jedes Level höchstens einer Welt', () => {
    const gesehen = new Set<string>();
    for (const w of WELTEN) {
      for (const id of w.levelIds) {
        expect(gesehen.has(id), id).toBe(false);
        gesehen.add(id);
      }
    }
    for (const l of LEVELS) expect(gesehen.has(l.id), l.id).toBe(true);
  });

  it('zeigt heute genau die gebauten Welten', () => {
    const karte = weltkarte({}, KATALOG);
    expect(karte.welten).toHaveLength(5);
    expect(karte.welten.map((w) => w.welt.id)).toEqual(['w1', 'w2', 'w3', 'w4', 'w5']);
    // 14 in Welt 3 seit „Unter dem Hinweg" (Level-Konzept, Paket 2) —
    // die Summe ist wieder die beworbene 66.
    expect(karte.welten.map((w) => w.level.length)).toEqual([10, 13, 14, 14, 15]);
    const alleIds = karte.welten.flatMap((w) => w.level.map((l) => l.id));
    expect(alleIds).toEqual(LEVELS.map((l) => l.id));
  });

  it('teilt Welt 1 in drei Etappen', () => {
    const w = weltkarte({}, KATALOG).welten[0];
    expect(w.etappen.map((e) => e.name)).toEqual(['Spaziergang', 'Kniffelig', 'Prüfung']);
    expect(w.etappen.map((e) => e.bis - e.von + 1)).toEqual([3, 4, 3]);
  });

  it('gibt am Ende von Welt 1 den zusätzlichen Gräber', () => {
    // Nur Welt 1 ist durchgespielt — Welt 2 bleibt offen, sonst käme ihre
    // Belohnung dazu und der Test prüfte zwei Dinge auf einmal.
    const alle = stand(...LEVELS.filter((l) => l.id.startsWith('w1-')).map((l) => l.id));
    const b = verdienteBelohnungen(alle, KATALOG);
    expect(b).toHaveLength(1);
    expect(b[0].art).toBe('werkzeug');
    // Level 1 gibt fünf Gräber aus und ist zugleich in einer fertigen Etappe:
    // fünf plus Belohnung plus Rückenwind.
    expect(werkzeugeFuer(levelVon('w1-01'), alle, KATALOG).digger).toBe(7);
    // Level 2 gibt keinen Kletterer aus — daran ändert auch alles Gold nichts.
    expect(werkzeugeFuer(levelVon('w1-02'), alle, KATALOG).climber).toBe(0);
  });

  it('lässt die Figur bei leerem Stand auf dem ersten Level beginnen', () => {
    const f = figurStand({}, KATALOG);
    expect(f?.weltId).toBe('w1');
    expect(f?.levelId).toBe('w1-01');
  });
});

function levelVon(id: string): LevelDef {
  const von = [...T_LEVEL, ...LEVELS].find((l) => l.id === id);
  if (!von) throw new Error(`Level ${id} gibt es nicht`);
  return von;
}

/**
 * Das Sterntor — Kritikpunkt F6: Sterne müssen etwas kaufen.
 *
 * Es hält unabhängig vom Vorgänger zu: Wer nur durchrennt (ein Stern je
 * Level), steht davor und hat einen Grund, alte Level besser zu spielen.
 * Ein einmal geschafftes Level hinter dem Tor bleibt geschafft.
 */
describe('Sterntor', () => {
  const TOR: Katalog = {
    welten: [
      {
        ...T_WELTEN[0],
        sternTor: { vorIndex: 2, sterne: 5 },
      },
      ...T_WELTEN.slice(1),
    ],
    level: T_LEVEL,
  };

  it('hält zu, solange die Sterne fehlen', () => {
    const p: Progress = {
      't1-01': { won: true, bestSaved: 10, bestSkills: 2, stars: 2 },
      't1-02': { won: true, bestSaved: 10, bestSkills: 2, stars: 2 },
    };
    // Vier Sterne, fünf verlangt: t1-03 bleibt trotz geschafftem Vorgänger zu.
    expect(levelZustand(p, 't1-03', TOR)).toBe('gesperrt');
  });

  it('öffnet mit der geforderten Sternzahl', () => {
    const p: Progress = {
      't1-01': { won: true, bestSaved: 10, bestSkills: 2, stars: 3 },
      't1-02': { won: true, bestSaved: 10, bestSkills: 2, stars: 2 },
    };
    expect(levelZustand(p, 't1-03', TOR)).toBe('offen');
  });

  it('nimmt Geschafftes nicht zurück', () => {
    const p: Progress = {
      't1-03': { won: true, bestSaved: 10, bestSkills: 2, stars: 1 },
    };
    expect(levelZustand(p, 't1-03', TOR)).toBe('geschafft');
  });

  it('trägt die Plakette in die Karte', () => {
    const p: Progress = {
      't1-01': { won: true, bestSaved: 10, bestSkills: 2, stars: 2 },
    };
    const karte = weltkarte(p, TOR);
    const punkt = karte.welten[0].level[2];
    expect(punkt.sternTor).toEqual({ sterne: 5, fehlen: 3 });
  });
});
