import React, { useState } from 'react';
import { Database, Download, CheckCircle, RefreshCw, AlertCircle, Server } from 'lucide-react';

export interface IndicatorConfig {
  id: string;
  name: string;
  desc: string;
  vintage: string;
}

interface DataIngestionHubProps {
  sourceName: string;
  description: string;
  endpointDesc: string;
  indicators: IndicatorConfig[];
  colorTheme: 'blue' | 'indigo' | 'emerald';
  countryCode: string;
}

export const ExternalDataIngestionHub: React.FC<DataIngestionHubProps> = ({
  sourceName,
  description,
  endpointDesc,
  indicators,
  colorTheme,
  countryCode
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedStates, setFetchedStates] = useState<Record<string, boolean>>({});
  const [mockValues, setMockValues] = useState<Record<string, string>>({});

  const themeColors = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      button: 'bg-blue-600 hover:bg-blue-700',
      icon: 'text-blue-500'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-900',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      icon: 'text-indigo-500'
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      icon: 'text-emerald-500'
    }
  };

  const theme = themeColors[colorTheme];

  const handleFetchAll = () => {
    setIsFetching(true);
    setTimeout(() => {
      const newStates: Record<string, boolean> = {};
      const newVals: Record<string, string> = {};
      indicators.forEach(ind => {
        newStates[ind.id] = true;
        // Mock random value generation for UI feedback
        newVals[ind.id] = (Math.random() * 100).toFixed(2);
      });
      setFetchedStates(newStates);
      setMockValues(newVals);
      setIsFetching(false);
    }, 1500);
  };

  const handleFetchSingle = (id: string) => {
    setFetchedStates(prev => ({ ...prev, [id]: false })); // Reset
    setTimeout(() => {
      setFetchedStates(prev => ({ ...prev, [id]: true }));
      setMockValues(prev => ({ ...prev, [id]: (Math.random() * 100).toFixed(2) }));
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className={`p-6 rounded-lg border ${theme.border} ${theme.bg}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className={theme.icon} size={20} />
              <h2 className={`font-serif text-xl font-bold ${theme.text}`}>
                {sourceName} API Connector
              </h2>
            </div>
            <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
              {description}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-stone-500 bg-white/50 inline-block px-2 py-1 rounded border border-stone-200/50">
              <Server size={12} />
              Endpoint: <span className="font-bold text-stone-700">{endpointDesc.replace('{iso}', countryCode)}</span>
            </div>
          </div>
          <button
            onClick={handleFetchAll}
            disabled={isFetching}
            className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-bold rounded transition-colors shadow-3xs ${theme.button} ${isFetching ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isFetching ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />}
            {isFetching ? 'Synchronizing...' : 'Sync All Pipelines'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {indicators.map((ind) => {
          const isFetched = fetchedStates[ind.id];
          const val = mockValues[ind.id];

          return (
            <div key={ind.id} className="bg-white border border-stone-200 rounded p-4 flex flex-col justify-between hover:shadow-xs transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-mono font-bold text-xs text-stone-800">{ind.id}</h4>
                  {isFetched ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <CheckCircle size={10} /> Sync OK (v{ind.vintage})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-200">
                      <AlertCircle size={10} /> Pending
                    </span>
                  )}
                </div>
                <h3 className="font-serif font-bold text-sm text-stone-900 mb-1">{ind.name}</h3>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{ind.desc}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="text-xs font-mono">
                  {isFetched ? (
                    <span className="text-stone-800 font-bold">Latest: <span className={theme.text}>{val}</span></span>
                  ) : (
                    <span className="text-stone-400">No data in cache</span>
                  )}
                </div>
                <button 
                  onClick={() => handleFetchSingle(ind.id)}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Fetch
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
