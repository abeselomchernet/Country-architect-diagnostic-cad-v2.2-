import { WorldBankMacroPack } from "./worldBankConnector";
import { IMFMacroPack } from "./imfConnector";

export interface NormalizedMacroMetrics {
  gdpScore: number;
  gdpPerCapitaScore: number;
  inflationScore: number;
  financialDepth: number;
  connectivityScore: number;
  fiscalStability: number;
  externalBalance: number;
  debtStress: number;
}

export class MacroNormalizer {
  /**
   * Translates a numeric value from a raw interval [min, max] into an [outMin, outMax] target rating interval.
   */
  static scale(value: number | null, min: number, max: number, outMin = 1, outMax = 10): number {
    if (value === null || value === undefined || isNaN(value)) {
      return (outMin + outMax) / 2; // Default to mid point (e.g., 5.5 for a 1-10 range)
    }
    const norm = (value - min) / (max - min);
    const result = outMin + norm * (outMax - outMin);
    return Math.max(outMin, Math.min(outMax, Number(result.toFixed(4))));
  }

  /**
   * Scales GDP on a log-scale to better accommodate massive sovereign size differences (e.g. Senegal vs Nigeria).
   */
  static scaleLogarithmic(value: number | null, min: number, max: number, outMin = 1, outMax = 10): number {
    if (value === null || value === undefined || isNaN(value) || value <= 0) {
      return (outMin + outMax) / 2;
    }
    const logVal = Math.log10(value);
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    return this.scale(logVal, logMin, logMax, outMin, outMax);
  }

  static normalizeWorldBank(wb: WorldBankMacroPack): {
    gdpScore: number;
    gdpPerCapitaScore: number;
    inflationScore: number;
    financialDepth: number;
    connectivityScore: number;
  } {
    return {
      // Scale GDP between $5B and $500B on a log scale
      gdpScore: this.scaleLogarithmic(wb.gdp, 5e9, 5e11, 4, 9),
      // Scale GDP per capita between $500 and $15000 on a log scale
      gdpPerCapitaScore: this.scaleLogarithmic(wb.gdpPerCapita, 500, 15000, 3, 9.5),
      // Higher inflation reduces stability. Low inflation (< 10%) is close to 10 rating. High inflation (> 30%) drops to 2.
      inflationScore: this.scale(wb.inflation !== null ? 35 - Math.max(0, wb.inflation) : null, 0, 35, 2, 9.5),
      // Scale branch availability from 1 branch to 50 branches per 100k adults
      financialDepth: this.scale(wb.bankingAccess, 1, 50, 3, 9.5),
      // Scale mobile penetration from 40% to 140%
      connectivityScore: this.scale(wb.mobileSubs, 40, 140, 3.5, 9.5)
    };
  }

  static normalizeIMF(imf: IMFMacroPack): {
    fiscalStability: number;
    externalBalance: number;
    debtStress: number;
  } {
    return {
      // Fiscal balance: -10% of GDP is weak (3.0 rating), 0% is strong (8.0 rating), +5% is pristine (9.5 rating)
      fiscalStability: this.scale(imf.fiscalBalance, -12, 4, 3, 9.5),
      // Current account: -10% is structurally weak (3.5 rating), +5% is strong (9.0 rating)
      externalBalance: this.scale(imf.currentAccount, -10, 6, 3.5, 9.5),
      // Debt to GDP: 10% is low stress (9.5 rating), 120% is high stress (2.0 rating)
      debtStress: this.scale(imf.debtToGDP !== null ? 140 - imf.debtToGDP : null, 20, 140, 2, 9.5)
    };
  }

  static normalizeAll(wb: WorldBankMacroPack, imf: IMFMacroPack): NormalizedMacroMetrics {
    const wbNorm = this.normalizeWorldBank(wb);
    const imfNorm = this.normalizeIMF(imf);

    return {
      gdpScore: wbNorm.gdpScore,
      gdpPerCapitaScore: wbNorm.gdpPerCapitaScore,
      inflationScore: wbNorm.inflationScore,
      financialDepth: wbNorm.financialDepth,
      connectivityScore: wbNorm.connectivityScore,
      fiscalStability: imfNorm.fiscalStability,
      externalBalance: imfNorm.externalBalance,
      debtStress: imfNorm.debtStress
    };
  }
}
