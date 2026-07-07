import { useCallback, useEffect, useRef, useState } from "react";

import FloatingToolbar from "../ui/toolbar/FloatingToolbar";
import SliceSlider from "../ui/slice/SliceSlider";
import MapTab from "../ui/inspector/MapTab";
import ConfigDialog from "../ui/config/ConfigDialog";

import MiniMap from "../ui/overlay/MiniMap";
import CoordinateGizmo from "../ui/overlay/CoordinateGizmo";
import NavigationPad from "../ui/overlay/NavigationPad";
import DebugPanel from "../ui/overlay/DebugPanel";

import type { ChunkCoord } from "../viewer/chunk/Chunk";
import { ViewerEngine } from "../viewer/core/ViewerEngine";
import type { DebugInfo } from "../viewer/debug/DebugManager";

import type { ArcRotateCamera } from "@babylonjs/core";

import "./ViewerLayout.css";

export default function ViewerLayout() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ViewerEngine | null>(null);

  const [currentChunk, setCurrentChunk] = useState<ChunkCoord>({ x: 0, y: 0 });
  const [mainCamera, setMainCamera] = useState<ArcRotateCamera | null>(null);

  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showNavigationPad, setShowNavigationPad] = useState(true);
  const [mouseWheelSpeed, setMouseWheelSpeed] = useState(75);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showCoordinateGizmo, setShowCoordinateGizmo] = useState(true);

  const [backFaceColor, setBackFaceColor] = useState("#0073bf");
  const [sideFaceColor, setSideFaceColor] = useState("#4040e6");
  const [planeAlpha, setPlaneAlpha] = useState(0.4);

  const handleSelectChunk = useCallback((coord: ChunkCoord) => {
    engineRef.current?.loadChunk(coord.x, coord.y);
    setCurrentChunk(coord);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const viewerEngine = new ViewerEngine(canvasRef.current);
    engineRef.current = viewerEngine;

    setMainCamera(viewerEngine.getCamera());
    setMouseWheelSpeed(viewerEngine.getCameraController().getMouseWheelSpeed());

    viewerEngine.start();

    const debugTimer = window.setInterval(() => {
      setDebugInfo(viewerEngine.getDebugInfo());
    }, 250);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1") viewerEngine.loadChunk(0, 0);
      if (e.key === "2") viewerEngine.loadChunk(1, 0);
      if (e.key === "3") viewerEngine.loadChunk(-1, 0);
      if (e.key === "4") viewerEngine.loadChunk(0, 1);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.clearInterval(debugTimer);

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
          /*onForward={() => engineRef.current?.getCameraController().rotateUp()}
          onBackward={() =>
            engineRef.current?.getCameraController().rotateDown()
          }
          onLeft={() => engineRef.current?.getCameraController().rotateLeft()}
          onRight={() => engineRef.current?.getCameraController().rotateRight()}
          onZoomIn={() => engineRef.current?.getCameraController().zoomIn()}
          onZoomOut={() => engineRef.current?.getCameraController().zoomOut()}
          onHome={() => engineRef.current?.getCameraController().home()}
        />*/
          onForward={() =>
            engineRef.current?.getCameraController().panForward()
          }
          onBackward={() =>
            engineRef.current?.getCameraController().panBackward()
          }
          onLeft={() => engineRef.current?.getCameraController().panLeft()}
          onRight={() => engineRef.current?.getCameraController().panRight()}
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
          /*initialMouseWheelSpeed={
            engineRef.current?.getCameraController().getMouseWheelSpeed() ?? 75
          }*/
          initialMouseWheelSpeed={mouseWheelSpeed}
          backFaceColor={backFaceColor}
          sideFaceColor={sideFaceColor}
          planeAlpha={planeAlpha}
          showNavigationPad={showNavigationPad}
          showDebugPanel={showDebugPanel}
          showCoordinateGizmo={showCoordinateGizmo}
          onApplyCamera={(alpha, beta, radius) =>
            engineRef.current
              ?.getCameraController()
              .applyView(alpha, beta, radius)
          }
          //onResetCamera={() => engineRef.current?.getCameraController().home()}
          onChangeShowNavigationPad={setShowNavigationPad}
          onChangeShowDebugPanel={setShowDebugPanel}
          onChangeMouseWheelSpeed={(speed) =>
            engineRef.current?.getCameraController().setMouseWheelSpeed(speed)
          }
          onChangeShowCoordinateGizmo={setShowCoordinateGizmo}
          onChangeBackFaceColor={(color) => {
            setBackFaceColor(color);
            engineRef.current?.setBackFaceColor(color);
          }}
          onChangeSideFaceColor={(color) => {
            setSideFaceColor(color);
            engineRef.current?.setSideFaceColor(color);
          }}
          onChangePlaneAlpha={(alpha) => {
            setPlaneAlpha(alpha);
            engineRef.current?.setPlaneAlpha(alpha);
          }}
          onClose={() => setShowConfigDialog(false)}
        />
      )}

      {showDebugPanel && debugInfo && <DebugPanel info={debugInfo} />}

      <MiniMap currentChunk={currentChunk} onSelectChunk={handleSelectChunk} />
      <SliceSlider />
      {showCoordinateGizmo && mainCamera && (
        <CoordinateGizmo mainCamera={mainCamera} />
      )}

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
