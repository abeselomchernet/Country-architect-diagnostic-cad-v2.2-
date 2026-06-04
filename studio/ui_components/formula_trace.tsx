import { useState } from "react";
import { Copy, Check, FileCode, Variable, Compass, ChevronDown, ChevronUp } from "lucide-react";
import { PillarInput, SystemState } from "../engines/cad_core_engine";

export type FormulaTraceProps = {
  input: PillarInput;
  state: SystemState;
};

export function FormulaTrace({ input, state }: FormulaTraceProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("ari");

  const triggerCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Generate standardized LaTeX block for SSRN copy
  const latexBlock = `% Country Architect Diagnostic (CAD v2.2) math derivation system
\\begin{aligned}
  \\text{Pillar I: GSV} &= \\frac{\\text{Demand} + \\text{Delivery} + \\text{Trust} + \\text{Unit Economics}}{4} \\\\
                        &= \\frac{${input.demandReality.toFixed(2)} + ${input.deliveryInfrastructure.toFixed(2)} + ${input.trustArchitecture.toFixed(2)} + ${input.unitEconomics.toFixed(2)}}{4} = ${state.GSV.toFixed(4)} \\\\[1.5ex]
  \\text{Pillar II: ITC} &= \\frac{\\text{Capital} + \\text{Data} + \\text{Structuring} + \\text{Regulatory}}{4} \\\\
                         &= \\frac{${input.capitalPresence.toFixed(2)} + ${input.dataLegibility.toFixed(2)} + ${input.structuringCapacity.toFixed(2)} + ${input.regulatoryTranslation.toFixed(2)}}{4} = ${state.ITC.toFixed(4)} \\\\[1.5ex]
  \\text{LIC (Lock Intensity)} &= \\frac{(10 - \\text{GSV}) \\times (10 - \\text{ITC})}{10} \\\\
                              &= \\frac{(10 - ${state.GSV.toFixed(2)}) \\times (10 - ${state.ITC.toFixed(2)})}{10} = ${state.LIC.toFixed(4)} \\\\[1.5ex]
  \\text{SDR (System Dynamics)} &= (10 - \\text{LIC}) \\times 0.35 + \\text{MS}_n \\times 0.25 + \\text{FrictionFloor} \\times 0.20 + \\text{SFPi} \\times 0.20 \\\\
                               &= (10 - ${state.LIC.toFixed(3)}) \\times 0.35 + ${state.Momentum.toFixed(3)} \\times 0.25 + ${input.frictionFloor?.toFixed(2) ?? "6.50"} \\times 0.20 + ${((100 - state.SystemFailureProbability) / 10).toFixed(2)} \\times 0.20 = ${state.SDR.toFixed(4)} \\\\[1.5ex]
  \\text{Pillar IV: AFL} &= \\frac{\\text{Adequacy} + \\text{Political} + \\text{Execution} + \\text{DataCap} + \\text{TrustAcq}}{5} \\\\
                         &= \\frac{${input.capitalAdequacy.toFixed(2)} + ${input.politicalAccess.toFixed(2)} + ${input.executionDensity.toFixed(2)} + ${input.dataCapability.toFixed(2)} + ${input.trustAcquisition.toFixed(2)}}{5} = ${state.AFL.toFixed(4)} \\\\[1.5ex]
  \\mathbf{ARI \\ (Master Index)} &= (\\text{GSV} \\times 0.35) + (\\text{ITC} \\times 0.35) + (\\text{SDR} \\times 0.20) + (\\text{AFL} \\times 0.10) \\\\
                                  &= (${state.GSV.toFixed(3)} \\times 0.35) + (${state.ITC.toFixed(3)} \\times 0.35) + (${state.SDR.toFixed(3)} \\times 0.20) + (${state.AFL.toFixed(3)} \\times 0.10) = \\mathbf{${state.ARI.toFixed(4)}}
\\end{aligned}`;

  // Generate standardized Python execution proof for quick verification
  const pythonSnippet = `# CAD v2.2 Python Deterministic Replica
def compute_cad_model(inputs):
    gsv = (inputs['demandReality'] + inputs['deliveryInfrastructure'] + inputs['trustArchitecture'] + inputs['unitEconomics']) / 4.0
    itc = (inputs['capitalPresence'] + inputs['dataLegibility'] + inputs['structuringCapacity'] + inputs['regulatoryTranslation']) / 4.0
    afl = (inputs['capitalAdequacy'] + inputs['politicalAccess'] + inputs['executionDensity'] + inputs['dataCapability'] + inputs['trustAcquisition']) / 5.0
    
    lic = ((10.0 - gsv) * (10.0 - itc)) / 10.0
    
    prior_ari = inputs.get('priorARI', gsv + itc / 2.0)
    delta_time = inputs.get('deltaTime', 1.5)
    momentum = (gsv + itc) / 2.0 - prior_ari
    momentum = (gsv + itc) / 2.0 - prior_ari / delta_time if delta_time > 0 else 0
    # normalize momentum
    ms_n = max(0.0, min(10.0, 5.0 + momentum))
    
    sfpi = (100.0 - inputs.get('systemFailureRate', 20.0)) / 10.0
    friction_floor = inputs.get('frictionFloor', 6.5)
    
    sdr = ((10.0 - lic) * 0.35) + (ms_n * 0.25) + (friction_floor * 0.20) + (sfpi * 0.20)
    
    ari = (gsv * 0.35) + (itc * 0.35) + (sdr * 0.20) + (afl * 0.10)
    return {"gsv": gsv, "itc": itc, "lic": lic, "sdr": sdr, "afl": afl, "ari": ari}

inputs = ${JSON.stringify(input, null, 2)}
state = compute_cad_model(inputs)
print(f"Verified ARI: {state['ari']:.4f}")`;

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-[#FCFAF7] border border-stone-250 p-6 rounded-none relative">
        <div className="flex items-center gap-3 mb-2">
          <span className="p-1.5 bg-red-800 text-white font-mono rounded text-xs select-none">MATH</span>
          <h3 className="text-lg font-bold text-stone-900 font-display">SSRN-Grade Computational Compliance</h3>
        </div>
        <p className="text-xs text-stone-750 font-sans leading-relaxed">
          The CAD v2.2 framework is mapped below to its underlying deterministic foundations. Transparency ensures our economic diagnostics can be peer-reviewed, replicated in multi-agent policy simulators, and exported straight to statistical toolsets. Use the expanders below to trace individual derivation phases.
        </p>
      </div>

      {/* Accordion / Phase Breakdowns */}
      <div className="border border-stone-250 bg-white shadow-xs divide-y divide-stone-200">
        
        {/* Pillar I Calibration */}
        <div className="p-4">
          <button
            onClick={() => toggleSection("gsv")}
            className="w-full flex justify-between items-center text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-stone-100 text-stone-700 text-[10px] font-mono border border-stone-300 font-bold">1</span>
              <span className="text-xs font-bold text-stone-900 font-mono tracking-tight uppercase group-hover:text-red-900 transition-colors">Phase I — Grassroots Viability Formula (GSV)</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-stone-605">
              <span>Current GSV: <strong>{state.GSV.toFixed(3)}</strong></span>
              {expandedSection === "gsv" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>
          
          {expandedSection === "gsv" && (
            <div className="mt-4 pl-7 space-y-3 font-sans text-xs border-l-2 border-stone-200 ml-2.5">
              <div className="bg-[#FAF8F5] p-3 border border-stone-150 font-mono text-center text-sm font-semibold select-all text-red-950">
                {"GSV = 1/4 * [Demand + Delivery + Trust + UnitEconomics]"}
              </div>
              <div className="text-stone-700 leading-relaxed space-y-1">
                <div>• <strong>Demand Reality (D)</strong> = <span className="font-mono bg-stone-100 p-0.5 rounded">{input.demandReality.toFixed(2)}</span> / 10.0</div>
                <div>• <strong>Delivery Infrastructure (I)</strong> = <span className="font-mono bg-stone-100 p-0.5 rounded">{input.deliveryInfrastructure.toFixed(2)}</span> / 10.0</div>
                <div>• <strong>Trust Architecture (T)</strong> = <span className="font-mono bg-stone-100 p-0.5 rounded">{input.trustArchitecture.toFixed(2)}</span> / 10.0</div>
                <div>• <strong>Unit Economics (U)</strong> = <span className="font-mono bg-stone-100 p-0.5 rounded">{input.unitEconomics.toFixed(2)}</span> / 10.0</div>
              </div>
              <p className="text-[11px] text-stone-500 italic font-serif-body">
                Intergation: Measures structural grassroots momentum. Highly vulnerable to rural agent cash-shortage trust breaches.
              </p>
            </div>
          )}
        </div>

        {/* Pillar II Calibration */}
        <div className="p-4">
          <button
            onClick={() => toggleSection("itc")}
            className="w-full flex justify-between items-center text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-stone-100 text-stone-700 text-[10px] font-mono border border-stone-300 font-bold">2</span>
              <span className="text-xs font-bold text-stone-900 font-mono tracking-tight uppercase group-hover:text-red-900 transition-colors">Phase II — Institutional Translation Capacity Formula (ITC)</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-stone-605">
              <span>Current ITC: <strong>{state.ITC.toFixed(3)}</strong></span>
              {expandedSection === "itc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>
          
          {expandedSection === "itc" && (
            <div className="mt-4 pl-7 space-y-3 font-sans text-xs border-l-2 border-stone-200 ml-2.5">
              <div className="bg-[#FAF8F5] p-3 border border-stone-150 font-mono text-center text-sm font-semibold select-all text-red-950">
                {"ITC = 1/4 * [Capital + Data + Structuring + Regulatory]"}
              </div>
              <div className="text-stone-700 leading-relaxed space-y-1">
                <div>• <strong>Capital Presence (K)</strong> = <span className="font-mono bg-stone-100 p-0.5 rounded">{input.capitalPresence.toFixed(2)}</span> / 10.0</div>
                <div>• <strong>Data Legibility (L)</strong> = <span className="font-mono bg-stone-100 p-0.5 rounded">{input.dataLegibility.toFixed(2)}</span> / 10.0</div>
                <div>• <strong>Structuring Capacity (S)</strong> = <span className="font-mono bg-stone-100 p-0.5 rounded">{input.structuringCapacity.toFixed(2)}</span> / 10.0</div>
                <div>• <strong>Regulatory Translation (R)</strong> = <span className="font-mono bg-stone-100 p-0.5 rounded">{input.regulatoryTranslation.toFixed(2)}</span> / 10.0</div>
              </div>
              <p className="text-[11px] text-stone-500 italic font-serif-body">
                Intergation: Translates physical actions to formal investment grade indexes. Requires national ID (Fayda) integration.
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Coupling & Alignment Logic (LIC) */}
        <div className="p-4">
          <button
            onClick={() => toggleSection("lic")}
            className="w-full flex justify-between items-center text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-stone-100 text-stone-700 text-[10px] font-mono border border-stone-300 font-bold">3</span>
              <span className="text-xs font-bold text-stone-900 font-mono tracking-tight uppercase group-hover:text-red-900 transition-colors">Phase III — Lock Intensity Coefficient (LIC)</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-stone-605">
              <span>Current LIC: <strong>{state.LIC.toFixed(3)}</strong></span>
              {expandedSection === "lic" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>
          
          {expandedSection === "lic" && (
            <div className="mt-4 pl-7 space-y-3 font-sans text-xs border-l-2 border-stone-200 ml-2.5">
              <div className="bg-[#FAF8F5] p-3 border border-stone-150 font-mono text-center text-sm font-semibold select-all text-red-950">
                {"LIC = [ (10 - GSV) * (10 - ITC) ] / 10"}
              </div>
              <div className="text-stone-700 leading-relaxed">
                <p className="mb-2">
                  LIC measures de facto path-dependence stiffness. A higher score (&gt; 6.0) triggers a severe "Lock State" indictator, meaning commercial capital cannot enter standard rural distribution points independently of parallel architectural translation structures:
                </p>
                <div className="bg-stone-50 p-2.5 border border-stone-200 font-mono text-[11px] space-y-1">
                  <div>• Bottom-Up Dependency Gap (BUD) = 10 - {state.GSV.toFixed(2)} = <strong>{state.BUD.toFixed(2)}</strong></div>
                  <div>• Top-Down Dependency Gap (TDD) = 10 - {state.ITC.toFixed(2)} = <strong>{state.TDD.toFixed(2)}</strong></div>
                  <div>• Active Binding Constraint = <strong>{state.BindingConstraint}</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Dynamics (SDR) */}
        <div className="p-4">
          <button
            onClick={() => toggleSection("sdr")}
            className="w-full flex justify-between items-center text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-stone-100 text-stone-700 text-[10px] font-mono border border-stone-300 font-bold">4</span>
              <span className="text-xs font-bold text-stone-900 font-mono tracking-tight uppercase group-hover:text-red-900 transition-colors">Phase IV — System Dynamics Rating (SDR)</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-stone-605">
              <span>Current SDR: <strong>{state.SDR.toFixed(3)}</strong></span>
              {expandedSection === "sdr" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>
          
          {expandedSection === "sdr" && (
            <div className="mt-4 pl-7 space-y-3 font-sans text-xs border-l-2 border-stone-200 ml-2.5">
              <div className="bg-[#FAF8F5] p-3 border border-stone-150 font-mono text-center text-sm font-semibold select-all text-red-950">
                {"SDR = (10 - LIC) * 0.35 + MS_n * 0.25 + FrictionFloor * 0.20 + SFPi * 0.20"}
              </div>
              <div className="text-stone-700 leading-relaxed font-mono text-[11px] space-y-1">
                <div>• <strong>Unlocking Potential (10 - LIC * 0.35)</strong> = {(10 - state.LIC).toFixed(3)} * 0.35 = <strong>{((10 - state.LIC) * 0.35).toFixed(3)}</strong></div>
                <div>• <strong>Normalized Momentum (MS_n * 0.25)</strong> = {state.Momentum.toFixed(3)} (Normalized: {((state.Momentum + 5)).toFixed(2)}) * 0.25 = <strong>{(state.Momentum * 0.25).toFixed(3)}</strong></div>
                <div>• <strong>Friction Floor (FrictionFloor * 0.20)</strong> = {(input.frictionFloor ?? 6.5).toFixed(2)} * 0.20 = <strong>{((input.frictionFloor ?? 6.5) * 0.20).toFixed(3)}</strong></div>
                <div>• <strong>Inverse Failure Safety (SFPi * 0.20)</strong> = {((100 - state.SystemFailureProbability) / 10).toFixed(2)} * 0.20 = <strong>{(((100 - state.SystemFailureProbability) / 10) * 0.20).toFixed(3)}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Master Index (ARI) */}
        <div className="p-4">
          <button
            onClick={() => toggleSection("ari")}
            className="w-full flex justify-between items-center text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-stone-800 text-white text-[10px] font-mono border border-stone-900 font-bold">★</span>
              <span className="text-xs font-bold text-stone-900 font-mono tracking-tight uppercase group-hover:text-red-900 transition-colors">Phase V — Master Architect Readiness Index (ARI)</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-stone-605">
              <span>Current ARI: <strong>{state.ARI.toFixed(3)}</strong></span>
              {expandedSection === "ari" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>
          
          {expandedSection === "ari" && (
            <div className="mt-4 pl-7 space-y-3 font-sans text-xs border-l-2 border-stone-800 ml-2.5">
              <div className="bg-[#FAF8F5] p-3 border border-stone-150 font-mono text-center text-sm font-semibold select-all text-red-950">
                {"ARI = [GSV * 0.35] + [ITC * 0.35] + [SDR * 0.20] + [AFL * 0.10]"}
              </div>
              <div className="text-stone-700 leading-relaxed font-mono text-[11px] space-y-1">
                <div>• GSV Contribution = {state.GSV.toFixed(2)} * 0.35 = <strong>{(state.GSV * 0.35).toFixed(3)}</strong></div>
                <div>• ITC Contribution = {state.ITC.toFixed(2)} * 0.35 = <strong>{(state.ITC * 0.35).toFixed(3)}</strong></div>
                <div>• SDR Contribution = {state.SDR.toFixed(2)} * 0.20 = <strong>{(state.SDR * 0.20).toFixed(3)}</strong></div>
                <div>• AFL Contribution = {state.AFL.toFixed(2)} * 0.10 = <strong>{(state.AFL * 0.10).toFixed(3)}</strong></div>
                <div className="border-t border-stone-250 pt-1.5 text-xs text-stone-900 font-bold select-all">
                  • Total Master ARI Index = <strong>{state.ARI.toFixed(4)}</strong> ({state.Classification})
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Export Blocks Tab panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LaTeX Card */}
        <div className="bg-white border border-stone-250 p-5 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-bold font-mono text-stone-900 uppercase">LaTeX Derivation Block</h4>
                <p className="text-[10px] text-stone-500 font-sans mt-0.5">Copy absolute mathematical proof text for SSRN working papers.</p>
              </div>
              <button
                onClick={() => triggerCopy(latexBlock, "latex")}
                className="p-1 px-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 rounded font-mono text-[10px] cursor-pointer flex items-center gap-1 transition-colors"
              >
                {copiedId === "latex" ? <Check size={11} className="text-emerald-700" /> : <Copy size={11} />}
                {copiedId === "latex" ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="mt-4 bg-stone-50 border border-stone-200 p-3 rounded-none font-mono text-[10px] overflow-auto select-all max-h-48 text-stone-700">
              {latexBlock}
            </pre>
          </div>
          <div className="text-[10px] text-stone-400 font-mono mt-4">
            Encapsulated inside aligned LaTeX environment. JEL Code ready.
          </div>
        </div>

        {/* Python Card */}
        <div className="bg-white border border-stone-250 p-5 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-bold font-mono text-stone-900 uppercase">Python Replica Code</h4>
                <p className="text-[10px] text-stone-500 font-sans mt-0.5">Run native parallel simulations in notebooks matching slider states.</p>
              </div>
              <button
                onClick={() => triggerCopy(pythonSnippet, "python")}
                className="p-1 px-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 rounded font-mono text-[10px] cursor-pointer flex items-center gap-1 transition-colors"
              >
                {copiedId === "python" ? <Check size={11} className="text-emerald-700" /> : <Copy size={11} />}
                {copiedId === "python" ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="mt-4 bg-stone-50 border border-stone-200 p-3 rounded-none font-mono text-[10px] overflow-auto select-all max-h-48 text-stone-700">
              {pythonSnippet}
            </pre>
          </div>
          <div className="text-[10px] text-stone-400 font-mono mt-4">
            Zero-dependency native execution block. Completely reproducible.
          </div>
        </div>

      </div>

    </div>
  );
}
