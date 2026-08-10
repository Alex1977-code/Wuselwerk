import type { SkillId } from '../core/types';

/**
 * Berufssymbole. Bewusst grob und kantig — sie muessen auf 36 Punkt Breite
 * eindeutig sein und dieselbe Silhouettenlogik tragen wie die Figuren.
 */
export function drawSkillIcon(
  ctx: CanvasRenderingContext2D,
  id: SkillId,
  cx: number,
  cy: number,
  s: number,
  color: string,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.6, s * 0.13);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const u = s / 2;

  switch (id) {
    case 'climber':
      // Leiter mit Figur daneben
      ctx.beginPath();
      ctx.moveTo(-u * 0.2, u);
      ctx.lineTo(-u * 0.2, -u);
      ctx.moveTo(u * 0.7, u);
      ctx.lineTo(u * 0.7, -u);
      for (let i = -2; i <= 2; i++) {
        ctx.moveTo(-u * 0.2, (i * u) / 2.4);
        ctx.lineTo(u * 0.7, (i * u) / 2.4);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-u * 0.95, u * 0.2);
      ctx.lineTo(-u * 0.95, -u * 0.9);
      ctx.stroke();
      break;

    case 'floater':
      ctx.beginPath();
      ctx.arc(0, u * 0.1, u * 0.9, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, u * 0.1);
      ctx.lineTo(0, u * 0.95);
      ctx.stroke();
      break;

    case 'bomber':
      ctx.beginPath();
      ctx.arc(0, u * 0.25, u * 0.66, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(u * 0.3, -u * 0.3);
      ctx.quadraticCurveTo(u * 0.85, -u * 0.75, u * 0.55, -u * 1.0);
      ctx.stroke();
      break;

    case 'blocker':
      ctx.beginPath();
      ctx.moveTo(-u, -u * 0.25);
      ctx.lineTo(u, -u * 0.25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -u * 0.25);
      ctx.lineTo(0, u * 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -u * 0.72, u * 0.28, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'builder':
      ctx.beginPath();
      ctx.moveTo(-u, u * 0.85);
      ctx.lineTo(-u * 0.3, u * 0.85);
      ctx.lineTo(-u * 0.3, u * 0.15);
      ctx.lineTo(u * 0.35, u * 0.15);
      ctx.lineTo(u * 0.35, -u * 0.55);
      ctx.lineTo(u, -u * 0.55);
      ctx.stroke();
      break;

    case 'basher':
      ctx.beginPath();
      ctx.moveTo(u * 0.75, -u);
      ctx.lineTo(u * 0.75, u);
      ctx.stroke();
      arrow(ctx, -u * 0.9, 0, u * 0.45, 0, u * 0.34);
      break;

    case 'miner':
      ctx.beginPath();
      ctx.moveTo(-u, u * 0.9);
      ctx.lineTo(u, u * 0.9);
      ctx.stroke();
      arrow(ctx, -u * 0.7, -u * 0.75, u * 0.45, u * 0.3, u * 0.34);
      break;

    case 'digger':
      ctx.beginPath();
      ctx.moveTo(-u, -u * 0.85);
      ctx.lineTo(u, -u * 0.85);
      ctx.stroke();
      arrow(ctx, 0, -u * 0.45, 0, u * 0.75, u * 0.34);
      break;
  }
  ctx.restore();
}

function arrow(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  head: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - head * Math.cos(a - 0.45), y1 - head * Math.sin(a - 0.45));
  ctx.lineTo(x1 - head * Math.cos(a + 0.45), y1 - head * Math.sin(a + 0.45));
  ctx.closePath();
  ctx.fill();
}
