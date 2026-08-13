/**
 * Gemalte Oberflaechenbilder — Kulisse, Knoepfe, Karte, Titel.
 *
 * Die Dateien entstehen aus `grafik/` durch `scripts/grafik-aufbereiten.py`
 * (Freistellung, Entfaerbung, Blattbau) und liegen hier fertig zum Einbetten:
 * Der Bau loest sie ueber `assetsInlineLimit` zu Data-URIs auf, es gibt also
 * keine Netzanfrage und keinen Ladefehler zur Laufzeit.
 *
 * ## Warum jeder Aufrufer mit `null` rechnen muss
 *
 * Eine Data-URI ist sofort da, aber **entschluesselt** wird sie trotzdem
 * asynchron — die ersten ein, zwei Bilder nach dem Start koennen ohne das
 * Bild gezeichnet werden. Jeder Abnehmer behaelt deshalb seinen prozeduralen
 * Weg als Rueckfall: Fehlt ein Bild (oder ist es noch nicht entschluesselt),
 * sieht das Spiel aus wie vor dem Einbau, statt weiss zu bleiben. Genau so
 * macht es der Figuren-Atlas (`src/art/index.ts`) seit jeher.
 */

const urls = import.meta.glob('./*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const bilder = new Map<string, HTMLImageElement>();

/**
 * Liefert das fertig entschluesselte Bild, sonst `null`.
 *
 * Der erste Aufruf stoesst das Entschluesseln an; solange es laeuft, faellt
 * der Aufrufer auf seine prozedurale Zeichnung zurueck und fragt im
 * naechsten Bild wieder. In Umgebungen ohne DOM (Tests) gibt es nie ein
 * Bild — auch das ist der Rueckfallweg, kein Fehler.
 */
export function uiBild(name: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  let img = bilder.get(name);
  if (!img) {
    const url = urls[`./${name}.webp`];
    if (!url) return null;
    img = new Image();
    img.src = url;
    bilder.set(name, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}
