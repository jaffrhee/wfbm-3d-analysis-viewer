import "./FloatingToolbar.css";

import homeIcon from "../icons/home.svg";
import navigationIcon from "../icons/navigation.svg";
import configIcon from "../icons/config.svg";
import clearIcon from "../icons/clear-all.svg";

interface FloatingToolbarProps {
  showNavigationPad: boolean;

  onHome: () => void;
  onToggleNavigationPad: () => void;
  onShowConfig: () => void;

  canClearSelection: boolean;
  onClearSelection: () => void;
}

export default function FloatingToolbar({
  showNavigationPad,
  onHome,
  onToggleNavigationPad,
  onShowConfig,
  canClearSelection,
  onClearSelection,
}: FloatingToolbarProps) {
  return (
    <div className="floating-toolbar">
      <button onClick={onHome} title="Home">
        <img
          className="floating-toolbar-icon"
          src={homeIcon}
          alt="Home"
          draggable={false}
        />
      </button>

      <button
        className={showNavigationPad ? "active" : ""}
        onClick={onToggleNavigationPad}
        title="Navigation Pad"
      >
        <img
          className="floating-toolbar-icon"
          src={navigationIcon}
          alt="Navigation Pad"
          draggable={false}
        />
      </button>

      <button onClick={onShowConfig} title="Config">
        <img
          className="floating-toolbar-icon"
          src={configIcon}
          alt="Config"
          draggable={false}
        />
      </button>

      <button
        disabled={!canClearSelection}
        onClick={onClearSelection}
        title="Clear All"
      >
        <img
          className="floating-toolbar-icon"
          src={clearIcon}
          alt="Clear All"
          draggable={false}
        />
      </button>
    </div>
  );
}
