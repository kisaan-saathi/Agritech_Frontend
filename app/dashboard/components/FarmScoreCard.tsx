"use client";
import MapSearch from "../../../components/MapSearch";
import { useRef, useState, useCallback, useEffect } from "react";
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
import {
  Timeline,
  MapControls,
  BottomPanels,
  HoverTooltip,
  LoadingOverlay,
  CoordsDisplay,
} from "@/components/field-dashboard-ui";

export default function FarmScoreCard() {
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
    <section className="mb-5 h-100vh">
      <div className="grid grid-cols-6 lg:grid-cols-6 sm:grid-cols-6 gap-6 pb-3">
        <div className="lg:col-span-1 md:col-span-2 sm:col-span-2 rounded-2xl shadow p-2">
          <h2 className="text-xl font-bold text-gray-800 p-3 border-bottom">
            Farm Balance Scorecard
          </h2>
          <div className="farm-score-card h-96 rounded-2xl shadow-2xl mx-3 my-2 px-2 py-3 flex flex-col items-start md:items-center justify-between text-white relative overflow-hidden">
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
          <div className="flex items-center justify-between border-b p-1">
            <div className="flex flex-row">
              <h2 className="text-xl font-bold text-gray-800 mb-0 p-3">
                My Farm
              </h2>
              <MapSearch
                onSearch={handleSearch}
                onCurrentLocation={handleCurrentLocation}
              />
              <div className="btn-group ml-2 my-2" style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="btn dropdown-toggle relative my-2"
                  style={{ backgroundColor: 'white', border: '1px solid black', color: 'black', padding: '5px 12px' }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                >
                  Crop
                  {fields.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full px-1 min-w-[18px] h-[18px] flex items-center justify-center">
                      {fields.length}
                    </span>
                  )}
                </button>
                <ul className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`} style={{ position: 'absolute', top: '100%', left: '0', zIndex: 1000, display: dropdownOpen ? 'block' : 'none', maxHeight: '200px', overflowY: 'auto', width: '200px' }}>
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
                          <a
                            className={`dropdown-item ${isActive ? 'active' : ''}`}
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSidebarFieldSelect(field);
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <div className="fw-medium">
                                  {field.properties?.name || `Field ${fieldId}`}
                                </div>
                                <div className="text-muted small">
                                  {field.properties?.area
                                    ? `${Number(field.properties.area).toFixed(2)} ha`
                                    : "Area N/A"}
                                </div>
                              </div>
                              <button
                                className="btn btn-sm btn-outline-danger ms-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteField(fieldId?.toString() || "", e);
                                }}
                                title="Delete field"
                              >
                                🗑️
                              </button>
                            </div>
                          </a>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            </div>
          </div>
          <div className="dashboard-container">
            <div className="map-container" ref={mapContainer} />

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
  );
}
