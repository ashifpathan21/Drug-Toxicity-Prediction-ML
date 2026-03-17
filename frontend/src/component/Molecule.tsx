import { useEffect, useRef } from "react";
import * as $3Dmol from "3dmol";

type Props = {
  smiles: string;
};

export default function Molecule({ smiles }: Props) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const viewer = useRef<any>(null);

  useEffect(() => {
    if (!viewerRef.current || !smiles) return;

    /* create viewer once */
    if (!viewer.current) {
      viewer.current = $3Dmol.createViewer(viewerRef.current, {
        backgroundColor: "black",
      });
    }

    const v = viewer.current;

    const url =
      "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/" +
      encodeURIComponent(smiles) +
      "/SDF?record_type=3d";

    async function loadMolecule() {
      try {
        const res = await fetch(url);
        const sdf = (await res.text()).trim();

        if (!sdf || sdf.length < 50) {
          console.error("Invalid molecule data");
          return;
        }

        v.clear();

        v.addModel(sdf, "sdf");

        /* neon drug visualization */
        v.setStyle(
          {},
          {
            stick: {
              radius: 0.18,
              colorscheme: "Jmol",
            },
            sphere: {
              scale: 0.28,
            },
          }
        );

        /* glowing molecular surface */
        v.addSurface(
          $3Dmol.SurfaceType.VDW,
          {
            opacity: 0.12,
            color: "cyan",
          },
          {}
        );

        /* center + render */
        v.zoomTo();
        v.render();

        /* smooth rotation */
        v.spin(true);

      } catch (err) {
        console.error("Molecule loading failed", err);
      }
    }

    loadMolecule();
  }, [smiles]);

  return (
    <div
      ref={viewerRef}
      style={{
        width: "100%",
        height: "450px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
}