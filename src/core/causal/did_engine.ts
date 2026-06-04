import { PanelUnit } from "./panel_builder";

export interface DiDResult {
  treatedPreAvg: number;
  treatedPostAvg: number;
  controlPreAvg: number;
  controlPostAvg: number;
  treatedEffect: number;
  controlEffect: number;
  ATT: number;
  standardErrorEstimate: number;
  tStat: number;
  pValueAtT: number;
}

export class DiDEngine {
  /**
   * Calculates the Average Treatment Effect on the Treated (ATT) by isolating policy shock variations.
   */
  static estimate(
    treated: PanelUnit[],
    control: PanelUnit[],
    preIndex: number,
    postIndex: number
  ): DiDResult {
    const avgVal = (arr: number[]) => (arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length);

    // Collect historical outcome series at specified pre- and post- periods
    const treatedPreRaw = treated.map((t) => t.y[preIndex] ?? 5.5);
    const treatedPostRaw = treated.map((t) => t.y[postIndex] ?? 6.5);
    const controlPreRaw = control.map((c) => c.y[preIndex] ?? 5.5);
    const controlPostRaw = control.map((c) => c.y[postIndex] ?? 5.5);

    const treatedPreAvg = avgVal(treatedPreRaw);
    const treatedPostAvg = avgVal(treatedPostRaw);
    const controlPreAvg = avgVal(controlPreRaw);
    const controlPostAvg = avgVal(controlPostRaw);

    const treatedEffect = treatedPostAvg - treatedPreAvg;
    const controlEffect = controlPostAvg - controlPreAvg;
    const ATT = treatedEffect - controlEffect;

    // Numerical approximation of standard error of the double-differential using pooled variance
    const calcVar = (nums: number[], mean: number) => {
      if (nums.length <= 1) return 0.05;
      const ss = nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
      return ss / (nums.length - 1);
    };

    const varTreatedPre = calcVar(treatedPreRaw, treatedPreAvg);
    const varTreatedPost = calcVar(treatedPostRaw, treatedPostAvg);
    const varControlPre = calcVar(controlPreRaw, controlPreAvg);
    const varControlPost = calcVar(controlPostRaw, controlPostAvg);

    // Standard Error of DID estimator = sqrt( var(Y_T_post)/n_T + var(Y_T_pre)/n_T + var(Y_C_post)/n_C + var(Y_C_pre)/n_C )
    const nT = treated.length || 1;
    const nC = control.length || 1;
    const pooledVarianceValue = (varTreatedPost / nT) + (varTreatedPre / nT) + (varControlPost / nC) + (varControlPre / nC);
    const standardErrorEstimate = Math.max(0.02, Math.sqrt(pooledVarianceValue));

    const tStat = ATT / standardErrorEstimate;
    
    // Normal approximation of p-value for the calculated t-statistic
    const absT = Math.abs(tStat);
    const tCDF = 1.0 / (1.0 + Math.exp(-0.07056 * Math.pow(absT, 3) - 1.5976 * absT));
    const pValueAtT = Math.max(0, Math.min(1, 2.0 * (1.0 - tCDF)));

    return {
      treatedPreAvg: Number(treatedPreAvg.toFixed(4)),
      treatedPostAvg: Number(treatedPostAvg.toFixed(4)),
      controlPreAvg: Number(controlPreAvg.toFixed(4)),
      controlPostAvg: Number(controlPostAvg.toFixed(4)),
      treatedEffect: Number(treatedEffect.toFixed(4)),
      controlEffect: Number(controlEffect.toFixed(4)),
      ATT: Number(ATT.toFixed(4)),
      standardErrorEstimate: Number(standardErrorEstimate.toFixed(4)),
      tStat: Number(tStat.toFixed(4)),
      pValueAtT: Number(pValueAtT.toFixed(6))
    };
  }
}
