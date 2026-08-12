/**
 * Das Spielerprofil — Name und Avatar, lokal.
 *
 * ## Was ein Avatar hier ist
 *
 * Kein zweites Figurenblatt. Die Figur ist **ein** Wusel (blaues Haar, grüne
 * Tunika — die Marke), und ein Avatar ist die **Bandfarbe**, die man sich
 * aussucht: derselbe Farbkreis, den die Berufe im Spiel tragen, als
 * persönliches Erkennungszeichen im Ring um das Porträt. Das ist bewusst
 * billig gebaut (kein Umfärben des gebackenen Blatts, keine zweite
 * Bilddatei) und trotzdem eine echte Wahl.
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
  /** Ringfarbe des Porträts — aus dem Berufsfarbkreis. */
  farbe: string;
  label: string;
}

/**
 * Sechs Farben aus der Berufspalette (`schopf.ts`), unter eigenem Namen:
 * Der Avatar sagt „meine Farbe", nicht „mein Beruf".
 */
export const AVATARE: Avatar[] = [
  { id: 'mohn', farbe: '#E8674F', label: 'Mohn' },
  { id: 'honig', farbe: '#E2B044', label: 'Honig' },
  { id: 'see', farbe: '#569CB2', label: 'See' },
  { id: 'moos', farbe: '#80A86C', label: 'Moos' },
  { id: 'flieder', farbe: '#A87EBE', label: 'Flieder' },
  { id: 'rose', farbe: '#EE9EB0', label: 'Rose' },
];

export const NAME_MAX = 12;
const VORGABE = 'Wusel';

/** Namen säubern: sichtbare Zeichen, höchstens zwölf, nie leer. */
export function nameSaeubern(roh: string): string {
  const sauber = roh.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
  return sauber.length > 0 ? sauber : VORGABE;
}

export function frischesProfil(): Profil {
  return { name: VORGABE, avatar: 2 };
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
