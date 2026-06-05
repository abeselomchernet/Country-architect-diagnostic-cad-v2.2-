import React, { useState } from 'react';
import { Network, Database, BrainCircuit, BarChart4, Filter, Share2, Layers } from 'lucide-react';

export const BenchmarkEngineTab: React.FC<{ countryCode: string, countryFullName: string }> = ({ countryCode, countryFullName }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded p-6 shadow-sm">
        <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2 mb-2">
          <BarChart4 className="text-amber-600" />
          Sovereign Benchmark Engine: {countryFullName}
        </h2>
        <p className="text-sm text-stone-500 mb-6">
          Compare {countryFullName}'s structural asymmetries across a normalized dynamic index against regional and global peers.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          <div className="border border-stone-200 rounded p-4 bg-stone-50">
            <h3 className="font-bold text-stone-700 text-xs uppercase mb-4 tracking-wider">Regional Quartile</h3>
            <div className="space-y-3">
              {[
                { name: "Structural Capacity", score: 68 },
                { name: "Digital Translation", score: 42 },
                { name: "Grassroots Access", score: 55 }
              ].map(m => (
                <div key={m.name}>
                  <div className="flex justify-between text-xs font-mono mb-1 text-stone-600">
                    <span>{m.name}</span>
                    <span className="font-bold">{m.score}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${m.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border border-stone-200 rounded p-4 bg-stone-50">
            <h3 className="font-bold text-stone-700 text-xs uppercase mb-4 tracking-wider">Global Distance To Frontier</h3>
            <div className="flex items-center justify-center p-4">
              <div className="relative w-32 h-32 rounded-full border-4 border-stone-200 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 50%)' }}></div>
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-stone-800">4.2</div>
                  <div className="text-[9px] text-stone-500 uppercase tracking-widest">DTF Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const KnowledgeGraphTab: React.FC<{ countryCode: string, countryFullName: string }> = ({ countryCode, countryFullName }) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthDone, setSynthDone] = useState(false);

  const handleSynth = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      setSynthDone(true);
    }, 1500);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2 mb-2">
              <Network className="text-indigo-600" />
              Evidence Knowledge Graph for {countryFullName}
            </h2>
            <p className="text-sm text-stone-500">
              Entity-relationship mapping of regulatory shock events, policy interventions, and CAD multiplier cascades for {countryFullName}.
            </p>
          </div>
          <button 
            onClick={handleSynth}
            disabled={isSynthesizing}
            className={`flex items-center gap-2 px-4 py-2 font-bold text-sm text-white rounded shadow-sm transition-all ${
              isSynthesizing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSynthesizing ? <BrainCircuit className="animate-spin" size={16} /> : <Share2 size={16} />}
            {isSynthesizing ? "Synthesizing Nodes..." : "Generate Topology Map"}
          </button>
        </div>
        
        {synthDone ? (
          <div className="relative h-64 border border-stone-200 bg-stone-50 rounded overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-stone-300 p-2 text-xs font-mono rounded shadow flex items-center gap-2 z-10">
              <Database size={12} className="text-emerald-600" /> API: Findex
              <div className="h-px bg-stone-300 w-16 absolute left-full top-1/2"></div>
            </div>
            
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-50 border border-indigo-200 p-3 text-xs font-bold text-indigo-900 rounded-full shadow-md z-20">
              {countryFullName} Core Hub
            </div>

            <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 -translate-x-20 bg-white border border-stone-300 p-2 text-xs font-mono rounded shadow flex items-center gap-2 z-10">
              Policy Shock <Filter size={12} className="text-amber-500" />
              <div className="h-px bg-stone-300 w-24 absolute right-full top-1/2 origin-right transform -rotate-45"></div>
            </div>
            
            <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2 bg-white border border-stone-300 p-2 text-xs font-mono rounded shadow flex flex-col gap-1 z-10">
              <span className="flex items-center gap-1 font-bold text-stone-700"><Layers size={12} className="text-blue-500"/> CAD Multipliers</span>
              <span className="text-[9px] text-stone-400">β-Weights tuned</span>
              <div className="h-px bg-stone-300 w-16 absolute right-full top-1/2"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-stone-100 bg-stone-50 rounded">
            <p className="text-stone-400 font-mono text-xs text-center">
              Graph nodes are sleeping.<br/>
              Click "Generate Topology Map" to extract vectors.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
