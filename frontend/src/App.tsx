import { useState } from "react";
import Molecule from "./component/Molecule";

export default function App() {
  const [smiles, setSmiles] = useState("");
  const [query, setQuery] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(smiles.trim());
  };

  return (
    <div className="min-h-screen max-w-screen overflow-x-hidden h-full bg-surface text-on-surface">
      <nav className="p-5 flex items-center justify-between bg-surface-container-high border-b border-outline-variant">
        <h2 className="text-2xl font-bold text-cyan-300 tracking-wider">
          Our_Lab
        </h2>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <section className="card-panel particle-border p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">AI Drug Toxicity Predictor</h1>
            <p className="text-sm md:text-base text-on-surface-variant mt-2 max-w-3xl">
              Predict molecular toxicity using ML trained on public datasets. Enter a SMILES string or upload a structure file to get a rapid risk score.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid z-10 gap-4 md:grid-cols-[1fr_auto] items-center">
            <input
              value={smiles}
              onChange={(e) => setSmiles(e.target.value)}
              type="text"
              name="smiles"
              className="input-glow rounded-xl text-white placeholder:text-on-surface-variant"
              placeholder="Enter SMILES string (e.g., CC(=O)Oc1ccccc1C(=O)O)"
              required
            />
            <button type="submit" className="btn-neon rounded-xl text-lg">Predict</button>
          </form>
        </section>

        <section className="card-panel p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Molecule Viewer</h2>
            <span className="badge-accent text-xs">{query ? `Rendering ${query}` : "Awaiting input"}</span>
          </div>

          <Molecule smiles={query} />
        </section>

        
      </main>

      <footer className="px-6 text-center py-4 text-sm text-on-surface-variant border-t border-outline-variant">
        © 2026 Our_Lab 
      </footer>
    </div>
  );
}
