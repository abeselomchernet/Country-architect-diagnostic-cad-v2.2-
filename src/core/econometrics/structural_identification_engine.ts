export type IdentificationClass =
  | "RANDOMIZED"
  | "DIFFERENCE_IN_DIFFERENCES"
  | "SYNTHETIC_CONTROL"
  | "EVENT_STUDY"
  | "FIXED_EFFECTS_PANEL"
  | "INSTRUMENTAL_VARIABLE"
  | "REDUCED_FORM_SIMULATION";

export interface PolicyShock {
  id: string;
  name: string;
  intensity: number;
  timing?: number;
  treatedUnits?: string[];
}

export interface IdentificationAssumptions {
  parallelTrends: number;        // 0–1 (higher is better aligned)
  overlapQuality: number;        // 0–1 (higher is better covariate overlap)
  spilloverRisk: number;         // 0–1 (higher is worse)
  exogeneityStrength: number;    // 0–1 (higher is less selection bias)
  supportOverlap: number;        // 0–1 (equal to overlapQuality)
}

export interface IdentificationResult {
  class: IdentificationClass;
  score: number; // 0–10 validity score
  assumptions: IdentificationAssumptions;
  warnings: string[];
  recommendedMethod: IdentificationClass;
  validForPublication: boolean;
  explanation: string;
}

export class StructuralIdentificationEngine {
  /**
   * Classifies the empirical design strategy of policy interventions.
   */
  classify(shock: PolicyShock, context: any): IdentificationClass {
    const hasTime = shock.timing !== undefined || (context?.years?.length > 0);
    const hasControlGroup = context?.controlUnits?.length > 0 || context?.hasControl;
    const isCrossCountry = context?.isCrossCountry || context?.countriesCount > 1;

    if (context?.randomizedTrial === true) {
      return "RANDOMIZED";
    }

    if (hasTime && hasControlGroup && !isCrossCountry) {
      return "DIFFERENCE_IN_DIFFERENCES";
    }

    if (isCrossCountry && hasControlGroup) {
      return "SYNTHETIC_CONTROL";
    }

    if (hasTime) {
      return "EVENT_STUDY";
    }

    if (context?.instrumentalVariable) {
      return "INSTRUMENTAL_VARIABLE";
    }

    return "REDUCED_FORM_SIMULATION";
  }

  /**
   * Evaluates the latent identification assumptions given the policy shock and pre-treatment data metrics.
   */
  evaluateAssumptions(shock: PolicyShock, data: any): IdentificationAssumptions {
    const parallelTrends = this.checkParallelTrends(data);
    const overlapQuality = this.checkSupportOverlap(data);
    const spilloverRisk = this.estimateSpillovers(data, shock);
    const exogeneityStrength = this.checkExogeneity(shock, data);
    const supportOverlap = overlapQuality;

    return {
      parallelTrends,
      overlapQuality,
      spilloverRisk,
      exogeneityStrength,
      supportOverlap
    };
  }

  private checkParallelTrends(data: any): number {
    // preTreatmentDifference / preVariance model metrics
    const preTreatmentDiff = data?.preTreatmentDifference ?? 0.12;
    const variance = data?.preVariance ?? 0.85;
    
    // Higher ratio means worse trend matching
    const ratio = Math.abs(preTreatmentDiff / Math.max(0.01, variance));
    const score = Math.max(0, 1 - ratio * 0.5);
    return Number(Math.min(1, score).toFixed(4));
  }

  private checkSupportOverlap(data: any): number {
    // Covariate overlap quality (how similar treatment and control baseline elements are)
    const treatedBase = data?.treatedBaseline ?? 6.2;
    const controlBase = data?.controlBaseline ?? 5.8;
    const difference = Math.abs(treatedBase - controlBase);
    
    const score = Math.max(0, 1 - (difference / 2.0));
    return Number(Math.min(1, score).toFixed(4));
  }

  private estimateSpillovers(data: any, shock: PolicyShock): number {
    // Estimates macro spillover risk (SDR constraints, cross border flows, capital channel friction)
    const regionalIntegration = data?.regionalIntegration ?? 0.45;
    const flowElasticities = data?.flowElasticities ?? 0.35;
    const intensityWeight = Math.min(1.0, shock.intensity / 10.0);
    
    // Higher spillover = worse identification
    const spillover = (regionalIntegration * 0.4) + (flowElasticities * 0.4) + (intensityWeight * 0.2);
    return Number(Math.min(1, Math.max(0, spillover)).toFixed(4));
  }

  private checkExogeneity(shock: PolicyShock, data: any): number {
    // Evaluates selection bias and macroeconomic endogeneity cycles
    const politicalSelectionBias = data?.politicalSelectionBias ?? 0.25;
    const feedbackElasticity = data?.feedbackElasticity ?? 0.30;
    
    const endogeneityStrength = (politicalSelectionBias * 0.6) + (feedbackElasticity * 0.4);
    return Number(Math.max(0, 1 - endogeneityStrength).toFixed(4));
  }

  /**
   * Computes the robust multi-criteria Identification Validity Score (IVS) and builds reports.
   */
  compute(shock: PolicyShock, context: any, data: any): IdentificationResult {
    const cls = this.classify(shock, context);
    const assumptions = this.evaluateAssumptions(shock, data);

    // IVS weight algebra:
    // parallelTrends (25%), overlapQuality (20%), non-spillover target (20%), exogeneityStrength (20%), supportOverlap (15%)
    const score =
      10 *
      (
        assumptions.parallelTrends * 0.25 +
        assumptions.overlapQuality * 0.20 +
        (1 - assumptions.spilloverRisk) * 0.20 +
        assumptions.exogeneityStrength * 0.20 +
        assumptions.supportOverlap * 0.15
      );

    const finalScore = Number(score.toFixed(2));
    const validForPublication = finalScore >= 7.2;

    const warnings: string[] = [];

    if (assumptions.spilloverRisk > 0.55) {
      warnings.push("High spillover risk: Contamination among neighboring payment corridors detected. Standard SCM weights can introduce counterfactual attenuation bias.");
    }

    if (assumptions.parallelTrends < 0.65) {
      warnings.push("Parallel trends challenge: Pre-treatment dynamic trends show signs of divergence. Difference-in-Differences estimates must be interpreted with caution.");
    }

    if (assumptions.exogeneityStrength < 0.65) {
      warnings.push("Policy Endogeneity detected: Political selection bias is high. Rollouts are non-randomly allocated to higher-viability clusters.");
    }

    if (shock.intensity > 8.0) {
      warnings.push("Extreme shock intensity: General equilibrium feedback effects might violate stable unit treatment value assumptions (SUTVA).");
    }

    return {
      class: cls,
      score: finalScore,
      assumptions,
      warnings,
      recommendedMethod: cls,
      validForPublication,
      explanation: this.generateExplanation(cls, finalScore, assumptions)
    };
  }

  private generateExplanation(cls: IdentificationClass, score: number, assumptions: IdentificationAssumptions): string {
    const qualityLabel = score >= 8.5 ? "Tier-1 Empirical Identification Quality" : score >= 7.2 ? "Publication-Grade Identification Quality" : "Simulation-Only Core Quality Focus";
    return `The CAD Structural Identification Engine classifies this intervention design under the [${cls}] framework with an Identification Validity Score (IVS) of ${score.toFixed(2)}/10 (${qualityLabel}).

Parallel Trends Alignment: ${(assumptions.parallelTrends * 100).toFixed(1)}%
Support Covariate Overlap: ${(assumptions.overlapQuality * 100).toFixed(1)}%
Unconfounded Exogeneity Rating: ${(assumptions.exogeneityStrength * 100).toFixed(1)}%
Spillover SUTVA Leakage: ${(assumptions.spilloverRisk * 100).toFixed(1)}%`;
  }
}
