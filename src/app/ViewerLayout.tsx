import FloatingToolbar from "../ui/toolbar/FloatingToolbar";
import MiniMap from "../ui/overlay/MiniMap";
import CoordinateGizmo from "../ui/overlay/CoordinateGizmo";
import SliceSlider from "../ui/slice/SliceSlider";
import MapTab from "../ui/inspector/MapTab";

export default function ViewerLayout() {
  return (
    <div className="viewer-root">

      <FloatingToolbar />

      <MiniMap />

      <div className="viewer-canvas">
        WFBM 3D VIEW
      </div>

      <SliceSlider />

      <CoordinateGizmo />

      <div className="right-panel">
        <MapTab />
      </div>

    </div>
  );
}