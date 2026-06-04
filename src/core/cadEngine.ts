/**
 * Country Architect Diagnostic (CAD v2.2)
 * Core Deterministic Institutional Economics Engine
 * SSRN-Reproducible Computational Model
 */

export type CADInput = {
  // Pillar I GSV inputs
  demandReality: number;
  deliveryInfrastructure: number;
  trustArchitecture: number;
  unitEconomics: number;

  // Pillar II ITC inputs
  capitalPresence: number;
  dataLegibility: number;
  structuringCapacity: number;
  regulatoryTranslation: number;

  // Pillar IV AFL inputs
  capitalAdequacy: number;
  politicalAccess: number;
  executionDensity: number;
  dataCapability: number;
  trustAcquisition: number;

  // Pillar III Baselines & Dynamics
  priorARI?: number;
  deltaTime?: number;
  systemFailureRate?: number; // 0-100
  frictionFloor?: number; // FTS 1-10
};

export type CADResult = {
  gsv: number;
  itc: number;
  sdr: number;
  afl: number;
  ari: number;
  lic: number;
  bud: number;
  tdd: number;
  momentum: number;
  ms_n: number;
  classification: string;
  bindingConstraint: string;
  priorityUpgradePathway: string[];
  systemFailureProbability: number;
};

function clamp(value: number, min = 0, max = 10): number {
  return Math.max(min, Math.min(max, Number(value.toFixed(4))));
}

export class CADEngine {
  static compute(input: CADInput): CADResult {
    const gsv = clamp(
      (input.demandReality +
        input.deliveryInfrastructure +
        input.trustArchitecture +
        input.unitEconomics) /
      4
    );

    const itc = clamp(
      (input.capitalPresence +
        input.dataLegibility +
        input.structuringCapacity +
        input.regulatoryTranslation) /
      4
    );

    const afl = clamp(
      (input.capitalAdequacy +
        input.politicalAccess +
        input.executionDensity +
        input.dataCapability +
        input.trustAcquisition) /
      5
    );

    const lic = clamp(((10 - gsv) * (10 - itc)) / 10);
    const bud = clamp(10 - gsv);
    const tdd = clamp(10 - itc);

    const currentComposite = (gsv + itc) / 2;
    const priorComposite = input.priorARI ?? currentComposite;
    const dT = input.deltaTime ?? 1.5;

    const rawMomentum = dT > 0 ? (currentComposite - priorComposite) / dT : 0;
    const momentum = Number(rawMomentum.toFixed(4));
    const ms_n = clamp(5 + momentum);

    const systemFailureProbability = input.systemFailureRate ?? 35;
    const sfpi = clamp((100 - systemFailureProbability) / 10);
    const frictionFloor = input.frictionFloor ?? 3.5;

    const sdr = clamp(
      (10 - lic) * 0.35 +
      ms_n * 0.25 +
      frictionFloor * 0.20 +
      sfpi * 0.20
    );

    const ari = clamp(gsv * 0.35 + itc * 0.35 + sdr * 0.20 + afl * 0.10);

    let classification = "Mature Ecosystem";
    if (ari < 3.0) classification = "Pre-Emergent";
    else if (ari < 5.0) classification = "Structural Implementation Gap (SIG)";
    else if (ari < 7.0) classification = "Transitional Market";

    let bindingConstraint = "Symmetric (Balanced Friction)";
    if (bud > tdd) {
      bindingConstraint = "Bottom-Up Constraint (GSV)";
    } else if (tdd > bud) {
      bindingConstraint = "Top-Down Constraint (ITC)";
    }

    const priorityUpgradePathway: string[] = [];
    if (itc < gsv) {
      priorityUpgradePathway.push(
        "Strengthen Data Legibility Infrastructure (CRB / DPI Layer)"
      );
      priorityUpgradePathway.push(
        "Deploy Unified Account Mapping Layer (SPAR-like system)"
      );
    }
    if (lic > 3) {
      priorityUpgradePathway.push(
        "Reduce Structural Friction via Regulatory Translation Reform"
      );
    }
    if (bud > tdd) {
      priorityUpgradePathway.push("Invest in Demand & Grassroots Delivery Systems");
    } else {
      priorityUpgradePathway.push(
        "Strengthen Institutional Structuring Capacity (Capital Markets / ABS)"
      );
    }
    priorityUpgradePathway.push(
      "Establish Continuous System Monitoring (CAD Iteration Loop)"
    );

    return {
      gsv,
      itc,
      sdr,
      afl,
      ari,
      lic,
      bud,
      tdd,
      momentum,
      ms_n,
      classification,
      bindingConstraint,
      priorityUpgradePathway,
      systemFailureProbability,
    };
  }
}
