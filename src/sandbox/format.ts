const one = { minimumFractionDigits: 1, maximumFractionDigits: 1 };
export const num1 = (x: number) => x.toLocaleString('de-DE', one);
export const pct = (share: number) => Number.isFinite(share) ? `${num1(share * 100)} %` : '–';
export const count = (n: number) => Math.round(n).toLocaleString('de-DE');
