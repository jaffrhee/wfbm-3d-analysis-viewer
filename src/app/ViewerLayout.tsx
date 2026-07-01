import { useCallback, useEffect, useRef, useState } from "react";

import FloatingToolbar from "../ui/toolbar/FloatingToolbar";
import MiniMap from "../ui/overlay/MiniMap";
import CoordinateGizmo from "../ui/overlay/CoordinateGizmo";
import SliceSlider from "../ui/slice/SliceSlider";
import MapTab from "../ui/inspector/MapTab";
import type { ChunkCoord } from "../viewer/chunk/Chunk";

import { ViewerEngine } from "../viewer/core/ViewerEngine";

import type { ArcRotateCamera } from "@babylonjs/core";

import NavigationPad from "../ui/overlay/NavigationPad";

import "./ViewerLayout.css";

export default function ViewerLayout() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentChunk, setCurrentChunk] = useState<ChunkCoord>({
    x: 0,
    y: 0,
  });

  const engineRef = useRef<ViewerEngine | null>(null);
  const [mainCamera, setMainCamera] = useState<ArcRotateCamera | null>(null);

  const handleSelectChunk = useCallback((coord: ChunkCoord) => {
    engineRef.current?.loadChunk(coord.x, coord.y);
    setCurrentChunk(coord);
  }, []);

  const [showNavigationPad, setShowNavigationPad] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    const viewerEngine = new ViewerEngine(canvasRef.current);
    engineRef.current = viewerEngine;

    setMainCamera(viewerEngine.getCamera());

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
      engineRef.current = null;
      viewerEngine.dispose();
    };
  }, []);

  return (
    <div className="viewer-root">
      <div className="viewer-canvas">
        <canvas ref={canvasRef} className="babylon-canvas" />
      </div>

      {/*<FloatingToolbar />
      <MiniMap currentChunk={currentChunk} onSelectChunk={handleSelectChunk} />
      <SliceSlider />
      <CoordinateGizmo mainCamera={mainCamera} />*/}

      <FloatingToolbar
        showNavigationPad={showNavigationPad}
        onHome={() => console.log("Home")}
        onCubeView={() => console.log("Cube View")}
        onToggleNavigationPad={() => setShowNavigationPad((v) => !v)}
        onShowConfig={() => console.log("Config")}
        onToggleDebugPanel={() => console.log("Debug")}
      />

      {showNavigationPad && (
        <NavigationPad
          onForward={() => console.log("forward")}
          onBackward={() => console.log("backward")}
          onLeft={() => console.log("left")}
          onRight={() => console.log("right")}
          onZoomIn={() => console.log("zoom in")}
          onZoomOut={() => console.log("zoom out")}
          onHome={() => console.log("home")}
        />
      )}

      <MiniMap currentChunk={currentChunk} onSelectChunk={handleSelectChunk} />
      <SliceSlider />
      {mainCamera && <CoordinateGizmo mainCamera={mainCamera} />}

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
