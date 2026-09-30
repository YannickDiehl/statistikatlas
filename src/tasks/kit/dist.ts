// Verteilungsfunktionen in doppelter Genauigkeit, abgeglichen mit R (Tests: dist.test.ts).
// pnorm: Cody (1993), wie R nmath/pnorm.c; qnorm: Wichura AS 241, wie R nmath/qnorm.c;
// pt, pf: regularisierte unvollständige Betafunktion (Kettenbruch, modifizierter Lentz), beide Ränder direkt;
// pchisq: regularisierte unvollständige Gammafunktion (Reihe bzw. Kettenbruch);
// ptukey: Port von R nmath/ptukey.c (wprob/ptukey, Copenhaver & Holland 1988) mit dessen Konstanten.

const LN_SQRT_2PI = 0.918938533204672741780329736406; // log(sqrt(2π))
const SQRT_32 = 5.656854249492380195206754896838;
const ONE_SQRT_2PI = 0.398942280401432677939946059934;
const EPS = 2.220446049250313e-16;

// ---------- Normalverteilung ----------

/** Beide Ränder von Φ(x), Cody-Algorithmus wie R's pnorm_both(). */
function pnormBoth(x: number): [lower: number, upper: number] {
  const a = [2.2352520354606839287, 161.02823106855587881, 1067.6894854603709582, 18154.981253343561249, 0.065682337918207449113];
  const b = [47.20258190468824187, 976.09855173777669322, 10260.932208618978205, 45507.789335026729956];
  const c = [0.39894151208813466764, 8.8831497943883759412, 93.506656132177855979, 597.27027639480026226, 2494.5375852903726711,
    6848.1904505362823326, 11602.651437647350124, 9842.7148383839780218, 1.0765576773720192317e-8];
  const d = [22.266688044328115691, 235.38790178262499861, 1519.377599407554805, 6485.558298266760755, 18615.571640885098091,
    34900.952721145977266, 38912.003286093271411, 19685.429676859990727];
  const p = [0.21589853405795699, 0.1274011611602473639, 0.022235277870649807, 0.001421619193227893466, 2.9112874951168792e-5,
    0.02307344176494017303];
  const q = [1.28426009614491121, 0.468238212480865118, 0.0659881378689285515, 0.00378239633202758244, 7.29751555083966205e-5];
  if (Number.isNaN(x)) return [NaN, NaN];
  const y = Math.abs(x);
  let cum: number, ccum: number;
  // exp(-X²/2) mit geteiltem X, damit das Quadrat exakt bleibt (R: do_del)
  const del = (X: number, temp: number) => {
    const xsq = Math.trunc(X * 16) / 16;
    const dl = (X - xsq) * (X + xsq);
    return Math.exp(-xsq * xsq * 0.5) * Math.exp(-dl * 0.5) * temp;
  };
  if (y <= 0.67448975) {
    let xnum = 0, xden = 0;
    if (y > EPS * 0.5) {
      const xsq = x * x;
      xnum = a[4] * xsq; xden = xsq;
      for (let i = 0; i < 3; i++) { xnum = (xnum + a[i]) * xsq; xden = (xden + b[i]) * xsq; }
    }
    const temp = x * (xnum + a[3]) / (xden + b[3]);
    return [0.5 + temp, 0.5 - temp];
  } else if (y <= SQRT_32) {
    let xnum = c[8] * y, xden = y;
    for (let i = 0; i < 7; i++) { xnum = (xnum + c[i]) * y; xden = (xden + d[i]) * y; }
    cum = del(y, (xnum + c[7]) / (xden + d[7]));
    ccum = 1 - cum;
  } else if (y < 37.5193) {
    const xsq = 1 / (x * x);
    let xnum = p[5] * xsq, xden = xsq;
    for (let i = 0; i < 4; i++) { xnum = (xnum + p[i]) * xsq; xden = (xden + q[i]) * xsq; }
    let temp = xsq * (xnum + p[4]) / (xden + q[4]);
    temp = (ONE_SQRT_2PI - temp) / y;
    cum = del(x, temp);
    ccum = 1 - cum;
  } else {
    cum = 0; ccum = 1;
  }
  return x > 0 ? [ccum, cum] : [cum, ccum];
}

/** P(Z ≤ x) (lower = true) bzw. P(Z > x). */
export function pnorm(x: number, lower = true): number {
  const [lo, up] = pnormBoth(x);
  return lower ? lo : up;
}

/** Quantil der Standardnormalverteilung, Wichura (1988) AS 241 wie R. */
export function qnorm(p: number): number {
  if (Number.isNaN(p) || p < 0 || p > 1) return NaN;
  if (p === 0) return -Infinity;
  if (p === 1) return Infinity;
  const q = p - 0.5;
  if (Math.abs(q) <= 0.425) {
    const r = 0.180625 - q * q;
    return q * (((((((r * 2509.0809287301226727 + 33430.575583588128105) * r + 67265.770927008700853) * r
      + 45921.953931549871457) * r + 13731.693765509461125) * r + 1971.5909503065514427) * r + 133.14166789178437745) * r
      + 3.387132872796366608)
      / (((((((r * 5226.495278852545925 + 28729.085735721942674) * r + 39307.89580009271061) * r
        + 21213.794301586595867) * r + 5394.1960214247511077) * r + 687.1870074920579083) * r + 42.313330701600911252) * r + 1);
  }
  let r = Math.sqrt(-Math.log(q < 0 ? p : 1 - p));
  let val: number;
  if (r <= 5) {
    r -= 1.6;
    val = (((((((r * 7.7454501427834140764e-4 + 0.0227238449892691845833) * r + 0.24178072517745061177) * r
      + 1.27045825245236838258) * r + 3.64784832476320460504) * r + 5.7694972214606914055) * r + 4.6303378461565452959) * r
      + 1.42343711074968357734)
      / (((((((r * 1.05075007164441684324e-9 + 5.475938084995344946e-4) * r + 0.0151986665636164571966) * r
        + 0.14810397642748007459) * r + 0.68976733498510000455) * r + 1.6763848301838038494) * r + 2.05319162663775882187) * r + 1);
  } else {
    r -= 5;
    val = (((((((r * 2.01033439929228813265e-7 + 2.71155556874348757815e-5) * r + 0.0012426609473880784386) * r
      + 0.026532189526576123093) * r + 0.29656057182850489123) * r + 1.7848265399172913358) * r + 5.4637849111641143699) * r
      + 6.6579046435011037772)
      / (((((((r * 2.04426310338993978564e-15 + 1.4215117583164458887e-7) * r + 1.8463183175100546818e-5) * r
        + 7.868691311456132591e-4) * r + 0.0148753612908506148525) * r + 0.13692988092273580531) * r + 0.59983220655588793769) * r + 1);
  }
  return q < 0 ? -val : val;
}

// ---------- Gamma- und Betafunktion ----------

/** Stirling-Korrektur lgamma(x) − [(x − ½)·log x − x + log √(2π)], für x ≥ 10 (Bernoulli-Reihe). */
function lgammacor(x: number): number {
  const x2 = 1 / (x * x);
  return (1 / 12 + x2 * (-1 / 360 + x2 * (1 / 1260 + x2 * (-1 / 1680 + x2 * (1 / 1188 + x2 * (-691 / 360360 + x2 * (1 / 156))))))) / x;
}

/** log Γ(x) für x > 0. */
export function lgamma(x: number): number {
  if (!(x > 0)) return NaN;
  let shift = 0;
  while (x < 10) { shift += Math.log(x); x += 1; }
  return (x - 0.5) * Math.log(x) - x + LN_SQRT_2PI + lgammacor(x) - shift;
}

/** log B(a, b), Aufteilung wie R nmath/lbeta.c. */
function lbeta(a: number, b: number): number {
  const p = Math.min(a, b), q = Math.max(a, b);
  if (p >= 10) {
    const corr = lgammacor(p) + lgammacor(q) - lgammacor(p + q);
    return -0.5 * Math.log(q) + LN_SQRT_2PI + corr + (p - 0.5) * Math.log(p / (p + q)) + q * Math.log1p(-p / (p + q));
  }
  if (q >= 10) {
    const corr = lgammacor(q) - lgammacor(p + q);
    return lgamma(p) + corr + p - p * Math.log(p + q) + (q - 0.5) * Math.log1p(-p / (p + q));
  }
  return lgamma(p) + lgamma(q) - lgamma(p + q);
}

/** e − log(1 + e) ohne Auslöschung. */
function rlog1(e: number): number {
  if (Math.abs(e) > 0.1) return e - Math.log1p(e);
  // e − log(1+e) = 2r²·Σ c_k r^k mit r = e/(2+e), c_k = 1 (k gerade) bzw. 1 − 1/(k+2) (k ungerade)
  const r = e / (2 + e);
  let sum = 0, rk = 1;
  for (let k = 0; k < 60; k++) {
    const term = (k % 2 === 0 ? 1 : 1 - 1 / (k + 2)) * rk;
    sum += term;
    if (Math.abs(term) < 1e-17 * Math.abs(sum)) break;
    rk *= r;
  }
  return 2 * r * r * sum;
}

/** log( x^a · y^b / B(a, b) ) mit y = 1 − x, für große a und b über die Abweichungsform (wie TOMS 708 brcomp). */
function logBetaFront(a: number, b: number, x: number, y: number): number {
  if (Math.min(a, b) >= 10) {
    const lambda = x <= 0.5 ? a - (a + b) * x : (a + b) * y - b;
    const u = rlog1(-lambda / a), v = rlog1(lambda / b);
    const corr = lgammacor(a) + lgammacor(b) - lgammacor(a + b);
    return -(a * u + b * v) + 0.5 * Math.log(a * b / (a + b)) - LN_SQRT_2PI - corr;
  }
  // Logarithmus des Arguments nahe 1 über log1p des (exakt übergebenen) Gegenstücks
  const logX = x <= 0.5 ? Math.log(x) : Math.log1p(-y);
  const logY = y <= 0.5 ? Math.log(y) : Math.log1p(-x);
  return a * logX + b * logY - lbeta(a, b);
}

/** Kettenbruch der unvollständigen Betafunktion (modifizierter Lentz). */
function betacf(a: number, b: number, x: number): number {
  const TINY = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 1e6; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c; if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c; if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-16) return h;
  }
  return h;
}

/** Regularisierte unvollständige Betafunktion I_x(a, b) und ihr Komplement; y = 1 − x wird exakt übergeben. */
function pbetaBoth(x: number, y: number, a: number, b: number): [lower: number, upper: number] {
  if (x <= 0) return [0, 1];
  if (y <= 0) return [1, 0];
  if (x < (a + 1) / (a + b + 2)) {
    const lo = Math.exp(logBetaFront(a, b, x, y)) * betacf(a, b, x) / a;
    return [lo, 1 - lo];
  }
  const up = Math.exp(logBetaFront(b, a, y, x)) * betacf(b, a, y) / b;
  return [1 - up, up];
}

/** Regularisierte unvollständige Gammafunktion P(a, x) und Q(a, x). */
function pgammaBoth(x: number, a: number): [lower: number, upper: number] {
  if (x <= 0) return [0, 1];
  if (x === Infinity) return [1, 0];
  // log( x^a e^(−x) / Γ(a) ), für große a über die Abweichungsform
  const logFront = a >= 10
    ? -a * rlog1((x - a) / a) + 0.5 * Math.log(a) - LN_SQRT_2PI - lgammacor(a)
    : a * Math.log(x) - x - lgamma(a);
  if (x < a + 1) {
    let ap = a, del = 1 / a, sum = del;
    for (let n = 0; n < 1e6; n++) {
      ap += 1; del *= x / ap; sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-17) break;
    }
    const lo = sum * Math.exp(logFront);
    return [lo, 1 - lo];
  }
  const TINY = 1e-300;
  let bb = x + 1 - a, c = 1 / TINY, d = 1 / bb, h = d;
  for (let i = 1; i < 1e6; i++) {
    const an = -i * (i - a);
    bb += 2;
    d = an * d + bb; if (Math.abs(d) < TINY) d = TINY;
    c = bb + an / c; if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-16) break;
  }
  const up = Math.exp(logFront) * h;
  return [1 - up, up];
}

// ---------- t, F, χ² ----------

/** P(T ≤ t) bei df Freiheitsgraden (auch nicht ganzzahlig, z. B. Welch); lower = false: P(T > t). */
export function pt(t: number, df: number, lower = true): number {
  if (Number.isNaN(t) || !(df > 0)) return NaN;
  if (t === Infinity) return lower ? 1 : 0;
  if (t === -Infinity) return lower ? 0 : 1;
  if (df === Infinity) return pnorm(t, lower);
  const t2 = t * t;
  let tail: number; // P(T < −|t|)
  if (df > 1e6 && t2 * t2 < df / 100) {
    // Sehr große df: dort stockt der Kettenbruch; Fisher-Entwicklung in 1/df (Fehler O(df^−4), bei df > 1e6 unter 1e−12 relativ)
    const a = Math.abs(t), s = t2;
    const g1 = a * (s + 1) / 4;
    const g2 = a * (3 * s ** 3 - 7 * s * s - 5 * s - 3) / 96;
    const g3 = a * (s ** 5 - 11 * s ** 4 + 14 * s ** 3 + 6 * s * s - 3 * s - 15) / 384;
    tail = pnorm(-a) + ONE_SQRT_2PI * Math.exp(-s / 2) * (g1 / df + g2 / df ** 2 + g3 / df ** 3);
  } else {
    // P(|T| > |t|) = I_y(df/2, 1/2) mit y = df/(df + t²)
    tail = pbetaBoth(t2 / (df + t2), df / (df + t2), 0.5, df / 2)[1] / 2;
  }
  return (t > 0) === lower ? 1 - tail : tail;
}

/** Dichte der t-Verteilung (für die Newton-Schritte in qt). */
function dt(t: number, df: number): number {
  return Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(df * Math.PI) - (df + 1) / 2 * Math.log1p(t * t / df));
}

/** Quantil der t-Verteilung: Newton mit Einschluss auf log P(T ≤ t), bis auf Maschinengenauigkeit. */
export function qt(p: number, df: number): number {
  if (Number.isNaN(p) || p < 0 || p > 1 || !(df > 0)) return NaN;
  if (p === 0) return -Infinity;
  if (p === 1) return Infinity;
  if (p === 0.5) return 0;
  if (p > 0.5) return -qt(1 - p, df); // 1 − p ist für p ≥ ½ exakt
  if (df === Infinity) return qnorm(p);
  const target = Math.log(p);
  const g = (t: number) => Math.log(pt(t, df)) - target;
  // Die t-Verteilung hat schwerere Ränder: das Normalquantil liegt rechts der Lösung.
  let hi = qnorm(p);
  let lo = hi;
  do { lo *= 2; } while (g(lo) > 0 && lo > -1e300);
  let x = df === 1 ? -1 / Math.tan(Math.PI * p) : lo;
  if (!(x >= lo && x <= hi)) x = lo;
  for (let it = 0; it < 200; it++) {
    const gx = g(x);
    if (gx === 0) return x;
    if (gx > 0) hi = x; else lo = x;
    const step = gx * pt(x, df) / dt(x, df);
    let next = x - step;
    if (!(next > lo && next < hi)) next = lo / hi > 4 ? -Math.sqrt(lo * hi) : (lo + hi) / 2;
    if (Math.abs(next - x) <= 4 * EPS * Math.abs(x)) return next;
    x = next;
  }
  return x;
}

/** P(F ≤ f) bei (df1, df2) Freiheitsgraden; lower = false: P(F > f). */
export function pf(f: number, df1: number, df2: number, lower = true): number {
  if (Number.isNaN(f) || !(df1 > 0) || !(df2 > 0)) return NaN;
  if (f <= 0) return lower ? 0 : 1;
  if (f === Infinity) return lower ? 1 : 0;
  const s = df2 + df1 * f;
  const [lo, up] = pbetaBoth(df1 * f / s, df2 / s, df1 / 2, df2 / 2);
  return lower ? lo : up;
}

/** P(X ≤ x) bei df Freiheitsgraden; lower = false: P(X > x). */
export function pchisq(x: number, df: number, lower = true): number {
  if (Number.isNaN(x) || !(df > 0)) return NaN;
  const [lo, up] = pgammaBoth(x / 2, df / 2);
  return lower ? lo : up;
}

// ---------- Studentisierte Spannweite (Port von R nmath/ptukey.c) ----------

const XLEG = [0.981560634246719250690549090149, 0.904117256370474856678465866119, 0.769902674194304687036893833213,
  0.587317954286617447296702418941, 0.367831498998180193752691536644, 0.125233408511468915472441369464];
const ALEG = [0.047175336386511827194615961485, 0.106939325995318430960254718194, 0.160078328543346226334652529543,
  0.203167426723065921749064455810, 0.233492536538354808760849898925, 0.249147045813402785000562436043];
const XLEGQ = [0.989400934991649932596154173450, 0.944575023073232576077988415535, 0.865631202387831743880467897712,
  0.755404408355003033895101194847, 0.617876244402643748446671764049, 0.458016777657227386342419442984,
  0.281603550779258913230460501460, 0.950125098376374401853193354250e-1];
const ALEGQ = [0.271524594117540948517805724560e-1, 0.622535239386478928628438369944e-1, 0.951585116824927848099251076022e-1,
  0.124628971255533872052476282192, 0.149595988816576732081501730547, 0.169156519395002538189312079030,
  0.182603415044923588866763667969, 0.189450610455068496285396723208];

/** Wahrscheinlichkeitsintegral der Spannweite (Hartley-Form), R's wprob(w, rr, cc). */
function wprob(w: number, rr: number, cc: number): number {
  const C1 = -30, C2 = -50, C3 = 60, bb = 8, wlar = 3, wincr1 = 2, wincr2 = 3, nleg = 12, ihalf = 6;
  const qsqz = w * 0.5;
  if (qsqz >= bb) return 1;
  let prW = 2 * pnorm(qsqz) - 1;
  prW = prW >= Math.exp(C2 / cc) ? prW ** cc : 0;
  const wincr = w > wlar ? wincr1 : wincr2;
  let blb = qsqz;
  const binc = (bb - qsqz) / wincr;
  let bub = blb + binc;
  let einsum = 0;
  const cc1 = cc - 1;
  for (let wi = 1; wi <= wincr; wi++) {
    let elsum = 0;
    const a = 0.5 * (bub + blb), b = 0.5 * (bub - blb);
    for (let jj = 1; jj <= nleg; jj++) {
      let j: number, xx: number;
      if (ihalf < jj) { j = nleg - jj + 1; xx = XLEG[j - 1]; } else { j = jj; xx = -XLEG[j - 1]; }
      const ac = a + b * xx;
      const qexpo = ac * ac;
      if (qexpo > C3) break;
      const pplus = 2 * pnorm(ac), pminus = 2 * pnorm(ac - w);
      let rinsum = pplus * 0.5 - pminus * 0.5;
      if (rinsum >= Math.exp(C1 / cc1)) {
        rinsum = ALEG[j - 1] * Math.exp(-(0.5 * qexpo)) * rinsum ** cc1;
        elsum += rinsum;
      }
    }
    elsum *= 2 * b * cc * ONE_SQRT_2PI;
    einsum += elsum;
    blb = bub;
    bub += binc;
  }
  prW += einsum;
  if (prW <= Math.exp(C1 / rr)) return 0;
  prW = prW ** rr;
  return prW >= 1 ? 1 : prW;
}

/** P(Q ≤ q) der studentisierten Spannweite für nmeans Gruppen und df Freiheitsgrade (nranges = 1), wie R's ptukey(). */
export function ptukey(q: number, nmeans: number, df: number, lower = true): number {
  const rr = 1, cc = nmeans;
  if (Number.isNaN(q) || Number.isNaN(nmeans) || Number.isNaN(df)) return NaN;
  if (q <= 0) return lower ? 0 : 1;
  if (df < 2 || cc < 2) return NaN;
  if (q === Infinity) return lower ? 1 : 0;
  const val = (v: number) => (lower ? v : 1 - v);
  if (df > 25000) return val(wprob(q, rr, cc));
  const eps1 = -30, eps2 = 1e-14, nlegq = 16, ihalfq = 8;
  const f2 = df * 0.5;
  let f2lf = f2 * Math.log(df) - df * Math.LN2 - lgamma(f2);
  const f21 = f2 - 1;
  const ff4 = df * 0.25;
  const ulen = df <= 100 ? 1 : df <= 800 ? 0.5 : df <= 5000 ? 0.25 : 0.125;
  f2lf += Math.log(ulen);
  let ans = 0;
  for (let i = 1; i <= 50; i++) {
    let otsum = 0;
    const twa1 = (2 * i - 1) * ulen;
    for (let jj = 1; jj <= nlegq; jj++) {
      let j: number, t1: number;
      if (ihalfq < jj) {
        j = jj - ihalfq - 1;
        t1 = f2lf + f21 * Math.log(twa1 + XLEGQ[j] * ulen) - (XLEGQ[j] * ulen + twa1) * ff4;
      } else {
        j = jj - 1;
        t1 = f2lf + f21 * Math.log(twa1 - XLEGQ[j] * ulen) + (XLEGQ[j] * ulen - twa1) * ff4;
      }
      if (t1 >= eps1) {
        const qsqz = ihalfq < jj ? q * Math.sqrt((XLEGQ[j] * ulen + twa1) * 0.5) : q * Math.sqrt((-(XLEGQ[j] * ulen) + twa1) * 0.5);
        otsum += wprob(qsqz, rr, cc) * ALEGQ[j] * Math.exp(t1);
      }
    }
    if (i * ulen >= 1 && otsum <= eps2) break;
    ans += otsum;
  }
  return val(Math.min(ans, 1));
}

/** Zweiseitiger p-Wert eines t-Werts, numerisch stabil über den kleinen Rand. */
export const pTwoSided = (t: number, df: number) => 2 * pt(-Math.abs(t), df);
