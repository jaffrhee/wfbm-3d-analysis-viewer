import type { CellData } from "./CellData";

import type {
    ChunkCoord,
    WorldChunk,
} from "../viewer/chunk/Chunk";

import { makeChunkKey } from "../viewer/chunk/Chunk";

export const PERFORMANCE_SIZE_X = 64;
export const PERFORMANCE_SIZE_Y = 64;
export const PERFORMANCE_SIZE_Z = 300;

export const PERFORMANCE_TOTAL_CELL_COUNT =
    PERFORMANCE_SIZE_X *
    PERFORMANCE_SIZE_Y *
    PERFORMANCE_SIZE_Z;

export const PERFORMANCE_FAIL_RATES = [
    10,
    20,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100,
] as const;

export const DEFAULT_PERFORMANCE_FAIL_RATE = 50;

export function generatePerformanceMockChunk(
    coord: ChunkCoord,
    failRate: number,
): WorldChunk {
    const cells: CellData[] = [];

    const normalizedFailRate =
        normalizePerformanceFailRate(failRate);

    const failCount = Math.floor(
        PERFORMANCE_TOTAL_CELL_COUNT *
        (normalizedFailRate / 100),
    );

    /**
    * 전체 Cell 개수와 서로소인 step 값을 사용한다.
    *
    * 동일 좌표의 중복 생성을 방지하면서
    * 전체 64 × 64 × 300 공간에 FAIL Cell을 분산한다.
    */
    const step = 104729;
    const offset = 7919;

    for (let i = 0; i < failCount; i++) {
        const linearIndex =
            (offset + i * step) %
            PERFORMANCE_TOTAL_CELL_COUNT;

        const physicalX =
            linearIndex %
            PERFORMANCE_SIZE_X;

        const physicalY =
            Math.floor(
                linearIndex /
                PERFORMANCE_SIZE_X,
            ) % PERFORMANCE_SIZE_Y;

        const physicalZ =
            Math.floor(
                linearIndex /
                (
                    PERFORMANCE_SIZE_X *
                    PERFORMANCE_SIZE_Y
                ),
            );

        cells.push({
            id: `${physicalX}_${physicalY}_${physicalZ}`,

            physicalX,
            physicalY,
            physicalZ,

            isFail: true,

            type: "fail",
        });
    }

    return {
        coord,
        key: makeChunkKey(coord),
        cells,
        failCells: cells,
    };
}

export function normalizePerformanceFailRate(
    failRate: number,
): number {
    if (!Number.isFinite(failRate)) {
        return DEFAULT_PERFORMANCE_FAIL_RATE;
    }

    const roundedRate =
        Math.round(failRate / 10) * 10;

    return Math.min(
        100,
        Math.max(10, roundedRate),
    );
}