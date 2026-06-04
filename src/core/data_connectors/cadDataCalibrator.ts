import { WorldBankConnector } from "./worldBankConnector";
import { IMFConnector } from "./imfConnector";
import { MacroNormalizer } from "./macroNormalizer";
import { CADInput } from "../cadEngine";
import { SampleCountries } from "../multi_country_engine";

export class CADDataCalibrator {
  /**
   * Pulls World Bank & IMF data, normalizes it, and builds/merges a fully calibrated CADInput object.
   */
  static async calibrateCountry(countryCode: string): Promise<CADInput> {
    const code = countryCode.toUpperCase();
    
    // Find baseline to merge with (otherwise fallback to general reasonable parameters)
    const baselineCountry = SampleCountries.find(
      (c) => c.id.toUpperCase() === code || c.name.toUpperCase() === code
    );
    const baseState: CADInput = baselineCountry?.state ?? {
      demandReality: 6.0,
      deliveryInfrastructure: 6.0,
      trustArchitecture: 6.0,
      unitEconomics: 5.5,
      capitalPresence: 5.5,
      dataLegibility: 5.5,
      structuringCapacity: 5.5,
      regulatoryTranslation: 5.5,
      capitalAdequacy: 6.0,
      politicalAccess: 6.5,
      executionDensity: 6.0,
      dataCapability: 6.0,
      trustAcquisition: 6.0,
      systemFailureRate: 30,
      frictionFloor: 3.5,
    };

    // Trigger API fetches in parallel for high performance
    try {
      const [wb, imf] = await Promise.all([
        WorldBankConnector.getMacroPack(countryCode),
        IMFConnector.getMacroStability(countryCode),
      ]);

      const metrics = MacroNormalizer.normalizeAll(wb, imf);

      // Construct customized CAD inputs by blending normalized macro indicators with context
      // Fallback to base state values if specific indicator fetches failed (returned null/averages)
      return {
        // Pillar I: Grassroots System Viability (GSV)
        demandReality: Number(
          ((baseState.demandReality + metrics.gdpScore) / 2).toFixed(4)
        ),
        deliveryInfrastructure: Number(
          ((baseState.deliveryInfrastructure + metrics.connectivityScore) / 2).toFixed(4)
        ),
        trustArchitecture: Number(
          ((baseState.trustArchitecture + metrics.financialDepth) / 2).toFixed(4)
        ),
        unitEconomics: Number(
          ((baseState.unitEconomics + metrics.gdpPerCapitaScore) / 2).toFixed(4)
        ),

        // Pillar II: Institutional Translation Capacity (ITC)
        capitalPresence: Number(
          ((baseState.capitalPresence + metrics.fiscalStability) / 2).toFixed(4)
        ),
        dataLegibility: Number(
          ((baseState.dataLegibility + metrics.connectivityScore) / 2).toFixed(4)
        ),
        structuringCapacity: Number(
          ((baseState.structuringCapacity + metrics.externalBalance) / 2).toFixed(4)
        ),
        regulatoryTranslation: Number(
          ((baseState.regulatoryTranslation + metrics.financialDepth) / 2).toFixed(4)
        ),

        // Pillar IV: Architect Feasibility Layer (AFL)
        capitalAdequacy: Number(
          ((baseState.capitalAdequacy + metrics.debtStress) / 2).toFixed(4)
        ),
        politicalAccess: baseState.politicalAccess, // administrative / non-macro
        executionDensity: Number(
          ((baseState.executionDensity + metrics.connectivityScore) / 2).toFixed(4)
        ),
        dataCapability: Number(
          ((baseState.dataCapability + metrics.connectivityScore) / 2).toFixed(4)
        ),
        trustAcquisition: Number(
          ((baseState.trustAcquisition + metrics.financialDepth) / 2).toFixed(4)
        ),

        // System Parameters
        systemFailureRate: Number(
          Math.max(
            10,
            Math.min(
              90,
              baseState.systemFailureRate === undefined
                ? 100 - metrics.debtStress * 10
                : (baseState.systemFailureRate + (100 - metrics.debtStress * 10)) / 2
            )
          ).toFixed(1)
        ),
        frictionFloor: Number(
          Math.max(
            1.0,
            Math.min(
              10.0,
              baseState.frictionFloor === undefined
                ? 12 - metrics.connectivityScore
                : (baseState.frictionFloor + (12 - metrics.connectivityScore)) / 2
            )
          ).toFixed(3)
        ),
      };
    } catch (e) {
      console.warn(`CAD Calibration failed for ${countryCode}, using baseline state properties:`, e);
      return baseState;
    }
  }
}
