import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { host: '0.0.0.0', port: 5173 },
  build: {
    target: 'es2020',
    outDir: 'dist',
    // Sprite-Blätter als Data-URI einbetten statt als eigene Datei ablegen.
    // Sonst verliert die Einzeldatei aus scripts/build-single.mjs die Grafik
    // stillschweigend und fällt auf die prozedurale Zeichnung zurück. Ein
    // Blatt in 1x bleibt klein genug, dass das nicht ins Gewicht fällt.
    assetsInlineLimit: 512 * 1024,
  },
});
