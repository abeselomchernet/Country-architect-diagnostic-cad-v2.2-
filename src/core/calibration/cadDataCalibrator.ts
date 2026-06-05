import { CADInput } from "../cadEngine";
import { WorldBankTimeSeries, MacroPanelData, TimeSeriesObservation } from "../econometrics/worldBank_timeseries";
import { CGAPDataConnector } from "./cgapDataConnector";

export interface IMFMacroIndicators {
  sovereignDebtToGdp: TimeSeriesObservation[]; // e.g. IMF primary balance or debt ratio
  regulatoryQualityIndex: TimeSeriesObservation[]; // regulatory capacity index (0 to 100 proxy)
}

export class IMFDataConnector {
  /**
   * Fetches proxy structural indicators mimicking IMF primary databases
   * using World Bank's GGI (Global Governance Indicators) or central bank standards.
   */
  static async fetchIndicators(countryCode: string): Promise<IMFMacroIndicators> {
    // IMF structural adjustment policy datasets often track central government debt & regulatory quality.
    // We map these to World Bank indicators supporting the JEL calibration of the CAD engine:
    // GC.DOD.TOTL.GD.ZS: Central government debt, total (% of GDP)
    // RQ.EST: Regulatory Quality Estimate
    const code = countryCode.toLowerCase() === "mature" ? "KEN" : countryCode.toLowerCase() === "sig" ? "SEN" : countryCode.toUpperCase();
    
    const [debtData, regData] = await Promise.all([
      WorldBankTimeSeries.fetchSeries(code, "GC.DOD.TOTL.GD.ZS"),
      WorldBankTimeSeries.fetchSeries(code, "RQ.EST") // Regulatory quality proxy estimates
    ]);

    // Fill in default values if the API fails or returns sparse data
    const finalDebt = debtData.length > 0 ? debtData : [{ year: 2025, value: 65.5 }];
    const finalReg = regData.length > 0 ? regData : [{ year: 2025, value: 0.25 }]; // Standard index spans -2.5 to 2.5

    return {
      sovereignDebtToGdp: finalDebt,
      regulatoryQualityIndex: finalReg
    };
  }
}

export class CADDataCalibrator {
  /**
   * Standardizes sovereign macroeconomic rates onto CAD v2.2's 0-10 ordinal scale.
   * Compiles multi-variable indices based on the active country profile.
   */
  static async calibrateState(countryCode: string, fallbackState: CADInput): Promise<CADInput> {
    try {
      const [wbPanel, imfPanel, cgapPanel] = await Promise.all([
        WorldBankTimeSeries.getMacroPanel(countryCode),
        IMFDataConnector.fetchIndicators(countryCode),
        CGAPDataConnector.fetchIndicators(countryCode)
      ]);

      const latestVal = (series: TimeSeriesObservation[], fallback: number): number => {
        if (!series || series.length === 0) return fallback;
        // Grab the most recent year with valid data
        const sorted = [...series].sort((a, b) => b.year - a.year);
        return sorted[0].value;
      };

      // Extract raw indicators
      const gdpGrowth = latestVal(wbPanel.gdpGrowth, 4.5);
      const inflation = latestVal(wbPanel.inflation, 8.0);
      const mobilePenetration = latestVal(wbPanel.mobilePenetration, 70.0);
      const financialAccess = latestVal(wbPanel.financialAccess, 10.0);
      const debtRatio = latestVal(imfPanel.sovereignDebtToGdp, 65.0);
      const regEstimate = latestVal(imfPanel.regulatoryQualityIndex, 0.0); // usually -2.5 to 2.5
      const findexAccountOwnership = latestVal(cgapPanel.mobileMoneyAccountPct, 45.0); // Findex mobile/bank usage %

      // ==========================================
      // CAD & CGAP JOINT NORMALIZATION ALGORITHMS
      // ==========================================

      // 1. Delivery Infrastructure: Logarithmic mapping of mobile pen (0-150% cap range)
      const deliveryInfrastructure = Math.min(10, Math.max(1, (mobilePenetration / 110) * 10));

      // 2. Unit Economics: Impaired by severe inflation.
      // 0% standard inflation = high rating (9.0). 30%+ hyperinflation pulls score down.
      let unitEconomics = 9.0;
      if (gdpGrowth > 0) {
        unitEconomics += (gdpGrowth - 3.0) * 0.2; // positive feedback from strong GDP growth
      }
      unitEconomics -= (inflation > 5.0 ? (inflation - 5.0) * 0.15 : 0);
      unitEconomics = Math.min(10, Math.max(1, unitEconomics));

      // 3. Capital Presence: Compounded by bank branch coverage and macro financial depth
      const capitalPresence = Math.min(10, Math.max(1, (financialAccess / 25) * 10 + (gdpGrowth > 0 ? gdpGrowth * 0.15 : 0)));

      // 4. Regulatory Translation: Normalizes the JEL estimate (-2.5 to +2.5) to a clean 0-10 score
      const regulatoryTranslation = Math.min(10, Math.max(1, ((regEstimate + 2.5) / 5) * 10));

      // 5. Systemic Friction Floor: Inflated by national debt constraints and currency volatilities
      // High sovereign debt-to-GDP ratio restricts treasury liquidity buffer, pushing up deadweight costs
      const debtFriction = debtRatio > 60 ? (debtRatio - 60) * 0.04 : 0;
      const inflationFriction = inflation > 10 ? (inflation - 10) * 0.05 : 0;
      const frictionFloor = Math.min(10, Math.max(1.5, 3.5 + debtFriction + inflationFriction));

      // 6. Systemic Failure Rate (Outages %): Scaled by infant delivery structures
      const infraDeficit = 10 - deliveryInfrastructure;
      const systemFailureRate = Math.min(90, Math.max(5, 15 + (infraDeficit * 5) + (inflation > 15 ? (inflation - 15) * 0.6 : 0)));

      // 7. CGAP Adjusted Demand Reality: Weight of Findex base account inclusion + GDP status
      const demandReality = Math.min(10, Math.max(1, (findexAccountOwnership / 10) * 0.70 + (gdpGrowth > 0 ? 1.5 : 0.5)));

      // 8. CGAP Trust Architecture: Direct scaling of CGAP customer protection index
      const trustArchitecture = Number(cgapPanel.consumerProtectionRecourseIndex.toFixed(4));

      // 9. CGAP Execution Density: Blending physical agent networks with banking reach
      const executionDensity = Math.min(10, Math.max(1, (cgapPanel.agentNetworkViabilityIndex * 0.7) + (financialAccess / 25) * 3));

      // 10. CGAP Trust Acquisition: Scaled dynamically based on Microfinance digital penetration
      const trustAcquisition = Math.min(10, Math.max(1, cgapPanel.microfinanceIntegrationRate / 10));

      // Assemble final calibrated CAD state
      const calibratedState: CADInput = {
        demandReality: Number(demandReality.toFixed(4)),
        deliveryInfrastructure: Number(deliveryInfrastructure.toFixed(4)),
        trustArchitecture,
        unitEconomics: Number(unitEconomics.toFixed(4)),
        capitalPresence: Number(capitalPresence.toFixed(4)),
        dataLegibility: Math.min(10, Math.max(1, fallbackState.dataLegibility + (mobilePenetration > 80 ? 0.8 : -0.2))),
        structuringCapacity: fallbackState.structuringCapacity, // Preserved
        regulatoryTranslation: Number(regulatoryTranslation.toFixed(4)),
        capitalAdequacy: fallbackState.capitalAdequacy,
        politicalAccess: fallbackState.politicalAccess,
        executionDensity: Number(executionDensity.toFixed(4)),
        dataCapability: fallbackState.dataCapability,
        trustAcquisition: Number(trustAcquisition.toFixed(4)),
        priorARI: fallbackState.priorARI,
        deltaTime: fallbackState.deltaTime,
        systemFailureRate: Number(systemFailureRate.toFixed(2)),
        frictionFloor: Number(frictionFloor.toFixed(4))
      };

      return calibratedState;
    } catch (e) {
      console.warn(`[CADDataCalibrator] Automated calibration failed for ${countryCode}, utilizing fallback baseline.`, e);
      return fallbackState;
    }
  }
}
