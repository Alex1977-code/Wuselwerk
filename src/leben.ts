/**
 * Leben und Versuche — das Tagesbudget.
 *
 * ## Die Regeln (aus der Marketing-Untersuchung, `docs/leben-entwurf.md`)
 *
 * - **Fünf Leben je Tag.** Fünf ist der Genre-Anker (Candy Crush, Royal
 *   Match, Gardenscapes), und bei diesem Spiel trifft die Grenze fast nur die
 *   Frust-Schleife: Der Zeitrücklauf fängt die meisten Fehler schon **im**
 *   Level ab, echte Niederlagen sind selten, Siege kosten nichts.
 * - **Abzug nur für ein verlorenes Level** — und für einen Abbruch nach der
 *   Schnupperfrist (30 s): Wer ein Level ansieht und gleich wieder geht, hat
 *   nichts verbraucht; wer kurz vor der Niederlage den Stecker zieht, schon.
 * - **Herzschutzregel** (Leveldesign-Runde, Leitsatz 4): Eine Niederlage,
 *   bei der die **Uhr** abgelaufen ist, kostet kein Leben. Die geschärften
 *   Uhren machen den ersten Versuch oft zum Lernversuch — Denkzeit darf
 *   kein Kennenlern-Leben fressen. Eine Niederlage mit Restzeit (alle
 *   verloren) zahlt weiterhin. Umgesetzt in `Game.finish`.
 * - **Lebensfreier Lehrgang**: w1-01 bis w1-07 kosten nie ein Leben, auf
 *   keinem Weg (`lebensfrei` unten).
 * - **Tagesbudget statt Regeneration.** Kein „nächstes Leben in 27:14", kein
 *   Zurückhol-Wecker: Um Mitternacht (Gerätezeit) ist der Vorrat wieder voll,
 *   vorher nicht. Das ist für Eltern und Kinder transparent und wirkt als
 *   natürliche Spielzeitgrenze statt als Termin.
 * - **Ein Video, ein Leben, höchstens drei am Tag.** Danach ist wirklich
 *   Schluss — „Genug gewuselt für heute" —, weitere Angebote gibt es nicht.
 *   In dieser Fassung läuft noch kein echter Werbefilm; der Knopf sagt das
 *   ehrlich dazu. Käufliche Pakete sind Merkliste, nicht Gegenwart.
 * - **Im Testmodus unbegrenzt**: `?test` in der Adresse schaltet das ganze
 *   System ab.
 *
 * ## Bau
 *
 * Die Regeln sind reine Funktionen über einem kleinen Stand — prüfbar ohne
 * Browser. Nur `ladeLeben`/`speichereLeben` fassen den `localStorage` an,
 * mit derselben Vorsicht wie `storage.ts`: Ohne Speicher (Privatmodus) gibt
 * es einfach jeden Tag frische Leben.
 */

export const LEBEN_PRO_TAG = 5;
export const VIDEOS_PRO_TAG = 3;
/** Schnupperfrist: Abbruch vor dieser Spielzeit kostet nichts, in Sekunden. */
export const FREI_SEKUNDEN = 30;

/**
 * Der lebensfreie Lehrgang — w1-01 bis w1-07 kosten nie ein Leben.
 *
 * Beschluss der Leveldesign-Runde (Leitsatz 4, `docs/leveldesign-runde.md`):
 * Haerte darf Denkzeit kosten, nie Kennenlern-Leben. Die sieben
 * Lehrgangslevel stellen je ein Konzept vor; wer dort scheitert, lernt
 * gerade — ein Lebensabzug dafuer bestraft das Lernen selbst. Die Grenze
 * liegt vor dem Kapitel "Pruefung" (w1-08), wo das Sterntor die Kurve
 * ohnehin anzieht.
 */
export function lebensfrei(levelId: string): boolean {
  const m = /^w1-0([1-7])$/.exec(levelId);
  return m !== null;
}

export interface LebenStand {
  /** Kalendertag der Gerätezeit, als `YYYY-MM-DD`. */
  tag: string;
  uebrig: number;
  /** Heute schon eingelöste Videos. */
  videos: number;
}

/** Der Kalendertag der Gerätezeit — Mitternacht ist die Grenze des Budgets. */
export function heuteTag(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const t = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${t}`;
}

export function frischerStand(tag: string): LebenStand {
  return { tag, uebrig: LEBEN_PRO_TAG, videos: 0 };
}

/** Wendet den Tageswechsel an: ein anderer Tag heisst voller Vorrat. */
export function tagesWechsel(s: LebenStand, heute: string): LebenStand {
  return s.tag === heute ? s : frischerStand(heute);
}

export function abziehen(s: LebenStand): LebenStand {
  return { ...s, uebrig: Math.max(0, s.uebrig - 1) };
}

/**
 * Ein Video einlösen: ein Leben zurück, höchstens dreimal am Tag.
 * `null` heisst: Das Kontingent ist erschöpft — der Aufrufer zeigt dann die
 * freundliche Verabschiedung statt eines weiteren Angebots.
 */
export function videoEinloesen(s: LebenStand): LebenStand | null {
  if (s.videos >= VIDEOS_PRO_TAG) return null;
  return { ...s, uebrig: s.uebrig + 1, videos: s.videos + 1 };
}

// --- Speicher ---------------------------------------------------------------

const KEY = 'wuselwerk.leben.v1';

export function ladeLeben(): LebenStand {
  const heute = heuteTag();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return frischerStand(heute);
    const s = JSON.parse(raw) as LebenStand;
    if (
      typeof s.tag !== 'string' ||
      typeof s.uebrig !== 'number' ||
      typeof s.videos !== 'number'
    ) {
      return frischerStand(heute);
    }
    return tagesWechsel(s, heute);
  } catch {
    return frischerStand(heute);
  }
}

export function speichereLeben(s: LebenStand): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* Privatmodus — dann eben jeden Tag frische Leben. */
  }
}

/**
 * Der Testmodus: `?test` in der Adresse schaltet das Lebenssystem ab.
 *
 * Absichtlich die Adresse und kein gespeicherter Schalter — ein Kind, das
 * das Spiel bedient, findet keinen Weg hinein, und wer testet, teilt einfach
 * eine andere Adresse.
 */
export function lebenUnbegrenzt(): boolean {
  try {
    return new URLSearchParams(location.search).has('test');
  } catch {
    return false;
  }
}
