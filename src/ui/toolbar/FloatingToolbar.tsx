/*export default function FloatingToolbar() {
  return (
    <div className="floating-toolbar">
      Grid | Projection | Clear | Home | Config
    </div>
  );
}*/
import "./FloatingToolbar.css";

interface FloatingToolbarProps {
  showNavigationPad: boolean;
  showDebugPanel?: boolean;

  onHome: () => void;
  onToggleNavigationPad: () => void;
  onShowConfig: () => void;
}

export default function FloatingToolbar({
  showNavigationPad,
  onHome,
  onToggleNavigationPad,
  onShowConfig,
}: FloatingToolbarProps) {
  return (
    <div className="floating-toolbar">
      <button onClick={onHome} title="Home">
        ⌂
      </button>

      <button
        className={showNavigationPad ? "active" : ""}
        onClick={onToggleNavigationPad}
        title="Navigation Pad"
      >
        NAV
      </button>

      <button onClick={onShowConfig} title="Config">
        CFG
      </button>
    </div>
  );
}
