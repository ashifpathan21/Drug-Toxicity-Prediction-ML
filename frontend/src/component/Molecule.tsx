import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as $3Dmol from "3dmol";
import Loading from "./Loading";

type TargetOutput = {
  predict_prob: string;
  threshold: number;
  toxic: boolean;
};

type PredictionData = {
  names: string[];
  info: number[];
  targets: Record<string, TargetOutput>;
  max_prob: string;
  final_toxic_verdict: boolean;
};

type PredictionResponse = {
  data?: PredictionData;
};

type Props = {
  smiles: string;
};

export default function Molecule({ smiles }: Props) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const viewer = useRef<any>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fullscreen, setFullscreen] = useState(false);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);

  useEffect(() => {
    const container = viewerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;
    const el = viewerRef.current;

    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  const maxProb = prediction ? Math.min(100, Math.max(0, Number(prediction.max_prob) * 100)) : 0;
  const targetToxic = prediction?.targets?.toxic;
  const thresholdValue = targetToxic ? Number(targetToxic.threshold) * 100 : 50;
  const isUnsafe = prediction
    ? prediction.final_toxic_verdict || (targetToxic ? Number(targetToxic.predict_prob) * 100 >= thresholdValue : false)
    : false;

  useEffect(() => {
    if (!viewerRef.current) return;

    if (!smiles) {
      setStatus("idle");
      setErrorMessage("");
      setPrediction(null);

      if (viewer.current) {
        viewer.current.clear();
        viewer.current.render();
      }

      return;
    }

    setStatus("loading");
    setErrorMessage("");
    setPrediction(null);

    const sdfUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(
      smiles
    )}/SDF?record_type=3d`;
    const predUrl = `https://drug-toxicity-prediction-ml.onrender.com/predict?smiles=${encodeURIComponent(
      smiles
    )}`;

    Promise.all([
      axios.get<string>(sdfUrl, { responseType: "text" }),
      axios.get<PredictionResponse>(predUrl),
    ])
      .then(([sdfRes, predRes]) => {
        const sdf = (sdfRes.data || "").trim();
        if (!sdf || sdf.length < 50) {
          throw new Error("Invalid SMILES or no 3D structure available.");
        }

        if (!predRes.data || !predRes.data.data) {
          throw new Error("No such smile exists");
        }

        const predictionData = predRes.data.data;
        if (!predictionData.targets || predictionData.max_prob === undefined) {
          throw new Error("No such smile exists");
        }

        setPrediction(predictionData);

        if (!viewer.current) {
          viewer.current = $3Dmol.createViewer(viewerRef.current, {
            backgroundColor: "#05050d",
            nomouse: false,
          });
        }

        const v = viewer.current;
        v.clear();
        v.addModel(sdf, "sdf");
        v.setStyle(
          {},
          {
            stick: { radius: 0.14, colorscheme: "Jmol" },
            sphere: { scale: 0.32, opacity: 0.9 },
          }
        );

        v.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.12, color: "deepskyblue" }, {});
        v.setBackgroundColor("#02050d");
        v.zoomTo();
        v.setZoomLimits(1, 1); // lock zoom in/out
        v.render();
        v.spin(true, 0.9);

        setStatus("success");
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message || err?.message || "No such smile exists";
        setStatus("error");
        setErrorMessage(message);
      });
  }, [smiles]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Molecule Viewer</h3>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="btn-neon px-3 py-1 text-xs"
        >
          {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>

      {status === "loading" && <Loading />}

      {status === "error" && (
        <div className="badge-accent text-sm text-rose-200 bg-red-700/15 border-red-500/20">
          {errorMessage || "Enter valid SMILES"}
        </div>
      )}

      <div
        ref={viewerRef}
        className="molecule-viewer rounded-xl overflow-hidden border border-cyan-300/25"
        style={{ width: "100%", minHeight: "430px" }}
      />

      {prediction && (
        <section className="mt-4 grid gap-4 md:grid-cols-2 items-start">
          <div className="p-4 rounded-xl border border-cyan-300/20 bg-white/5">
            <h4 className="font-semibold mb-2">Toxicity Summary</h4>
            <p className="mb-2">Final Verdict: <span className={isUnsafe ? "text-rose-300" : "text-emerald-300"}>{prediction.final_toxic_verdict ? "Toxic" : "Safe"}</span></p>
            <p>Max probability: <strong>{maxProb.toFixed(1)}%</strong></p>
            <div className="mt-3 w-full max-w-xs">
              <div className={`prob-ring ${isUnsafe ? "unsafe" : "safe"}`} style={{ "--p": `${maxProb}` } as any}>
                <span>{maxProb.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-cyan-300/20 bg-white/5">
            <h4 className="font-semibold mb-2">Key Predictors</h4>
            <ul className="text-sm space-y-1">
              {prediction.names.map((name, index) => (
                <li key={name} className="flex justify-between">
                  <span>{name}</span>
                  <span className="font-semibold">{prediction.info[index]}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {status === "idle" && (
        <p className="text-on-surface-variant text-sm">Type a SMILES and click Predict to load molecule.</p>
      )}
    </div>
  );
}
