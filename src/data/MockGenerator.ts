import type { CellData } from "./CellData";

import type {
	ChunkCoord,
	WorldChunk,
} from "../viewer/chunk/Chunk";

import { makeChunkKey }  from "../viewer/chunk/Chunk";

const WFBM_SIZE_X = 64;
const WFBM_SIZE_Y = 64;
const WFBM_SIZE_Z = 300;

export const BENCHMARK_MODE = true;

/**
 * 테스트할 FAIL 비율.
 * 10, 20, 30 ... 100으로 변경한 뒤 다시 실행한다.
 */
export const BENCHMARK_FAIL_RATE = 50;
export const BENCHMARK_TOTAL_CELL_COUNT = WFBM_SIZE_X * WFBM_SIZE_Y * WFBM_SIZE_Z;

//@20260719 기존 코드
/*
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

}*/
export function generateMockChunk(
  coord: ChunkCoord,
): WorldChunk {
  const cells: CellData[] = [];

  if (BENCHMARK_MODE) {
    addBenchmarkFails(cells, BENCHMARK_FAIL_RATE);
  } else {
    // 기존 일반 테스트 데이터
    addRandomFails(cells, 800);

    if (coord.x === 0 && coord.y === 0) {
      addLongRowPattern(cells);
      addStairPattern(cells);
    } else if (coord.x === 1 && coord.y === 0) {
      addDiagonalPattern(cells);
    } else if (coord.x === -1 && coord.y === 0) {
      addLayerDefect(cells);
    } else if (coord.x === 0 && coord.y === 1) {
      addVerticalColumn(cells);
    } else {
      addLongRowPattern(cells);
    }
  }

  return {
    coord,
    key: makeChunkKey(coord),
    cells,
    failCells: cells,
  };
}

function addBenchmarkFails(
  cells: CellData[],
  failRate: number,
) {
  const normalizedRate = Math.min(
    100,
    Math.max(0, failRate),
  );

  const failCount = Math.floor(
    BENCHMARK_TOTAL_CELL_COUNT *
      (normalizedRate / 100),
  );

  /**
   * TOTAL_CELL_COUNT와 서로소인 값을 사용한다.
   * 이 방식은 같은 좌표가 중복되지 않으면서
   * 전체 공간에 FAIL Cell을 분산시킨다.
   */
  const step = 104729;
  const offset = 7919;

  for (let i = 0; i < failCount; i++) {
    const linearIndex =
      (offset + i * step) %
      BENCHMARK_TOTAL_CELL_COUNT;

    const physicalX =
      linearIndex % WFBM_SIZE_X;

    const physicalY =
      Math.floor(linearIndex / WFBM_SIZE_X) %
      WFBM_SIZE_Y;

    const physicalZ =
      Math.floor(
        linearIndex /
          (WFBM_SIZE_X * WFBM_SIZE_Y),
      );

    addFail(
      cells,
      physicalX,
      physicalY,
      physicalZ,
    );
  }
}

function addFail(cells: CellData[], x: number, 	y: number, z: number) {
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