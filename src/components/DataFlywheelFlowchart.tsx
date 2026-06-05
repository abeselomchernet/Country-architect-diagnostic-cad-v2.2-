import React from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';

const flywheelSteps = [
  "Researcher",
  "Google Form",
  "Google Sheet",
  "CAD Assessment Engine",
  "Firestore Repository",
  "Cross-Country Database",
  "Calibration Engine",
  "Policy Shock Calibration",
  "Econometric Validation",
  "Improved CAD Models",
  "Better Assessments"
];

export const DataFlywheelFlowchart: React.FC = () => {
  return (
    <div className="bg-white border border-stone-250 p-6 rounded shadow-sm mt-6">
      <div className="mb-6">
        <h3 className="font-serif font-bold text-stone-900 text-lg">Institutional Learning System (Data Asymmetry Flywheel)</h3>
        <p className="text-stone-500 text-xs mt-1 leading-relaxed">
          The continuous telemetry engine that powers the 19-Level architecture—turning local assessments into global econometric intelligence.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-3">
        {flywheelSteps.map((step, index) => (
          <React.Fragment key={step}>
            <div className={`px-3 py-2 font-mono text-[10px] md:text-xs font-bold rounded shadow-3xs border text-center whitespace-nowrap ${index === 0 || index === flywheelSteps.length - 1 ? 'bg-amber-800 text-white border-amber-900' : index > 0 && index < 3 ? 'bg-red-50 text-red-800 border-red-200' : index >= 4 && index <= 5 ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-stone-50 text-stone-800 border-stone-200'}`}>
              {step}
            </div>
            {index < flywheelSteps.length - 1 && (
              <ArrowRight className="text-stone-300 hidden md:block shrink-0" size={14} />
            )}
            {index < flywheelSteps.length - 1 && (
              <ArrowDown className="text-stone-300 block md:hidden shrink-0" size={14} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
