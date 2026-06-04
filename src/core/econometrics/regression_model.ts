export interface OLSRegressionResult {
  alpha: number;       // Intercept
  beta: number;        // Slopes / Elasticity parameter
  rSquared: number;    // R² coefficient of determination
  adjRSquared: number; // Adjusted R²
  fStatistic: number;  // F-statistic for overall significance
  tStatistic: number;  // t-value for beta-estimate
  pValue: number;      // Estimate probability value (p-value)
  residualSE: number;  // Standard Error of Estimate residuals
}

export class SSRNRegressionModel {
  /**
   * Fits a simple bivariate Ordinary Least Squares (OLS) model: Y = alpha + beta * X
   */
  static ols(x: number[], y: number[]): OLSRegressionResult {
    const n = x.length;
    if (n <= 2) {
      return {
        alpha: 0,
        beta: 0,
        rSquared: 0,
        adjRSquared: 0,
        fStatistic: 0,
        tStatistic: 0,
        pValue: 1.0,
        residualSE: 0,
      };
    }

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let denX = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
    }

    const beta = denX === 0 ? 0 : num / denX;
    const alpha = meanY - beta * meanX;

    // Predictions and residuals tracking
    const yHat = x.map((xv) => alpha + beta * xv);
    
    const ssTot = y.reduce((acc, yv) => acc + Math.pow(yv - meanY, 2), 0);
    const ssRes = y.reduce((acc, yv, i) => acc + Math.pow(yv - yHat[i], 2), 0);
    const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

    // Degrees of freedom parameters
    const dfModel = 1;
    const dfResidual = n - 2;

    const adjRSquared = n > 2 
      ? 1 - ((1 - rSquared) * (n - 1)) / dfResidual 
      : rSquared;

    // Standard Error of residuals
    const residualSE = Math.sqrt(ssRes / dfResidual);

    // Standard error of beta estimate
    let sumDxSq = 0;
    for (let i = 0; i < n; i++) {
      sumDxSq += Math.pow(x[i] - meanX, 2);
    }
    const seBeta = sumDxSq === 0 ? 0 : residualSE / Math.sqrt(sumDxSq);

    // T-Statistic for beta
    const tStatistic = seBeta === 0 ? 0 : beta / seBeta;

    // F-Statistic
    const msReg = (ssTot - ssRes) / dfModel;
    const msRes = ssRes / dfResidual;
    const fStatistic = msRes === 0 ? 0 : msReg / msRes;

    // Simple approximate p-value from t-statistic using normal distribution CDF approximation
    // p-value = 2 * (1 - OrgNormCDF(|t|))
    const absT = Math.abs(tStatistic);
    const pValue = this.approximatePValue(absT);

    return {
      alpha: Number(alpha.toFixed(5)),
      beta: Number(beta.toFixed(5)),
      rSquared: Number(Math.max(0, Math.min(1, rSquared)).toFixed(5)),
      adjRSquared: Number(Math.max(0, Math.min(1, adjRSquared)).toFixed(5)),
      fStatistic: Number(fStatistic.toFixed(4)),
      tStatistic: Number(tStatistic.toFixed(4)),
      pValue: Number(pValue.toFixed(6)),
      residualSE: Number(residualSE.toFixed(5)),
    };
  }

  /**
   * Computes an approximate 2-tailed p-value for the standard t-statistic
   */
  private static approximatePValue(t: number): number {
    // Normal approximation logic
    const x = t;
    const tCDF = 1.0 / (1.0 + Math.exp(-0.07056 * Math.pow(x, 3) - 1.5976 * x));
    const pVal = 2.0 * (1.0 - tCDF);
    return Math.max(0, Math.min(1, pVal));
  }
}
