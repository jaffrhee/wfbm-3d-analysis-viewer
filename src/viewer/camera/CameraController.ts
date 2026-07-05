import { ArcRotateCamera, Scene, Vector3 } from "@babylonjs/core";

export class CameraController {
  readonly camera: ArcRotateCamera;
  private readonly defaultTarget = new Vector3(0, 0, 0);
  private readonly defaultRadius = 180;
  private readonly rotateStep = 0.12;
  private readonly zoomFactor = 0.9;
  private readonly defaultWheelPrecision = 30;
  private readonly minWheelPrecision = 0.2;
  private readonly maxWheelPrecision = 100;

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.camera = new ArcRotateCamera(
      "mainCamera",

      -Math.PI / 4,
      Math.PI / 3,

      this.defaultRadius,

      this.defaultTarget,

      scene,
    );

    this.camera.attachControl(canvas, true);

    this.configure();
  }

  private configure() {
    this.camera.lowerRadiusLimit = 1;
    this.camera.upperRadiusLimit = 1000;
    this.camera.wheelPrecision = this.defaultWheelPrecision;
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
    this.camera.beta = Math.min(
      Math.PI - 0.15,
      this.camera.beta + this.rotateStep,
    );
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

  setMouseWheelSpeed(speed: number) {
    // speed: 1(slow) ~ 100(fast)
    // Babylon wheelPrecision은 작을수록 빠름
    //const wheelPrecision = 105 - speed;
    //this.camera.wheelPrecision = wheelPrecision;

    // speed: 1 ~ 150
    const t = (speed - 1) / (150 - 1);

    const wheelPrecision =
      this.maxWheelPrecision -
      t * (this.maxWheelPrecision - this.minWheelPrecision);

    this.camera.wheelPrecision = wheelPrecision;
  }

  getMouseWheelSpeed() {
    //return 105 - this.camera.wheelPrecision;

    const p = this.camera.wheelPrecision;
    const t =
      (this.maxWheelPrecision - p) /
      (this.maxWheelPrecision - this.minWheelPrecision);

    return Math.round(1 + t * (150 - 1));
  }
}
