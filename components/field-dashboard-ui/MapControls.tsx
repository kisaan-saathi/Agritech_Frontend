"use client";

import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import type { LayerKey, SourceKey } from "@/lib/types";
import { SOURCE_NAMES } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/*                                   CONSTANTS                                */
/* -------------------------------------------------------------------------- */

const LEGEND_ITEMS = [
  { color: "rgb(0, 0, 130)", label: "Water/Bare soil" },
  { color: "rgb(90, 0, 160)", label: "Very low vegetation" },
  { color: "rgb(255, 0, 0)", label: "Low vegetation" },
  { color: "rgb(255, 120, 0)", label: "Moderate vegetation" },
  { color: "rgb(255, 230, 0)", label: "Good vegetation" },
  { color: "rgb(0, 90, 0)", label: "Dense vegetation" },
];

const SCALE_LABELS = ["-0.2", "0.0", "0.2", "0.4", "0.6", "0.8", "1.0"];

/* -------------------------------------------------------------------------- */
/*                               SOURCE DROPDOWN                               */
/* -------------------------------------------------------------------------- */

interface MapSourceDropdownProps {
  selectedSource: SourceKey;
  onSourceChange: (source: SourceKey) => void;
}

export function MapSourceDropdown({
  selectedSource,
  onSourceChange,
}: MapSourceDropdownProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 180 });

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        btnRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div
      className="pill-wrapper"
      style={{ display: "inline-block", position: "relative" }}
    >
      <button
        ref={btnRef}
        type="button"
        className="relative my-2"
        style={{
          backgroundColor: "white",
          border: "1px solid black",
          color: "black",
          padding: "5px 12px",
          borderRadius: "9999px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
        }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {SOURCE_NAMES[selectedSource]}
        <span className="caret" style={{ marginLeft: 6 }}>
          ▾
        </span>
      </button>

      {open &&
        typeof window !== "undefined" &&
        ReactDOM.createPortal(
          <ul
            ref={menuRef}
            className="pill-menu"
            style={{
              position: "absolute",
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
              padding: "8px",
              maxHeight: "200px",
              overflowY: "auto",
              zIndex: 2000,
              background: "#fff",
              border: "1px solid #000",
              borderRadius: 8,
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            }}
          >
            {Object.entries(SOURCE_NAMES).map(([key, label]) => (
              <li
                key={key}
                onClick={() => {
                  onSourceChange(key as SourceKey);
                  setOpen(false);
                }}
                style={{ cursor: "pointer", padding: "8px 0" }}
              >
                {label}
              </li>
            ))}
          </ul>,
          document.body
        )}

      <PillStyles />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               LAYER DROPDOWN                                */
/* -------------------------------------------------------------------------- */

interface MapLayerDropdownProps {
  selectedLayer: LayerKey;
  onLayerChange: (layer: LayerKey) => void;
}

export function MapLayerDropdown({
  selectedLayer,
  onLayerChange,
}: MapLayerDropdownProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 180 });
  const layers: LayerKey[] = ["ndvi", "ndre", "evi", "savi", "ndwi"];

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        btnRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div
      className="pill-wrapper"
      style={{ display: "inline-block", position: "relative" }}
    >
      <button
        ref={btnRef}
        type="button"
        className="relative my-2"
        style={{
          backgroundColor: "white",
          border: "1px solid black",
          color: "black",
          padding: "5px 12px",
          borderRadius: "9999px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
        }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {selectedLayer.toUpperCase()}
        <span className="caret" style={{ marginLeft: 6 }}>
          ▾
        </span>
      </button>

      {open &&
        typeof window !== "undefined" &&
        ReactDOM.createPortal(
          <ul
            ref={menuRef}
            className="pill-menu"
            style={{
              position: "absolute",
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
              padding: "8px",
              maxHeight: "200px",
              overflowY: "auto",
              zIndex: 2000,
              background: "#fff",
              border: "1px solid #000",
              borderRadius: 8,
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            }}
          >
            {layers.map((layer) => (
              <li
                key={layer}
                onClick={() => {
                  onLayerChange(layer);
                  setOpen(false);
                }}
                style={{ cursor: "pointer", padding: "8px 0" }}
              >
                {layer.toUpperCase()}
              </li>
            ))}
          </ul>,
          document.body
        )}

      <PillStyles />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   LEGEND                                    */
/* -------------------------------------------------------------------------- */

export function MapLegend({ selectedLayer }: { selectedLayer: LayerKey }) {
  return (
    <div className="map-controls-legend">
      {/* unchanged */}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               SHARED STYLES                                 */
/* -------------------------------------------------------------------------- */

function PillStyles() {
  return (
    <style jsx>{`
      .pill-wrapper {
        position: relative;
        display: inline-block;
      }

      .pill-button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        background: #ffffff;
        color: #000000;
        border: 1px solid #000000;
        border-radius: 9999px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
      }

      .caret {
        font-size: 12px;
        line-height: 1;
      }

      .pill-menu {
        position: absolute;
        top: 110%;
        left: 0;
        background: #ffffff;
        border: 1px solid #000000ff;
        border-radius: 8px;
        min-width: 140px;
        padding: 6px;
        z-index: 1000;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
      }

      .pill-menu li:hover {
        background: #f3f4f6;
      }
    `}</style>
  );
}
