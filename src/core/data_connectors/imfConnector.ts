export interface IMFMacroPack {
  fiscalBalance: number | null;
  currentAccount: number | null;
  debtToGDP: number | null;
}

export class IMFConnector {
  static BASE_URL = "https://dataservices.imf.org/REST/SDMX_JSON.svc";

  /**
   * Fetches and parses an IMF CompactData observation series
   */
  static async fetchDatasetValue(dataset: string, countryCode: string, indicator: string): Promise<number | null> {
    const code = countryCode.toLowerCase() === "mature" ? "KE" : countryCode.toLowerCase() === "sig" ? "SN" : countryCode.toUpperCase();
    
    // IMF sometimes expects 2-digit ISO or 3-digit ISO depending on dataset, let's normalize or map
    let finalCode = code;
    if (code.length === 3) {
      // General map for common test countries
      if (code === "ETH") finalCode = "ET";
      else if (code === "KEN") finalCode = "KE";
      else if (code === "SEN") finalCode = "SN";
      else if (code === "NGA") finalCode = "NG";
      else finalCode = code.slice(0, 2);
    }

    const url = `${this.BASE_URL}/CompactData/${dataset}/A.${finalCode}.${indicator}`;

    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      
      const series = data?.CompactData?.DataSet?.Series;
      if (!series) return null;

      const seriesObj = Array.isArray(series) ? series[0] : series;
      const obs = seriesObj?.Obs;
      if (!obs) return null;

      const obsList = Array.isArray(obs) ? obs : [obs];
      if (obsList.length === 0) return null;

      // Find the last observation with a valid value attribute
      for (let i = obsList.length - 1; i >= 0; i--) {
        const item = obsList[i];
        const val = item?.["@OBS_VALUE"] ?? item?.Value ?? item?.value;
        if (val !== undefined && val !== null) {
          const num = parseFloat(val);
          if (!isNaN(num)) return num;
        }
      }
    } catch (e) {
      console.warn(`IMF fetch failed for country: ${finalCode}, dataset: ${dataset}, indicator: ${indicator}:`, e);
    }
    return null;
  }

  static async getMacroStability(countryCode: string): Promise<IMFMacroPack> {
    // Note: IMF indicators for central gov balance and debt to GDP
    // Using simple indicators common in WEO or IFS
    return {
      fiscalBalance: await this.fetchDatasetValue("WEO", countryCode, "GGXCNL_NGDPD"), // Gov net lending/borrowing % of GDP
      currentAccount: await this.fetchDatasetValue("WEO", countryCode, "BCA_NGDPD"), // Current account balance % of GDP
      debtToGDP: await this.fetchDatasetValue("WEO", countryCode, "GGXWDG_NGDP") // Gov gross debt % of GDP
    };
  }
}
