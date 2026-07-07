import { useState, useRef, useEffect } from "react";
import "./ConfigDialog.css";

interface ConfigDialogProps {
  initialAlpha: number;
  initialBeta: number;
  initialRadius: number;
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

  onClose: () => void;
}

export default function ConfigDialog({
  initialAlpha,
  initialBeta,
  initialRadius,
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
  onClose,
}: ConfigDialogProps) {
  const [alpha, setAlpha] = useState(initialAlpha);
  const [beta, setBeta] = useState(initialBeta);
  const [radius, setRadius] = useState(initialRadius);
  const [mouseWheelSpeed, setMouseWheelSpeed] = useState(
    initialMouseWheelSpeed,
  );

  const [position, setPosition] = useState({ x: 120, y: 80 });
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;

    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;

      setPosition({
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
        left: position.x,
        top: position.y,
      }}
    >
      <div className="config-header" onMouseDown={handleMouseDown}>
        <span>Configuration</span>
        <button onClick={onClose}>×</button>
      </div>

      <section className="config-group">
        <h3>Camera</h3>

        <label>
          Alpha: {alpha.toFixed(2)}
          <input
            type="range"
            min={-3.14}
            max={3.14}
            step={0.01}
            value={alpha}
            //onChange={(e) => setAlpha(Number(e.target.value))}
            onChange={(e) => {
              const value = Number(e.target.value);

              setAlpha(value);

              onApplyCamera(value, beta, radius);
            }}
          />
        </label>

        <label>
          Beta: {beta.toFixed(2)}
          <input
            type="range"
            min={0.15}
            max={3.0}
            step={0.01}
            value={beta}
            //onChange={(e) => setBeta(Number(e.target.value))}
            onChange={(e) => {
              const value = Number(e.target.value);

              setBeta(value);

              onApplyCamera(alpha, value, radius);
            }}
          />
        </label>

        <label>
          Zoom / Radius: {radius.toFixed(0)}
          <input
            type="range"
            min={50}
            max={600}
            step={5}
            value={radius}
            //            onChange={(e) => setRadius(Number(e.target.value))}
            onChange={(e) => {
              const value = Number(e.target.value);

              setRadius(value);

              onApplyCamera(alpha, beta, value);
            }}
          />
        </label>
        <label>
          Mouse Wheel Speed: {mouseWheelSpeed}
          <input
            type="range"
            min={1}
            max={150}
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
