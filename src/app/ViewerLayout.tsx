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
import type { CameraState } from "../viewer/camera/CameraController";
import {
  //DEFAULT_VIEWER_SETTINGS,
  loadViewerSettings,
  saveViewerSettings,
} from "../viewer/settings/ViewerSettings";

import type { ArcRotateCamera } from "@babylonjs/core";

import "./ViewerLayout.css";

export default function ViewerLayout() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ViewerEngine | null>(null);

  const [initialSettings] = useState(loadViewerSettings);

  const [currentChunk, setCurrentChunk] = useState<ChunkCoord>({ x: 0, y: 0 });
  const [mainCamera, setMainCamera] = useState<ArcRotateCamera | null>(null);

  //Viewer settings
  /*const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showNavigationPad, setShowNavigationPad] = useState(true);
  const [showCoordinateGizmo, setShowCoordinateGizmo] = useState(true);*/
  const [showDebugPanel, setShowDebugPanel] = useState(
    initialSettings.viewer.showDebugPanel,
  );

  const [showNavigationPad, setShowNavigationPad] = useState(
    initialSettings.viewer.showNavigationPad,
  );

  const [showCoordinateGizmo, setShowCoordinateGizmo] = useState(
    initialSettings.viewer.showCoordinateGizmo,
  );

  //const [showCameraGuide, setShowCameraGuide] = useState(false);

  //mouse wheel speed
  // const [mouseWheelSpeed, setMouseWheelSpeed] = useState(148);
  const [mouseWheelSpeed, setMouseWheelSpeed] = useState(
    initialSettings.mouseWheelSpeed,
  );
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [cameraState, setCameraState] = useState<CameraState | null>(null);

  const [showConfigDialog, setShowConfigDialog] = useState(false);

  //Rendering settings
  /*const [backFaceColor, setBackFaceColor] = useState("#0073bf");
  const [sideFaceColor, setSideFaceColor] = useState("#4040e6");
  const [planeAlpha, setPlaneAlpha] = useState(0.4);*/
  const [backFaceColor, setBackFaceColor] = useState(
    initialSettings.rendering.backFaceColor,
  );

  const [sideFaceColor, setSideFaceColor] = useState(
    initialSettings.rendering.sideFaceColor,
  );

  const [planeAlpha, setPlaneAlpha] = useState(
    initialSettings.rendering.planeAlpha,
  );

  const [performanceEnabled, setPerformanceEnabled] = useState(
    initialSettings.performance.enabled,
  );

  const [performanceFailRate, setPerformanceFailRate] = useState(
    initialSettings.performance.failRate,
  );

  const handleSelectChunk = useCallback((coord: ChunkCoord) => {
    engineRef.current?.loadChunk(coord.x, coord.y);
    setCurrentChunk(coord);
  }, []);

  const refreshCameraState = useCallback(() => {
    const cameraController = engineRef.current?.getCameraController();

    if (!cameraController) {
      return;
    }

    setCameraState(cameraController.getCameraState());
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const viewerEngine = new ViewerEngine(canvasRef.current, {
      performanceEnabled,
      performanceFailRate,
    });
    engineRef.current = viewerEngine;

    setMainCamera(viewerEngine.getCamera());
    setMouseWheelSpeed(viewerEngine.getCameraController().getMouseWheelSpeed());

    viewerEngine
      .getCameraController()
      .setMouseWheelSpeed(initialSettings.mouseWheelSpeed);
    viewerEngine.setBackFaceColor(initialSettings.rendering.backFaceColor);
    viewerEngine.setSideFaceColor(initialSettings.rendering.sideFaceColor);
    viewerEngine.setPlaneAlpha(initialSettings.rendering.planeAlpha);

    setCameraState(viewerEngine.getCameraController().getCameraState());

    viewerEngine.start();

    const debugTimer = window.setInterval(() => {
      setDebugInfo(viewerEngine.getDebugInfo());
    }, 250);

    const cameraStateTimer = window.setInterval(() => {
      setCameraState(viewerEngine.getCameraController().getCameraState());
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1") viewerEngine.loadChunk(0, 0);
      if (e.key === "2") viewerEngine.loadChunk(1, 0);
      if (e.key === "3") viewerEngine.loadChunk(-1, 0);
      if (e.key === "4") viewerEngine.loadChunk(0, 1);
      /*if (e.key.toLowerCase() === "f") {
        const radius = viewerEngine.autoFitCamera();

        console.log("Auto Fit Radius:", radius);
      }*/
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.clearInterval(debugTimer);
      window.clearInterval(cameraStateTimer);

      engineRef.current = null;
      viewerEngine.dispose();
    };
  }, []);

  useEffect(() => {
    saveViewerSettings({
      mouseWheelSpeed,

      rendering: {
        backFaceColor,
        sideFaceColor,
        planeAlpha,
      },

      viewer: {
        showNavigationPad,
        showDebugPanel,
        showCoordinateGizmo,
      },

      performance: {
        enabled: performanceEnabled,
        failRate: performanceFailRate,
      },
    });
  }, [
    mouseWheelSpeed,
    backFaceColor,
    sideFaceColor,
    planeAlpha,
    showNavigationPad,
    showDebugPanel,
    showCoordinateGizmo,
    performanceEnabled,
    performanceFailRate,
  ]);

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
          mouseWheelSpeed={mouseWheelSpeed}
          onWheelSpeedChange={(speed) => {
            setMouseWheelSpeed(speed);

            engineRef.current?.getCameraController().setMouseWheelSpeed(speed);
          }}
        />
      )}

      {showConfigDialog && cameraState && debugInfo && (
        <ConfigDialog
          cameraState={cameraState}
          mouseWheelSpeed={mouseWheelSpeed}
          backFaceColor={backFaceColor}
          sideFaceColor={sideFaceColor}
          planeAlpha={planeAlpha}
          showNavigationPad={showNavigationPad}
          showDebugPanel={showDebugPanel}
          showCoordinateGizmo={showCoordinateGizmo}
          performanceEnabled={performanceEnabled}
          performanceFailRate={performanceFailRate}
          /*onApplyCamera={(alpha, beta, radius) =>
            engineRef.current
              ?.getCameraController()
              .applyView(alpha, beta, radius)
          }*/
          onApplyCamera={(alpha, beta, radius) => {
            const cameraController = engineRef.current?.getCameraController();

            if (!cameraController) {
              return;
            }

            cameraController.applyView(alpha, beta, radius);
            refreshCameraState();
          }}
          onApplyPosition={(x, y, z) => {
            const cameraController = engineRef.current?.getCameraController();

            if (!cameraController) {
              return;
            }

            cameraController.applyPosition(x, y, z);
            refreshCameraState();
          }}
          onApplyTarget={(x, y, z) => {
            const cameraController = engineRef.current?.getCameraController();

            if (!cameraController) {
              return;
            }

            cameraController.applyTarget(x, y, z);
            refreshCameraState();
          }}
          onChangeShowNavigationPad={setShowNavigationPad}
          onChangeShowDebugPanel={setShowDebugPanel}
          onChangeMouseWheelSpeed={(speed) => {
            setMouseWheelSpeed(speed);

            engineRef.current?.getCameraController().setMouseWheelSpeed(speed);
          }}
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
          onChangePerformanceEnabled={(enabled) => {
            setPerformanceEnabled(enabled);

            engineRef.current?.setPerformanceOptions(
              enabled,
              performanceFailRate,
            );
          }}
          onChangePerformanceFailRate={(rate) => {
            setPerformanceFailRate(rate);

            if (performanceEnabled) {
              engineRef.current?.setPerformanceOptions(
                performanceEnabled,
                rate,
              );
            }
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
