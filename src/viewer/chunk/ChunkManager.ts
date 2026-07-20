/*import type { ChunkCoord, WorldChunk } from "./Chunk";
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
}*/
import type { ChunkCoord, WorldChunk } from "./Chunk";

import { generateMockChunk } from "../../data/MockGenerator";

import {
  generatePerformanceMockChunk,
  DEFAULT_PERFORMANCE_FAIL_RATE,
  normalizePerformanceFailRate,
} from "../../data/PerformanceMockGenerator";

import { ViewerEvents } from "../core/ViewerEvents";

export interface ChunkGenerationOptions {
  performanceEnabled: boolean;
  performanceFailRate: number;
}

export class ChunkManager {
  private readonly events: ViewerEvents;

  private currentChunk: WorldChunk;

  private options: ChunkGenerationOptions = {
    performanceEnabled: false,
    performanceFailRate: DEFAULT_PERFORMANCE_FAIL_RATE,
  };

  constructor(
    events: ViewerEvents,
    options?: Partial<ChunkGenerationOptions>,
  ) {
    this.events = events;

    if (options) {
      this.options = {
        ...this.options,
        ...options,
      };
    }

    this.options.performanceFailRate =
      normalizePerformanceFailRate(
        this.options.performanceFailRate,
      );

    this.currentChunk =
      this.generateChunk({
        x: 0,
        y: 0,
      });
  }

  getCurrentChunk(): WorldChunk {
    return this.currentChunk;
  }

  getGenerationOptions(): ChunkGenerationOptions {
    return this.options;
  }

  switchChunk(
    coord: ChunkCoord,
  ): WorldChunk {
    this.currentChunk =
      this.generateChunk(coord);

    this.events.notifyChunkChanged(
      this.currentChunk,
    );

    return this.currentChunk;
  }

  setPerformanceOptions(
    enabled: boolean,
    failRate: number,
  ) {
    this.options.performanceEnabled =
      enabled;

    this.options.performanceFailRate =
      normalizePerformanceFailRate(
        failRate,
      );

    /*this.currentChunk =
      this.generateChunk(
        this.currentChunk.coord,
      );

    this.events.notifyChunkChanged(
      this.currentChunk,
    );*/
  }

  private generateChunk(
    coord: ChunkCoord,
  ): WorldChunk {
    if (
      this.options.performanceEnabled
    ) {
      return generatePerformanceMockChunk(
        coord,
        this.options.performanceFailRate,
      );
    }

    return generateMockChunk(coord);
  }
}