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

      <div className="debug-section">Performance Test</div>

      <div className="debug-row">
        <span>Grid Size</span>
        <strong>{info.performance.gridSize}</strong>
      </div>

      <div className="debug-row">
        <span>Total Cells</span>
        <strong>{info.performance.totalCellCount.toLocaleString()}</strong>
      </div>

      <div className="debug-row">
        <span>Fail Rate</span>
        <strong>{info.performance.failRate.toFixed(1)} %</strong>
      </div>

      <div className="debug-row">
        <span>Fail Cells</span>
        <strong>{info.performance.failCount.toLocaleString()}</strong>
      </div>

      <div className="debug-row">
        <span>Data Generation</span>
        <strong>{info.performance.dataGenerationMs.toFixed(1)} ms</strong>
      </div>

      <div className="debug-row">
        <span>Thin Instance Build</span>
        <strong>{info.performance.thinInstanceBuildMs.toFixed(1)} ms</strong>
      </div>

      <div className="debug-row">
        <span>Load to First Frame</span>
        <strong>{info.performance.loadToFirstFrameMs.toFixed(1)} ms</strong>
      </div>

      <div className="debug-row">
        <span>Meshes</span>
        <strong>{info.meshCount}</strong>
      </div>

      <div className="debug-row">
        <span>Active Meshes</span>
        <strong>{info.activeMeshCount}</strong>
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
