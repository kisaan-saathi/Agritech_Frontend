"use client";
import MapSearch from "../../../components/MapSearch";
import { useRef, useState, useCallback, useEffect } from "react";
import type { GeoJSON } from "geojson";
// Simple modal component
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.3)",
      zIndex: 100001,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{ background: "#fff", borderRadius: 10, padding: 24, minWidth: 320, boxShadow: "0 2px 12px rgba(0,0,0,0.18)" }}>
        {children}
        <button onClick={onClose} style={{ marginTop: 16, background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px", cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}
import { geocodePlace } from "../../../lib/geocode";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import type {
  LayerKey,
  SelectedField,
  HoverInfo,
  FieldFeature,
} from "@/lib/types";
import { TIMELINE_DATES } from "@/lib/constants";
import {
  deleteField,
  updateField,
  fetchScenes,
  SatelliteScene,
} from "@/lib/api";
import { useMap } from "@/hooks/useMap";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import {
  Timeline,
  HoverTooltip,
  LoadingOverlay,
  CoordsDisplay,
  MapLayerDropdown,
  MapLegend,
  MapSourceDropdown,
} from "@/components/field-dashboard-ui";

export default function FarmScoreCard() {
  // Modal state for new field
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [pendingGeometry, setPendingGeometry] = useState<GeoJSON.Polygon | GeoJSON.MultiPolygon | null>(null);
  const [form, setForm] = useState({
    name: "",
    farmerName: "",
    cropType: "",
    season: "",
    sowingDate: "",
    harvestDate: ""
  });
  const [saving, setSaving] = useState(false);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<LayerKey>("ndvi");
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

  const { mapRef, zoomToField, deleteFieldFromMap, updateFieldName, reloadFields } = useMap({
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
      setForm({
        name: "",
        farmerName: "",
        cropType: "",
        season: "",
        sowingDate: "",
        harvestDate: ""
      });
      setShowFieldModal(true);
    },
  });

  // Handler to activate draw mode
  const handleCreatePolygon = () => {
    if (!mapRef.current) return;
    // Find the MapboxDraw control
    const controls = (mapRef.current as any)._controls || [];
    const drawControl = controls.find((ctrl: any) => ctrl instanceof MapboxDraw);
    if (drawControl) {
      drawControl.changeMode("draw_polygon");
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
      setForm({ name: "", farmerName: "", cropType: "", season: "", sowingDate: "", harvestDate: "" });
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
      <Modal open={showFieldModal} onClose={() => { setShowFieldModal(false); setPendingGeometry(null); setEditFieldId(null); }}>
        <form onSubmit={handleFieldSubmit}>
          <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Enter Field Details</h3>
          <div style={{ marginBottom: 10 }}>
            <label>Field Name<br/>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: "100%", padding: 6, borderRadius: 5, border: "1px solid #d4d4d8" }} />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Farmer Name<br/>
              <input required value={form.farmerName} onChange={e => setForm(f => ({ ...f, farmerName: e.target.value }))} style={{ width: "100%", padding: 6, borderRadius: 5, border: "1px solid #d4d4d8" }} />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Crop Type<br/>
              <input required value={form.cropType} onChange={e => setForm(f => ({ ...f, cropType: e.target.value }))} style={{ width: "100%", padding: 6, borderRadius: 5, border: "1px solid #d4d4d8" }} />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Season<br/>
              <input required value={form.season} onChange={e => setForm(f => ({ ...f, season: e.target.value }))} style={{ width: "100%", padding: 6, borderRadius: 5, border: "1px solid #d4d4d8" }} />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Sowing Date<br/>
              <input required type="date" value={form.sowingDate} onChange={e => setForm(f => ({ ...f, sowingDate: e.target.value }))} style={{ width: "100%", padding: 6, borderRadius: 5, border: "1px solid #d4d4d8" }} />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Harvest Date<br/>
              <input required type="date" value={form.harvestDate} onChange={e => setForm(f => ({ ...f, harvestDate: e.target.value }))} style={{ width: "100%", padding: 6, borderRadius: 5, border: "1px solid #d4d4d8" }} />
            </label>
          </div>
          <button type="submit" disabled={saving} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving..." : "Save Field"}
          </button>
        </form>
      </Modal>
      {/* ...existing code... */}
      <section className="mb-5 h-100vh">
        {/* Top control bar above the map */}
        <div className="w-full flex flex-row items-center gap-2 px-6 py-4 bg-white rounded-t-2xl shadow" style={{zIndex: 10}}>
          <h2 className="text-xl font-bold text-gray-800 mb-0">My Farm</h2>
          <MapSearch
            onSearch={handleSearch}
            onCurrentLocation={handleCurrentLocation}
          />
          <button
            type="button"
            className="btn btn-success ml-2"
            style={{ backgroundColor: '#16a34a', color: 'white', padding: '6px 16px', borderRadius: 6, fontWeight: 600 }}
            onClick={handleCreatePolygon}
          >
            Create new field
          </button>
          <div className="btn-group ml-2 my-2" style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn dropdown-toggle relative my-2"
              style={{ backgroundColor: 'white', border: '1px solid black', color: 'black', padding: '5px 12px' }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              My fields
              {fields.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full px-1 min-w-[18px] h-[18px] flex items-center justify-center">
                  {fields.length}
                </span>
              )}
            </button>
            <ul className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`} style={{ position: 'absolute', top: '100%', left: '0', zIndex: 1000, display: dropdownOpen ? 'block' : 'none', maxHeight: '200px', overflowY: 'auto', width: '250px', padding: '8px' }}>
              {fields.length === 0 ? (
                <li>
                  <a className="dropdown-item" href="#">
                    Draw a polygon on the map to add a field
                  </a>
                </li>
              ) : (
                fields.map((field) => {
                  const fieldId = field.properties?.id;
                  const isActive = selectedField?.id === fieldId?.toString();
                  return (
                    <li key={fieldId || Math.random()}>
                      <div
                        className={`dropdown-item ${isActive ? 'active' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          cursor: 'pointer',
                          padding: '8px 0',
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSidebarFieldSelect(field);
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            className="fw-medium"
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 110,
                              fontWeight: 500,
                            }}
                            title={field.properties?.name || `Field ${fieldId}`}
                          >
                            {field.properties?.name
                              ? field.properties.name.length > 16
                                ? `${field.properties.name.slice(0, 12)}...`
                                : field.properties.name
                              : `Field ${fieldId}`}
                          </div>
                          <div className="text-muted small" style={{ fontSize: 12 }}>
                            {field.properties?.area
                              ? `${Number(field.properties.area).toFixed(2)} ha`
                              : 'Area N/A'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                          <button
                            className="btn btn-sm btn-outline-primary ms-2"
                            onClick={async (e) => {
                              e.stopPropagation();
                              // Fetch latest field data to ensure all properties are loaded
                              try {
                                const res = await fetch(`/api/fields/${fieldId}`);
                                if (res.ok) {
                                  const data = await res.json();
                                  const props = data.properties || {};
                                  setForm({
                                    name: props.name || '',
                                    farmerName: props.farmerName || '',
                                    cropType: props.cropType || '',
                                    season: props.season || '',
                                    sowingDate: props.sowingDate ? props.sowingDate.slice(0, 10) : '',
                                    harvestDate: props.harvestDate ? props.harvestDate.slice(0, 10) : '',
                                  });
                                } else {
                                  // fallback to local properties if fetch fails
                                  setForm({
                                    name: field.properties?.name || '',
                                    farmerName: field.properties?.farmerName || '',
                                    cropType: field.properties?.cropType || '',
                                    season: field.properties?.season || '',
                                    sowingDate: field.properties?.sowingDate || '',
                                    harvestDate: field.properties?.harvestDate || '',
                                  });
                                }
                              } catch {
                                setForm({
                                  name: field.properties?.name || '',
                                  farmerName: field.properties?.farmerName || '',
                                  cropType: field.properties?.cropType || '',
                                  season: field.properties?.season || '',
                                  sowingDate: field.properties?.sowingDate || '',
                                  harvestDate: field.properties?.harvestDate || '',
                                });
                              }
                              setEditFieldId(fieldId?.toString() || null);
                              setShowFieldModal(true);
                            }}
                            title="Edit field"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteField(fieldId?.toString() || '', e);
                            }}
                            title="Delete field"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
          <MapLayerDropdown
            selectedLayer={selectedLayer}
            onLayerChange={handleLayerChange}
          />
          <MapSourceDropdown
            selectedSource={"sentinel2"}
            onSourceChange={() => {}}
           />
        </div>
        {/* Main grid with scorecard and map below */}
        <div className="grid grid-cols-6 lg:grid-cols-6 sm:grid-cols-6 gap-6 pb-3">
          <div className="lg:col-span-1 md:col-span-2 sm:col-span-2 rounded-2xl shadow p-2">
            <h2 className="text-xl font-bold text-gray-800 p-3 border-bottom">
              Farm Balance Scorecard
            </h2>
            <div className="farm-score-card h-64 rounded-2xl shadow-2xl mx-3 my-2 px-2 py-3 flex flex-col items-start md:items-center justify-between text-white relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://placehold.co/800x200/FFFFFF/059669/png?text=AI+Pattern')",
                  opacity: 0.1,
                  transform: "rotate(10deg) scale(1.5)",
                }}
              ></div>
              <div className="flex flex-col items-center space-x-6 relative z-10 md:mb-2">
                <div className="w-28 h-28 flex items-center justify-center border-4 border-white/50 rounded-full bg-transparent shadow-2xl flex-shrink-0 mb-2">
                  <span className="text-3xl font-extrabold">7.8</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">Farm Score</p>
                  <p className="mt-1 text-sm font-medium opacity-90">
                    Recommendations: Monitor soil moisture in Field 3.
                  </p>
                </div>
              </div>
              <div className="relative z-10 w-full p-2 bg-white/20 mt-3 rounded-lg">
                <p className="text-sm font-semibold mb-1">
                  Score Trend (Last 7 Days)
                </p>
                <svg viewBox="0 0 100 30" className="w-full h-8">
                  <line
                    x1="0"
                    y1="20"
                    x2="100"
                    y2="20"
                    stroke="rgba(255, 255, 255, 0.5)"
                    strokeWidth="0.5"
                  />
                  <polyline
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    points="0,25 16,22 32,24 48,21 64,19 80,23 100,22"
                  />
                  <circle cx="100" cy="22" r="1.5" fill="white" />
                </svg>
                <span className="text-xs font-medium mt-1 inline-block text-white/90">
                  Stable (+0.3 WoW)
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 p-3">
              <div className="col-span-3 bg-teal/20 p-2 place-items-center rounded-lg h- farm-score-card">
                <p className="text-sm text-white font-semibold mb-2">Soil</p>
                <div className="w-20 h-20 flex items-center justify-center border-4 bg-white/20 border-white/50 rounded-full bg-transparent shadow-2xl flex-shrink-0">
                  <span className="text-3xl text-white font-extrabold">8.1</span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 md:col-span-4 sm:col-span-4 shadow rounded-2xl">
            <div className="dashboard-container">
              <div className="map-container" ref={mapContainer} />

              {/* Map legend in the left bottom corner */}
              <div style={{ position: 'absolute', left: 20, bottom: 20, zIndex: 120 }}>
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

              {/* {selectedField && (
                <BottomPanels
                  selectedField={selectedField}
                  selectedLayer={selectedLayer}
                  selectedDate={selectedDate}
                />
              )} */}

              {selectedField && (
                <HoverTooltip
                  hoverInfo={hoverInfo}
                  selectedLayer={selectedLayer}
                />
              )}

              <LoadingOverlay isLoading={isLoadingHeatmap} />

              <style jsx>{`
                .dashboard-container {
                  position: relative;
                  /* Horizontal padding for left/right spacing */
                  --dash-h-pad: 24px;
                  padding: 0 var(--dash-h-pad);
                  box-sizing: border-box;
                  width: 100%;
                  height: 90%;
                  overflow: hidden;
                  background: #0a0a0a;
                }
                .map-container {
                  position: absolute;
                  top: 0;
                  /* Use container's padding box so the map is inset by the horizontal padding */
                  left: 0;
                  right: 0;
                  bottom: 50px;
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
          </div>
        </div>
      </section>
    </>
  );
}
