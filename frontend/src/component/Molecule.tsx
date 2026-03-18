import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as $3Dmol_module from "3dmol";
import Loading from "./Loading";

// Interop for Vite/Rollup production builds
const get3Dmol = () => {
  if (typeof window !== "undefined" && (window as any).$3Dmol) return (window as any).$3Dmol;
  if ($3Dmol_module && typeof ($3Dmol_module as any).createViewer === 'function') return $3Dmol_module;
  if ($3Dmol_module && ($3Dmol_module as any).default) return ($3Dmol_module as any).default;
  return $3Dmol_module;
};

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



type Props = {
  smiles: string;
};

export type { PredictionData };

export default function Molecule({ smiles }: Props) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const viewer = useRef<any>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fullscreen, setFullscreen] = useState(false);

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

  useEffect(() => {
    const onFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
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


  useEffect(() => {
    if (!viewerRef.current) return;

    if (!smiles) {
      setStatus("idle");
      setErrorMessage("");

      if (viewer.current) {
        viewer.current.clear();
        viewer.current.render();
      }

      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const sdfUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(
      smiles
    )}/SDF?record_type=3d`;

    axios.get<string>(sdfUrl, { responseType: "text" })
      .then((sdfRes) => {
        if (!viewer.current) {
          const $3Dmol = get3Dmol();
          viewer.current = $3Dmol.createViewer(viewerRef.current, {
            backgroundColor: "#05080a",
            nomouse: false,
          });
        }

        const v = viewer.current;
        v.clear();

        const sdfResult = sdfRes.data;
        const sdf = (sdfResult || "").trim();

        if (sdf && sdf.length >= 50) {
          v.addModel(sdf, "sdf");
          v.setStyle(
            {},
            {
              stick: { radius: 0.14, colorscheme: "Jmol" },
              sphere: { scale: 0.32, opacity: 0.9 },
            }
          );
          const $3Dmol = get3Dmol();
          v.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.12, color: "#00ffaa" }, {});
          v.zoomTo();
          v.render();
          v.spin(true, 0.9);
        } else {
          v.addLabel("3D Structure Not Available", {
            position: { x: 0, y: 0, z: 0 },
            backgroundColor: "rgba(0,0,0,0.8)",
            fontColor: "#ff3333",
            fontSize: 14,
            alignment: "center",
          });
          v.render();
        }

        setStatus("success");
      })
      .catch((err) => {
        const message = err?.response?.status === 404 ? "3D Structure not found for this SMILES." : err?.message || "Failed to process the SMILES input.";
        setStatus("error");
        setErrorMessage(message);
        if (viewer.current) {
          viewer.current.clear();
          viewer.current.render();
        }
      });
  }, [smiles]);

  return (
    <div className="flex flex-col justify-start h-full space-y-3 cursor-crosshair">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="text-xs font-mono text-[#00ffaa] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ffaa] animate-pulse"></span>
          REALTIME RENDER
        </h3>
        <div className="space-x-2">
          <button type="button" onClick={toggleFullscreen} className="btn-neon px-3 py-1 text-[10px]">{fullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}</button>
        </div>
      </div>

      {status === "error" && (
        <div className="badge-accent text-sm text-[#ff3333] border-[#ff3333] bg-[#ff3333]/10">
          ! ERROR: {errorMessage || "Enter valid SMILES"}
        </div>
      )}

      <div
        className="molecule-viewer flex-1 relative"
        style={{ minHeight: "430px" }}
      >
        <div
          ref={viewerRef}
          className="w-full h-full"
        />

        {status === "loading" && <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface/80 backdrop-blur-sm"><Loading /></div>}

        {status === "idle" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-[#00ffaa]/50 font-mono text-sm border-2 border-dashed border-[#00ffaa]/20 rounded-md">
            AWAITING INPUT...
          </div>
        )}
      </div>
    </div>
  );
}
