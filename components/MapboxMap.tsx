"use client";

import { useEffect, useRef, useState } from "react";
import MapSearch from "./MapSearch";
import { geocodePlace } from "../lib/geocode";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import type { GeoJSON } from "geojson";

// Ensure Mapbox and Draw control styles load even if globals are trimmed
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type LayerKey = "ndvi" | "ndre" | "evi" | "ndwi" | "savi";

function getBBox(
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
): [number, number, number, number] {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  const coords =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;

  for (const poly of coords) {
    for (const ring of poly) {
      for (const [lng, lat] of ring) {
        minX = Math.min(minX, lng);
        minY = Math.min(minY, lat);
        maxX = Math.max(maxX, lng);
        maxY = Math.max(maxY, lat);
      }
    }
  }

  return [minX, minY, maxX, maxY];
}

/**
 * Mask an image to a polygon shape using Canvas
 * Returns a data URL of the masked image
 */
async function maskImageToPolygon(
  imageUrl: string,
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon,
  bbox: [number, number, number, number],
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      // Convert geo coordinates to canvas pixels
      const [minX, minY, maxX, maxY] = bbox;
      const geoWidth = maxX - minX;
      const geoHeight = maxY - minY;

      function geoToPixel(lng: number, lat: number): [number, number] {
        const x = ((lng - minX) / geoWidth) * width;
        // Flip Y since geo coords increase upward but canvas increases downward
        const y = ((maxY - lat) / geoHeight) * height;
        return [x, y];
      }

      // Draw the polygon mask
      ctx.beginPath();

      const rings =
        geometry.type === "Polygon"
          ? geometry.coordinates
          : geometry.coordinates.flat();

      for (const ring of rings) {
        const firstCoord = ring[0];
        const [startX, startY] = geoToPixel(firstCoord[0], firstCoord[1]);
        ctx.moveTo(startX, startY);

        for (let i = 1; i < ring.length; i++) {
          const [x, y] = geoToPixel(ring[i][0], ring[i][1]);
          ctx.lineTo(x, y);
        }
        ctx.closePath();
      }

      
      ctx.clip();

      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => reject(new Error("Failed to load image for masking"));
    img.src = imageUrl;
  });
}

export default function MapboxMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const overlayUrlRef = useRef<string | null>(null);
  const drawRef = useRef<any | null>(null);

  const [selectedLayer, setSelectedLayer] = useState<LayerKey>("ndvi");
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  /* ---------------- LOAD EXISTING FIELDS ---------------- */
  async function loadFields(map: mapboxgl.Map) {
    const res = await fetch("/api/fields");
    const geojson = await res.json();

    const sourceId = "fields";

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson);
      return;
    }

    map.addSource(sourceId, {
      type: "geojson",
      data: geojson,
    });

    /* ✅ CORRECT HEALTH COLOR LOGIC */
    map.addLayer({
      id: "fields-fill",
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": [
          "case",
          // ⏳ Processing (no score provided)
          ["==", ["get", "health_score"], null], "#9ca3af",

          // Use a safe numeric value with default -1 when missing
          [">=", ["to-number", ["coalesce", ["get", "health_score"], -1]], 75], "#16a34a",
          [">=", ["to-number", ["coalesce", ["get", "health_score"], -1]], 55], "#84cc16",
          [">=", ["to-number", ["coalesce", ["get", "health_score"], -1]], 35], "#eab308",
          // ❌ Poor
          "#ef4444",
        ],
        "fill-opacity": [
          "case",
          ["==", ["to-string", ["get", "id"]], ["literal", activeFieldId ?? ""]], 0.15,
          0.45,
        ],
      },
    });

    map.addLayer({
      id: "fields-outline",
      type: "line",
      source: sourceId,
      paint: {
        "line-color": "#000",
        "line-width": 1.5,
      },
    });

    // Add a highlighted outline layer for selected field
    map.addLayer({
      id: "fields-selected-outline",
      type: "line",
      source: sourceId,
      paint: {
        "line-color": "#f97316", // Orange highlight
        "line-width": 3,
      },
      filter: ["==", ["to-string", ["get", "id"]], ""], // Initially empty
    });

    /* ---------------- POPUP ---------------- */
    map.on("click", "fields-fill", async (e) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const props = (feature.properties as Record<string, any>) || {};
      const fieldId = (props.id ?? (feature as any).id)?.toString();
      if (!fieldId) {
        console.error("Heatmap click missing field id", { props, feature });
        return;
      }

      const score =
        props.health_score !== undefined && props.health_score !== null
          ? Number(props.health_score)
          : null;

      let label = "⏳ Processing…";
      if (score !== null) {
        label =
          score >= 75
            ? "🟢 Excellent"
            : score >= 55
            ? "🟢 Good"
            : score >= 35
            ? "🟡 Moderate"
            : "🔴 Poor";
      }

      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(
          `
          <strong>${label}</strong><br/>
          Score: ${score !== null ? score : "Calculating…"}
        `
        )
        .addTo(map);

      if (
        feature.geometry &&
        (feature.geometry.type === "Polygon" ||
          feature.geometry.type === "MultiPolygon")
      ) {
        await renderHeatmap(map, fieldId, feature.geometry);
      }
    });

    map.on("mouseenter", "fields-fill", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "fields-fill", () => {
      map.getCanvas().style.cursor = "";
    });
  }

  async function renderHeatmap(
    map: mapboxgl.Map,
    fieldId?: string,
    geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon
  ) {
    const targetFieldId = (fieldId ?? activeFieldId)?.toString();
    if (!targetFieldId || !geometry) return;

    setActiveFieldId(targetFieldId);

    const bbox = getBBox(geometry);

    // Calculate appropriate image dimensions based on bbox aspect ratio
    // Use higher resolution for better gradient visibility
    const bboxWidth = bbox[2] - bbox[0];
    const bboxHeight = bbox[3] - bbox[1];
    const aspectRatio = bboxWidth / bboxHeight;
    const baseSize = 1024; // Higher resolution for smoother gradients
    const imgWidth = aspectRatio >= 1 ? baseSize : Math.round(baseSize * aspectRatio);
    const imgHeight = aspectRatio >= 1 ? Math.round(baseSize / aspectRatio) : baseSize;

    const res = await fetch(
      `/api/fields/${targetFieldId}/heatmap?layer=${selectedLayer}&width=${imgWidth}&height=${imgHeight}`
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Heatmap fetch failed", res.status, errText);
      return;
    }

    const blob = await res.blob();
    const rawUrl = URL.createObjectURL(blob);

    // Mask the image to the polygon shape using Canvas
    let maskedUrl: string;
    try {
      maskedUrl = await maskImageToPolygon(rawUrl, geometry, bbox, imgWidth, imgHeight);
      URL.revokeObjectURL(rawUrl); // Clean up raw URL after masking
    } catch (err) {
      console.error("Failed to mask image:", err);
      maskedUrl = rawUrl; // Fallback to unmasked image
    }

    const coords: [[number, number], [number, number], [number, number], [number, number]] = [
      [bbox[0], bbox[3]], // top-left
      [bbox[2], bbox[3]], // top-right
      [bbox[2], bbox[1]], // bottom-right
      [bbox[0], bbox[1]], // bottom-left
    ];

    // Clean up existing heatmap layers
    if (map.getLayer("field-heatmap")) map.removeLayer("field-heatmap");
    if (map.getSource("field-heatmap")) map.removeSource("field-heatmap");

    // Add the masked heatmap as image source
    map.addSource("field-heatmap", {
      type: "image",
      url: maskedUrl,
      coordinates: coords,
    });

    // Add raster layer for the heatmap
    map.addLayer(
      {
        id: "field-heatmap",
        type: "raster",
        source: "field-heatmap",
        paint: {
          "raster-opacity": 0.9,
          "raster-fade-duration": 0,
        },
      },
      "fields-fill" // Place below the field fill layer
    );

    // Update selected field outline filter
    if (map.getLayer("fields-selected-outline")) {
      map.setFilter("fields-selected-outline", [
        "==",
        ["to-string", ["get", "id"]],
        targetFieldId,
      ]);
    }

    // Update fill layer opacity for selected field
    if (map.getLayer("fields-fill")) {
      map.setPaintProperty("fields-fill", "fill-opacity", [
        "case",
        ["==", ["to-string", ["get", "id"]], targetFieldId],
        0.1, // Very transparent for the selected field so heatmap shows through
        0.45,
      ]);
    }

    // Revoke old blob URL
    if (overlayUrlRef.current && overlayUrlRef.current !== maskedUrl) {
      try {
        URL.revokeObjectURL(overlayUrlRef.current);
      } catch {}
    }
    overlayUrlRef.current = maskedUrl;

    // Fit map to the selected field
    map.fitBounds(
      [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ],
      { padding: 80, maxZoom: 17 }
    );
  }

  //MAP INIT
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [78.9629, 20.5937],
      zoom: 5,
    });

    mapRef.current = map;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
    });

    drawRef.current = draw;
    map.addControl(draw, "top-left");
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => loadFields(map));

    // DRAW → SAVE → INDICES → REFRESH
    map.on("draw.create", async (e: any) => {
      try {
        const geometry = e.features[0].geometry;
        console.log("🟦 Polygon drawn");

        const fieldRes = await fetch("/api/fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Field 1",
            farmerName: "Ramesh",
            cropType: "Wheat",
            season: "Rabi",
            sowingDate: "2025-11-10",
            geometry,
          }),
        });

        if (!fieldRes.ok) throw new Error("Field save failed");
        const field = await fieldRes.json();
        console.log("✅ Field saved:", field.id);

        const indicesRes = await fetch("/api/indices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fieldId: field.id }),
        });

        if (!indicesRes.ok) throw new Error("Indices failed");
        console.log("🌱 Vegetation indices calculated");

        await loadFields(map);
      } catch (err) {
        console.error("❌ Draw pipeline failed:", err);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      if (overlayUrlRef.current) {
        URL.revokeObjectURL(overlayUrlRef.current);
      }
    };
  }, []);


  return (
    <>
      <div ref={mapContainer} style={{ position: "absolute", inset: 0 }} />


      {/* LEGEND */}
      <div
        style={{
          position: "fixed",
          left: 16,
          bottom: 16,
          background: "#fff",
          padding: "8px 12px",
          borderRadius: 8,
          fontSize: 13,
          color: "#0f172a",
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          zIndex: 100000,
          pointerEvents: "auto",
        }}
      >
        <strong>Field Health</strong>
        <div>🟢 75–100 Excellent</div>
        <div>🟢 55–74 Good</div>
        <div>🟡 35–54 Moderate</div>
        <div>🔴 0–34 Poor</div>
        <div>⏳ Processing</div>
      </div>

      {/* HEATMAP CONTROLS */}
      <div
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          background: "#fff",
          padding: "10px 12px",
          borderRadius: 8,
          fontSize: 13,
          color: "#0f172a",
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          zIndex: 100000,
          minWidth: 220,
          pointerEvents: "auto",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Field Heatmap</div>
        <label style={{ display: "block", marginBottom: 6 }}>
          Parameter
          <select
            value={selectedLayer}
            onChange={(e) => {
              const value = e.target.value as LayerKey;
              setSelectedLayer(value);
              if (mapRef.current && activeFieldId && mapRef.current.isStyleLoaded()) {
                const source = mapRef.current.getSource("fields") as
                  | mapboxgl.GeoJSONSource
                  | undefined;
                if (!source) return;

                // find geometry for active field to redraw heatmap
                const data = source.serialize() as any;
                const feature = data?.data?.features?.find(
                  (f: any) =>
                    f.properties?.id?.toString() === activeFieldId ||
                    f.id?.toString() === activeFieldId
                );
                if (
                  feature &&
                  (feature.geometry.type === "Polygon" ||
                    feature.geometry.type === "MultiPolygon")
                ) {
                  renderHeatmap(mapRef.current, activeFieldId, feature.geometry);
                }
              }
            }}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 6,
              border: "1px solid #d4d4d8",
              color: "#0f172a",
              background: "#fff",
            }}
          >
            <option value="ndvi">NDVI</option>
            <option value="ndre">NDRE</option>
            <option value="evi">EVI</option>
            <option value="savi">SAVI</option>
            <option value="ndwi">NDWI</option>
          </select>
        </label>
        <div style={{ color: "#4b5563", fontSize: 12 }}>
          Click a field to render the heatmap. Changing the parameter will refresh the overlay for the selected field.
        </div>
      </div>
    </>
  );
}
