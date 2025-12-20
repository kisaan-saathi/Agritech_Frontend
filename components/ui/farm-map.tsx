"use client";

import React, {
  RefObject,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import MapSearch from "../../components/MapSearch";
import {
  FieldFeature,
  SelectedField,
  LayerKey,
  SourceKey,
  HoverInfo,
} from "@/lib/types";
import FieldDropdown from "./field-dropdown";
import MapLayerDropdown from "./map-layer-dropdown";
import MapSourceDropdown from "./map-source-dropdown";
import {
  Timeline,
  HoverTooltip,
  LoadingOverlay,
  CoordsDisplay,
  MapLegend,
} from "@/components/field-dashboard-ui";
import { geocodePlace } from "@/lib/geocode";
import { TIMELINE_DATES } from "@/lib/constants";
import {
  deleteField,
  updateField,
  fetchScenes,
  SatelliteScene,
} from "@/lib/api";
import { useMap } from "@/hooks/useMap";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { SUPPORTED_LAYERS } from "@/lib/types";

interface FormData {
  name: string;
  farmerName: string;
  cropType: string;
  season: string;
  sowingDate: string;
  harvestDate: string;
}

interface FarmMapProps {
  title: string;
  initialLayer?: LayerKey;
}

// Simple modal component
function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        zIndex: 100001,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 24,
          minWidth: 320,
          boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
        }}
      >
        {children}
        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            background: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "6px 16px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

const FarmMap: React.FC<FarmMapProps> = ({ title, initialLayer = "ndvi" }) => {
  // Modal state for new field
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [pendingGeometry, setPendingGeometry] = useState<
    GeoJSON.Polygon | GeoJSON.MultiPolygon | null
  >(null);
  const [form, setForm] = useState({
    name: "",
    farmerName: "",
    cropType: "",
    season: "",
    sowingDate: "",
    harvestDate: "",
  });
  const [saving, setSaving] = useState(false);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<LayerKey>(initialLayer);
  const [selectedField, setSelectedField] = useState<SelectedField | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    TIMELINE_DATES[TIMELINE_DATES.length - 1]
  );
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(false);
  const [fields, setFields] = useState<FieldFeature[]>([]);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [availableDates, setAvailableDates] =
    useState<string[]>(TIMELINE_DATES);
  const [nextImageDate, setNextImageDate] = useState<string | null>(null);
  const [isLoadingScenes, setIsLoadingScenes] = useState(false);
  const [editFieldId, setEditFieldId] = useState<string | null>(null); // Add editFieldId state
  const [showDrawInstruction, setShowDrawInstruction] = useState(false);

  useEffect(() => {
    if (!selectedField) {
      setAvailableDates(TIMELINE_DATES);
      setNextImageDate(null);
      return;
    }

    const loadScenes = async () => {
      setIsLoadingScenes(true);
      try {
        const response = await fetchScenes(selectedField.id, {
          maxCloudCover: 50,
        });
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

  const {
    mapRef,
    zoomToField,
    deleteFieldFromMap,
    updateFieldName,
    reloadFields,
  } = useMap({
    containerRef: mapContainer,
    selectedLayer,
    selectedDate,
    onFieldSelect: handleFieldSelect,
    onFieldsLoad: handleFieldsLoad,
    onLoadingChange: handleLoadingChange,
    onHoverChange: handleHoverChange,
    onDrawPolygon: (geometry) => {
      setPendingGeometry(geometry);
      setEditFieldId(null);
      setShowDrawInstruction(false);
      setForm({
        name: "",
        farmerName: "",
        cropType: "",
        season: "",
        sowingDate: "",
        harvestDate: "",
      });
      setShowFieldModal(true);
    },
  });

  // Handler to activate draw mode
  const handleCreatePolygon = () => {
    if (!mapRef.current) return;
    // Find the MapboxDraw control
    const controls = (mapRef.current as any)._controls || [];
    const drawControl = controls.find(
      (ctrl: any) => ctrl instanceof MapboxDraw
    );
    if (drawControl) {
      drawControl.changeMode("draw_polygon");
      setShowDrawInstruction(true);
      // Hide instruction after 3 seconds
      setTimeout(() => {
        setShowDrawInstruction(false);
      }, 3000);
    }
  };

  // Handler for modal form submit
  async function handleFieldSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editFieldId) {
        // Edit mode
        const res = await fetch(`/api/fields/${editFieldId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            sowingDate: form.sowingDate,
            harvestDate: form.harvestDate,
          }),
        });
        if (!res.ok) throw new Error("Field update failed");
      } else {
        // Create mode
        if (!pendingGeometry) return;
        const res = await fetch("/api/fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            sowingDate: form.sowingDate,
            harvestDate: form.harvestDate,
            geometry: pendingGeometry,
          }),
        });
        if (!res.ok) throw new Error("Field save failed");
        const field = await res.json();
        // Calculate indices
        await fetch("/api/indices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fieldId: field.id }),
        });
      }
      setShowFieldModal(false);
      setPendingGeometry(null);
      setEditFieldId(null);
      setForm({
        name: "",
        farmerName: "",
        cropType: "",
        season: "",
        sowingDate: "",
        harvestDate: "",
      });
      await reloadFields();
    } catch (err) {
      alert("Failed to save field: " + (err as any).message);
    } finally {
      setSaving(false);
    }
  }

  // Search handler for MapSearch
  async function handleSearch(query: string) {
    if (!mapRef.current) return;
    // Check if query is a lat,lng pair (lat first, then lng)
    const coordMatch = query
      .trim()
      .match(/^(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (
        !isNaN(lat) &&
        !isNaN(lng) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180
      ) {
        // Mapbox expects [lng, lat] order
        mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
        return;
      } else {
        console.warn("[SEARCH DEBUG] Invalid lat/lng values:", lat, lng);
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
      setDropdownOpen(false);
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
            prev
              ? { ...prev, properties: { ...prev.properties, name: newName } }
              : null
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

  return (
    <>
      {/* Modal for field info */}
      <Modal
        open={showFieldModal}
        onClose={() => {
          setShowFieldModal(false);
          setPendingGeometry(null);
          setEditFieldId(null);
          setShowDrawInstruction(false);
        }}
      >
        <form onSubmit={handleFieldSubmit}>
          <h3 style={{ fontWeight: 600, marginBottom: 12 }}>
            Enter Field Details
          </h3>
          <div style={{ marginBottom: 10 }}>
            <label>
              Field Name
              <br />
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: 6,
                  borderRadius: 5,
                  border: "1px solid #d4d4d8",
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>
              Farmer Name
              <br />
              <input
                required
                value={form.farmerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, farmerName: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: 6,
                  borderRadius: 5,
                  border: "1px solid #d4d4d8",
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>
              Crop Type
              <br />
              <input
                required
                value={form.cropType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cropType: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: 6,
                  borderRadius: 5,
                  border: "1px solid #d4d4d8",
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>
              Season
              <br />
              <input
                required
                value={form.season}
                onChange={(e) =>
                  setForm((f) => ({ ...f, season: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: 6,
                  borderRadius: 5,
                  border: "1px solid #d4d4d8",
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>
              Sowing Date
              <br />
              <input
                required
                type="date"
                value={form.sowingDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sowingDate: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: 6,
                  borderRadius: 5,
                  border: "1px solid #d4d4d8",
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>
              Harvest Date
              <br />
              <input
                required
                type="date"
                value={form.harvestDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, harvestDate: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: 6,
                  borderRadius: 5,
                  border: "1px solid #d4d4d8",
                }}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 20px",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Field"}
          </button>
        </form>
      </Modal>
      {/* Top control bar above the map */}
      <div
        className="w-full d-flex flex-row flex-wrap align-items-center justify-content-between px-3 py-1 bg-white rounded-t-2xl shadow"
        style={{ zIndex: 10 }}
      >
        <div className="flex flex-row flex-wrap align-items-center">
          <h2 className="text-xl font-bold text-gray-800 mb-0 mr-2">{title}</h2>
          {title == "My Farm" && (
            <>
              <MapSearch
                onSearch={handleSearch}
                onCurrentLocation={handleCurrentLocation}
              />
              <button
                type="button"
                className="btn btn-success ml-2"
                style={{
                  backgroundColor: "#10B981",
                  color: "white",
                  padding: "6px 16px",
                  borderRadius: 6,
                  fontWeight: 600,
                  border: "none",
                }}
                onClick={handleCreatePolygon}
              >
                Create new field
              </button>
            </>
          )}
        </div>
        <div className="flex flex-row flex-wrap align-items-center">
          <FieldDropdown
            fields={fields}
            selectedField={selectedField}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            handleSidebarFieldSelect={handleSidebarFieldSelect}
            setForm={setForm}
            setEditFieldId={setEditFieldId}
            setShowFieldModal={setShowFieldModal}
            handleDeleteField={handleDeleteField}
          />
          <MapLayerDropdown
            selectedLayer={selectedLayer}
            onLayerChange={handleLayerChange}
            layers={title === "Soil Map" ? ["savi"] : SUPPORTED_LAYERS}
          />
          <MapSourceDropdown
            selectedSource={"sentinel2"}
            onSourceChange={() => {}}
          />
        </div>
      </div>
      {showDrawInstruction && (
        <div className="text-center py-2 text-sm text-gray-600 bg-blue-50">
          Draw a polygon on the map to add a field
        </div>
      )}
      <div className="dashboard-container rounded-bottom">
        <div className="map-container rounded-bottom" ref={mapContainer} />

        {/* Map legend in the left bottom corner */}
        <div
          style={{
            position: "absolute",
            left: 20,
            bottom: 20,
            zIndex: 120,
          }}
        >
          <MapLegend selectedLayer={selectedLayer} />
        </div>

        <CoordsDisplay selectedField={selectedField} />

        <Timeline
          dates={availableDates}
          selectedDate={selectedDate}
          onDateSelect={handleDateChange}
          nextImageDate={nextImageDate}
          isLoading={isLoadingScenes}
        />

        {selectedField && (
          <HoverTooltip hoverInfo={hoverInfo} selectedLayer={selectedLayer} />
        )}

        <LoadingOverlay isLoading={isLoadingHeatmap} />

        <style jsx>{`
          .dashboard-container {
            position: relative;
            /* Horizontal padding for left/right spacing */
            --dash-h-pad: 24px;
            padding: 0 var(--dash-h-pad);
            width: 100%;
            height: 86%;
            overflow: hidden;
            background: #0a0a0a;
          }
          .map-container {
            position: absolute;
            top: 0;
            /* Use container's padding box so the map is inset by the horizontal padding */
            left: 0;
            right: 0;
            bottom: 0;
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
    </>
  );
};

export default FarmMap;
