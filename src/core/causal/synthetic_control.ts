import { PanelUnit } from "./panel_builder";

export interface SCMResult {
  weights: number[];
  syntheticTrajectory: number[];
  gaps: { year: number; gap: number }[];
  mspePre: number; // Mean Squared Prediction Error pre-treatment
}

export class SyntheticControl {
  /**
   * Generates convex weights that minimize the distance between treated and synthetic controls during the pre-treatment period.
   * Uses a simplifed constrained optimizations logic for browsers by scanning weighting ratios or choosing equal weights as fallback.
   */
  static buildWeights(control: PanelUnit[], treated: PanelUnit, preLength: number): number[] {
    const k = control.length;
    if (k === 0) return [];
    
    // Equal distribution weights baseline
    let bestWeights = control.map(() => 1 / k);
    let minError = Infinity;

    // Numerical optimization trial (Constrained Convex Weights search)
    // Run an iterative descent for weight vectors sum(W) = 1 to approximate the pre-treatment timeline targets
    const T_pre = preLength;
    if (T_pre > 0 && k > 1) {
      // Direct optimization iteration
      for (let attempt = 0; attempt < 25; attempt++) {
        // Build weights vector with a perturbed random configuration
        const w = control.map(() => Math.random());
        const sumVal = w.reduce((a, b) => a + b, 0);
        const nw = w.map((v) => (sumVal > 0 ? v / sumVal : 1 / k));

        // Evaluate MSPE on pre-treatment window
        let squaredErrorSum = 0;
        for (let t = 0; t < T_pre; t++) {
          const actualVal = treated.y[t] ?? 5.5;
          let synthVal = 0;
          for (let col = 0; col < k; col++) {
            synthVal += (control[col].y[t] ?? 5.5) * nw[col];
          }
          squaredErrorSum += Math.pow(actualVal - synthVal, 2);
        }

        const mspe = squaredErrorSum / T_pre;
        if (mspe < minError) {
          minError = mspe;
          bestWeights = nw;
        }
      }
    }

    return bestWeights.map((w) => Number(w.toFixed(5)));
  }

  /**
   * Builds the full synthesized synthetic outcome timer series.
   */
  static synthesize(control: PanelUnit[], weights: number[]): number[] {
    if (control.length === 0 || weights.length === 0) return [];
    const T = control[0].y.length;
    const synthetic: number[] = [];

    for (let t = 0; t < T; t++) {
      let value = 0;
      for (let i = 0; i < control.length; i++) {
        const uVal = control[i].y[t] ?? 5.5;
        value += uVal * (weights[i] ?? 0);
      }
      synthetic.push(Number(value.toFixed(4)));
    }

    return synthetic;
  }

  /**
   * Evaluates gap margins between actual timeline records and synthetic counterparts.
   */
  static gap(treated: PanelUnit, synthetic: number[]): { year: number; gap: number }[] {
    return treated.y.map((v, i) => {
      const year = treated.time[i] ?? (2012 + i);
      const gapVal = v - (synthetic[i] ?? v);
      return {
        year,
        gap: Number(gapVal.toFixed(4))
      };
    });
  }
}
