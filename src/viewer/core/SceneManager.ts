import {
  //ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { CameraController } from "../camera/CameraController";

import { VoxelRenderer } from "../renderer/VoxelRenderer";
import { generateMockChunk } from "../../data/MockGenerator";

import { CoordinateMapper, WFBM_SIZE_X, WFBM_SIZE_Y, WFBM_SIZE_Z, } from "./CoordinateMapper";

import type { ChunkCoord } from "../chunk/Chunk";

export class SceneManager {
  readonly scene: Scene;
  private cameraController: CameraController;
  private voxelRenderer: VoxelRenderer;

  private currentChunk: ChunkCoord = { x: 0, y: 0 };

  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    this.scene = new Scene(engine);
    this.scene.clearColor = new Color4(0.02, 0.03, 0.06, 1.0);
    this.cameraController =
      new CameraController(
        this.scene,
        canvas
      );

    new HemisphericLight(
      "mainLight",
      new Vector3(0, 1, 0),
      this.scene
    );

    this.voxelRenderer = new VoxelRenderer(this.scene);
    this.voxelRenderer.renderReferenceCell();

    /*const chunk = generateMockChunk({
      x: 0,
      y: 0
    });
    this.voxelRenderer.renderFailCells(chunk.failCells);*/

    this.loadChunk({
      x: 0,
      y: 0
    });

    const center = CoordinateMapper.getWorldCenter(WFBM_SIZE_X, WFBM_SIZE_Y, WFBM_SIZE_Z);
    this.cameraController.home(center, 450);
  }

  loadChunk(
    coord: ChunkCoord
  ) {

    this.currentChunk = coord;

    const chunk = generateMockChunk(coord);

    this.voxelRenderer.renderFailCells(chunk.failCells);

    console.log(
      "Loaded Chunk:",
      chunk.key,
      "Fail:",
      chunk.failCells.length
    );

  }

  dispose() {
    this.voxelRenderer.dispose();
    this.scene.dispose();
  }
}