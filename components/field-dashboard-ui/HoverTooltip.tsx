"use client";

import type { HoverInfo, LayerKey } from "@/lib/types";

interface HoverTooltipProps {
  hoverInfo: HoverInfo | null;
  selectedLayer: LayerKey;
}

export default function HoverTooltip({
  hoverInfo,
  selectedLayer,
}: HoverTooltipProps) {
  if (!hoverInfo) return null;

  return (
    <div
      className="hover-tooltip"
      style={{
        left: hoverInfo.x,
        top: hoverInfo.y,
        transform: "translate(-50%, -100%) translateY(-12px)",
      }}
    >
      <div className="tooltip-value">
        {selectedLayer.toUpperCase()}: {hoverInfo.value.toFixed(2)}
      </div>
      <div className="tooltip-label" style={{ color: hoverInfo.color }}>
        {hoverInfo.label}
      </div>

      <style jsx>{`
        .hover-tooltip {
          position: absolute;
          background: rgba(10, 22, 40, 0.95);
          color: #fff;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          z-index: 200;
          border: 1px solid rgba(255, 255, 255, 0.2);
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          min-width: 120px;
          white-space: nowrap;
        }

        .hover-tooltip::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid rgba(10, 22, 40, 0.95);
        }

        .tooltip-value {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .tooltip-label {
          font-size: 12px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
