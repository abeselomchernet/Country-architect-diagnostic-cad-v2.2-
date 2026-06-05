export interface ValidationResult {
  status: "accepted" | "rejected";
  warnings: string[];
}

export interface MacroIndicatorInput {
  gdpGrowth?: number;     // Scale of -50% to +50%
  inflation?: number;     // Scale of -10% to +1000%
  mobileSubs?: number;    // Scale of 0 to 200 per 100 people
  bankBranches?: number;  // Scale of 0 to 50 per 100,000 adults
}

export class DataValidationLayer {
  /**
   * Validates econometric and institution indicators before OLS regression fitting or calibrations.
   * Rejects pathological, un-physical values with descriptive bounds warnings.
   */
  static validate(data: MacroIndicatorInput): ValidationResult {
    const warnings: string[] = [];
    let status: "accepted" | "rejected" = "accepted";

    if (data.gdpGrowth !== undefined && data.gdpGrowth !== null) {
      if (data.gdpGrowth < -50 || data.gdpGrowth > 50) {
        status = "rejected";
        warnings.push(`Critical GDP Growth outlier (${data.gdpGrowth.toFixed(1)}%) violates sovereign physical bound [-50%, +50%].`);
      }
    }

    if (data.inflation !== undefined && data.inflation !== null) {
      if (data.inflation < -10 || data.inflation > 1000) {
        status = "rejected";
        warnings.push(`Inflation outlier (${data.inflation.toFixed(1)}%) exceeds asymptotic currency limits [-10%, +1000%].`);
      }
    }

    if (data.mobileSubs !== undefined && data.mobileSubs !== null) {
      if (data.mobileSubs < 0 || data.mobileSubs > 200) {
        status = "rejected";
        warnings.push(`Mobile subscriptions density (${data.mobileSubs.toFixed(1)} per 100 people) violates density floor/ceiling limits [0, 200].`);
      }
    }

    if (data.bankBranches !== undefined && data.bankBranches !== null) {
      if (data.bankBranches < 0 || data.bankBranches > 50) {
        status = "rejected";
        warnings.push(`Commercial bank branch density (${data.bankBranches.toFixed(1)} per 100k adults) exceeds operational index constraints [0, 50].`);
      }
    }

    return { status, warnings };
  }
}
