import {
  Matrix,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";

import type { CellData } from "../../data/CellData";
import { CoordinateMapper } from "../core/CoordinateMapper";

export interface FailCellRenderResult {
  failCount: number;
  thinInstanceBuildMs: number;
}

export class VoxelRenderer {
  private readonly scene: Scene;

  private failBaseMesh: Mesh | null = null;
  private failMaterial: StandardMaterial | null = null;
  private referenceMesh: Mesh | null = null;

  private renderedFailCells: CellData[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
    this.createFailBaseMesh();
  }

  // 기존 RenderFailCells() 메서드 제거 추후 원복 가능
  /*
  renderFailCells(cells: CellData[]) {

    if (!this.failBaseMesh) {
      return;
    }

    const failCells = cells.filter(c => c.isFail);

    const matrices = new Float32Array(16 * failCells.length);

    failCells.forEach(
      (cell, index) => {

        const pos = CoordinateMapper.physicalToWorld(cell);
        const matrix = Matrix.Translation(pos.x, pos.y, pos.z);

        matrix.copyToArray(matrices, index * 16);
      }
    );

    this.failBaseMesh.thinInstanceSetBuffer(
      "matrix",
      matrices,
      16
    );

    this.failBaseMesh.thinInstanceRefreshBoundingInfo();
  }
  */
  renderFailCells(cells: CellData[]): FailCellRenderResult {
    const startTime = performance.now();

    if (!this.failBaseMesh) {
      return {
        failCount: 0,
        thinInstanceBuildMs: 0,
      };
    }

    /**
     * 현재 Benchmark 데이터는 모두 FAIL Cell이므로
     * MockGenerator에서 failCells를 전달하면
     * 추가 filter가 필요 없다.
     *
     * 일반 데이터에서도 SceneManager가 chunk.failCells를
     * 넘기고 있으므로 그대로 사용하면 된다.
     */
    const failCells = cells;

    // thinInstanceIndex must always resolve to the same CellData index.
    this.renderedFailCells = [...failCells];

    const matrices = new Float32Array(16 * failCells.length);

    for (let index = 0; index < failCells.length; index++) {
      const cell = failCells[index];

      const pos = CoordinateMapper.physicalToWorld(cell);

      const matrix = Matrix.Translation(pos.x, pos.y, pos.z);

      matrix.copyToArray(matrices, index * 16);
    }

    this.failBaseMesh.thinInstanceSetBuffer("matrix", matrices, 16);

    this.failBaseMesh.thinInstanceRefreshBoundingInfo();

    const thinInstanceBuildMs = performance.now() - startTime;

    return {
      failCount: failCells.length,
      thinInstanceBuildMs,
    };
  }

  renderReferenceCell() {
    if (this.referenceMesh) {
      this.referenceMesh.dispose();
    }

    const refCell = MeshBuilder.CreateBox(
      "referenceCell",
      {
        size: 1.2,
      },
      this.scene,
    );

    const material = new StandardMaterial("referenceCellMaterial", this.scene);
    material.diffuseColor = new Color3(1.0, 0.85, 0.05);
    material.emissiveColor = new Color3(0.8, 0.55, 0.0);

    refCell.material = material;

    refCell.enableEdgesRendering();

    refCell.edgesWidth = 2.2;

    refCell.edgesColor.set(1.0, 1.0, 1.0, 1.0);

    // Physical (0,0,0)
    refCell.position = CoordinateMapper.physicalToWorld({
      id: "reference",
      physicalX: 0,
      physicalY: 0,
      physicalZ: 0,
      isFail: false,
      type: "reference",
    });

    this.referenceMesh = refCell;
  }

  private createFailBaseMesh() {
    this.failBaseMesh = MeshBuilder.CreateBox(
      "failCellBase",
      {
        size: 0.9,
      },
      this.scene,
    );

    // Thin Instance Picking 활성화
    this.failBaseMesh.isPickable = true;
    this.failBaseMesh.thinInstanceEnablePicking = true;

    this.failMaterial = new StandardMaterial("failCellMaterial", this.scene);

    this.failMaterial.diffuseColor = new Color3(1, 0.05, 0.08);
    this.failMaterial.emissiveColor = new Color3(0.45, 0, 0);

    this.failBaseMesh.material = this.failMaterial;

    // ---------- Edge ----------
    this.failBaseMesh.enableEdgesRendering();

    this.failBaseMesh.edgesWidth = 2.0;

    this.failBaseMesh.edgesColor.set(1.0, 1.0, 1.0, 0.95);
  }

  getFailBaseMesh(): Mesh | null {
    return this.failBaseMesh;
  }

  getFailCellByThinInstanceIndex(
    thinInstanceIndex: number,
  ): CellData | null {
    return this.renderedFailCells[thinInstanceIndex] ?? null;
  }

  getFailCellWorldPosition(
    thinInstanceIndex: number,
  ) {
    const cell =
      this.getFailCellByThinInstanceIndex(
        thinInstanceIndex,
      );

    return cell
      ? CoordinateMapper.physicalToWorld(cell)
      : null;
  }

  clearFailCells() {
    if (!this.failBaseMesh) {
      return;
    }

    this.renderedFailCells = [];

    this.failBaseMesh.thinInstanceSetBuffer("matrix", new Float32Array(), 16);
  }

  dispose() {
    this.renderedFailCells = [];

    if (this.failBaseMesh) {
      this.failBaseMesh.dispose();
      this.failBaseMesh = null;
    }

    if (this.referenceMesh) {
      this.referenceMesh.dispose();
      this.referenceMesh = null;
    }
  }
}
