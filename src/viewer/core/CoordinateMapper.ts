import { Vector3 } from "@babylonjs/core";
import type { CellData } from "../../data/CellData";
//import { PHYSICAL_AXIS } from "./AxisDefinition";

export const CELL_SPACING = 1.2;

export const WFBM_SIZE_X = 64;
export const WFBM_SIZE_Y = 64;
export const WFBM_SIZE_Z = 300;

export interface PhysicalCoordinate {
  x: number;
  y: number;
  z: number;
}

/**
 * Converts between WFBM Physical Address and Babylon World coordinates.
 *
 * Reference Cell:
 * Physical (0, 0, 0)
 *
 * Axis mapping:
 * Physical +X -> Babylon World -X
 * Physical +Y -> Babylon World +Z
 * Physical +Z -> Babylon World -Y
 *
 * Physical Z increases from top to bottom.
 */
export class CoordinateMapper {
  /**
   * Physical X increases in the opposite direction of Babylon World X.
   *
   * Physical X = 0          -> maximum World X
   * Physical X = sizeX - 1  -> World X = 0
   */
  static physicalXToWorldX(physicalX: number): number {
    return (WFBM_SIZE_X - 1 - physicalX) * CELL_SPACING;
  }

  static worldXToPhysicalX(worldX: number): number {
    return WFBM_SIZE_X - 1 - Math.round(worldX / CELL_SPACING);
  }

  /**
   * Physical Y increases in the same direction as Babylon World Z.
   */
  static physicalYToWorldZ(physicalY: number): number {
    return physicalY * CELL_SPACING;
  }

  static worldZToPhysicalY(worldZ: number): number {
    return Math.round(worldZ / CELL_SPACING);
  }

  /**
   * Physical Z increases downward.
   * Babylon World Y increases upward.
   *
   * Physical Z = 0          -> maximum World Y
   * Physical Z = sizeZ - 1  -> World Y = 0
   */
  static physicalZToWorldY(physicalZ: number): number {
    return (WFBM_SIZE_Z - 1 - physicalZ) * CELL_SPACING;
  }

  static worldYToPhysicalZ(worldY: number): number {
    return WFBM_SIZE_Z - 1 - Math.round(worldY / CELL_SPACING);
  }

  static physicalToWorld(cell: CellData): Vector3 {
    return new Vector3(
      this.physicalXToWorldX(cell.physicalX),
      this.physicalZToWorldY(cell.physicalZ),
      this.physicalYToWorldZ(cell.physicalY),
    );
  }

  /*static physicalToWorld(
    cell: CellData
  ): Vector3 {

    return new Vector3(
      // horizontal
      cell.physicalX * CELL_SPACING,
      // vertical layer
      cell.physicalZ * CELL_SPACING,
      // depth
      cell.physicalY * CELL_SPACING
    );
  }*/

  static worldToPhysical(position: Vector3): PhysicalCoordinate {
    return {
      x: this.worldXToPhysicalX(position.x),
      y: this.worldZToPhysicalY(position.z),
      z: this.worldYToPhysicalZ(position.y),
      //x: Math.round(position.x / CELL_SPACING),
      //y: Math.round(position.z / CELL_SPACING),
      //z: this.worldYToPhysicalZ(position.y),
    };
  }

  /*static worldToPhysical(
    position: Vector3
  ) {

    return {
      x: Math.round(position.x / CELL_SPACING),
      y: Math.round(position.z / CELL_SPACING),
      z: Math.round(position.y / CELL_SPACING)
    };
  }*/

  static getWorldCenter(
    sizeX: number,
    sizeY: number,
    sizeZ: number,
  ): Vector3 {
    return new Vector3(
      ((sizeX - 1) * CELL_SPACING) / 2,
      ((sizeZ - 1) * CELL_SPACING) / 2,
      ((sizeY - 1) * CELL_SPACING) / 2,
    );
  }
}