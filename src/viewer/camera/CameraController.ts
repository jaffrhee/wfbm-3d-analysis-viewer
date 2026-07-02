import {
  ArcRotateCamera,
  Scene,
  Vector3,
} from "@babylonjs/core";

export class CameraController {

  readonly camera: ArcRotateCamera;
  private readonly defaultTarget = new Vector3(0, 0, 0);
  private readonly defaultRadius = 180;
  private readonly rotateStep = 0.12;
  private readonly zoomFactor = 0.9;


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

  getCamera() {
    return this.camera;
  }

  rotateLeft() {
    this.camera.alpha -= this.rotateStep;
  }

  rotateRight() {
    this.camera.alpha += this.rotateStep;
  }

  rotateUp() {
    this.camera.beta = Math.max(0.15, this.camera.beta - this.rotateStep);
  }

  rotateDown() {
    this.camera.beta = Math.min(Math.PI - 0.15, this.camera.beta + this.rotateStep);
  }

  zoomIn() {
    this.camera.radius *= this.zoomFactor;
  }

  zoomOut() {
    this.camera.radius /= this.zoomFactor;
  }

  applyView(alpha: number, beta: number, radius: number) {
    this.camera.alpha = alpha;
    this.camera.beta = beta;
    this.camera.radius = radius;
  }

  getViewState() {
    return {
      alpha: this.camera.alpha,
      beta: this.camera.beta,
      radius: this.camera.radius,
    };
  }
}