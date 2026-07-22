import {
  DynamicTexture,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
} from "@babylonjs/core";

import type {
  RelationDistanceLevel,
  RelationInfo,
} from "../interaction/RelationManager";

export interface RelationHudRendererOptions {
  width: number;
  height: number;
  verticalOffset: number;
  textureWidth: number;
  textureHeight: number;
}

const DEFAULT_OPTIONS: RelationHudRendererOptions = {
  width: 5.2,
  height: 3.0,
  verticalOffset: 1.8,
  textureWidth: 512,
  textureHeight: 296,
};

const LEVEL_HEX: Record<RelationDistanceLevel, string> = {
  near: "#31f15b",
  medium: "#ffe526",
  far: "#ff8514",
  "very-far": "#ff2920",
};

interface HudVisual {
  plane: Mesh;
  texture: DynamicTexture;
  material: StandardMaterial;
}

/** Renders one relation card after Ctrl + left-clicking a relation tube. */
export class RelationHudRenderer {
  private readonly scene: Scene;
  private readonly options: RelationHudRendererOptions;
  private visual: HudVisual | null = null;

  constructor(
    scene: Scene,
    options: Partial<RelationHudRendererOptions> = {},
  ) {
    this.scene = scene;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  show(relation: RelationInfo): void {
    this.clear();
    this.visual = this.createHud(relation);
  }

  clear(): void {
    if (!this.visual) {
      return;
    }

    this.visual.plane.dispose();
    this.visual.material.dispose();
    this.visual.texture.dispose();
    this.visual = null;
  }

  dispose(): void {
    this.clear();
  }

  private createHud(relation: RelationInfo): HudVisual {
    const texture = new DynamicTexture(
      `relationHudTexture-${relation.index}`,
      {
        width: this.options.textureWidth,
        height: this.options.textureHeight,
      },
      this.scene,
      false,
    );

    texture.hasAlpha = true;
    this.drawHud(texture, relation);

    const material = new StandardMaterial(
      `relationHudMaterial-${relation.index}`,
      this.scene,
    );

    material.diffuseTexture = texture;
    material.emissiveTexture = texture;
    material.opacityTexture = texture;
    material.useAlphaFromDiffuseTexture = true;
    material.disableLighting = true;
    material.backFaceCulling = false;

    const plane = MeshBuilder.CreatePlane(
      `relationHud-${relation.index}`,
      {
        width: this.options.width,
        height: this.options.height,
      },
      this.scene,
    );

    plane.position.copyFrom(relation.midpoint);
    plane.position.y += this.options.verticalOffset;
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
    plane.material = material;
    plane.isPickable = false;
    plane.alwaysSelectAsActiveMesh = true;
    plane.renderingGroupId = 2;
    plane.metadata = {
      type: "fail-cell-relation-hud",
      relationId: relation.id,
    };

    return { plane, texture, material };
  }

  private drawHud(
    texture: DynamicTexture,
    relation: RelationInfo,
  ): void {
    const context =
      texture.getContext() as unknown as CanvasRenderingContext2D;
    const width = texture.getSize().width;
    const height = texture.getSize().height;
    const accent = LEVEL_HEX[relation.distanceLevel];

    context.clearRect(0, 0, width, height);

    this.roundedRect(context, 8, 8, width - 16, height - 16, 26);
    context.fillStyle = "rgba(5, 10, 19, 0.88)";
    context.fill();

    context.lineWidth = 8;
    context.strokeStyle = accent;
    context.stroke();

    context.fillStyle = "rgba(255, 255, 255, 0.96)";
    context.font = "600 38px Arial";
    context.textBaseline = "middle";

    const rows: Array<[string, string]> = [
      ["ΔX", this.formatSigned(relation.deltaX)],
      ["ΔY", this.formatSigned(relation.deltaY)],
      ["ΔZ", this.formatSigned(relation.deltaZ)],
    ];

    let y = 62;

    for (const [label, value] of rows) {
      context.fillStyle = "rgba(190, 205, 225, 0.95)";
      context.fillText(label, 42, y);

      context.fillStyle = "rgba(255, 255, 255, 0.98)";
      context.textAlign = "right";
      context.fillText(value, width - 42, y);
      context.textAlign = "left";

      y += 55;
    }

    context.fillStyle = accent;
    context.font = "700 40px Arial";
    context.fillText("Distance", 42, height - 42);

    context.textAlign = "right";
    context.fillText(
      `${relation.cellDistance.toFixed(2)} cell`,
      width - 42,
      height - 42,
    );
    context.textAlign = "left";

    // true fixes the vertically inverted DynamicTexture on the billboard plane.
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

  private formatSigned(value: number): string {
    if (value > 0) {
      return `+${value}`;
    }

    return `${value}`;
  }
}