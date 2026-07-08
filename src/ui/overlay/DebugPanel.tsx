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
        <span>FPS (Frame Per Sec.)</span>
        <strong>{info.fps.toFixed(1)}</strong>
      </div>

      <div className="debug-section">Camera</div>

      <div className="debug-row">
        <span>Alpha (수평 회전각)</span>
        <strong>{info.alpha.toFixed(3)}</strong>
      </div>

      <div className="debug-row">
        <span>Beta (수직 회전각)</span>
        <strong>{info.beta.toFixed(3)}</strong>
      </div>

      <div className="debug-row">
        <span>Radius (거리)</span>
        <strong>{info.radius.toFixed(1)}</strong>
      </div>

      <div className="debug-row debug-wide">
        <span>Position (카메라 위치)</span>
        <strong>{formatVec(info.position)}</strong>
      </div>

      <div className="debug-row debug-wide">
        <span>Target (목표지점 위치)</span>
        <strong>{formatVec(info.target)}</strong>
      </div>
    </div>
  );
}
