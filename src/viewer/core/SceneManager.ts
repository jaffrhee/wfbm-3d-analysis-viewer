import {
  //ArcRotateCamera,
  //Color3,
  Color4,
  Engine,
  HemisphericLight,
  //MeshBuilder,
  Scene,
  //StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { CameraController } from "../camera/CameraController";

import {
  VoxelRenderer,
  type FailCellRenderResult, // @20260719 추가 [성능측적용]
} from "../renderer/VoxelRenderer";
//import { generateMockChunk } from "../../data/MockGenerator";

// @20260719 [성능측정용] ViewerPerformanceInfo 인터페이스 정측
import { DEFAULT_PERFORMANCE_FAIL_RATE, PERFORMANCE_TOTAL_CELL_COUNT } from "../../data/PerformanceMockGenerator";
import type { ChunkGenerationOptions } from "../chunk/ChunkManager";

import {
  CoordinateMapper,
  WFBM_SIZE_X,
  WFBM_SIZE_Y,
  WFBM_SIZE_Z,
} from "./CoordinateMapper";

//import { BoundaryRenderer } from "../renderer/BoundaryRenderer";
import { ChunkManager } from "../chunk/ChunkManager";
import { ViewerEvents } from "./ViewerEvents";
import { VoxelGridRenderer } from "../renderer/VoxelGridRenderer";

//import { CameraGuideRenderer } from "../renderer/CameraGuideRenderer";

import type { ChunkCoord } from "../chunk/Chunk";

export interface ViewerPerformanceInfo {

  enabled: boolean;

  gridSize: string;
  totalCellCount: number;

  configuredFailRate: number;

  failRate: number;
  failCount: number;

  dataGenerationMs: number;
  thinInstanceBuildMs: number;
  loadToFirstFrameMs: number;
}

export class SceneManager {
  readonly scene: Scene;
  private readonly events: ViewerEvents;

  private cameraController: CameraController;
  private voxelRenderer: VoxelRenderer;
  //private boundaryRenderer: BoundaryRenderer;
  private voxelGridRenderer: VoxelGridRenderer;
  //private cameraGuideRenderer: CameraGuideRenderer;
  private chunkManager: ChunkManager;

  private currentChunk: ChunkCoord = { x: 0, y: 0 };

  private performanceInfo: ViewerPerformanceInfo = {

    enabled: false,

    gridSize: "64 × 300 × 64",

    totalCellCount: PERFORMANCE_TOTAL_CELL_COUNT,

    configuredFailRate:
      DEFAULT_PERFORMANCE_FAIL_RATE,

    failRate: 0,

    failCount: 0,

    dataGenerationMs: 0,

    thinInstanceBuildMs: 0,

    loadToFirstFrameMs: 0

  };

  private firstFrameStartTime: number | null = null;

  constructor(
    engine: Engine,
    canvas: HTMLCanvasElement,
    generationOptions?: Partial<ChunkGenerationOptions>
  ) {
    this.scene = new Scene(engine);
    this.scene.clearColor = new Color4(0.02, 0.03, 0.06, 1.0);
    this.cameraController = new CameraController(this.scene, canvas);

    /*this.cameraGuideRenderer = new CameraGuideRenderer(
      this.scene,
      this.cameraController.getCamera(),
    );*/

    new HemisphericLight("mainLight", new Vector3(0, 1, 0), this.scene);

    this.voxelRenderer = new VoxelRenderer(this.scene);
    this.voxelRenderer.renderReferenceCell();

    //this.boundaryRenderer = new BoundaryRenderer(this.scene);
    //this.boundaryRenderer.render();

    this.voxelGridRenderer = new VoxelGridRenderer(this.scene);
    this.voxelGridRenderer.render();

    // @20260719 기존 코드 [추후 원복 가능]]
    /*this.events = new ViewerEvents();
    this.chunkManager = new ChunkManager(this.events);

    this.events.addChunkChangedListener((chunk) => {
      this.voxelRenderer.renderFailCells(chunk.failCells);
    });

    const chunk = this.chunkManager.getCurrentChunk();

    this.voxelRenderer.renderFailCells(chunk.failCells);*/

    this.events = new ViewerEvents();

    const generationStartTime = performance.now();

    this.chunkManager = new ChunkManager(this.events, generationOptions);

    const dataGenerationMs = performance.now() - generationStartTime;

    const chunk = this.chunkManager.getCurrentChunk();

    const loadStartTime = generationStartTime;

    const renderResult = this.voxelRenderer.renderFailCells(chunk.failCells);

    this.updatePerformanceInfo(dataGenerationMs, renderResult);

    this.firstFrameStartTime = loadStartTime;

    this.scene.onAfterRenderObservable.add(() => {
      if (this.firstFrameStartTime === null) {
        return;
      }

      this.performanceInfo.loadToFirstFrameMs =
        performance.now() - this.firstFrameStartTime;

      this.firstFrameStartTime = null;
    });

    /*const center = CoordinateMapper.getWorldCenter(
      WFBM_SIZE_X,
      WFBM_SIZE_Y,
      WFBM_SIZE_Z,
    );
    this.cameraController.home(center);*/

    this.cameraController.home();
  }

  // @20260719 [기존 코드] 추후 원복 가능
  /*
  loadChunk(coord: ChunkCoord) {
    this.currentChunk = coord;

    //const chunk = generateMockChunk(coord);
    const chunk = this.chunkManager.switchChunk(coord);

    this.voxelRenderer.renderFailCells(chunk.failCells);

    console.log("Loaded Chunk:", chunk.key, "Fail:", chunk.failCells.length);
  }*/

  // @20260719 [성능측정용] loadChunk() 메서드 수정
  loadChunk(coord: ChunkCoord) {
    this.currentChunk = coord;

    const loadStartTime = performance.now();

    const generationStartTime = performance.now();

    const chunk = this.chunkManager.switchChunk(coord);

    const dataGenerationMs = performance.now() - generationStartTime;

    const renderResult = this.voxelRenderer.renderFailCells(chunk.failCells);

    this.updatePerformanceInfo(dataGenerationMs, renderResult);

    /**
     * 다음 scene.render()가 완료되면
     * onAfterRenderObservable에서
     * Load to First Frame 시간이 확정된다.
     */
    this.firstFrameStartTime = loadStartTime;

    console.log(
      "Loaded Chunk:",
      chunk.key,
      "Fail:",
      chunk.failCells.length,
      "Generation:",
      `${dataGenerationMs.toFixed(2)} ms`,
      "Thin Instance:",
      `${renderResult.thinInstanceBuildMs.toFixed(2)} ms`,
    );
  }

  setPerformanceOptions(
    enabled: boolean,
    failRate: number,
  ) {

    this.chunkManager.setPerformanceOptions(
      enabled,
      failRate,
    );

    this.loadChunk(
      this.currentChunk,
    );

  }

  // @20260719 [성능측정용] updatePerformanceInfo() 메서드 추가
  private updatePerformanceInfo(
    dataGenerationMs: number,
    renderResult: FailCellRenderResult,
  ) {
    const options =
      this.chunkManager.getGenerationOptions();

    this.performanceInfo = {

      ...this.performanceInfo,

      enabled:
        options.performanceEnabled,

      configuredFailRate:
        options.performanceFailRate,

      failRate:

        (
          renderResult.failCount
          /
          PERFORMANCE_TOTAL_CELL_COUNT
        )

        * 100,

      failCount:
        renderResult.failCount,

      dataGenerationMs,

      thinInstanceBuildMs:
        renderResult.thinInstanceBuildMs,

      loadToFirstFrameMs: 0

    };
  }

  // @20260719 [성능측정용] getPerformanceInfo() 메서드 추가
  getPerformanceInfo(): ViewerPerformanceInfo {
    return {
      ...this.performanceInfo,
    };
  }

  getCamera() {
    return this.cameraController.getCamera();
  }

  getCameraController() {
    return this.cameraController;
  }

  setBackFaceColor(color: string) {
    this.voxelGridRenderer.setBackFaceColor(color);
  }

  setSideFaceColor(color: string) {
    this.voxelGridRenderer.setSideFaceColor(color);
  }

  setPlaneAlpha(alpha: number) {
    this.voxelGridRenderer.setPlaneAlpha(alpha);
  }

  /*setCameraGuideVisible(visible: boolean) {
    this.cameraGuideRenderer.setVisible(visible);
  }*/

  autoFitCamera() {
    const center = CoordinateMapper.getWorldCenter(
      WFBM_SIZE_X,
      WFBM_SIZE_Y,
      WFBM_SIZE_Z,
    );

    const size = new Vector3(WFBM_SIZE_X, WFBM_SIZE_Y, WFBM_SIZE_Z);

    return this.cameraController.autoFit(center, size);
  }

  dispose() {
    //this.cameraGuideRenderer.dispose();
    this.voxelRenderer.dispose();
    //this.boundaryRenderer.dispose();
    this.voxelGridRenderer.dispose();
    this.scene.dispose();
  }
}
