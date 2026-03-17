import React, { useEffect, useState } from "react";
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

const tox21Descriptions: Record<string, string> = {
  "NR-AR": "Androgen Receptor: Associated with reproductive toxicity and endocrine disruption.",
  "NR-AR-LBD": "Androgen Receptor Ligand-Binding Domain: Specific binding site linked to hormone modulation.",
  "NR-AhR": "Aryl Hydrocarbon Receptor: Mediates toxicity of environmental pollutants like dioxins.",
  "NR-Aromatase": "Aromatase: Key enzyme for estrogen synthesis; disruption affects sexual development.",
  "NR-ER": "Estrogen Receptor: Crucial role in reproductive functions; targets for endocrine disruptors.",
  "NR-ER-LBD": "Estrogen Receptor Ligand-Binding Domain: Specific binding evaluation for estrogenic activity.",
  "NR-PPAR-gamma": "Peroxisome Proliferator-Activated Receptor Gamma: Involved in lipid metabolism and insulin sensitivity.",
  "SR-ARE": "Antioxidant Response Element: Indicator of oxidative stress and cellular defense mechanisms.",
  "SR-ATAD5": "ATAD5: Biomarker for genotoxicity and DNA damage response.",
  "SR-HSE": "Heat Shock Factor Response Element: Indicator of cellular stress and protein denaturation.",
  "SR-MMP": "Mitochondrial Membrane Potential: Decrease indicates mitochondrial toxicity and cell stress.",
  "SR-p53": "p53 Pathway: Tumor suppressor; activation indicates DNA damage and potential carcinogenicity."
};

export default function PredictionDetails({ prediction }: Props) {
  const [animatedProb, setAnimatedProb] = useState<number>(0);

  useEffect(() => {
    if (!prediction) {
      setAnimatedProb(0);
      return;
    }

    const target = Math.min(100, Math.max(0, Number(prediction.max_prob) * 100));
    let start = 0;
    const delta = Math.max(1, Math.round(target / 50));

    const timer = window.setInterval(() => {
      start += delta;
      if (start >= target) {
        setAnimatedProb(target);
        window.clearInterval(timer);
      } else {
        setAnimatedProb(start);
      }
    }, 12);

    return () => window.clearInterval(timer);
  }, [prediction]);

  if (!prediction) {
    return (
      <section className="flex items-center justify-center h-full p-6 bg-[#0a0e12]/50 border border-dashed border-[#00ffaa]/20 rounded-md min-h-[300px]">
        <p className="text-[#00ffaa]/50 font-mono text-sm">Waiting for sequence metrics...</p>
      </section>
    );
  }

  return (
    <section className="h-full flex flex-col space-y-6 animate-fade-in-scale text-sm">
      <div className="flex flex-wrap gap-6 items-center border border-outline-variant p-4 bg-[#111822] rounded-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#00ffaa]/5 -skew-x-12 translate-x-4 -translate-y-4"></div>
        <div className={`prob-ring ${prediction.final_toxic_verdict ? "unsafe" : "safe"}`} style={{ "--p": `${animatedProb}` } as React.CSSProperties}>
          <span>{animatedProb.toFixed(1)}%</span>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-[#8ea8a2] uppercase tracking-widest font-mono">Overall Verdict</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-4 py-1.5 text-sm font-bold uppercase tracking-widest border ${prediction.final_toxic_verdict ? "border-[#ff3333] bg-[#ff3333]/10 text-[#ff3333]" : "border-[#00ffaa] bg-[#00ffaa]/10 text-[#00ffaa]"}`}>
              {prediction.final_toxic_verdict ? "TOXICITY DETECTED" : "SAFE / NO TOXICITY"}
            </span>
          </div>
          <div className="text-sm text-[#8ea8a2] font-mono mt-2">Hazard Level: <span className="text-white">{animatedProb < 33 ? "LOW" : animatedProb < 66 ? "MEDIUM" : "HIGH"}</span></div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2 font-mono">
          <span>0.0</span>
          <span className="text-[#00e5ff]">50.0 (THRESHOLD)</span>
          <span>100.0</span>
        </div>
        <div className="risk-range h-4 rounded-sm">
          <div className="risk-step low" />
          <div className="risk-step mid" />
          <div className="risk-step high" />
          <div className="risk-indicator" style={{ left: `${animatedProb}%` }} />
        </div>
      </div>

      <div className="space-y-4 filter drop-shadow-md">
        <h4 className="text-sm font-bold text-[#00e5ff] uppercase tracking-widest font-mono border-b border-[#00e5ff]/20 pb-2">Physicochemical Properties</h4>
        <div className="grid gap-3 md:grid-cols-2">
          {prediction.names.map((name, idx) => (
            <article key={`feature-${name}`} className="p-3 border-l-2 border-[#00ffaa] bg-[#0d131a] hover:bg-[#111822] transition-colors relative group">
              <h4 className="font-mono text-sm text-[#00ffaa] mb-1 truncate cursor-help">{name}</h4>
              <p className="text-xs text-[#d8f3ec] hidden group-hover:block absolute z-20 bg-[#0a0e12] border border-[#00ffaa]/30 p-3 w-[260px] left-0 top-full mt-1 shadow-lg shadow-black/80 font-mono">
                {columnMean[name] || "Metric evaluated by machine learning model."}
              </p>
              <p className="text-base font-bold font-mono text-white">{(prediction.info[idx] !== undefined && prediction.info[idx] !== null) ? prediction.info[idx].toFixed(2) : "N/A"}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h4 className="text-sm font-bold text-[#00e5ff] uppercase tracking-widest font-mono border-b border-[#00e5ff]/20 pb-2">Target Endpoint Binding (Tox21 Assays)</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(prediction.targets).map(([targetName, target]) => {
            const probability = Number(target?.predict_prob ?? NaN);
            const threshold = Number(target?.threshold ?? NaN);
            const toxic = Boolean(target?.toxic); // IF Prob >= Threshold THEN toxic === true

            return (
              <article key={`target-${targetName}`} className="p-4 border border-outline-variant bg-[#111822] rounded-md relative group hover:bg-[#1a2332] transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-mono text-sm text-white cursor-help border-b-2 border-dashed border-white/30 pb-0.5">{targetName}</h5>
                  <span className={`text-xs uppercase font-bold px-2 py-1 border rounded-sm ${toxic ? 'border-[#ff3333] text-[#ff3333] bg-[#ff3333]/10' : 'border-[#00ffaa] text-[#00ffaa] bg-[#00ffaa]/10'}`}>
                    {toxic ? 'TOXIC' : 'SAFE'}
                  </span>
                </div>
                
                <div className="absolute z-30 hidden group-hover:block bg-[#0a0e12] border border-[#00e5ff]/50 p-3 w-[280px] left-0 top-full mt-1 shadow-2xl shadow-black font-mono text-xs text-[#d8f3ec] max-h-48 overflow-y-auto">
                    {tox21Descriptions[targetName] || "Specific mechanism evaluation model for tox21."}
                </div>
                
                <div className="space-y-2 text-xs text-[#8ea8a2] font-mono">
                  <div className="flex justify-between items-center">
                    <span>Probability &gt;</span>
                    <strong className="text-white text-sm">{Number.isNaN(probability) ? "N/A" : `${(probability * 100).toFixed(1)}%`}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Threshold &gt;</span>
                    <strong className="text-white/70">{Number.isNaN(threshold) ? "N/A" : `${(threshold * 100).toFixed(1)}%`}</strong>
                  </div>
                </div>

                <div className="mt-2 h-1.5 w-full bg-[#0a0e12] relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out" style={{ width: `${Number.isNaN(probability) ? 0 : Math.min(100, Math.max(0, probability * 100))}%`, backgroundColor: toxic ? "#ff3333" : "#00ffaa" }} />
                  <div className="absolute top-0 bottom-0 w-[1px] bg-[#00e5ff]" style={{ left: `${Number.isNaN(threshold) ? 50 : threshold * 100}%` }} title="Threshold" />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
