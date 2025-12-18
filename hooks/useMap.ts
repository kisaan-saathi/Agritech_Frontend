import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import type { LayerKey, SelectedField, FieldProperties, HoverInfo } from "@/lib/types";
import { getBBox, rgbToIndexValue, getVegetationLabel, maskImageToPolygon } from "@/lib/utils";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MAPBOX_STYLE,
  MAX_FIT_ZOOM,
  FIT_BOUNDS_PADDING,
  HEATMAP_BASE_SIZE,
  HEATMAP_OPACITY,
  FIELD_OUTLINE_COLOR,
  FIELD_SELECTED_COLOR,
} from "@/lib/constants";
import { fetchFields, fetchHeatmap, createField, calculateIndices } from "@/lib/api";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface UseMapOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  selectedLayer: LayerKey;
  selectedDate: string;
  onFieldSelect: (field: SelectedField | null) => void;
  onFieldsLoad: (fields: any[]) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onHoverChange: (info: HoverInfo | null) => void;
  onDrawPolygon?: (geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon) => void;
}

export function useMap({
  containerRef,
  selectedLayer,
  selectedDate,
  onFieldSelect,
  onFieldsLoad,
  onLoadingChange,
  onHoverChange,
  onDrawPolygon,
}: UseMapOptions) {
  // Refs
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const selectedLayerRef = useRef<LayerKey>(selectedLayer);
  const selectedDateRef = useRef<string>(selectedDate);
  const heatmapImageRef = useRef<HTMLImageElement | null>(null);
  const heatmapBoundsRef = useRef<[number, number, number, number] | null>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keep refs in sync
  useEffect(() => {
    selectedLayerRef.current = selectedLayer;
  }, [selectedLayer]);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  const loadFields = useCallback(async (map: mapboxgl.Map) => {
    try {
      const geojson = await fetchFields();
      onFieldsLoad(geojson.features || []);

      const sourceId = "fields";
      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson);
        return;
      }

      map.addSource(sourceId, { type: "geojson", data: geojson });

      map.addLayer({
        id: "fields-fill",
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": "transparent",
          "fill-opacity": 0.01,
        },
      });

      map.addLayer({
        id: "fields-outline",
        type: "line",
        source: sourceId,
        paint: {
          "line-color": FIELD_OUTLINE_COLOR,
          "line-width": 2,
        },
      });

      map.addLayer({
        id: "fields-selected",
        type: "line",
        source: sourceId,
        paint: {
          "line-color": FIELD_SELECTED_COLOR,
          "line-width": 3,
        },
        filter: ["==", ["get", "id"], ""],
      });
    } catch (error) {
      console.error("Failed to load fields:", error);
    }
  }, [onFieldsLoad]);

  const renderHeatmap = useCallback(async (
    map: mapboxgl.Map,
    field: SelectedField,
    date: string,
    layer: LayerKey,
    skipFitBounds: boolean = false
  ) => {
    onLoadingChange(true);

    const bbox = getBBox(field.geometry);
    const bboxWidth = bbox[2] - bbox[0];
    const bboxHeight = bbox[3] - bbox[1];
    const aspectRatio = bboxWidth / bboxHeight;
    
    const imgWidth = aspectRatio >= 1 
      ? HEATMAP_BASE_SIZE 
      : Math.round(HEATMAP_BASE_SIZE * aspectRatio);
    const imgHeight = aspectRatio >= 1 
      ? Math.round(HEATMAP_BASE_SIZE / aspectRatio) 
      : HEATMAP_BASE_SIZE;

    try {
      const rawUrl = await fetchHeatmap(field.id, {
        layer,
        width: imgWidth,
        height: imgHeight,
        toDate: date,
      });

      // Mask the image to the polygon shape
      let maskedUrl: string;
      try {
        maskedUrl = await maskImageToPolygon(rawUrl, field.geometry, bbox, imgWidth, imgHeight);
        URL.revokeObjectURL(rawUrl); // Clean up raw URL after masking
      } catch (err) {
        console.error("Failed to mask image:", err);
        maskedUrl = rawUrl; // Fallback to unmasked image
      }

      const coords: [[number, number], [number, number], [number, number], [number, number]] = [
        [bbox[0], bbox[3]],
        [bbox[2], bbox[3]],
        [bbox[2], bbox[1]],
        [bbox[0], bbox[1]],
      ];

      if (map.getLayer("field-heatmap")) map.removeLayer("field-heatmap");
      if (map.getSource("field-heatmap")) map.removeSource("field-heatmap");

      map.addSource("field-heatmap", {
        type: "image",
        url: maskedUrl,
        coordinates: coords,
      });

      map.addLayer({
        id: "field-heatmap",
        type: "raster",
        source: "field-heatmap",
        paint: { "raster-opacity": HEATMAP_OPACITY },
      }, "fields-outline");

      heatmapBoundsRef.current = bbox;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        heatmapImageRef.current = img;
        if (!heatmapCanvasRef.current) {
          heatmapCanvasRef.current = document.createElement("canvas");
        }
        heatmapCanvasRef.current.width = img.width;
        heatmapCanvasRef.current.height = img.height;
        const ctx = heatmapCanvasRef.current.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0);
      };
      img.src = maskedUrl;

      map.setFilter("fields-selected", ["==", ["get", "id"], field.id]);

      if (!skipFitBounds) {
        map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], {
          padding: FIT_BOUNDS_PADDING,
          maxZoom: MAX_FIT_ZOOM,
        });
      }
    } catch (err) {
      console.error("Heatmap error:", err);
    }

    onLoadingChange(false);
  }, [onLoadingChange]);

  const clearHeatmap = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      if (map.getLayer("field-heatmap")) map.removeLayer("field-heatmap");
      if (map.getSource("field-heatmap")) map.removeSource("field-heatmap");
    }
    heatmapImageRef.current = null;
    heatmapBoundsRef.current = null;
    heatmapCanvasRef.current = null;
    onHoverChange(null);
  }, [onHoverChange]);

  const zoomToField = useCallback((feature: any) => {
    const map = mapRef.current;
    if (!map || !feature.geometry) return;

    const geometry = feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
    const bbox = getBBox(geometry);
    
    map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], {
      padding: FIT_BOUNDS_PADDING,
      maxZoom: MAX_FIT_ZOOM,
      duration: 1000,
    });

    const props = feature.properties as FieldProperties;
    const field: SelectedField = {
      id: props.id?.toString() || "",
      properties: props,
      geometry,
    };
    onFieldSelect(field);
  }, [onFieldSelect]);

  const reloadFields = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;

    try {
      const geojson = await fetchFields();
      onFieldsLoad(geojson.features || []);
      
      if (map.getSource("fields")) {
        (map.getSource("fields") as mapboxgl.GeoJSONSource).setData(geojson);
      }
    } catch (error) {
      console.error("Failed to reload fields:", error);
    }
  }, [onFieldsLoad]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE,
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
    });

    mapRef.current = map;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: false, trash: false },
    });
    drawRef.current = draw;
    map.addControl(draw, "top-left");

    map.on("load", () => loadFields(map));

    map.on("click", "fields-fill", async (e) => {
      const feature = e.features?.[0];
      if (!feature?.geometry) return;

      const props = feature.properties as FieldProperties;
      const fieldId = props.id?.toString();
      if (!fieldId) return;

      const geometry = feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
      const field: SelectedField = { id: fieldId, properties: props, geometry };

      onFieldSelect(field);
      await renderHeatmap(map, field, selectedDateRef.current, selectedLayerRef.current);
    });

    map.on("mouseenter", "fields-fill", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "fields-fill", () => {
      map.getCanvas().style.cursor = "";
    });

    map.on("mousemove", (e) => {
      if (!heatmapImageRef.current || !heatmapBoundsRef.current || !heatmapCanvasRef.current) {
        onHoverChange(null);
        return;
      }

      const { lngLat, point } = e;
      const bounds = heatmapBoundsRef.current;
      const [minX, minY, maxX, maxY] = bounds;

      if (lngLat.lng < minX || lngLat.lng > maxX || lngLat.lat < minY || lngLat.lat > maxY) {
        onHoverChange(null);
        return;
      }

      const img = heatmapImageRef.current;
      const canvas = heatmapCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        onHoverChange(null);
        return;
      }

      const xRatio = (lngLat.lng - minX) / (maxX - minX);
      const yRatio = 1 - (lngLat.lat - minY) / (maxY - minY);
      const pixelX = Math.floor(xRatio * img.width);
      const pixelY = Math.floor(yRatio * img.height);

      try {
        const imageData = ctx.getImageData(pixelX, pixelY, 1, 1);
        const [r, g, b, a] = imageData.data;

        if (a < 50) {
          onHoverChange(null);
          return;
        }

        const value = rgbToIndexValue(r, g, b);
        if (value === null) {
          onHoverChange(null);
          return;
        }

        const { label, color } = getVegetationLabel(value, selectedLayerRef.current);
        onHoverChange({
          x: point.x,
          y: point.y,
          value: Math.round(value * 100) / 100,
          label,
          color,
        });
      } catch {
        onHoverChange(null);
      }
    });

    map.on("mouseout", () => onHoverChange(null));

    map.on("draw.create", async (e: any) => {
      const geometry = e.features[0].geometry;
      if (drawRef.current) {
        drawRef.current.deleteAll();
      }
      if (onDrawPolygon) {
        onDrawPolygon(geometry);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [containerRef, loadFields, renderHeatmap, onFieldSelect, onFieldsLoad, onHoverChange]);

  const deleteFieldFromMap = useCallback((fieldId: string) => {
    const map = mapRef.current;
    if (!map) return;

    clearHeatmap();

    const source = map.getSource("fields") as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      fetchFields().then(geojson => {
        source.setData(geojson);
      }).catch(console.error);
    }
  }, [clearHeatmap]);

  const updateFieldName = useCallback((fieldId: string, newName: string) => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource("fields") as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      fetchFields().then(geojson => {
        source.setData(geojson);
      }).catch(console.error);
    }
  }, []);

  return {
    mapRef,
    renderHeatmap,
    clearHeatmap,
    zoomToField,
    reloadFields,
    deleteFieldFromMap,
    updateFieldName,
  };
}
