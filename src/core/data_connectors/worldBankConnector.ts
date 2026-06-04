export interface WorldBankMacroPack {
  gdp: number | null;
  gdpPerCapita: number | null;
  inflation: number | null;
  mobileSubs: number | null;
  bankingAccess: number | null;
}

export class WorldBankConnector {
  static BASE_URL = "https://api.worldbank.org/v2";

  /**
   * Fetches the latest non-null value for a given country and indicator.
   */
  static async fetchIndicator(country: string, indicator: string): Promise<number | null> {
    const code = country.toLowerCase() === "mature" ? "KEN" : country.toLowerCase() === "sig" ? "SEN" : country.toUpperCase();
    const url = `${this.BASE_URL}/country/${code}/indicator/${indicator}?format=json&per_page=50`;

    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      
      // World Bank API returns [metadata, observations_array]
      const observations = data?.[1];
      if (!Array.isArray(observations)) return null;

      // Find the most recent observation with a valid value
      for (const obs of observations) {
        if (obs?.value !== null && obs?.value !== undefined) {
          return Number(obs.value);
        }
      }
    } catch (e) {
      console.warn(`World Bank fetch failed for country: ${country}, indicator: ${indicator}:`, e);
    }
    return null;
  }

  static async getMacroPack(country: string): Promise<WorldBankMacroPack> {
    const indicators = {
      gdp: "NY.GDP.MKTP.CD",
      gdpPerCapita: "NY.GDP.PCAP.CD",
      inflation: "FP.CPI.TOTL.ZG",
      mobileSubs: "IT.CEL.SETS.P2",
      bankingAccess: "FB.CBK.BRCH.P5"
    };

    const results: Partial<WorldBankMacroPack> = {};
    const keys = Object.keys(indicators) as Array<keyof typeof indicators>;

    await Promise.all(
      keys.map(async (key) => {
        results[key] = await this.fetchIndicator(country, indicators[key]);
      })
    );

    return {
      gdp: results.gdp ?? null,
      gdpPerCapita: results.gdpPerCapita ?? null,
      inflation: results.inflation ?? null,
      mobileSubs: results.mobileSubs ?? null,
      bankingAccess: results.bankingAccess ?? null
    };
  }
}
