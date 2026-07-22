import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
} from "@babylonjs/core";

import type {
  RelationAnalysisResult,
  RelationDistanceLevel,
  RelationInfo,
} from "../interaction/RelationManager";

export interface RelationRendererOptions {
  tubeRadius: number;
  tubeTessellation: number;
  alpha: number;
}

const DEFAULT_OPTIONS: RelationRendererOptions = {
  tubeRadius: 0.1,
  tubeTessellation: 8,
  alpha: 1.0,
};

const LEVEL_COLORS: Record<RelationDistanceLevel, Color3> = {
  near: new Color3(0.18, 0.95, 0.35),
  medium: new Color3(1.0, 0.9, 0.15),
  far: new Color3(1.0, 0.5, 0.08),
  "very-far": new Color3(1.0, 0.16, 0.12),
};

/** Owns only the Babylon visuals for Fail Cell relations. */
export class RelationRenderer {
  private readonly scene: Scene;
  private readonly options: RelationRendererOptions;

  private readonly materials = new Map<
    RelationDistanceLevel,
    StandardMaterial
  >();

  private readonly relationMeshes: Mesh[] = [];

  constructor(
    scene: Scene,
    options: Partial<RelationRendererOptions> = {},
  ) {
    this.scene = scene;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  render(result: RelationAnalysisResult): void {
    this.clear();

    for (const relation of result.relations) {
      this.relationMeshes.push(
        this.createTube(relation),
      );
    }
  }

  clear(): void {
    for (const mesh of this.relationMeshes) {
      mesh.dispose();
    }

    this.relationMeshes.length = 0;
  }

  dispose(): void {
    this.clear();

    for (const material of this.materials.values()) {
      material.dispose();
    }

    this.materials.clear();
  }

  private createTube(relation: RelationInfo): Mesh {
    const tube = MeshBuilder.CreateTube(
      `failCellRelationTube-${relation.index}`,
      {
        path: [
          relation.from.worldPosition.clone(),
          relation.to.worldPosition.clone(),
        ],
        radius: this.options.tubeRadius,
        tessellation: this.options.tubeTessellation,
        cap: Mesh.CAP_ALL,
        updatable: false,
      },
      this.scene,
    );

    tube.material = this.getMaterial(relation.distanceLevel);
    tube.isPickable = true;
    tube.alwaysSelectAsActiveMesh = true;
    tube.metadata = {
      type: "fail-cell-relation",
      relationId: relation.id,
      relationIndex: relation.index,
      cellDistance: relation.cellDistance,
      worldDistance: relation.worldDistance,
      distanceLevel: relation.distanceLevel,
    };

    return tube;
  }

  private getMaterial(
    level: RelationDistanceLevel,
  ): StandardMaterial {
    const cached = this.materials.get(level);

    if (cached) {
      return cached;
    }

    const color = LEVEL_COLORS[level];
    const material = new StandardMaterial(
      `failCellRelationMaterial-${level}`,
      this.scene,
    );

    material.diffuseColor = color.clone();
    material.emissiveColor = color.scale(0.75);
    material.specularColor = Color3.Black();
    material.alpha = this.options.alpha;
    material.backFaceCulling = false;

    this.materials.set(level, material);
    return material;
  }
}