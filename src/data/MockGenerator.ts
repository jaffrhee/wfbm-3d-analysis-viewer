import type { CellData } from "./CellData";

import type {
	ChunkCoord,
	WorldChunk,
} from "../viewer/chunk/Chunk";

import { makeChunkKey } from "../viewer/chunk/Chunk";

export function generateMockChunk(
	coord: ChunkCoord
): WorldChunk {

	const cells: CellData[] = [];

	// 모든 Chunk 기본 Random
	addRandomFails(cells, 800);

	//
	// Chunk별 Pattern
	//
	if (coord.x === 0 && coord.y === 0) {
		addLongRowPattern(cells);
		addStairPattern(cells);
	}
	else if (coord.x === 1 && coord.y === 0) {
		addDiagonalPattern(cells);
	}
	else if (coord.x === -1 && coord.y === 0) {
		addLayerDefect(cells);
	}
	else if (coord.x === 0 && coord.y === 1) {
		addVerticalColumn(cells);
	}
	else {
		addLongRowPattern(cells);
	}

	return {
		coord,
		key: makeChunkKey(coord),
		cells,
		failCells: cells.filter(c => c.isFail)
	};
}

function addFail(cells: CellData[], x: number, y: number, z: number) {
	cells.push({

		id: `${x}_${y}_${z}`,

		physicalX: x,
		physicalY: y,
		physicalZ: z,

		isFail: true,

		type: "fail"
	});
}

// --------------------------------
// Random
// --------------------------------
function addRandomFails(
	cells: CellData[],
	count: number
) {
	for (let i = 0; i < count; i++) {
		addFail(cells, rand(64), rand(64), rand(300));
	}
}

// --------------------------------
// 현실형 긴 Row
// --------------------------------
function addLongRowPattern(
	cells: CellData[]
) {

	const baseZ = 120;

	for (let row = 0; row < 6; row++) {
		const y = 15 + row;

		for (let x = 8; x < 38; x++) {
			addFail(cells, x, y, baseZ);
		}
	}
}

// --------------------------------
// 계단형 Row
// --------------------------------

function addStairPattern(
	cells: CellData[]
) {
	for (let step = 0; step < 8; step++) {
		const y = 30 + step;
		const z = 80 + (step * 8);

		for (let x = 10 + step; x < 40 + step; x++) {
			addFail(cells, x, y, z);
		}
	}
}

// --------------------------------
// Diagonal Pattern
// --------------------------------

function addDiagonalPattern(
	cells: CellData[]
) {
	for (let line = 0; line < 5; line++) {
		for (let i = 0; i < 50; i++) {
			addFail(cells, 5 + i, 5 + i + line, 60 + i * 3);
		}
	}
}

// --------------------------------
// Layer Defect
// 1/4 영역 여러장
// --------------------------------

function addLayerDefect(
	cells: CellData[]
) {

	const layers = [
		60,
		100,
		140,
		180
	];

	layers.forEach(z => {
		for (let x = 0; x < 32; x++) {
			for (let y = 0; y < 32; y++) {
				if (Math.random() < 0.15) {
					addFail(cells, x, y, z);
				}
			}
		}
	});
}

// --------------------------------
// Vertical Column
// --------------------------------

function addVerticalColumn(
	cells: CellData[]
) {
	for (let c = 0; c < 10; c++) {
		const x = rand(32);
		const y = rand(32);

		for (let z = 20; z < 280; z++) {
			addFail(cells, x, y, z);
		}
	}
}

function rand(max: number) {

	return Math.floor(
		Math.random() * max
	);

}