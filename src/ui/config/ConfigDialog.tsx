import { useState, useRef, useEffect } from "react";
import "./ConfigDialog.css";
import type { CameraState } from "../../viewer/camera/CameraController";

interface ConfigDialogProps {
  cameraState: CameraState;

  initialMouseWheelSpeed: number;

  backFaceColor: string;
  sideFaceColor: string;
  planeAlpha: number;

  showNavigationPad: boolean;
  showDebugPanel: boolean;
  showCoordinateGizmo: boolean;

  onApplyCamera: (alpha: number, beta: number, radius: number) => void;
  //onResetCamera: () => void;

  onChangeShowNavigationPad: (value: boolean) => void;
  onChangeShowDebugPanel: (value: boolean) => void;
  onChangeMouseWheelSpeed: (speed: number) => void;
  onChangeShowCoordinateGizmo: (value: boolean) => void;

  onChangeBackFaceColor: (color: string) => void;
  onChangeSideFaceColor: (color: string) => void;
  onChangePlaneAlpha: (alpha: number) => void;

  onApplyTarget: (x: number, y: number, z: number) => void; //Target SliderBar 추가
  onApplyPosition: (x: number, y: number, z: number) => void; //Position SliderBar 추가

  onClose: () => void;
}

export default function ConfigDialog({
  cameraState,
  initialMouseWheelSpeed,
  backFaceColor,
  sideFaceColor,
  planeAlpha,
  showNavigationPad,
  showDebugPanel,
  showCoordinateGizmo,

  onApplyCamera,
  onChangeShowNavigationPad,
  onChangeShowDebugPanel,
  onChangeMouseWheelSpeed,
  onChangeShowCoordinateGizmo,
  onChangeBackFaceColor,
  onChangeSideFaceColor,
  onChangePlaneAlpha,
  onApplyTarget,
  onApplyPosition,
  onClose,
}: ConfigDialogProps) {
  /*const [alpha, setAlpha] = useState(cameraState.alpha);
  const [beta, setBeta] = useState(cameraState.beta);
  const [radius, setRadius] = useState(cameraState.radius);
  const [cameraPositionX, setCameraPositionX] = useState(cameraState.position.x,
  );
  const [cameraPositionY, setCameraPositionY] = useState(
    cameraState.position.y,
  );
  const [cameraPositionZ, setCameraPositionZ] = useState(
    cameraState.position.z,
  );

  const [targetX, setTargetX] = useState(cameraState.target.x);
  const [targetY, setTargetY] = useState(cameraState.target.y);
  const [targetZ, setTargetZ] = useState(cameraState.target.z);*/
  const [mouseWheelSpeed, setMouseWheelSpeed] = useState(
    initialMouseWheelSpeed,
  );

  const [dialogPosition, setDialogPosition] = useState({ x: 120, y: 80 });
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;

    offsetRef.current = {
      x: e.clientX - dialogPosition.x,
      y: e.clientY - dialogPosition.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;

      setDialogPosition({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y,
      });
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      className="config-dialog"
      style={{
        left: dialogPosition.x,
        top: dialogPosition.y,
      }}
    >
      <div className="config-header" onMouseDown={handleMouseDown}>
        <span>Configuration</span>
        <button onClick={onClose}>×</button>
      </div>

      <section className="config-group">
        <h3>Camera</h3>

        <label>
          Alpha: {cameraState.alpha.toFixed(2)}
          <input
            type="range"
            min={-3.14}
            max={3.14}
            step={0.01}
            value={cameraState.alpha}
            //onChange={(e) => setAlpha(Number(e.target.value))}
            onChange={(e) => {
              const value = Number(e.target.value);

              onApplyCamera(value, cameraState.beta, cameraState.radius);
            }}
          />
        </label>

        <label>
          Beta: {cameraState.beta.toFixed(2)}
          <input
            type="range"
            min={0.15}
            max={3.13}
            step={0.01}
            value={cameraState.beta}
            //onChange={(e) => setBeta(Number(e.target.value))}
            onChange={(e) => {
              const value = Number(e.target.value);

              onApplyCamera(cameraState.alpha, value, cameraState.radius);
            }}
          />
        </label>

        <label>
          Zoom / Radius: {cameraState.radius.toFixed(0)}
          <input
            type="range"
            min={0.1}
            max={2000}
            step={1}
            value={cameraState.radius}
            //            onChange={(e) => setRadius(Number(e.target.value))}
            onChange={(e) => {
              const value = Number(e.target.value);

              //setRadius(value);

              onApplyCamera(cameraState.alpha, cameraState.beta, value);
            }}
          />
        </label>

        <label>
          Position X: {cameraState.position.x.toFixed(1)}
          <input
            type="range"
            min={-2000}
            max={2000}
            step={1}
            value={cameraState.position.x}
            onChange={(e) => {
              const value = Number(e.target.value);

              //setCameraPositionX(value);

              onApplyPosition(value, cameraState.position.y, cameraState.position.z);
            }}
          />
        </label>

        <label>
          Position Y: {cameraState.position.y.toFixed(1)}
          <input
            type="range"
            min={-2000}
            max={2000}
            step={1}
            value={cameraState.position.y}
            onChange={(e) => {
              const value = Number(e.target.value);

              //setCameraPositionY(value);

              onApplyPosition(cameraState.position.x, value, cameraState.position.z);
            }}
          />
        </label>

        <label>
          Position Z: {cameraState.position.z.toFixed(1)}
          <input
            type="range"
            min={-2000}
            max={2000}
            step={1}
            value={cameraState.position.z}
            onChange={(e) => {
              const value = Number(e.target.value);

              //setCameraPositionZ(value);

              onApplyPosition(cameraState.position.x, cameraState.position.y, value);
            }}
          />
        </label>

        <label>
          Target X: {cameraState.target.x.toFixed(1)}
          <input
            type="range"
            min={-1000}
            max={1000}
            step={1}
            value={cameraState.target.x}
            onChange={(e) => {
              const value = Number(e.target.value);
              //setTargetX(value);
              onApplyTarget(value, cameraState.target.y, cameraState.target.z);
            }}
          />
        </label>

        <label>
          Target Y: {cameraState.target.y.toFixed(1)}
          <input
            type="range"
            min={-100}
            max={1000}
            step={1}
            value={cameraState.target.y}
            onChange={(e) => {
              const value = Number(e.target.value);
              //setTargetY(value);
              onApplyTarget(cameraState.target.x, value, cameraState.target.z);
            }}
          />
        </label>

        <label>
          Target Z: {cameraState.target.z.toFixed(1)}
          <input
            type="range"
            min={-1000}
            max={1000}
            step={1}
            value={cameraState.target.z}
            onChange={(e) => {
              const value = Number(e.target.value);
              //setTargetZ(value);
              onApplyTarget(cameraState.target.x, cameraState.target.y, value);
            }}
          />
        </label>

        <label>
          Mouse Wheel Speed: {mouseWheelSpeed}
          <input
            type="range"
            min={1}
            max={200}
            step={1}
            value={mouseWheelSpeed}
            onChange={(e) => {
              const value = Number(e.target.value);
              setMouseWheelSpeed(value);
              onChangeMouseWheelSpeed(value);
            }}
          />
        </label>
      </section>

      <section className="config-group">
        <h3>Rendering</h3>

        <label className="config-color-row">
          <span>Back Face Color</span>
          <input
            type="color"
            value={backFaceColor}
            onChange={(e) => onChangeBackFaceColor(e.target.value)}
          />
        </label>

        <label className="config-color-row">
          <span>Side Face Color</span>
          <input
            type="color"
            value={sideFaceColor}
            onChange={(e) => onChangeSideFaceColor(e.target.value)}
          />
        </label>

        <label>
          Plane Alpha: {planeAlpha.toFixed(2)}
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={planeAlpha}
            onChange={(e) => onChangePlaneAlpha(Number(e.target.value))}
          />
        </label>
      </section>

      <section className="config-group">
        <h3>Viewer</h3>

        <label className="config-check">
          <input
            type="checkbox"
            checked={showNavigationPad}
            onChange={(e) => onChangeShowNavigationPad(e.target.checked)}
          />
          Show Navigation Pad
        </label>

        <label className="config-check">
          <input
            type="checkbox"
            checked={showDebugPanel}
            onChange={(e) => onChangeShowDebugPanel(e.target.checked)}
          />
          Show Debug Panel
        </label>

        <label className="config-check">
          <input
            type="checkbox"
            checked={showCoordinateGizmo}
            onChange={(e) => onChangeShowCoordinateGizmo(e.target.checked)}
          />
          Show Coordinate Gizmo
        </label>
      </section>
    </div>
  );
}
