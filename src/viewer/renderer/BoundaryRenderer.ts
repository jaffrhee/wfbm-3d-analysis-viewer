import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  //StandardMaterial,
  Vector3,
} from "@babylonjs/core";

import {
  CELL_SPACING,
  WFBM_SIZE_X,
  WFBM_SIZE_Y,
  WFBM_SIZE_Z,
} from "../core/CoordinateMapper";

export class BoundaryRenderer {
  private readonly scene: Scene;
  private readonly meshes: Mesh[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
  }

  render() {
    this.clear();

    this.createBoundaryBox();
    this.createMajorGridLines();
  }

  private createBoundaryBox() {
    const maxX = (WFBM_SIZE_X - 1) * CELL_SPACING;
    const maxY = (WFBM_SIZE_Z - 1) * CELL_SPACING;
    const maxZ = (WFBM_SIZE_Y - 1) * CELL_SPACING;

    const corners = {
      p000: new Vector3(0, 0, 0),
      p100: new Vector3(maxX, 0, 0),
      p010: new Vector3(0, maxY, 0),
      p110: new Vector3(maxX, maxY, 0),
      p001: new Vector3(0, 0, maxZ),
      p101: new Vector3(maxX, 0, maxZ),
      p011: new Vector3(0, maxY, maxZ),
      p111: new Vector3(maxX, maxY, maxZ),
    };

    this.addLine("boundary_bottom_1", [corners.p000, corners.p100]);
    this.addLine("boundary_bottom_2", [corners.p100, corners.p101]);
    this.addLine("boundary_bottom_3", [corners.p101, corners.p001]);
    this.addLine("boundary_bottom_4", [corners.p001, corners.p000]);

    this.addLine("boundary_top_1", [corners.p010, corners.p110]);
    this.addLine("boundary_top_2", [corners.p110, corners.p111]);
    this.addLine("boundary_top_3", [corners.p111, corners.p011]);
    this.addLine("boundary_top_4", [corners.p011, corners.p010]);

    this.addLine("boundary_vertical_1", [corners.p000, corners.p010]);
    this.addLine("boundary_vertical_2", [corners.p100, corners.p110]);
    this.addLine("boundary_vertical_3", [corners.p101, corners.p111]);
    this.addLine("boundary_vertical_4", [corners.p001, corners.p011]);
  }

  private createMajorGridLines() {
    const maxX = (WFBM_SIZE_X - 1) * CELL_SPACING;
    const maxY = (WFBM_SIZE_Z - 1) * CELL_SPACING;
    const maxZ = (WFBM_SIZE_Y - 1) * CELL_SPACING;

    const step = 8 * CELL_SPACING;

    for (let x = 0; x <= maxX; x += step) {
      this.addLine(`grid_x_${x}`, [
        new Vector3(x, 0, 0),
        new Vector3(x, 0, maxZ),
      ]);
    }

    for (let z = 0; z <= maxZ; z += step) {
      this.addLine(`grid_z_${z}`, [
        new Vector3(0, 0, z),
        new Vector3(maxX, 0, z),
      ]);
    }

    for (let y = 0; y <= maxY; y += 50 * CELL_SPACING) {
      this.addLine(`grid_layer_${y}`, [
        new Vector3(0, y, 0),
        new Vector3(maxX, y, 0),
      ]);

      this.addLine(`grid_layer_depth_${y}`, [
        new Vector3(0, y, 0),
        new Vector3(0, y, maxZ),
      ]);
    }
  }

  private addLine(name: string, points: Vector3[]) {
    const line = MeshBuilder.CreateLines(
      name,
      {
        points,
      },
      this.scene,
    );

    line.color = new Color3(0.15, 0.65, 1.0);
    this.meshes.push(line);
  }

  clear() {
    this.meshes.forEach((mesh) => mesh.dispose());
    this.meshes.length = 0;
  }

  dispose() {
    this.clear();
  }
}