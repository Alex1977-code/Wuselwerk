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

export function findAtlasSource(): AtlasSource | null {
  for (const [path, manifest] of Object.entries(manifests)) {
    const base = path.replace(/\.atlas\.json$/, '');
    const url = images[`${base}.webp`] ?? images[`${base}.png`];
    if (url) return { manifest, url, name: base.replace('./', '') };
  }
  return null;
}
