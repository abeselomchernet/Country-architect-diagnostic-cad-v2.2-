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
  }[];
  ranking: {
    mostResilient: string;
    mostVulnerable: string;
    highestStructuralGain: string;
  };
  globalInsight: string;
};

export class MultiCountryEngine {
  static runShockAcrossCountries(
    countries: CountryScenario[],
    shock: PolicyShock
  ): CountryComparisonResult {
    const results = countries.map((c) => {
      const before = CADEngine.compute(c.state);
      
      // Safe deep cloning
      const clonedState: CADInput = {
        demandReality: c.state.demandReality,
        deliveryInfrastructure: c.state.deliveryInfrastructure,
        trustArchitecture: c.state.trustArchitecture,
        unitEconomics: c.state.unitEconomics,
        capitalPresence: c.state.capitalPresence,
        dataLegibility: c.state.dataLegibility,
        structuringCapacity: c.state.structuringCapacity,
        regulatoryTranslation: c.state.regulatoryTranslation,
        capitalAdequacy: c.state.capitalAdequacy,
        politicalAccess: c.state.politicalAccess,
        executionDensity: c.state.executionDensity,
        dataCapability: c.state.dataCapability,
        trustAcquisition: c.state.trustAcquisition,
        priorARI: c.state.priorARI,
        deltaTime: c.state.deltaTime,
        systemFailureRate: c.state.systemFailureRate,
        frictionFloor: c.state.frictionFloor,
      };

      const afterState = shock.apply(clonedState);
      const after = CADEngine.compute(afterState);

      return {
        countryId: c.id,
        name: c.name,
        region: c.region,
        incomeGroup: c.incomeGroup,
        before,
        after,
        deltaARI: after.ari - before.ari,
        deltaGSV: after.gsv - before.gsv,
        deltaITC: after.itc - before.itc,
        deltaAFL: after.afl - before.afl,
        deltaLIC: after.lic - before.lic,
        deltaSDR: after.sdr - before.sdr,
      };
    });

    const rankedByGain = [...results].sort((a, b) => b.deltaARI - a.deltaARI);
    const rankedByVulnerability = [...results].sort((a, b) => a.deltaARI - b.deltaARI);

    const highestStructuralGain = rankedByGain[0]?.name || "N/A";
    const mostResilient = rankedByGain.find(r => r.after.ari >= 7.0)?.name || rankedByGain[0]?.name || "N/A";
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

    if (avgDelta > 1.0) {
      return `Universal leverage detected under "${shock.name}". Systemic indicators across all comparative vectors registered substantial acceleration. Institutional decoupling represents a high reward policy strategy.`;
    }
    if (avgDelta > 0.4) {
      return `Divergent progress. Structural differences in local market legibility split country-level responses under "${shock.name}". Regional clusters show distinct elasticity characteristics.`;
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
];
