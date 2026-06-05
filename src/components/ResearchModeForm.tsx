import React, { useState } from "react";

export interface ResearchAttribute {
  key: string;
  name: string;
  desc: string;
  pillar: string;
  min: number;
  max: number;
  step: number;
  value: number;
  setValue: (val: number) => void;
  isPercent?: boolean;
}

export interface EvidenceData {
  source: string;
  notes: string;
  confidence: "High" | "Medium" | "Low";
}

interface ResearchModeFormProps {
  attributes: ResearchAttribute[];
  evidenceData: Record<string, EvidenceData>;
  onUpdateEvidence: (key: string, field: "source" | "notes" | "confidence", value: string) => void;
  pillarsList: string[];
}

export const ResearchModeForm: React.FC<ResearchModeFormProps> = ({
  attributes,
  evidenceData,
  onUpdateEvidence,
  pillarsList,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < pillarsList.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const activePillarName = pillarsList[currentStep];
  const filteredAttrs = attributes.filter((a) => a.pillar === activePillarName);

  let themeHeader = "text-blue-900 border-blue-200 bg-blue-50/40 text-blue-800";
  let progressBarColor = "bg-blue-600";
  if (activePillarName.includes("Pillar II")) {
    themeHeader = "text-emerald-900 border-emerald-250 bg-emerald-50/30 text-emerald-800";
    progressBarColor = "bg-emerald-600";
  } else if (activePillarName.includes("Pillar III")) {
    themeHeader = "text-amber-900 border-amber-250 bg-amber-50/30 text-amber-800";
    progressBarColor = "bg-amber-500";
  } else if (activePillarName.includes("Pillar IV")) {
    themeHeader = "text-stone-900 border-stone-250 bg-stone-105/50 text-stone-800";
    progressBarColor = "bg-stone-700";
  }

  return (
    <div className="space-y-6 pt-2 animate-fadeIn">
      {/* ProgressBar/Stepper */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {pillarsList.map((p, index) => (
            <div 
              key={p} 
              className={`flex-1 text-center text-[10px] font-mono font-bold transition-colors ${
                index === currentStep 
                  ? "text-stone-900" 
                  : index < currentStep 
                    ? "text-stone-500" 
                    : "text-stone-300"
              }`}
            >
              Step {index + 1}
            </div>
          ))}
        </div>
        <div className="w-full bg-stone-100 rounded-full h-1.5 flex overflow-hidden">
          {pillarsList.map((_, index) => (
             <div 
               key={index}
               className={`h-full flex-1 transition-all duration-300 ${
                 index < currentStep 
                   ? "bg-amber-800" 
                   : index === currentStep 
                     ? progressBarColor 
                     : "bg-transparent"
               }`}
             />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Pillar Category bar */}
        <div className={`p-3 border-l-4 rounded-r font-serif text-sm font-bold uppercase tracking-wider flex items-center justify-between ${themeHeader}`}>
          <span>{activePillarName}</span>
          <span className="text-[10px] font-mono font-normal">Active Attributes: {filteredAttrs.length}</span>
        </div>

        {/* Grid of structured forms */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredAttrs.map((attr) => {
            const itemEvidence = evidenceData[attr.key] || { source: "", notes: "", confidence: "Medium" };
            
            return (
              <div key={attr.key} className="bg-white border border-stone-205 p-5 rounded hover:shadow-xs transition duration-150 space-y-4 relative">
                {/* Item Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <h4 className="font-serif font-bold text-stone-850 text-sm flex items-center gap-1.5">
                      {attr.name}
                      <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold border uppercase ${
                        itemEvidence.confidence === "High" 
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                          : itemEvidence.confidence === "Medium"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-red-50 text-red-800 border-red-200"
                      }`}>
                        {itemEvidence.confidence} Conf
                      </span>
                    </h4>
                    <p className="text-stone-500 text-[11px] leading-snug">{attr.desc}</p>
                  </div>

                  {/* Parameter Metric Input Box */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <label className="text-[10px] font-mono font-bold text-stone-605">Metric:</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={attr.min}
                        max={attr.max}
                        step={attr.step}
                        value={attr.value}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          if (!isNaN(v)) attr.setValue(Math.min(attr.max, Math.max(attr.min, v)));
                        }}
                        className="w-16 bg-stone-50 border border-stone-300 rounded px-2 py-1 font-mono font-bold text-stone-900 text-xs text-center focus:bg-white focus:outline-hidden focus:border-amber-850"
                      />
                      <span className="absolute right-1 text-[9px] text-stone-400 font-mono mt-0.5">
                        {attr.isPercent ? "%" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Slider integration directly in research card */}
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={attr.min}
                    max={attr.max}
                    step={attr.step}
                    value={attr.value}
                    onChange={(e) => attr.setValue(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-stone-750 hover:accent-stone-950 transition-colors"
                  />
                  <span className="text-[9px] text-stone-450 font-mono shrink-0">Scale: {attr.min}–{attr.max}</span>
                </div>

                {/* Split Form: Source & Confidence / Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1.5 border-t border-stone-100">
                  
                  {/* Left half: Evidence Source & Confidence select */}
                  <div className="space-y-3">
                    {/* Source */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-stone-550 uppercase tracking-wider block">Empirical Evidence Source</label>
                      <input
                        type="text"
                        value={itemEvidence.source}
                        placeholder="e.g. World Bank Findex Survey 2024"
                        onChange={(e) => onUpdateEvidence(attr.key, "source", e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-hidden focus:border-amber-805 transition duration-150"
                      />
                    </div>

                    {/* Confidence Selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-stone-550 uppercase tracking-wider block">Metric Reliability / Trust</label>
                      <div className="grid grid-cols-3 bg-stone-100 rounded p-0.5 border border-stone-200">
                        {(["Low", "Medium", "High"] as const).map((confVal) => (
                          <button
                            key={confVal}
                            type="button"
                            onClick={() => onUpdateEvidence(attr.key, "confidence", confVal)}
                            className={`py-1 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
                              itemEvidence.confidence === confVal
                                ? confVal === "High"
                                  ? "bg-emerald-700 text-white shadow-3xs"
                                  : confVal === "Medium"
                                    ? "bg-amber-700 text-white shadow-3xs"
                                    : "bg-red-700 text-white shadow-3xs"
                                : "text-stone-500 hover:text-stone-800"
                            }`}
                          >
                            {confVal}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Right half: Notes Text Area */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-stone-550 uppercase tracking-wider block">Field Notes / Micro-Justification</label>
                    <textarea
                      rows={3}
                      value={itemEvidence.notes}
                      placeholder="Add key context, local dynamics, policy quotes, or merchant responses justifying this score..."
                      onChange={(e) => onUpdateEvidence(attr.key, "notes", e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded p-2 text-xs text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-hidden focus:border-amber-805 transition duration-150 resize-y min-h-[72px]"
                    ></textarea>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-stone-200 mt-8">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`px-5 py-2 text-xs font-mono font-bold rounded transition-colors ${
            currentStep === 0
              ? "bg-stone-50 text-stone-400 cursor-not-allowed border border-stone-200"
              : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-300 shadow-3xs cursor-pointer"
          }`}
        >
          &larr; Previous Step
        </button>
        <div className="text-[10px] uppercase font-mono font-bold text-stone-400 tracking-widest">
          {currentStep + 1} / {pillarsList.length}
        </div>
        <button
          onClick={handleNext}
          disabled={currentStep === pillarsList.length - 1}
          className={`px-5 py-2 text-xs font-mono font-bold rounded transition-colors ${
            currentStep === pillarsList.length - 1
              ? "bg-stone-50 text-stone-400 cursor-not-allowed border border-stone-200"
              : "bg-amber-805 text-white hover:bg-amber-900 shadow-3xs cursor-pointer"
          }`}
        >
          Next Step &rarr;
        </button>
      </div>

    </div>
  );
};
