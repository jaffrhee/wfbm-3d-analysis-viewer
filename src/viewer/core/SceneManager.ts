import {
  //ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { CameraController } from "../camera/CameraController";

export class SceneManager {
  readonly scene: Scene;
  private cameraController: CameraController;

  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    this.scene = new Scene(engine);

    this.scene.clearColor = new Color4(0.02, 0.03, 0.06, 1.0);

    this.cameraController =
        new CameraController(
            this.scene,
            canvas
    );

    new HemisphericLight(
      "mainLight",
      new Vector3(0, 1, 0),
      this.scene
    );

    this.createReferenceCell();
  }

  private createReferenceCell() {
    const refCell = MeshBuilder.CreateBox(
      "referenceCell",
      {
        size: 1,
      },
      this.scene
    );

    refCell.position = new Vector3(0, 0, 0);

    const mat = new StandardMaterial("referenceCellMaterial", this.scene);
    mat.diffuseColor = new Color3(1.0, 0.85, 0.1);
    mat.emissiveColor = new Color3(0.8, 0.6, 0.0);

    refCell.material = mat;
  }

  dispose() {
    this.scene.dispose();
  }
}