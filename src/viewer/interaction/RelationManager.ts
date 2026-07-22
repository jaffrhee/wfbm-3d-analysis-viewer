import { Vector3 } from "@babylonjs/core";

import type { PickedFailCell } from "./PickingManager";

export type RelationMode = "sequential" | "all-to-all";

export type RelationDistanceLevel =
  | "near"
  | "medium"
  | "far"
  | "very-far";

export interface RelationDistanceThresholds {
  near: number;
  medium: number;
  far: number;
}

export interface RelationInfo {
  id: string;
  index: number;

  from: PickedFailCell;
  to: PickedFailCell;

  deltaX: number;
  deltaY: number;
  deltaZ: number;

  /** Euclidean distance in Physical Address cell units. */
  cellDistance: number;

  /** Euclidean distance in Babylon world units. */
  worldDistance: number;

  /** World-space midpoint used by relation renderers and HUDs. */
  midpoint: Vector3;

  /** Preclassified distance level shared by renderers and UI. */
  distanceLevel: RelationDistanceLevel;
}

export interface RelationAnalysisResult {
  mode: RelationMode;
  selectedCount: number;
  relationCount: number;
  relations: readonly RelationInfo[];
}

export type RelationAnalysisChangedListener = (
  result: RelationAnalysisResult,
) => void;

const DEFAULT_THRESHOLDS: RelationDistanceThresholds = {
  near: 5,
  medium: 12,
  far: 20,
};

/**
 * Calculates relation data from the current Fail Cell selection.
 *
 * Selection state remains owned by SelectionManager. Babylon meshes,
 * materials and HUDs are intentionally owned by dedicated renderers.
 */
export class RelationAnalysisManager {
  private listener: RelationAnalysisChangedListener | null = null;
  private mode: RelationMode;
  private thresholds: RelationDistanceThresholds;

  private result: RelationAnalysisResult;

  constructor(
    mode: RelationMode = "sequential",
    thresholds: Partial<RelationDistanceThresholds> = {},
  ) {
    this.mode = mode;
    this.thresholds = {
      ...DEFAULT_THRESHOLDS,
      ...thresholds,
    };

    this.result = this.createEmptyResult();
  }

  handleSelectionChanged(
    selectedCells: readonly PickedFailCell[],
  ): void {
    const relations = this.buildRelations(selectedCells);

    this.result = {
      mode: this.mode,
      selectedCount: selectedCells.length,
      relationCount: relations.length,
      relations,
    };

    this.notifyChanged();
  }

  setMode(mode: RelationMode): void {
    if (this.mode === mode) {
      return;
    }

    this.mode = mode;
    this.result = {
      ...this.result,
      mode,
      relations: [],
      relationCount: 0,
    };

    this.notifyChanged();
  }

  getMode(): RelationMode {
    return this.mode;
  }

  getResult(): RelationAnalysisResult {
    return this.cloneResult(this.result);
  }

  setListener(
    listener: RelationAnalysisChangedListener | null,
  ): void {
    this.listener = listener;
    listener?.(this.getResult());
  }

  clear(): void {
    const alreadyEmpty =
      this.result.selectedCount === 0 &&
      this.result.relationCount === 0;

    this.result = this.createEmptyResult();

    if (!alreadyEmpty) {
      this.notifyChanged();
    }
  }

  dispose(): void {
    this.listener = null;
    this.result = this.createEmptyResult();
  }

  private buildRelations(
    selectedCells: readonly PickedFailCell[],
  ): RelationInfo[] {
    if (this.mode === "all-to-all") {
      return this.buildAllToAllRelations(selectedCells);
    }

    return this.buildSequentialRelations(selectedCells);
  }

  private buildSequentialRelations(
    selectedCells: readonly PickedFailCell[],
  ): RelationInfo[] {
    const relations: RelationInfo[] = [];

    for (let index = 1; index < selectedCells.length; index++) {
      relations.push(
        this.createRelation(
          index - 1,
          selectedCells[index - 1],
          selectedCells[index],
        ),
      );
    }

    return relations;
  }

  private buildAllToAllRelations(
    selectedCells: readonly PickedFailCell[],
  ): RelationInfo[] {
    const relations: RelationInfo[] = [];
    let relationIndex = 0;

    for (let fromIndex = 0; fromIndex < selectedCells.length; fromIndex++) {
      for (
        let toIndex = fromIndex + 1;
        toIndex < selectedCells.length;
        toIndex++
      ) {
        relations.push(
          this.createRelation(
            relationIndex,
            selectedCells[fromIndex],
            selectedCells[toIndex],
          ),
        );

        relationIndex++;
      }
    }

    return relations;
  }

  private createRelation(
    index: number,
    from: PickedFailCell,
    to: PickedFailCell,
  ): RelationInfo {
    const deltaX = to.physicalAddress.x - from.physicalAddress.x;
    const deltaY = to.physicalAddress.y - from.physicalAddress.y;
    const deltaZ = to.physicalAddress.z - from.physicalAddress.z;

    const cellDistance = Math.sqrt(
      deltaX * deltaX +
      deltaY * deltaY +
      deltaZ * deltaZ,
    );

    return {
      id: `${this.makeCellKey(from)}->${this.makeCellKey(to)}`,
      index,
      from: this.clonePickedFailCell(from),
      to: this.clonePickedFailCell(to),
      deltaX,
      deltaY,
      deltaZ,
      cellDistance,
      worldDistance: Vector3.Distance(
        from.worldPosition,
        to.worldPosition,
      ),
      midpoint: Vector3.Center(
        from.worldPosition,
        to.worldPosition,
      ),
      distanceLevel: this.classifyDistance(cellDistance),
    };
  }

  private classifyDistance(
    distance: number,
  ): RelationDistanceLevel {
    if (distance <= this.thresholds.near) {
      return "near";
    }

    if (distance <= this.thresholds.medium) {
      return "medium";
    }

    if (distance <= this.thresholds.far) {
      return "far";
    }

    return "very-far";
  }

  private createEmptyResult(): RelationAnalysisResult {
    return {
      mode: this.mode,
      selectedCount: 0,
      relationCount: 0,
      relations: [],
    };
  }

  private notifyChanged(): void {
    this.listener?.(this.getResult());
  }

  private cloneResult(
    result: RelationAnalysisResult,
  ): RelationAnalysisResult {
    return {
      mode: result.mode,
      selectedCount: result.selectedCount,
      relationCount: result.relationCount,
      relations: result.relations.map((relation) => ({
        ...relation,
        from: this.clonePickedFailCell(relation.from),
        to: this.clonePickedFailCell(relation.to),
        midpoint: relation.midpoint.clone(),
      })),
    };
  }

  private makeCellKey(result: PickedFailCell): string {
    const { x, y, z } = result.physicalAddress;
    return `${x}:${y}:${z}`;
  }

  private clonePickedFailCell(
    result: PickedFailCell,
  ): PickedFailCell {
    return {
      ...result,
      cell: { ...result.cell },
      physicalAddress: { ...result.physicalAddress },
      worldPosition: result.worldPosition.clone(),
      modifiers: { ...result.modifiers },
    };
  }
}