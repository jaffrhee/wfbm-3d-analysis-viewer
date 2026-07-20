import { useState, useRef, useEffect } from "react";
import "./ConfigDialog.css";
import type { CameraState } from "../../viewer/camera/CameraController";
import { PERFORMANCE_FAIL_RATES } from "../../data/PerformanceMockGenerator";

interface ConfigDialogProps {
  cameraState: CameraState;

  //initialMouseWheelSpeed: number;
  mouseWheelSpeed: number;

  backFaceColor: string;
  sideFaceColor: string;
  planeAlpha: number;

  showNavigationPad: boolean;
  showDebugPanel: boolean;
  showCoordinateGizmo: boolean;

  performanceEnabled: boolean;
  performanceFailRate: number;

  onApplyCamera: (alpha: number, beta: number, radius: number) => void;
  //onResetCamera: () => void;

  onChangeShowNavigationPad: (value: boolean) => void;
  onChangeShowDebugPanel: (value: boolean) => void;
  onChangeMouseWheelSpeed: (speed: number) => void;
  onChangeShowCoordinateGizmo: (value: boolean) => void;

  onChangeBackFaceColor: (color: string) => void;
  onChangeSideFaceColor: (color: string) => void;
  onChangePlaneAlpha: (alpha: number) => void;

  onApplyTarget: (x: number, y: number, z: number) => void; //Target SliderBar 추가
  onApplyPosition: (x: number, y: number, z: number) => void; //Position SliderBar 추가

  onChangePerformanceEnabled: (v: boolean) => void;
  onChangePerformanceFailRate: (v: number) => void;

  onClose: () => void;
}

export default function ConfigDialog({
  cameraState,
  mouseWheelSpeed,
  backFaceColor,
  sideFaceColor,
  planeAlpha,
  showNavigationPad,
  showDebugPanel,
  showCoordinateGizmo,
  performanceEnabled,
  performanceFailRate,

  onApplyCamera,
  onChangeShowNavigationPad,
  onChangeShowDebugPanel,
  onChangeMouseWheelSpeed,
  onChangeShowCoordinateGizmo,
  onChangeBackFaceColor,
  onChangeSideFaceColor,
  onChangePlaneAlpha,
  onApplyTarget,
  onApplyPosition,
  onChangePerformanceEnabled,
  onChangePerformanceFailRate,
  onClose,
}: ConfigDialogProps) {
  /*const [mouseWheelSpeed, setMouseWheelSpeed] = useState(
    initialMouseWheelSpeed,
  );*/

  const [dialogPosition, setDialogPosition] = useState({ x: 1260, y: 40 });
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;

    offsetRef.current = {
      x: e.clientX - dialogPosition.x,
      y: e.clientY - dialogPosition.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;

      setDialogPosition({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y,
      });
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  /*useEffect(() => {
    setMouseWheelSpeed(initialMouseWheelSpeed);
  }, [initialMouseWheelSpeed]);*/

  return (
    <div
      className="config-dialog"
      style={{
        left: dialogPosition.x,
        top: dialogPosition.y,
      }}
    >
      <div className="config-header" onMouseDown={handleMouseDown}>
        <span>Configuration</span>
        <button onClick={onClose}>×</button>
      </div>

      <section className="config-group">
        <h3>Camera</h3>

        {/*<label>
          Alpha: {cameraState.alpha.toFixed(2)}
          <input
            type="range"
            min={-3.14}
            max={3.14}
            step={0.01}
            value={cameraState.alpha}
            //onChange={(e) => setAlpha(Number(e.target.value))}
            onChange={(e) => {
              const value = Number(e.target.value);

              onApplyCamera(value, cameraState.beta, cameraState.radius);
            }}
          />
        </label>*/}

        <div className="config-slider">
          <div className="config-slider-header">
            <span>Alpha</span>

            <input
              className="config-number"
              type="number"
              step={0.01}
              value={cameraState.alpha.toFixed(3)}
              onChange={(e) => {
                const value = Number(e.target.value);

                onApplyCamera(value, cameraState.beta, cameraState.radius);
              }}
            />
          </div>

          <input
            type="range"
            min={-3.14}
            max={3.14}
            step={0.01}
            value={cameraState.alpha}
            onChange={(e) => {
              const value = Number(e.target.value);

              onApplyCamera(value, cameraState.beta, cameraState.radius);
            }}
          />
        </div>

        {/*<label>
          Beta: {cameraState.beta.toFixed(2)}
          <input
            type="range"
            min={0.15}
            max={3.13}
            step={0.01}
            value={cameraState.beta}
            //onChange={(e) => setBeta(Number(e.target.value))}
            onChange={(e) => {
              const value = Number(e.target.value);

              onApplyCamera(cameraState.alpha, value, cameraState.radius);
            }}
          />
        </label>*/}

        <div className="config-slider">
          <div className="config-slider-header">
            <span>Beta</span>

            <input
              className="config-number"
              type="number"
              step={0.01}
              value={cameraState.beta.toFixed(3)}
              onChange={(e) => {
                const value = Number(e.target.value);

                onApplyCamera(cameraState.alpha, value, cameraState.radius);
              }}
            />
          </div>

          <input
            type="range"
            min={0.15}
            max={3.13}
            step={0.01}
            value={cameraState.beta}
            onChange={(e) => {
              const value = Number(e.target.value);

              onApplyCamera(cameraState.alpha, value, cameraState.radius);
            }}
          />
        </div>

        {/*<label>
          Zoom / Radius: {cameraState.radius.toFixed(0)}
          <input
            type="range"
            min={0.1}
            max={2000}
            step={1}
            value={cameraState.radius}
            //            onChange={(e) => setRadius(Number(e.target.value))}
            onChange={(e) => {
              const value = Number(e.target.value);

              //setRadius(value);

              onApplyCamera(cameraState.alpha, cameraState.beta, value);
            }}
          />
        </label>*/}

        <div className="config-slider">
          <div className="config-slider-header">
            <span>Zoom / Radius</span>

            <input
              className="config-number"
              type="number"
              step={0.01}
              value={cameraState.radius.toFixed(3)}
              onChange={(e) => {
                const value = Number(e.target.value);

                onApplyCamera(cameraState.alpha, cameraState.beta, value);
              }}
            />
          </div>

          <input
            type="range"
            min={0.1}
            max={2000}
            step={1}
            value={cameraState.radius}
            onChange={(e) => {
              const value = Number(e.target.value);

              onApplyCamera(cameraState.alpha, cameraState.beta, value);
            }}
          />
        </div>

        {/*<label>
          Position X: {cameraState.position.x.toFixed(1)}
          <input
            type="range"
            min={-2000}
            max={2000}
            step={1}
            value={cameraState.position.x}
            onChange={(e) => {
              const value = Number(e.target.value);

              //setCameraPositionX(value);

              onApplyPosition(
                value,
                cameraState.position.y,
                cameraState.position.z,
              );
            }}
          />
        </label>

        <label>
          Position Y: {cameraState.position.y.toFixed(1)}
          <input
            type="range"
            min={-2000}
            max={2000}
            step={1}
            value={cameraState.position.y}
            onChange={(e) => {
              const value = Number(e.target.value);

              //setCameraPositionY(value);

              onApplyPosition(
                cameraState.position.x,
                value,
                cameraState.position.z,
              );
            }}
          />
        </label>

        <label>
          Position Z: {cameraState.position.z.toFixed(1)}
          <input
            type="range"
            min={-2000}
            max={2000}
            step={1}
            value={cameraState.position.z}
            onChange={(e) => {
              const value = Number(e.target.value);

              //setCameraPositionZ(value);

              onApplyPosition(
                cameraState.position.x,
                cameraState.position.y,
                value,
              );
            }}
          />
        </label>*/}

        <div className="config-slider">
          <div className="config-slider-header">
            <span>Position X</span>

            <input
              className="config-number"
              type="number"
              step={1}
              value={cameraState.position.x.toFixed(1)}
              onChange={(e) => {
                const value = Number(e.target.value);

                onApplyPosition(
                  value,
                  cameraState.position.y,
                  cameraState.position.z,
                );
              }}
            />
          </div>

          <input
            type="range"
            min={-2000}
            max={2000}
            step={1}
            value={cameraState.position.x}
            onChange={(e) => {
              const value = Number(e.target.value);

              onApplyPosition(
                value,
                cameraState.position.y,
                cameraState.position.z,
              );
            }}
          />
        </div>

        <div className="config-slider">
          <div className="config-slider-header">
            <span>Position Y</span>

            <input
              className="config-number"
              type="number"
              step={1}
              value={cameraState.position.y.toFixed(1)}
              onChange={(e) => {
                const value = Number(e.target.value);

                onApplyPosition(
                  cameraState.position.x,
                  value,
                  cameraState.position.z,
                );
              }}
            />
          </div>

          <input
            type="range"
            min={-2000}
            max={2000}
            step={1}
            value={cameraState.position.y}
            onChange={(e) => {
              const value = Number(e.target.value);

              onApplyPosition(
                cameraState.position.x,
                value,
                cameraState.position.z,
              );
            }}
          />
        </div>

        <div className="config-slider">
          <div className="config-slider-header">
            <span>Position Z</span>

            <input
              className="config-number"
              type="number"
              step={1}
              value={cameraState.position.z.toFixed(1)}
              onChange={(e) => {
                const value = Number(e.target.value);

                onApplyPosition(
                  cameraState.position.x,
                  cameraState.position.y,
                  value,
                );
              }}
            />
          </div>

          <input
            type="range"
            min={-2000}
            max={2000}
            step={1}
            value={cameraState.position.z}
            onChange={(e) => {
              const value = Number(e.target.value);

              onApplyPosition(
                cameraState.position.x,
                cameraState.position.y,
                value,
              );
            }}
          />
        </div>

        {/*<label>
          Target X: {cameraState.target.x.toFixed(1)}
          <input
            type="range"
            min={-1000}
            max={1000}
            step={1}
            value={cameraState.target.x}
            onChange={(e) => {
              const value = Number(e.target.value);
              //setTargetX(value);
              onApplyTarget(value, cameraState.target.y, cameraState.target.z);
            }}
          />
        </label>

        <label>
          Target Y: {cameraState.target.y.toFixed(1)}
          <input
            type="range"
            min={-100}
            max={1000}
            step={1}
            value={cameraState.target.y}
            onChange={(e) => {
              const value = Number(e.target.value);
              //setTargetY(value);
              onApplyTarget(cameraState.target.x, value, cameraState.target.z);
            }}
          />
        </label>

        <label>
          Target Z: {cameraState.target.z.toFixed(1)}
          <input
            type="range"
            min={-1000}
            max={1000}
            step={1}
            value={cameraState.target.z}
            onChange={(e) => {
              const value = Number(e.target.value);
              //setTargetZ(value);
              onApplyTarget(cameraState.target.x, cameraState.target.y, value);
            }}
          />
        </label>*/}

        <div className="config-slider">
          <div className="config-slider-header">
            <span>Target X</span>

            <input
              className="config-number"
              type="number"
              step={1}
              value={cameraState.target.x.toFixed(1)}
              onChange={(e) => {
                const value = Number(e.target.value);

                onApplyTarget(
                  value,
                  cameraState.target.y,
                  cameraState.target.z,
                );
              }}
            />
          </div>

          <input
            type="range"
            min={-1000}
            max={1000}
            step={1}
            value={cameraState.target.x}
            onChange={(e) => {
              const value = Number(e.target.value);

              onApplyTarget(value, cameraState.target.y, cameraState.target.z);
            }}
          />
        </div>

        <div className="config-slider">
          <div className="config-slider-header">
            <span>Target Y</span>

            <input
              className="config-number"
              type="number"
              step={1}
              value={cameraState.target.y.toFixed(1)}
              onChange={(e) => {
                const value = Number(e.target.value);

                onApplyTarget(
                  cameraState.target.x,
                  value,
                  cameraState.target.z,
                );
              }}
            />
          </div>

          <input
            type="range"
            min={-100}
            max={1000}
            step={1}
            value={cameraState.target.y}
            onChange={(e) => {
              const value = Number(e.target.value);

              onApplyTarget(cameraState.target.x, value, cameraState.target.z);
            }}
          />
        </div>

        <div className="config-slider">
          <div className="config-slider-header">
            <span>Target Z</span>

            <input
              className="config-number"
              type="number"
              step={1}
              value={cameraState.target.z.toFixed(1)}
              onChange={(e) => {
                const value = Number(e.target.value);

                onApplyTarget(
                  cameraState.target.x,
                  cameraState.target.y,
                  value,
                );
              }}
            />
          </div>

          <input
            type="range"
            min={-1000}
            max={1000}
            step={1}
            value={cameraState.target.z}
            onChange={(e) => {
              const value = Number(e.target.value);

              onApplyTarget(cameraState.target.x, cameraState.target.y, value);
            }}
          />
        </div>

        {/*<label>
          Mouse Wheel Speed: {mouseWheelSpeed}
          <input
            type="range"
            min={1}
            max={200}
            step={1}
            value={mouseWheelSpeed}
            onChange={(e) => {
              const value = Number(e.target.value);
              setMouseWheelSpeed(value);
              onChangeMouseWheelSpeed(value);
            }}
          />
        </label>*/}

        <div className="config-slider">
          <div className="config-slider-header">
            <span>Mouse Wheel Speed</span>

            <input
              className="config-number"
              type="number"
              step={1}
              //value={mouseWheelSpeed.toFixed(1)}
              value={mouseWheelSpeed}
              onChange={(e) => {
                const value = Number(e.target.value);

                //onApplyCamera(cameraState.alpha, value, cameraState.radius);
                //setMouseWheelSpeed(value);
                onChangeMouseWheelSpeed(value);
              }}
            />
          </div>

          <input
            type="range"
            min={1}
            max={200}
            step={1}
            //value={mouseWheelSpeed}
            value={mouseWheelSpeed}
            onChange={(e) => {
              const value = Number(e.target.value);

              //onApplyCamera(cameraState.alpha, value, cameraState.radius);
              //setMouseWheelSpeed(value);
              onChangeMouseWheelSpeed(value);
            }}
          />
        </div>
      </section>

      <section className="config-group">
        <h3>Rendering</h3>

        <label className="config-color-row">
          <span>Back Face Color</span>
          <input
            type="color"
            value={backFaceColor}
            onChange={(e) => onChangeBackFaceColor(e.target.value)}
          />
        </label>

        <label className="config-color-row">
          <span>Side Face Color</span>
          <input
            type="color"
            value={sideFaceColor}
            onChange={(e) => onChangeSideFaceColor(e.target.value)}
          />
        </label>

        <label>
          Plane Alpha: {planeAlpha.toFixed(2)}
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={planeAlpha}
            onChange={(e) => onChangePlaneAlpha(Number(e.target.value))}
          />
        </label>
      </section>

      <section className="config-group">
        <h3>Viewer</h3>

        <label className="config-check">
          <input
            type="checkbox"
            checked={showNavigationPad}
            onChange={(e) => onChangeShowNavigationPad(e.target.checked)}
          />
          Show Navigation Pad
        </label>

        <label className="config-check">
          <input
            type="checkbox"
            checked={showDebugPanel}
            onChange={(e) => onChangeShowDebugPanel(e.target.checked)}
          />
          Show Debug Panel
        </label>

        <label className="config-check">
          <input
            type="checkbox"
            checked={showCoordinateGizmo}
            onChange={(e) => onChangeShowCoordinateGizmo(e.target.checked)}
          />
          Show Coordinate Gizmo
        </label>
      </section>

      <section className="config-group">
        <h3>Performance Test</h3>

        <label className="config-check">
          <input
            type="checkbox"
            checked={performanceEnabled}
            onChange={(e) => onChangePerformanceEnabled(e.target.checked)}
          />
          Enable
        </label>

        <label>
          Fail Rate
          <select
            className="config-select"
            value={performanceFailRate}
            onChange={(e) =>
              onChangePerformanceFailRate(Number(e.target.value))
            }
          >
            {PERFORMANCE_FAIL_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}%
              </option>
            ))}
          </select>
        </label>
      </section>
    </div>
  );
}
