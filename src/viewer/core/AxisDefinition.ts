import { Vector3 } from "@babylonjs/core";

/**
 * WFBM Physical Coordinate System
 *
 * Physical X -> Babylon World +X
 * Physical Y -> Babylon World +Z
 * Physical Z -> Babylon World -Y (top to bottom / layer increase)
 *
 * CoordinateMapper, CoordinateGizmo, labels, picking and analysis logic must
 * all use this definition as the single source of truth.
 */
export const PHYSICAL_AXIS = {
  x: new Vector3(-1, 0, 0),
  y: new Vector3(0, 0, 1),
  z: new Vector3(0, -1, 0),
} as const;

export type PhysicalAxisName = keyof typeof PHYSICAL_AXIS;

export const PHYSICAL_AXIS_COLOR = {
  x: "red",
  y: "lime",
  z: "deepskyblue",
} as const;
