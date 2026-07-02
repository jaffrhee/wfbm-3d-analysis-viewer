import { useCallback, useEffect, useRef, useState } from "react";

import FloatingToolbar from "../ui/toolbar/FloatingToolbar";
import MiniMap from "../ui/overlay/MiniMap";
import CoordinateGizmo from "../ui/overlay/CoordinateGizmo";
import SliceSlider from "../ui/slice/SliceSlider";
import MapTab from "../ui/inspector/MapTab";
import ConfigDialog from "../ui/config/ConfigDialog";
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
  const [showNavigationPad, setShowNavigationPad] = useState(true);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const handleSelectChunk = useCallback((coord: ChunkCoord) => {
    engineRef.current?.loadChunk(coord.x, coord.y);
    setCurrentChunk(coord);
  }, []);

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
        onHome={() => engineRef.current?.getCameraController().home()}
        onToggleNavigationPad={() => setShowNavigationPad((v) => !v)}
        onShowConfig={() => setShowConfigDialog(true)}
      />

      {showNavigationPad && (
        <NavigationPad
          onForward={() => engineRef.current?.getCameraController().rotateUp()}
          onBackward={() =>
            engineRef.current?.getCameraController().rotateDown()
          }
          onLeft={() => engineRef.current?.getCameraController().rotateLeft()}
          onRight={() => engineRef.current?.getCameraController().rotateRight()}
          onZoomIn={() => engineRef.current?.getCameraController().zoomIn()}
          onZoomOut={() => engineRef.current?.getCameraController().zoomOut()}
          onHome={() => engineRef.current?.getCameraController().home()}
        />
      )}

      {showConfigDialog && mainCamera && (
        <ConfigDialog
          initialAlpha={mainCamera.alpha}
          initialBeta={mainCamera.beta}
          initialRadius={mainCamera.radius}
          showNavigationPad={showNavigationPad}
          showDebugPanel={showDebugPanel}
          onApplyCamera={(alpha, beta, radius) =>
            engineRef.current
              ?.getCameraController()
              .applyView(alpha, beta, radius)
          }
          onResetCamera={() => engineRef.current?.getCameraController().home()}
          onChangeShowNavigationPad={setShowNavigationPad}
          onChangeShowDebugPanel={setShowDebugPanel}
          onClose={() => setShowConfigDialog(false)}
        />
      )}

      {showConfigDialog && (
        <div className="config-dialog-temp">
          <div>Config Dialog</div>
          <button onClick={() => setShowConfigDialog(false)}>Close</button>
        </div>
      )}

      {showDebugPanel && <div className="debug-panel-temp">Debug Panel</div>}

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
