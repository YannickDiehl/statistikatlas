// Gemeinsame Formulierungen des Bereichs B11: p-Werte mit Bedingung, Faustregeln der Effektgrößen (wie mariposa 0.7.4).
import { num } from '../../format';

/** p mit zwei gültigen Ziffern, sehr kleine Werte als „p < 0,001“. */
export const pText = (p: number) => p < 0.001 ? 'p < 0,001' : p < 0.01 ? `p ≈ ${num(p, 3)}` : `p ≈ ${num(p)}`;
/** „in etwa 8 von 100“: wie oft ein so deutliches Ergebnis vorkäme, wenn es keinen Unterschied gäbe. */
export const pOften = (p: number) => p < 0.001 ? 'in weniger als 1 von 1.000' : p < 0.01 ? 'in weniger als 1 von 100' : `in etwa ${Math.round(p * 100)} von 100`;
/** „signifikant“ immer mit α. */
export const signif = (p: number) => `Bei α = 0,05 ist das ${p < 0.05 ? '' : 'nicht '}signifikant`;
/** Faustregel für r (wie mariposa): unter 0,1 vernachlässigbar, unter 0,3 klein, unter 0,5 mittel, sonst groß. */
export const rWord = (r: number) => r < 0.1 ? 'vernachlässigbar' : r < 0.3 ? 'klein' : r < 0.5 ? 'mittel' : 'groß';
/** Faustregel für ε² nach Kruskal–Wallis (wie mariposa): unter 0,01 vernachlässigbar, unter 0,06 klein, unter 0,14 mittel, sonst groß. */
export const epsWord = (e: number) => e < 0.01 ? 'vernachlässigbar' : e < 0.06 ? 'klein' : e < 0.14 ? 'mittel' : 'groß';
/** Faustregel für Kendalls W (wie mariposa): unter 0,1 vernachlässigbar, unter 0,3 schwach, unter 0,5 mittel, sonst stark. */
export const wWord = (w: number) => w < 0.1 ? 'vernachlässigbar' : w < 0.3 ? 'schwach' : w < 0.5 ? 'mittel' : 'stark';
