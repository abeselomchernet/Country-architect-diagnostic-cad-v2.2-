import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";
import { PredictionBand } from "../core/uncertainty_engine";

export interface MonteCarloChartProps {
  simulationARIs: number[];
  bands: PredictionBand;
  deterministicARI: number;
}

export const MonteCarloChart: React.FC<MonteCarloChartProps> = ({
  simulationARIs,
  bands,
  deterministicARI
}) => {
  const chartData = useMemo(() => {
    if (simulationARIs.length === 0) return [];

    // Bin simulated values into 25 equal intervals spanning the p1 to p99 ranges
    const numBins = 25;
    const min = Math.max(0, Math.min(...simulationARIs) - 0.1);
    const max = Math.min(10, Math.max(...simulationARIs) + 0.1);
    const binWidth = (max - min) / numBins;

    const bins = Array.from({ length: numBins }, (_, i) => ({
      index: i,
      binMin: min + i * binWidth,
      binMax: min + (i + 1) * binWidth,
      label: (min + (i + 0.5) * binWidth).toFixed(2),
      count: 0
    }));

    simulationARIs.forEach((val) => {
      let bIdx = Math.floor((val - min) / binWidth);
      if (bIdx >= numBins) bIdx = numBins - 1;
      if (bIdx < 0) bIdx = 0;
      bins[bIdx].count++;
    });

    return bins;
  }, [simulationARIs]);

  return (
    <div className="bg-stone-50 border border-stone-205 p-5 rounded font-sans space-y-4 text-left">
      <div>
        <span className="text-[9px] uppercase font-bold text-stone-400 font-mono block">Econometric Distribution</span>
        <h4 className="font-serif text-sm font-bold text-stone-900">
          90% Prediction Interval Densities (N = 1,000 simulations)
        </h4>
        <p className="text-stone-500 text-[11px] mt-0.5 leading-normal font-sans">
          The shaded orange bars represent the 90% confidence corridor (<span className="font-mono font-bold text-amber-800">{bands.p5.toFixed(2)}</span> to <span className="font-mono font-bold text-amber-800">{bands.p95.toFixed(2)}</span>) for systemic outcomes. Left and right gray tails indicate 5% residual outliers.
        </p>
      </div>

      <div className="h-64 w-full border-b border-l border-stone-200 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 9, fill: "#78716c", fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "#e7e5e4" }}
              tickLine={{ stroke: "#e7e5e4" }}
            />
            <YAxis 
              tick={{ fontSize: 9, fill: "#78716c", fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "#e7e5e4" }}
              tickLine={{ stroke: "#e7e5e4" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-stone-900 text-stone-100 p-2.5 rounded font-mono text-[10px] space-y-1 shadow-md border border-stone-800">
                      <div>Range: {data.binMin.toFixed(2)} — {data.binMax.toFixed(2)}</div>
                      <div className="font-bold text-amber-400">Frequency: {data.count} runs</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {chartData.map((entry) => {
                // Check if this bin lies within the 90% Prediction Interval (P5 to P95)
                const inInterval = entry.binMin >= bands.p5 && entry.binMax <= bands.p95;
                return (
                  <Cell
                    key={`cell-${entry.index}`}
                    fill={inInterval ? "#c2410c" : "#d6d3d1"} // Orange for active prediction interval, light gray for tails
                    fillOpacity={inInterval ? 0.85 : 0.45}
                  />
                );
              })}
            </Bar>

            {/* Reference Line for Median (P50) */}
            <ReferenceLine
              x={chartData.find(d => parseFloat(d.label) >= bands.p50)?.label || String(bands.p50.toFixed(2))}
              stroke="#7c2d12"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{
                value: `P50 Median (${bands.p50.toFixed(2)})`,
                position: "top",
                fill: "#7c2d12",
                fontSize: 8.5,
                fontWeight: "bold",
                fontFamily: "JetBrains Mono"
              }}
            />

            {/* Reference Line for Deterministic ARI */}
            <ReferenceLine
              x={chartData.find(d => parseFloat(d.label) >= deterministicARI)?.label || String(deterministicARI.toFixed(2))}
              stroke="#1e3a8a"
              strokeWidth={2}
              label={{
                value: `Deterministic ARI (${deterministicARI.toFixed(2)})`,
                position: "insideTopLeft",
                fill: "#1e3a8a",
                fontSize: 8.5,
                fontWeight: "bold",
                fontFamily: "JetBrains Mono"
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Numerical Card Summary */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-stone-100 p-2.5 rounded border border-stone-200">
          <span className="text-[8px] uppercase tracking-wider font-bold text-stone-500 font-mono block">5th Percentile (P5)</span>
          <span className="font-mono text-xs font-bold text-stone-700">{bands.p5.toFixed(2)}</span>
        </div>
        <div className="bg-stone-900 p-2.5 rounded border border-neutral-950">
          <span className="text-[8px] uppercase tracking-wider font-bold text-amber-500 font-mono block">Median (P50)</span>
          <span className="font-mono text-xs font-bold text-white">{bands.p50.toFixed(2)}</span>
        </div>
        <div className="bg-stone-100 p-2.5 rounded border border-stone-200">
          <span className="text-[8px] uppercase tracking-wider font-bold text-stone-500 font-mono block">95th Percentile (P95)</span>
          <span className="font-mono text-xs font-bold text-stone-700">{bands.p95.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
