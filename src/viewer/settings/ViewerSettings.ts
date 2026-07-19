export interface ViewerSettings {
  mouseWheelSpeed: number;

  rendering: {
    backFaceColor: string;
    sideFaceColor: string;
    planeAlpha: number;
  };

  viewer: {
    showNavigationPad: boolean;
    showDebugPanel: boolean;
    showCoordinateGizmo: boolean;
  };
}

const STORAGE_KEY = "wfbm-viewer-settings-v1";

export const DEFAULT_VIEWER_SETTINGS: ViewerSettings = {
  mouseWheelSpeed: 150,

  rendering: {
    backFaceColor: "#0073bf",
    sideFaceColor: "#4040e6",
    planeAlpha: 0.4,
  },

  viewer: {
    showNavigationPad: true,
    showDebugPanel: false,
    showCoordinateGizmo: true,
  },
};

export function loadViewerSettings(): ViewerSettings {
  try {
    const savedJson = window.localStorage.getItem(STORAGE_KEY);

    if (!savedJson) {
      return structuredClone(DEFAULT_VIEWER_SETTINGS);
    }

    const saved = JSON.parse(savedJson) as Partial<ViewerSettings>;

    return {
      mouseWheelSpeed:
        typeof saved.mouseWheelSpeed === "number"
          ? saved.mouseWheelSpeed
          : DEFAULT_VIEWER_SETTINGS.mouseWheelSpeed,

      rendering: {
        backFaceColor:
          saved.rendering?.backFaceColor ??
          DEFAULT_VIEWER_SETTINGS.rendering.backFaceColor,

        sideFaceColor:
          saved.rendering?.sideFaceColor ??
          DEFAULT_VIEWER_SETTINGS.rendering.sideFaceColor,

        planeAlpha:
          typeof saved.rendering?.planeAlpha === "number"
            ? saved.rendering.planeAlpha
            : DEFAULT_VIEWER_SETTINGS.rendering.planeAlpha,
      },

      viewer: {
        showNavigationPad:
          typeof saved.viewer?.showNavigationPad === "boolean"
            ? saved.viewer.showNavigationPad
            : DEFAULT_VIEWER_SETTINGS.viewer.showNavigationPad,

        showDebugPanel:
          typeof saved.viewer?.showDebugPanel === "boolean"
            ? saved.viewer.showDebugPanel
            : DEFAULT_VIEWER_SETTINGS.viewer.showDebugPanel,

        showCoordinateGizmo:
          typeof saved.viewer?.showCoordinateGizmo === "boolean"
            ? saved.viewer.showCoordinateGizmo
            : DEFAULT_VIEWER_SETTINGS.viewer.showCoordinateGizmo,
      },
    };
  } catch (error) {
    console.warn("Failed to load viewer settings:", error);

    return structuredClone(DEFAULT_VIEWER_SETTINGS);
  }
}

export function saveViewerSettings(settings: ViewerSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Failed to save viewer settings:", error);
  }
}

export function clearViewerSettings() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear viewer settings:", error);
  }
}
