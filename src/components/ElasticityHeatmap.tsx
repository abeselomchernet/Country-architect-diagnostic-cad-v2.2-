import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  TooltipProps
} from "recharts";
import { SampleCountries } from "../core/multi_country_engine";
import { PolicyShocks, PolicyShock } from "../core/policy_shock_engine";
import { CADEngine } from "../core/cadEngine";
import { MultiCountryEngine } from "../core/multi_country_engine";
import { Info, HelpCircle } from "lucide-react";

interface HeatmapDataPoint {
  x: string;          // Shock name
  y: string;          // Country name
  deltaARI: number;   // Net change in composite ARI
  gsvBase: number;
  gsvNew: number;
  itcBase: number;
  itcNew: number;
  valY: number;       // Numeric index for sizing support
  valX: number;       // Numeric index for sizing support
}

export default function ElasticityHeatmap() {
  const [selectedCell, setSelectedCell] = useState<HeatmapDataPoint | null>(null);

  // Compile all country-lever pairings and their elasticities
  const { data, xList, yList } = useMemo(() => {
    const shocksList = Object.entries(PolicyShocks);
    const countryList = SampleCountries;
    
    const xNames = shocksList.map(([_, sh]) => sh.name);
    const yNames = countryList.map(c => c.name);

    const points: HeatmapDataPoint[] = [];

    countryList.forEach((c, yIdx) => {
      shocksList.forEach(([_, sh], xIdx) => {
        const before = CADEngine.compute(c.state);
        const afterState = MultiCountryEngine.applyScaledShock(c.state, sh, c.id);
        const after = CADEngine.compute(afterState);
        const deltaARI = after.ari - before.ari;

        points.push({
          x: sh.name,
          y: c.name,
          deltaARI: Number(deltaARI.toFixed(4)),
          gsvBase: before.gsv,
          gsvNew: after.gsv,
          itcBase: before.itc,
          itcNew: after.itc,
          valX: xIdx,
          valY: yIdx
        });
      });
    });

    return {
      data: points,
      xList: xNames,
      yList: yNames
    };
  }, []);

  // Format tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: HeatmapDataPoint = payload[0].payload;
      const isPositive = data.deltaARI >= 0;
      return (
        <div className="bg-stone-900 border border-stone-800 text-stone-100 p-3.5 rounded shadow-xl text-xs font-mono max-w-sm space-y-1">
          <div className="font-sans font-bold text-stone-200 border-b border-stone-800 pb-1.5 mb-1.5 flex items-center justify-between">
            <span>{data.y} Diagnostic</span>
            <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 font-normal py-0.5 px-1.5 rounded tracking-wide font-mono">
              Net delta
            </span>
          </div>
          <p className="text-stone-300 font-sans italic">Lever: {data.x}</p>
          <div className="flex justify-between font-bold pt-1 text-sm">
            <span>dARI Shift:</span>
            <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>
              {isPositive ? "+" : ""}{data.deltaARI.toFixed(4)}
            </span>
          </div>
          <div className="text-[10px] text-stone-500 pt-1 space-y-0.5 font-mono">
            <div>GSV: {data.gsvBase.toFixed(2)} ➔ {data.gsvNew.toFixed(2)}</div>
            <div>ITC: {data.itcBase.toFixed(2)} ➔ {data.itcNew.toFixed(2)}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Maps values to solid high-fidelity color ranges
  const getCellColor = (value: number) => {
    if (value > 1.0) return "#065f46";     // Deep Emerald
    if (value > 0.6) return "#059669";     // Emerald Medium
    if (value > 0.3) return "#10b981";     // Emerald Bright
    if (value > 0.1) return "#6ee7b7";     // Mint Light
    if (value >= 0.0) return "#e2e8f0";    // Neutral greyish transition
    if (value > -0.3) return "#fca5a5";    // Soft Rose
    return "#dc2626";                      // Red alert
  };

  return (
    <div className="bg-white border border-stone-250 p-6 rounded-xs shadow-xs space-y-6">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-150">
        <div>
          <span className="text-[9px] bg-red-800 text-white border border-red-500 font-mono px-2 py-0.5 rounded font-bold tracking-widest uppercase">
            Interactive Elasticity Matrix
          </span>
          <h3 className="text-base font-bold font-mono text-stone-900 mt-1.5">
            Cross-Country Reform Elasticity Heatmap
          </h3>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            Calculates and benchmarks the transmission elasticity of sovereign digital assets and market securitization reforms. Bubbles depict the direction and intensity of shift in <strong>Architect Readiness Index (ARI)</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center bg-stone-50 border border-stone-200 px-3 py-1.5 rounded text-[11px] font-mono">
          <HelpCircle size={14} className="text-stone-400" />
          <span>Interactive Grid: Hover/Click to Drill Down</span>
        </div>
      </div>

      {/* Heatmap Layout with Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Recharts Heatmap Block */}
        <div className="lg:col-span-3 h-80 relative bg-stone-50/55 border border-stone-200 p-4 rounded">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 30, bottom: 20, left: 90 }}
            >
              <XAxis
                type="category"
                dataKey="x"
                name="Policy Lever"
                interval={0}
                tick={{ fontSize: 9, fontFamily: "monospace", width: 120 }}
                stroke="#a8a29e"
              />
              <YAxis
                type="category"
                dataKey="y"
                name="Sovereign Profile"
                interval={0}
                tick={{ fontSize: 9, fontFamily: "sans-serif", fontWeight: 600 }}
                stroke="#a8a29e"
              />
              <ZAxis
                type="number"
                dataKey="deltaARI"
                range={[80, 480]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                data={data}
                onClick={(node: any) => setSelectedCell(node.payload as HeatmapDataPoint)}
                className="cursor-pointer"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getCellColor(entry.deltaARI)}
                    stroke={selectedCell?.y === entry.y && selectedCell?.x === entry.x ? "#090d16" : "#ffffff"}
                    strokeWidth={selectedCell?.y === entry.y && selectedCell?.x === entry.x ? 2.5 : 1}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Drill-down side panel */}
        <div className="bg-stone-50 border border-stone-200 p-4 rounded flex flex-col justify-between space-y-4">
          {selectedCell ? (
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-mono bg-red-100 text-red-900 border border-red-200 px-2 py-0.5 rounded font-extrabold uppercase inline-block">
                  Cell Evaluator Active
                </span>
                <h4 className="font-bold text-stone-900 text-sm font-sans mt-2">
                  {selectedCell.y} State Response
                </h4>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5 leading-tight italic">
                  Lever: {selectedCell.x}
                </p>
              </div>

              <div className="space-y-2 text-[11px] font-mono border-t border-b border-stone-200 py-3">
                <div className="flex justify-between">
                  <span className="text-stone-500">GSV Index Run:</span>
                  <span className="font-bold text-stone-850">
                    {selectedCell.gsvBase.toFixed(2)} ➔ {selectedCell.gsvNew.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">ITC Capacity Run:</span>
                  <span className="font-bold text-stone-850">
                    {selectedCell.itcBase.toFixed(2)} ➔ {selectedCell.itcNew.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-dashed border-stone-200 text-sm font-bold">
                  <span className="text-stone-900">ARI Net Shift:</span>
                  <span className={selectedCell.deltaARI >= 0 ? "text-emerald-800 font-extrabold" : "text-rose-800 font-extrabold"}>
                    {selectedCell.deltaARI >= 0 ? "+" : ""}{selectedCell.deltaARI.toFixed(4)}
                  </span>
                </div>
              </div>

              <div className="bg-white px-2.5 py-2 border border-stone-200 rounded text-[9.5px] italic text-stone-600 leading-relaxed font-serif">
                A unit execution of this policy lever translates into a change of <strong className="text-stone-900 font-mono font-bold">+{selectedCell.deltaARI.toFixed(4)}</strong> in the total readiness performance score.
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center py-6 text-stone-400">
              <Info size={28} className="text-stone-300 stroke-1 block mb-2" />
              <p className="text-xs font-mono">Click any heatmap cell above to inspect the specific elasticity parameters</p>
            </div>
          )}

          {/* Map Palette Legend */}
          <div className="border-t border-stone-200 pt-3 space-y-1.5">
            <span className="text-[8px] font-mono uppercase font-bold text-stone-400 block tracking-wider">Elasticity Legend</span>
            <div className="grid grid-cols-4 gap-1 text-[8.5px] font-mono text-center">
              <span className="bg-emerald-900 text-white rounded py-0.5 font-bold">{`>1.0`}</span>
              <span className="bg-emerald-600 text-white rounded py-0.5 font-bold">{`0.5`}</span>
              <span className="bg-emerald-200 text-emerald-950 rounded py-0.5 font-bold">{`0.2`}</span>
              <span className="bg-red-600 text-white rounded py-0.5 font-bold">{`<0.0`}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
