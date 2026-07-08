import { ArcRotateCamera, Scene, Vector3 } from "@babylonjs/core";

export class CameraController {

  readonly camera: ArcRotateCamera;

  //private readonly defaultTarget = new Vector3(0, 0, 0);
  //private readonly defaultRadius = 180;

  private readonly rotateStep = 0.12;
  private readonly zoomFactor = 0.9;

  private readonly defaultWheelSpeed = 100;
  private readonly defaultWheelPrecision = 105 - this.defaultWheelSpeed; // 30 -> 105 - this.defaultWheelSpeed; 
  private readonly minWheelPrecision = 0.2;
  private readonly maxWheelPrecision = 100;

  private readonly panStep = 2;   //6 -> 2

  private homeTarget = new Vector3(0, 0, 0);

  private readonly homeView = {

    alpha: -0.793,
    beta: 0.788,

    radius: 620,

    target: Vector3.Zero(),
  };


  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.camera = new ArcRotateCamera(
      "mainCamera",

      /*-Math.PI / 4,
      Math.PI / 3,

      this.defaultRadius,

      this.defaultTarget,*/
      this.homeView.alpha,
      this.homeView.beta,

      this.homeView.radius,

      this.homeView.target,

      scene,
    );

    this.camera.attachControl(canvas, true);

    this.configure();
  }

  private configure() {
    this.camera.lowerRadiusLimit = 0.1;   //1 -> 0.1
    this.camera.upperRadiusLimit = 2000;
    this.camera.wheelPrecision = this.defaultWheelPrecision;
    this.camera.panningSensibility = 50;

    this.camera.zoomToMouseLocation = false;   //WFBM에는 부작용이 크다. 끄는 게 맞음
  }

  //home(target = this.defaultTarget, radius = this.defaultRadius) {
  home(target?: Vector3) {
    if (target) {
      this.homeTarget = target.clone();
    }

    /*this.camera.alpha = -Math.PI / 4;
    this.camera.beta = Math.PI / 3;
    this.camera.radius = radius;*/

    // 중요: setTarget 먼저
    this.camera.setTarget(this.homeTarget);

    // 그 다음 Home View 적용
    this.camera.alpha = this.homeView.alpha;
    this.camera.beta = this.homeView.beta;
    this.camera.radius = this.homeView.radius;

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

  panLeft() {
    this.panTarget(-this.panStep, 0, 0);
  }

  panRight() {
    this.panTarget(this.panStep, 0, 0);
  }

  panUp() {
    this.panTarget(0, this.panStep, 0);
  }

  panDown() {
    this.panTarget(0, -this.panStep, 0);
  }

  panForward() {
    this.panTarget(0, 0, this.panStep);
  }

  panBackward() {
    this.panTarget(0, 0, -this.panStep);
  }

  private panTarget(dx: number, dy: number, dz: number) {
    //const nextTarget = this.camera.target.add(new Vector3(dx, dy, dz));
    this.camera.target.add(new Vector3(dx, dy, dz));
    //this.camera.setTarget(nextTarget);
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

  applyTarget(x: number, y: number, z: number) {
    this.camera.target.set(x, y, z);
  }

  getTargetState() {
    return {
      x: this.camera.target.x,
      y: this.camera.target.y,
      z: this.camera.target.z,
    };
  }
}