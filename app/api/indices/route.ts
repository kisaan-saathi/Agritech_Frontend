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
 
function normalize(v: number, min = -1, max = 1) {
  return Math.min(1, Math.max(0, (v - min) / (max - min)));
}
 
/* ================= FIELD HEALTH ================= */
 
function computeHealthScore(series: any[]) {
  const recent = series.slice(-3);
 
  let ndvi = 0, ndre = 0, evi = 0, savi = 0, ndwi = 0;
 
  recent.forEach((s) => {
    ndvi += normalize(s.ndvi);
    ndre += normalize(s.ndre);
    evi += normalize(s.evi);
    savi += normalize(s.savi);
    ndwi += normalize(s.ndwi);
  });
 
  const n = recent.length || 1;
  ndvi /= n;
  ndre /= n;
  evi /= n;
  savi /= n;
  ndwi /= n;
 
  return Math.round(
    0.4 * ndvi +
      0.2 * ndre +
      0.15 * evi +
      0.15 * savi +
      0.1 * (1 - ndwi)
  );
}
 
/* ================= SOIL FEATURE MATH ================= */
 
function mean(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
}
 
function std(arr: number[]) {
  if (!arr.length) return null;
  const m = mean(arr)!;
  return Math.sqrt(mean(arr.map((v) => (v - m) ** 2))!);
}
 
function linearTrend(values: number[]) {
  if (values.length < 2) return 0;
  const x = values.map((_, i) => i);
  const x̄ = mean(x)!;
  const ȳ = mean(values)!;
 
  const num = x.reduce(
    (s, xi, i) => s + (xi - x̄) * (values[i] - ȳ),
    0
  );
  const den = x.reduce((s, xi) => s + (xi - x̄) ** 2, 0);
  return den === 0 ? 0 : num / den;
}
 
/* ============================================================
   STATIC SOIL — TEMP STUB (OPTION A)
============================================================ */
 
async function fetchStaticSoilData(client: any, fieldId: string) {
  const q = `
    SELECT
      area_ha,
      NULL::double precision AS clay,
      NULL::double precision AS silt,
      NULL::double precision AS sand,
      NULL::double precision AS elevation
    FROM fields
    WHERE id = $1
  `;
  const res = await client.query(q, [fieldId]);
  return res.rows[0];
}
 
/* ============================================================
   RAINFALL — TEMP STUB (OPTION A)
   ✔ No rainfall tables required
   ✔ Prevents 500 error
============================================================ */
 
async function fetchRainfall30d(client: any, fieldId: string) {
  return 0;
}
 
/* ============================================================
   API
============================================================ */
 
export async function POST(req: NextRequest) {
  console.log("[INDICES] Incoming request");
 
  const { fieldId, from, to } = JSON.parse(await req.text());
 
  const geoRes = await pool.query(
    `SELECT ST_AsGeoJSON(geom) AS geom FROM fields WHERE id=$1`,
    [fieldId]
  );
 
  if (!geoRes.rows.length) {
    return NextResponse.json({ error: "Field not found" }, { status: 404 });
  }
 
  const geometry = JSON.parse(geoRes.rows[0].geom);
 
  /* ✅ SAFE DATE HANDLING */
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
 
  const fromDate = from ?? threeMonthsAgo.toISOString();
  const toDate = to ?? now.toISOString();
 
  const token = await getSentinelToken();
 
  const sentinelBody = {
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
          },
        },
      ],
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
              {id:"evi",bands:1},
              {id:"ndwi",bands:1},
              {id:"savi",bands:1},
              {id:"bsi",bands:1},
              {id:"dataMask",bands:1}
            ]
          };
        }
        function evaluatePixel(s){
          if(s.dataMask===0) return {
            ndvi:[0],ndre:[0],evi:[0],
            ndwi:[0],savi:[0],bsi:[0],dataMask:[0]
          };
          return {
            ndvi:[(s.B08-s.B04)/(s.B08+s.B04)],
            ndre:[(s.B08-s.B05)/(s.B08+s.B05)],
            evi:[2.5*(s.B08-s.B04)/(s.B08+6*s.B04-7.5*s.B02+1)],
            ndwi:[(s.B03-s.B08)/(s.B03+s.B08)],
            savi:[1.5*(s.B08-s.B04)/(s.B08+s.B04+0.5)],
            bsi:[(s.B11+s.B04-s.B08-s.B02)/(s.B11+s.B04+s.B08+s.B02)],
            dataMask:[1]
          };
        }
      `,
    },
  };
 
  const sentinelRes = await fetch(
    "https://services.sentinel-hub.com/api/v1/statistics",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sentinelBody),
    }
  );
 
  if (!sentinelRes.ok) {
    const errText = await sentinelRes.text();
    console.error("Sentinel error:", errText);
    return NextResponse.json(
      { error: "Sentinel request failed" },
      { status: 502 }
    );
  }
 
  const stats = await sentinelRes.json();
  const client = await pool.connect();
 
  try {
    await client.query("BEGIN");
 
    const series: any[] = [];
 
    for (const b of stats.data ?? []) {
      const date = b.interval.from.slice(0, 10);
      const ndvi = readMean(b, "ndvi");
      if (ndvi == null) continue;
 
      const row = {
        date,
        ndvi,
        ndre: readMean(b, "ndre"),
        evi: readMean(b, "evi"),
        ndwi: readMean(b, "ndwi"),
        savi: readMean(b, "savi"),
        bsi: readMean(b, "bsi"),
      };
 
      const scene = await client.query(
        `INSERT INTO satellite_scenes(field_id,satellite,scene_date,source)
         VALUES($1,'SENTINEL_2',$2,'sentinel-hub')
         ON CONFLICT(field_id,satellite,scene_date)
         DO UPDATE SET scene_date=EXCLUDED.scene_date
         RETURNING id`,
        [fieldId, date]
      );
 
      await client.query(
        `INSERT INTO vegetation_indices(scene_id,ndvi,ndre,evi,ndwi,savi,bsi)
         VALUES($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT(scene_id) DO UPDATE SET
         ndvi=EXCLUDED.ndvi, ndre=EXCLUDED.ndre, evi=EXCLUDED.evi,
         ndwi=EXCLUDED.ndwi, savi=EXCLUDED.savi, bsi=EXCLUDED.bsi`,
        [
          scene.rows[0].id,
          row.ndvi,
          row.ndre,
          row.evi,
          row.ndwi,
          row.savi,
          row.bsi,
        ]
      );
 
      series.push(row);
    }
 
    const last90 = series.slice(-13);
    const last30 = series.slice(-4);
 
    const soil = {
      ndvi_mean_90d: mean(last90.map((s) => s.ndvi)),
      ndvi_std_90d: std(last90.map((s) => s.ndvi)),
      ndvi_trend_30d: linearTrend(last30.map((s) => s.ndvi)),
      ndre_mean_90d: mean(last90.map((s) => s.ndre)),
      bsi_mean_90d: mean(last90.map((s) => s.bsi)),
      valid_obs_count: last90.length,
    };
 
    const staticSoil = await fetchStaticSoilData(client, fieldId);
    const rainfall_30d = await fetchRainfall30d(client, fieldId);
 
    await client.query(
      `INSERT INTO soil_features(
        field_id,ndvi_mean_90d,ndvi_trend_30d,ndvi_std_90d,
        ndre_mean_90d,bsi_mean_90d,
        clay,silt,sand,valid_obs_count,
        area_ha,elevation,rainfall_30d
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      ON CONFLICT(field_id) DO UPDATE SET
        ndvi_mean_90d=EXCLUDED.ndvi_mean_90d,
        ndvi_trend_30d=EXCLUDED.ndvi_trend_30d,
        ndvi_std_90d=EXCLUDED.ndvi_std_90d,
        ndre_mean_90d=EXCLUDED.ndre_mean_90d,
        bsi_mean_90d=EXCLUDED.bsi_mean_90d,
        clay=EXCLUDED.clay,
        silt=EXCLUDED.silt,
        sand=EXCLUDED.sand,
        valid_obs_count=EXCLUDED.valid_obs_count,
        elevation=EXCLUDED.elevation,
        rainfall_30d=EXCLUDED.rainfall_30d,
        computed_at=now()`,
      [
        fieldId,
        soil.ndvi_mean_90d,
        soil.ndvi_trend_30d,
        soil.ndvi_std_90d,
        soil.ndre_mean_90d,
        soil.bsi_mean_90d,
        staticSoil.clay,
        staticSoil.silt,
        staticSoil.sand,
        soil.valid_obs_count,
        staticSoil.area_ha,
        staticSoil.elevation,
        rainfall_30d,
      ]
    );
 
    await client.query("COMMIT");
 
    return NextResponse.json({
      fieldId,
      scenesProcessed: series.length,
      soilModule: "stubbed",
    });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  } finally {
    client.release();
  }
}