# Contributing to the Country Architect Diagnostic (CAD)

Thank you for your interest in contributing to the **Country Architect Diagnostic (CAD) v2.2** project! This repository serves two purposes: it hosts the academic/document-based research framework, and it hosts the Interactive Web Platform (Vite + React) that allows anyone to simulate assessments offline or online.

We welcome contributions from researchers, global development practitioners, systems architects, policy designers, and fintech engineers.

---

## How You Can Contribute

### 1. Submit Country Assessments
The most valuable contribution is a **new Country Assessment** modeled on the CAD framework.
- Look at `examples/sample-country-assessment.md` or `examples/ethiopia-example.md` as reference templates.
- Complete the Pillars (GSV, ITC, Dynamics, AFL) with real, qualitative, and qualitative ecosystem benchmarks.
- Save your assessment in `examples/` as `name-of-country-assessment.md` and submit a Pull Request.

### 2. Improve the Interactive Platform
The web application is built with **React, Vite, and Tailwind CSS**.
- **Visuals & Charts**: Improve the analytics dashboards, D3 charts, or mobile styling.
- **Formulas & Simulation**: Correct or expand the math modeling inside `src/App.tsx` or the offline `/calculator/cad-calculator.html`.
- **Offline Capabilities**: Test and expand service workers, offline sync, or copyable raw Markdown clipboard utilities.

### 3. Refine the Methodology
If you find holes in the calculation of the **Lock Intensity Coefficient (LIC)** or the **Architect Readiness Index (ARI)**, please open a detailed issue or submit feedback:
- Discuss the weights (e.g., the 35/35/20/10 split).
- Introduce secondary mathematical models (e.g., liquidity decay modifiers or ID coverage coefficients).

---

## Rules for Code Contributions

We value pristine clean, readable, well-organized engineering.

1. **TypeScript First**: Ensure all typescript files compilation works. Run `npm run lint` and `npm run build` locally before pushing.
2. **Deterministic Layouts**: Respect the high-contrast slate margins, elegant classic serif body font pairs, and crisp lines. Never add cluttered status lines or telemetry lines in the document views.
3. **Vanilla CSS via Tailwind**: All custom states must utilize pure Tailwind classes directly.

## Rules for Assessment Contributions

* **Objective Grounding**: Every score (1-10) assigned to a factor (e.g., *Trust Architecture*, *regulatory support*) must be backed by transparent, real-world data points, proclamations, index reports, or qualitative field notes.
* **No Marketing Hype**: When writing case studies, use academic and professional composure. Do not use sales-pitch wording. Reflect the true structural friction honestly.

## Code of Conduct

Help keep our community constructive, inclusive, and professional. Ensure all discussions are focused entirely on system structural realities, helpful collaboration, and architectural logic.

Thank you again for helping shape the **Country Architect Diagnostic** into a universal standard for market formation!
