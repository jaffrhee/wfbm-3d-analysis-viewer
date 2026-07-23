import { Engine } from "@babylonjs/core";
import { SceneManager } from "./SceneManager";
import { DebugManager } from "../debug/DebugManager";
import type { ChunkGenerationOptions } from "../chunk/ChunkManager";
import type { FailCellPickedListener } from "../interaction/PickingManager";
import type { SelectionChangedListener } from "../interaction/SelectionManager";
import type { RelationChangedListener } from "../interaction/RelationManager";

export class ViewerEngine {
  private readonly engine: Engine;
  private readonly sceneManager: SceneManager;
  private readonly debugManager: DebugManager;

  constructor(
    canvas: HTMLCanvasElement,
    generationOptions: ChunkGenerationOptions,
  ) {
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });

    this.sceneManager = new SceneManager(this.engine, canvas, generationOptions);

    //this.debugManager = new DebugManager(this.engine, this.sceneManager.getCamera()); // 기존 코드 @20260719
    // 새 코드 @20260719 [성능측정용 DebugManager 생성자에 Scene과 getPerformanceInfo() 추가]
    this.debugManager = new DebugManager(
      this.engine,
      this.sceneManager.getCamera(),
      this.sceneManager.scene,
      () => this.sceneManager.getPerformanceInfo(),
    );

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


  setFailCellPickedListener(
    listener: FailCellPickedListener | null,
  ) {
    this.sceneManager.setFailCellPickedListener(
      listener,
    );
  }


  setSelectionChangedListener(
    listener: SelectionChangedListener | null,
  ) {
    this.sceneManager.setSelectionChangedListener(listener);
  }

  setRelationAnalysisChangedListener(
    listener: RelationChangedListener | null,
  ) {
    this.sceneManager.setRelationAnalysisChangedListener(
      listener,
    );
  }

  getRelationAnalysisResult() {
    return this.sceneManager.getRelationAnalysisResult();
  }

  clearSelection() {
    this.sceneManager.clearSelection();
  }

  getSelectedFailCells() {
    return this.sceneManager.getSelectedFailCells();
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

  setBackFaceColor(color: string) {
    this.sceneManager.setBackFaceColor(color);
  }

  setSideFaceColor(color: string) {
    this.sceneManager.setSideFaceColor(color);
  }

  setPlaneAlpha(alpha: number) {
    this.sceneManager.setPlaneAlpha(alpha);
  }

  autoFitCamera() {
    return this.sceneManager.autoFitCamera();
  }

  /*setCameraGuideVisible(visible: boolean) {
    this.sceneManager.setCameraGuideVisible(visible);
  }*/

  setPerformanceOptions(
    enabled: boolean,
    failRate: number,
  ) {
    this.sceneManager.setPerformanceOptions(
      enabled,
      failRate,
    );
  }
}
