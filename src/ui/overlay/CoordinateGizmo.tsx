// src/ui/overlay/CoordinateGizmo.tsx
//export default function CoordinateGizmo() {
//  return <div className="coordinate-gizmo">XYZ</div>;
//}
import { useEffect, useRef } from "react";
import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  Matrix,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import {
  PHYSICAL_AXIS,
  PHYSICAL_AXIS_COLOR,
} from "../../viewer/core/AxisDefinition";
import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";

interface CoordinateGizmoProps {
  mainCamera: ArcRotateCamera | null;
}

//const AXIS_LENGTH = 2.2;
//const LABEL_OFFSET = 0.45;
//const ORTHO_SIZE = 3.2;

const GIZMO_STYLE = {
  // Axis
  axisLength: 2.2,
  axisLineWidth: 2,

  // Arrow
  arrowDiameter: 0.22,

  // Label
  labelFontSize: 20,
  labelGap: -1.6,

  // Camera
  orthoSize: 3.2,

  // Gizmo Position
  axisYOffset: 0.2,

  // Canvas
  canvasWidth: 180,
  canvasHeight: 180,
};

function createAxisLine(
  scene: Scene,
  name: string,
  color: Color3,
  from: Vector3,
  to: Vector3,
) {
  const line = MeshBuilder.CreateLines(name, { points: [from, to] }, scene);

  line.color = color;
  line.isPickable = false;

  return line;
}

function createArrowHead(
  scene: Scene,
  name: string,
  color: Color3,
  position: Vector3,
  direction: Vector3,
) {
  const arrow = MeshBuilder.CreateCylinder(
    name,
    {
      height: 0.38,
      diameterTop: 0,
      diameterBottom: 0.22,
      tessellation: 24,
    },
    scene,
  );

  arrow.position = position.clone();

  /*if (axis === "x") {
    arrow.rotation.z = -Math.PI / 2;
  }

  if (axis === "z") {
    arrow.rotation.x = Math.PI / 2;
  }*/

  // Babylon cylinder's local axis is +Y. Rotate it to the shared
  // WFBM physical-axis world direction.
  if (direction.x > 0) arrow.rotation.z = -Math.PI / 2;
  if (direction.x < 0) arrow.rotation.z = Math.PI / 2;
  if (direction.y < 0) arrow.rotation.x = Math.PI;
  if (direction.z > 0) arrow.rotation.x = Math.PI / 2;
  if (direction.z < 0) arrow.rotation.x = -Math.PI / 2;

  const material = new StandardMaterial(`${name}Material`, scene);
  material.diffuseColor = color;
  material.emissiveColor = color;
  material.disableLighting = true;

  arrow.material = material;
  arrow.isPickable = false;

  return arrow;
}

export default function CoordinateGizmo({
  mainCamera,
}: CoordinateGizmoProps): React.JSX.Element {
  //console.log("[CoordinateGizmo] mainCamera:", mainCamera);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mainCamera) return;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      alpha: true,
    });

    const scene = new Scene(engine);
    scene.clearColor.set(0, 0, 0, 0);

    const camera = new ArcRotateCamera(
      "coordinateGizmoCamera",
      -Math.PI / 4,
      Math.PI / 3,
      6,
      Vector3.Zero(),
      scene,
    );

    camera.mode = ArcRotateCamera.ORTHOGRAPHIC_CAMERA;
    camera.orthoLeft = -GIZMO_STYLE.orthoSize;
    camera.orthoRight = GIZMO_STYLE.orthoSize;
    camera.orthoTop = GIZMO_STYLE.orthoSize;
    camera.orthoBottom = -GIZMO_STYLE.orthoSize;

    const light = new HemisphericLight(
      "coordinateGizmoLight",
      new Vector3(0, 1, 0),
      scene,
    );
    light.intensity = 1.0;

    const xColor = new Color3(1, 0, 0);
    const yColor = new Color3(0, 1, 0);
    const zColor = new Color3(0, 0.6, 1);

    const origin = new Vector3(0, GIZMO_STYLE.axisYOffset, 0);

    //const xTip = origin.add(new Vector3(GIZMO_STYLE.axisLength, 0, 0));
    //const yTip = origin.add(new Vector3(0, GIZMO_STYLE.axisLength, 0));
    //const zTip = origin.add(new Vector3(0, 0, GIZMO_STYLE.axisLength));

    // These are WFBM Physical axes, not Babylon World axis labels.
    const xDirection = PHYSICAL_AXIS.x.scale(GIZMO_STYLE.axisLength);
    const yDirection = PHYSICAL_AXIS.y.scale(GIZMO_STYLE.axisLength);
    const zDirection = PHYSICAL_AXIS.z.scale(GIZMO_STYLE.axisLength);

    const xTip = origin.add(xDirection);
    const yTip = origin.add(yDirection);
    const zTip = origin.add(zDirection);

    createAxisLine(scene, "xAxisLine", xColor, origin, xTip);
    createAxisLine(scene, "yAxisLine", yColor, origin, yTip);
    createAxisLine(scene, "zAxisLine", zColor, origin, zTip);

    //createArrowHead(scene, "xArrow", xColor, xTip, "x");
    //createArrowHead(scene, "yArrow", yColor, yTip, "y");
    //createArrowHead(scene, "zArrow", zColor, zTip, "z");

    createArrowHead(scene, "xArrow", xColor, xTip, PHYSICAL_AXIS.x);
    createArrowHead(scene, "yArrow", yColor, yTip, PHYSICAL_AXIS.y);
    createArrowHead(scene, "zArrow", zColor, zTip, PHYSICAL_AXIS.z);

    const axisUI = AdvancedDynamicTexture.CreateFullscreenUI(
      "coordinateGizmoUI",
      true,
      scene,
    );

    function createGuiLabel(
      name: string,
      text: string,
      color: string,
    ): TextBlock {
      const label = new TextBlock(name, text);

      label.color = color;
      label.fontSize = GIZMO_STYLE.labelFontSize;
      label.fontWeight = "normal";
      label.width = "20px";
      label.height = "20px";
      label.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
      label.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

      axisUI.addControl(label);

      return label;
    }

    const labelX = createGuiLabel("labelX", "X", PHYSICAL_AXIS_COLOR.x);
    const labelY = createGuiLabel("labelY", "Y", PHYSICAL_AXIS_COLOR.y);
    const labelZ = createGuiLabel("labelZ", "Z", PHYSICAL_AXIS_COLOR.z);

    //const labelX = createGuiLabel("labelX", "X", "red");
    //const labelY = createGuiLabel("labelY", "Y", "lime");
    //const labelZ = createGuiLabel("labelZ", "Z", "deepskyblue");

    const labelDistance = GIZMO_STYLE.axisLength + GIZMO_STYLE.labelGap;
    const xLabelPos = xTip.add(PHYSICAL_AXIS.x.scale(labelDistance));
    const yLabelPos = yTip.add(PHYSICAL_AXIS.y.scale(labelDistance));
    const zLabelPos = zTip.add(PHYSICAL_AXIS.z.scale(labelDistance));

    /*const xLabelPos = xTip.add(
      new Vector3(GIZMO_STYLE.axisLength + GIZMO_STYLE.labelGap, 0, 0),
    );
    const yLabelPos = yTip.add(
      new Vector3(0, GIZMO_STYLE.axisLength + GIZMO_STYLE.labelGap, 0),
    );
    const zLabelPos = zTip.add(
      new Vector3(0, 0, GIZMO_STYLE.axisLength + GIZMO_STYLE.labelGap),
    );*/

    function updateAxisLabel(label: TextBlock, worldPos: Vector3) {
      const projected = Vector3.Project(
        worldPos,
        Matrix.Identity(),
        scene.getTransformMatrix(),
        camera.viewport.toGlobal(
          engine.getRenderWidth(),
          engine.getRenderHeight(),
        ),
      );

      const w = engine.getRenderWidth();
      const h = engine.getRenderHeight();

      label.left = `${projected.x - w / 2}px`;
      label.top = `${projected.y - h / 2}px`;
    }

    engine.runRenderLoop(() => {
      camera.alpha = mainCamera.alpha;
      camera.beta = mainCamera.beta;

      scene.render();

      updateAxisLabel(labelX, xLabelPos);
      updateAxisLabel(labelY, yLabelPos);
      updateAxisLabel(labelZ, zLabelPos);
    });

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener("resize", handleResize);
    engine.resize();

    return () => {
      window.removeEventListener("resize", handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, [mainCamera]);

  return <canvas ref={canvasRef} className="coordinate-gizmo" />;
}
