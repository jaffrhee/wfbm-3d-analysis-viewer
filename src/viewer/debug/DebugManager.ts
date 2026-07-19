// 기존 코드 @20260719
/*import type { ArcRotateCamera, Engine, Vector3 } from "@babylonjs/core";

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
}*/

// 새 코드 @20260719
import type {
  ArcRotateCamera,
  Engine,
  Scene,
  Vector3,
} from "@babylonjs/core";

import type {
  ViewerPerformanceInfo,
} from "../core/SceneManager";

export interface DebugInfo {
  fps: number;

  meshCount: number;
  activeMeshCount: number;

  alpha: number;
  beta: number;
  radius: number;

  position: Vector3;
  target: Vector3;

  performance: ViewerPerformanceInfo;
}

export class DebugManager {
  private readonly engine: Engine;
  private readonly camera: ArcRotateCamera;
  private readonly scene: Scene;

  private readonly getPerformanceInfo:
    () => ViewerPerformanceInfo;

  constructor(
    engine: Engine,
    camera: ArcRotateCamera,
    scene: Scene,
    getPerformanceInfo:
      () => ViewerPerformanceInfo,
  ) {
    this.engine = engine;
    this.camera = camera;
    this.scene = scene;
    this.getPerformanceInfo =
      getPerformanceInfo;
  }

  getDebugInfo(): DebugInfo {
    return {
      fps: this.engine.getFps(),

      meshCount:
        this.scene.meshes.length,

      activeMeshCount:
        this.scene
          .getActiveMeshes()
          .length,

      alpha: this.camera.alpha,
      beta: this.camera.beta,
      radius: this.camera.radius,

      position:
        this.camera.position.clone(),

      target:
        this.camera.target.clone(),

      performance:
        this.getPerformanceInfo(),
    };
  }
}