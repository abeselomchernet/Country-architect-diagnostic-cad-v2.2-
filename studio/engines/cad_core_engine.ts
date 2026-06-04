/**
 * Country Architect Diagnostic (CAD v2.2)
 * Core Deterministic Institutional Economics Engine
 *
 * Author: Abeselom Girum Chernet
 * System: Country Architect AI Studio
 *
 * This module is the single source of truth for all CAD computations.
 * It is UI-agnostic and fully reproducible.
 */

export type SystemState = {
  GSV: number;
  ITC: number;
  SDR: number;
  AFL: number;

  ARI: number;
  LIC: number;
  BUD: number;
  TDD: number;

  Momentum: number;

  Classification:
    | "Pre-Emergent"
    | "Structural Implementation Gap (SIG)"
    | "Transitional Market"
    | "Mature Ecosystem";

  BindingConstraint: string;
  SystemFailureProbability: number;

  PriorityUpgradePathway: string[];
};

export type PillarInput = {
  // GSV inputs
  demandReality: number;
  deliveryInfrastructure: number;
  trustArchitecture: number;
  unitEconomics: number;

  // ITC inputs
  capitalPresence: number;
  dataLegibility: number;
  structuringCapacity: number;
  regulatoryTranslation: number;

  // AFL inputs
  capitalAdequacy: number;
  politicalAccess: number;
  executionDensity: number;
  dataCapability: number;
  trustAcquisition: number;

  // Dynamics (Pillar III & Baselines)
  priorARI?: number; // can represent prior composite score (priorGsv + priorItc) / 2
  deltaTime?: number;
  systemFailureRate?: number; // percentage (0–100)
  frictionFloor?: number; // FTS (1-10)
};

export class CADCoreEngine {
  /**
   * MAIN ENTRY POINT
   */
  static compute(input: PillarInput): SystemState {
    const GSV = this.computeGSV(input);
    const ITC = this.computeITC(input);
    const AFL = this.computeAFL(input);

    const LIC = this.computeLIC(GSV, ITC);
    const BUD = 10 - GSV;
    const TDD = 10 - ITC;

    // Calculate Momentum Score based on composite change over time delta
    const currentComposite = (GSV + ITC) / 2;
    const priorComposite = input.priorARI ?? currentComposite;
    const dT = input.deltaTime ?? 1.5;
    
    const Momentum = dT > 0 ? (currentComposite - priorComposite) / dT : 0;
    const MS_n = this.normalizeMomentum(Momentum);

    const SDR = this.computeSDR({
      LIC,
      GSV,
      ITC,
      AFL,
      systemFailureRate: input.systemFailureRate ?? 20,
      momentumScoreNormalized: MS_n,
      frictionFloor: input.frictionFloor ?? 6.5,
    });

    const ARI = this.computeARI(GSV, ITC, SDR, AFL);
    const Classification = this.classifyARI(ARI);
    const BindingConstraint = this.detectBindingConstraint(GSV, ITC);
    const SystemFailureProbability = input.systemFailureRate ?? 20;

    const PriorityUpgradePathway = this.generatePathway({
      GSV,
      ITC,
      LIC,
      BUD,
      TDD,
    });

    return {
      GSV,
      ITC,
      SDR,
      AFL,
      ARI,
      LIC,
      BUD,
      TDD,
      Momentum,
      Classification,
      BindingConstraint,
      SystemFailureProbability,
      PriorityUpgradePathway,
    };
  }

  /**
   * PILLAR I — GSV
   */
  static computeGSV(input: PillarInput): number {
    return (
      (input.demandReality +
        input.deliveryInfrastructure +
        input.trustArchitecture +
        input.unitEconomics) /
      4
    );
  }

  /**
   * PILLAR II — ITC
   */
  static computeITC(input: PillarInput): number {
    return (
      (input.capitalPresence +
        input.dataLegibility +
        input.structuringCapacity +
        input.regulatoryTranslation) /
      4
    );
  }

  /**
   * PILLAR IV — AFL
   */
  static computeAFL(input: PillarInput): number {
    return (
      (input.capitalAdequacy +
        input.politicalAccess +
        input.executionDensity +
        input.dataCapability +
        input.trustAcquisition) /
      5
    );
  }

  /**
   * SYSTEM DYNAMICS — LOCK INTENSITY COEFFICIENT
   */
  static computeLIC(GSV: number, ITC: number): number {
    return ((10 - GSV) * (10 - ITC)) / 10;
  }

  /**
   * SYSTEM DYNAMICS — COMPOSITE SDR
   */
  static computeSDR(params: {
    LIC: number;
    GSV: number;
    ITC: number;
    AFL: number;
    systemFailureRate: number;
    momentumScoreNormalized: number;
    frictionFloor?: number;
  }): number {
    const { LIC, systemFailureRate, momentumScoreNormalized, frictionFloor = 6.5 } = params;

    const SFPi = (100 - systemFailureRate) / 10;

    return (
      (10 - LIC) * 0.35 +
      momentumScoreNormalized * 0.25 +
      frictionFloor * 0.20 +
      SFPi * 0.20
    );
  }

  /**
   * ARI — ARCHITECT READINESS INDEX
   */
  static computeARI(
    GSV: number,
    ITC: number,
    SDR: number,
    AFL: number
  ): number {
    return (
      GSV * 0.35 +
      ITC * 0.35 +
      SDR * 0.20 +
      AFL * 0.10
    );
  }

  /**
   * MOMENTUM — STRUCTURAL CHANGE RATE NORMALIZATION
   */
  static normalizeMomentum(ms: number): number {
    return Math.min(10, Math.max(0, 5 + ms));
  }

  /**
   * CLASSIFICATION ENGINE
   */
  static classifyARI(ari: number): SystemState["Classification"] {
    if (ari < 3) return "Pre-Emergent";
    if (ari < 5) return "Structural Implementation Gap (SIG)";
    if (ari < 7) return "Transitional Market";
    return "Mature Ecosystem";
  }

  /**
   * BINDING CONSTRAINT DETECTION
   */
  static detectBindingConstraint(GSV: number, ITC: number): string {
    const gsvGap = 10 - GSV;
    const itcGap = 10 - ITC;

    if (gsvGap > itcGap) {
      return "Bottom-Up Constraint (GSV)";
    }
    if (itcGap > gsvGap) {
      return "Top-Down Constraint (ITC)";
    }
    return "Symmetric (Balanced Friction)";
  }

  /**
   * POLICY PATHWAY GENERATION
   */
  static generatePathway(params: {
    GSV: number;
    ITC: number;
    LIC: number;
    BUD: number;
    TDD: number;
  }): string[] {
    const steps: string[] = [];

    if (params.ITC < params.GSV) {
      steps.push("Strengthen Data Legibility Infrastructure (CRB / DPI Layer)");
      steps.push("Deploy Unified Account Mapping Layer (SPAR-like system)");
    }

    if (params.LIC > 3) {
      steps.push("Reduce Structural Friction via Regulatory Translation Reform");
    }

    if (params.BUD > params.TDD) {
      steps.push("Invest in Demand & Grassroots Delivery Systems");
    } else {
      steps.push("Strengthen Institutional Structuring Capacity (Capital Markets / ABS)");
    }

    steps.push("Establish Continuous System Monitoring (CAD Iteration Loop)");

    return steps;
  }
}
