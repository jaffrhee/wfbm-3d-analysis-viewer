import { Engine } from "@babylonjs/core";
import { SceneManager } from "./SceneManager";
import { DebugManager } from "../debug/DebugManager";

export class ViewerEngine {
  private readonly engine: Engine;
  private readonly sceneManager: SceneManager;
  private readonly debugManager: DebugManager;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });

    this.sceneManager = new SceneManager(this.engine, canvas);
    this.debugManager = new DebugManager(this.engine, this.sceneManager.getCamera());

    window.addEventListener("resize", this.handleResize);
  }

  start() {
    const scene = this.sceneManager.scene;

    this.engine.runRenderLoop(() => {
      scene.render();
    });
  }

  loadChunk(x: number, y: number) {
    this.sceneManager.loadChunk({ x, y });
  }

  getDebugInfo() {
    return this.debugManager.getDebugInfo();
  }

  dispose() {
    window.removeEventListener("resize", this.handleResize);

    this.sceneManager.dispose();
    this.engine.dispose();
  }

  private handleResize = () => {
    this.engine.resize();
  };

  getCamera() {
    return this.sceneManager.getCamera();
  }

  getCameraController() {
    return this.sceneManager.getCameraController();
  }

  getFps() {
    return this.engine.getFps();
  }
}
