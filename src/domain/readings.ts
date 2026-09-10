import { formatNumber, type DataPair, type NullableNumber, type Statistics } from './statistics.ts';

export interface ConceptReading {
  value: string;
  label: string;
  calculation?: string;
}

const f = (value: NullableNumber | undefined): string => formatNumber(value, 3);
const finite = (value: number): NullableNumber => Number.isFinite(value) ? value : null;
const available = (value: NullableNumber | undefined): value is number => typeof value === 'number' && Number.isFinite(value);
const term = (value: NullableNumber | undefined): string => available(value) && value < 0 ? `(${f(value)})` : f(value);
const subscript = (value: number): string => String(value).replace(/\d/g, (digit) => '₀₁₂₃₄₅₆₇₈₉'[Number(digit)]);
const resultSign = (value: number): string => Math.abs(value - Math.round(value * 1000) / 1000) < 1e-12 ? '=' : '≈';

function result(value: NullableNumber | undefined, label: string, expression: string, why: string): ConceptReading {
  return available(value)
    ? { value: f(value), label, calculation: `${expression} ${resultSign(value)} ${f(value)}` }
    : { value: 'nicht definiert', label, calculation: why };
}

function sumExpression(values: (NullableNumber | undefined)[]): string {
  if (values.length === 0) return '0 (leere Summe)';
  return values.map(term).join(' + ');
}

/** Readings always use X for a single series and the same complete pairs for r. */
export function readingFor(id: string, stats: Statistics, pairs: DataPair[], caseIndex: number): ConceptReading {
  const index = Number.isInteger(caseIndex) && caseIndex >= 0 && caseIndex < pairs.length ? caseIndex : 0;
  const pair = pairs[index];
  const i = subscript(index + 1);
  const caseLabel = `Fall ${index + 1} · X`;
  const dx = stats.deviationsX[index];
  const dy = stats.deviationsY[index];
  const noCase = 'Es liegt kein Wertepaar vor. Ergänze mindestens einen Fall.';
  const numericLimit = 'Die Berechnung erreicht eine numerische Grenze. Verwende weniger extreme Messwerte.';
  const noMean = stats.n === 0 ? 'Ohne Werte ist kein Mittelwert definiert.' : numericLimit;
  const constantX = pairs.length > 0 && pairs.every(({ x }) => x === pairs[0].x);
  const constantY = pairs.length > 0 && pairs.every(({ y }) => y === pairs[0].y);
  const noDispersion = stats.n < 2
    ? 'Für die korrigierte Stichprobenstreuung werden mindestens zwei vollständige Wertepaare benötigt (n − 1 > 0).'
    : numericLimit;
  const noXStandardization = stats.n < 2
    ? noDispersion
    : stats.sdX === 0 && constantX
      ? 'X ist konstant: sₓ = 0. Durch null kann nicht dividiert werden.'
      : numericLimit;
  const noCorrelation = stats.n < 2
    ? 'Für die Stichprobenkorrelation werden mindestens zwei vollständige Wertepaare benötigt.'
    : stats.sdX === 0 && stats.sdY === 0 && constantX && constantY
      ? 'Beide Reihen sind konstant: sₓ = sᵧ = 0. Die Korrelation ist nicht definiert.'
      : stats.sdX === 0 && constantX
        ? 'X ist konstant: sₓ = 0. Die Korrelation ist nicht definiert.'
        : stats.sdY === 0 && constantY
          ? 'Y ist konstant: sᵧ = 0. Die Korrelation ist nicht definiert.'
          : numericLimit;

  switch (id) {
    case 'series': {
      const values = pairs.map(({ x }) => f(x));
      const compact = values.length > 5 ? [...values.slice(0, 4), '…'] : values;
      return {
        value: values.length ? compact.join(' · ') : 'keine Werte',
        label: 'Datenreihe X',
        calculation: values.length ? `X = [${values.join('; ')}]` : noCase,
      };
    }
    case 'pairs':
      return {
        value: `${stats.n} ${stats.n === 1 ? 'Paar' : 'Paare'}`,
        label: 'Je ein X- und Y-Wert pro Fall',
        calculation: pair ? `Fall ${index + 1}: (x${i}, y${i}) = (${f(pair.x)}; ${f(pair.y)})` : noCase,
      };
    case 'metric':
      return {
        value: 'metrisch', label: 'Beispielannahme für X und Y',
        calculation: 'Die Zahlen gelten hier als Messwerte mit interpretierbaren Abständen. Das Skalenniveau folgt aus der Bedeutung einer Messung und lässt sich nicht allein an ihren Zahlen ablesen.',
      };
    case 'count':
      return {
        value: '1, 2, …, n', label: 'Grundoperation',
        calculation: `${stats.n} vollständige ${stats.n === 1 ? 'Tabellenzeile wird' : 'Tabellenzeilen werden'} gezählt.`,
      };
    case 'add':
      return { value: 'a + b', label: 'Grundoperation', calculation: 'Addition: Zahlen zu einer Summe zusammenfassen.' };
    case 'subtract':
      return { value: 'a − b', label: 'Grundoperation', calculation: 'Subtraktion: eine gerichtete Differenz bilden.' };
    case 'multiply':
      return { value: 'a · b', label: 'Grundoperation', calculation: 'Multiplikation: zwei Zahlen zu einem Produkt verknüpfen.' };
    case 'divide':
      return { value: 'a / b', label: 'Grundoperation', calculation: 'Division: a durch b teilen. Voraussetzung: b ≠ 0.' };
    case 'square':
      return { value: 'a² = a · a', label: 'Rechenoperation', calculation: 'Quadrieren: eine Zahl mit sich selbst multiplizieren.' };
    case 'sqrt':
      return { value: '√a', label: 'Rechenoperation', calculation: 'Quadratwurzel: die nicht negative Zahl finden, deren Quadrat a ergibt. Voraussetzung: a ≥ 0.' };
    case 'validn':
      return { value: f(stats.n), label: 'Vollständige Wertepaare', calculation: `n = ${stats.n} berücksichtigte ${stats.n === 1 ? 'Tabellenzeile' : 'Tabellenzeilen'}` };
    case 'sum':
      return result(stats.sumX, 'Datenreihe X', `Σxᵢ = ${sumExpression(pairs.map(({ x }) => x))}`, numericLimit);
    case 'mean':
      return result(stats.meanX, 'Datenreihe X', available(stats.sumX)
        ? `x̄ = ${f(stats.sumX)} / ${stats.n}`
        : `x̄ = Σ(xᵢ / ${stats.n})`, noMean);
    case 'deviation':
      return result(dx, pair ? caseLabel : 'Datenreihe X', `d${i} = ${f(pair?.x)} − ${term(stats.meanX)}`, pair ? noMean : noCase);
    case 'squared_deviation':
      return result(stats.squaredDeviationsX[index], pair ? caseLabel : 'Datenreihe X', `d${i}² = ${term(dx)}²`, pair ? numericLimit : noCase);
    case 'ss':
      return result(stats.ssX, 'Datenreihe X', `SSₓ = ${sumExpression(stats.squaredDeviationsX)}`, numericLimit);
    case 'df':
      return stats.n > 0
        ? result(stats.df, 'Für die Stichprobenstreuung', `df = ${stats.n} − 1`, noDispersion)
        : { value: 'nicht definiert', label: 'Für die Stichprobenstreuung', calculation: 'Ohne Beobachtungen gibt es keine geschätzte Stichprobenstreuung und keine zugehörigen Freiheitsgrade.' };
    case 'variance':
      return result(stats.varianceX, 'Datenreihe X · mit n − 1', `sₓ² = ${f(stats.ssX)} / (${stats.n} − 1)`, noDispersion);
    case 'sd':
      return result(stats.sdX, 'Datenreihe X', `sₓ = √${f(stats.varianceX)}`, noDispersion);
    case 'centering':
      return result(dx, pair ? caseLabel : 'Datenreihe X', `xᶜ${i} = ${f(pair?.x)} − ${term(stats.meanX)}`, pair ? noMean : noCase);
    case 'scaling': {
      const scaled = pair && available(stats.sdX) && stats.sdX > 0 ? finite(pair.x / stats.sdX) : null;
      return result(scaled, pair ? `Fall ${index + 1} · X, unzentriert` : 'X, unzentriert', `Maßstab a = sₓ; x*${i} = ${f(pair?.x)} / ${f(stats.sdX)}`, pair ? noXStandardization : noCase);
    }
    case 'positive_sd': {
      if (!available(stats.sdX) || !available(stats.sdY)) {
        return { value: 'nicht definiert', label: 'Prüfung beider Reihen', calculation: noDispersion };
      }
      const xPositive = stats.sdX > 0;
      const yPositive = stats.sdY > 0;
      return {
        value: xPositive && yPositive ? 'beide erfüllt' : `X ${xPositive ? 'ja' : 'nein'} · Y ${yPositive ? 'ja' : 'nein'}`,
        label: 'Bedingung: sₓ > 0 und sᵧ > 0',
        calculation: `X: sₓ = ${f(stats.sdX)} ${xPositive ? '> 0' : '= 0'}. Y: sᵧ = ${f(stats.sdY)} ${yPositive ? '> 0' : '= 0'}. Für zₓ genügt die Bedingung für X; für Pearson sind beide nötig.`,
      };
    }
    case 'z':
      return result(stats.zX[index], pair ? caseLabel : 'Datenreihe X', `zₓ${i} = (${f(pair?.x)} − ${term(stats.meanX)}) / ${f(stats.sdX)}`, pair ? noXStandardization : noCase);
    case 'crossproduct':
      return result(stats.crossProducts[index], pair ? `Fall ${index + 1} · X und Y` : 'Beide Reihen', `p${i} = ${term(dx)} · ${term(dy)}`, pair ? numericLimit : noCase);
    case 'crossproduct_sum':
      return result(stats.crossProductSum, 'Alle Wertepaare', `SPₓᵧ = ${sumExpression(stats.crossProducts)}`, numericLimit);
    case 'covariance':
      return result(stats.covariance, 'Beide Reihen · mit n − 1', `sₓᵧ = ${f(stats.crossProductSum)} / (${stats.n} − 1)`, noDispersion);
    case 'sd_product':
      return result(stats.sdProduct, 'Beide Reihen', `sₓ · sᵧ = ${f(stats.sdX)} · ${f(stats.sdY)}`, noDispersion);
    case 'linear':
      return {
        value: 'Form prüfen', label: 'Wertepaare im Streudiagramm',
        calculation: 'Pearson beschreibt den linearen Anteil des Zusammenhangs. Ob die Punkte einer Geraden oder beispielsweise einer Kurve folgen, zeigt der Blick auf das Streudiagramm.',
      };
    case 'pearson':
      return result(stats.pearson, 'Beide Reihen', `r = ${f(stats.covariance)} / (${f(stats.sdX)} · ${f(stats.sdY)})`, noCorrelation);
    default:
      return { value: '—', label: 'Konzept', calculation: 'Für diesen Begriff ist noch kein Beispiel hinterlegt.' };
  }
}
