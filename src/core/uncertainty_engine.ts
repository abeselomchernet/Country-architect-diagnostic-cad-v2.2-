import { CADInput, CADEngine, CADResult } from "./cadEngine";
import { PolicyShock } from "./policy_shock_engine";

export interface PredictionBand {
  p5: number;
  p50: number;
  p95: number;
}

export interface MonteCarloSimulationResult {
  beforeDeterministic: number;
  afterDeterministic: number;
  simulatedBandsBefore: PredictionBand;
  simulatedBandsAfter: PredictionBand;
  rawSampleARIs: number[];
}

export class UncertaintyEngine {
  /**
   * Helper function to generate normally distributed pseudo-random variables using Box-Muller transform
   */
  private static randomNormal(mean = 0, stdDev = 1): number {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); 
    while(v === 0) v = Math.random();
    const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return num * stdDev + mean;
  }

  /**
   * Generates a noisy copy of the CADInput state representing institutional noise and unobserved shocks.
   * Perturbations are scaled with standard deviations representing Pillar-specific volatility models.
   */
  private static injectUnobservedNoise(state: CADInput, noiseFactor = 0.08): CADInput {
    const perturb = (val: number, isFailureRate = false) => {
      const noise = this.randomNormal(0, isFailureRate ? 3.5 : noiseFactor * 10);
      const res = val + noise;
      return isFailureRate ? Math.max(0, Math.min(100, res)) : Math.max(0, Math.min(10, res));
    };

    return {
      demandReality: perturb(state.demandReality),
      deliveryInfrastructure: perturb(state.deliveryInfrastructure),
      trustArchitecture: perturb(state.trustArchitecture),
      unitEconomics: perturb(state.unitEconomics),
      capitalPresence: perturb(state.capitalPresence),
      dataLegibility: perturb(state.dataLegibility),
      structuringCapacity: perturb(state.structuringCapacity),
      regulatoryTranslation: perturb(state.regulatoryTranslation),
      capitalAdequacy: perturb(state.capitalAdequacy),
      politicalAccess: perturb(state.politicalAccess),
      executionDensity: perturb(state.executionDensity),
      dataCapability: perturb(state.dataCapability),
      trustAcquisition: perturb(state.trustAcquisition),
      priorARI: state.priorARI,
      deltaTime: state.deltaTime,
      systemFailureRate: perturb(state.systemFailureRate ?? 35, true),
      frictionFloor: perturb(state.frictionFloor ?? 3.5),
    };
  }

  /**
   * Runs a 1,000-sample Monte Carlo Simulation before and after a policy shock.
   * Evaluates prediction intervals to provide confidence bounds of systemic reform impacts.
   */
  static runMonteCarlo(
    state: CADInput,
    shock: PolicyShock,
    sampleSize = 1000
  ): MonteCarloSimulationResult {
    const beforeDeterministic = CADEngine.compute(state).ari;
    
    // Deterministic state after shock
    const afterCloned = { ...state };
    const afterDeterministic = CADEngine.compute(shock.apply(afterCloned)).ari;

    const beforeSamples: number[] = [];
    const afterSamples: number[] = [];

    for (let i = 0; i < sampleSize; i++) {
      // 1. Generate noisy baseline, compute baseline ARI
      const noisyPre = this.injectUnobservedNoise(state);
      beforeSamples.push(CADEngine.compute(noisyPre).ari);

      // 2. Apply shock on a separate noisy duplicate, compute shocked ARI
      const noisyPreForShock = this.injectUnobservedNoise(state);
      const shockedNoisy = shock.apply(noisyPreForShock);
      afterSamples.push(CADEngine.compute(shockedNoisy).ari);
    }

    // Sort to extract exact percentiles
    beforeSamples.sort((a, b) => a - b);
    afterSamples.sort((a, b) => a - b);

    const extractBands = (samples: number[]): PredictionBand => {
      const idx5 = Math.floor(sampleSize * 0.05);
      const idx50 = Math.floor(sampleSize * 0.50);
      const idx95 = Math.floor(sampleSize * 0.95);

      return {
        p5: Number(samples[idx5].toFixed(4)),
        p50: Number(samples[idx50].toFixed(4)),
        p95: Number(samples[idx95].toFixed(4)),
      };
    };

    return {
      beforeDeterministic: Number(beforeDeterministic.toFixed(4)),
      afterDeterministic: Number(afterDeterministic.toFixed(4)),
      simulatedBandsBefore: extractBands(beforeSamples),
      simulatedBandsAfter: extractBands(afterSamples),
      rawSampleARIs: afterSamples
    };
  }
}
