import type { CSSProperties } from 'react';
import type { Couleur } from './types';

export const COULEURS: Record<Couleur, { hex: string; ink: string; label: string }> = {
  rouge: { hex: '#e1261c', ink: '#ffffff', label: 'Rouge' },
  bleu: { hex: '#2f5bff', ink: '#ffffff', label: 'Bleu' },
  or: { hex: '#d4a73c', ink: '#0a0a0b', label: 'Or' },
  blanc: { hex: '#f5f3ee', ink: '#0a0a0b', label: 'Blanc' },
};

/** Variables CSS d'accent d'une soirée : --accent (fond) et --accent-ink (texte dessus). */
export function accent(c: Couleur): CSSProperties {
  const { hex, ink } = COULEURS[c];
  return { ['--accent' as string]: hex, ['--accent-ink' as string]: ink };
}
