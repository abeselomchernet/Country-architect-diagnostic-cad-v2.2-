import { CADInput, CADEngine, CADResult } from "./cadEngine";
import { PolicyShock } from "./policy_shock_engine";

export type CountryScenario = {
  id: string;
  name: string;
  region: string;
  incomeGroup: "low" | "lower-middle" | "upper-middle" | "high";
  state: CADInput;
  baselineOutput?: CADResult;
};

export type CountryComparisonResult = {
  shockId: string;
  shockName: string;
  results: {
    countryId: string;
    name: string;
    region: string;
    incomeGroup: string;
    before: CADResult;
    after: CADResult;
    deltaARI: number;
    deltaGSV: number;
    deltaITC: number;
    deltaAFL: number;
    deltaLIC: number;
    deltaSDR: number;
    mobilePenetration: number;
    idCoverage: number;
    unscaledDeltaARI: number;
  }[];
  ranking: {
    mostResilient: string;
    mostVulnerable: string;
    highestStructuralGain: string;
  };
  globalInsight: string;
};

export interface CountryMetadata {
  id: string;
  name: string;
  mobilePenetration: number; // 0-100
  idCoverage: number;        // 0-100
}

export const CountryMetadataDB: Record<string, CountryMetadata> = {
  eth: { id: "eth", name: "Ethiopia", mobilePenetration: 48, idCoverage: 40 },
  ken: { id: "ken", name: "Kenya", mobilePenetration: 96, idCoverage: 92 },
  nga: { id: "nga", name: "Nigeria", mobilePenetration: 52, idCoverage: 58 },
  gha: { id: "gha", name: "Ghana", mobilePenetration: 85, idCoverage: 88 },
  rwa: { id: "rwa", name: "Rwanda", mobilePenetration: 82, idCoverage: 95 },
  tza: { id: "tza", name: "Tanzania", mobilePenetration: 68, idCoverage: 72 },
  uga: { id: "uga", name: "Uganda", mobilePenetration: 65, idCoverage: 68 },
  bgd: { id: "bgd", name: "Bangladesh", mobilePenetration: 74, idCoverage: 85 },
  pak: { id: "pak", name: "Pakistan", mobilePenetration: 55, idCoverage: 60 },
};

export class MultiCountryEngine {
  /**
   * Applies a policy shock to a country scenario, scaling the capability improvement using:
   * scaledDelta = baseDelta * (trustArchitecture / 10) * (mobilePenetration / 100) * (idCoverage / 100)
   */
  static applyScaledShock(state: CADInput, shock: PolicyShock, countryId: string): CADInput {
    // 1. Compute baseline unscaled impact state
    const afterUnscaledState = shock.apply({ ...state });
    const meta = CountryMetadataDB[countryId.toLowerCase()] || { mobilePenetration: 70, idCoverage: 75 };

    const trust = state.trustArchitecture; // Scale 0-10
    const mob = meta.mobilePenetration;    // Scale 0-100
    const id = meta.idCoverage;            // Scale 0-100

    // Scaling Multiplier formula specified in CAD v2.2 academic domain
    const multiplier = (trust / 10) * (mob / 100) * (id / 100);

    const scaledState = { ...state };

    const keys = Object.keys(state) as (keyof CADInput)[];
    for (const key of keys) {
      if (typeof state[key] === "number" && typeof afterUnscaledState[key] === "number") {
        const baseVal = state[key] as number;
        const unscaledVal = afterUnscaledState[key] as number;
        const baseDelta = unscaledVal - baseVal;

        // Scale policy upgrades (positive deltas), keep system frictions unscaled
        const isMacroFriction = key === "priorARI" || key === "deltaTime" || key === "systemFailureRate" || key === "frictionFloor";
        
        if (!isMacroFriction) {
          const scaledDelta = baseDelta * multiplier;
          scaledState[key] = Number(Math.max(0, Math.min(10, baseVal + scaledDelta)).toFixed(4));
        } else if (key === "frictionFloor") {
          // Reduce friction floor has POSITIVE feedback. If frictionFloor is lower, system speed improves.
          // Let's scale friction floor reductions (which are negative deltas)
          if (baseDelta < 0) {
            const scaledDelta = baseDelta * multiplier;
            scaledState[key] = Number(Math.max(1, Math.min(10, baseVal + scaledDelta)).toFixed(4));
          } else {
            scaledState[key] = unscaledVal;
          }
        } else {
          // Macro risks (failure rate spikes) apply directly
          scaledState[key] = unscaledVal;
        }
      }
    }

    return scaledState;
  }

  /**
   * Executes the policy shock across all comparative sovereign scenarios, using dynamic micro-scaling.
   */
  static runShockAcrossCountries(
    countries: CountryScenario[],
    shock: PolicyShock
  ): CountryComparisonResult {
    const results = countries.map((c) => {
      const before = CADEngine.compute(c.state);
      
      // Calculate deteminisic unscaled check
      const unscaledAfterState = shock.apply({ ...c.state });
      const unscaledAfter = CADEngine.compute(unscaledAfterState);
      const unscaledDeltaARI = unscaledAfter.ari - before.ari;

      // Apply formal scaled state upgrades
      const afterState = this.applyScaledShock(c.state, shock, c.id);
      const after = CADEngine.compute(afterState);

      const meta = CountryMetadataDB[c.id.toLowerCase()] || { mobilePenetration: 70, idCoverage: 75 };

      return {
        countryId: c.id,
        name: c.name,
        region: c.region,
        incomeGroup: c.incomeGroup,
        before,
        after,
        deltaARI: Number((after.ari - before.ari).toFixed(4)),
        deltaGSV: Number((after.gsv - before.gsv).toFixed(4)),
        deltaITC: Number((after.itc - before.itc).toFixed(4)),
        deltaAFL: Number((after.afl - before.afl).toFixed(4)),
        deltaLIC: Number((after.lic - before.lic).toFixed(4)),
        deltaSDR: Number((after.sdr - before.sdr).toFixed(4)),
        mobilePenetration: meta.mobilePenetration,
        idCoverage: meta.idCoverage,
        unscaledDeltaARI: Number(unscaledDeltaARI.toFixed(4))
      };
    });

    const rankedByGain = [...results].sort((a, b) => b.deltaARI - a.deltaARI);
    const rankedByVulnerability = [...results].sort((a, b) => a.deltaARI - b.deltaARI);

    const highestStructuralGain = rankedByGain[0]?.name || "N/A";
    const mostResilient = rankedByGain.find(r => r.after.ari >= 6.8)?.name || rankedByGain[0]?.name || "N/A";
    const mostVulnerable = rankedByVulnerability[0]?.name || "N/A";

    return {
      shockId: shock.id,
      shockName: shock.name,
      results,
      ranking: {
        mostResilient,
        mostVulnerable,
        highestStructuralGain,
      },
      globalInsight: this.generateInsight(results, shock),
    };
  }

  static generateInsight(results: any[], shock: PolicyShock): string {
    const avgDelta =
      results.reduce((sum, r) => sum + r.deltaARI, 0) / results.length;

    if (avgDelta > 0.8) {
      return `Universal leverage detected under "${shock.name}". Systemic indicators across all comparative vectors registered substantial acceleration. Institutional digital decoupling represents a high reward policy strategy.`;
    }
    if (avgDelta > 0.3) {
      return `Divergent progress. Structural differences in local mobile penetration and biometric ID matching split country-level responses under "${shock.name}". Kenya and Ghana show high elasticity, while Ethiopia is bound by low initial ID coverage.`;
    }
    if (avgDelta >= 0) {
      return `Moderate system response. The shock "${shock.name}" is absorbed by historical friction structures; high local co-dependence reduces instantaneous elastic gains.`;
    }
    return `Systemic stress alert. The shock "${shock.name}" has triggered cascading coordination failures, depressing the readiness metrics of highly coupled economies.`;
  }
}

export const SampleCountries: CountryScenario[] = [
  {
    id: "eth",
    name: "Ethiopia",
    region: "East Africa",
    incomeGroup: "low",
    state: {
      demandReality: 7.5,
      deliveryInfrastructure: 6.0,
      trustArchitecture: 5.5,
      unitEconomics: 5.0,
      capitalPresence: 4.5,
      dataLegibility: 4.8,
      structuringCapacity: 4.2,
      regulatoryTranslation: 5.0,
      capitalAdequacy: 6.0,
      politicalAccess: 6.5,
      executionDensity: 5.5,
      dataCapability: 5.0,
      trustAcquisition: 5.2,
      systemFailureRate: 35,
      frictionFloor: 3.5,
    },
  },
  {
    id: "ken",
    name: "Kenya",
    region: "East Africa",
    incomeGroup: "lower-middle",
    state: {
      demandReality: 8.5,
      deliveryInfrastructure: 7.8,
      trustArchitecture: 8.0,
      unitEconomics: 7.2,
      capitalPresence: 7.0,
      dataLegibility: 7.5,
      structuringCapacity: 6.8,
      regulatoryTranslation: 7.2,
      capitalAdequacy: 7.5,
      politicalAccess: 8.0,
      executionDensity: 7.5,
      dataCapability: 7.8,
      trustAcquisition: 7.6,
      systemFailureRate: 20,
      frictionFloor: 2.2,
    },
  },
  {
    id: "nga",
    name: "Nigeria",
    region: "West Africa",
    incomeGroup: "lower-middle",
    state: {
      demandReality: 8.2,
      deliveryInfrastructure: 5.8,
      trustArchitecture: 4.5,
      unitEconomics: 5.5,
      capitalPresence: 7.8,
      dataLegibility: 5.2,
      structuringCapacity: 6.0,
      regulatoryTranslation: 6.2,
      capitalAdequacy: 6.8,
      politicalAccess: 7.0,
      executionDensity: 6.2,
      dataCapability: 5.8,
      trustAcquisition: 5.0,
      systemFailureRate: 40,
      frictionFloor: 4.0,
    },
  },
  {
    id: "gha",
    name: "Ghana",
    region: "West Africa",
    incomeGroup: "lower-middle",
    state: {
      demandReality: 7.0,
      deliveryInfrastructure: 6.5,
      trustArchitecture: 6.8,
      unitEconomics: 6.0,
      capitalPresence: 5.8,
      dataLegibility: 6.2,
      structuringCapacity: 5.5,
      regulatoryTranslation: 6.8,
      capitalAdequacy: 6.5,
      politicalAccess: 7.2,
      executionDensity: 6.8,
      dataCapability: 6.5,
      trustAcquisition: 6.8,
      systemFailureRate: 25,
      frictionFloor: 3.0,
    },
  },
  {
    id: "rwa",
    name: "Rwanda",
    region: "East Africa",
    incomeGroup: "low",
    state: {
      demandReality: 7.8,
      deliveryInfrastructure: 7.0,
      trustArchitecture: 7.5,
      unitEconomics: 6.5,
      capitalPresence: 5.5,
      dataLegibility: 6.8,
      structuringCapacity: 6.0,
      regulatoryTranslation: 7.0,
      capitalAdequacy: 6.8,
      politicalAccess: 7.5,
      executionDensity: 7.0,
      dataCapability: 6.8,
      trustAcquisition: 7.0,
      systemFailureRate: 22,
      frictionFloor: 2.8,
    },
  },
  {
    id: "tza",
    name: "Tanzania",
    region: "East Africa",
    incomeGroup: "lower-middle",
    state: {
      demandReality: 7.2,
      deliveryInfrastructure: 6.2,
      trustArchitecture: 6.0,
      unitEconomics: 5.8,
      capitalPresence: 5.0,
      dataLegibility: 5.5,
      structuringCapacity: 4.8,
      regulatoryTranslation: 5.8,
      capitalAdequacy: 6.2,
      politicalAccess: 6.8,
      executionDensity: 6.0,
      dataCapability: 5.8,
      trustAcquisition: 6.0,
      systemFailureRate: 32,
      frictionFloor: 3.4,
    },
  },
  {
    id: "uga",
    name: "Uganda",
    region: "East Africa",
    incomeGroup: "low",
    state: {
      demandReality: 7.4,
      deliveryInfrastructure: 6.0,
      trustArchitecture: 5.8,
      unitEconomics: 5.5,
      capitalPresence: 4.8,
      dataLegibility: 5.2,
      structuringCapacity: 4.5,
      regulatoryTranslation: 5.4,
      capitalAdequacy: 6.0,
      politicalAccess: 6.7,
      executionDensity: 5.8,
      dataCapability: 5.5,
      trustAcquisition: 5.8,
      systemFailureRate: 34,
      frictionFloor: 3.6,
    },
  },
  {
    id: "bgd",
    name: "Bangladesh",
    region: "South Asia",
    incomeGroup: "lower-middle",
    state: {
      demandReality: 8.0,
      deliveryInfrastructure: 6.8,
      trustArchitecture: 6.2,
      unitEconomics: 6.0,
      capitalPresence: 5.8,
      dataLegibility: 6.0,
      structuringCapacity: 5.2,
      regulatoryTranslation: 6.0,
      capitalAdequacy: 6.4,
      politicalAccess: 7.0,
      executionDensity: 6.5,
      dataCapability: 6.2,
      trustAcquisition: 6.2,
      systemFailureRate: 28,
      frictionFloor: 3.0,
    },
  },
  {
    id: "pak",
    name: "Pakistan",
    region: "South Asia",
    incomeGroup: "lower-middle",
    state: {
      demandReality: 7.6,
      deliveryInfrastructure: 5.6,
      trustArchitecture: 5.0,
      unitEconomics: 5.2,
      capitalPresence: 5.2,
      dataLegibility: 5.0,
      structuringCapacity: 4.8,
      regulatoryTranslation: 5.6,
      capitalAdequacy: 6.2,
      politicalAccess: 6.5,
      executionDensity: 5.8,
      dataCapability: 5.4,
      trustAcquisition: 5.2,
      systemFailureRate: 38,
      frictionFloor: 3.8,
    },
  },
];
