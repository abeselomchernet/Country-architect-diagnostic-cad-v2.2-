import React, { useState, useMemo } from "react";
import { SampleCountries } from "../core/multi_country_engine";
import { PolicyShocks } from "../core/policy_shock_engine";
import { MultiCountryEngine } from "../core/multi_country_engine";
import { ElasticityEngine, ElasticityMatrixBuilder } from "../core/elasticity_engine";
import { SSRNExporter } from "../export/ssrnExporter";
import ElasticityHeatmap from "../components/ElasticityHeatmap";
import { CADEngine, CADInput } from "../core/cadEngine";
import { MultiCountryPaperGenerator, PaperInput } from "../export/ssrn/multiCountryPaperGenerator";
import { SSRNPaperCompiler, CompiledSSRNPaper } from "../export/ssrn/ssrnPaperCompiler";
import { Info, Download, Award, ShieldAlert, ArrowUpRight, TrendingUp, Layers, CheckCircle2, FileText, Settings, Copy, BookOpen } from "lucide-react";

const VARIABLES_TO_PERTURB: (keyof CADInput)[] = [
  "demandReality",
  "deliveryInfrastructure",
  "trustArchitecture",
  "unitEconomics",
  "capitalPresence",
  "dataLegibility",
  "structuringCapacity",
  "regulatoryTranslation",
];

export default function CrossCountryDashboard() {
  const [selectedShockId, setSelectedShockId] = useState<string>("DPI_FAYDA_SPAR_INTEGRATION");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Paper Authoring State customizations
  const [authorName, setAuthorName] = useState<string>("Abeselom Girum Chernet");
  const [institution, setInstitution] = useState<string>("Comparative Systems & Policy Economics Directorate");
  const [authorEmail, setAuthorEmail] = useState<string>("abeselomgirum@gmail.com");
  const [activePaperTab, setActivePaperTab] = useState<string>("abstract");

  const selectedShockObj = useMemo(() => {
    return PolicyShocks[selectedShockId] || Object.values(PolicyShocks)[0];
  }, [selectedShockId]);

  const simulationResult = useMemo(() => {
    return MultiCountryEngine.runShockAcrossCountries(SampleCountries, selectedShockObj);
  }, [selectedShockObj]);

  // Compute live variable elasticity matrix
  const elasticityMatrix = useMemo(() => {
    let rawCells: any[] = [];
    for (const v of VARIABLES_TO_PERTURB) {
      const data = ElasticityEngine.computeForVariable(SampleCountries, v);
      rawCells = [...rawCells, ...data];
    }
    return ElasticityMatrixBuilder.build(rawCells);
  }, []);

  // Focused cell coordinate state for the Sensitivity Inspector
  const [focusedElasticCell, setFocusedElasticCell] = useState<{
    variable: string;
    countryId: string;
    value: number;
  } | null>(() => {
    return {
      variable: "dataLegibility",
      countryId: "eth",
      value: 0.0, // calculated later
    };
  });

  const activeElasticCellDetails = useMemo(() => {
    if (!focusedElasticCell) return null;
    const country = SampleCountries.find(c => c.id === focusedElasticCell.countryId);
    if (!country) return null;
    
    // Recalculate specific perturbation metrics
    const baselineRes = CADEngine.compute(country.state);
    const EPSILON = 0.5;
    const perturbedState = {
      ...country.state,
      [focusedElasticCell.variable]: Math.min(10, (country.state[focusedElasticCell.variable as keyof CADInput] as number) + EPSILON),
    };
    const perturbedRes = CADEngine.compute(perturbedState);
    const deltaARI = perturbedRes.ari - baselineRes.ari;
    const elasticity = deltaARI / EPSILON;

    return {
      countryName: country.name,
      variableName: focusedElasticCell.variable,
      baselineVal: country.state[focusedElasticCell.variable as keyof CADInput] as number,
      perturbedVal: perturbedState[focusedElasticCell.variable as keyof CADInput] as number,
      baselineARI: baselineRes.ari,
      perturbedARI: perturbedRes.ari,
      deltaARI,
      elasticity,
    };
  }, [focusedElasticCell]);

  // SSRN Working Paper Autocrafting Object
  const ssrnPaper = useMemo((): CompiledSSRNPaper => {
    const paperCountries = SampleCountries.map(c => {
      const baselineRes = CADEngine.compute(c.state);
      return {
        country: c.name,
        gsv: c.state.demandReality + c.state.deliveryInfrastructure, // GSV index equivalent
        itc: c.state.structuringCapacity + c.state.regulatoryTranslation, // ITC index equivalent
        afl: c.state.unitEconomics + c.state.capitalPresence,
        ari: baselineRes.ari,
        lic: baselineRes.lic,
        region: c.region,
      };
    });

    const activeShockScenario = {
      name: selectedShockObj.name,
      id: selectedShockId,
      description: selectedShockObj.description,
      results: simulationResult.results,
      ranking: simulationResult.ranking,
      globalInsight: simulationResult.globalInsight,
    };

    return SSRNPaperCompiler.compile({
      title: `Cross-Country Response Elasticity Mapping under Exogenous Policy: A Multi-Country Architectural Analysis of "${selectedShockObj.name}"`,
      author: authorName,
      affiliation: institution,
      email: authorEmail,
      timestamp: new Date().toISOString().slice(0, 10),
      countries: paperCountries,
      elasticity: elasticityMatrix,
      activeShock: activeShockScenario,
    });
  }, [selectedShockId, selectedShockObj, simulationResult, authorName, institution, authorEmail, elasticityMatrix]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleExportComparativePDF = () => {
    const doc = SSRNExporter.generateComparative(
      selectedShockId,
      authorName,
      authorEmail
    );
    doc.save(`CAD_v2.2_SSRN_Comparative_${selectedShockId}_Report.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION HEADER */}
      <div className="bg-stone-900 text-stone-100 p-6 shadow-md rounded-xs relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-4">
          <TrendingUp size={240} className="text-stone-300" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-red-800 text-white border border-red-500 uppercase font-mono px-2 py-0.5 rounded font-bold tracking-widest">
              SSRN Econometric Lab
            </span>
            <span className="text-[10px] bg-stone-800 text-stone-300 uppercase font-mono px-2 py-0.5 rounded tracking-wider">
              Cross-Country v2.2
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-mono text-white mt-2.5">
            Cross-Country Comparative Dashboard
          </h2>
          <p className="text-xs text-stone-300 mt-1.5 leading-relaxed font-sans max-w-3xl">
            Empirical comparative analysis layer examining model sensitivities, policy transmission elasticities, and country-level systemic bottlenecks under counterfactual shocks.
          </p>
        </div>
      </div>

      {/* POLICY SHOCK SELECTOR AND CONTROLS */}
      <div className="bg-white border border-stone-250 p-5 shadow-xs rounded-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <label className="block text-xs font-mono font-bold text-stone-700 uppercase">
              Select Exogenous Policy Intervention
            </label>
            <select
              value={selectedShockId}
              onChange={(e) => setSelectedShockId(e.target.value)}
              className="w-full border border-stone-350 bg-white p-2.5 text-xs font-mono rounded cursor-pointer text-stone-900 focus:outline-none focus:ring-1 focus:ring-red-800"
            >
              {Object.entries(PolicyShocks).map(([key, shock]) => (
                <option key={key} value={key}>
                  {shock.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2 shrink-0 h-full mt-auto">
            <button
              onClick={handleExportComparativePDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-800 hover:bg-red-900 text-white font-mono text-xs font-bold rounded cursor-pointer transition-colors"
              title="Export academic-grade SSRN comparative working paper PDF"
            >
              <Download size={14} />
              <span>Generate Comparative SSRN Paper</span>
            </button>
          </div>
        </div>

        {/* Selected Shock Description Summary */}
        <div className="mt-4 p-3.5 bg-stone-50 border border-stone-200 rounded text-xs leading-relaxed text-stone-800">
          <span className="font-mono font-bold text-stone-900 block mb-1">
            Policy Shock Mechanism:
          </span>
          {selectedShockObj.description}
        </div>
      </div>

      {/* SYSTEM LEVEL STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white border border-stone-200 p-4 shadow-2xs rounded-sm relative">
          <div className="absolute right-3 top-3 text-emerald-800 bg-emerald-50 p-1 rounded-full">
            <Award size={16} />
          </div>
          <span className="text-[9px] text-stone-500 font-bold uppercase font-mono tracking-wider">
            Most Elastic Transition Yield
          </span>
          <div className="text-xl font-extrabold text-red-900 mt-1.5 font-mono">
            {simulationResult.ranking.highestStructuralGain}
          </div>
          <p className="text-[11.5px] text-stone-605 mt-2 leading-relaxed font-sans">
            Archetype registering the highest positive derivative of composite ARI with respect to the active reform.
          </p>
        </div>

        <div className="bg-white border border-stone-200 p-4 shadow-2xs rounded-sm relative">
          <div className="absolute right-3 top-3 text-stone-800 bg-stone-50 p-1 rounded-full">
            <Layers size={16} />
          </div>
          <span className="text-[9px] text-stone-500 font-bold uppercase font-mono tracking-wider">
            System Resilience Frontier
          </span>
          <div className="text-xl font-extrabold text-stone-900 mt-1.5 font-mono">
            {simulationResult.ranking.mostResilient}
          </div>
          <p className="text-[11.5px] text-stone-605 mt-2 leading-relaxed font-sans">
            Archetype maintaining the strongest absolute post-shock structural scores, closest to robust targets.
          </p>
        </div>

        <div className="bg-white border border-stone-200 p-4 shadow-2xs rounded-sm relative">
          <div className="absolute right-3 top-3 text-rose-800 bg-rose-50 p-1 rounded-full">
            <ShieldAlert size={16} />
          </div>
          <span className="text-[9px] text-stone-500 font-bold uppercase font-mono tracking-wider">
            Symmetric Bottleneck Vulnerability
          </span>
          <div className="text-xl font-extrabold text-stone-900 mt-1.5 font-mono">
            {simulationResult.ranking.mostVulnerable}
          </div>
          <p className="text-[11.5px] text-stone-605 mt-2 leading-relaxed font-sans">
            Archetype indicating high systemic lock-in resistance, absorbing the transition payload with lowest net gains.
          </p>
        </div>

      </div>

      {/* ECONOMIC POLICY NARRATIVE */}
      <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-sm">
        <h4 className="font-bold text-xs uppercase font-mono text-amber-900 flex items-center gap-1.5 justify-start">
          <Info size={14} /> Empirical Identification & Structural Narrative
        </h4>
        <p className="text-xs text-stone-700 mt-1.5 leading-relaxed font-serif italic">
          {simulationResult.globalInsight}
        </p>
      </div>

      {/* HIGH-FIDELITY VECTOR ECONOMETRIC VISUALIZATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* CHART 1: COUNTERFACTUAL DELTA REQUISITES */}
        <div className="bg-white border border-stone-250 p-4 shadow-xs rounded-sm space-y-3">
          <div>
            <h4 className="font-mono font-bold text-xs text-stone-900 uppercase">
              Ex-Ante vs Ex-Post Policy Impact Profiles
            </h4>
            <p className="text-[10px] text-stone-500 font-sans">
              Plotting Baseline vs Counterfactual simulated Architect Readiness Index (ARI) score levels
            </p>
          </div>

          <div className="h-56 bg-stone-50 border border-stone-200 rounded flex flex-col justify-between p-3">
            {/* SVG Interactive Dual Bar Levels */}
            <svg viewBox="0 0 400 180" className="w-[100%] h-[100%] overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="380" y2="20" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3,3" />
              <line x1="40" y1="55" x2="380" y2="55" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3,3" />
              <line x1="40" y1="90" x2="380" y2="90" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3,3" />
              <line x1="40" y1="125" x2="380" y2="125" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3,3" />
              <line x1="40" y1="150" x2="380" y2="150" stroke="#9CA3AF" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="32" y="23" className="font-mono text-[8px] text-stone-500 text-right" textAnchor="end">10.0</text>
              <text x="32" y="58" className="font-mono text-[8px] text-stone-500 text-right" textAnchor="end">7.5</text>
              <text x="32" y="93" className="font-mono text-[8px] text-stone-500 text-right" textAnchor="end">5.0</text>
              <text x="32" y="128" className="font-mono text-[8px] text-stone-500 text-right" textAnchor="end">2.5</text>
              <text x="32" y="153" className="font-mono text-[8px] text-stone-500 text-right" textAnchor="end">0.0</text>

              {/* Draw bars for each country outcome */}
              {simulationResult.results.map((r, index) => {
                const step = 85; 
                const startX = 65 + (index * step);
                
                // Height scaling: 150 (0.0) -> 20 (10.0) => 130px total height span
                const baseHeight = (r.before.ari / 10.0) * 130;
                const postHeight = (r.after.ari / 10.0) * 130;

                const baseTop = 150 - baseHeight;
                const postTop = 150 - postHeight;

                return (
                  <g key={r.countryId}>
                    {/* Ex-Ante Bar (Baseline) */}
                    <rect 
                      x={startX} 
                      y={baseTop} 
                      width="16" 
                      height={baseHeight} 
                      fill="#D1D5DB" 
                      rx="1"
                      className="transition-all duration-300 hover:fill-stone-400" 
                    />
                    {/* Ex-Post Bar (Simulated) */}
                    <rect 
                      x={startX + 18} 
                      y={postTop} 
                      width="16" 
                      height={postHeight} 
                      fill="#991B1B" 
                      rx="1"
                      className="transition-all duration-300 hover:fill-red-900" 
                    />

                    {/* Numerical labels */}
                    <text x={startX + 8} y={baseTop - 4} className="font-mono text-[7px]" textAnchor="middle">{r.before.ari.toFixed(2)}</text>
                    <text x={startX + 26} y={postTop - 4} className="font-mono font-bold text-[7.5px] fill-red-800" textAnchor="middle">{r.after.ari.toFixed(2)}</text>

                    {/* Country code */}
                    <text x={startX + 17} y="163" className="font-sans text-[8.5px] font-bold text-stone-700" textAnchor="middle">
                      {r.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Custom chart legend */}
            <div className="flex gap-4 items-center justify-center text-[9px] font-mono border-t border-stone-200 pt-2 mt-1">
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 bg-stone-300 rounded-sm"></span> Ex-Ante Baseline</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 bg-red-800 rounded-sm"></span> Ex-Post Counterfactual Simulation</span>
            </div>
          </div>
        </div>

        {/* CHART 2: REFORM RESPONSE ELASTICITY GRAPH */}
        <div className="bg-white border border-stone-250 p-4 shadow-xs rounded-sm space-y-3">
          <div>
            <h4 className="font-mono font-bold text-xs text-stone-900 uppercase">
              Institutional Elasticity Response Path
            </h4>
            <p className="text-[10px] text-stone-500 font-sans">
              Causal transformation response curve as a function of simulated policy friction reduction coefficients
            </p>
          </div>

          <div className="h-56 bg-stone-50 border border-stone-200 rounded flex flex-col justify-between p-3">
            <svg viewBox="0 0 400 180" className="w-[100%] h-[100%] overflow-visible">
              {/* Plot Grid lines */}
              <line x1="40" y1="20" x2="380" y2="20" stroke="#ECEBE4" strokeWidth="0.5" />
              <line x1="40" y1="55" x2="380" y2="55" stroke="#ECEBE4" strokeWidth="0.5" />
              <line x1="40" y1="90" x2="380" y2="90" stroke="#ECEBE4" strokeWidth="0.5" />
              <line x1="40" y1="125" x2="380" y2="125" stroke="#ECEBE4" strokeWidth="0.5" />
              <line x1="40" y1="150" x2="380" y2="150" stroke="#78716C" strokeWidth="1" />
              <line x1="40" y1="20" x2="40" y2="150" stroke="#78716C" strokeWidth="1" />

              {/* Y Axis: Net dARI Gain */}
              <text x="32" y="23" className="font-mono text-[8px] text-stone-500 text-right" textAnchor="end">1.60</text>
              <text x="32" y="55" className="font-mono text-[8px] text-stone-500 text-right" textAnchor="end">1.10</text>
              <text x="32" y="90" className="font-mono text-[8px] text-stone-500 text-right" textAnchor="end">0.60</text>
              <text x="32" y="125" className="font-mono text-[8px] text-stone-500 text-right" textAnchor="end">0.10</text>
              <text x="32" y="153" className="font-mono text-[8px] text-stone-500 text-right" textAnchor="end">0.00</text>

              {/* X Axis: Simulated Reform Shock Multiplier */}
              <text x="108" y="163" className="font-mono text-[7px] text-stone-500" textAnchor="middle">Low Force (x0.2)</text>
              <text x="176" y="163" className="font-mono text-[7px] text-stone-500" textAnchor="middle">Mod (x0.5)</text>
              <text x="244" y="163" className="font-mono text-[7px] text-stone-500" textAnchor="middle">High (x0.8)</text>
              <text x="312" y="163" className="font-mono text-[7px] text-stone-500" textAnchor="middle">Full Reform (x1.0)</text>

              {/* Curves construction */}
              {simulationResult.results.map((rowArr, cIdx) => {
                // Generate 4 points on the simulated line corresponding to impact coefficient scaled
                const scaleFactors = [0.2, 0.5, 0.8, 1.0];
                const xPositions = [108, 176, 244, 312];
                const countryObj = SampleCountries.find(c => c.id === rowArr.countryId)!;

                // Color schemes for lines
                const colorArr = ["#D97706", "#2563EB", "#059669", "#7C3AED"];
                const pointColor = colorArr[cIdx % colorArr.length];

                const points = scaleFactors.map((sf, idx) => {
                  // Simulate partial shock impact on overall ARI level
                  const baselineARI = CADEngine.compute(countryObj.state).ari;
                  
                  // Interpolated state
                  const partialState = { ...countryObj.state };
                  // Apply shock scaled by SF
                  const partialShockInput = selectedShockObj.apply({ ...countryObj.state });
                  
                  // Compute delta at scale factor
                  const partialSimRes = CADEngine.compute(partialShockInput);
                  const fullDelta = partialSimRes.ari - baselineARI;
                  const currentDelta = fullDelta * sf; // linear projection of elasticity behavior
                  
                  const x = xPositions[idx];
                  // Compute Y position. Axis height from 150 (0.0 delta) to 20 (1.6 delta)
                  const y = 150 - ((currentDelta / 1.6) * 130);
                  return { x, y, delta: currentDelta };
                });

                // Path string
                const dPath = `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y} L ${points[2].x} ${points[2].y} L ${points[3].x} ${points[3].y}`;

                return (
                  <g key={rowArr.countryId}>
                    <path 
                      d={dPath} 
                      fill="none" 
                      stroke={pointColor} 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                    {points.map((p, pIdx) => (
                      <circle 
                        key={pIdx} 
                        cx={p.x} 
                        cy={p.y} 
                        r="3.5" 
                        fill={pointColor}
                        className="transition-all duration-300 hover:r-5 cursor-pointer"
                      >
                        <title>{rowArr.name} under multiplier {scaleFactors[pIdx]}: +{p.delta.toFixed(3)} dARI</title>
                      </circle>
                    ))}
                  </g>
                );
              })}
            </svg>

            {/* Curves legend */}
            <div className="flex gap-4 items-center justify-center text-[9px] font-mono border-t border-stone-200 pt-2 mt-1 flex-wrap">
              {simulationResult.results.map((r, idx) => {
                const colorArr = ["#D97706", "#2563EB", "#059669", "#7C3AED"];
                return (
                  <span key={r.countryId} className="flex items-center gap-1">
                    <span className="w-2.5 h-0.5 rounded-full inline-block" style={{ backgroundColor: colorArr[idx % 4] }}></span>
                    <span>{r.name}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* CORE MATRIX COMPARATIVE TABLE */}
      <div className="bg-white border border-stone-250 shadow-sm rounded-sm">
        <div className="px-5 py-4 border-b border-stone-150 flex justify-between items-center bg-stone-50/70 flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-xs uppercase font-mono text-stone-900">Comparative Simulation Matrix manifold</h3>
            <p className="text-[11px] text-stone-500 font-mono mt-0.5">
              Structured before vs after shock values parsed across primary econometric pillars
            </p>
          </div>
          <span className="text-[10px] font-mono text-stone-500 italic bg-white border border-stone-200 px-3 py-1 rounded">
            All outcomes fully reproducible
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-stone-100 text-stone-700 uppercase text-[9px] border-b border-stone-200 border-t">
              <tr>
                <th className="px-4 py-3 font-semibold">Country Archetype</th>
                <th className="px-4 py-3 font-semibold text-center">Base GSV</th>
                <th className="px-4 py-3 font-semibold text-center">Post GSV</th>
                <th className="px-4 py-3 font-semibold text-center">Base ITC</th>
                <th className="px-4 py-3 font-semibold text-center">Post ITC</th>
                <th className="px-4 py-3 font-semibold font-bold text-center bg-stone-50">Base ARI</th>
                <th className="px-4 py-3 font-semibold font-bold text-center bg-stone-50">Post ARI</th>
                <th className="px-4 py-3 font-semibold text-center">Lock Shift (LIC)</th>
                <th className="px-4 py-3 font-semibold text-right">dARI Shift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {simulationResult.results.map((r) => {
                const isPositive = r.deltaARI >= 0;
                return (
                  <tr key={r.countryId} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-stone-950 font-sans text-sm">
                        {r.name}
                        <span className="text-[9.5px] text-stone-500 font-normal ml-1 font-mono uppercase">({r.incomeGroup})</span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-sans">{r.region}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center text-stone-500">{r.before.gsv.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-center text-stone-900 font-bold">{r.after.gsv.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-center text-stone-500">{r.before.itc.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-center text-stone-900 font-bold">{r.after.itc.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-center bg-stone-50/55">{r.before.ari.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-center bg-stone-50/55 font-extrabold text-stone-900">{r.after.ari.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        r.after.lic < r.before.lic ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-red-100 text-red-900 border border-red-200'
                      }`}>
                        {r.before.lic.toFixed(2)} → {r.after.lic.toFixed(2)}
                      </span>
                    </td>
                    <td className={`px-4 py-3.5 text-right font-extrabold text-xs font-mono select-all ${
                      isPositive ? 'text-emerald-800 bg-emerald-50' : 'text-red-800 bg-red-50'
                    }`}>
                      {isPositive ? '+' : ''}{r.deltaARI.toFixed(4)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECHARTS COMPLIANT REFORM ELASTICITY HEATMAP */}
      <ElasticityHeatmap />

      {/* SENSITIVITY INDICES MATRIX / HEATMAP ROW */}
      <div className="bg-white border border-stone-250 p-5 shadow-xs rounded-xs space-y-4">
        <div>
          <h3 className="font-bold text-xs uppercase font-mono text-stone-950 tracking-wider">
            Sovereign Elasticity Matrix (dARI / dParam)
          </h3>
          <p className="text-[11.5px] text-stone-605 font-sans mt-0.5">
            Perturbative structural index indicating system responsiveness to a controlled <span className="font-mono text-stone-900 font-bold">+0.5</span> enhancement of target parameter. Click cells to inspect localized sensitivity characteristics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Elastic Grid Cells */}
          <div className="lg:col-span-3 overflow-x-auto border border-stone-200 rounded">
            <div className="min-w-[620px]">
              
              {/* Matrix Headings */}
              <div className="grid grid-cols-5 bg-stone-100 text-stone-700 text-center font-mono font-bold text-[9px] py-2 border-b border-stone-250 uppercase">
                <div className="text-left px-3">Structural Vector</div>
                {SampleCountries.map(c => (
                  <div key={c.id}>{c.name}</div>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-stone-200">
                {elasticityMatrix.variables.map((v) => (
                  <div key={v} className="grid grid-cols-5 items-center text-center font-mono py-2 text-xs hover:bg-stone-50/50">
                    <div className="text-left px-3 font-sans font-bold text-stone-700 truncate" title={v}>
                      {v.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    {elasticityMatrix.countries.map((cId) => {
                      const value = elasticityMatrix.values[v][cId];
                      const isFocused = focusedElasticCell && 
                                        focusedElasticCell.variable === v && 
                                        focusedElasticCell.countryId === cId;
                      
                      // Assign color scheme based on elasticity multiplier
                      let colS = "bg-stone-50 text-stone-600 hover:bg-stone-100";
                      if (value >= 0.45) {
                        colS = isFocused 
                          ? "bg-emerald-800 text-white font-extrabold ring-2 ring-emerald-950 ring-offset-1 shadow-sm"
                          : "bg-emerald-600 text-white font-bold hover:bg-emerald-700";
                      } else if (value >= 0.25) {
                        colS = isFocused
                          ? "bg-emerald-400 text-white font-bold ring-2 ring-emerald-600 ring-offset-1 shadow-sm"
                          : "bg-emerald-200 text-emerald-950 font-semibold hover:bg-emerald-250";
                      } else if (value >= 0.10) {
                        colS = isFocused
                          ? "bg-emerald-100 text-emerald-950 font-medium ring-2 ring-emerald-350 shadow-xs"
                          : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100";
                      } else {
                        colS = isFocused
                          ? "bg-stone-300 text-stone-900 border border-stone-400 font-normal ring-1 ring-stone-500 shadow-2xs"
                          : "bg-stone-150 text-stone-700 hover:bg-stone-200";
                      }

                      return (
                        <button
                          key={cId}
                          onClick={() => setFocusedElasticCell({ variable: v, countryId: cId, value })}
                          className={`mx-2 py-2.5 rounded-sm font-bold text-[10.5px] cursor-pointer transition-all duration-150 ${colS}`}
                        >
                          {value.toFixed(3)}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Focused Cell Inspection Area */}
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-sm flex flex-col justify-between space-y-4">
            {activeElasticCellDetails ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] uppercase font-mono text-red-900 font-bold block">
                    Elasticity Inspector Active
                  </span>
                  <h4 className="font-bold text-stone-950 text-sm font-sans mt-1 leading-tight">
                    {activeElasticCellDetails.countryName}
                  </h4>
                  <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                    variable: <span className="text-stone-800 font-bold">{activeElasticCellDetails.variableName}</span>
                  </p>
                </div>

                <div className="space-y-2 text-[11px] font-mono text-stone-700">
                  <div className="flex justify-between border-b border-stone-200 pb-1">
                    <span>Base Param State:</span>
                    <span className="font-bold text-stone-900">{activeElasticCellDetails.baselineVal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-200 pb-1">
                    <span>Perturbed state (+0.5):</span>
                    <span className="font-bold text-stone-900">{activeElasticCellDetails.perturbedVal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-200 pb-1">
                    <span>Base dARI:</span>
                    <span className="font-bold text-stone-900">{activeElasticCellDetails.baselineARI.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-200 pb-1">
                    <span>Perturbed dARI:</span>
                    <span className="font-bold text-stone-955">{activeElasticCellDetails.perturbedARI.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-300 pt-2 font-bold text-xs">
                    <span className="text-stone-950">Sensitivity Rate:</span>
                    <span className="text-emerald-800 font-extrabold text-[12px]">
                      {activeElasticCellDetails.elasticity.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-2 border border-stone-200 rounded text-[9.5px] italic text-stone-605 leading-relaxed font-serif">
                  A unit reform in <span className="font-semibold text-stone-850 lowercase">{activeElasticCellDetails.variableName.replace(/([A-Z])/g, ' $1')}</span> increases overall ARI by <span className="font-bold text-stone-850 font-mono">+{activeElasticCellDetails.elasticity.toFixed(4)}</span> units inside the {activeElasticCellDetails.countryName} environment.
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center py-6 text-stone-400">
                <Info size={28} className="text-stone-300 stroke-1 block mb-2" />
                <p className="text-xs font-mono">Click any sensitivity cell to audit details</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* VIEW 5.2 SSRN AUTHORING ENGINE & DRAFT WORKING PAPER SUITE */}
      <div className="bg-stone-50 border border-stone-300 p-6 shadow-sm rounded-sm space-y-6">
        
        {/* Header Block with metadata controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-200">
          <div className="space-y-1">
            <span className="text-[10px] bg-red-150 text-red-900 border border-red-300 uppercase font-mono px-2 py-0.5 rounded font-extrabold tracking-wider inline-flex items-center gap-1">
              <BookOpen size={11} className="fill-red-900" /> CAD-Authoring Engine v1.0
            </span>
            <h3 className="text-lg font-bold font-mono text-stone-900">
              SSRN Peer-Review Working Paper Sandbox
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans max-w-2xl">
              Construct high-fidelity LaTeX working papers from active macro-economic simulations. Configure author parameters below to dynamically update the manuscript payload.
            </p>
          </div>

          <button
            onClick={handleExportComparativePDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 font-mono text-xs font-bold rounded cursor-pointer transition-colors self-start lg:self-center shrink-0 border border-stone-700"
          >
            <Download size={13} />
            <span>Download PDF Manuscript</span>
          </button>
        </div>

        {/* INPUT METADATA PARAMETERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-stone-200 p-4 rounded-sm">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase">
              Lead Author Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full border border-stone-300 p-2 text-xs font-sans rounded focus:outline-none focus:ring-1 focus:ring-red-800 text-stone-900 font-medium"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase">
              Affiliated Research Institution
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full border border-stone-300 p-2 text-xs font-sans rounded focus:outline-none focus:ring-1 focus:ring-red-800 text-stone-900 font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase">
              Correspondence Email Address
            </label>
            <input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              className="w-full border border-stone-300 p-2 text-xs font-sans rounded focus:outline-none focus:ring-1 focus:ring-red-800 text-stone-900 font-medium"
            />
          </div>
        </div>

        {/* LATEX / MARKDOWN DRAFT PRINTER PANEL */}
        <div className="bg-white border border-stone-250 shadow-xs rounded-sm overflow-hidden grid grid-cols-1 md:grid-cols-4 min-h-[460px]">
          
          {/* Side Tabs Navigation */}
          <div className="bg-stone-100 border-r border-stone-250 p-4 space-y-1.5 text-xs font-mono text-stone-650 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-stone-400 block px-2.5 mb-2 font-mono">
                Manuscript Sections
              </span>
              <button
                onClick={() => setActivePaperTab("abstract")}
                className={`w-full text-left px-3 py-2.5 rounded font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                  activePaperTab === "abstract"
                    ? "bg-stone-900 text-white font-bold"
                    : "hover:bg-stone-200 text-stone-850"
                }`}
              >
                <FileText size={13} />
                <span>1. SSRN Title & Abstract</span>
              </button>
              <button
                onClick={() => setActivePaperTab("intro")}
                className={`w-full text-left px-3 py-2.5 rounded font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                  activePaperTab === "intro"
                    ? "bg-stone-900 text-white font-bold"
                    : "hover:bg-stone-200 text-stone-850"
                }`}
              >
                <FileText size={13} />
                <span>2. Introduction Block</span>
              </button>
              <button
                onClick={() => setActivePaperTab("methodology")}
                className={`w-full text-left px-3 py-2.5 rounded font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                  activePaperTab === "methodology"
                    ? "bg-stone-900 text-white font-bold"
                    : "hover:bg-stone-200 text-stone-850"
                }`}
              >
                <FileText size={13} />
                <span>3. Methodology Section</span>
              </button>
              <button
                onClick={() => setActivePaperTab("empirical")}
                className={`w-full text-left px-3 py-2.5 rounded font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                  activePaperTab === "empirical"
                    ? "bg-stone-900 text-white font-bold"
                    : "hover:bg-stone-200 text-stone-850"
                }`}
              >
                <FileText size={13} />
                <span>4. Econometric Results</span>
              </button>
              <button
                onClick={() => setActivePaperTab("policy")}
                className={`w-full text-left px-3 py-2.5 rounded font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                  activePaperTab === "policy"
                    ? "bg-stone-900 text-white font-bold"
                    : "hover:bg-stone-200 text-stone-850"
                }`}
              >
                <FileText size={13} />
                <span>5. Policy Implications</span>
              </button>
              <button
                onClick={() => setActivePaperTab("latex")}
                className={`w-full text-left px-3 py-2.5 rounded font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                  activePaperTab === "latex"
                    ? "bg-stone-900 text-white font-bold"
                    : "hover:bg-stone-200 text-stone-850"
                }`}
              >
                <Settings size={13} />
                <span>6. LaTeX Model Appendix</span>
              </button>
              <button
                onClick={() => setActivePaperTab("reproducibility")}
                className={`w-full text-left px-3 py-2.5 rounded font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                  activePaperTab === "reproducibility"
                    ? "bg-stone-900 text-white font-bold"
                    : "hover:bg-stone-200 text-stone-850"
                }`}
              >
                <CheckCircle2 size={13} />
                <span>7. Reproducibility Codepack</span>
              </button>
            </div>            <div className="border-t border-stone-200 pt-3 text-[10px] text-stone-500 space-y-1">
              <div>Manuscript Code: v2.2.0-Deterministic</div>
              <div>JEL Codes: <span className="font-bold text-stone-700">{ssrnPaper.metadata.JEL.join(", ")}</span></div>
            </div>
          </div>

          {/* ACTIVE SECTION CONTAINER (LaTex / Manuscript sheets style) */}
          <div className="md:col-span-3 p-6 flex flex-col justify-between space-y-6 relative bg-white">
            
            {/* Elegant page watermark indicator */}
            <div className="absolute right-6 top-6 text-stone-300 select-none pointer-events-none opacity-40 font-mono text-[9px] uppercase font-bold">
              Draft Manuscript // SSRN-CAD-2026 // v2_COMPILED
            </div>

            {/* Title / Header of Draft Section */}
            <div className="space-y-4">
              
              {/* Draft Content Frame */}
              <div className="font-serif text-stone-920 leading-relaxed text-sm antialiased space-y-4">
                
                {/* ABSTRACT TAB */}
                {activePaperTab === "abstract" && (
                  <div className="space-y-4">
                    <div className="text-center font-serif space-y-2 pb-4 border-b border-stone-150">
                      <h4 className="text-base font-bold text-stone-950 max-w-xl mx-auto leading-tight italic">
                        {ssrnPaper.metadata.title}
                      </h4>
                      <p className="text-xs text-stone-800 font-sans font-medium">
                        {ssrnPaper.metadata.author}<sup>1</sup>, {ssrnPaper.metadata.affiliation}
                      </p>
                      <p className="text-[10px] text-stone-500 font-mono">{ssrnPaper.metadata.email}</p>
                    </div>

                    <div className="space-y-2">
                      <span className="font-sans font-extrabold text-[11px] uppercase tracking-wider text-stone-600 block">
                        Abstract:
                      </span>
                      <p className="indent-6 text-justify text-xs leading-relaxed text-stone-800 italic bg-stone-50 p-4 border-l-2 border-stone-300">
                        {ssrnPaper.abstract}
                      </p>
                    </div>

                    <div className="pt-2 text-xs space-y-1">
                      <p><span className="font-sans font-bold text-[10.5px] uppercase text-stone-500 inline-block mr-2">Keywords:</span> <span className="italic">{ssrnPaper.metadata.keywords.join(", ")}</span></p>
                      <p><span className="font-sans font-bold text-[10.5px] uppercase text-stone-500 inline-block mr-2">JEL Classifications:</span> <span className="font-mono font-bold">{ssrnPaper.metadata.JEL.join(", ")}</span></p>
                    </div>
                  </div>
                )}

                {/* INTRODUCTION TAB */}
                {activePaperTab === "intro" && (
                  <div className="space-y-4">
                    <h5 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-150 pb-1">
                      I. Introduction & Systemic Incompleteness Boundaries
                    </h5>
                    {ssrnPaper.introduction.split("\n\n").map((para, pidx) => (
                      <p key={pidx} className="indent-6 text-justify text-xs text-stone-810 leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                )}

                {/* METHODOLOGY TAB */}
                {activePaperTab === "methodology" && (
                  <div className="space-y-4">
                    <h5 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-150 pb-1">
                      II. Simulation Infrastructure and Structural Perturbations
                    </h5>
                    {ssrnPaper.methodology.split("\n\n").map((para, pidx) => (
                      <p key={pidx} className="indent-6 text-justify text-xs text-stone-810 leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                )}

                {/* EMPIRICAL TAB */}
                {activePaperTab === "empirical" && (
                  <div className="space-y-4">
                    <h5 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-150 pb-1">
                      III. Cross-Country Econometric Outcomes Matrix
                    </h5>
                    
                    <p className="text-xs text-stone-700 italic mb-2">
                      Live compiled baseline country matrices across structural pillars:
                    </p>

                    <div className="overflow-x-auto border border-stone-200 rounded">
                      <table className="w-full text-left border-collapse font-sans text-xs">
                        <thead>
                          <tr className="bg-stone-100 font-mono text-[9px] uppercase tracking-wider text-stone-600 border-b border-stone-200">
                            <th className="p-2.5 font-bold">Country Profile</th>
                            <th className="p-2.5">GSV Pillar</th>
                            <th className="p-2.5">ITC Pillar</th>
                            <th className="p-2.5">AFL Pillar</th>
                            <th className="p-2.5">Baseline ARI</th>
                            <th className="p-2.5">Lock Friction (LIC)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-150 text-stone-850">
                          {ssrnPaper.results.map((r, i) => (
                            <tr key={i} className="hover:bg-stone-50">
                              <td className="p-2.5 font-bold text-stone-950 font-mono">{r.country}</td>
                              <td className="p-2.5 font-mono">{r.GSV.toFixed(2)}</td>
                              <td className="p-2.5 font-mono">{r.ITC.toFixed(2)}</td>
                              <td className="p-2.5 font-mono">{r.AFL.toFixed(2)}</td>
                              <td className="p-2.5 font-mono font-bold text-red-900">{r.ARI.toFixed(3)}</td>
                              <td className="p-2.5 font-mono text-stone-550">{r.LIC.toFixed(3)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <h6 className="font-mono font-bold text-[10px] uppercase tracking-wider text-stone-500 mt-4">
                      Marginal Elasticities by Pillar Variable
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
                      {ssrnPaper.elasticitySection.slice(0, 4).map((el, elIdx) => (
                        <div key={elIdx} className="bg-stone-50 p-2.5 border border-stone-200 rounded-sm">
                          <span className="font-mono font-bold text-[10px] text-stone-750 block border-b border-stone-200 pb-1 mb-1.5 label text-left">
                            {el.variable}
                          </span>
                          <div className="space-y-1 font-mono text-[10.5px]">
                            {el.values.map((v, vIdx) => (
                              <div key={vIdx} className="flex justify-between text-stone-600">
                                <span>{v.country}:</span>
                                <span className={`font-bold ${v.elasticity > 0.8 ? "text-emerald-700" : "text-stone-700"}`}>
                                  {v.elasticity.toFixed(4)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

                {/* POLICY IMPLICATIONS TAB */}
                {activePaperTab === "policy" && (
                  <div className="space-y-4">
                    <h5 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-150 pb-1">
                      IV. Administrative Realignment & Policy Implications
                    </h5>
                    
                    <p className="text-xs text-stone-700">
                      Response behaviors and comparative shift profiles under active policy shock constraint:
                    </p>

                    <div className="overflow-x-auto border border-stone-200 rounded">
                      <table className="w-full text-left border-collapse font-sans text-xs">
                        <thead>
                          <tr className="bg-stone-100 font-mono text-[9px] uppercase tracking-wider text-stone-600 border-b border-stone-200">
                            <th className="p-2.5 font-bold">Country Profile</th>
                            <th className="p-2.5">Baseline ARI</th>
                            <th className="p-2.5">Post-Shock ARI</th>
                            <th className="p-2.5">Net Delta dARI</th>
                            <th className="p-2.5">Elasticity Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-150 text-stone-850">
                          {ssrnPaper.policySection.map((p, i) => {
                            const dSign = p.deltaARI >= 0 ? "+" : "";
                            return (
                              <tr key={i} className="hover:bg-stone-50">
                                <td className="p-2.5 font-bold text-stone-950 font-mono">{p.country}</td>
                                <td className="p-2.5 font-mono text-stone-600">{p.beforeARI.toFixed(3)}</td>
                                <td className="p-2.5 font-mono text-stone-900 font-semibold">{p.afterARI.toFixed(3)}</td>
                                <td className={`p-2.5 font-mono font-bold ${p.deltaARI >= 0.5 ? "text-emerald-700" : "text-amber-700"}`}>
                                  {dSign}{p.deltaARI.toFixed(4)}
                                </td>
                                <td className="p-2.5">
                                  <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                                    p.status.includes("High-Yield")
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                      : "bg-stone-100 text-stone-700 border border-stone-250"
                                  }`}>
                                    {p.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs text-stone-800 leading-relaxed text-justify mt-3 italic">
                      <strong>Policy Synthesis Note:</strong> Systems with a lower baseline translation buffer show immediate attenuation of reform shocks. Prior funding must target infrastructural legibility vectors as verified in Section III marginal coefficients.
                    </div>
                  </div>
                )}

                {/* LATEX DOCUMENT CODE APPENDIX */}
                {activePaperTab === "latex" && (
                  <div className="space-y-4">
                    <h5 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-150 pb-1">
                      Mathematical Appendix (Formal LaTeX Payload)
                    </h5>
                    <p className="text-xs text-stone-605">
                      Copy this standard LaTeX block directly into Overleaf, TexStudio, or your peer-review publisher compiler to render high-fidelity equations:
                    </p>
                    
                    <div className="relative bg-stone-900 text-stone-100 p-4 rounded text-xs font-mono overflow-x-auto min-h-[160px] max-h-[300px]">
                      <pre className="whitespace-pre-wrap leading-relaxed select-all">{ssrnPaper.latex}</pre>
                    </div>

                    <div className="border border-stone-200 bg-stone-50 p-4 rounded text-xs font-serif italic text-stone-850">
                      {ssrnPaper.appendix.split("\n\n").map((para, i) => (
                        <p key={i} className="mb-2 last:mb-0">{para}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* REPRODUCIBILITY BLOCK */}
                {activePaperTab === "reproducibility" && (
                  <div className="space-y-4">
                    <h5 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-150 pb-1">
                      Section V. Scientific Replication Specifications
                    </h5>
                    <p className="text-xs text-stone-605">
                      This paper adheres strictly to open-science standards. The simulation state configuration can be loaded securely into any JSON execution loop:
                    </p>
                    
                    <div className="bg-stone-50 border border-stone-200 p-4 rounded text-xs font-mono select-all">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(ssrnPaper.reproducibility, null, 2)}</pre>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* COPY & SHARE CONTROLS FOOTER */}
            <div className="border-t border-stone-200 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-stone-50/50 -m-6 m-t-4 p-5">
              <span className="text-[10.5px] font-mono text-stone-500 italic">
                Active Policy: <strong className="text-stone-800">{selectedShockObj.name}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    let textContent = "";
                    if (activePaperTab === "abstract") textContent = ssrnPaper.abstract;
                    else if (activePaperTab === "intro") textContent = ssrnPaper.introduction;
                    else if (activePaperTab === "methodology") textContent = ssrnPaper.methodology;
                    else if (activePaperTab === "empirical") textContent = JSON.stringify(ssrnPaper.results, null, 2);
                    else if (activePaperTab === "policy") textContent = JSON.stringify(ssrnPaper.policySection, null, 2);
                    else if (activePaperTab === "latex") textContent = ssrnPaper.latex + "\n\n" + ssrnPaper.appendix;
                    else if (activePaperTab === "reproducibility") textContent = JSON.stringify(ssrnPaper.reproducibility, null, 2);
                    
                    handleCopyText(textContent, activePaperTab);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-mono text-xs font-bold rounded cursor-pointer transition-colors"
                >
                  <Copy size={12} />
                  <span>{copiedText === activePaperTab ? "Copied Section!" : "Copy Active Section Code"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

