import { MacroPanelData, TimeSeriesObservation } from "./worldBank_timeseries";

export interface ReconstructedObservation {
  year: number;
  gsv: number;
  itc: number;
  afl: number;
  lic: number;
  ari: number;
  gdpGrowth: number;
  inflation: number;
  mobilePenetration: number;
  financialAccess: number;
}

export class ARIReconstruction {
  /**
   * Reconstructs historical ARI indices by aligning diverse World Bank timelines by year.
   */
  static reconstruct(panel: MacroPanelData): ReconstructedObservation[] {
    const yearsSet = new Set<number>();
    
    // Collect all year indicators
    panel.gdpGrowth.forEach(d => yearsSet.add(d.year));
    panel.inflation.forEach(d => yearsSet.add(d.year));
    panel.mobilePenetration.forEach(d => yearsSet.add(d.year));
    panel.financialAccess.forEach(d => yearsSet.add(d.year));

    const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

    // Map by year for rapid lookup
    const growthMap = new Map(panel.gdpGrowth.map(d => [d.year, d.value]));
    const inflationMap = new Map(panel.inflation.map(d => [d.year, d.value]));
    const mobileMap = new Map(panel.mobilePenetration.map(d => [d.year, d.value]));
    const bankMap = new Map(panel.financialAccess.map(d => [d.year, d.value]));

    const results: ReconstructedObservation[] = [];

    for (const year of sortedYears) {
      const gdpGrowth = growthMap.get(year) ?? null;
      const inflation = inflationMap.get(year) ?? null;
      const mobilePenetration = mobileMap.get(year) ?? null;
      const financialAccess = bankMap.get(year) ?? null;

      // Filter out points with almost no core infrastructure or growth data to prevent noise
      if (gdpGrowth === null && mobilePenetration === null) continue;

      // Safe evaluation metrics with fallback defaults
      const rGDPGrowth = gdpGrowth ?? 4.0;
      const rInflation = inflation ?? 8.0;
      const rMobile = mobilePenetration ?? 60.0;
      const rBank = financialAccess ?? 8.0;

      // Compute proxies
      const gsv = this.proxyGSV(rGDPGrowth, rMobile);
      const itc = this.proxyITC(rBank, rMobile);
      const afl = this.proxyAFL(rMobile, rBank);
      const lic = this.proxyLIC(rMobile, rInflation, gsv);

      // ARI formula: 35% GSV + 35% ITC + 20% (10 - LIC friction) + 10% AFL
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
        gdpGrowth: Number(rGDPGrowth.toFixed(4)),
        inflation: Number(rInflation.toFixed(4)),
        mobilePenetration: Number(rMobile.toFixed(4)),
        financialAccess: Number(rBank.toFixed(4))
      });
    }

    return results;
  }

  // Low level proxy translations
  private static proxyGSV(gdpGrowth: number, mobile: number): number {
    // GSV scales with annual growth (+4 baseline) and localized communication network accessibility
    const baseValue = (gdpGrowth / 1.5) + 4.5 + (mobile / 40);
    return Math.max(1.0, Math.min(10.0, baseValue));
  }

  private static proxyITC(bankAccess: number, mobile: number): number {
    // ITC scales with banking deployment and regulatory communication readiness
    const baseValue = (bankAccess / 4.0) + 2.5 + (mobile / 35);
    return Math.max(1.0, Math.min(10.0, baseValue));
  }

  private static proxyAFL(mobile: number, bank: number): number {
    // AFL: administrative feasibility, capability, and cell density proxy
    const baseValue = (mobile / 18) + (bank / 12) + 3.0;
    return Math.max(1.0, Math.min(10.0, baseValue));
  }

  private static proxyLIC(mobile: number, inflation: number, gsv: number): number {
    // Symmetrical Lock Friction represents structural resistance: high inflation and low digital capacity magnifies it
    const infRisk = inflation > 15 ? (inflation - 15) / 5 : 0;
    const baseValue = (12 - gsv) * 0.5 + infRisk + Math.max(0, 4 - (mobile / 30));
    return Math.max(1.0, Math.min(10.0, baseValue));
  }
}
