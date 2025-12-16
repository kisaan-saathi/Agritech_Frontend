/**
 * API endpoint to fetch available Sentinel-2 scenes for a field
 * This queries the Sentinel Hub Catalog API to get actual satellite imagery dates
 */

import { NextRequest, NextResponse } from "next/server";
import { getSentinelToken } from "@/lib/sentinel";
import { pool } from "@/lib/db";

const CATALOG_URL = "https://services.sentinel-hub.com/api/v1/catalog/1.0.0/search";

interface CatalogFeature {
  id: string;
  properties: {
    datetime: string;
    "eo:cloud_cover": number;
  };
}

interface CatalogResponse {
  features: CatalogFeature[];
  context: {
    returned: number;
    limit: number;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    // Get cloud cover threshold (default 50%)
    const maxCloudCover = parseInt(searchParams.get("maxCloud") || "50");
    
    // Get date range (default last 3 months)
    const toDate = searchParams.get("to") || new Date().toISOString().split("T")[0];
    const fromDate = searchParams.get("from") || (() => {
      const d = new Date();
      d.setMonth(d.getMonth() - 3);
      return d.toISOString().split("T")[0];
    })();

    // Fetch field geometry from database
    const fieldResult = await pool.query(
      `SELECT ST_AsGeoJSON(geom) as geojson FROM fields WHERE id = $1`,
      [id]
    );

    if (fieldResult.rows.length === 0) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    const geometry = JSON.parse(fieldResult.rows[0].geojson);

    // Get Sentinel Hub token
    const token = await getSentinelToken();

    // Query Sentinel Hub Catalog API
    const catalogRequest = {
      bbox: getBBox(geometry),
      datetime: `${fromDate}T00:00:00Z/${toDate}T23:59:59Z`,
      collections: ["sentinel-2-l2a"],
      limit: 100,
      filter: `eo:cloud_cover < ${maxCloudCover}`,
    };

    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const body = JSON.stringify(catalogRequest);
    // console.log("SentinelHub Catalog API Request Headers:", headers);
    // console.log("SentinelHub Catalog API Request Body:", body);
    const response = await fetch(CATALOG_URL, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Catalog API error:", errorText);
      
      // Fallback to generated dates if catalog fails
      return NextResponse.json({
        scenes: generateFallbackDates(fromDate, toDate),
        source: "fallback",
        message: "Using estimated dates (Catalog API unavailable)",
      });
    }

    const data: CatalogResponse = await response.json();

    // Extract unique dates and sort them
    const scenes = data.features
      .map((f) => ({
        date: f.properties.datetime.split("T")[0],
        cloudCover: Math.round(f.properties["eo:cloud_cover"]),
        id: f.id,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Remove duplicates (same date)
    const uniqueScenes = scenes.filter(
      (scene, index, self) => 
        index === self.findIndex((s) => s.date === scene.date)
    );

    // Calculate next expected image (Sentinel-2 revisit is ~5 days)
    const lastDate = uniqueScenes.length > 0 
      ? new Date(uniqueScenes[uniqueScenes.length - 1].date)
      : new Date();
    const nextImageDate = new Date(lastDate);
    nextImageDate.setDate(nextImageDate.getDate() + 5);

    return NextResponse.json({
      scenes: uniqueScenes,
      source: "sentinel-hub",
      nextImage: nextImageDate.toISOString().split("T")[0],
      totalFound: data.context.returned,
    });
  } catch (error) {
    console.error("Error fetching scenes:", error);
    
    // Return fallback dates on error
    const toDate = new Date().toISOString().split("T")[0];
    const fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    return NextResponse.json({
      scenes: generateFallbackDates(fromDate, toDate),
      source: "fallback",
      message: "Using estimated dates",
    });
  }
}


function getBBox(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): [number, number, number, number] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  const coords = geometry.type === "Polygon" 
    ? [geometry.coordinates] 
    : geometry.coordinates;
  
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
 * Generate fallback dates when catalog API is unavailable
 * Sentinel-2 has a 5-day revisit time
 */
function generateFallbackDates(fromDate: string, toDate: string): Array<{ date: string; cloudCover: number | null }> {
  const dates: Array<{ date: string; cloudCover: number | null }> = [];
  const start = new Date(fromDate);
  const end = new Date(toDate);
  
  const current = new Date(start);
  while (current <= end) {
    dates.push({
      date: current.toISOString().split("T")[0],
      cloudCover: null, // Unknown
    });
    current.setDate(current.getDate() + 5); // Sentinel-2 revisit time
  }
  
  return dates;
}
