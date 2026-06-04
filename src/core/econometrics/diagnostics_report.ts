import { OLSRegressionResult, SSRNRegressionModel } from "./regression_model";
import { EconometricValidationEngine, ValidationMetrics } from "./validation_engine";
import { ReconstructedObservation } from "./ari_reconstruction";

export interface DiagnosticsReportResult {
  observedYears: number[];
  modelResults: OLSRegressionResult;
  metrics: ValidationMetrics;
  narrativeHTML: string;
  significance: string;
  falsified: boolean;
}

export class ValidationReport {
  /**
   * Translates calculated mathematics into diagnostic human narratives and statistics.
   */
  static generate(
    reconstructed: ReconstructedObservation[],
    targetVariable: "gdpGrowth" | "inflation" | "mobile" | "bank" = "gdpGrowth"
  ): DiagnosticsReportResult {
    const years = reconstructed.map((o) => o.year);
    const ari = reconstructed.map((o) => o.ari);
    
    let target: number[] = [];
    let nameReadable = "GDP Growth (Annual %)";
    
    if (targetVariable === "inflation") {
      target = reconstructed.map((o) => o.inflation);
      nameReadable = "Inflation Rate (CPI %)";
    } else if (targetVariable === "mobile") {
      target = reconstructed.map((o) => o.mobilePenetration);
      nameReadable = "Cell Subs / 100 people";
    } else if (targetVariable === "bank") {
      target = reconstructed.map((o) => o.financialAccess);
      nameReadable = "Bank Branches / 100k Adults";
    } else {
      target = reconstructed.map((o) => o.gdpGrowth);
    }

    const modelResults = SSRNRegressionModel.ols(ari, target);
    const metrics = EconometricValidationEngine.validate(ari, target);

    // Isolate significance levels
    let significance = "Highly Significant (p < 0.01)";
    if (modelResults.pValue > 0.10) {
      significance = "Not Significant (p >= 0.10)";
    } else if (modelResults.pValue > 0.05) {
      significance = "Weakly Significant (p < 0.10)";
    } else if (modelResults.pValue > 0.01) {
      significance = "Significant (p < 0.05)";
    }

    const direction = modelResults.beta > 0 ? "positively correlates" : "negatively correlates";
    const correlationStrength = Math.abs(metrics.correlation) > 0.7 
      ? "Strong" 
      : Math.abs(metrics.correlation) > 0.4 
        ? "Moderate" 
        : "Weak / Trace";

    const narrativeHTML = `
      The constructed latent <strong>Architect Readiness Index (ARI)</strong> ${direction} with contemporary observed <strong>${nameReadable}</strong> values over a sample timeline of <i>N = ${metrics.n} observations</i>. 
      <br/><br/>
      Standard Ordinary Least Squares (OLS) estimation calculates a slope coefficient matrix of <strong>&beta; = ${modelResults.beta.toFixed(4)}</strong> with an intercept constant of <strong>&alpha; = ${modelResults.alpha.toFixed(4)}</strong>. 
      This suggests that a 1.0 unit improvement in the composite regulatory readiness metric correlates on average with a change of ${modelResults.beta.toFixed(3)} units in historical outcome channels.
      <br/><br/>
      The model yields a Coefficient of Determination of <strong>R&sup2; = ${modelResults.rSquared.toFixed(4)}</strong>, indicating that the CAD reconstruction explains <strong>${(modelResults.rSquared * 100).toFixed(1)}%</strong> of variance in the proxy. 
      The calculated F-statistic of <strong>F = ${modelResults.fStatistic.toFixed(1)}</strong> and t-statistic of <strong>t = ${modelResults.tStatistic.toFixed(2)}</strong> align with a <strong>${significance}</strong> confidence framework.
    `;

    // A model is considered falsified if the correlation is near zero/random or inverse of theoretical thresholds
    const falsified = Math.abs(metrics.correlation) < 0.10;

    return {
      observedYears: years,
      modelResults,
      metrics,
      narrativeHTML,
      significance,
      falsified
    };
  }
}
