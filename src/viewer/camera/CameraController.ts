import {
  ArcRotateCamera,
  Scene,
  Vector3,
} from "@babylonjs/core";

export class CameraController {

  readonly camera: ArcRotateCamera;
  private readonly defaultTarget = new Vector3(0, 0, 0);
  private readonly defaultRadius = 180;

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.camera =
      new ArcRotateCamera(
        "mainCamera",

        -Math.PI / 4,
        Math.PI / 3,

        this.defaultRadius,

        this.defaultTarget,

        scene
      );

    this.camera.attachControl(
      canvas,
      true
    );

    this.configure();
  }

  private configure() {
    this.camera.lowerRadiusLimit = 1;
    this.camera.upperRadiusLimit = 1000;
    this.camera.wheelPrecision = 30;
    this.camera.panningSensibility = 50;
  }

  home(target = this.defaultTarget, radius = this.defaultRadius) {
    this.camera.alpha = -Math.PI / 4;
    this.camera.beta = Math.PI / 3;
    this.camera.radius = radius;
    this.camera.setTarget(target);
  }

  focus(position: Vector3, radius = 20) {
    this.camera.setTarget(position);
    this.camera.radius = radius;
  }

  setHomeTarget(target: Vector3, radius: number) {
    this.camera.setTarget(target);
    this.camera.radius = radius;
  }
}