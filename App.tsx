
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getWATBreakdown } from './geminiService';
import { WATBreakdown, WordNature } from './types';
import OLQBadge from './components/OLQBadge';

const App: React.FC = () => {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [breakdown, setBreakdown] = useState<WATBreakdown | null>(null);
  const [timedMode, setTimedMode] = useState(false);
  const [timer, setTimer] = useState(10);
  const [history, setHistory] = useState<string[]>([]);
  
  const timerRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setTimer(10);
    timerRef.current = window.setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleAnalyze = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setBreakdown(null);
    try {
      const result = await getWATBreakdown(word.trim());
      setBreakdown(result);
      setHistory(prev => [word.trim(), ...prev.slice(0, 9)]);
      if (timedMode) {
        startTimer();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to analyze word. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const getNatureColor = (nature: WordNature) => {
    switch (nature) {
      case WordNature.POSITIVE: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case WordNature.NEGATIVE: return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case WordNature.NEUTRAL: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 md:p-8 bg-[#0f172a]">
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <h1 className="montserrat text-2xl font-bold tracking-tight text-white">WAT MASTER</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400 cursor-pointer select-none" htmlFor="timed-mode">Timed Practice</label>
            <button 
              id="timed-mode"
              onClick={() => setTimedMode(!timedMode)}
              className={`w-10 h-5 rounded-full transition-colors relative ${timedMode ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${timedMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main UI */}
      <main className="w-full max-w-4xl flex flex-col items-center gap-12">
        
        {/* Flashcard Input Area */}
        <section className={`w-full max-w-2xl transition-all duration-500 transform ${breakdown ? 'translate-y-0' : 'translate-y-24'}`}>
          <div className="glass-panel p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
            
            <form onSubmit={handleAnalyze} className="relative z-10">
              <label className="block text-slate-400 text-xs uppercase tracking-widest font-semibold mb-3">Target Word</label>
              <div className="relative">
                <input 
                  autoFocus
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="Enter Word..."
                  className="w-full bg-slate-900/50 border-2 border-slate-700 focus:border-indigo-500 text-3xl md:text-5xl font-bold py-6 px-8 rounded-2xl outline-none transition-all placeholder:text-slate-800 text-white montserrat"
                />
                <button 
                  disabled={loading}
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl font-bold transition-all shadow-lg"
                >
                  {loading ? 'ANALYZING...' : 'ANALYZE'}
                </button>
              </div>
              <p className="mt-4 text-slate-500 text-sm">Hit Enter to see the psychologist's breakdown.</p>
            </form>
          </div>
        </section>

        {/* Timed Mode Countdown Overlay */}
        {timedMode && breakdown && timer > 0 && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
             <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-indigo-500 bg-slate-900 shadow-xl ${timer < 4 ? 'animate-pulse text-red-500 border-red-500' : 'text-indigo-400'}`}>
               {timer}
             </div>
          </div>
        )}

        {/* Analysis Report */}
        {breakdown && (
          <div className={`w-full space-y-6 transition-all duration-1000 ${timedMode && timer === 0 ? 'blur-md pointer-events-none opacity-50' : 'opacity-100'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Psychology */}
              <div className="md:col-span-2 space-y-6">
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-indigo-500">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-indigo-400 font-bold tracking-wider uppercase text-xs">Psychological Profile</h3>
                    <div className={`px-3 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getNatureColor(breakdown.nature)}`}>
                      {breakdown.nature} Nature
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-white">Why this word?</h2>
                  <p className="text-slate-400 leading-relaxed text-sm">{breakdown.natureReasoning}</p>
                  
                  <div className="mt-6">
                    <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-widest">Core OLQs Tested</h4>
                    <div className="flex flex-wrap gap-2">
                      {breakdown.olqs.map((olq, i) => <OLQBadge key={i} label={olq} />)}
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl">
                  <h3 className="text-emerald-400 font-bold tracking-wider uppercase text-xs mb-4">Correct Thinking Direction</h3>
                  <div className="flex gap-4 items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl">🧠</div>
                    <div className="h-[2px] w-8 bg-slate-700" />
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-2xl shadow-inner border border-emerald-500/30">⚔️</div>
                  </div>
                  <p className="text-slate-300 font-medium italic">"{breakdown.thinkingDirection}"</p>
                </div>
              </div>

              {/* Practical logic */}
              <div className="space-y-6">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 h-full">
                  <h3 className="text-amber-400 font-bold tracking-wider uppercase text-xs mb-4">Sentence Formula</h3>
                  <p className="text-sm text-slate-200 mb-4 bg-slate-900 p-3 rounded-lg border border-slate-800">{breakdown.sentenceLogic.formula}</p>
                  <h4 className="text-xs font-semibold text-rose-400 mb-2 uppercase tracking-widest">Avoid at all costs</h4>
                  <ul className="space-y-1">
                    {breakdown.sentenceLogic.avoid.map((item, i) => (
                      <li key={i} className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Row: Responses */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="glass-panel p-6 rounded-2xl bg-rose-500/5 border-rose-500/20">
                  <h3 className="text-rose-400 font-bold tracking-wider uppercase text-xs mb-4">Rejected Thinking (Weak)</h3>
                  <div className="space-y-4">
                    {breakdown.weakResponses.map((weak, i) => (
                      <div key={i} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                        <p className="text-slate-500 line-through text-sm italic mb-1">"{weak.response}"</p>
                        <p className="text-[10px] text-rose-300/60 uppercase font-semibold">{weak.reason}</p>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="md:col-span-2 glass-panel p-6 rounded-2xl bg-indigo-600/10 border-indigo-500/40 border-2 relative">
                  <div className="absolute -top-3 -right-3 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">RECOMMENDED DRILLS</div>
                  <h3 className="text-indigo-400 font-bold tracking-wider uppercase text-xs mb-4">Ideal Officer Responses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {breakdown.idealResponses.map((res, i) => (
                      <div key={i} className="bg-slate-900/80 p-4 rounded-xl border border-indigo-500/20 flex items-center group hover:border-indigo-500/50 transition-colors">
                        <span className="text-indigo-500/50 font-mono text-xs mr-3">0{i+1}</span>
                        <p className="text-lg font-bold text-white montserrat">"{res}"</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-6 pt-4 border-t border-slate-700/50">These responses are natural, demonstrate leadership initiative, and avoid passive descriptions.</p>
               </div>
            </div>

            <div className="w-full py-8 flex justify-center">
              <button 
                onClick={() => {
                  setBreakdown(null);
                  setWord('');
                  setTimer(10);
                  if (timerRef.current) window.clearInterval(timerRef.current);
                }}
                className="group flex items-center gap-3 text-indigo-400 hover:text-white transition-all font-semibold"
              >
                Shall we move to the next word?
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* History sidebar-ish bottom */}
        {!breakdown && history.length > 0 && (
          <div className="w-full max-w-2xl">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-[0.2em] mb-4 text-center">Recent Sessions</h4>
            <div className="flex flex-wrap justify-center gap-3">
              {history.map((h, i) => (
                <button 
                  key={i} 
                  onClick={() => setWord(h)}
                  className="px-4 py-2 rounded-full bg-slate-800 text-slate-400 text-xs hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}

      </main>

      <footer className="mt-auto py-8 text-slate-600 text-[10px] uppercase tracking-widest font-bold">
        ISSB Psychological Training Engine v1.0
      </footer>
    </div>
  );
};

export default App;
