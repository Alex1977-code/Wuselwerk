import { uiBild } from '../art/ui';

/**
 * Die gemalten Avatar-Portraets (`avatare.webp`, grafikbedarf.md §3.9).
 *
 * Zwoelf Zellen auf einem Blatt, vier Spalten mal drei Zeilen, jede Zelle
 * eine runde Scheibe mit Kopf und Schultern. Die Identitaet eines Avatars
 * tragen Haarfarbe, Haarsilhouette und Scheibenfarbe — deshalb ist die
 * Zelle schon das ganze Erkennungszeichen und braucht keinen Ring darum.
 *
 * Der Index ist derselbe wie in `AVATARE` (`src/profil.ts`); wer die
 * Reihenfolge des Blattes aendert (Bau in `scripts/grafik-aufbereiten.py`),
 * muss beide Listen aendern.
 */

const SPALTEN = 4;
const ZEILEN = 3;

/**
 * Ein Avatar-Portraet, mittig auf (x, y), `groesse` = Durchmesser.
 *
 * `true`, wenn gezeichnet. Fehlt das Blatt oder ist es noch nicht
 * entschluesselt, zeichnet der Aufrufer seinen Rueckfall (Figur im Ring) —
 * wie bei jedem Bildweg des Spiels.
 */
export function drawAvatar(
  ctx: CanvasRenderingContext2D,
  index: number,
  x: number,
  y: number,
  groesse: number,
): boolean {
  const blatt = uiBild('avatare');
  if (!blatt) return false;
  const zelle = blatt.naturalWidth / SPALTEN;
  const i = Math.max(0, Math.min(SPALTEN * ZEILEN - 1, Math.round(index)));
  const sx = (i % SPALTEN) * zelle;
  const sy = Math.floor(i / SPALTEN) * zelle;
  ctx.save();
  // Der Kreisbeschnitt haelt die Nachbarzelle sicher draussen, auch wenn
  // die Scheibe der Lieferung bis an den Zellrand reicht.
  ctx.beginPath();
  ctx.arc(x, y, groesse / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(blatt, sx, sy, zelle, zelle, x - groesse / 2, y - groesse / 2, groesse, groesse);
  ctx.restore();
  return true;
}
