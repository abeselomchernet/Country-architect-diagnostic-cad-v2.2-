import { PanelUnit } from "../causal/panel_builder";

export interface TransformedEventSeries {
  relTime: number;
  value: number;
}

export interface AlignedEventUnit {
  country: string;
  treated: boolean;
  eventSeries: TransformedEventSeries[];
}

export class EventTransformer {
  /**
   * Aligns absolute calendar timelines into event-time coordinates relative to a treatment cutoff year (t=0).
   */
  static align(panel: PanelUnit[], shockYear: number): AlignedEventUnit[] {
    return panel.map((country) => {
      const transformed: TransformedEventSeries[] = country.time.map((year, idx) => {
        return {
          relTime: year - shockYear,
          value: country.y[idx] ?? 5.5
        };
      });

      return {
        country: country.country,
        treated: country.treated,
        eventSeries: transformed
      };
    });
  }
}
