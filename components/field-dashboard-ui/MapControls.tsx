"use client";

import type { LayerKey } from "@/lib/types";

interface MapControlsProps {
  selectedLayer: LayerKey;
  onLayerChange: (layer: LayerKey) => void;
}

const LEGEND_ITEMS = [
  { color: "rgb(0, 0, 130)", label: "Water/Bare soil" },
  { color: "rgb(90, 0, 160)", label: "Very low vegetation" },
  { color: "rgb(255, 0, 0)", label: "Low vegetation" },
  { color: "rgb(255, 120, 0)", label: "Moderate vegetation" },
  { color: "rgb(255, 230, 0)", label: "Good vegetation" },
  { color: "rgb(0, 90, 0)", label: "Dense vegetation" },
];

const SCALE_LABELS = ["-0.2", "0.0", "0.2", "0.4", "0.6", "0.8", "1.0"];

export default function MapControls({
  selectedLayer,
  onLayerChange,
}: MapControlsProps) {
  return (
    <div className="map-controls">
      <div className="control-group">
        <label>SENTINEL-2</label>
        <select
          value={selectedLayer}
          onChange={(e) => onLayerChange(e.target.value as LayerKey)}
          className="layer-select"
        >
          <option value="ndvi">NDVI</option>
          <option value="ndre">NDRE</option>
          <option value="evi">EVI</option>
          <option value="savi">SAVI</option>
          <option value="ndwi">NDWI</option>
        </select>
      </div>

      <div className="color-legend">
        <label>{selectedLayer.toUpperCase()} SCALE</label>
        
        <div className="legend-gradient" />
        
        <div className="legend-labels">
          {SCALE_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="legend-descriptions">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="legend-item">
              <span
                className="legend-color"
                style={{ background: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .map-controls {
          position: absolute;
          top: 50%;
          right: 16px;
          transform: translateY(-50%);
          background: rgba(10, 22, 40, 0.95);
          border-radius: 8px;
          padding: 12px;
          z-index: 100;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .control-group label {
          color: #9ca3af;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .layer-select {
          background: #1e293b;
          color: #fff;
          border: 1px solid #334155;
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 13px;
          cursor: pointer;
          min-width: 140px;
        }

        .layer-select:focus {
          outline: none;
          border-color: #0ea5e9;
        }

        .color-legend {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .color-legend label {
          display: block;
          color: #9ca3af;
          font-size: 11px;
          text-transform: uppercase;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .legend-gradient {
          height: 16px;
          border-radius: 4px;
          background: linear-gradient(
            to right,
            rgb(0, 0, 130) 0%,
            rgb(90, 0, 160) 15%,
            rgb(255, 0, 0) 30%,
            rgb(255, 120, 0) 45%,
            rgb(255, 230, 0) 60%,
            rgb(120, 200, 60) 80%,
            rgb(0, 90, 0) 100%
          );
        }

        .legend-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
          font-size: 9px;
          color: #9ca3af;
        }

        .legend-descriptions {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          color: #e2e8f0;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
