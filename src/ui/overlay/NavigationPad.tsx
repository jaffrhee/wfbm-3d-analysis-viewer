import "./NavigationPad.css";

interface NavigationPadProps {
  onForward: () => void;
  onBackward: () => void;
  onLeft: () => void;
  onRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;

  mouseWheelSpeed: number;
  onWheelSpeedChange: (speed: number) => void;

  showCameraGuide: boolean;
  onToggleCameraGuide: (value: boolean) => void;
}

export default function NavigationPad({
  onForward,
  onBackward,
  onLeft,
  onRight,
  onZoomIn,
  onZoomOut,
  mouseWheelSpeed,
  onWheelSpeedChange,
  showCameraGuide,
  onToggleCameraGuide,
}: NavigationPadProps) {
  return (
    <div className="navigation-pad">
      <button className="nav-btn nav-up" onClick={onForward}>
        ↑
      </button>

      <button className="nav-btn nav-left" onClick={onLeft}>
        ←
      </button>
      <button className="nav-btn nav-right" onClick={onRight}>
        →
      </button>

      <button className="nav-btn nav-down" onClick={onBackward}>
        ↓
      </button>

      <button className="nav-btn nav-zoom-in" onClick={onZoomIn}>
        ＋
      </button>
      <button className="nav-btn nav-zoom-out" onClick={onZoomOut}>
        －
      </button>

      <div className="nav-wheel">
        <div className="nav-wheel-label">Wheel Speed</div>

        <div className="nav-wheel-value">{mouseWheelSpeed}</div>

        <input
          type="range"
          min={1}
          max={200}
          step={1}
          value={mouseWheelSpeed}
          onChange={(e) => onWheelSpeedChange(Number(e.target.value))}
        />
      </div>

      <label className="nav-guide">
        <input
          type="checkbox"
          checked={showCameraGuide}
          onChange={(e) => onToggleCameraGuide(e.target.checked)}
        />
        Camera Guide
      </label>
    </div>
  );
}
