import { Game } from './game';
import './style.css';

const canvas = document.getElementById('spielfeld') as HTMLCanvasElement | null;
if (!canvas) throw new Error('Kein Spielfeld gefunden');

const game = new Game(canvas);
game.start();

// Haken für die automatisierte Sichtprobe (scripts/smoke.mjs).
(window as unknown as { __wuselwerk: Game }).__wuselwerk = game;

// Doppeltipp-Zoom und Gummiband-Scrollen ruinieren jedes Touchspiel.
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches.length > 1) e.preventDefault();
  },
  { passive: false },
);
