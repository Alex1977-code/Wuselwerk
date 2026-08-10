/**
 * Packt den gebauten Prototyp in eine einzige HTML-Datei.
 *
 * Erzeugt zwei Fassungen aus denselben Bausteinen:
 *   dist/wuselwerk-single.html    vollständige Seite, überall direkt zu öffnen
 *   dist/wuselwerk-artifact.html  nur Seiteninhalt, für Hoster, die Rumpf und
 *                                 Kopf selbst beisteuern
 *
 * Voraussetzung: `npx vite build` lief vorher.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const assets = readdirSync(join(DIST, 'assets'));
const jsName = assets.find((f) => f.endsWith('.js'));
const cssName = assets.find((f) => f.endsWith('.css'));
if (!jsName) throw new Error('Kein JS-Bündel in dist/assets — erst `vite build` laufen lassen.');

const js = readFileSync(join(DIST, 'assets', jsName), 'utf8');
const css = cssName ? readFileSync(join(DIST, 'assets', cssName), 'utf8') : '';

// Ein wörtliches </script> im Bündel würde den Skriptblock vorzeitig schliessen.
const safeJs = js.replace(/<\/script/gi, '<\\/script');

/**
 * Fassung um das Spielfeld. Farben und Schrift stammen aus dem HUD des Spiels
 * (src/render/hud.ts), damit Rahmen und Spiel dieselbe Sprache sprechen.
 *
 * Bewusst einthemig dunkel: Das Spiel ist eine Nachtszene und lässt sich nicht
 * umfärben — eine helle Fassung würde dagegen schlagen. Alle Farben sind
 * deshalb ausdrücklich gesetzt, damit die Seite auf jedem Untergrund hält.
 */
const wrapperCss = `
:root {
  color-scheme: dark;
  --grund: #05070c;
  --panel: #0e131c;
  --linie: #27334a;
  --text: #dce6f5;
  --leise: #7b8ba3;
  --akzent: #ffd23f;
}
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  background: var(--grund);
  color: var(--text);
  overflow: hidden;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
}
body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.rahmen {
  width: 100%;
  height: 100%;
  position: relative;
  background: var(--grund);
}
#spielfeld {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.fusszeile { display: none; }

/* Auf breiten Schirmen im Hochformat zeigen — so ist das Spiel entworfen:
   sechs Zoll, einhändig. Breitziehen würde die Gestaltungsvorgabe verfälschen. */
@media (min-width: 560px) {
  body { padding: 24px; box-sizing: border-box; }
  .rahmen {
    width: auto;
    aspect-ratio: 390 / 844;
    height: min(844px, calc(100dvh - 108px));
    border: 1px solid var(--linie);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.55);
  }
  .fusszeile {
    display: block;
    max-width: 46ch;
    text-align: center;
    font-size: 12px;
    line-height: 1.6;
    color: var(--leise);
    margin: 0;
  }
  .fusszeile b { color: var(--akzent); font-weight: 600; }
}
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`.trim();

const fusszeile =
  '<p class="fusszeile">Erst einen <b>Beruf</b> wählen, dann eine Figur antippen. ' +
  'Finger gedrückt halten bremst die Zeit auf ein Viertel und blendet die Lupe ein.</p>';

const body = `<title>Wuselwerk</title>
<style>
${css}
${wrapperCss}
</style>
<div class="rahmen"><canvas id="spielfeld"></canvas></div>
${fusszeile}
<script type="module">
${safeJs}
</script>`;

writeFileSync(join(DIST, 'wuselwerk-artifact.html'), body);

writeFileSync(
  join(DIST, 'wuselwerk-single.html'),
  `<!doctype html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#05070c">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%230e131c'/%3E%3Crect x='6' y='2' width='4' height='4' fill='%23f4d7ac'/%3E%3Crect x='6' y='6' width='4' height='6' fill='%232fc9b8'/%3E%3Crect x='6' y='12' width='4' height='2' fill='%231d8f85'/%3E%3C/svg%3E">
</head>
<body>
${body}
</body>
</html>
`,
);

const kb = (s) => `${Math.round(s.length / 1024)} kB`;
console.log(`dist/wuselwerk-single.html    ${kb(js)} Skript, alles eingebettet`);
console.log(`dist/wuselwerk-artifact.html  nur Seiteninhalt`);
