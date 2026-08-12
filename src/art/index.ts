import type { AtlasManifest } from '../render/atlas';

/**
 * Findet ein Blattpaar in diesem Ordner.
 *
 * Die Auflösung passiert beim Bauen, nicht zur Laufzeit — deshalb gibt es
 * keine Netzanfrage, die ins Leere laufen und eine Fehlermeldung erzeugen
 * könnte. Liegt hier nichts, ist das Ergebnis schlicht leer und das Spiel
 * zeichnet prozedural weiter.
 */
const manifests = import.meta.glob('./*.atlas.json', {
  eager: true,
  import: 'default',
}) as Record<string, AtlasManifest>;

// Beide Formate: Pixelblätter liegen als PNG, gemalte als WebP — bei weicher
// Schattierung ist PNG rund viermal so gross, und das Blatt liegt eingebettet
// in der Einzeldatei.
const images = import.meta.glob('./*.{png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export interface AtlasSource {
  manifest: AtlasManifest;
  url: string;
  name: string;
}

/**
 * Welche Figur das Spiel benutzt.
 *
 * **Ausdruecklich statt nach Dateiname.** Vorher nahm die Suche schlicht das
 * erste Blattpaar, das der Ordner hergab — solange dort genau eines lag, war das
 * unauffaellig. Mit einer zweiten Figur entschiede die alphabetische Reihenfolge
 * darueber, welche Figur im Spiel steht, und das ist keine Entscheidung, das ist
 * ein Zufall.
 *
 * Beide Blaetter bleiben im Bau. Das kostet die Einzeldatei rund neunzig
 * Kilobyte und ist es wert: Die Murmel ist damit nicht verloren, sondern eine
 * Zeile entfernt — und im Spiel ueber `debugFigur` sogar zur Laufzeit.
 */
export const FIGUR: 'wuselwerker' | 'erdmaennchen' | 'murmel' = 'wuselwerker';

/** Alle vorhandenen Blattpaare, nach Namen. */
export function alleAtlasQuellen(): Record<string, AtlasSource> {
  const out: Record<string, AtlasSource> = {};
  for (const [path, manifest] of Object.entries(manifests)) {
    const base = path.replace(/\.atlas\.json$/, '');
    const url = images[`${base}.webp`] ?? images[`${base}.png`];
    if (url) out[base.replace('./', '')] = { manifest, url, name: base.replace('./', '') };
  }
  return out;
}

export function findAtlasSource(name: string = FIGUR): AtlasSource | null {
  const alle = alleAtlasQuellen();
  // Der Rueckfall auf irgendein vorhandenes Blatt bleibt: Wer ein eigenes
  // Blattpaar in diesen Ordner legt, soll es sehen, ohne hier etwas zu aendern.
  return alle[name] ?? Object.values(alle)[0] ?? null;
}
