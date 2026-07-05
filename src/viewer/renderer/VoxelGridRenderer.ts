import {
  Color3,
  DynamicTexture,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";

import {
  CELL_SPACING,
  WFBM_SIZE_X,
  WFBM_SIZE_Y,
  WFBM_SIZE_Z,
} from "../core/CoordinateMapper";

const GRID_LABEL = {
  layerStep: 50,
  floorStep: 8,

  layerPositionOffset: new Vector3(-6, 0, 0),
  xAxisPositionOffset: new Vector3(0, 0, -2),
  zAxisPositionOffset: new Vector3(2, 0, 0),

  textWidth: 12,
  textHeight: 8,
  textureWidth: 256,
  textureHeight: 128,
  font: "bold 64px Arial",
  color: "#dff8ff",
};

const PLANE_FILL = {
  alpha: 0.4, //0.4 -> 0.15
  sideFaceColor: new Color3(0.0, 0.45, 0.75), // 0.25, 0.25, 0.9  -> 0.0, 0.45, 0.75
  backFaceColor: new Color3(0.25, 0.25, 0.9),  // 0.0, 0.55, 0.9 -> 0.25, 0.25, 0.9
};

export class VoxelGridRenderer {
  private readonly scene: Scene;
  private readonly root: TransformNode;
  private readonly meshes: Mesh[] = [];
  private readonly labelTexture: AdvancedDynamicTexture;

  constructor(scene: Scene) {
    this.scene = scene;
    this.root = new TransformNode("voxelGridRoot", scene);
    this.labelTexture = AdvancedDynamicTexture.CreateFullscreenUI(
      "voxelGridLabelUI",
      true,
      this.scene,
    );
  }

  render() {
    this.clear();

    const maxX = (WFBM_SIZE_X - 1) * CELL_SPACING;
    const maxY = (WFBM_SIZE_Z - 1) * CELL_SPACING; // Physical Z -> World Y
    const maxZ = (WFBM_SIZE_Y - 1) * CELL_SPACING; // Physical Y -> World Z

    const xyMinorStep = 4;
    const xyMajorStep = 8;

    const zMinorStep = 10;
    const zMajorStep = 50;

    this.createPlaneFill(maxX, maxY, maxZ);

    this.createFloorGrid(maxX, maxZ, xyMinorStep, xyMajorStep);
    this.createBackGrid(maxX, maxY, maxZ, xyMinorStep, xyMajorStep, zMinorStep, zMajorStep);
    this.createLeftGrid(maxY, maxZ, xyMinorStep, xyMajorStep, zMinorStep, zMajorStep);

    //this.createLayerLabels(maxY, maxZ, 50);
    //this.createLayerLabels(maxZ, 50);
    this.createLayerLabels(GRID_LABEL.layerStep);
    this.createFloorAxisLabels(GRID_LABEL.floorStep, maxX);
  }

  private createPlaneFill(
    maxX: number,
    maxY: number,
    maxZ: number,
  ) {
    // Babylon Y face = XZ plane = floor
    this.createFilledPlane(
      "voxelGridYFacePlane",
      maxX,
      maxY, /*maxZ,*/
      //new Vector3(maxX / 2, -0.02, maxZ / 2),
      new Vector3(maxX / 2, maxY / 2, maxZ + 0.02),
      //"yFace",
      "backFace",
      //PLANE_FILL.yFaceColor,
      PLANE_FILL.backFaceColor,
    );

    // Babylon X face = YZ plane = left side wall
    this.createFilledPlane(
      "voxelGridXFacePlane",
      maxZ,
      maxY,
      new Vector3(-0.02, maxY / 2, maxZ / 2),
      //"xFace",
      "sideFace",
      //PLANE_FILL.xFaceColor,
      PLANE_FILL.sideFaceColor,
    );
  }

  private createFilledPlane(
    name: string,
    width: number,
    height: number,
    position: Vector3,
    //orientation: "xFace" | "yFace",
    orientation: "sideFace" | "backFace",
    color: Color3,
  ) {
    const material = new StandardMaterial(`${name}_material`, this.scene);

    material.diffuseColor = color;
    material.emissiveColor = color;
    material.alpha = PLANE_FILL.alpha;
    material.disableLighting = true;
    material.backFaceCulling = false;

    const plane = MeshBuilder.CreatePlane(
      name,
      { width, height },
      this.scene,
    );

    plane.position = position;

    if (orientation === "backFace") {
      // XZ plane / floor
      //plane.rotation.x = Math.PI / 2;
      plane.rotation.x = Math.PI;
    }

    if (orientation === "sideFace") {
      // YZ plane / side wall
      plane.rotation.y = Math.PI / 2;
    }

    plane.material = material;
    plane.parent = this.root;
    plane.isPickable = false;

    this.meshes.push(plane);
  }

  private createFloorGrid(
    maxX: number,
    maxZ: number,
    minorStep: number,
    majorStep: number,
  ) {
    const minorLines: Vector3[][] = [];
    const majorLines: Vector3[][] = [];

    for (let x = 0; x < WFBM_SIZE_X; x += minorStep) {
      const px = x * CELL_SPACING;
      const line = [new Vector3(px, 0, 0), new Vector3(px, 0, maxZ)];
      (x % majorStep === 0 ? majorLines : minorLines).push(line);
    }

    for (let y = 0; y < WFBM_SIZE_Y; y += minorStep) {
      const pz = y * CELL_SPACING;
      const line = [new Vector3(0, 0, pz), new Vector3(maxX, 0, pz)];
      (y % majorStep === 0 ? majorLines : minorLines).push(line);
    }

    this.addLineSystem(
      "voxelGridFloorMinor",
      minorLines,
      new Color3(0.25, 0.36, 0.46),
    );
    this.addLineSystem(
      "voxelGridFloorMajor",
      majorLines,
      new Color3(0.65, 0.8, 0.95),
    );
  }

  private createBackGrid(
    maxX: number,
    maxY: number,
    maxZ: number,
    xMinorStep: number,
    xMajorStep: number,
    zMinorStep: number,
    zMajorStep: number,
  ) {
    const minorLines: Vector3[][] = [];
    const majorLines: Vector3[][] = [];

    // vertical lines
    for (let x = 0; x < WFBM_SIZE_X; x += xMinorStep) {
      const px = x * CELL_SPACING;
      const line = [new Vector3(px, 0, maxZ), new Vector3(px, maxY, maxZ)];
      (x % xMajorStep === 0 ? majorLines : minorLines).push(line);
    }

    // horizontal layer lines
    for (let z = 0; z < WFBM_SIZE_Z; z += zMinorStep) {
      const py = z * CELL_SPACING;
      const line = [new Vector3(0, py, maxZ), new Vector3(maxX, py, maxZ)];
      (z % zMajorStep === 0 ? majorLines : minorLines).push(line);
    }

    this.addLineSystem(
      "voxelGridBackMinor",
      minorLines,
      new Color3(0.25, 0.36, 0.46),
    );
    this.addLineSystem(
      "voxelGridBackMajor",
      majorLines,
      new Color3(0.65, 0.8, 0.95),
    );
  }

  private createLeftGrid(
    maxY: number,
    maxZ: number,
    yMinorStep: number,
    yMajorStep: number,
    zMinorStep: number,
    zMajorStep: number,
  ) {
    const minorLines: Vector3[][] = [];
    const majorLines: Vector3[][] = [];

    // vertical lines
    for (let y = 0; y < WFBM_SIZE_Y; y += yMinorStep) {
      const pz = y * CELL_SPACING;
      const line = [new Vector3(0, 0, pz), new Vector3(0, maxY, pz)];
      (y % yMajorStep === 0 ? majorLines : minorLines).push(line);
    }

    // horizontal layer lines
    for (let z = 0; z < WFBM_SIZE_Z; z += zMinorStep) {
      const py = z * CELL_SPACING;
      const line = [new Vector3(0, py, 0), new Vector3(0, py, maxZ)];
      (z % zMajorStep === 0 ? majorLines : minorLines).push(line);
    }

    this.addLineSystem(
      "voxelGridLeftMinor",
      minorLines,
      new Color3(0.25, 0.36, 0.46),
    );
    this.addLineSystem(
      "voxelGridLeftMajor",
      majorLines,
      new Color3(0.65, 0.8, 0.95),
    );
  }

  private addLineSystem(name: string, lines: Vector3[][], color: Color3) {
    if (lines.length === 0) return;

    const mesh = MeshBuilder.CreateLineSystem(name, { lines }, this.scene);

    mesh.color = color;
    mesh.parent = this.root;
    mesh.isPickable = false;

    this.meshes.push(mesh);
  }

  /*private createLayerLabels(maxZ: number, labelStep: number) {
    for (let z = 0; z <= WFBM_SIZE_Z; z += labelStep) {
      const py = z * CELL_SPACING;

      const anchor = MeshBuilder.CreateSphere(
        `layerLabelAnchor_${z}`,
        { diameter: 0.01 },
        this.scene,
      );

      anchor.position = new Vector3(-6, py, maxZ + 4);
      anchor.isVisible = false;
      anchor.isPickable = false;
      anchor.parent = this.root;

      const label = new TextBlock(`layerLabel_${z}`);
      label.text = `${z}`;
      label.color = "#bdefff";
      label.fontSize = 18;
      label.fontWeight = "bold";
      label.outlineColor = "#001018";
      label.outlineWidth = 3;

      this.labelTexture.addControl(label);
      label.linkWithMesh(anchor);
      label.linkOffsetX = -8;
      label.linkOffsetY = 0;

      // dispose 관리를 위해 anchor만 meshes에 넣고,
      // label은 clear에서 labelTexture로 따로 제거할 예정
      this.meshes.push(anchor);
    }
  }*/

  private createFloorAxisLabels(step: number, maxX: number) {
    this.createXAxisLabels(step);
    this.createZAxisLabels(step, maxX);
  }

  private createXAxisLabels(step: number) {
    for (let x = 0; x < WFBM_SIZE_X; x += step) {
      const px = x * CELL_SPACING;

      this.createTextLabel(`xAxisLabel_${x}`, `${x}`, new Vector3(
        px + GRID_LABEL.xAxisPositionOffset.x,
        GRID_LABEL.xAxisPositionOffset.y,
        GRID_LABEL.xAxisPositionOffset.z)
      );
    }
  }

  private createZAxisLabels(step: number, maxX: number) {
    for (let y = 0; y < WFBM_SIZE_Y; y += step) {
      const pz = y * CELL_SPACING;

      this.createTextLabel(`zAxisLabel_${y}`, `${y}`, new Vector3(
        maxX + GRID_LABEL.zAxisPositionOffset.x,
        GRID_LABEL.zAxisPositionOffset.y,
        pz + GRID_LABEL.zAxisPositionOffset.z)
      );
    }
  }

  private createLayerLabels(labelStep: number) {
    for (let z = 0; z <= WFBM_SIZE_Z; z += labelStep) {
      const py = z * CELL_SPACING;

      this.createTextLabel(`layerLabel_${z}`, `${z}`, new Vector3(
        GRID_LABEL.layerPositionOffset.x,
        py + GRID_LABEL.layerPositionOffset.y,
        GRID_LABEL.layerPositionOffset.z)
      );
    }
  }

  private createTextLabel(name: string, text: string, position: Vector3) {
    const texture = new DynamicTexture(
      `${name}_texture`,
      {
        width: GRID_LABEL.textureWidth, /*256*/
        height: GRID_LABEL.textureHeight, /*128*/
      },
      this.scene,
      true,
    );

    texture.hasAlpha = true;

    texture.drawText(
      text,
      null,
      92, //82 -> 92
      GRID_LABEL.font, /*"bold 48px Arial",*/
      GRID_LABEL.color, /*#bdefff",*/
      "transparent",
      true,
    );

    const material = new StandardMaterial(`${name}_material`, this.scene);

    material.diffuseTexture = texture;
    material.emissiveColor = new Color3(0.6, 0.9, 1.0);
    material.disableLighting = true;
    material.useAlphaFromDiffuseTexture = true;
    material.backFaceCulling = false;

    const label = MeshBuilder.CreatePlane(
      name,
      {
        width: GRID_LABEL.textWidth, // 5 -> 8 -> 12
        height: GRID_LABEL.textHeight, // 2.5 -> 4 -> 8
      },
      this.scene,
    );

    label.position = position;
    label.material = material;
    label.parent = this.root;
    label.isPickable = false;
    label.billboardMode = Mesh.BILLBOARDMODE_ALL;

    this.meshes.push(label);
  }

  clear() {
    this.labelTexture.getDescendants().forEach((control) => {
      this.labelTexture.removeControl(control);
    });

    this.meshes.forEach((mesh) => mesh.dispose());
    this.meshes.length = 0;
  }

  dispose() {
    this.clear();
    this.labelTexture.dispose();
    this.root.dispose();
  }
}
