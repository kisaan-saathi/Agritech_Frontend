"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function LeafletMap() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const [features, setFeatures] = useState<any[]>([]);

  async function loadFields() {
    const res = await fetch("/api/fields");
    const geojson = await res.json();
    setFeatures(geojson.features || []);
  }

  useEffect(() => {
    loadFields();
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [75.9, 22.7],
      zoom: 6,
    });

    mapRef.current = map;

    // ✅ WAIT FOR MAP TO LOAD
    map.on("load", () => {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
      });

      drawRef.current = draw;
      map.addControl(draw, "top-right");

      // ✅ ON DRAW
      map.on("draw.create", async (e) => {
        const feature = e.features[0];

        await fetch("/api/fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            farmerName: "Ramesh",
            cropType: "Wheat",
            geometry: feature.geometry,
          }),
        });

        loadFields();
      });
    });
  }, []);

  // ✅ SHOW SAVED FIELDS
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getSource("fields")) {
      map.removeLayer("fields-layer");
      map.removeSource("fields");
    }

    if (!features.length) return;

    map.addSource("fields", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features,
      },
    });

    map.addLayer({
      id: "fields-layer",
      type: "fill",
      source: "fields",
      paint: {
        "fill-color": "#22c55e",
        "fill-opacity": 0.4,
      },
    });
  }, [features]);

  return <div ref={containerRef} style={{ height: "100vh", width: "100%" }} />;
}
