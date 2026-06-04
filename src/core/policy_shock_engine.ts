import { CADInput, CADEngine, CADResult } from "./cadEngine";

export type PolicyShock = {
  id: string;
  name: string;
  description: string;
  apply: (state: CADInput) => CADInput;
};

export type ShockResult = {
  before: CADResult;
  after: CADResult;
  delta: {
    ari: number;
    gsv: number;
    itc: number;
    afl: number;
    lic: number;
    sdr: number;
  };
  interpretation: string;
};

export class PolicyShockEngine {
  static runShock(state: CADInput, shock: PolicyShock): ShockResult {
    const before = CADEngine.compute(state);
    
    // Perform a safe deep copy manually to ensure zero reference pollution
    const clonedState: CADInput = {
      demandReality: state.demandReality,
      deliveryInfrastructure: state.deliveryInfrastructure,
      trustArchitecture: state.trustArchitecture,
      unitEconomics: state.unitEconomics,
      capitalPresence: state.capitalPresence,
      dataLegibility: state.dataLegibility,
      structuringCapacity: state.structuringCapacity,
      regulatoryTranslation: state.regulatoryTranslation,
      capitalAdequacy: state.capitalAdequacy,
      politicalAccess: state.politicalAccess,
      executionDensity: state.executionDensity,
      dataCapability: state.dataCapability,
      trustAcquisition: state.trustAcquisition,
      priorARI: state.priorARI,
      deltaTime: state.deltaTime,
      systemFailureRate: state.systemFailureRate,
      frictionFloor: state.frictionFloor,
    };

    const shockedState = shock.apply(clonedState);
    const after = CADEngine.compute(shockedState);

    const delta = {
      ari: after.ari - before.ari,
      gsv: after.gsv - before.gsv,
      itc: after.itc - before.itc,
      afl: after.afl - before.afl,
      lic: after.lic - before.lic,
      sdr: after.sdr - before.sdr,
    };

    return {
      before,
      after,
      delta,
      interpretation: this.interpretDelta(delta),
    };
  }

  static interpretDelta(delta: ShockResult["delta"]): string {
    const impact = delta.ari;

    if (impact > 1.0) {
      return "High-leverage structural transformation. Institutional binding constraints are actively resolved.";
    }
    if (impact > 0.3) {
      return "Moderate system improvement. Partial translation layer reinforcement observed.";
    }
    if (impact > -0.3 && impact <= 0.3) {
      return "Neutral system effect. Shock absorbed by existing friction structure.";
    }
    return "Negative systemic response. Increased lock-in or coordination failure detected.";
  }
}

// Utility to safely clamp any 0-10 metric rating value
function clampMetric(val: number): number {
  return Math.min(10, Math.max(0, val));
}

// Reusable institutional-grade policy shocks
export const PolicyShocks: Record<string, PolicyShock> = {
  DPI_FAYDA_SPAR_INTEGRATION: {
    id: "dpi_fayda_spar",
    name: "National DPI Identity-to-Wallet Mapping",
    description: "Maps biometric-grade national ID enrollments (e.g., Fayda) directly into mobile wallet addresses over interoperable registries, compressing grassroots cash-out transaction overhead.",
    apply: (s: CADInput): CADInput => ({
      ...s,
      dataLegibility: clampMetric(s.dataLegibility + 1.5),
      trustArchitecture: clampMetric(s.trustArchitecture + 1.2),
      regulatoryTranslation: clampMetric(s.regulatoryTranslation + 0.8),
      frictionFloor: clampMetric((s.frictionFloor ?? 3.5) - 0.8),
    }),
  },

  CREDIT_BUREAU_INTEGRATION: {
    id: "crb_integration",
    name: "Open-Finance Credit Bureau Integration",
    description: "Connects micro-transaction trails and G2P flow history with a centralized Credit Reference Bureau, building real-time credit profile legibility for rural merchants.",
    apply: (s: CADInput): CADInput => ({
      ...s,
      dataLegibility: clampMetric(s.dataLegibility + 1.8),
      structuringCapacity: clampMetric(s.structuringCapacity + 1.2),
      capitalPresence: clampMetric(s.capitalPresence + 0.8),
    }),
  },

  ABS_SECURITIZATION_MARKET: {
    id: "abs_markets",
    name: "MFI Asset-Backed Securitization Channels",
    description: "Authorizes and drafts compliance pathways to package local micro-lenders' crop credit bundles into formal corporate bonds tradeable on national bourses.",
    apply: (s: CADInput): CADInput => ({
      ...s,
      structuringCapacity: clampMetric(s.structuringCapacity + 2.0),
      capitalPresence: clampMetric(s.capitalPresence + 1.5),
      regulatoryTranslation: clampMetric(s.regulatoryTranslation + 1.0),
      capitalAdequacy: clampMetric(s.capitalAdequacy + 0.8),
    }),
  },

  CASH_OUT_CRISIS: {
    id: "cash_out_crisis",
    name: "Agent Liquidity Deficit (Cash-Out Collapse)",
    description: "Simulates severe national hard-currency constraints leading to local agent cash liquidity exhaustion, breaking direct peer-to-peer withdrawal capabilities.",
    apply: (s: CADInput): CADInput => ({
      ...s,
      trustArchitecture: clampMetric(s.trustArchitecture - 1.8),
      unitEconomics: clampMetric(s.unitEconomics - 1.5),
      capitalPresence: clampMetric(s.capitalPresence - 1.2),
      systemFailureRate: Math.min(100, Math.max(0, (s.systemFailureRate ?? 35) + 25)),
    }),
  },

  EXCHANGE_RATE_VOLATILITY: {
    id: "fx_volatility",
    name: "Exchange Decontrol Currency Volatility Spike",
    description: "Simulates sudden macroeconomic currency depreciation alongside capital outflow pressure, amplifying transaction fees and systemic reserve exhaustion rates.",
    apply: (s: CADInput): CADInput => ({
      ...s,
      unitEconomics: clampMetric(s.unitEconomics - 1.2),
      capitalPresence: clampMetric(s.capitalPresence - 0.8),
      trustArchitecture: clampMetric(s.trustArchitecture - 0.5),
      systemFailureRate: Math.min(100, Math.max(0, (s.systemFailureRate ?? 35) + 15)),
    }),
  },
};
