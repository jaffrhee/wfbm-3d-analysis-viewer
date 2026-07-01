import "./NavigationPad.css";

interface NavigationPadProps {
  onForward: () => void;
  onBackward: () => void;
  onLeft: () => void;
  onRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onHome: () => void;
}

export default function NavigationPad({
  onForward,
  onBackward,
  onLeft,
  onRight,
  onZoomIn,
  onZoomOut,
  onHome,
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

      <button className="nav-btn nav-home" onClick={onHome}>
        ⌂
      </button>
    </div>
  );
}
