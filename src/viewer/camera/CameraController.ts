import { ArcRotateCamera, Scene, Vector3 } from "@babylonjs/core";

/**
 * CameraController v2
 *
 * Camera UX Refactoring
 *
 * 2026-07
 */

export interface CameraState {
  alpha: number;
  beta: number;
  radius: number;

  position: {
    x: number;
    y: number;
    z: number;
  };

  target: {
    x: number;
    y: number;
    z: number;
  };
}

export class CameraController {
  readonly camera: ArcRotateCamera;

  // Navigation
  private readonly rotateStep = 0.12;
  private readonly zoomFactor = 0.9;
  private readonly panStep = 2;

  // Mouse Wheel Speed
  //
  // UI speed 1~150:
  // 기존 속도 매핑을 그대로 유지한다.
  //
  // UI speed 151~200:
  // 기존 최대 속도보다 빠른 확장 영역으로 사용한다.
  private readonly defaultWheelSpeed = 150;

  private readonly legacyMaxWheelSpeed = 150;
  private readonly maxWheelSpeed = 200;

  // Babylon wheelPrecision은 값이 작을수록 빠르다.
  private readonly maxWheelPrecision = 200;

  // 기존 UI speed 150에 대응하는 precision
  private readonly legacyMinWheelPrecision = 0.2;

  // 새 UI speed 200에 대응하는 precision
  private readonly extendedMinWheelPrecision = 0.05;

  // Home
  //private homeTarget = Vector3.Zero();
  private homeTarget = new Vector3(
    -39.6,
    113.0,
    109.2
  );

  private readonly homeView = {
    //alpha: -0.793,
    //beta: 0.788,
    //radius: 620,
    alpha: -0.793,
    beta: 0.788,
    radius: 620,
  };

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.camera = new ArcRotateCamera(
      "mainCamera",
      this.homeView.alpha,
      this.homeView.beta,
      this.homeView.radius,
      this.homeTarget,
      scene,
    );

    this.camera.attachControl(canvas, true);

    this.configure();
  }

  private configure() {
    this.camera.lowerRadiusLimit = 0.1;
    this.camera.upperRadiusLimit = 2000;

    this.camera.panningSensibility = 50;

    // WFBM에서는 휠 조작에 따라 Target이 이동하는 부작용을 막는다.
    this.camera.zoomToMouseLocation = false;

    // 기본값도 반드시 동일한 변환 함수를 통해 적용한다.
    this.setMouseWheelSpeed(this.defaultWheelSpeed);
  }

  // ---------------------------------------------------------------------------
  // Home / Focus
  // ---------------------------------------------------------------------------

  home(target?: Vector3) {
    if (target) {
      this.homeTarget.copyFrom(target);
    }

    // Target을 먼저 적용한 뒤 Orbit 상태를 복원한다.
    this.camera.setTarget(this.homeTarget);

    this.camera.alpha = this.homeView.alpha;
    this.camera.beta = this.homeView.beta;
    this.camera.radius = this.homeView.radius;
  }

  focus(position: Vector3, radius = 20) {
    this.camera.setTarget(position);
    this.camera.radius = radius;
  }

  /**
 * 현재 alpha / beta를 유지한 채,
 * 지정된 3D 범위가 현재 Canvas 안에 들어오도록
 * Target과 Radius를 계산한다.
 */
  autoFit(
    center: Vector3,
    size: Vector3,
    padding = 1.08,
  ) {
    const engine = this.camera.getEngine();

    const renderWidth = Math.max(1, engine.getRenderWidth());
    const renderHeight = Math.max(1, engine.getRenderHeight());
    const aspectRatio = renderWidth / renderHeight;

    // Auto Fit의 기준 Target
    this.camera.setTarget(center);

    /*
     * 현재 alpha / beta 방향에서 Camera의
     * forward / right / up 축을 계산하기 위해
     * 임시 radius를 적용한다.
     */
    this.camera.radius = 1;
    this.camera.getViewMatrix(true);

    const cameraPosition = this.camera.position.clone();

    const forward = center
      .subtract(cameraPosition)
      .normalize();

    const right = Vector3.Cross(
      forward,
      this.camera.upVector,
    ).normalize();

    const up = Vector3.Cross(
      right,
      forward,
    ).normalize();

    /*
     * Babylon camera.fov는 수직 FOV다.
     * Canvas aspect ratio를 사용해 수평 FOV를 계산한다.
     */
    const halfVerticalFov = this.camera.fov * 0.5;

    const halfHorizontalFov = Math.atan(
      Math.tan(halfVerticalFov) * aspectRatio,
    );

    const tanHalfVerticalFov = Math.tan(halfVerticalFov);
    const tanHalfHorizontalFov = Math.tan(halfHorizontalFov);

    const halfSize = size.scale(0.5);

    let requiredRadius = 0;

    /*
     * Bounding Box의 8개 꼭짓점을 현재 Camera 축으로 투영해
     * 가로·세로 화면 안에 모두 들어오는 최소 Radius를 계산한다.
     */
    for (const xSign of [-1, 1]) {
      for (const ySign of [-1, 1]) {
        for (const zSign of [-1, 1]) {
          const offset = new Vector3(
            halfSize.x * xSign,
            halfSize.y * ySign,
            halfSize.z * zSign,
          );

          const horizontal = Math.abs(
            Vector3.Dot(offset, right),
          );

          const vertical = Math.abs(
            Vector3.Dot(offset, up),
          );

          const depthOffset = Vector3.Dot(
            offset,
            forward,
          );

          const horizontalRadius =
            horizontal / tanHalfHorizontalFov - depthOffset;

          const verticalRadius =
            vertical / tanHalfVerticalFov - depthOffset;

          requiredRadius = Math.max(
            requiredRadius,
            horizontalRadius,
            verticalRadius,
          );
        }
      }
    }

    const fittedRadius = Math.max(
      this.camera.lowerRadiusLimit ?? 0.1,
      requiredRadius * padding,
    );

    /*
     * 계산 결과가 기존 upperRadiusLimit보다 크면
     * Auto Fit 자체가 제한되지 않도록 상한도 확장한다.
     */
    if (
      this.camera.upperRadiusLimit !== null &&
      fittedRadius > this.camera.upperRadiusLimit
    ) {
      this.camera.upperRadiusLimit = fittedRadius * 1.2;
    }

    this.camera.radius = fittedRadius;
    this.camera.getViewMatrix(true);

    return fittedRadius;
  }

  /**
   * 기존 호출부 호환을 위해 유지한다.
   * 현재 Camera의 Target과 Radius를 즉시 변경한다.
   */
  setHomeTarget(target: Vector3, radius: number) {
    this.camera.setTarget(target);
    this.camera.radius = radius;
  }

  // ---------------------------------------------------------------------------
  // Camera Access / State
  // ---------------------------------------------------------------------------

  getCamera() {
    return this.camera;
  }

  getViewState() {
    return {
      alpha: this.camera.alpha,
      beta: this.camera.beta,
      radius: this.camera.radius,
    };
  }

  getTargetState() {
    return {
      x: this.camera.target.x,
      y: this.camera.target.y,
      z: this.camera.target.z,
    };
  }

  getCameraState(): CameraState {
    return {
      alpha: this.camera.alpha,
      beta: this.camera.beta,
      radius: this.camera.radius,

      position: {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z,
      },

      target: {
        x: this.camera.target.x,
        y: this.camera.target.y,
        z: this.camera.target.z,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Rotate
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Zoom
  // ---------------------------------------------------------------------------

  zoomIn() {
    this.camera.radius *= this.zoomFactor;
  }

  zoomOut() {
    this.camera.radius /= this.zoomFactor;
  }

  // ---------------------------------------------------------------------------
  // Pan
  // ---------------------------------------------------------------------------

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
    this.camera.target.addInPlace(new Vector3(dx, dy, dz));
  }

  // ---------------------------------------------------------------------------
  // Live Tuning
  // ---------------------------------------------------------------------------

  applyView(alpha: number, beta: number, radius: number) {
    this.camera.alpha = alpha;
    this.camera.beta = beta;
    this.camera.radius = radius;
  }

  applyTarget(x: number, y: number, z: number) {
    this.camera.target.set(x, y, z);
  }

  /*
  ArcRotateCamera에서 Position을 바꾸면 현재 Target을 기준으로 
  alpha, beta, radius도 다시 계산된다. 이후 Config 동기화 타이머가 
  재계산된 값을 다시 슬라이더에 반영하게 된다.
  */
  applyPosition(x: number, y: number, z: number) {
    this.camera.setPosition(new Vector3(x, y, z));
  }

  // ---------------------------------------------------------------------------
  // Mouse Wheel Speed
  // ---------------------------------------------------------------------------

  setMouseWheelSpeed(speed: number) {
    const clampedSpeed = Math.max(1, Math.min(speed, this.maxWheelSpeed));

    if (clampedSpeed <= this.legacyMaxWheelSpeed) {
      // UI 1~150:
      // 기존 매핑을 그대로 유지한다.
      const t = (clampedSpeed - 1) / (this.legacyMaxWheelSpeed - 1);

      this.camera.wheelPrecision =
        this.maxWheelPrecision -
        t * (this.maxWheelPrecision - this.legacyMinWheelPrecision);

      return;
    }

    // UI 151~200:
    // 기존 speed 150보다 빠른 확장 구간이다.
    const t =
      (clampedSpeed - this.legacyMaxWheelSpeed) /
      (this.maxWheelSpeed - this.legacyMaxWheelSpeed);

    this.camera.wheelPrecision =
      this.legacyMinWheelPrecision -
      t * (this.legacyMinWheelPrecision - this.extendedMinWheelPrecision);
  }

  getMouseWheelSpeed() {
    const precision = this.camera.wheelPrecision;

    if (precision >= this.legacyMinWheelPrecision) {
      // Precision → 기존 UI speed 1~150 역변환
      const t =
        (this.maxWheelPrecision - precision) /
        (this.maxWheelPrecision - this.legacyMinWheelPrecision);

      const speed = 1 + t * (this.legacyMaxWheelSpeed - 1);

      return Math.round(Math.max(1, Math.min(speed, this.legacyMaxWheelSpeed)));
    }

    // Precision → 확장 UI speed 151~200 역변환
    const t =
      (this.legacyMinWheelPrecision - precision) /
      (this.legacyMinWheelPrecision - this.extendedMinWheelPrecision);

    const speed =
      this.legacyMaxWheelSpeed +
      t * (this.maxWheelSpeed - this.legacyMaxWheelSpeed);

    return Math.round(
      Math.max(this.legacyMaxWheelSpeed, Math.min(speed, this.maxWheelSpeed)),
    );
  }
}
