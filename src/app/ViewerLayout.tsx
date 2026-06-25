import { useEffect, useRef } from "react";

import FloatingToolbar from "../ui/toolbar/FloatingToolbar";
import MiniMap from "../ui/overlay/MiniMap";
import CoordinateGizmo from "../ui/overlay/CoordinateGizmo";
import SliceSlider from "../ui/slice/SliceSlider";
import MapTab from "../ui/inspector/MapTab";

import { ViewerEngine } from "../viewer/core/ViewerEngine";

import "./ViewerLayout.css";

export default function ViewerLayout() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const viewerEngine = new ViewerEngine(canvasRef.current);
    viewerEngine.start();

    window.addEventListener("keydown", (e) => {
      if (e.key === "1") {
        viewerEngine.loadChunk(0, 0);
      }

      if (e.key === "2") {
        viewerEngine.loadChunk(1, 0);
      }

      if (e.key === "3") {
        viewerEngine.loadChunk(-1, 0);
      }

      if (e.key === "4") {
        viewerEngine.loadChunk(0, 1);
      }
    });

    return () => {
      viewerEngine.dispose();
    };
  }, []);

  return (
    <div className="viewer-root">
      <div className="viewer-canvas">
        <canvas ref={canvasRef} className="babylon-canvas" />
      </div>

      <FloatingToolbar />
      <MiniMap />
      <SliceSlider />
      <CoordinateGizmo />

      <div className="inspector-panel">
        <div className="tab-header">
          <button>Map</button>
          <button>Layer</button>
        </div>

        <div className="tab-content">
          <MapTab />
        </div>
      </div>
    </div>
  );
}
