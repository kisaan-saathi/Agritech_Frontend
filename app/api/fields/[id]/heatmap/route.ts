import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getSentinelToken } from "@/lib/sentinel";
import { Console } from "console";

const PROCESS_URL = "https://services.sentinel-hub.com/api/v1/process";

const SUPPORTED_LAYERS = ["ndvi", "ndre", "evi", "ndwi", "savi"] as const;
type Layer = (typeof SUPPORTED_LAYERS)[number];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildEvalscript(layer: Layer) {
  const formulas: Record<Layer, string> = {
    ndvi: "(B08 - B04) / (B08 + B04 + 0.0001)",
    ndre: "(B08 - B05) / (B08 + B05 + 0.0001)",
    evi: "2.5 * (B08 - B04) / (B08 + 6.0 * B04 - 7.5 * B02 + 1.0)",
    ndwi: "(B03 - B08) / (B03 + B08 + 0.0001)",
    savi: "1.5 * (B08 - B04) / (B08 + B04 + 0.5)",
  };

  const formula = formulas[layer];

  // Smooth thermal/infrared gradient with better color transitions
  return `//VERSION=3
function setup() {
  return {
    input: ["B02", "B03", "B04", "B05", "B08", "dataMask"],
    output: { bands: 4, sampleType: "UINT8" }
  };
}

// Smooth linear interpolation
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Color interpolation for smooth gradients
function lerpColor(c1, c2, t) {
  return [
    lerp(c1[0], c2[0], t),
    lerp(c1[1], c2[1], t),
    lerp(c1[2], c2[2], t)
  ];
}

// Vegetation color scale with smooth interpolation
function vegetationColor(val) {
  // Clamp value to expected range
  val = Math.max(-0.3, Math.min(1.0, val));
  
  // Color stops for vegetation gradient
  var stops = [
    { v: -0.3, color: [0, 0, 130] },      // Deep blue (water)
    { v: 0.0, color: [90, 0, 160] },      // Purple (bare soil)
    { v: 0.2, color: [255, 0, 0] },       // Red (very low vegetation)
    { v: 0.35, color: [255, 120, 0] },    // Orange (low)
    { v: 0.5, color: [255, 230, 0] },     // Yellow (moderate)
    { v: 0.7, color: [120, 200, 60] },    // Light green (good)
    { v: 0.9, color: [0, 90, 0] }         // Dark green (best)
  ];
  
  // Find the two stops to interpolate between
  for (var i = 0; i < stops.length - 1; i++) {
    if (val >= stops[i].v && val <= stops[i + 1].v) {
      var t0 = stops[i].v;
      var t1 = stops[i + 1].v;
      var localT = (val - t0) / (t1 - t0);
      
      // Apply smoothstep for smoother transitions
      localT = localT * localT * (3 - 2 * localT);
      
      var color = lerpColor(stops[i].color, stops[i + 1].color, localT);
      return [Math.round(color[0]), Math.round(color[1]), Math.round(color[2])];
    }
  }
  
  return stops[stops.length - 1].color;
}

function evaluatePixel(sample) {
  if (sample.dataMask === 0) {
    return [0, 0, 0, 0];
  }

  var B02 = sample.B02;
  var B03 = sample.B03;
  var B04 = sample.B04;
  var B05 = sample.B05;
  var B08 = sample.B08;

  var val = ${formula};

  var color = vegetationColor(val);
  return [color[0], color[1], color[2], 255];
}`;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = context.params instanceof Promise ? await context.params : context.params;

    const search = new URL(req.url).searchParams;
    const layer = (search.get("layer") ?? "ndvi").toLowerCase() as Layer;

    if (!SUPPORTED_LAYERS.includes(layer)) {
      return NextResponse.json(
        { error: `Unsupported layer. Use one of ${SUPPORTED_LAYERS.join(", ")}` },
        { status: 400 }
      );
    }

    const days = Number(search.get("days")) || 90;
    
    // Use historical data from 2024 to ensure data availability
    // Sentinel-2 may not have data for future dates (2025)
    const fallbackEndDate = "2024-10-01"; // Known good date with data
    const endDate = search.get("to") ? new Date(search.get("to")!) : new Date(fallbackEndDate);
    
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    const toDate = endDate.toISOString().split("T")[0] + "T23:59:59Z";
    const fromDate = startDate.toISOString().split("T")[0] + "T00:00:00Z";

    const width = clamp(Number(search.get("width")) || 512, 64, 2048);
    const height = clamp(Number(search.get("height")) || 512, 64, 2048);

    const geoRes = await pool.query(
      `SELECT ST_AsGeoJSON(geom) AS geom FROM fields WHERE id::text = $1`,
      [id]
    );

    if (!geoRes.rows.length) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    const geometry = JSON.parse(geoRes.rows[0].geom);
    const token = await getSentinelToken();

    const evalscript = buildEvalscript(layer);

    // Log incoming request details
    console.log("[HEATMAP] Incoming request to /api/fields/[id]/heatmap");
    console.log("[HEATMAP] Params:", { id, layer, fromDate, toDate });

    const body = {
      input: {
        bounds: {
          geometry,
          properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
        },
        data: [
          {
            type: "sentinel-2-l2a",
            dataFilter: {
              timeRange: { from: fromDate, to: toDate },
              mosaickingOrder: "leastCC",
              maxCloudCoverage: 20,
            },
            processing: {
              harmonizeValues: true,
            },
          },
        ],
      },
      output: {
        width,
        height,
        responses: [
          {
            identifier: "default",
            format: { type: "image/png" },
          },
        ],
      },
      evalscript,
    };

    console.log("[HEATMAP] SentinelHub Process API Request Body:", JSON.stringify(body, null, 2));
    console.log("[HEATMAP] Using Sentinel token:", token);
    const sentinelRes = await fetch(PROCESS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "image/png",
      },
      body: JSON.stringify(body),
    });
    console.log("[HEATMAP] SentinelHub response status:", sentinelRes.status);

    const contentType = sentinelRes.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const errorJson = await sentinelRes.json();
      console.error("Sentinel API error:", errorJson);
      return NextResponse.json(
        { error: "Sentinel Hub API error", detail: errorJson },
        { status: 502 }
      );
    }

    if (!sentinelRes.ok) {
      const errorText = await sentinelRes.text();
      console.error("Sentinel heatmap error", sentinelRes.status, errorText);
      return NextResponse.json(
        { error: "Failed to render heatmap", status: sentinelRes.status, detail: errorText },
        { status: 502 }
      );
    }

    const buffer = Buffer.from(await sentinelRes.arrayBuffer());

    if (buffer.length < 500) {
      console.warn("[HEATMAP] Sentinel returned very small image:", buffer.length, "bytes");
    }

    console.log("[HEATMAP] PNG buffer size:", buffer.length, "bytes");

    // For debugging: Write a temporary PNG file and log the path (Node.js only, for local dev)
    // if (process.env.NODE_ENV !== "production") {
    //   try {
    //     const fs = require("fs");
    //     const path = require("path");
    //     const tmpPath = path.join(process.cwd(), `debug-heatmap-${id}.png`);
    //     fs.writeFileSync(tmpPath, buffer);
    //     console.log(`[HEATMAP] PNG written to: file://${tmpPath}`);
    //   } catch (e) {
    //     console.warn("[HEATMAP] Could not write debug PNG:", e);
    //   }
    // }

    // Add header to allow opening in new tab
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": "inline; filename=heatmap.png"
      },
    });
  } catch (err) {
    console.error("Heatmap API error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
