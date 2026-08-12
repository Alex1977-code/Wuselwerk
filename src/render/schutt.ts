import type { SkillId } from '../core/types';

/**
 * Schutt — der vierte Kanal, mit dem eine Figur ihren Beruf verraet.
 *
 * ## Warum das eine eigene Datei mit eigener Pruefung ist
 *
 * Die Vorlage nennt den Schutt den billigsten Lesbarkeitsgewinn im ganzen
 * System, und der Grund ist wahrnehmungspsychologisch: **Bewegung faellt im
 * Randbereich des Blicks auf, Form nicht.** Wer auf eine Stelle des Bildschirms
 * schaut, erkennt dreissig logische Pixel weiter keinen Werkzeugwinkel mehr —
 * aber er sieht, dass dort etwas wegfliegt, und in welche Richtung.
 *
 * Die **Richtung ist damit die Information**, nicht die Zierde. Und sie laesst
 * sich auf einem Standbild nicht pruefen: Drei Bildpunkte grosse Koerner sagen
 * dort gar nichts. Deshalb steht die Entscheidung hier als reine Funktion und
 * nicht im Zeichner — so kann ein Test festhalten, dass der Rammer nach hinten
 * wirft und der Graeber nach beiden Seiten, ohne dass jemand hinsehen muss.
 *
 * ## Wer wohin wirft
 *
 * | Beruf | wohin | warum |
 * |---|---|---|
 * | Rammer | waagerecht nach hinten | Er treibt geradeaus, das Material kommt hinter ihm heraus |
 * | Schraegbagger | nach hinten oben | Seine Achse zeigt nach vorn unten, der Auswurf entgegengesetzt |
 * | Graeber | nach oben zu **beiden** Seiten | Er steht im Loch, und aus einem Loch geht es nur hoch |
 * | Brueckenbauer | gar nicht | Er nimmt nichts weg, er legt etwas hin |
 */

/** Ein gerichteter Auswurf. Alle Laengen in logischen Pixeln. */
export interface SchuttWurf {
  /** Ursprung, gegenueber der Stelle des Ereignisses. */
  dx: number;
  dy: number;
  anzahl: number;
  farbe: string;
  tempo: number;
  /**
   * Waagerechte Grundrichtung: −1 nach hinten, +1 nach vorn.
   *
   * Bereits **gegen die Blickrichtung aufgeloest** — der Zeichner muss nichts
   * mehr spiegeln, und der Test kann die Richtung direkt ablesen.
   */
  seite: -1 | 1;
  /** Oeffnung des Kegels in Bogenmass. Eng, sonst liest man keine Richtung. */
  streu: number;
  /** Schub nach oben, als Anteil des Tempos. Negativ ist aufwaerts. */
  hoch: number;
}

/**
 * Lebensdauer eines Schuttkorns in Millisekunden.
 *
 * Vorher standen hier vierzig — bei sechzig Bildern je Sekunde sind das **zwei
 * Bilder**. Der Schutt war damit rechnerisch vorhanden und praktisch
 * unsichtbar; niemand liest eine Flugbahn aus zwei Bildern. Ein Drittel einer
 * Sekunde ist die Untergrenze, ab der das Auge eine Bahn sieht statt eines
 * Aufblitzens.
 */
export const SCHUTT_MS = 380;

/**
 * Die Lebensdauern aller uebrigen Partikelwolken, in Millisekunden.
 *
 * ## Warum sie hier stehen und nicht als Zahl im Aufruf
 *
 * Weil sie **alle zu kurz waren**, und niemand es gemerkt hat. Der Reihe nach,
 * vor dieser Aenderung: Stahlfunken 26, Brueckenstufe 30, Rettung 60, Tod 60,
 * Explosion 90, Rauch 140. Bei sechzig Bildern je Sekunde sind 26 ms **anderthalb
 * Bilder**. Selbst die Explosion — das lauteste Ereignis des Spiels — war nach
 * hoechstens acht Bildern vorbei.
 *
 * Das faellt niemandem auf, weil ein zu kurzer Partikel nicht falsch aussieht,
 * sondern **gar nicht** aussieht: Man haelt das Bild fuer partikellos und sucht
 * den Fehler woanders. Genau deshalb stehen die Zahlen jetzt beisammen, mit
 * einer Untergrenze, die ein Test festhaelt.
 *
 * ## Die Faustregel
 *
 * Etwa ein Drittel einer Sekunde ist die Schwelle, ab der das Auge eine **Bahn**
 * sieht statt eines Aufblitzens. Alles, dessen Flugrichtung etwas bedeutet, muss
 * darueber liegen. Rauch darf laenger stehen als das, was ihn erzeugt hat — er
 * ist die Erinnerung an das Ereignis, nicht das Ereignis.
 */
export const PARTIKEL_MS = {
  /** Der Feuerball. Das groesste Ereignis des Spiels darf man ansehen koennen. */
  explosionFeuer: 520,
  /** Der Rauch danach — er steht laenger und sinkt langsamer. */
  explosionRauch: 1100,
  /** Funken am Stahl. Kurz, aber nicht unsichtbar: Sie sagen „hier geht es nicht weiter". */
  stahl: 260,
  /** Holzsplitter beim Legen einer Stufe. Das kleinste Ereignis, also das kuerzeste. */
  bruecke: 240,
  /** Der Glitzer am Ausgang. Er gehoert zum Belohnungsmoment und darf nachhallen. */
  rettung: 620,
  /** Der Verlust einer Figur. Lange genug, dass man ihn bemerkt, auch wenn man woanders hinsieht. */
  tod: 480,
} as const;

/** Was dieser Beruf in dieser Blickrichtung auswirft. */
export function schuttWuerfe(skill: SkillId | undefined, dir: -1 | 1): SchuttWurf[] {
  const hinten = (dir === -1 ? 1 : -1) as -1 | 1;
  switch (skill) {
    case 'basher':
      return [
        { dx: -dir * 2, dy: 0, anzahl: 3, farbe: '#8a6236', tempo: 34, seite: hinten, streu: 0.5, hoch: -0.3 },
      ];
    case 'miner':
      return [
        { dx: -dir * 2, dy: -1, anzahl: 3, farbe: '#7d6a4e', tempo: 38, seite: hinten, streu: 0.45, hoch: -0.7 },
      ];
    case 'builder':
      return [];
    case 'digger':
    default:
      // Der einzige symmetrische Auswurf. Er steht ja mitten darin.
      return [
        { dx: -1, dy: -1, anzahl: 2, farbe: '#8a6236', tempo: 40, seite: -1, streu: 0.4, hoch: -1.15 },
        { dx: 1, dy: -1, anzahl: 2, farbe: '#8a6236', tempo: 40, seite: 1, streu: 0.4, hoch: -1.15 },
      ];
  }
}
