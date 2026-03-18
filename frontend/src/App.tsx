import React, { useState, useEffect } from "react";
import Molecule from "./component/Molecule";
import PredictionDetails from "./component/PredictionDetails";

export default function App() {
  const [smiles, setSmiles] = useState("");
  const [query, setQuery] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanSmiles = smiles.trim();
    if (!cleanSmiles) return;
    setQuery(cleanSmiles);
  };

  return (
    <div className="min-h-screen max-w-screen overflow-x-hidden h-full relative">
      <div 
        className="fixed w-24 h-24 rounded-full pointer-events-none z-50"
        style={{
          left: `${mousePos.x - 48}px`,
          top: `${mousePos.y - 48}px`,
          background: 'radial-gradient(circle, rgba(0,255,170,0.3) 0%, rgba(0,255,170,0.1) 50%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
      <div className="scanline"></div>
      
      <nav className="p-4 flex items-center justify-between border-b border-outline-variant bg-surface-container-low">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#00ffaa] flex items-center justify-center">
            <span className="text-[#00ffaa] text-xs font-bold font-mono">LAB</span>
          </div>
          <h2 className="text-xl font-bold tracking-[0.2em] text-[#00ffaa]">
            SYS::TOX_PREDICT
          </h2>
        </div>
        <div className="text-xs text-on-surface-variant font-mono uppercase">
          Status: <span className="text-[#00ffaa]">Online</span>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-6">
        <section className="card-panel">
          <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-[#00e5ff] mb-2">Drug Toxicity Predictor</h1>
              <p className="text-sm text-on-surface-variant max-w-2xl font-mono">
                &gt; Initialize sequence. Enter valid SMILES configuration to commence machine learning test.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <a 
                href="https://t.me/drug_toxicity_detector_bot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-neon text-center px-4 py-2 h-auto text-sm"
              >
                💬 TRY TELEGRAM BOT
              </a>
              <span className="text-xs text-on-surface-variant text-center">@drug_toxicity_detector_bot</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ffaa] font-mono">&gt;</span>
              <input
                value={smiles}
                onChange={(e) => setSmiles(e.target.value)}
                type="text"
                name="smiles"
                className="input-glow pl-8 w-full"
                placeholder="INPUT SMILES STRING (e.g., CC(=O)Oc1ccccc1C(=O)O)"
                required
              />
            </div>
            <button type="submit" className="btn-neon w-full md:w-auto h-[46px]">EXECUTE</button>
          </form>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="card-panel grid p-4 h-[650px]">
            <div className="flex items-center justify-center mb-4 border-b border-outline-variant pb-2">
              <span className="text-sm font-bold uppercase tracking-widest text-[#00e5ff]">3D Structure Viewer</span>
              <span className="badge-accent">{query ? `RENDER_ACTIVE` : "STANDBY"}</span>
            </div>
            <Molecule smiles={query} />
          </div>

          <div className="card-panel card-panel-cyan p-4 h-full">
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
              <span className="text-sm font-bold uppercase tracking-widest text-[#00ffaa]">Analysis Results</span>
            </div>
            <PredictionDetails smiles={query} />
          </div>
        </section>
      </main>

      <footer className="mt-auto px-6 py-4 text-xs font-mono text-on-surface-variant border-t border-outline-variant">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <span>TERMINAL_ID: Our_Lab_0x42 | v1.0.5 | All Systems Operational</span>
          <a 
            href="https://t.me/drug_toxicity_detector_bot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#00ffaa] hover:text-[#00ffaa]/80 transition-colors"
          >
            📱 Telegram Bot: @drug_toxicity_detector_bot
          </a>
        </div>
      </footer>
    </div>
  );
}
