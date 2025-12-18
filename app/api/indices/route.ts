import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSentinelToken } from "@/lib/sentinel";
 
/* ============================================================
   HELPERS
============================================================ */
 
function readMean(bucket: any, id: string): number | null {
  const out = bucket.outputs?.[id];
  if (!out) return null;
  if (out.stats?.mean != null) return out.stats.mean;
  if (out.bands?.B0?.stats?.mean != null) return out.bands.B0.stats.mean;
  return null;
}
 
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
 
function mean(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
}
 
function std(arr: number[]) {
  if (!arr.length) return null;
  const m = mean(arr)!;
  return Math.sqrt(mean(arr.map(v => (v - m) ** 2))!);
}
 
function linearTrend(values: number[]) {
  if (values.length < 2) return 0;
  const x = values.map((_, i) => i);
  const x̄ = mean(x)!;
  const ȳ = mean(values)!;
  const num = x.reduce((s, xi, i) => s + (xi - x̄) * (values[i] - ȳ), 0);
  const den = x.reduce((s, xi) => s + (xi - x̄) ** 2, 0);
  return den === 0 ? 0 : num / den;
}
 
/* ============================================================
   SOIL TEXTURE (SATELLITE HEURISTIC)
============================================================ */
 
function estimateSoilTexture(soil: any) {
  const ndvi = clamp(soil.ndvi_mean_90d ?? 0.5, 0, 1);
  const bsi = clamp(soil.bsi_mean_90d ?? 0, -1, 1);
 
  let clay = 20 + (1 - ndvi) * 30;
  let sand = 30 + (bsi + 1) * 20;
  let silt = 100 - clay - sand;
 
  clay = clamp(clay, 10, 60);
  sand = clamp(sand, 10, 70);
  silt = clamp(100 - clay - sand, 5, 60);
 
  return {
    clay: Number(clay.toFixed(1)),
    silt: Number(silt.toFixed(1)),
    sand: Number(sand.toFixed(1)),
    elevation: 400
  };
}
 
/* ============================================================
   SOIL CHEMISTRY (SATELLITE HEURISTIC)
============================================================ */
 
function estimateChemistry(soil: any) {
  const ndvi = clamp(soil.ndvi_mean_90d ?? 0.5, 0, 1);
  const bsi = clamp(soil.bsi_mean_90d ?? 0, -1, 1);
 
  const soc = clamp(0.4 + ndvi * 1.6, 0.4, 2.5);
  const ph = clamp(6.2 + (0.5 - ndvi) * 1.5 + bsi * 0.3, 5.5, 8.5);
 
  return {
    soc_0_30: Number(soc.toFixed(2)),
    ph_0_30: Number(ph.toFixed(2))
  };
}
 
/* ============================================================
   RAINFALL — STUB
============================================================ */
 
async function fetchRainfall30d() {
  return 0;
}
 
/* ============================================================
   API
============================================================ */
 
export async function POST(req: NextRequest) {
  console.log("[INDICES] Incoming request");
 
  const { fieldId, from, to } = JSON.parse(await req.text());
 
  const geoRes = await pool.query(
    `SELECT ST_AsGeoJSON(geom) AS geom, area_ha FROM fields WHERE id=$1`,
    [fieldId]
  );
 
  if (!geoRes.rows.length) {
    return NextResponse.json({ error: "Field not found" }, { status: 404 });
  }
 
  const geometry = JSON.parse(geoRes.rows[0].geom);
  const area_ha = geoRes.rows[0].area_ha;
 
  const now = new Date();
  const fromDate = from ?? new Date(now.setMonth(now.getMonth() - 3)).toISOString();
  const toDate = to ?? new Date().toISOString();
 
  const token = await getSentinelToken();
 
  const sentinelBody = {
    input: {
      bounds: {
        geometry,
        properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" }
      },
      data: [{
        type: "sentinel-2-l2a",
        dataFilter: {
          timeRange: { from: fromDate, to: toDate },
          mosaickingOrder: "leastCC"
        }
      }]
    },
    aggregation: {
      timeRange: { from: fromDate, to: toDate },
      aggregationInterval: { of: "P1W" },
      resolution: { x: 10, y: 10 },
      evalscript: `
        //VERSION=3
        function setup() {
          return {
            input:["B02","B03","B04","B05","B08","B11","dataMask"],
            output:[
              {id:"ndvi",bands:1},
              {id:"ndre",bands:1},
              {id:"bsi",bands:1},
              {id:"dataMask",bands:1}
            ]
          };
        }
        function evaluatePixel(s){
          if(s.dataMask===0) return { ndvi:[0], ndre:[0], bsi:[0], dataMask:[0] };
          return {
            ndvi:[(s.B08-s.B04)/(s.B08+s.B04)],
            ndre:[(s.B08-s.B05)/(s.B08+s.B05)],
            bsi:[(s.B11+s.B04-s.B08-s.B02)/(s.B11+s.B04+s.B08+s.B02)],
            dataMask:[1]
          };
        }
      `
    }
  };
 
  const sentinelRes = await fetch(
    "https://services.sentinel-hub.com/api/v1/statistics",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sentinelBody)
    }
  );
 
  if (!sentinelRes.ok) {
    return NextResponse.json({ error: "Sentinel failed" }, { status: 502 });
  }
 
  const stats = await sentinelRes.json();
  const client = await pool.connect();
 
  try {
    await client.query("BEGIN");
 
    const series: any[] = [];
 
    for (const b of stats.data ?? []) {
      const ndvi = readMean(b, "ndvi");
      if (ndvi == null) continue;
 
      const cloud_pct =
        b.outputs?.dataMask?.stats?.mean != null
          ? (1 - b.outputs.dataMask.stats.mean) * 100
          : 0;
 
      series.push({
        ndvi,
        ndre: readMean(b, "ndre"),
        bsi: readMean(b, "bsi"),
        cloud_pct
      });
    }
 
    const soilAgg = {
      ndvi_mean_90d: mean(series.map(s => s.ndvi)),
      ndvi_std_90d: std(series.map(s => s.ndvi)),
      ndvi_trend_30d: linearTrend(series.slice(-4).map(s => s.ndvi)),
      ndre_mean_90d: mean(series.map(s => s.ndre)),
      bsi_mean_90d: mean(series.map(s => s.bsi)),
      cloud_pct: mean(series.map(s => s.cloud_pct)),
      valid_obs_count: series.length
    };
 
    const texture = estimateSoilTexture(soilAgg);
    const chemistry = estimateChemistry(soilAgg);
    const rainfall_30d = await fetchRainfall30d();
 
    await client.query(
      `INSERT INTO soil_features(
        field_id,
        ndvi_mean_90d, ndvi_trend_30d, ndvi_std_90d,
        ndre_mean_90d, bsi_mean_90d,
        clay, silt, sand,
        ph_0_30, soc_0_30, cloud_pct,
        valid_obs_count,
        area_ha, elevation, rainfall_30d
      ) VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,
        $10,$11,$12,
        $13,$14,$15,$16
      )
      ON CONFLICT(field_id) DO UPDATE SET
        ndvi_mean_90d = EXCLUDED.ndvi_mean_90d,
        ndvi_trend_30d = EXCLUDED.ndvi_trend_30d,
        ndvi_std_90d = EXCLUDED.ndvi_std_90d,
        ndre_mean_90d = EXCLUDED.ndre_mean_90d,
        bsi_mean_90d = EXCLUDED.bsi_mean_90d,
        clay = EXCLUDED.clay,
        silt = EXCLUDED.silt,
        sand = EXCLUDED.sand,
        ph_0_30 = EXCLUDED.ph_0_30,
        soc_0_30 = EXCLUDED.soc_0_30,
        cloud_pct = EXCLUDED.cloud_pct,
        elevation = EXCLUDED.elevation,
        rainfall_30d = EXCLUDED.rainfall_30d,
        computed_at = now()`,
      [
        fieldId,
        soilAgg.ndvi_mean_90d,
        soilAgg.ndvi_trend_30d,
        soilAgg.ndvi_std_90d,
        soilAgg.ndre_mean_90d,
        soilAgg.bsi_mean_90d,
        texture.clay,
        texture.silt,
        texture.sand,
        chemistry.ph_0_30,
        chemistry.soc_0_30,
        soilAgg.cloud_pct,
        soilAgg.valid_obs_count,
        area_ha,
        texture.elevation,
        rainfall_30d
      ]
    );
 
    await client.query("COMMIT");
 
    return NextResponse.json({
      fieldId,
      soil: { ...texture, ...chemistry },
      cloud_pct: soilAgg.cloud_pct
    });
 
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  } finally {
    client.release();
  }
}