import type { WorldChunk } from "../chunk/Chunk";

export type ChunkChangedListener = (chunk: WorldChunk) => void;

export class ViewerEvents {
  private readonly chunkChangedListeners: ChunkChangedListener[] = [];

  addChunkChangedListener(listener: ChunkChangedListener) {
    this.chunkChangedListeners.push(listener);
  }

  notifyChunkChanged(chunk: WorldChunk) {
    this.chunkChangedListeners.forEach((listener) => listener(chunk));
  }
}