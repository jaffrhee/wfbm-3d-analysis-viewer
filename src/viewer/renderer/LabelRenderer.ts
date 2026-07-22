import {
  DynamicTexture,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
} from "@babylonjs/core";

import type { PickedFailCell } from "../interaction/PickingManager";

export interface LabelRendererOptions {
  width: number;
  height: number;
  verticalOffset: number;
  textureWidth: number;
  textureHeight: number;
}

const DEFAULT_OPTIONS: LabelRendererOptions = {
  width: 4.6,
  height: 1.15,
  verticalOffset: 1.15,
  textureWidth: 512,
  textureHeight: 128,
};

interface LabelVisual {
  plane: Mesh;
  texture: DynamicTexture;
  material: StandardMaterial;
}

/** Renders one Physical Address label above every selected Fail Cell. */
export class LabelRenderer {
  private readonly scene: Scene;
  private readonly options: LabelRendererOptions;
  private readonly visuals: LabelVisual[] = [];

  constructor(
    scene: Scene,
    options: Partial<LabelRendererOptions> = {},
  ) {
    this.scene = scene;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  render(selectedCells: readonly PickedFailCell[]): void {
    this.clear();

    for (const selectedCell of selectedCells) {
      this.visuals.push(this.createLabel(selectedCell));
    }
  }

  clear(): void {
    for (const visual of this.visuals) {
      visual.plane.dispose();
      visual.material.dispose();
      visual.texture.dispose();
    }

    this.visuals.length = 0;
  }

  dispose(): void {
    this.clear();
  }

  private createLabel(cell: PickedFailCell): LabelVisual {
    const { x, y, z } = cell.physicalAddress;
    const key = `${x}-${y}-${z}`;

    const texture = new DynamicTexture(
      `cellAddressTexture-${key}`,
      {
        width: this.options.textureWidth,
        height: this.options.textureHeight,
      },
      this.scene,
      false,
    );

    texture.hasAlpha = true;
    this.drawLabel(texture, `PA (${x}, ${y}, ${z})`);

    const material = new StandardMaterial(
      `cellAddressMaterial-${key}`,
      this.scene,
    );

    material.diffuseTexture = texture;
    material.emissiveTexture = texture;
    material.opacityTexture = texture;
    material.useAlphaFromDiffuseTexture = true;
    material.disableLighting = true;
    material.backFaceCulling = false;

    const plane = MeshBuilder.CreatePlane(
      `cellAddressLabel-${key}`,
      {
        width: this.options.width,
        height: this.options.height,
      },
      this.scene,
    );

    plane.position.copyFrom(cell.worldPosition);
    plane.position.y += this.options.verticalOffset;
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
    plane.material = material;
    plane.isPickable = false;
    plane.alwaysSelectAsActiveMesh = true;
    plane.renderingGroupId = 2;
    plane.metadata = {
      type: "fail-cell-physical-address-label",
      physicalAddress: { ...cell.physicalAddress },
    };

    return { plane, texture, material };
  }

  private drawLabel(texture: DynamicTexture, text: string): void {
    const context =
      texture.getContext() as unknown as CanvasRenderingContext2D;
    const width = texture.getSize().width;
    const height = texture.getSize().height;

    context.clearRect(0, 0, width, height);

    this.roundedRect(context, 8, 8, width - 16, height - 16, 24);
    context.fillStyle = "rgba(5, 10, 19, 0.88)";
    context.fill();

    context.lineWidth = 7;
    context.strokeStyle = "#ffd43b";
    context.stroke();

    context.fillStyle = "rgba(255, 255, 255, 0.98)";
    context.font = "700 42px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, width / 2, height / 2 + 1);

    // Babylon uploads canvas textures with inverted Y coordinates by default.
    // Keeping this true prevents the world-space label from appearing upside down.
    texture.update(true);
  }

  private roundedRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ): void {
    const r = Math.min(radius, width / 2, height / 2);

    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height - r);
    context.quadraticCurveTo(
      x + width,
      y + height,
      x + width - r,
      y + height,
    );
    context.lineTo(x + r, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
  }
}
