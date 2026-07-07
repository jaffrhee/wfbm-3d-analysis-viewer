import type { ChunkCoord, WorldChunk } from "./Chunk";
import { generateMockChunk } from "../../data/MockGenerator";

import { ViewerEvents } from "../core/ViewerEvents";

export class ChunkManager {
  private readonly events: ViewerEvents;
  private currentChunk: WorldChunk;

  constructor(events: ViewerEvents) {
    this.events = events;

    this.currentChunk = generateMockChunk({
      x: 0,
      y: 0,
    });
  }

  getCurrentChunk(): WorldChunk {
    return this.currentChunk;
  }

  switchChunk(coord: ChunkCoord): WorldChunk {
    this.currentChunk = generateMockChunk(coord);
    this.events.notifyChunkChanged(this.currentChunk);

    return this.currentChunk;
  }
}