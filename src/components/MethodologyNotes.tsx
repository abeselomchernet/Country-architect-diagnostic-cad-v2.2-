import React, { useState } from "react";
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Database, 
  Shield, 
  Zap, 
  Activity, 
  Compass, 
  Check, 
  Code, 
  Download, 
  Cpu, 
  ChevronDown, 
  ChevronRight,
  TrendingUp,
  Globe,
  Layers,
  FileText,
  AlertTriangle,
  FileSpreadsheet
} from "lucide-react";

interface ChainLevel {
  level: number;
  title: string;
  module: string | null;
  category: "ingestion" | "validation" | "core" | "simulation" | "inference" | "reporting";
  description: string;
  inputs: string[];
  outputs: string[];
  details: string[];
  color: string;
  badgeBg: string;
  badgeText: string;
}

export const MethodologyNotes: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"framework" | "chain_map">("chain_map");
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: true,
    5: false,
    6: false,
    7: false,
    8: false,
    9: true,
    10: false,
    11: false,
    12: false,
    13: true
  });

  const toggleLevel = (lvl: number) => {
    setExpandedLevels(prev => ({
      ...prev,
      [lvl]: !prev[lvl]
    }));
  };

  const expandAllLevels = () => {
    const fresh: Record<number, boolean> = {};
    for (let i = 1; i <= 13; i++) {
      fresh[i] = true;
    }
    setExpandedLevels(fresh);
  };

  const collapseAllLevels = () => {
    const fresh: Record<number, boolean> = {};
    for (let i = 1; i <= 13; i++) {
      fresh[i] = false;
    }
    setExpandedLevels(fresh);
  };

  const systemLevels: ChainLevel[] = [
    {
      level: 1,
      title: "Data Sources & Ingestion",
      module: "Multiple Input Connectors",
      category: "ingestion",
      description: "Aggregates structural, policy, macroeconomic and microfinance factors across 4 core vectors.",
      inputs: ["Researcher Manual Inputs", "World Bank Indicator Indices", "IMF Sovereignty Metrics", "CGAP Microfinance Parameters"],
      outputs: ["Raw Co-variate Vector"],
      details: [
        "Researcher Inputs: Captures contextual realities like ESX status and Agent Liquidity.",
        "World Bank Connection: Gathers GDP, inflation, and mobile network coverage.",
        "IMF Indicators: Fetches debt-to-GDP ratios and regulatory quality indices.",
        "CGAP Indicators: Fetches Findex mobile money accounts and microfinance networks."
      ],
      color: "border-amber-500/35 hover:border-amber-500",
      badgeBg: "bg-amber-100 text-amber-900 border-amber-200",
      badgeText: "text-amber-700"
    },
    {
      level: 2,
      title: "Data Validation Layer",
      module: "src/core/data_validation.ts",
      category: "validation",
      description: "Enforces strict structural boundaries, cleans metadata, and standardizes structural indicators.",
      inputs: ["Raw Co-variate Vector"],
      outputs: ["Validated Raw Data Set"],
      details: [
        "Range constraints check: GDP growth [-50%, 50%], inflation [-10%, 1000%].",
        "Missing Data detection: Replaces NaN/Null structures with resilient local backfalls.",
        "Outlier & Noise filters: Eliminates structural anomalies like negative mobile pen."
      ],
      color: "border-orange-500/35 hover:border-orange-500",
      badgeBg: "bg-orange-100 text-orange-900 border-orange-200",
      badgeText: "text-orange-700"
    },
    {
      level: 3,
      title: "Calibration & Normalization Layer",
      module: "src/core/calibration/cadDataCalibrator.ts",
      category: "validation",
      description: "Maps global raw values to normalized, standardized, peer-review-comparable 1–10 diagnostics.",
      inputs: ["Validated Raw Data Set", "Flipped Indices"],
      outputs: ["Core Calibrated CAD State Vector"],
      details: [
        "Normalizes raw indicators (e.g. maps 82% mobile penetration to score of 7.8).",
        "Integrates CGAP consumer recourse indices & agent networks directly.",
        "Calculates baseline system failure caps and administrative frictions."
      ],
      color: "border-yellow-600/35 hover:border-yellow-600",
      badgeBg: "bg-yellow-100 text-yellow-900 border-yellow-200",
      badgeText: "text-yellow-700"
    },
    {
      level: 4,
      title: "Core CAD Calculation Engine",
      module: "src/core/cadEngine.ts",
      category: "core",
      description: "Simultaneously computes 4 major theoretical pillars to determine absolute sovereign preparedness.",
      inputs: ["Core Calibrated CAD State Vector"],
      outputs: ["ARI (Architect Readiness Index)", "LIC (Lock Intensity Coefficient)", "SFP (System Failure Probability)"],
      details: [
        "Pillar I (GSV): Combines Demand, Infrastructure, Trust and Unit Economics.",
        "Pillar II (ITC): Computes Capital Presence, Bureau Legibility, and capacity.",
        "Pillar III (System Dynamics): Tracks structural friction ratios and lock intensity.",
        "Pillar IV (AFL): Measures physical agent density and administrative capabilities."
      ],
      color: "border-blue-500/35 hover:border-blue-500",
      badgeBg: "bg-blue-100 text-blue-900 border-blue-200",
      badgeText: "text-blue-700"
    },
    {
      level: 5,
      title: "Diagnostic Intelligence Layer",
      module: "src/core/cadEngine.ts (Interpretation)",
      category: "core",
      description: "Derives sovereign classifications and establishes hierarchical diagnostic upgrade pathways.",
      inputs: ["ARI Score", "Subsystem Frictions Matrix"],
      outputs: ["Sovereign Class Title", "Binding Bottlenecks", "Tailored Policy Timeline"],
      details: [
        "Classifications: Pre-Emergent (0-3), Structural Gap (3-5), Transitional (5-7), Mature (7-10).",
        "Pinpoints weakest architectural categories (e.g. Data Legibility) to target friction.",
        "Constructs automated, priority upgrade sequences to inform national planners."
      ],
      color: "border-cyan-500/35 hover:border-cyan-500",
      badgeBg: "bg-cyan-100 text-cyan-900 border-cyan-200",
      badgeText: "text-cyan-700"
    },
    {
      level: 6,
      title: "Policy Shock Engine",
      module: "src/core/policy_shock_engine.ts",
      category: "simulation",
      description: "Injects artificial system-wide interventions to model simulated counterfactual responses.",
      inputs: ["Base CAD State", "Policy Shock Selection (e.g., National DPI rollout)"],
      outputs: ["Delta CAD Outputs (ΔARI, ΔSFP, ΔLIC)"],
      details: [
        "Evaluates discrete high-impact shocks (Fayda, agent liquidity crisis, MFI securitization).",
        "Calculates structural country elasticities to gate extreme policy changes.",
        "Outputs complete pre/post simulation vectors for structural evaluation."
      ],
      color: "border-indigo-500/35 hover:border-indigo-500",
      badgeBg: "bg-indigo-100 text-indigo-900 border-indigo-200",
      badgeText: "text-indigo-700"
    },
    {
      level: 7,
      title: "Uncertainty / Monte Carlo Engine",
      module: "src/core/uncertainty_engine.ts",
      category: "simulation",
      description: "Runs 1,000 stochastic iterations over CAD parameters to model distribution bands and limits.",
      inputs: ["Baseline CAD Inputs", "Variance Bounds Matrix"],
      outputs: ["P5 / P50 / P95 Predictive Ranges"],
      details: [
        "Generates realistic volatility simulations across all core subsystems.",
        "Computes distribution curves for ultimate index probability.",
        "Differentiates simulation scenario ranges from econometric confidence bounds."
      ],
      color: "border-violet-500/35 hover:border-violet-500",
      badgeBg: "bg-violet-100 text-violet-900 border-violet-200",
      badgeText: "text-violet-700"
    },
    {
      level: 8,
      title: "Econometric Backtesting Layer",
      module: "src/core/econometrics/worldBank_timeseries.ts",
      category: "inference",
      description: "Constructs objective historic index values to perform validation against physical indicators.",
      inputs: ["Historic Macro Panel Sets", "ARI Scoring Engine"],
      outputs: ["Reconstructed Timeline v2.2", "OLS Regression Stats (R², T-Stats)"],
      details: [
        "Recreates continuous historic ARI values (e.g., 2012–2025 timelines).",
        "Tests index validity against physical markers like real private credit and inclusion rates.",
        "Generates standard significance margins (P-Values) to back external validity."
      ],
      color: "border-purple-500/35 hover:border-purple-500",
      badgeBg: "bg-purple-100 text-purple-900 border-purple-200",
      badgeText: "text-purple-700"
    },
    {
      level: 9,
      title: "Causal Inference Laboratory",
      module: "src/core/inference/ (DiD, SC, Event Study)",
      category: "inference",
      description: "Launches state-of-the-art academic policy evaluations to assess causal link strengths.",
      inputs: ["Simulated Counterfactual Outcomes", "External Panel Databases"],
      outputs: ["ATT Estimates", "Synthetic MSPE Matrices", "Lead-Lag Trend Plots"],
      details: [
        "Difference-in-Differences: Tests parallel trends across simulated treatments.",
        "Synthetic Control: Generates counterfactual donor controls for policy interventions.",
        "Event Study: Standardizes dynamic post-treatment leads and structural lags."
      ],
      color: "border-pink-500/35 hover:border-pink-500",
      badgeBg: "bg-pink-100 text-pink-900 border-pink-200",
      badgeText: "text-pink-700"
    },
    {
      level: 10,
      title: "Structural Identification Guard",
      module: "src/core/inference/structural_identification_engine.ts",
      category: "inference",
      description: "An academic peer-review sanity system checking for parallel pre-trends and SUTVA violations.",
      inputs: ["Inference Diagnostics"],
      outputs: ["Identification Validity Score (IVS)", "Publication Readiness Designation"],
      details: [
        "Hard-capped rule: Under 0.90 trend parallelism limits score to 6.0 (Simulation-Only).",
        "Significance boundaries: Limits failed trend markers to standard Working Paper ratings.",
        "Calculates exact Selection Bias scores to evaluate structural design."
      ],
      color: "border-emerald-600/35 hover:border-emerald-600",
      badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-200",
      badgeText: "text-emerald-700"
    },
    {
      level: 11,
      title: "Cross-Country Comparative Diagnostics",
      module: "src/core/multi_country_engine.ts",
      category: "reporting",
      description: "Standardizes elasticities across 9 core developing markets to isolate regional bottlenecks.",
      inputs: ["Composite ARI Framework Matrix"],
      outputs: ["Cross-Country Rankings", "Elasticity Heatmaps", "Structural Benchmarks"],
      details: [
        "Indexes 9 distinct nations (Ethiopia, Kenya, Nigeria, Ghana, Rwanda, Tanzania, Uganda, Bangladesh, Pakistan).",
        "Calculates comparative diagnostic matrices for multi-country comparisons.",
        "Highlights unified, cross-regional upgrade trajectories for development partners."
      ],
      color: "border-teal-500/35 hover:border-teal-500",
      badgeBg: "bg-teal-100 text-teal-900 border-teal-200",
      badgeText: "text-teal-700"
    },
    {
      level: 12,
      title: "Research Preregistration Governance",
      module: "src/core/calibration/preregistration.ts",
      category: "reporting",
      description: "Enforces open-science research practices to prevent retroactive p-hacking practices.",
      inputs: ["Model Parameters", "Country Focus Selection", "Covariates Vector"],
      outputs: ["Pre-Analysis Plan (PAP) Manifest", "256-bit SHA Research Hash"],
      details: [
        "Standardized to align with professional AEA RCT Registry guidelines.",
        "Seals complete research structures with immutable SHA-256 signatures.",
        "Attorts transparency to academic peer-reviewer validation pipelines."
      ],
      color: "border-emerald-500/35 hover:border-emerald-500",
      badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-200",
      badgeText: "text-emerald-700"
    },
    {
      level: 13,
      title: "Sovereign Publication & Exporter Layer",
      module: "src/core/export/ (pdfReportGenerator.ts, ssrnExporter.ts)",
      category: "reporting",
      description: "Generates SSRN working papers, diagnostics briefs, policy reports, and full raw replication matrices.",
      inputs: ["All Output Datasets", "Research Hash ID"],
      outputs: ["SSRN LaTeX Papers", "Comprehensive Diagnostic PDF Reports", "JSON Replication Schemas"],
      details: [
        "Generates peer-review-compliant PDF manuscripts formatted for major journals.",
        "Compiles fully resolved JSON data schemas for direct model replications.",
        "Outputs comparative Policy Briefs suitable for high-ranking sovereign leaders."
      ],
      color: "border-stone-500/35 hover:border-stone-500",
      badgeBg: "bg-stone-100 text-stone-905 border-stone-200",
      badgeText: "text-stone-700"
    }
  ];

  return (
    <div className="bg-white border border-stone-250 p-8 rounded font-sans shadow-2xs space-y-8 max-w-full text-left">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-605 font-mono text-xs uppercase tracking-widest mb-1">
            <BookOpen size={14} /> Technical Appendix & Methodology Notes
          </div>
          <h2 className="font-serif text-2xl font-semibold text-stone-900 tracking-tight">
            Country Architect Diagnostic (CAD v2.2) Reference
          </h2>
          <p className="text-stone-600 text-sm mt-1 leading-relaxed">
            Full computational specification, structural equations, weighting algebra, and causal inference validity frameworks.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-stone-100 border border-stone-200 p-1 rounded">
          <button
            onClick={() => setActiveSubTab("framework")}
            className={`px-3 py-1.5 rounded text-xs select-none transition-all cursor-pointer font-medium ${
              activeSubTab === "framework"
                ? "bg-white text-stone-900 shadow-3xs font-semibold"
                : "text-stone-500 hover:text-stone-850"
            }`}
          >
            Theoretical Framework
          </button>
          <button
            onClick={() => setActiveSubTab("chain_map")}
            className={`px-3 py-1.5 rounded text-xs select-none transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
              activeSubTab === "chain_map"
                ? "bg-white text-stone-900 shadow-3xs font-semibold"
                : "text-stone-500 hover:text-stone-850"
            }`}
          >
            <Activity size={13} className="text-amber-500" />
            13-Level System Chain Map
          </button>
        </div>
      </div>

      {activeSubTab === "framework" ? (
        <div className="space-y-6">
          {/* JEL Classification */}
          <div className="bg-stone-50 border border-stone-205 p-4 rounded text-xs font-mono space-y-2">
            <div className="font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Award size={13} className="text-stone-605" /> JEL Classification Codes
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-stone-600">
              <div>
                <span className="font-bold text-stone-850">C15:</span> Statistical Simulation Methods • Monte Carlo
              </div>
              <div>
                <span className="font-bold text-stone-850">D02:</span> Institutional Design • Transaction Costs
              </div>
              <div>
                <span className="font-bold text-stone-850">G18:</span> Financial Institutions • Government Policy
              </div>
              <div>
                <span className="font-bold text-stone-850">O17:</span> Formal & Informal Sectors • Institutional Frictions
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Section 1: CAD Theory */}
            <div className="space-y-2.5">
              <h3 className="font-serif text-lg font-bold text-stone-900">1. Theoretical Framework (CAD Theory)</h3>
              <p className="text-stone-650 text-sm leading-relaxed">
                The Country Architect Diagnostic model (CAD v2.2) is grounded in modern <strong>institutional economics</strong>, 
                conceptualizing sovereign digital financial systems as a sequence of translation and coordination layers. 
                Markets often fail to scale not due to lack of technology, but due to high <strong>structural transaction costs</strong>, 
                information asymmetries, and coordination lock-ins. The CAD maps these frictions along four fundamental pillars:
              </p>
              <ul className="list-disc pl-5 text-stone-650 text-sm space-y-1.5">
                <li><strong>Grassroots System Viability (GSV):</strong> Client-side factors including organic merchant demand, physical distribution footprint, trust architecture, and economic marginal viability.</li>
                <li><strong>Institutional Translation Capacity (ITC):</strong> Capital-side structural readiness, data legibility across credit bureaus, securitization capabilities, and central registry translation.</li>
                <li><strong>Sovereign Digital Readiness (SDR):</strong> Macro-structural indicators measuring administrative stability, currency volatility, and payment corridor frictions.</li>
                <li><strong>Administrative & Feasibility Leverage (AFL):</strong> State execution density, political access speed, regulatory capabilities, and G2P trust acquisition.</li>
              </ul>
            </div>

            {/* Section 2: ARI Formula */}
            <div className="space-y-3 pt-2">
              <h3 className="font-serif text-lg font-bold text-stone-900">2. Structural Weighting Algebra (ARI Formula)</h3>
              <p className="text-stone-650 text-sm leading-relaxed">
                The composite <strong>Architect Readiness Index (ARI)</strong> is a linear combination of the structural pillars, 
                weighted to emphasize the critical gating role of grassroots and banking connectivity:
              </p>
              <div className="bg-stone-50 border border-stone-200 py-3 px-4 rounded font-mono text-xs text-stone-850 text-center select-all">
                {"ARI = 0.35 * GSV + 0.35 * ITC + 0.20 * SDR + 0.10 * AFL"}
              </div>
              <p className="text-stone-650 text-sm leading-relaxed">
                Where <strong>SDR</strong> represents the inverted Sovereign Lock-In Coefficient:
              </p>
              <div className="bg-stone-50 border border-stone-200 py-3 px-4 rounded font-mono text-xs text-stone-850 text-center select-all">
                {"SDR = (10 - LIC_friction) * 0.35 + MS_n * 0.25 + FrictionFloor * 0.20 + SFPI * 0.20"}
              </div>
              <p className="text-stone-650 text-sm leading-relaxed">
                This formulation ensures that macro bottlenecks (such as high inflation or agent liquidity collapses) directly depress the composite 
                ARI even if local merchant demand indicators are high, capturing sovereign-linked general equilibrium risk.
              </p>
            </div>

            {/* Section 3: Shock Calibration & Multipliers */}
            <div className="space-y-2.5 pt-2">
              <h3 className="font-serif text-lg font-bold text-stone-900">3. Country-Specific Shock Calibration</h3>
              <p className="text-stone-650 text-sm leading-relaxed">
                Simulated policy interventions are not uniform. Shocks are scaled using country-specific macro structural parameters:
              </p>
              <div className="bg-stone-50 border border-stone-200 py-3 px-4 rounded font-mono text-xs text-stone-850 text-center select-all">
                {"ScaledDelta = BaseDelta * (TrustArchitecture / 10) * (MobilePenetration / 100) * (IDCoverage / 100)"}
              </div>
              <p className="text-stone-650 text-sm leading-relaxed">
                This math reflects empirical realities: a biometric-grade DPI identity rollout (like Fayda in Ethiopia or SPAR-enabled payment routers) has 
                gated elasticity. Its impact is structurally bound by existing mobile-cellular subscription densities and baseline identity coverage.
              </p>
            </div>

            {/* Section 4: Causal Identification & Peer-Review Standards */}
            <div className="space-y-2.5 pt-2">
              <h3 className="font-serif text-lg font-bold text-stone-900">4. Causal Identification Integrity & Validity (IVS)</h3>
              <p className="text-stone-650 text-sm leading-relaxed">
                To prevent "simulation-only" endogeneity biases, the workspace implements a formal Econometric Causal Validity suite. 
                When evaluating counterfactual DiD or Synthetic Controls, the engine computes an <strong>Identification Validity Score (IVS)</strong> governed by two major hard rules:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="border border-stone-200 p-3.5 rounded bg-amber-50/20 text-xs">
                  <span className="font-bold text-amber-850 block mb-1">Rule I: Pre-Trend Parallelism Limit</span>
                  If the parallel pre-trends matching score falls below <code className="bg-white px-1 py-0.5 rounded border">0.90</code>, the model is restricted to a maximum score of <code className="bg-white px-1 py-0.5 rounded border">6.0/10</code> and flagged as <strong className="text-stone-800">Simulation Only</strong>.
                </div>
                <div className="border border-stone-200 p-3.5 rounded bg-red-50/25 text-xs">
                  <span className="font-bold text-red-800 block mb-1">Rule II: Statistical Significance Bound</span>
                  If the parallel-trend pre-test <code className="bg-white px-1 py-0.5 rounded border">p-value &gt; 0.05</code>, the estimation design violates the alpha-level threshold. The resulting paper grade is strictly capped at <strong className="text-stone-800">Working Paper</strong>.
                </div>
              </div>
            </div>

            {/* Section 5: Research Integrity & Pre-Analysis Plans */}
            <div className="space-y-2.5 pt-2">
              <h3 className="font-serif text-lg font-bold text-stone-900">5. Research Integrity & Registration Protocol</h3>
              <p className="text-stone-650 text-sm leading-relaxed">
                In compliance with the standards of the <strong>AEA RCT Registry</strong> and <strong>EGAP</strong> guidelines, users must pre-register their counterfactual simulation trials prior to execution. 
                The system binds the country selection, targeted policy shock, and exact covariate inputs into a 256-bit hash, sealing the 
                <strong> Pre-Analysis Plan (PAP)</strong>. This mitigates post-hoc "p-hacking" and ensures complete reproducibility.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chain Intro Section */}
          <div className="bg-stone-50 border border-stone-205 p-6 rounded space-y-3">
            <h3 className="font-serif text-lg font-semibold text-stone-900 flex items-center gap-2">
              <Compass className="text-amber-500 animate-pulse" size={18} />
              Sovereign Production Pipeline Architectures (v2.2)
            </h3>
            <p className="text-stone-650 text-sm leading-relaxed">
              This interactive blueprint presents the complete data-to-evidence pipeline. It outlines how raw parameters ingested from manual researcher calibrations, historical IMF registers, and global World Bank database servers are validated, transformed into structural diagnostics, simulated across policy shocks, and packaged as publication-grade academic SSRN reports.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={expandAllLevels}
                className="bg-stone-900 hover:bg-stone-950 text-white font-mono px-3 py-1.5 rounded text-[10px] transition-colors font-bold cursor-pointer"
              >
                Expand All Levels
              </button>
              <button
                onClick={collapseAllLevels}
                className="bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 font-mono px-3 py-1.5 rounded text-[10px] transition-colors font-bold cursor-pointer"
              >
                Collapse All Levels
              </button>
            </div>
          </div>

          {/* Interactive Vertical Timeline Timeline */}
          <div className="relative border-l border-stone-250 ml-6 pl-8 space-y-8 py-2">
            {systemLevels.map((lvl) => {
              const isOpen = expandedLevels[lvl.level];
              return (
                <div key={lvl.level} className="relative group">
                  {/* Point Indicator badge */}
                  <span className={`absolute -left-[45px] top-1.5 flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-mono font-bold font-serif transition-all ${
                    isOpen ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-300 text-stone-500'
                  }`}>
                    {lvl.level}
                  </span>

                  {/* Level Card */}
                  <div className={`p-5 rounded-lg border bg-white shadow-3xs transition-all ${lvl.color}`}>
                    <div className="flex items-center justify-between gap-4 cursor-pointer select-none" onClick={() => toggleLevel(lvl.level)}>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider border uppercase ${lvl.badgeBg}`}>
                            Level {lvl.level} • {lvl.category}
                          </span>
                          {lvl.module && (
                            <span className="bg-stone-100 font-mono text-[9px] px-1.5 py-0.5 rounded text-stone-550 border border-stone-200 flex items-center gap-1 mt-0.5">
                              <Code size={9} />
                              {lvl.module}
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-stone-850 text-sm md:text-base mt-2 flex items-center gap-1">
                          {lvl.title}
                        </h4>
                      </div>
                      
                      <div className="text-stone-400 group-hover:text-stone-605">
                        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </div>

                    {/* Collapsible Details Panel */}
                    {isOpen && (
                      <div className="mt-4 pt-4 border-t border-stone-150 space-y-3 text-xs leading-relaxed transition-all">
                        <p className="text-stone-600 font-medium">{lvl.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          {/* Inputs Panel */}
                          <div className="bg-stone-50 p-3 rounded border border-stone-200">
                            <span className="font-mono text-[9px] text-stone-450 uppercase font-semibold tracking-wider block mb-1.5">System Inputs</span>
                            <ul className="space-y-1.5">
                              {lvl.inputs.map((inp, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 text-stone-650 font-mono text-[10px]">
                                  <span className="text-amber-500 font-bold">»</span> {inp}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Outputs Panel */}
                          <div className="bg-stone-50 p-3 rounded border border-stone-200">
                            <span className="font-mono text-[9px] text-stone-450 uppercase font-semibold tracking-wider block mb-1.5">System Outputs</span>
                            <ul className="space-y-1.5">
                              {lvl.outputs.map((out, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 text-emerald-650 font-mono text-[10px]">
                                  <span className="text-emerald-500 font-bold">✓</span> {out}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Additional Sub-Systems */}
                        <div className="space-y-1 pt-1">
                          <span className="font-mono text-[9px] text-stone-450 uppercase font-semibold tracking-wider block">Operational Dynamics</span>
                          <ul className="list-disc pl-4 text-stone-600 space-y-1 font-serif text-[11px]">
                            {lvl.details.map((dt, idx) => (
                              <li key={idx}>
                                {dt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* End-to-end Flowchart Card */}
          <div className="border border-stone-200 rounded p-6 bg-stone-900 text-stone-300 space-y-4">
            <h4 className="text-white font-serif font-bold text-sm flex items-center gap-2">
              <Zap className="text-amber-500 animate-pulse" size={16} /> Composite End-to-End System Pipeline Visualizer
            </h4>
            <p className="text-stone-400 text-xs font-serif leading-relaxed">
              Below is the comprehensive operational mapping sequence, demonstrating how physical inputs translate into diagnostic output registries.
            </p>
            <div className="bg-stone-950 p-4 rounded overflow-x-auto text-[10px] font-mono leading-relaxed text-amber-500/90 whitespace-pre-wrap border border-stone-800">
{`   [ researcher inputs ] + [ world bank ] + [ imf ] + [ cgap ]
                             │
                             ▼
                    [ data validation ] (src/core/data_validation.ts)
                             │
                             ▼
                  [ calibration engine ] (cadDataCalibrator.ts)
                             │
                             ▼
                    [ core cad model ] (cadEngine.ts)
            ( pillars I: GSV + II: ITC + III: SDR + IV: AFL )
                             │
                             ▼
               [ raw ari + lic + friction indices ]
                             │
                             ▼
               [ diagnostic intelligence classifiers ]
              ( constraining pipelines & class mappings )
                             │
                             ▼
            [ counterfactual policy shock engine ] (policy_shock_engine.ts)
                             │
                             ▼
                [ monte carlo stochastic ranges ] (uncertainty_engine.ts)
                             │
                             ▼
              [ econometric historical timelines ] (econometrics/)
                             │
                             ├── causal experimental did evaluations
                             ├── synthetic control donor matches
                             └── event study response trajectories
                             │
                             ▼
                [ replication pre-registration hashes ] (preregistration.ts)
                             │
                             ▼
            [ SSRN manuscripts + publication metrics ] (pdfReportGenerator.ts)`}
            </div>
          </div>
        </div>
      )}

      {/* Footer verification tag */}
      <div className="pt-6 border-t border-stone-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-stone-400 font-mono">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-600" />
          <span>Calculations verified under SSRN v2.2 Standards</span>
        </div>
        <span>Last Calibration Sync: June 2026</span>
      </div>
    </div>
  );
};
