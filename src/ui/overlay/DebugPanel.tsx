import type { DebugInfo } from "../../viewer/debug/DebugManager";
import "./DebugPanel.css";

interface DebugPanelProps {
  info: DebugInfo;
}

function formatVec(v: DebugInfo["position"]) {
  return `(${v.x.toFixed(1)}, ${v.y.toFixed(1)}, ${v.z.toFixed(1)})`;
}

export default function DebugPanel({ info }: DebugPanelProps) {
  return (
    <div className="debug-panel">
      <div className="debug-title">DEBUG</div>

      <div className="debug-row">
        <span>FPS</span>
        <strong>{info.fps.toFixed(1)}</strong>
      </div>

      <div className="debug-section">Camera</div>

      <div className="debug-row">
        <span>Alpha</span>
        <strong>{info.alpha.toFixed(3)}</strong>
      </div>

      <div className="debug-row">
        <span>Beta</span>
        <strong>{info.beta.toFixed(3)}</strong>
      </div>

      <div className="debug-row">
        <span>Radius</span>
        <strong>{info.radius.toFixed(1)}</strong>
      </div>

      <div className="debug-row debug-wide">
        <span>Position</span>
        <strong>{formatVec(info.position)}</strong>
      </div>

      <div className="debug-row debug-wide">
        <span>Target</span>
        <strong>{formatVec(info.target)}</strong>
      </div>
    </div>
  );
}