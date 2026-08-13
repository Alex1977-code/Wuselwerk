/* Probe fuer Weg A — Variation des Weltstuecks je Level. Nicht Teil des Spiels. */
import { ARPEGGIO, STUECKE } from '../src/audio/music';
import { LEVELS } from '../src/levels/index';

type Note = [number | null, number];
const TAKT = 8;
const PULSSTELLEN = [0, 3, 6];

// --- Werkzeug ---------------------------------------------------------------

function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
function nummer(id: string, h: number): number {
  const m = /^w\d+-(\d+)$/.exec(id);
  return m ? parseInt(m[1], 10) : (h % 20) + 1;
}
const kl = (t: number) => ((t % 12) + 12) % 12;

function inTakte(m: readonly Note[]): Note[][] {
  const out: Note[][] = [];
  let cur: Note[] = [];
  let sum = 0;
  for (const n of m) {
    cur.push([n[0], n[1]]);
    sum += n[1];
    if (sum === TAKT) {
      out.push(cur);
      cur = [];
      sum = 0;
    }
  }
  return out;
}
const flach = (b: Note[][]): Note[] => b.flat();
const klassen = (m: readonly Note[]) =>
  new Set(m.filter((n) => n[0] !== null).map((n) => kl(n[0] as number)));

// --- Konsonanzpruefung ------------------------------------------------------

/** Akkordtoene ueber der Wurzel, auf den Tonvorrat des Stuecks eingeschraenkt. */
function akkordklassen(wurzel: number, vorrat: Set<number>): Set<number> {
  const s = new Set<number>();
  for (const iv of [0, 3, 4, 7, 10]) if (vorrat.has(kl(wurzel + iv))) s.add(kl(wurzel + iv));
  return s;
}

/**
 * Sitzt jeder Einsatz auf einer Pulsstelle auf einem Akkordton — oder geht er
 * im Schritt weiter? Ein Vorhalt oder Durchgangston auf schwerer Zeit ist
 * erlaubt, solange er sich um hoechstens einen Ganzton aufloest.
 */
function misstoene(bar: Note[], wurzel: number, vorrat: Set<number>, folge: number | null): number {
  const ak = akkordklassen(wurzel, vorrat);
  let pos = 0;
  let zahl = 0;
  for (let i = 0; i < bar.length; i++) {
    const n = bar[i];
    if (PULSSTELLEN.includes(pos) && n[0] !== null && n[1] >= 2 && !ak.has(kl(n[0]))) {
      const naechst = i + 1 < bar.length ? bar[i + 1][0] : folge;
      // Ein Vorhalt, der sich im Schritt oder Terzschritt aufloest, zaehlt nicht.
      if (naechst === null || Math.abs(naechst - n[0]) > 4) zahl++;
    }
    pos += n[1];
  }
  return zahl;
}
/** Erster Ton des Folgetakts — fuer die Aufloesung eines Vorhalts am Taktende. */
function folgeTon(bars: Note[][], t: number): number | null {
  const b = bars[(t + 1) % bars.length];
  const n = b?.find((x) => x[0] !== null);
  return n ? (n[0] as number) : null;
}

// --- Melodie-Operatoren -----------------------------------------------------

interface Werk {
  bars: Note[][];
  vorrat: Set<number>;
  akkorde: number[];
  frei: number[];
}

function summe(b: Note[]) {
  return b.reduce((a, n) => a + n[1], 0);
}
function lang(b: Note[][]) {
  return flach(b).filter((n) => n[1] >= 3).length;
}

/** Kopftakte: Takte, die mit den ersten drei Tonhoehen der Melodie beginnen. */
function kopfTakte(bars: Note[][]): boolean[] {
  const kopf = flach(bars).slice(0, 3).map((n) => n[0]);
  return bars.map((b) => b.length >= 3 && b.slice(0, 3).every((n, i) => n[0] === kopf[i]));
}

type Op = (w: Werk) => Note[][] | null;

/** Vorhalt: laengste Note eines freien Takts abkuerzen, Auftakt zum naechsten. */
function opVorhalt(stelle: number): Op {
  return (w) => {
    const t = w.frei[stelle];
    if (t === undefined || t + 1 >= w.bars.length) return null;
    const bar = w.bars[t].map((n) => [n[0], n[1]] as Note);
    let k = -1;
    for (let i = 0; i < bar.length; i++) if (bar[i][0] !== null && bar[i][1] >= 3) k = i;
    if (k < 0) return null;
    const ziel = w.bars[t + 1].find((n) => n[0] !== null);
    if (!ziel) return null;
    const neu: Note[] = [
      ...bar.slice(0, k),
      [bar[k][0], bar[k][1] - 1],
      [ziel[0], 1],
      ...bar.slice(k + 1),
    ];
    const out = w.bars.map((b, i) => (i === t ? neu : b));
    return out;
  };
}

/** Bindung: zwei benachbarte Toene eines freien Takts zu einem langen binden. */
function opBindung(stelle: number): Op {
  return (w) => {
    const t = w.frei[stelle];
    if (t === undefined) return null;
    const bar = w.bars[t];
    const alle = klassen(flach(w.bars));
    for (let k = 0; k + 1 < bar.length; k++) {
      if (bar[k][0] === null || bar[k + 1][0] === null) continue;
      // Der wegfallende Ton darf nicht der letzte seiner Klasse sein.
      const weg = kl(bar[k + 1][0] as number);
      const rest = flach(w.bars).filter((n, i) => n[0] !== null);
      const anzahl = rest.filter((n) => kl(n[0] as number) === weg).length;
      if (anzahl < 2) continue;
      void alle;
      const neu: Note[] = [
        ...bar.slice(0, k),
        [bar[k][0], bar[k][1] + bar[k + 1][1]],
        ...bar.slice(k + 2),
      ];
      return w.bars.map((b, i) => (i === t ? neu : b));
    }
    return null;
  };
}

/** Spiegel: Tonhoehenfolge eines freien Takts umkehren, Rhythmus bleibt. */
function opSpiegel(stelle: number): Op {
  return (w) => {
    const t = w.frei[stelle];
    if (t === undefined) return null;
    const bar = w.bars[t];
    if (bar.some((n) => n[0] === null)) return null;
    const hoehen = bar.map((n) => n[0]).reverse();
    const neu: Note[] = bar.map((n, i) => [hoehen[i], n[1]]);
    const f = folgeTon(w.bars, t);
    if (misstoene(neu, w.akkorde[t], w.vorrat, f) > misstoene(w.bars[t], w.akkorde[t], w.vorrat, f))
      return null;
    return w.bars.map((b, i) => (i === t ? neu : b));
  };
}

/** Sequenz: freien Takt eine diatonische Terz hoeher setzen. */
function opSequenz(stelle: number): Op {
  return (w) => {
    const t = w.frei[stelle];
    if (t === undefined) return null;
    const bar = w.bars[t];
    const top = Math.max(...flach(w.bars).filter((n) => n[0] !== null).map((n) => n[0] as number));
    const bot = Math.min(...flach(w.bars).filter((n) => n[0] !== null).map((n) => n[0] as number));
    const neu: Note[] = [];
    for (const n of bar) {
      if (n[0] === null) {
        neu.push([null, n[1]]);
        continue;
      }
      const p = n[0];
      let ziel: number | null = null;
      for (const iv of [4, 3]) if (w.vorrat.has(kl(p + iv))) { ziel = p + iv; break; }
      if (ziel === null || ziel > top + 2 || ziel < bot) return null;
      neu.push([ziel, n[1]]);
    }
    const ft = folgeTon(w.bars, t);
    if (misstoene(neu, w.akkorde[t], w.vorrat, ft) > misstoene(w.bars[t], w.akkorde[t], w.vorrat, ft))
      return null;
    // Keine Tonklasse darf verschwinden.
    const ohne = w.bars.map((b, i) => (i === t ? neu : b));
    for (const c of klassen(flach(w.bars))) if (!klassen(flach(ohne)).has(c)) return null;
    return ohne;
  };
}

/** Die fuenf Melodievarianten, jeweils als Kette von Operatoren. */
const MELODIEVARIANTEN: Op[][] = [
  [], // V0 Urgestalt
  [opVorhalt(0)], // V1
  [opBindung(2), opVorhalt(0)], // V2
  [opSpiegel(1)], // V3
  [opSequenz(3), opBindung(2)], // V4
];

// --- Akkordvariante ---------------------------------------------------------

const SUBSTITUTIONEN: number[][] = [[], [1], [3], [1, 5]];

/** Der eine Takt je Welt, der ihr Gesicht traegt und nie umharmonisiert wird. */
const KENNTAKT: Record<string, number> = {
  grass: 4, sonnenhang: 4, wipfel: 4, // das Fis im Mittelteil
  crystal: 3, // die dorische Sexte ueber D-Dur
  rust: 4, // die kleine Septime
  frost: 4, magma: 2,
};

function mediante(
  akkorde: readonly number[],
  bars: Note[][],
  vorrat: Set<number>,
  stellen: number[],
  kenntakt: number,
  grund: number,
): number[] {
  const out = akkorde.slice();
  const tiefste = Math.min(...akkorde);
  for (const t of stellen) {
    if (t >= out.length) continue;
    const bar = bars[t];
    if (!bar) continue;
    if (t === kenntakt) continue; // der Takt, der das Gesicht der Welt traegt
    const erster = bar.find((n) => n[0] !== null);
    if (!erster) continue;
    for (const d of [-3, -4, 3, 4]) {
      const w = out[t] + d;
      if (w < tiefste) continue; // der Bass darf nicht unter die Welt rutschen
      if (grund * Math.pow(2, (Math.max(w, ...out) + 12) / 12) >= 800) continue; // A2
      if (!vorrat.has(kl(w))) continue;
      const ft = folgeTon(bars, t);
      if (misstoene(bar, w, vorrat, ft) > misstoene(bar, akkorde[t], vorrat, ft)) continue;
      void erster;
      out[t] = w;
      break;
    }
  }
  return out;
}

// --- Farbvariante -----------------------------------------------------------

function farbvariante(
  farbe: readonly number[],
  v: number,
  vorrat: Set<number>,
  maxAkk: number,
  grund: number,
): number[] {
  const kandidat = (zusatz: number[]) => {
    const f = [...farbe, ...zusatz.filter((z) => vorrat.has(kl(z)) && !farbe.includes(z))];
    const hoch = grund * Math.pow(2, (maxAkk + Math.max(...f)) / 12);
    return hoch < 800 ? f : null;
  };
  if (v === 1) return kandidat([10]) ?? kandidat([11]) ?? farbe.slice();
  if (v === 2) return kandidat([2]) ?? kandidat([9]) ?? farbe.slice();
  return farbe.slice();
}

// --- Zweitstimmen -----------------------------------------------------------

const GESTRICHEN = ['leier', 'streicher', 'akkordeon'];
const GEBLASEN = ['okarina', 'klarinette', 'panfloete'];

/** Fuehrende Stimme je Welt (Identitaet) und die zwei moeglichen Antworten. */
const STIMMEN_WELT: Record<string, { fuehrt: string; antwort: [string, string] }> = {
  grass: { fuehrt: 'leier', antwort: ['okarina', 'panfloete'] },
  sonnenhang: { fuehrt: 'okarina', antwort: ['leier', 'streicher'] },
  wipfel: { fuehrt: 'panfloete', antwort: ['leier', 'streicher'] },
  crystal: { fuehrt: 'streicher', antwort: ['klarinette', 'okarina'] },
  rust: { fuehrt: 'akkordeon', antwort: ['okarina', 'klarinette'] },
  frost: { fuehrt: 'panfloete', antwort: ['streicher', 'leier'] },
  magma: { fuehrt: 'klarinette', antwort: ['leier', 'akkordeon'] },
};

const TEMPOVERSATZ = [0, 2, -2, 3, -3, 1, -1];

// --- Das Verfahren ----------------------------------------------------------

export interface Erzeugt {
  melodie: Note[];
  akkorde: number[];
  farbe: number[];
  bpm: number;
  grund: number;
  melodieStimme: string;
  zweitStimme: string;
  harmonieStimme: string;
  sfxStufen: readonly number[];
  fanfareGrund: number;
  /** Diagnose */
  vM: number;
  vA: number;
  notfall: boolean;
  theme: string;
}

export function stueckFuer(levelId: string, theme: string): Erzeugt {
  const w = STUECKE[theme as keyof typeof STUECKE];
  const h = hash32(levelId);
  const nr = nummer(levelId, h);
  const vM = (nr - 1) % MELODIEVARIANTEN.length;
  const vA = Math.floor((nr - 1) / MELODIEVARIANTEN.length) % SUBSTITUTIONEN.length;

  const grundBars = inTakte(w.melodie as readonly Note[]);
  const kopf = kopfTakte(grundBars);
  const frei = grundBars.map((_, i) => i).filter((i) => !kopf[i] && i < grundBars.length - 1);
  const vorrat = new Set([...klassen(w.melodie as readonly Note[]), ...w.akkorde.map(kl)]);

  // Melodie
  let bars = grundBars;
  let notfall = false;
  for (let versuch = vM; versuch >= 0; versuch--) {
    let cur = grundBars.map((b) => b.map((n) => [n[0], n[1]] as Note));
    let ok = true;
    for (const op of MELODIEVARIANTEN[versuch]) {
      const r = op({ bars: cur, vorrat, akkorde: w.akkorde.slice(), frei });
      if (!r) {
        ok = false;
        break;
      }
      cur = r;
    }
    if (!ok) continue;
    if (cur.some((b) => summe(b) !== TAKT)) continue;
    if (lang(cur) < 3) continue;
    const t = flach(cur).filter((n) => n[0] !== null).map((n) => n[0] as number);
    if (Math.max(...t) - Math.min(...t) > 24) continue;
    const kl2 = klassen(flach(cur));
    if (!w.sfxStufen.every((s) => kl2.has(kl(s)))) continue;
    bars = cur;
    if (versuch !== vM) notfall = true;
    break;
  }

  // Akkorde
  const alle = SUBSTITUTIONEN.map((st) =>
    mediante(w.akkorde, bars, vorrat, st, KENNTAKT[theme] ?? -1, w.grund),
  );
  const eindeutig: number[][] = [];
  for (const a of alle) if (!eindeutig.some((b) => b.join() === a.join())) eindeutig.push(a);
  const vAe = vA % eindeutig.length;
  const akkorde = eindeutig[vAe];
  const maxAkk = Math.max(...akkorde);

  // Farbe, Tempo, Stimmen
  const farbe = farbvariante(w.farbe, (h >>> 7) % 3, vorrat, maxAkk, w.grund);
  const bpm = w.bpm + TEMPOVERSATZ[h % TEMPOVERSATZ.length];
  const st = STIMMEN_WELT[theme];
  const zweit = st.antwort[(h >>> 5) & 1];
  const harmonie = vAe >= 2 ? (w.harmonieStimme === 'ukulele' ? 'kalimba' : 'ukulele') : w.harmonieStimme;

  return {
    melodie: flach(bars),
    akkorde,
    farbe,
    bpm,
    grund: w.grund,
    melodieStimme: st.fuehrt,
    zweitStimme: zweit,
    harmonieStimme: harmonie,
    sfxStufen: w.sfxStufen,
    fanfareGrund: w.fanfareGrund,
    vM,
    vA: vAe,
    notfall,
    theme,
  };
}

// --- Pruefung ---------------------------------------------------------------

function pruefe(name: string, p: Erzeugt): string[] {
  const f: string[] = [];
  // A2
  const hoch = p.grund * Math.pow(2, (Math.max(...p.akkorde) + Math.max(...ARPEGGIO)) / 12);
  if (hoch >= 800) f.push(`A2 Arpeggio ${hoch.toFixed(1)} Hz`);
  // A6
  let imTakt = 0;
  const takte: number[] = [];
  for (const [, l] of p.melodie) {
    imTakt += l;
    if (imTakt > TAKT) f.push('A6 Note ragt ueber Taktgrenze');
    if (imTakt === TAKT) {
      takte.push(8);
      imTakt = 0;
    }
  }
  if (imTakt !== 0) f.push('A6 letzter Takt unvollstaendig');
  if (takte.length !== p.akkorde.length) f.push(`A6 ${takte.length} Takte vs ${p.akkorde.length} Akkorde`);
  // A7
  const kopf = p.melodie.slice(0, 3).map((n) => n[0]);
  let treffer = 0;
  for (let i = 0; i + 3 <= p.melodie.length; i++) {
    if (p.melodie.slice(i, i + 3).every((n, k) => n[0] === kopf[k])) treffer++;
  }
  if (treffer < 2) f.push(`A7 Kopfmotiv nur ${treffer}x`);
  // A8
  if (p.melodie.filter((n) => n[1] >= 3).length < 3) f.push('A8 keine Atempausen');
  // A9
  const t = p.melodie.filter((n) => n[0] !== null).map((n) => n[0] as number);
  if (Math.max(...t) - Math.min(...t) > 24) f.push('A9 Ambitus');
  // A10/A11
  const haltend = ['akkordeon', 'klarinette', 'panfloete', 'okarina', 'leier', 'streicher'];
  if (!haltend.includes(p.melodieStimme) || !haltend.includes(p.zweitStimme)) f.push('A10');
  if (p.melodieStimme === p.zweitStimme) f.push('A11');
  // B9': Familienwechsel
  const fam = (s: string) => (GESTRICHEN.includes(s) ? 'g' : GEBLASEN.includes(s) ? 'b' : '?');
  if (fam(p.melodieStimme) === fam(p.zweitStimme)) f.push('B9 gleiche Familie');
  // A12
  const km = klassen(p.melodie);
  for (const s of p.sfxStufen) if (!km.has(kl(s))) f.push(`A12 Stufe ${s} fehlt`);
  // A13
  const vorrat = new Set([...km, ...p.akkorde.map(kl)]);
  for (const s of [0, 4, 7]) if (!vorrat.has(kl(p.fanfareGrund + s))) f.push(`A13 ${s}`);
  // Harmonie unter 800
  const harm = p.grund * Math.pow(2, (Math.max(...p.akkorde) + Math.max(...p.farbe)) / 12);
  if (harm >= 800) f.push(`Harmonie ${harm.toFixed(1)} Hz`);
  // Melodiedecke inkl. Oktavdopplung
  const spitze = p.grund * Math.pow(2, Math.max(...t) / 12 + 2);
  if (spitze >= 3000) f.push(`Melodiespitze ${spitze.toFixed(0)} Hz`);
  // Bass ueber 85 Hz
  const weltTief = Math.min(...STUECKE[p.theme as keyof typeof STUECKE].akkorde);
  if (Math.min(...p.akkorde) < weltTief) f.push('Bass tiefer als die Welt');
  void name;
  return f;
}

// --- Lauf -------------------------------------------------------------------

let fehler = 0;
let notfaelle = 0;
const proWelt: Record<string, string[]> = {};
for (const lv of LEVELS) {
  const p = stueckFuer(lv.id, lv.theme);
  const f = pruefe(lv.id, p);
  if (p.notfall) {
    notfaelle++;
    console.log(`NOTFALL ${lv.id} (${lv.theme}) vM=${p.vM}`);
  }
  if (f.length) {
    fehler++;
    console.log(`FEHLER ${lv.id} (${lv.theme}): ${f.join(', ')}`);
  }
  (proWelt[lv.theme] ??= []).push(
    `${lv.id} vM${p.vM} vA${p.vA} bpm${p.bpm} ${p.zweitStimme} farbe[${p.farbe}] akk[${p.akkorde}]`,
  );
}
console.log(`\n${LEVELS.length} Level, ${fehler} Fehler, ${notfaelle} Notfaelle\n`);

// Kollisionspruefung je Welt: gleiches (Melodie, Akkorde)?
for (const [th, zeilen] of Object.entries(proWelt)) {
  console.log(`--- ${th} (${zeilen.length}) ---`);
  for (const z of zeilen) console.log('  ' + z);
}

const gesehen = new Map<string, string>();
for (const lv of LEVELS) {
  const p = stueckFuer(lv.id, lv.theme);
  const key = lv.theme + '|' + JSON.stringify(p.melodie) + '|' + JSON.stringify(p.akkorde);
  if (gesehen.has(key)) console.log(`KOLLISION ${lv.id} == ${gesehen.get(key)}`);
  gesehen.set(key, lv.id);
}

// Determinismus
for (const lv of LEVELS.slice(0, 5)) {
  const a = JSON.stringify(stueckFuer(lv.id, lv.theme));
  const b = JSON.stringify(stueckFuer(lv.id, lv.theme));
  if (a !== b) console.log('NICHT DETERMINISTISCH ' + lv.id);
}

// --- Zielausbau: 100 Level ueber sieben Welten ------------------------------
const WELTEN: [string, string][] = [
  ['w1', 'grass'], ['w2', 'crystal'], ['w3', 'rust'], ['w4', 'frost'],
  ['w5', 'magma'], ['w6', 'sonnenhang'], ['w7', 'wipfel'],
];
let f100 = 0, n100 = 0, k100 = 0, zahl = 0;
const seen100 = new Map<string, string>();
for (const [w, th] of WELTEN) {
  for (let i = 1; i <= 15; i++) {
    const id = `${w}-${String(i).padStart(2, '0')}`;
    const p = stueckFuer(id, th);
    zahl++;
    const fe = pruefe(id, p);
    if (fe.length) { f100++; console.log(`100er FEHLER ${id}: ${fe.join(', ')}`); }
    if (p.notfall) { n100++; console.log(`100er NOTFALL ${id}`); }
    const key = th + '|' + JSON.stringify(p.melodie) + '|' + JSON.stringify(p.akkorde);
    if (seen100.has(key)) { k100++; console.log(`100er KOLLISION ${id} == ${seen100.get(key)}`); }
    seen100.set(key, id);
    const voll = JSON.stringify([p.melodie, p.akkorde, p.farbe, p.bpm, p.zweitStimme, p.harmonieStimme]);
    if (seen100.has(th + '#' + voll)) console.log(`100er VOLLKOLLISION ${id}`);
    seen100.set(th + '#' + voll, id);
  }
}
console.log(`\nZielausbau: ${zahl} Stuecke, ${f100} Fehler, ${n100} Notfaelle, ${k100} Kollisionen`);

// --- Beispiel ---------------------------------------------------------------
const NAMEN = ['C','Cis','D','Es','E','F','Fis','G','As','A','B','H'];
function zeigeStueck(id: string, th: string) {
  const p = stueckFuer(id, th);
  const w = STUECKE[th as keyof typeof STUECKE];
  const name = (h: number | null) => (h === null ? '—' : NAMEN[((h % 12) + 12) % 12] + (h >= 12 ? "'" : ''));
  const zeile = (m: readonly Note[]) => {
    const bars = inTakte(m as Note[]);
    return bars.map((b) => b.map((n) => `${name(n[0])}(${n[1]})`).join(' '));
  };
  const a = zeile(w.melodie as Note[]);
  const b = zeile(p.melodie);
  console.log(`\n=== ${id} (${th}) — vM${p.vM} vA${p.vA} ===`);
  console.log(`bpm ${w.bpm} -> ${p.bpm}   grund ${w.grund}   ${p.melodieStimme}/${p.zweitStimme}  ${p.harmonieStimme}`);
  console.log(`farbe [${w.farbe}] -> [${p.farbe}]`);
  for (let i = 0; i < a.length; i++) {
    const mark = a[i] === b[i] && w.akkorde[i] === p.akkorde[i] ? '  ' : '* ';
    console.log(`${mark}T${i + 1} akk ${String(w.akkorde[i]).padStart(2)}->${String(p.akkorde[i]).padStart(2)} | ${a[i]}`);
    if (a[i] !== b[i]) console.log(`             ${' '.repeat(11)}| ${b[i]}`);
  }
  console.log('  Halbtoene:', JSON.stringify(p.melodie));
  console.log('  Akkorde:  ', JSON.stringify(p.akkorde));
  const t = p.melodie.filter((n) => n[0] !== null).map((n) => n[0] as number);
  console.log(`  Melodie ${(p.grund*Math.pow(2,Math.min(...t)/12+1)).toFixed(1)}..${(p.grund*Math.pow(2,Math.max(...t)/12+1)).toFixed(1)} Hz, Arpeggio-Spitze ${(p.grund*Math.pow(2,(Math.max(...p.akkorde)+12)/12)).toFixed(1)} Hz, Umlauf ${(60/p.bpm/2*64).toFixed(1)} s`);
}
zeigeStueck('w3-07', 'rust');
for (const id of ['w3-01','w3-02','w3-03','w3-04','w3-05','w3-06']) zeigeStueck(id, 'rust');
