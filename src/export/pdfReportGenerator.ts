import { jsPDF } from "jspdf";
import { CADInput, CADEngine, CADResult } from "../core/cadEngine";
import { PolicyShocks } from "../core/policy_shock_engine";
import { IdentificationReport, StructuralIdentificationEngine } from "../core/structural_identification_engine";
import { MonteCarloSimulationResult, UncertaintyEngine } from "../core/uncertainty_engine";

export interface PDFReportOptions {
  title?: string;
  author?: string;
  affiliation?: string;
  email?: string;
  countryCode: string;
  activePresetName: string;
  activeShockId: string;
  input: CADInput;
  result: CADResult;
  idReport?: IdentificationReport;
  mcResult?: MonteCarloSimulationResult;
}

export class PDFReportGenerator {
  static generate(options: PDFReportOptions): jsPDF {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let currentY = 25;

    // Grid details
    const primaryColor = [27, 38, 59]; // Dark Navy slate theme
    const secondaryColor = [119, 141, 169]; // Neutral slate
    const accentColor = [141, 8, 8]; // Deep Harvard red

    // Helpers
    const writeHeader = (title: string, size = 12, style = "bold", color = primaryColor) => {
      doc.setFont("times", style);
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      const titleLines = doc.splitTextToSize(title, contentWidth);
      doc.text(titleLines, margin, currentY);
      currentY += titleLines.length * (size * 0.45) + 4;
    };

    const writeParagraph = (text: string, size = 9.5, align: "left" | "justify" = "justify", lineHeight = 4.5) => {
      doc.setFont("times", "normal");
      doc.setFontSize(size);
      doc.setTextColor(60, 64, 67);
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, currentY, { align: align === "justify" ? "justify" : "left" });
      currentY += lines.length * lineHeight + 2.5;
    };

    const drawLine = (color = secondaryColor, width = 0.2) => {
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(width);
      doc.line(margin, currentY, margin + contentWidth, currentY);
      currentY += 5;
    };

    const performPageBreak = (subtitle: string) => {
      doc.addPage();
      currentY = 25;

      // Page Header
      doc.setFont("times", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(130, 130, 130);
      doc.text(`CAD v2.2 Sovereign System Diagnostics Portfolio — ${subtitle}`, margin, 15);
      doc.setDrawColor(210, 210, 215);
      doc.setLineWidth(0.15);
      doc.line(margin, 17, margin + contentWidth, 17);
    };

    // ==========================================
    // PAGE 1: DOSSIER COVER & STATEMENT
    // ==========================================
    doc.setFont("times", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(110, 110, 115);
    doc.text("COUNTRY ARCHITECT SYSTEMS RESEARCH LAB — DECISION DOSSIER EXPORT", margin, 15);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, 17, margin + contentWidth, 17);

    writeHeader(
      options.title ?? `Sovereign System Readiness and Intervention Sensitivity diagnostics: ${options.countryCode} Analysis Portfolio`,
      13.5,
      "bold",
      primaryColor
    );

    currentY += 2;
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(options.author ?? "Abeselom Girum Chernet", margin, currentY);
    currentY += 5;

    doc.setFont("times", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    const metadata = [
      `Affiliated Institution: ${options.affiliation ?? "Comparative Systems & Policy Economics Directorate"}`,
      `Lead Architect Correspondence: ${options.email ?? "abeselomgirum@gmail.com"}`,
      `Simulated Sovereign Boundary: ${options.countryCode} Representative Profile`,
      `Baseline Parameters Configured: ${options.activePresetName} Workspace Baseline`,
      `Intervention Strategy Simulated: ${PolicyShocks[options.activeShockId]?.name || "Stable Monitoring"}`,
      `Analytical Run Timestamp: ${new Date().toISOString().slice(0, 10)} (System Coordinated Universal Time)`,
    ];
    metadata.forEach((line) => {
      doc.text(line, margin, currentY);
      currentY += 4.2;
    });

    currentY += 4;
    drawLine(accentColor, 0.45); // Deep Accent Line

    // Context Statement Panel Box
    doc.setFillColor(248, 248, 250);
    doc.rect(margin, currentY, contentWidth, 42, "F");

    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text("EXECUTIVE POLICY BRIEF", margin + 5, currentY + 6);

    const execBriefText = 
      "This sovereign evaluation portfolio details the structural vulnerabilities, localized friction surfaces, and micro-transaction delivery failures inherent in the active country profile. Utilizing the Country Architect Diagnostic (CAD v2.2) model, we map empirical validation metrics against baseline institutional parameters to determine the transmission elasticity of target interventions. Sections detail the deterministic calibration results, Monte Carlo uncertainty bounds, and causal exogeneity tests required to uphold JEL publication standards for peer-reviewed working papers.";
    doc.setFont("times", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(40, 40, 45);
    const splitBrief = doc.splitTextToSize(execBriefText, contentWidth - 10);
    doc.text(splitBrief, margin + 5, currentY + 11.5, { align: "justify" });
    currentY += 47;

    writeHeader("1. Analytical Setup and Paradigm Framework", 10.5, "bold");
    const p1 = 
      "Evaluating sovereign transaction layers in emerging economies demands a structural framework that couples localized grassroots viability with public institutional coordination capacity. The core of the Country Architect Diagnostic is the formulation of the overall Architect Readiness Index (ARI) as a combined metric reflecting payment recipient demand, delivery failures, clearing economics, and regulatory exogeneity controls. The simulation outcomes below represent a mathematical snapshot of the system state.";
    writeParagraph(p1, 9.2, "justify", 4.2);

    // ==========================================
    // PAGE 2: CORE ESTIMATES AND SYSTEM DECOMPOSITION
    // ==========================================
    performPageBreak("Deterministic Base Estimates");

    writeHeader("2. Deterministic Validation and System Decomposition", 11, "bold");
    writeParagraph(
      "The following indices represent the calibrated structural components extracted from the primary sandbox environment. Deltas represent simulated gains resulting from the active policy shock.",
      9.5,
      "justify",
      4.2
    );

    currentY += 2;

    // Structure of results
    const beforeResult = options.result;
    const shockObj = PolicyShocks[options.activeShockId];
    let afterInput = { ...options.input };
    if (shockObj) {
      afterInput = shockObj.apply({ ...options.input });
    }
    const afterResult = CADEngine.compute(afterInput);

    // Table Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, currentY, contentWidth, 8, "F");

    doc.setFont("times", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("Economics / Structural Dimension", margin + 4, currentY + 5.5);
    doc.text("Pre-Shock Base", margin + 65, currentY + 5.5);
    doc.text("Post-Shock Simulated", margin + 105, currentY + 5.5);
    doc.text("Net Delta Shift", margin + 145, currentY + 5.5);

    currentY += 8;

    const decompRow = [
      { name: "Grassroots System Viability (GSV)", base: beforeResult.gsv, post: afterResult.gsv },
      { name: "Institutional Translation Capacity (ITC)", base: beforeResult.itc, post: afterResult.itc },
      { name: "System Dynamics Resiliency (SDR)", base: beforeResult.sdr, post: afterResult.sdr },
      { name: "Architect Feasibility Layer (AFL)", base: beforeResult.afl, post: afterResult.afl },
      { name: "Symmetrical Lock Intensity Index (LIC)", base: beforeResult.lic, post: afterResult.lic },
      { name: "Architect Readiness Index (ARI)", base: beforeResult.ari, post: afterResult.ari },
    ];

    decompRow.forEach((row, i) => {
      const bg = i % 2 === 1 ? [247, 248, 250] : [255, 255, 255];
      doc.setFillColor(bg[0], bg[1], bg[2]);
      doc.rect(margin, currentY, contentWidth, 7, "F");

      doc.setFont("times", "normal");
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text(row.name, margin + 4, currentY + 4.5);

      doc.setFont("courier", "normal");
      doc.text(row.base.toFixed(3), margin + 65, currentY + 4.5);
      doc.text(row.post.toFixed(3), margin + 105, currentY + 4.5);

      const delta = row.post - row.base;
      const sign = delta >= 0 ? "+" : "";
      const dColor = delta > 0 ? [10, 110, 80] : delta < 0 ? [180, 20, 20] : [80, 80, 80];
      doc.setTextColor(dColor[0], dColor[1], dColor[2]);
      doc.setFont("courier", "bold");
      doc.text(`${sign}${delta.toFixed(3)}`, margin + 145, currentY + 4.5);

      currentY += 7;
    });

    currentY += 5;

    // Callout on binding constraints
    doc.setFillColor(243, 244, 246);
    doc.setDrawColor(209, 213, 219);
    doc.rect(margin, currentY, contentWidth, 24, "FD");

    doc.setFont("times", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text("DECISION-GRADE DIAGNOSTIC IDENTIFICATION", margin + 4, currentY + 5);

    doc.setFont("times", "normal");
    doc.setFontSize(8);
    doc.text(`Active Binding Constraint:  ${afterResult.bindingConstraint.toUpperCase()}`, margin + 4, currentY + 10);
    doc.text(`Estimated System Profile:   ${afterResult.classification.toUpperCase()}`, margin + 4, currentY + 14);
    doc.text(`Forecasted Failure Risk:    ${afterResult.systemFailureProbability.toFixed(1)}% at localized agent density hubs`, margin + 4, currentY + 18);

    currentY += 30;

    writeHeader("3. Policy Shock Context and Intervention Mechanics", 10.5, "bold");
    const shockDesc = shockObj 
      ? `The simulated reform leverages "${shockObj.name}". Policy mechanism summary: ${shockObj.description}`
      : "No active counterfactual adjustments or external shocks applied to this baseline model runs.";
    writeParagraph(shockDesc, 9.2, "justify", 4.2);

    // ==========================================
    // PAGE 3: UNCERTAINTY & MONTE CARLO BANDS
    // ==========================================
    performPageBreak("Monte Carlo Simulation Analysis");

    writeHeader("4. Exogeneous Uncertainty Mapping and Stress Benchmarks", 11, "bold");
    writeParagraph(
      "To verify that parameter gains stand up to unobserved shocks, an interactive 1,000-sample randomized Monte Carlo algorithm was run on the host country profile. Noise factor models scale system variance to evaluate predicted confidence boundaries.",
      9.5,
      "justify",
      4.2
    );

    const mc = options.mcResult ?? UncertaintyEngine.runMonteCarlo(options.input, shockObj || { id: "none", name: "none", description: "None", apply: (st) => st });

    doc.setFillColor(252, 252, 253);
    doc.setDrawColor(220, 220, 225);
    doc.rect(margin, currentY, contentWidth, 40, "FD");

    doc.setFont("times", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 40);
    doc.text("MONTE CARLO PREDICTION BANDS (1,000 SAMPLINGS)", margin + 5, currentY + 6);

    doc.setFont("times", "normal");
    doc.setFontSize(8);
    doc.text(`Deterministic Baseline: ${mc.beforeDeterministic.toFixed(4)}`, margin + 5, currentY + 12);
    doc.text(`Deterministic Forecasted: ${mc.afterDeterministic.toFixed(4)}`, margin + 5, currentY + 16);

    doc.setFont("times", "bold");
    doc.text("Pre-Shock Confidence Intervals:", margin + 5, currentY + 22);
    doc.setFont("courier", "bold");
    doc.text(`[5th Perc: ${mc.simulatedBandsBefore.p5.toFixed(3)}  |  Median: ${mc.simulatedBandsBefore.p50.toFixed(3)}  |  95th Perc: ${mc.simulatedBandsBefore.p95.toFixed(3)}]`, margin + 5, currentY + 26);

    doc.setFont("times", "bold");
    doc.text("Post-Shock Confidence Intervals:", margin + 5, currentY + 31);
    doc.setFont("courier", "bold");
    doc.text(`[5th Perc: ${mc.simulatedBandsAfter.p5.toFixed(3)}  |  Median: ${mc.simulatedBandsAfter.p50.toFixed(3)}  |  95th Perc: ${mc.simulatedBandsAfter.p95.toFixed(3)}]`, margin + 5, currentY + 35);

    currentY += 46;

    writeHeader("5. Causal Identification Integrity Checking", 10.5, "bold");
    writeParagraph(
      "Our system evaluates causal exogeneity to identify threats like SUTVA leakage, selection endogeneity, or unstable lead-lag indicators. An identification report has been generated below to verify publication grade.",
      9.5,
      "justify",
      4.2
    );

    const idRep = options.idReport ?? StructuralIdentificationEngine.evaluateFromContext(options.activeShockId, options.countryCode);

    doc.setFillColor(248, 246, 241);
    doc.setDrawColor(210, 205, 195);
    doc.rect(margin, currentY, contentWidth, 44, "FD");

    doc.setFont("times", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(50, 40, 20);
    doc.text("ACADEMIC PEER-REVIEW ETHICAL AUDIT", margin + 5, currentY + 6);

    doc.setFont("times", "normal");
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text(`Pre-Trend Parallelism Index: ${idRep.parallelTrends.toFixed(2)} (JPE standard threshold: 0.90)`, margin + 5, currentY + 12);
    doc.text(`SUTVA Spillover Risk Coefficient: ${idRep.sutvaRisk.toFixed(2)} (Friction Leakage Factor)`, margin + 5, currentY + 17);
    doc.text(`Exogenous Selection Probability: ${idRep.selectionExogeneity.toFixed(2)} (Robustness to political bias)`, margin + 5, currentY + 22);
    doc.text(`Parallel Trend pre-test p-value: ${idRep.pvalue.toFixed(4)} (Alpha level alpha = 0.05)`, margin + 5, currentY + 27);

    doc.setFont("times", "bold");
    doc.text(`ESTIMATED PUBLICATION RANK:   ${idRep.publicationGrade.toUpperCase()} (Score: ${idRep.publicationScore}/10)`, margin + 5, currentY + 33);
    
    doc.setFont("times", "italic");
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    const warningText = idRep.warnings[0] || "No critical identification barriers detected. Standard unconfoundedness verified.";
    doc.text(doc.splitTextToSize(`Audit Notes: ${warningText}`, contentWidth - 10), margin + 5, currentY + 38);

    currentY += 50;

    // Dynamic headers/footers painter
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("times", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(140, 140, 145);
      doc.text(`Country Architect Diagnostic • Decisional Evaluation Portfolio Page ${i} of ${totalPages}`, margin, pageHeight - 12);
      doc.text("SOVEREIGN SYSTEMS DESIGN INITIATIVE", margin + contentWidth - 55, pageHeight - 12);
    }

    return doc;
  }
}
