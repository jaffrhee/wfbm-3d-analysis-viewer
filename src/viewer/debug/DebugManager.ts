import type { ArcRotateCamera, Engine, Vector3 } from "@babylonjs/core";

export interface DebugInfo {
  fps: number;

  alpha: number;
  beta: number;
  radius: number;

  position: Vector3;
  target: Vector3;
}

export class DebugManager {
  private readonly engine: Engine;
  private readonly camera: ArcRotateCamera;

  constructor(engine: Engine, camera: ArcRotateCamera) {
    this.engine = engine;
    this.camera = camera;
  }

  getDebugInfo(): DebugInfo {
    return {
      fps: this.engine.getFps(),

      alpha: this.camera.alpha,
      beta: this.camera.beta,
      radius: this.camera.radius,

      position: this.camera.position.clone(),
      target: this.camera.target.clone(),
    };
  }
}