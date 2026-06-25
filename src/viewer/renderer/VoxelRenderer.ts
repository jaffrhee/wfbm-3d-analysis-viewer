import {
	Matrix,
	Mesh,
	MeshBuilder,
	Scene,
	StandardMaterial,
	Color3,
} from "@babylonjs/core";

import type { CellData } from "../../data/CellData";
import { CoordinateMapper } from "../core/CoordinateMapper";

export class VoxelRenderer {
	private readonly scene: Scene;

	private failBaseMesh: Mesh | null = null;
	private failMaterial: StandardMaterial | null = null;
	private referenceMesh: Mesh | null = null;

	constructor(scene: Scene) {
		this.scene = scene;
		this.createFailBaseMesh();
	}

	renderFailCells(cells: CellData[]) {

		if (!this.failBaseMesh) {
			return;
		}

		const failCells = cells.filter(c => c.isFail);

		const matrices = new Float32Array(16 * failCells.length);

		failCells.forEach(
			(cell, index) => {

				const pos = CoordinateMapper.physicalToWorld(cell);
				const matrix = Matrix.Translation(pos.x, pos.y, pos.z);

				matrix.copyToArray(matrices, index * 16);
			}
		);

		this.failBaseMesh.thinInstanceSetBuffer(
			"matrix",
			matrices,
			16
		);

		this.failBaseMesh.thinInstanceRefreshBoundingInfo();
	}

	renderReferenceCell() {
		if (this.referenceMesh) {
			this.referenceMesh.dispose();
		}

		const refCell = MeshBuilder.CreateBox(
			"referenceCell",
			{
				size: 1.2,
			},
			this.scene
		);

		const material = new StandardMaterial("referenceCellMaterial", this.scene);
		material.diffuseColor = new Color3(1.0, 0.85, 0.05);
		material.emissiveColor = new Color3(0.8, 0.55, 0.0);

		refCell.material = material;

		// Physical (0,0,0)
		refCell.position = CoordinateMapper.physicalToWorld({
			id: "reference",
			physicalX: 0,
			physicalY: 0,
			physicalZ: 0,
			isFail: false,
			type: "reference",
		});

		this.referenceMesh = refCell;
	}

	private createFailBaseMesh() {

		this.failBaseMesh =
			MeshBuilder.CreateBox(
				"failCellBase",
				{
					size: 0.9
				},
				this.scene
			);

		this.failMaterial =
			new StandardMaterial(
				"failCellMaterial",
				this.scene
			);

		this.failMaterial.diffuseColor = new Color3(1, 0.05, 0.08);
		this.failMaterial.emissiveColor = new Color3(0.45, 0, 0);
		this.failBaseMesh.material = this.failMaterial;
	}

	clearFailCells() {
		if (!this.failBaseMesh) {
			return;
		}

		this.failBaseMesh
			.thinInstanceSetBuffer(
				"matrix",
				new Float32Array(),
				16
			);
	}

	dispose() {

		if (this.failBaseMesh) {
			this.failBaseMesh.dispose();
			this.failBaseMesh = null;
		}

		if (this.referenceMesh) {
			this.referenceMesh.dispose();
			this.referenceMesh = null;
		}
	}
}