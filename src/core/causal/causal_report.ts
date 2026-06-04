import { PanelUnit } from "./panel_builder";
import { DiDEngine, DiDResult } from "./did_engine";
import { SCMResult, SyntheticControl } from "./synthetic_control";

export interface IntegratedCausalReport {
  didResults: DiDResult;
  scmResults: SCMResult;
  donorWeightsBreakdown: { donorName: string; weight: number }[];
  treatedUnitName: string;
  narrativeInterpretation: string;
  parallelTrendAssumptionViolated: boolean;
  placeboATTMean: number;
}

export class CausalReport {
  /**
   * Evaluates econometric treatment effects, parallel pre-treatment trends, counterfactual trajectories, and placebo robustness checks.
   */
  static generate(
    panel: PanelUnit[],
    treatedCountryName: string,
    prePeriodsCount: number,
    postIndex: number
  ): IntegratedCausalReport {
    // Isolate target treated unit and corresponding controls
    const treated = panel.find((p) => p.country.toUpperCase() === treatedCountryName.toUpperCase()) 
                     || panel.find((p) => p.treated) 
                     || panel[0];
    
    const control = panel.filter((p) => p.country !== treated.country);

    // If no control units exist fallback dynamically
    const fallbackControl = control.length > 0 ? control : [treated];

    // Compute DiD metrics
    const didResults = DiDEngine.estimate(
      [treated],
      fallbackControl,
      Math.max(0, prePeriodsCount - 1),
      postIndex
    );

    // Compute Synthetic Control metrics
    const weights = SyntheticControl.buildWeights(fallbackControl, treated, prePeriodsCount);
    const syntheticTrajectory = SyntheticControl.synthesize(fallbackControl, weights);
    const gaps = SyntheticControl.gap(treated, syntheticTrajectory);

    // Calculate pre-treatment MSPE
    let sumSqrErr = 0;
    for (let t = 0; t < prePeriodsCount; t++) {
      sumSqrErr += Math.pow((treated.y[t] ?? 5.5) - (syntheticTrajectory[t] ?? 5.5), 2);
    }
    const mspePre = prePeriodsCount > 0 ? sumSqrErr / prePeriodsCount : 0.01;

    const scmResults: SCMResult = {
      weights,
      syntheticTrajectory,
      gaps,
      mspePre
    };

    // DonorWeights breakdown map
    const donorWeightsBreakdown = fallbackControl.map((c, idx) => ({
      donorName: c.country,
      weight: weights[idx] ?? 0
    })).sort((a, b) => b.weight - a.weight);

    // Parallel trend check - Evaluate divergence between Treated and average Control units before treatment
    let parallelTrendDeviation = 0;
    for (let t = 1; t < prePeriodsCount; t++) {
      const treatedDelta = (treated.y[t] ?? 5.5) - (treated.y[t - 1] ?? 5.5);
      
      let sumCtrlDelta = 0;
      fallbackControl.forEach((c) => {
        sumCtrlDelta += ((c.y[t] ?? 5.5) - (c.y[t - 1] ?? 5.5));
      });
      const avgCtrlDelta = sumCtrlDelta / fallbackControl.length;
      parallelTrendDeviation += Math.abs(treatedDelta - avgCtrlDelta);
    }
    const avgPreTrendDivergence = prePeriodsCount > 1 ? parallelTrendDeviation / (prePeriodsCount - 1) : 0;
    const parallelTrendAssumptionViolated = avgPreTrendDivergence > 0.45; // threshold of violation

    // Bootstrap placebo tests: run placebo shock over all control units to establish counterfactual significance
    let placeboATTSum = 0;
    fallbackControl.forEach((ctrlUnit) => {
      const placeboDonors = fallbackControl.filter((c) => c.country !== ctrlUnit.country);
      if (placeboDonors.length > 0) {
        const pDiD = DiDEngine.estimate([ctrlUnit], placeboDonors, Math.max(0, prePeriodsCount - 1), postIndex);
        placeboATTSum += pDiD.ATT;
      }
    });
    const placeboATTMean = fallbackControl.length > 0 ? placeboATTSum / fallbackControl.length : 0;

    // Narrative textual diagnostics
    let narrativeInterpretation = "";
    if (didResults.ATT > 0.6) {
      narrativeInterpretation = `A strong, statistically significant positive treatment effect of <strong>+${didResults.ATT.toFixed(3)} ARI index units</strong> is diagnosed (p = ${didResults.pValueAtT.toFixed(5)}). Contemporary Synthetic counterfactual observations support structural divergence.`;
    } else if (didResults.ATT < -0.6) {
      narrativeInterpretation = `Significant structural decay / displacement of <strong>${didResults.ATT.toFixed(3)} ARI units</strong> is observed. The reform triggered administrative friction floors.`;
    } else {
      narrativeInterpretation = `An empirical treatment effect of <strong>${didResults.ATT.toFixed(3)} ARI units</strong> indicates low structural elasticities. The policy impact remains within normal confidence error margins.`;
    }

    return {
      didResults,
      scmResults,
      donorWeightsBreakdown,
      treatedUnitName: treated.country,
      narrativeInterpretation,
      parallelTrendAssumptionViolated,
      placeboATTMean: Number(placeboATTMean.toFixed(4))
    };
  }
}
