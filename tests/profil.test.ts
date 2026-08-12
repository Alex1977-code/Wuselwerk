import { describe, expect, it } from 'vitest';
import { AVATARE, NAME_MAX, frischesProfil, nameSaeubern } from '../src/profil';

describe('Spielerprofil', () => {
  it('säubert Namen: Leerraum, Länge, nie leer', () => {
    expect(nameSaeubern('  Alex  ')).toBe('Alex');
    expect(nameSaeubern('a'.repeat(30))).toHaveLength(NAME_MAX);
    expect(nameSaeubern('   ')).toBe('Wusel');
    expect(nameSaeubern('Mia  und\tPapa')).toBe('Mia und Papa');
  });

  it('kennt sechs Avatarfarben und beginnt mit See', () => {
    expect(AVATARE).toHaveLength(6);
    const ids = new Set(AVATARE.map((a) => a.id));
    expect(ids.size).toBe(6);
    expect(AVATARE[frischesProfil().avatar].id).toBe('see');
  });
});
