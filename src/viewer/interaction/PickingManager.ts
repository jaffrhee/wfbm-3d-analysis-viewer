import {
  PointerEventTypes,
  type Observer,
  type PointerInfo,
  type Scene,
  Vector3,
} from "@babylonjs/core";

import type { CellData } from "../../data/CellData";
import type { VoxelRenderer } from "../renderer/VoxelRenderer";

export interface PickedFailCell {
  cell: CellData;
  physicalAddress: {
    x: number;
    y: number;
    z: number;
  };
  worldPosition: Vector3;
  thinInstanceIndex: number;
}

export type FailCellPickedListener = (
  result: PickedFailCell,
) => void;

/**
 * Resolves a Babylon thin-instance pick into a WFBM Fail Cell.
 *
 * Responsibilities are intentionally limited to:
 * - listening for a left-click pick
 * - confirming that the picked mesh is the Fail Cell base mesh
 * - resolving thinInstanceIndex -> CellData
 * - returning the Physical Address
 *
 * Selection/highlight/relation analysis are handled by later managers.
 */
export class PickingManager {
  private readonly scene: Scene;
  private readonly voxelRenderer: VoxelRenderer;

  private pointerObserver: Observer<PointerInfo> | null = null;
  private listener: FailCellPickedListener | null = null;

  constructor(
    scene: Scene,
    voxelRenderer: VoxelRenderer,
  ) {
    this.scene = scene;
    this.voxelRenderer = voxelRenderer;

    this.pointerObserver =
      this.scene.onPointerObservable.add(
        this.handlePointer,
        //PointerEventTypes.POINTERPICK,
        PointerEventTypes.POINTERDOWN,
      );
  }

  setListener(
    listener: FailCellPickedListener | null,
  ) {
    this.listener = listener;
  }

  private handlePointer = (
    pointerInfo: PointerInfo,
  ) => {
    console.log("[Picking] Pointer event detected");
    const pointerEvent = pointerInfo.event;

    // STEP 1 supports only a normal left click.
    if (pointerEvent.button !== 0) {
      return;
    }

    const pickInfo = pointerInfo.pickInfo;

    console.log("[Picking] Raw PickInfo", {
      hit: pickInfo?.hit,
      pickedMesh: pickInfo?.pickedMesh?.name,
      thinInstanceIndex: pickInfo?.thinInstanceIndex,
    });


    if (!pickInfo?.hit || !pickInfo.pickedMesh) {
      return;
    }

    const failBaseMesh =
      this.voxelRenderer.getFailBaseMesh();

    if (
      !failBaseMesh ||
      pickInfo.pickedMesh !== failBaseMesh
    ) {
      return;
    }

    const thinInstanceIndex =
      pickInfo.thinInstanceIndex;

    if (
      thinInstanceIndex === undefined ||
      thinInstanceIndex === null ||
      thinInstanceIndex < 0
    ) {
      return;
    }

    const cell =
      this.voxelRenderer.getFailCellByThinInstanceIndex(
        thinInstanceIndex,
      );

    if (!cell || !cell.isFail) {
      return;
    }

    const worldPosition =
      this.voxelRenderer.getFailCellWorldPosition(
        thinInstanceIndex,
      );

    if (!worldPosition) {
      return;
    }

    const result: PickedFailCell = {
      cell,
      physicalAddress: {
        x: cell.physicalX,
        y: cell.physicalY,
        z: cell.physicalZ,
      },
      worldPosition,
      thinInstanceIndex,
    };

    this.listener?.(result);
  };

  dispose() {
    if (this.pointerObserver) {
      this.scene.onPointerObservable.remove(
        this.pointerObserver,
      );

      this.pointerObserver = null;
    }

    this.listener = null;
  }
}
