/**
 * Das Spielerprofil — Name und Avatar, lokal.
 *
 * ## Was ein Avatar hier ist
 *
 * Ein **gemaltes Portraet** vom Avatarblatt (`src/art/ui/avatare.webp`,
 * grafikbedarf.md §3.9): dieselbe Wusel-Anatomie, aber je Variante eine
 * eigene Haarfarbe, Haarsilhouette und Scheibenfarbe — das sind die drei
 * Merkmale, die ein Portraet bei 28 Pixeln noch unterscheiden. Die Liste
 * hier ist die **Reihenfolge des Blattes**; wer sie aendert, muss den Bau
 * in `scripts/grafik-aufbereiten.py` mitaendern.
 *
 * Vorher war der Avatar nur eine Ringfarbe um das Figurenportraet. Die
 * `farbe` je Eintrag bleibt dafuer stehen: Sie ist der Rueckfall, wenn das
 * Blatt fehlt oder noch nicht entschluesselt ist (Haarfarbe der Variante).
 *
 * ## Warum lokal
 *
 * Es gibt kein Konto und keinen Server — das Spiel ist eine einzige Datei.
 * Name und Avatar liegen im `localStorage` des Geräts, mit derselben
 * Vorsicht wie der Fortschritt: Ohne Speicher gilt der Vorgabename.
 */

export interface Profil {
  name: string;
  /** Index in `AVATARE`. */
  avatar: number;
}

export interface Avatar {
  id: string;
  /** Haarfarbe der Variante — Ringfarbe des Rueckfall-Porträts. */
  farbe: string;
  label: string;
}

/**
 * Die zwoelf Varianten des Blattes, benannt nach ihrer Frisur — sie ist
 * die Silhouette und damit das, was man auswaehlt. Grünes Haar (Wellenbob,
 * Lockenkrone) steht laut Vorgabe nie über blauer Tunika; das ist im
 * Blatt so gemalt und hier nur festgehalten.
 */
export const AVATARE: Avatar[] = [
  { id: 'wolke', farbe: '#3851B6', label: 'Lockenwolke' },
  { id: 'wirbel', farbe: '#E2B044', label: 'Wirbelkopf' },
  { id: 'puschel', farbe: '#A87EBE', label: 'Puschel' },
  { id: 'dutt', farbe: '#C4553A', label: 'Dutt' },
  { id: 'welle', farbe: '#6E8F3A', label: 'Wellenbob' },
  { id: 'schnee', farbe: '#E4E9EE', label: 'Schneelocke' },
  { id: 'topf', farbe: '#2A2E36', label: 'Topfschnitt' },
  { id: 'stachel', farbe: '#3F9E96', label: 'Stachel' },
  { id: 'zopf', farbe: '#3851B6', label: 'Zöpfe' },
  { id: 'kamm', farbe: '#C4553A', label: 'Lockenkamm' },
  { id: 'schweif', farbe: '#A87EBE', label: 'Schweif' },
  { id: 'krone', farbe: '#6E8F3A', label: 'Lockenkrone' },
];

export const NAME_MAX = 12;
const VORGABE = 'Wusel';

/** Namen säubern: sichtbare Zeichen, höchstens zwölf, nie leer. */
export function nameSaeubern(roh: string): string {
  const sauber = roh.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
  return sauber.length > 0 ? sauber : VORGABE;
}

export function frischesProfil(): Profil {
  // Die Lockenwolke ist die Vorgabe: blaues Haar — die Figur, wie sie im
  // Spiel laeuft. Wer nichts waehlt, sieht sich selbst.
  return { name: VORGABE, avatar: 0 };
}

// --- Speicher ---------------------------------------------------------------

const KEY = 'wuselwerk.profil.v1';

export function ladeProfil(): Profil {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return frischesProfil();
    const p = JSON.parse(raw) as Profil;
    if (typeof p.name !== 'string' || typeof p.avatar !== 'number') return frischesProfil();
    return {
      name: nameSaeubern(p.name),
      avatar: Math.max(0, Math.min(AVATARE.length - 1, Math.round(p.avatar))),
    };
  } catch {
    return frischesProfil();
  }
}

export function speichereProfil(p: Profil): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* Privatmodus — dann eben der Vorgabename. */
  }
}
