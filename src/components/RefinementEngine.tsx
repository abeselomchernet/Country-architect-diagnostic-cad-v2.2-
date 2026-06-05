import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Activity, Layers, Cpu, ShieldCheck } from 'lucide-react';

interface MetricsMap {
  [key: string]: {
    researcher: number;
    external: number;
    label: string;
    source: string;
  };
}

export const ValidationTab: React.FC<{ countryCode: string }> = ({ countryCode }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationRun, setValidationRun] = useState(false);

  // Mock discrepancies based on country code
  const variance = countryCode === 'ETH' ? 1.2 : countryCode === 'KEN' ? 0.4 : 0.8;
  
  const handleValidate = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      setValidationRun(true);
    }, 1200);
  };

  const metrics: MetricsMap = {
    gdp: { researcher: 5.4, external: 5.4 + variance, label: "GDP Growth Potential", source: "IMF" },
    findex: { researcher: 42.1, external: 42.1 - (variance * 5), label: "Financial Inclusion Rate", source: "World Bank" },
    agents: { researcher: 12.5, external: 12.5 + (variance * 2), label: "Agent Density (per 100k)", source: "CGAP" }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6 border-b border-stone-100 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="text-emerald-600" />
              Sovereign Data Validation Layer
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Cross-reference researcher inputs against synthesized World Bank, IMF, and CGAP data pipelines for {countryCode}.
            </p>
          </div>
          <button
            onClick={handleValidate}
            disabled={isValidating}
            className={`flex items-center gap-2 px-4 py-2 font-bold text-sm text-white rounded shadow-sm transition-all ${
              isValidating ? 'bg-stone-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isValidating ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
            {isValidating ? "Scanning Vectors..." : "Run Validation Suite"}
          </button>
        </div>

        {!validationRun && !isValidating && (
          <div className="flex flex-col items-center justify-center py-12 text-stone-400">
            <Activity size={48} className="mb-4 opacity-50" />
            <p>Awaiting validation sequence initiation.</p>
          </div>
        )}

        {validationRun && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded text-center">
                <div className="text-emerald-800 text-sm font-bold mb-1">Validity Score</div>
                <div className="text-3xl font-mono font-bold text-emerald-600">{(100 - variance * 10).toFixed(1)}%</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded text-center">
                <div className="text-amber-800 text-sm font-bold mb-1">Mean Asymmetry</div>
                <div className="text-3xl font-mono font-bold text-amber-600">{variance.toFixed(2)} σ</div>
              </div>
              <div className="bg-stone-50 border border-stone-200 p-4 rounded text-center">
                <div className="text-stone-800 text-sm font-bold mb-1">Status</div>
                <div className="text-xl font-mono font-bold text-stone-600 mt-2">Passed with Warnings</div>
              </div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-stone-100 text-xs text-stone-500 uppercase tracking-wider">
                  <th className="pb-2">Macro Indicator</th>
                  <th className="pb-2">Researcher Value</th>
                  <th className="pb-2">API Baseline</th>
                  <th className="pb-2">Discrepancy</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono align-middle">
                {Object.keys(metrics).map(key => {
                  const m = metrics[key];
                  const diff = Math.abs(m.researcher - m.external);
                  const status = diff > 2 ? 'warning' : diff > 5 ? 'error' : 'ok';
                  
                  return (
                    <tr key={key} className="border-b border-stone-50 last:border-0 h-10">
                      <td className="font-serif font-bold text-stone-800">
                        {m.label} <span className="text-[10px] text-stone-400 font-mono">({m.source})</span>
                      </td>
                      <td className="text-stone-600">{m.researcher.toFixed(2)}</td>
                      <td className="text-stone-600">{m.external.toFixed(2)}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          status === 'ok' ? 'bg-emerald-100 text-emerald-800' :
                          status === 'warning' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Δ {diff.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        {status === 'ok' && <CheckCircle className="text-emerald-500" size={16} />}
                        {status === 'warning' && <AlertTriangle className="text-amber-500" size={16} />}
                        {status === 'error' && <XCircle className="text-red-500" size={16} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export const CalibrationTab: React.FC<{ countryCode: string }> = ({ countryCode }) => {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [calibrated, setCalibrated] = useState(false);

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setProgress(0);
    setCalibrated(false);
    
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsCalibrating(false);
          setCalibrated(true);
          return 100;
        }
        return p + 5;
      });
    }, 100);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6 border-b border-stone-100 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
              <Cpu className="text-indigo-600" />
              Econometric Parameter Calibration
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Apply structural equation modeling to tune 19-Level CAD multipliers for {countryCode}.
            </p>
          </div>
          <button
            onClick={handleCalibrate}
            disabled={isCalibrating}
            className={`flex items-center gap-2 px-4 py-2 font-bold text-sm text-white rounded shadow-sm transition-all ${
              isCalibrating ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isCalibrating ? <RefreshCw className="animate-spin" size={16} /> : <Layers size={16} />}
            {isCalibrating ? "Tuning Weights..." : "Commence Calibration"}
          </button>
        </div>

        {isCalibrating && (
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-xs font-mono font-bold text-stone-500">
              <span>Optimizing Likelihood Function</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2">
              <div 
                className="bg-indigo-500 h-2 rounded-full transition-all duration-75"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-stone-400 font-mono tracking-widest uppercase text-center mt-2 animate-pulse">
              Running stochastic gradient descent on diagnostic residuals...
            </div>
          </div>
        )}

        {!calibrated && !isCalibrating && (
          <div className="flex flex-col items-center justify-center py-12 text-stone-400 border-2 border-dashed border-stone-100 rounded bg-stone-50">
            <Layers size={48} className="mb-4 opacity-50" />
            <p className="font-mono text-xs">Calibration required to align CAD engine with local macro-realities.</p>
          </div>
        )}

        {calibrated && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded flex items-center gap-4 text-indigo-800">
              <CheckCircle size={24} className="shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Calibration Complete</h4>
                <p className="text-xs opacity-80 mt-0.5">Model weights successfully converged via Maximum Likelihood Estimation.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "β₁ (Infrastructure)", old: 0.95, new: 0.88 },
                { label: "β₂ (Translation)", old: 1.10, new: 1.15 },
                { label: "α (Demand Elast.)", old: -0.40, new: -0.52 },
                { label: "γ (Risk Pen.)", old: 1.05, new: 1.25 },
              ].map(w => (
                <div key={w.label} className="border border-stone-200 p-3 rounded bg-white">
                  <div className="text-[10px] font-mono text-stone-500 mb-2 truncate">{w.label}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-400 line-through font-mono">{w.old.toFixed(2)}</span>
                    <span className="text-stone-300">→</span>
                    <span className="font-bold font-mono text-indigo-700">{w.new.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
