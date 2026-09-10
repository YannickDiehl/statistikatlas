export type DataPair = { id: string; x: number; y: number };
export type NullableNumber = number | null;

export interface Statistics {
  n: number;
  sumX: NullableNumber;
  sumY: NullableNumber;
  meanX: NullableNumber;
  meanY: NullableNumber;
  deviationsX: NullableNumber[];
  deviationsY: NullableNumber[];
  squaredDeviationsX: NullableNumber[];
  squaredDeviationsY: NullableNumber[];
  ssX: NullableNumber;
  ssY: NullableNumber;
  df: number;
  varianceX: NullableNumber;
  varianceY: NullableNumber;
  sdX: NullableNumber;
  sdY: NullableNumber;
  zX: NullableNumber[];
  zY: NullableNumber[];
  crossProducts: NullableNumber[];
  crossProductSum: NullableNumber;
  covariance: NullableNumber;
  sdProduct: NullableNumber;
  pearson: NullableNumber;
}

export const defaultPairs: DataPair[] = [
  { id: 'fall-1', x: 1, y: 2 },
  { id: 'fall-2', x: 2, y: 4 },
  { id: 'fall-3', x: 3, y: 5 },
  { id: 'fall-4', x: 4, y: 4 },
  { id: 'fall-5', x: 5, y: 5 },
];

const finite = (value: number): NullableNumber => Number.isFinite(value) ? (Object.is(value, -0) ? 0 : value) : null;

// Kahan summation limits rounding loss when values have different magnitudes.
function sum(values: NullableNumber[]): NullableNumber {
  let total = 0;
  let compensation = 0;
  for (const value of values) {
    if (value === null) return null;
    const corrected = value - compensation;
    const next = total + corrected;
    compensation = (next - total) - corrected;
    total = next;
  }
  return finite(total);
}

/**
 * Calculates descriptive sample statistics on the same complete pairs.
 * Input coordinates must be finite numbers; invalid input is rejected rather
 * than silently removing rows and breaking alignment with the displayed table.
 * Undefined results, including constant-series correlations, are always null.
 */
export function calculateStatistics(pairs: DataPair[]): Statistics {
  if (pairs.some(({ x, y }) => !Number.isFinite(x) || !Number.isFinite(y))) {
    throw new RangeError('Jedes Wertepaar muss zwei endliche Zahlen enthalten.');
  }

  const n = pairs.length;
  const x = pairs.map((pair) => pair.x);
  const y = pairs.map((pair) => pair.y);
  const sumX = sum(x);
  const sumY = sum(y);
  // Scaling before summation avoids overflow of the mean when the sum itself
  // overflows, without assigning a misleading finite value to that sum.
  // Exactly constant decimal-valued samples must not acquire artificial
  // dispersion through round-off in sum(value / n).
  const meanX = n > 0 ? (x.every(value => value === x[0]) ? x[0] : sum(x.map((value) => value / n))) : null;
  const meanY = n > 0 ? (y.every(value => value === y[0]) ? y[0] : sum(y.map((value) => value / n))) : null;
  const deviationsX = x.map((value) => meanX === null ? null : finite(value - meanX));
  const deviationsY = y.map((value) => meanY === null ? null : finite(value - meanY));
  const squaredDeviationsX = deviationsX.map((value) => value === null ? null : finite(value * value));
  const squaredDeviationsY = deviationsY.map((value) => value === null ? null : finite(value * value));
  const ssX = sum(squaredDeviationsX);
  const ssY = sum(squaredDeviationsY);
  const df = Math.max(0, n - 1);
  const varianceX = n > 1 && ssX !== null ? finite(ssX / df) : null;
  const varianceY = n > 1 && ssY !== null ? finite(ssY / df) : null;
  const sdX = varianceX === null ? null : finite(Math.sqrt(varianceX));
  const sdY = varianceY === null ? null : finite(Math.sqrt(varianceY));
  const zX = deviationsX.map((value) => value !== null && sdX !== null && sdX > 0 ? finite(value / sdX) : null);
  const zY = deviationsY.map((value) => value !== null && sdY !== null && sdY > 0 ? finite(value / sdY) : null);
  const crossProducts = deviationsX.map((dx, index) => {
    const dy = deviationsY[index];
    return dx === null || dy === null ? null : finite(dx * dy);
  });
  const crossProductSum = sum(crossProducts);
  const covariance = n > 1 && crossProductSum !== null ? finite(crossProductSum / df) : null;
  const sdProduct = sdX === null || sdY === null ? null : finite(sdX * sdY);
  // This is algebraically equivalent to covariance / (sdX * sdY). Dividing
  // sequentially avoids overflow in the product of large standard deviations.
  const rawPearson = covariance !== null && sdX !== null && sdX > 0 && sdY !== null && sdY > 0
    ? finite((covariance / sdX) / sdY) : null;
  const pearson = rawPearson === null ? null : Math.max(-1, Math.min(1, rawPearson));

  return {
    n, sumX, sumY, meanX, meanY, deviationsX, deviationsY,
    squaredDeviationsX, squaredDeviationsY, ssX, ssY, df,
    varianceX, varianceY, sdX, sdY, zX, zY,
    crossProducts, crossProductSum, covariance, sdProduct, pearson,
  };
}

export function formatNumber(value: NullableNumber | undefined, maximumFractionDigits = 3): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'nicht definiert';
  const threshold = 0.5 * 10 ** -maximumFractionDigits;
  return new Intl.NumberFormat('de-DE', {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(Math.abs(value) < threshold ? 0 : value);
}
