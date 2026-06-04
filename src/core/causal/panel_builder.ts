export interface PanelUnit {
  country: string;
  treated: boolean;
  time: number[];
  y: number[];
  baseCountry?: any;
}

export class PanelBuilder {
  /**
   * Helper utility that translates raw multicountry structures and timeseries curves into coherent long-form longitudinal panel frames.
   */
  static build(countries: { name: string; treated?: boolean; [key: string]: any }[], ariSeries: { country: string; data: { year: number; ari: number }[] }[]): PanelUnit[] {
    return countries.map((c) => {
      const match = ariSeries.find((s) => s.country.toUpperCase() === c.name.toUpperCase());
      const years = match ? match.data.map((d) => d.year) : [];
      const values = match ? match.data.map((d) => d.ari) : [];

      return {
        country: c.name,
        treated: c.treated ?? false,
        time: years,
        y: values,
        baseCountry: c
      };
    });
  }
}
