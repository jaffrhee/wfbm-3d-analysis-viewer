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

import { VoxelRenderer } from "../renderer/VoxelRenderer";
//import { generateMockChunk } from "../../data/MockGenerator";

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

import type { ChunkCoord } from "../chunk/Chunk";

export class SceneManager {
  readonly scene: Scene;
  private readonly events: ViewerEvents;

  private cameraController: CameraController;
  private voxelRenderer: VoxelRenderer;
  //private boundaryRenderer: BoundaryRenderer;
  private voxelGridRenderer: VoxelGridRenderer;
  private chunkManager: ChunkManager;

  private currentChunk: ChunkCoord = { x: 0, y: 0 };

  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    this.scene = new Scene(engine);
    this.scene.clearColor = new Color4(0.02, 0.03, 0.06, 1.0);
    this.cameraController = new CameraController(this.scene, canvas);

    new HemisphericLight("mainLight", new Vector3(0, 1, 0), this.scene);

    this.voxelRenderer = new VoxelRenderer(this.scene);
    this.voxelRenderer.renderReferenceCell();

    //this.boundaryRenderer = new BoundaryRenderer(this.scene);
    //this.boundaryRenderer.render();

    this.voxelGridRenderer = new VoxelGridRenderer(this.scene);
    this.voxelGridRenderer.render();

    this.events = new ViewerEvents();
    this.chunkManager = new ChunkManager(this.events);

    this.events.addChunkChangedListener((chunk) => {
      this.voxelRenderer.renderFailCells(chunk.failCells);
    });

    const chunk = this.chunkManager.getCurrentChunk();

    this.voxelRenderer.renderFailCells(chunk.failCells);

    const center = CoordinateMapper.getWorldCenter(
      WFBM_SIZE_X,
      WFBM_SIZE_Y,
      WFBM_SIZE_Z,
    );
    this.cameraController.home(center, 450);
  }

  loadChunk(coord: ChunkCoord) {
    this.currentChunk = coord;

    //const chunk = generateMockChunk(coord);
    const chunk = this.chunkManager.switchChunk(coord);

    this.voxelRenderer.renderFailCells(chunk.failCells);

    console.log("Loaded Chunk:", chunk.key, "Fail:", chunk.failCells.length);
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

  dispose() {
    this.voxelRenderer.dispose();
    //this.boundaryRenderer.dispose();
    this.voxelGridRenderer.dispose();
    this.scene.dispose();
  }
}
