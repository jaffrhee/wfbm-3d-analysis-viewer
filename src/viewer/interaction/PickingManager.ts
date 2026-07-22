import {
  PointerEventTypes,
  type Observer,
  type PointerInfo,
  type Scene,
  Vector3,
} from "@babylonjs/core";

import type { CellData } from "../../data/CellData";
import type { VoxelRenderer } from "../renderer/VoxelRenderer";

export interface PointerModifiers {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface PickedFailCell {
  cell: CellData;
  physicalAddress: {
    x: number;
    y: number;
    z: number;
  };
  worldPosition: Vector3;
  thinInstanceIndex: number;
  modifiers: PointerModifiers;
}

export interface PickedRelation {
  relationId: string;
  relationIndex: number;
  modifiers: PointerModifiers;
}

export type FailCellPickedListener = (
  result: PickedFailCell,
) => void;

export type RelationPickedListener = (
  result: PickedRelation,
) => void;

/** Resolves scene pointer picks into either a Fail Cell or a relation tube. */
export class PickingManager {
  private readonly scene: Scene;
  private readonly voxelRenderer: VoxelRenderer;

  private pointerObserver: Observer<PointerInfo> | null = null;
  private failCellListener: FailCellPickedListener | null = null;
  private relationListener: RelationPickedListener | null = null;

  constructor(
    scene: Scene,
    voxelRenderer: VoxelRenderer,
  ) {
    this.scene = scene;
    this.voxelRenderer = voxelRenderer;

    this.pointerObserver =
      this.scene.onPointerObservable.add(
        this.handlePointer,
        PointerEventTypes.POINTERDOWN,
      );
  }

  setListener(
    listener: FailCellPickedListener | null,
  ): void {
    this.failCellListener = listener;
  }

  setRelationListener(
    listener: RelationPickedListener | null,
  ): void {
    this.relationListener = listener;
  }

  private handlePointer = (
    pointerInfo: PointerInfo,
  ): void => {
    const pointerEvent = pointerInfo.event;

    if (pointerEvent.button !== 0) {
      return;
    }

    const pickInfo = pointerInfo.pickInfo;

    if (!pickInfo?.hit || !pickInfo.pickedMesh) {
      return;
    }

    const modifiers: PointerModifiers = {
      ctrlKey: pointerEvent.ctrlKey,
      shiftKey: pointerEvent.shiftKey,
      altKey: pointerEvent.altKey,
      metaKey: pointerEvent.metaKey,
    };

    const metadata = pickInfo.pickedMesh.metadata as
      | {
          type?: string;
          relationId?: string;
          relationIndex?: number;
        }
      | null
      | undefined;

    if (
      metadata?.type === "fail-cell-relation" &&
      typeof metadata.relationId === "string"
    ) {
      this.relationListener?.({
        relationId: metadata.relationId,
        relationIndex:
          typeof metadata.relationIndex === "number"
            ? metadata.relationIndex
            : -1,
        modifiers,
      });
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

    this.failCellListener?.({
      cell,
      physicalAddress: {
        x: cell.physicalX,
        y: cell.physicalY,
        z: cell.physicalZ,
      },
      worldPosition,
      thinInstanceIndex,
      modifiers,
    });
  };

  dispose(): void {
    if (this.pointerObserver) {
      this.scene.onPointerObservable.remove(
        this.pointerObserver,
      );

      this.pointerObserver = null;
    }

    this.failCellListener = null;
    this.relationListener = null;
  }
}
