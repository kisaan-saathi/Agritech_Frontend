'use client';

import React, { useState } from 'react';
import { LayerKey } from '@/lib/types';

interface MapLayerDropdownProps {
  selectedLayer: LayerKey;
  onLayerChange: (layer: LayerKey) => void;
  layers?: LayerKey[];
}

const MapLayerDropdown: React.FC<MapLayerDropdownProps> = ({
  selectedLayer,
  onLayerChange,
  layers,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div
      className="btn-group ml-2 my-2"
      style={{ position: "relative" }}
    >
      <button
        type="button"
        className="btn dropdown-toggle relative my-2"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
        style={{ backgroundColor: "#10B981", color: "white" }}
      >
        {selectedLayer.toUpperCase()}
      </button>
      <ul
        className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}
        style={{
          position: "absolute",
          top: "100%",
          left: "0",
          zIndex: 1000,
          display: dropdownOpen ? "block" : "none",
          maxHeight: "200px",
          overflowY: "auto",
          width: "250px",
          padding: "8px",
        }}
      >
        {layers?.map((layer) => (
          <li key={layer}>
            <a
              className="dropdown-item"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onLayerChange(layer);
                setDropdownOpen(false);
              }}
            >
              {layer.toUpperCase()}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MapLayerDropdown;