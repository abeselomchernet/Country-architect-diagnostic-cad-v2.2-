export interface ValidationMetrics {
  correlation: number;
  mse: number;
  mae: number;
  n: number;
  covariance: number;
}

export class EconometricValidationEngine {
  /**
   * Computes Pearson's product-moment correlation coefficient.
   */
  static computeCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n <= 1) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;

      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    if (denX === 0 || denY === 0) return 0;
    return num / Math.sqrt(denX * denY);
  }

  /**
   * Computes the Mean Squared Error (MSE).
   */
  static mse(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;

    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += Math.pow(x[i] - y[i], 2);
    }
    return sum / n;
  }

  /**
   * Computes Mean Absolute Error (MAE).
   */
  static mae(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;

    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += Math.abs(x[i] - y[i]);
    }
    return sum / n;
  }

  /**
   * Computes Covariance between two rosters.
   */
  static covariance(x: number[], y: number[]): number {
    const n = x.length;
    if (n <= 1) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += (x[i] - meanX) * (y[i] - meanY);
    }
    return sum / (n - 1);
  }

  /**
   * Performs unified comparison metrics execution.
   */
  static validate(ari: number[], targetVariable: number[]): ValidationMetrics {
    const minLength = Math.min(ari.length, targetVariable.length);
    const x = ari.slice(0, minLength);
    const y = targetVariable.slice(0, minLength);

    return {
      correlation: this.computeCorrelation(x, y),
      mse: this.mse(x, y),
      mae: this.mae(x, y),
      n: minLength,
      covariance: this.covariance(x, y)
    };
  }
}
