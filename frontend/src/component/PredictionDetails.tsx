import React from "react";
import type{ PredictionData } from "./Molecule";

type Props = {
  prediction: PredictionData | null;
};

const columnMean: Record<string, string> = {
  cLogP: "Octanol-water partition coefficient; higher values increase lipophilicity and toxicity risk.",
  hbd: "Hydrogen bond donors; high counts affect solubility and membrane permeability.",
  aromatic_rings: "Aromaticity score; ring systems can impact metabolism and off-target activity.",
  oxygen: "Oxygen count; too many polar atoms may indicate reactive metabolites.",
  heterocycles: "Heterocycle count; these features are common in drugs but may affect bioactivity.",
  ring_count: "Ring count; higher may indicate structural complexity and possible polypharmacology.",
};

export default function PredictionDetails({ prediction }: Props) {
  if (!prediction) {
    return (
      <section className="card-panel p-6 rounded-xl border border-cyan-300/20 bg-white/5">
        <p className="text-on-surface-variant">Prediction details are available after valid SMILES input and model evaluation.</p>
      </section>
    );
  }

  return (
    <section className="card-panel p-6 rounded-xl border border-cyan-300/20 bg-white/5">
      <h3 className="text-xl font-bold mb-3">Toxicity Prediction Results</h3>
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className={`prob-ring ${prediction.final_toxic_verdict ? "unsafe" : "safe"}`} style={{ "--p": `${Math.min(100, Math.max(0, Number(prediction.max_prob) * 100))}` } as React.CSSProperties}>
          <span>{(Number(prediction.max_prob) * 100).toFixed(1)}%</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${prediction.final_toxic_verdict ? "bg-rose-500/20 text-rose-100" : "bg-emerald-500/20 text-emerald-100"}`}>
          {prediction.final_toxic_verdict ? "UNSAFE" : "SAFE"}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {prediction.names.map((name, idx) => {
          const target = prediction.targets[name];
          return (
            <article key={name} className="p-3 rounded-lg border border-cyan-300/15 bg-surface-container-high">
              <h4 className="font-semibold">{name}</h4>
              <p className="text-xs text-on-surface-variant mb-2">{columnMean[name] || "No description available."}</p>
              <ul className="text-sm space-y-1">
                <li>Info score: <strong>{prediction.info[idx]?.toFixed(2)}</strong></li>
                <li>Predicted probability: <strong>{(Number(target.predict_prob) * 100).toFixed(2)}%</strong></li>
                <li>Threshold: <strong>{(Number(target.threshold) * 100).toFixed(2)}%</strong></li>
                <li>Result: <strong className={target.toxic ? "text-rose-300" : "text-emerald-300"}>{target.toxic ? "Toxic" : "Non-toxic"}</strong></li>
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
