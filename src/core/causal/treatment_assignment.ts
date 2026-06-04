export class TreatmentAssignment {
  /**
   * Assigns deterministic treatment criteria to units within a donor pool to allow highly replicable policy intervention testing.
   */
  static assign(countries: any[], shockId: string): any[] {
    return countries.map((c, i) => {
      // Deterministic hash based on name characters offset by shock characteristics to assure consistency
      const nameString = c.name || "";
      const baseHash = nameString.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const shockOffset = shockId.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 5);
      const hash = baseHash + shockOffset;

      // Ensure that at least 1 unit is treated, while keeping a robust control donor pool
      // If index is 0 and nothing is assigned treated, assign treated.
      const isTreated = (hash % 3 === 0) || (i === 0);

      return {
        ...c,
        treated: isTreated
      };
    });
  }
}
