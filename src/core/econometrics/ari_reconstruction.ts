import { MacroPanelData, TimeSeriesObservation } from "./worldBank_timeseries";

export interface ReconstructedObservation {
  year: number;
  gsv: number;
  itc: number;
  afl: number;
  lic: number;
  ari: number;
  gdpGrowth: number | null;
  inflation: number | null;
  mobilePenetration: number | null;
  financialAccess: number | null;
  observed: boolean;     // True if all indicators were directly observed historically (i.e. no interpolation)
  interpolated: boolean; // True if one or more indicators required linear interpolation
}

export class ARIReconstruction {
  /**
   * Reconstructs historical ARI indices by aligning diverse World Bank timelines by year.
   * Performs rigorous linear interpolation on missing data points and flags them correctly.
   */
  static reconstruct(panel: MacroPanelData): ReconstructedObservation[] {
    const yearsSet = new Set<number>();
    
    // Collect all year indicators represented in any of the indicators
    panel.gdpGrowth.forEach(d => yearsSet.add(d.year));
    panel.inflation.forEach(d => yearsSet.add(d.year));
    panel.mobilePenetration.forEach(d => yearsSet.add(d.year));
    panel.financialAccess.forEach(d => yearsSet.add(d.year));

    const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

    // Map by year for rapid lookup of raw World Bank values
    const growthMap = new Map(panel.gdpGrowth.map(d => [d.year, d.value]));
    const inflationMap = new Map(panel.inflation.map(d => [d.year, d.value]));
    const mobileMap = new Map(panel.mobilePenetration.map(d => [d.year, d.value]));
    const bankMap = new Map(panel.financialAccess.map(d => [d.year, d.value]));

    // Helper to perform linear interpolation / fill on any metric across sorted years
    const interpolateMetric = (
      year: number,
      rawMap: Map<number, number | null>,
      defaultFallback: number
    ): { value: number; isObserved: boolean } => {
      const rawVal = rawMap.get(year);
      if (rawVal !== null && rawVal !== undefined) {
        return { value: rawVal, isObserved: true };
      }

      // Find nearest observed points
      let prevYr: number | null = null;
      let prevVal: number | null = null;
      let nextYr: number | null = null;
      let nextVal: number | null = null;

      // Find previous observed year
      for (let y = year - 1; y >= sortedYears[0]; y--) {
        const v = rawMap.get(y);
        if (v !== null && v !== undefined) {
          prevYr = y;
          prevVal = v;
          break;
        }
      }

      // Find next observed year
      for (let y = year + 1; y <= sortedYears[sortedYears.length - 1]; y++) {
        const v = rawMap.get(y);
        if (v !== null && v !== undefined) {
          nextYr = y;
          nextVal = v;
          break;
        }
      }

      // Linear interpolation math
      if (prevYr !== null && prevVal !== null && nextYr !== null && nextVal !== null) {
        const interpolated = prevVal + (nextVal - prevVal) * (year - prevYr) / (nextYr - prevYr);
        return { value: interpolated, isObserved: false };
      } else if (prevYr !== null && prevVal !== null) {
        return { value: prevVal, isObserved: false }; // Forward fill
      } else if (nextYr !== null && nextVal !== null) {
        return { value: nextVal, isObserved: false }; // Backward fill
      }

      return { value: defaultFallback, isObserved: false }; // Total fallback empty
    };

    const results: ReconstructedObservation[] = [];

    for (const year of sortedYears) {
      const rawGdp = growthMap.get(year);
      const rawInf = inflationMap.get(year);
      const rawMob = mobileMap.get(year);
      const rawBnk = bankMap.get(year);

      // Determine true observation status (observed only if all variables existed)
      const observed = 
        rawGdp !== undefined && rawGdp !== null &&
        rawInf !== undefined && rawInf !== null &&
        rawMob !== undefined && rawMob !== null &&
        rawBnk !== undefined && rawBnk !== null;

      // Filter out years that are entirely vacant (all null)
      if (
        (rawGdp === undefined || rawGdp === null) &&
        (rawInf === undefined || rawInf === null) &&
        (rawMob === undefined || rawMob === null) &&
        (rawBnk === undefined || rawBnk === null)
      ) {
        continue;
      }

      // Run interpolation for individual metrics using standard academic priors as base fallbacks
      const gdpResult = interpolateMetric(year, growthMap, 4.0);
      const infResult = interpolateMetric(year, inflationMap, 8.0);
      const mobResult = interpolateMetric(year, mobileMap, 60.0);
      const bnkResult = interpolateMetric(year, bankMap, 8.0);

      const rGDPGrowth = gdpResult.value;
      const rInflation = infResult.value;
      const rMobile = mobResult.value;
      const rBank = bnkResult.value;

      // Compute proxies using dynamic structural formulas
      const gsv = this.proxyGSV(rGDPGrowth, rMobile);
      const itc = this.proxyITC(rBank, rMobile);
      const afl = this.proxyAFL(rMobile, rBank);
      const lic = this.proxyLIC(rMobile, rInflation, gsv);

      // ARI Formula: 35% GSV + 35% ITC + 20% (10 - LIC friction) + 10% AFL
      const ari = Number(
        ((gsv * 0.35) + (itc * 0.35) + ((10 - lic) * 0.20) + (afl * 0.10)).toFixed(4)
      );

      results.push({
        year,
        gsv: Number(gsv.toFixed(4)),
        itc: Number(itc.toFixed(4)),
        afl: Number(afl.toFixed(4)),
        lic: Number(lic.toFixed(4)),
        ari,
        gdpGrowth: rawGdp !== undefined && rawGdp !== null ? rawGdp : null, // Display null for unobserved parameters
        inflation: rawInf !== undefined && rawInf !== null ? rawInf : null,
        mobilePenetration: rawMob !== undefined && rawMob !== null ? rawMob : null,
        financialAccess: rawBnk !== undefined && rawBnk !== null ? rawBnk : null,
        observed,
        interpolated: !observed
      });
    }

    return results;
  }

  // Low level proxy translations
  private static proxyGSV(gdpGrowth: number, mobile: number): number {
    const baseValue = (gdpGrowth / 1.5) + 4.5 + (mobile / 40);
    return Math.max(1.0, Math.min(10.0, baseValue));
  }

  private static proxyITC(bankAccess: number, mobile: number): number {
    const baseValue = (bankAccess / 4.0) + 2.5 + (mobile / 35);
    return Math.max(1.0, Math.min(10.0, baseValue));
  }

  private static proxyAFL(mobile: number, bank: number): number {
    const baseValue = (mobile / 18) + (bank / 12) + 3.0;
    return Math.max(1.0, Math.min(10.0, baseValue));
  }

  private static proxyLIC(mobile: number, inflation: number, gsv: number): number {
    const infRisk = inflation > 15 ? (inflation - 15) / 5 : 0;
    const baseValue = (12 - gsv) * 0.5 + infRisk + Math.max(0, 4 - (mobile / 30));
    return Math.max(1.0, Math.min(10.0, baseValue));
  }
}
