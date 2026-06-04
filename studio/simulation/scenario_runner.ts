import { CADCoreEngine, SystemState, PillarInput } from "../engines/cad_core_engine";

export type ScenarioResult = {
  name: string;
  description: string;
  baseline: SystemState;
  simulated: SystemState;
  deltaARI: number;
  deltaGSV: number;
  deltaITC: number;
  deltaSDR: number;
  deltaAFL: number;
  isUnlocked: boolean; // Did we cross a classification or LIC threshold?
};

export type PolicyShock = {
  key: keyof PillarInput;
  magnitude: number; // positive or negative shock to apply to the input slider
};

export class ScenarioRunner {
  /**
   * Run a simulation by applying a set of shocks to a baseline input configuration
   */
  static run(
    name: string,
    description: string,
    baselineInput: PillarInput,
    shocks: PolicyShock[]
  ): ScenarioResult {
    // 1. Calculate baseline system state
    const baseline = CADCoreEngine.compute(baselineInput);

    // 2. Clone baseline input to apply shocks
    const simulatedInput = { ...baselineInput };

    // 3. Apply shocks, clamping values between robust bounds [0.0, 10.0] OR [0, 100] for failure rate
    for (const shock of shocks) {
      if (shock.key in simulatedInput) {
        const currentValue = simulatedInput[shock.key] ?? 0;
        let newValue = currentValue + shock.magnitude;

        // Clamp based on scale format
        if (shock.key === "systemFailureRate") {
          newValue = Math.max(0, Math.min(100, newValue));
        } else {
          newValue = Math.max(0.0, Math.min(10.0, newValue));
        }

        // Apply back
        (simulatedInput as any)[shock.key] = newValue;
      }
    }

    // 4. Calculate simulated system state
    const simulated = CADCoreEngine.compute(simulatedInput);

    // 5. Calculate differentials
    const deltaARI = simulated.ARI - baseline.ARI;
    const deltaGSV = simulated.GSV - baseline.GSV;
    const deltaITC = simulated.ITC - baseline.ITC;
    const deltaSDR = simulated.SDR - baseline.SDR;
    const deltaAFL = simulated.AFL - baseline.AFL;

    // Check classification transition
    const crossedClassification = baseline.Classification !== simulated.Classification;
    // Check LIC unlocking (crossing from highly coupled to transitional logic)
    const baselineHighlyCoupled = baseline.LIC >= 6.0;
    const simulatedHighlyCoupled = simulated.LIC < 6.0;
    const licUnlocked = baselineHighlyCoupled && simulatedHighlyCoupled;

    const isUnlocked = crossedClassification || licUnlocked;

    return {
      name,
      description,
      baseline,
      simulated,
      deltaARI,
      deltaGSV,
      deltaITC,
      deltaSDR,
      deltaAFL,
      isUnlocked,
    };
  }

  /**
   * Run standard comparative benchmarks across multiple institutional configurations
   */
  static runComparativeBenchmarking(
    presets: { name: string; input: PillarInput }[]
  ): { name: string; state: SystemState }[] {
    return presets.map((preset) => ({
      name: preset.name,
      state: CADCoreEngine.compute(preset.input),
    }));
  }
}
