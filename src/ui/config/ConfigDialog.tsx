import { useState } from "react";
import "./ConfigDialog.css";

interface ConfigDialogProps {
  initialAlpha: number;
  initialBeta: number;
  initialRadius: number;

  showNavigationPad: boolean;
  showDebugPanel: boolean;

  onApplyCamera: (alpha: number, beta: number, radius: number) => void;
  onResetCamera: () => void;

  onChangeShowNavigationPad: (value: boolean) => void;
  onChangeShowDebugPanel: (value: boolean) => void;

  onClose: () => void;
}

export default function ConfigDialog({
  initialAlpha,
  initialBeta,
  initialRadius,
  showNavigationPad,
  showDebugPanel,
  onApplyCamera,
  onResetCamera,
  onChangeShowNavigationPad,
  onChangeShowDebugPanel,
  onClose,
}: ConfigDialogProps) {
  const [alpha, setAlpha] = useState(initialAlpha);
  const [beta, setBeta] = useState(initialBeta);
  const [radius, setRadius] = useState(initialRadius);

  return (
    <div className="config-dialog">
      <div className="config-header">
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
      </section>

      <section className="config-group">
        <h3>Rendering</h3>
        <div className="config-placeholder">Plane Fill Color / Alpha later</div>
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
      </section>
    </div>
  );
}
