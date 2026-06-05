import React from "react";
import { Shield, Check, Info, AlertTriangle, Cpu } from "lucide-react";
import { IdentificationReport } from "../core/structural_identification_engine";

export interface CausalValidationPanelProps {
  report: IdentificationReport;
}

export const CausalValidationPanel: React.FC<CausalValidationPanelProps> = ({ report }) => {
  return (
    <div className="bg-white border border-stone-250 p-6 rounded font-sans shadow-2xs space-y-5 text-left">
      {/* Header */}
      <h3 className="font-bold font-mono text-xs uppercase border-b border-stone-200 pb-3 text-stone-900 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Shield size={14} className="text-red-900" /> Causal Identification Integrity
        </span>
        <span className="bg-stone-100 text-[9px] text-stone-750 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wide">
          IVS CORE
        </span>
      </h3>

      {/* Grade Card */}
      <div className="bg-stone-50 border border-stone-205 p-4 rounded space-y-3">
        <div className="flex justify-between items-center gap-2">
          <div>
            <span className="text-[9px] uppercase font-bold text-stone-400 font-mono block">Design Strategy</span>
            <span className="text-[11px] font-mono font-extrabold text-stone-800 bg-stone-150 px-2 py-0.5 rounded border border-stone-200 uppercase">
              Quasi-Experimental Panel
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-stone-400 font-mono block">Validity Score (IVS)</span>
            <span className="text-lg font-bold font-mono text-stone-900">
              {report.publicationScore.toFixed(1)}
              <span className="text-xs text-stone-400 font-normal">/10</span>
            </span>
          </div>
        </div>

        {/* Publication Readiness Indicators */}
        {report.publicationGrade === "Publication Grade" ? (
          <div className="bg-emerald-50/50 border border-emerald-250 px-3 py-2.5 rounded text-[11px] font-sans text-emerald-850 flex items-start gap-1.5">
            <Check size={14} className="text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-emerald-900">SSRN Peer-Review Ready.</span> 
              Pre-trends parallel lines are unconfounded and SUTVA spillovers are minimal. Recommended for submission.
            </div>
          </div>
        ) : report.publicationGrade === "Working Paper" ? (
          <div className="bg-amber-50/50 border border-amber-250 px-3 py-2.5 rounded text-[11px] font-sans text-amber-850 flex items-start gap-1.5">
            <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-900">Working Paper Grade.</span> 
              Qualified for pre-print servers (SSRN/NBER). Frictional constraints prevent major journal unconfoundedness.
            </div>
          </div>
        ) : (
          <div className="bg-red-50/30 border border-red-250 px-3 py-2.5 rounded text-[11px] font-sans text-red-850 flex items-start gap-1.5">
            <AlertTriangle size={14} className="text-red-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-red-900">Simulation-Grade Only.</span> 
              Pre-trend parallel variance violated. Endogeneity selection thresholds exceeded. Must interpret parameters with extreme caution.
            </div>
          </div>
        )}
      </div>

      {/* Progress Bars */}
      <div className="space-y-3.5 pt-1">
        {/* Parallel Trends */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10.5px]">
            <span className="text-stone-605 font-medium">Pre-Trend Parallelism (AEA Min: 90%)</span>
            <span className="font-bold font-mono text-stone-900">{(report.parallelTrends * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden border border-stone-200">
            <div 
              className={`h-full transition-all duration-300 ${
                report.parallelTrends >= 0.90 ? "bg-emerald-600" : report.parallelTrends >= 0.70 ? "bg-amber-500" : "bg-red-600"
              }`}
              style={{ width: `${report.parallelTrends * 100}%` }} 
            />
          </div>
        </div>

        {/* Lead/Lag Consistency */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10.5px]">
            <span className="text-stone-605 font-medium">Event Study Lead-Lag Consistency</span>
            <span className="font-bold font-mono text-stone-900">{(report.leadLagConsistency * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden border border-stone-200">
            <div 
              className="bg-stone-500 h-full transition-all duration-300"
              style={{ width: `${report.leadLagConsistency * 100}%` }} 
            />
          </div>
        </div>

        {/* SUTVA Corridor Spillover Risk */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10.5px]">
            <span className="text-stone-605 font-medium">SUTVA Corridor Spillover Risk</span>
            <span className="font-bold font-mono text-stone-900">{(report.sutvaRisk * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden border border-stone-200">
            <div 
              className={`h-full transition-all duration-300 ${
                report.sutvaRisk < 0.35 ? "bg-emerald-600" : report.sutvaRisk < 0.55 ? "bg-amber-500" : "bg-red-600"
              }`}
              style={{ width: `${report.sutvaRisk * 100}%` }} 
            />
          </div>
        </div>

        {/* Selection Exogeneity Strength */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10.5px]">
            <span className="text-stone-605 font-medium">Selection Exogeneity Strength</span>
            <span className="font-bold font-mono text-stone-900">{(report.selectionExogeneity * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden border border-stone-200">
            <div 
              className="bg-emerald-600 h-full transition-all duration-300" 
              style={{ width: `${report.selectionExogeneity * 100}%` }} 
            />
          </div>
        </div>

        {/* Pre-treatment Test P-Value */}
        <div className="flex justify-between items-center text-xs pt-1.5 font-mono text-stone-600 border-t border-stone-150">
          <span className="flex items-center gap-1"><Cpu size={12} /> Pre-Trend Alpha P-Value:</span>
          <span className={`font-bold ${report.pvalue > 0.05 ? "text-amber-600" : "text-emerald-700"}`}>
            {report.pvalue.toFixed(4)} {report.pvalue > 0.05 ? "(p > 0.05)" : "(Significant p <= 0.05)"}
          </span>
        </div>
      </div>

      {/* Warnings List */}
      {report.warnings.length > 0 && (
        <div className="pt-2.5 border-t border-stone-150 space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-amber-800 font-mono tracking-wider flex items-center gap-1">
            ⚠️ Identification Threat Diagnostics
          </div>
          <div className="space-y-1">
            {report.warnings.map((warn, idx) => (
              <div 
                key={`threat-${idx}`} 
                className="text-[10px] text-stone-650 bg-stone-50 border-l-2 border-amber-500 pl-2 py-1 leading-normal font-mono"
              >
                {warn}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
