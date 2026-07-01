/*export default function FloatingToolbar() {
  return (
    <div className="floating-toolbar">
      Grid | Projection | Clear | Home | Config
    </div>
  );
}*/

interface FloatingToolbarProps {
  showNavigationPad: boolean;

  onHome: () => void;

  onCubeView: () => void;

  onToggleNavigationPad: () => void;

  onShowConfig: () => void;

  onToggleDebugPanel: () => void;
}

export default function FloatingToolbar({
  showNavigationPad,
  onHome,
  onCubeView,
  onToggleNavigationPad,
  onShowConfig,
  onToggleDebugPanel,
}: FloatingToolbarProps) {
  return (
    <div className="floating-toolbar">
      <button onClick={onHome}>Home</button>

      <button onClick={onCubeView}>Cube</button>

      <button
        className={showNavigationPad ? "active" : ""}
        onClick={onToggleNavigationPad}
      >
        Nav
      </button>

      <button onClick={onShowConfig}>Config</button>

      <button onClick={onToggleDebugPanel}>Debug</button>
    </div>
  );
}
