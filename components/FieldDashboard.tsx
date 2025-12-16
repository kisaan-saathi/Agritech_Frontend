"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import MapSearch from "./MapSearch";
import { geocodePlace } from "../lib/geocode";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import type { LayerKey, SelectedField, HoverInfo, FieldFeature } from "@/lib/types";
import { TIMELINE_DATES } from "@/lib/constants";
import { deleteField, updateField, fetchScenes, SatelliteScene } from "@/lib/api";
import { useMap } from "@/hooks/useMap";
import {
  FieldSidebar,
  Timeline,
  MapControls,
  BottomPanels,
  HoverTooltip,
  LoadingOverlay,
  HamburgerButton,
  CoordsDisplay,
} from "@/components/field-dashboard-ui";

export default function FieldDashboard() {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  const [selectedLayer, setSelectedLayer] = useState<LayerKey>("ndvi");
  const [selectedField, setSelectedField] = useState<SelectedField | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(TIMELINE_DATES[TIMELINE_DATES.length - 1]);
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(false);
  const [fields, setFields] = useState<FieldFeature[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>(TIMELINE_DATES);
  const [nextImageDate, setNextImageDate] = useState<string | null>(null);
  const [isLoadingScenes, setIsLoadingScenes] = useState(false);

  useEffect(() => {
    if (!selectedField) {
      setAvailableDates(TIMELINE_DATES);
      setNextImageDate(null);
      return;
    }

    const loadScenes = async () => {
      setIsLoadingScenes(true);
      try {
        const response = await fetchScenes(selectedField.id, { maxCloudCover: 50 });
        const dates = response.scenes.map((s: SatelliteScene) => s.date);
        if (dates.length > 0) {
          setAvailableDates(dates);
          setSelectedDate(dates[dates.length - 1]);
        }
        if (response.nextImage) {
          setNextImageDate(response.nextImage);
        }
      } catch (error) {
        console.error("Failed to fetch scenes:", error);
      } finally {
        setIsLoadingScenes(false);
      }
    };

    loadScenes();
  }, [selectedField?.id]);

  const handleFieldSelect = useCallback((field: SelectedField | null) => {
    setSelectedField(field);
    if (!field) setHoverInfo(null);
  }, []);

  const handleFieldsLoad = useCallback((loadedFields: FieldFeature[]) => {
    setFields(loadedFields);
  }, []);

  const handleLoadingChange = useCallback((isLoading: boolean) => {
    setIsLoadingHeatmap(isLoading);
  }, []);

  const handleHoverChange = useCallback((info: HoverInfo | null) => {
    setHoverInfo(info);
  }, []);

  const { mapRef, zoomToField, deleteFieldFromMap, updateFieldName } = useMap({
    containerRef: mapContainer,
    selectedLayer,
    selectedDate,
    onFieldSelect: handleFieldSelect,
    onFieldsLoad: handleFieldsLoad,
    onLoadingChange: handleLoadingChange,
    onHoverChange: handleHoverChange,
  });

  // Search handler for MapSearch
  async function handleSearch(query: string) {
    if (!mapRef.current) return;
    // Check if query is a lat,lng pair (lat first, then lng)
    const coordMatch = query.trim().match(/^(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        // Mapbox expects [lng, lat] order
        mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
        return;
      } else {
        console.warn('[SEARCH DEBUG] Invalid lat/lng values:', lat, lng);
      }
    }
    // Otherwise, use geocoding
    const result = await geocodePlace(query);
    if (result) {
      mapRef.current.flyTo({ center: result.center, zoom: 15 });
    } else {
      alert("Place not found");
    }
  }

  function handleCurrentLocation(coords: [number, number]) {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: coords, zoom: 18 });
  }

  const handleSidebarFieldSelect = useCallback(
    (field: FieldFeature) => {
      const selectedFieldData: SelectedField = {
        id: field.properties.id,
        properties: field.properties,
        geometry: field.geometry,
      };
      handleFieldSelect(selectedFieldData);
      zoomToField(field);
      setSidebarOpen(false);
    },
    [zoomToField, handleFieldSelect]
  );

  const handleDeleteField = useCallback(
    async (fieldId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm("Are you sure you want to delete this field?")) return;

      try {
        await deleteField(fieldId);
        setFields((prev) => prev.filter((f) => f.properties.id !== fieldId));
        if (selectedField?.id === fieldId) handleFieldSelect(null);
        deleteFieldFromMap(fieldId);
      } catch (error) {
        console.error("Failed to delete field:", error);
        alert("Failed to delete field. Please try again.");
      }
    },
    [selectedField, handleFieldSelect, deleteFieldFromMap]
  );

  const handleUpdateFieldName = useCallback(
    async (fieldId: string, newName: string) => {
      try {
        await updateField(fieldId, { name: newName });
        setFields((prev) =>
          prev.map((f) =>
            f.properties.id === fieldId
              ? { ...f, properties: { ...f.properties, name: newName } }
              : f
          )
        );
        if (selectedField?.id === fieldId) {
          setSelectedField((prev) =>
            prev ? { ...prev, properties: { ...prev.properties, name: newName } } : null
          );
        }
        updateFieldName(fieldId, newName);
      } catch (error) {
        console.error("Failed to update field name:", error);
        alert("Failed to update field name. Please try again.");
      }
    },
    [selectedField, updateFieldName]
  );

  const handleLayerChange = useCallback((layer: LayerKey) => {
    setSelectedLayer(layer);
  }, []);

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="dashboard-container">
      {/* MAP SEARCH */}
      <div
        style={{
          position: "fixed",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100001,
          color: "#fff",
          background: "#0f172a",
          padding: 8,
          borderRadius: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
        }}
      >
        <MapSearch onSearch={handleSearch} onCurrentLocation={handleCurrentLocation} />
      </div>
      <div ref={mapContainer} className="map-container" />

      <HamburgerButton
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        fieldCount={fields.length}
      />

      <FieldSidebar
        isOpen={sidebarOpen}
        fields={fields}
        selectedField={selectedField}
        onFieldClick={handleSidebarFieldSelect}
        onDeleteField={handleDeleteField}
      />

      <CoordsDisplay selectedField={selectedField} />

      <Timeline
        dates={availableDates}
        selectedDate={selectedDate}
        onDateSelect={handleDateChange}
        nextImageDate={nextImageDate}
        isLoading={isLoadingScenes}
      />

      <MapControls
        selectedLayer={selectedLayer}
        onLayerChange={handleLayerChange}
      />

      {selectedField && (
        <BottomPanels
          selectedField={selectedField}
          selectedLayer={selectedLayer}
          selectedDate={selectedDate}
        />
      )}

      {selectedField && (
        <HoverTooltip hoverInfo={hoverInfo} selectedLayer={selectedLayer} />
      )}

      <LoadingOverlay isLoading={isLoadingHeatmap} />

      <style jsx>{`
        .dashboard-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #0a0a0a;
        }
        .map-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 50px;
          width: 100%;
        }
        :global(.mapboxgl-ctrl-logo),
        :global(.mapboxgl-ctrl-attrib) {
          display: none !important;
        }
        :global(::-webkit-scrollbar) {
          width: 6px;
        }
        :global(::-webkit-scrollbar-track) {
          background: rgba(0, 0, 0, 0.2);
        }
        :global(::-webkit-scrollbar-thumb) {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        :global(::-webkit-scrollbar-thumb:hover) {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
