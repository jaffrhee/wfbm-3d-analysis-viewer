import "./FloatingToolbar.css";

interface FloatingToolbarProps {
  showNavigationPad: boolean;

  onHome: () => void;
  onToggleNavigationPad: () => void;
  onShowConfig: () => void;
}

const iconProps = {
  className: "floating-toolbar-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function FloatingToolbar({
  showNavigationPad,
  onHome,
  onToggleNavigationPad,
  onShowConfig,
}: FloatingToolbarProps) {
  return (
    <div className="floating-toolbar">
      <button onClick={onHome} title="Home">
        <svg {...iconProps}>
          <path d="M3 10.5L12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M9 21v-6h6v6" />
        </svg>
      </button>

      <button
        className={showNavigationPad ? "active" : ""}
        onClick={onToggleNavigationPad}
        title="Navigation Pad"
      >
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4v4" />
          <path d="M12 16v4" />
          <path d="M4 12h4" />
          <path d="M16 12h4" />
          <path d="M14.5 9.5l-5 2 2 5 3-7z" />
        </svg>
      </button>

      <button onClick={onShowConfig} title="Config">
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-3v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4v-3h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V4h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      </button>
    </div>
  );
}
