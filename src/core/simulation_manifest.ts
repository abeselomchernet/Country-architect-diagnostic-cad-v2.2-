export type SimulationManifest = {
  timestamp: string;
  modelVersion: string; // CAD v2.2
  engineVersion: string;
  baselineState: {
    demandReality: number;
    deliveryInfrastructure: number;
    trustArchitecture: number;
    unitEconomics: number;
    capitalPresence: number;
    dataLegibility: number;
    structuringCapacity: number;
    regulatoryTranslation: number;
    capitalAdequacy: number;
    politicalAccess: number;
    executionDensity: number;
    dataCapability: number;
    trustAcquisition: number;
    priorARI?: number;
    deltaTime?: number;
    systemFailureRate?: number;
    frictionFloor?: number;
  };
  appliedShocks: {
    id: string;
    name: string;
  }[];
  finalState: {
    demandReality: number;
    deliveryInfrastructure: number;
    trustArchitecture: number;
    unitEconomics: number;
    capitalPresence: number;
    dataLegibility: number;
    structuringCapacity: number;
    regulatoryTranslation: number;
    capitalAdequacy: number;
    politicalAccess: number;
    executionDensity: number;
    dataCapability: number;
    trustAcquisition: number;
    priorARI?: number;
    deltaTime?: number;
    systemFailureRate?: number;
    frictionFloor?: number;
  };
  deltas: {
    ari: number;
    gsv: number;
    itc: number;
    afl: number;
    lic: number;
    sdr: number;
  };
  metadata: {
    country?: string;
    scenarioLabel?: string;
  };
};

export class SimulationManifestBuilder {
  static build(input: SimulationManifest): string {
    return JSON.stringify(input, null, 2);
  }
}
