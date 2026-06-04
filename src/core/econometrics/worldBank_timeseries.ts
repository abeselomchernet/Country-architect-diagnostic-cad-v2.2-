export interface TimeSeriesObservation {
  year: number;
  value: number;
}

export interface MacroPanelData {
  gdpGrowth: TimeSeriesObservation[];
  inflation: TimeSeriesObservation[];
  mobilePenetration: TimeSeriesObservation[];
  financialAccess: TimeSeriesObservation[];
}

export class WorldBankTimeSeries {
  static BASE_URL = "https://api.worldbank.org/v2";

  /**
   * Fetches annual time-series observations for a country and indicator.
   */
  static async fetchSeries(country: string, indicator: string): Promise<TimeSeriesObservation[]> {
    const code = country.toLowerCase() === "mature" ? "KEN" : country.toLowerCase() === "sig" ? "SEN" : country.toUpperCase();
    const url = `${this.BASE_URL}/country/${code}/indicator/${indicator}?format=json&per_page=2000`;

    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const json = await res.json();
      
      const series = json?.[1];
      if (!Array.isArray(series)) return [];

      return series
        .map((d: any) => ({
          year: parseInt(d.date),
          value: d.value !== null && d.value !== undefined ? Number(d.value) : null
        }))
        .filter((d: any) => d.value !== null && !isNaN(d.year) && !isNaN(d.value))
        .sort((a, b) => a.year - b.year);
    } catch (e) {
      console.warn(`Failed to fetch World Bank series for ${country}, indicator: ${indicator}:`, e);
      return [];
    }
  }

  /**
   * Fetches multiple indicators in parallel to rebuild a coherent macro-panel framework.
   */
  static async getMacroPanel(country: string): Promise<MacroPanelData> {
    const [gdpGrowth, inflation, mobilePenetration, financialAccess] = await Promise.all([
      this.fetchSeries(country, "NY.GDP.MKTP.KD.ZG"), // GDP Growth (annual %)
      this.fetchSeries(country, "FP.CPI.TOTL.ZG"),    // Inflation (annual %)
      this.fetchSeries(country, "IT.CEL.SETS.P2"),    // Mobile Subs per 100 people
      this.fetchSeries(country, "FB.CBK.BRCH.P5")     // Bank Branches per 100k adults
    ]);

    return {
      gdpGrowth,
      inflation,
      mobilePenetration,
      financialAccess
    };
  }
}
