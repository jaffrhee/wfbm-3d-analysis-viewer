import type { ChunkCoord } from "../../viewer/chunk/Chunk";

interface MiniMapProps {
  currentChunk: ChunkCoord;
  onSelectChunk: (coord: ChunkCoord) => void;
}

const OFFSETS = [
  { dx: -1, dy: 1, label: "NW" },
  { dx: 0, dy: 1, label: "N" },
  { dx: 1, dy: 1, label: "NE" },

  { dx: -1, dy: 0, label: "W" },
  { dx: 0, dy: 0, label: "C" },
  { dx: 1, dy: 0, label: "E" },

  { dx: -1, dy: -1, label: "SW" },
  { dx: 0, dy: -1, label: "S" },
  { dx: 1, dy: -1, label: "SE" },
];

export default function MiniMap({ currentChunk, onSelectChunk }: MiniMapProps) {
  return (
    <div className="mini-map">
      <div className="mini-map-title">CHUNK MAP</div>

      <div className="mini-map-grid">
        {OFFSETS.map((item) => {
          const target = {
            x: currentChunk.x + item.dx,
            y: currentChunk.y + item.dy,
          };

          const isCenter = item.dx === 0 && item.dy === 0;

          return (
            <button
              key={item.label}
              className={
                isCenter
                  ? "mini-map-cell mini-map-cell-active"
                  : "mini-map-cell"
              }
              onClick={() => onSelectChunk(target)}
              title={`Chunk (${target.x}, ${target.y})`}
            >
              {isCenter ? "●" : ""}
            </button>
          );
        })}
      </div>

      <div className="mini-map-current">
        CHUNK ({currentChunk.x}, {currentChunk.y})
      </div>
    </div>
  );
}
