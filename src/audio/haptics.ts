import { DeathCause, type WorldEvent } from '../core/types';

/**
 * Haptik (GDD §7) — laut Dokument gut zwanzig Prozent des Spielgefuehls.
 *
 * Ehrliche Einschraenkung: Die Vibrations-Schnittstelle des Browsers gibt es
 * praktisch nur unter Android. Safari auf dem iPhone unterstuetzt sie nicht,
 * dort bleibt das Spiel still — dieselbe Rueckmeldung waere erst in einer
 * nativen Fassung moeglich. `supported` sagt, woran man ist.
 */
export class Haptics {
  enabled = true;

  get supported(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  }

  private buzz(pattern: number | number[]): void {
    if (!this.enabled || !this.supported) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      /* Manche Browser blocken ohne Nutzergeste — dann eben nicht. */
    }
  }

  handle(events: WorldEvent[]): void {
    if (!this.enabled || !this.supported) return;
    // Pro Bild nur das staerkste Ereignis, sonst brummt das Geraet dauerhaft.
    let strongest: 'none' | 'assign' | 'death' | 'boom' = 'none';
    for (const e of events) {
      if (e.type === 'explode') strongest = 'boom';
      else if (e.type === 'died' && strongest !== 'boom') strongest = 'death';
      else if (e.type === 'assign' && strongest === 'none') strongest = 'assign';
    }
    switch (strongest) {
      case 'assign':
        this.buzz(8); // kurzer, trockener Tick
        break;
      case 'death':
        this.buzz(26); // ein kurzer, tiefer Puls — man spuert jeden Verlust
        break;
      case 'boom':
        this.buzz([40, 30, 70]); // harter Einzelschlag mit Nachsatz
        break;
      default:
        break;
    }
  }

  /** Rueckmeldung beim Antippen eines Bedienfelds. */
  tap(): void {
    this.buzz(6);
  }
}

export type { DeathCause };
