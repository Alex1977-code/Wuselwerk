import { describe, expect, it } from 'vitest';
import { AVATARE, NAME_MAX, frischesProfil, nameSaeubern } from '../src/profil';

describe('Spielerprofil', () => {
  it('säubert Namen: Leerraum, Länge, nie leer', () => {
    expect(nameSaeubern('  Alex  ')).toBe('Alex');
    expect(nameSaeubern('a'.repeat(30))).toHaveLength(NAME_MAX);
    expect(nameSaeubern('   ')).toBe('Wusel');
    expect(nameSaeubern('Mia  und\tPapa')).toBe('Mia und Papa');
  });

  it('kennt zwölf Avatare und beginnt mit der Lockenwolke', () => {
    // Zwölf wie das Blatt (avatare.webp, 4 x 3) — die Liste ist dessen
    // Reihenfolge, ein Längenfehler hieße: falsches Porträt beim Antippen.
    expect(AVATARE).toHaveLength(12);
    const ids = new Set(AVATARE.map((a) => a.id));
    expect(ids.size).toBe(12);
    expect(AVATARE[frischesProfil().avatar].id).toBe('wolke');
  });
});
