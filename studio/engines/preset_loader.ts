import { PillarInput } from "./cad_core_engine";

export type PresetType =
  | "ethiopia"
  | "ethiopia-g2p"
  | "mature"
  | "mature-target"
  | "pre-emergent"
  | "sig"
  | "structural-gap";

export class PresetLoader {
  /**
   * Load standard country and situation templates
   */
  static getPreset(type: PresetType): PillarInput {
    switch (type) {
      case "ethiopia":
      case "ethiopia-g2p":
        return {
          demandReality: 7.5,
          deliveryInfrastructure: 6.0,
          trustArchitecture: 4.0,
          unitEconomics: 4.5,

          capitalPresence: 7.0,
          dataLegibility: 3.5,
          structuringCapacity: 3.5,
          regulatoryTranslation: 6.5,

          capitalAdequacy: 7.5,
          politicalAccess: 6.5,
          executionDensity: 5.5,
          dataCapability: 6.0,
          trustAcquisition: 6.5,

          priorARI: 4.5, // represents average prior composite score
          deltaTime: 1.75,
          systemFailureRate: 35, // Fragile country risk metrics
          frictionFloor: 3.5,
        };

      case "mature":
      case "mature-target":
        return {
          demandReality: 8.5,
          deliveryInfrastructure: 8.0,
          trustArchitecture: 7.5,
          unitEconomics: 7.0,

          capitalPresence: 8.5,
          dataLegibility: 7.5,
          structuringCapacity: 7.0,
          regulatoryTranslation: 8.0,

          capitalAdequacy: 8.5,
          politicalAccess: 8.0,
          executionDensity: 8.0,
          dataCapability: 8.0,
          trustAcquisition: 8.0,

          priorARI: 5.3,
          deltaTime: 1.5,
          systemFailureRate: 15, // Highly stable country risk metrics
          frictionFloor: 6.5,
        };

      case "pre-emergent":
        return {
          demandReality: 2.5,
          deliveryInfrastructure: 2.0,
          trustArchitecture: 1.5,
          unitEconomics: 2.0,

          capitalPresence: 2.0,
          dataLegibility: 1.5,
          structuringCapacity: 1.0,
          regulatoryTranslation: 2.0,

          capitalAdequacy: 3.0,
          politicalAccess: 2.5,
          executionDensity: 2.0,
          dataCapability: 2.0,
          trustAcquisition: 2.0,

          priorARI: 2.0,
          deltaTime: 1.0,
          systemFailureRate: 75, // Extreme high risk
          frictionFloor: 1.5,
        };

      case "sig":
      case "structural-gap":
        return {
          demandReality: 6.5,
          deliveryInfrastructure: 5.0,
          trustArchitecture: 3.5,
          unitEconomics: 3.5,

          capitalPresence: 4.5,
          dataLegibility: 3.0,
          structuringCapacity: 2.5,
          regulatoryTranslation: 4.5,

          capitalAdequacy: 5.0,
          politicalAccess: 4.5,
          executionDensity: 4.0,
          dataCapability: 4.0,
          trustAcquisition: 4.5,

          priorARI: 4.1,
          deltaTime: 1.2,
          systemFailureRate: 55, // Moderate high-risk parameters
          frictionFloor: 2.5,
        };

      default:
        throw new Error(`Unsupported institutional preset type: ${type}`);
    }
  }

  /**
   * Retrieve human-readable names and descriptions for presets
   */
  static getMetadata(type: PresetType): { name: string; description: string } {
    switch (type) {
      case "ethiopia":
      case "ethiopia-g2p":
        return {
          name: "Ethiopia PSNP G2P (Transitional)",
          description:
            "Active digital ecosystem with extensive national ID enrollments (Fayda) but constrained in liquidity, hard-currency conversion, and grassroots rural agent trust.",
        };
      case "mature":
      case "mature-target":
        return {
          name: "Mature Target Ecosystem",
          description:
            "Fully legibilized transaction ledgers, robust data registries, liquid securitized markets on national boards, and stable system dynamics.",
        };
      case "pre-emergent":
        return {
          name: "Pre-Emergent System",
          description:
            "Fragile underlying infrastructure, minimal digitization, high systemic cash-out lock dependency, and highly unstable delivery channels.",
        };
      case "sig":
      case "structural-gap":
        return {
          name: "Structural Implementation Gap (SIG)",
          description:
            "Pronounced friction mismatch between grassroots economic momentum and institutional compliance criteria. Severe path coupling.",
        };
      default:
        return {
          name: "Unknown Configuration",
          description: "Custom user-manipulated parameter grid.",
        };
    }
  }
}
