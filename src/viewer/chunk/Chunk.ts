import type { CellData } from "../../data/CellData";

export interface ChunkCoord {
  x: number;
  y: number;
}

export interface WorldChunk {
  coord: ChunkCoord;
  key: string;
  cells: CellData[];
  failCells: CellData[];
}

export function makeChunkKey(coord: ChunkCoord): string {
  return `${coord.x}_${coord.y}`;
}