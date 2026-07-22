import {
  Color3,
  Matrix,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
} from "@babylonjs/core";

import type { PickedFailCell } from "./PickingManager";

export type SelectionChangedListener = (
  selectedCells: readonly PickedFailCell[],
) => void;

/**
 * Owns the current Fail Cell selection and its visual highlight.
 *
 * Interaction rule:
 * - Left click: replace the current selection
 * - Ctrl + Left click: add to the current selection
 * - Ctrl + Shift + Left click: remove from the current selection
 *
 * Public selection operations are intentionally separated from picking so
 * future features such as Relation Analysis, Measure, Select All, or loading
 * saved selections can reuse the same selection API.
 */
export class SelectionManager {
  private readonly scene: Scene;
  private readonly selectedCells = new Map<string, PickedFailCell>();

  private selectionBaseMesh: Mesh | null = null;
  private selectionMaterial: StandardMaterial | null = null;
  private listener: SelectionChangedListener | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.createSelectionBaseMesh();
  }

  /**
   * Interprets keyboard modifiers from PickingManager and delegates the
   * actual state change to the explicit selection operations below.
   */
  handlePickedFailCell(result: PickedFailCell): void {
    const multiSelectKey =
      result.modifiers.ctrlKey || result.modifiers.metaKey;

    if (multiSelectKey && result.modifiers.shiftKey) {
      this.removeSelection(result);
      return;
    }

    if (multiSelectKey) {
      this.addSelection(result);
      return;
    }

    this.replaceSelection(result);
  }

  /** Replaces all current selections with one Fail Cell. */
  replaceSelection(result: PickedFailCell): void {
    const key = this.makeSelectionKey(result);
    const current = this.selectedCells.get(key);

    if (
      this.selectedCells.size === 1 &&
      current !== undefined
    ) {
      return;
    }

    this.selectedCells.clear();
    this.selectedCells.set(key, this.clonePickResult(result));
    this.commitSelectionChange();
  }

  /** Adds one Fail Cell while preserving all existing selections. */
  addSelection(result: PickedFailCell): void {
    const key = this.makeSelectionKey(result);

    if (this.selectedCells.has(key)) {
      return;
    }

    this.selectedCells.set(key, this.clonePickResult(result));
    this.commitSelectionChange();
  }

  /** Removes one Fail Cell from the current selection. */
  removeSelection(result: PickedFailCell): void {
    const key = this.makeSelectionKey(result);

    if (!this.selectedCells.delete(key)) {
      return;
    }

    this.commitSelectionChange();
  }

  /** Adds an unselected cell, or removes it when it is already selected. */
  toggleSelection(result: PickedFailCell): void {
    if (this.isSelected(result)) {
      this.removeSelection(result);
      return;
    }

    this.addSelection(result);
  }

  clearSelection(): void {
    if (this.selectedCells.size === 0) {
      return;
    }

    this.selectedCells.clear();
    this.commitSelectionChange();
  }

  getSelectedCells(): readonly PickedFailCell[] {
    return Array.from(
      this.selectedCells.values(),
      (result) => this.clonePickResult(result),
    );
  }

  getSelectedCount(): number {
    return this.selectedCells.size;
  }

  isSelected(result: PickedFailCell): boolean {
    return this.selectedCells.has(
      this.makeSelectionKey(result),
    );
  }

  setListener(
    listener: SelectionChangedListener | null,
  ): void {
    this.listener = listener;

    listener?.(this.getSelectedCells());
  }

  dispose(): void {
    this.listener = null;
    this.selectedCells.clear();

    if (this.selectionBaseMesh) {
      this.selectionBaseMesh.dispose();
      this.selectionBaseMesh = null;
    }

    if (this.selectionMaterial) {
      this.selectionMaterial.dispose();
      this.selectionMaterial = null;
    }
  }

  private createSelectionBaseMesh(): void {
    this.selectionBaseMesh = MeshBuilder.CreateBox(
      "selectedFailCellBase",
      { size: 1.08 },
      this.scene,
    );

    this.selectionBaseMesh.isPickable = false;

    this.selectionMaterial = new StandardMaterial(
      "selectedFailCellMaterial",
      this.scene,
    );

    this.selectionMaterial.diffuseColor = new Color3(1.0, 0.72, 0.05);
    this.selectionMaterial.emissiveColor = new Color3(0.85, 0.42, 0.0);
    this.selectionMaterial.alpha = 0.82;

    this.selectionBaseMesh.material = this.selectionMaterial;
    this.selectionBaseMesh.enableEdgesRendering();
    this.selectionBaseMesh.edgesWidth = 3.0;
    this.selectionBaseMesh.edgesColor.set(1.0, 0.95, 0.35, 1.0);

    this.refreshHighlight();
  }

  private commitSelectionChange(): void {
    this.refreshHighlight();
    this.notifySelectionChanged();
  }

  private refreshHighlight(): void {
    if (!this.selectionBaseMesh) {
      return;
    }

    const selected = Array.from(this.selectedCells.values());
    const matrices = new Float32Array(selected.length * 16);

    selected.forEach((result, index) => {
      Matrix.Translation(
        result.worldPosition.x,
        result.worldPosition.y,
        result.worldPosition.z,
      ).copyToArray(matrices, index * 16);
    });

    this.selectionBaseMesh.thinInstanceSetBuffer(
      "matrix",
      matrices,
      16,
    );

    if (selected.length > 0) {
      this.selectionBaseMesh.thinInstanceRefreshBoundingInfo();
    }
  }

  private notifySelectionChanged(): void {
    this.listener?.(this.getSelectedCells());
  }

  private makeSelectionKey(result: PickedFailCell): string {
    const { x, y, z } = result.physicalAddress;
    return `${x}:${y}:${z}`;
  }

  private clonePickResult(result: PickedFailCell): PickedFailCell {
    return {
      ...result,
      cell: { ...result.cell },
      physicalAddress: { ...result.physicalAddress },
      worldPosition: result.worldPosition.clone(),
      modifiers: { ...result.modifiers },
    };
  }
}
