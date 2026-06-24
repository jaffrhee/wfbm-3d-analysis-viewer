import { Engine } from "@babylonjs/core";
import { SceneManager } from "./SceneManager";

export class ViewerEngine {
  private readonly engine: Engine;
  private readonly sceneManager: SceneManager;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });

    this.sceneManager = new SceneManager(this.engine, canvas);

    window.addEventListener("resize", this.handleResize);
  }

  start() {
    const scene = this.sceneManager.scene;

    this.engine.runRenderLoop(() => {
      scene.render();
    });
  }

  dispose() {
    window.removeEventListener("resize", this.handleResize);

    this.sceneManager.dispose();
    this.engine.dispose();
  }

  private handleResize = () => {
    this.engine.resize();
  };
}