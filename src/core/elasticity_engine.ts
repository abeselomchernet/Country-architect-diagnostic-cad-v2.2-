import { CADEngine, CADInput } from "./cadEngine";

export type ElasticityCell = {
  variable: string;
  countryId: string;
  baseline: number;
  shocked: number;
  deltaARI: number;
  deltaParam: number;
  elasticity: number;
};

const EPSILON = 0.5; // Controlled perturbation size (Delta Parameter)

export class ElasticityEngine {
  static computeForVariable(
    countries: { id: string; name: string; state: CADInput }[],
    variable: keyof CADInput
  ): ElasticityCell[] {
    const results: ElasticityCell[] = [];

    for (const c of countries) {
      const baselineRes = CADEngine.compute(c.state);
      const baseline = baselineRes.ari;

      const shockedState: CADInput = {
        ...c.state,
        [variable]: Math.min(10, (c.state[variable] as number) + EPSILON),
      };

      const shockedRes = CADEngine.compute(shockedState);
      const shocked = shockedRes.ari;

      const deltaARI = shocked - baseline;

      results.push({
        variable: String(variable),
        countryId: c.id,
        baseline,
        shocked,
        deltaARI,
        deltaParam: EPSILON,
        elasticity: deltaARI / EPSILON,
      });
    }

    return results;
  }
}

export type HeatmapMatrix = {
  variables: string[];
  countries: string[];
  values: Record<string, Record<string, number>>;
};

export class ElasticityMatrixBuilder {
  static build(elasticityData: ElasticityCell[]): HeatmapMatrix {
    const variables = [...new Set(elasticityData.map((e) => e.variable))];
    const countries = [...new Set(elasticityData.map((e) => e.countryId))];

    const values: Record<string, Record<string, number>> = {};

    for (const v of variables) {
      values[v] = {};
      for (const c of countries) {
        const entry = elasticityData.find(
          (e) => e.variable === v && e.countryId === c
        );
        values[v][c] = entry?.elasticity ?? 0;
      }
    }

    return { variables, countries, values };
  }
}
