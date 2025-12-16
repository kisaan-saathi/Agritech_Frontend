"use client";

import type { SelectedField, LayerKey } from "@/lib/types";
import { formatDate, getHealthLabel } from "@/lib/utils";

interface BottomPanelsProps {
  selectedField: SelectedField | null;
  selectedLayer: LayerKey;
  selectedDate: string;
}

export default function BottomPanels({
  selectedField,
  selectedLayer,
  selectedDate,
}: BottomPanelsProps) {
  const healthInfo = selectedField?.properties.health_score !== undefined
    ? getHealthLabel(selectedField.properties.health_score)
    : null;

  return (
    <div className="bottom-panels">
      <CropInfoPanel selectedField={selectedField} />
      <GrowthStagesPanel />
      <IndexValuesPanel
        selectedField={selectedField}
        selectedLayer={selectedLayer}
        selectedDate={selectedDate}
        healthInfo={healthInfo}
      />

      <style jsx>{`
        .bottom-panels {
          position: absolute;
          bottom: 50px;
          left: 0;
          right: 0;
          z-index: 90;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1px;
          background: rgba(255, 255, 255, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

function CropInfoPanel({ selectedField }: { selectedField: SelectedField | null }) {
  return (
    <div className="panel">
      <h3 className="panel-title">
        Crop info
        <span className="panel-link">Show all</span>
      </h3>

      {selectedField ? (
        <div className="crop-details">
          <div className="season-label">
            Season: {selectedField.properties.season || "N/A"}
          </div>
          <div className="crop-item">
            <span className="crop-icon">🌱</span>
            <div>
              <div className="crop-name">
                {selectedField.properties.crop_type || "Unknown Crop"}
              </div>
              <div className="crop-date">
                Planting date: {selectedField.properties.sowing_date || "N/A"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-selection">Select a field to view crop info</div>
      )}

      <style jsx>{`
        .panel {
          background: rgba(10, 22, 40, 0.95);
          padding: 16px;
          min-height: 150px;
        }

        .panel-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 12px 0;
        }

        .panel-link {
          color: #0ea5e9;
          font-size: 12px;
          font-weight: normal;
          cursor: pointer;
        }

        .no-selection {
          color: #64748b;
          font-size: 13px;
        }

        .crop-details {
          color: #e2e8f0;
        }

        .season-label {
          color: #9ca3af;
          font-size: 12px;
          margin-bottom: 12px;
        }

        .crop-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .crop-icon {
          font-size: 20px;
        }

        .crop-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .crop-date {
          color: #9ca3af;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

function GrowthStagesPanel() {
  const stages = [1, 2, 3, 4, 5, 6, 7, 8];
  const completedStages = 3;

  return (
    <div className="panel">
      <h3 className="panel-title">
        Growth Stages
        <span className="panel-link">Edit</span>
      </h3>

      <div className="stages-track">
        {stages.map((stage) => (
          <div
            key={stage}
            className={`stage-dot ${stage <= completedStages ? "completed" : ""}`}
          />
        ))}
      </div>

      <div className="stages-info">
        Growth stages are calculated based on satellite imagery
      </div>

      <style jsx>{`
        .panel {
          background: rgba(10, 22, 40, 0.95);
          padding: 16px;
          min-height: 150px;
        }

        .panel-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 12px 0;
        }

        .panel-link {
          color: #0ea5e9;
          font-size: 12px;
          font-weight: normal;
          cursor: pointer;
        }

        .stages-track {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .stage-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #334155;
          border: 2px solid #475569;
          transition: all 0.3s;
        }

        .stage-dot.completed {
          background: #0ea5e9;
          border-color: #0ea5e9;
        }

        .stages-info {
          color: #64748b;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

function IndexValuesPanel({
  selectedField,
  selectedLayer,
  selectedDate,
  healthInfo,
}: {
  selectedField: SelectedField | null;
  selectedLayer: LayerKey;
  selectedDate: string;
  healthInfo: { label: string; color: string } | null;
}) {
  return (
    <div className="panel">
      <h3 className="panel-title">{selectedLayer.toUpperCase()} values split</h3>

      {selectedField ? (
        <div className="index-content">
          <div className="index-date">Date: {formatDate(selectedDate)}</div>

          {/* Vegetation Distribution Bar */}
          <div className="index-bar">
            <div className="bar-section dense" style={{ width: "45%" }} />
            <div className="bar-section moderate" style={{ width: "35%" }} />
            <div className="bar-section sparse" style={{ width: "20%" }} />
          </div>

          {/* Legend */}
          <div className="index-legend">
            <span>
              <span className="legend-dot dense" /> Dense vegetation
            </span>
            <span>
              <span className="legend-dot moderate" /> Moderate vegetation
            </span>
            <span>
              <span className="legend-dot sparse" /> Sparse vegetation
            </span>
          </div>

          {/* Health Score */}
          {healthInfo && selectedField.properties.health_score !== undefined && (
            <div className="health-score">
              Health Score:{" "}
              <strong style={{ color: healthInfo.color }}>
                {selectedField.properties.health_score}%
              </strong>{" "}
              ({healthInfo.label})
            </div>
          )}
        </div>
      ) : (
        <div className="no-selection">Select a field to view index values</div>
      )}

      <style jsx>{`
        .panel {
          background: rgba(10, 22, 40, 0.95);
          padding: 16px;
          min-height: 150px;
        }

        .panel-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 12px 0;
        }

        .no-selection {
          color: #64748b;
          font-size: 13px;
        }

        .index-content {
          color: #e2e8f0;
        }

        .index-date {
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 12px;
        }

        .index-bar {
          display: flex;
          height: 24px;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .bar-section {
          height: 100%;
        }

        .bar-section.dense {
          background: #22c55e;
        }

        .bar-section.moderate {
          background: #f59e0b;
        }

        .bar-section.sparse {
          background: #ef4444;
        }

        .index-legend {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 11px;
          color: #9ca3af;
        }

        .legend-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 6px;
        }

        .legend-dot.dense {
          background: #22c55e;
        }

        .legend-dot.moderate {
          background: #f59e0b;
        }

        .legend-dot.sparse {
          background: #ef4444;
        }

        .health-score {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
