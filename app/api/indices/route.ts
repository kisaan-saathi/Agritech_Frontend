// app/api/indices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSentinelToken } from "@/lib/sentinel";

/* ✅ Robust statistics reader */
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

function computeHealthScore(series: any[]) {
  // use last 3 scenes to smooth spikes
  const recent = series.slice(-3);

  let ndvi = 0,
    ndre = 0,
    evi = 0,
    savi = 0,
    ndwi = 0;

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

  // weighted overall score
  const score =
    0.4 * ndvi +
    0.2 * ndre +
    0.15 * evi +
    0.15 * savi +
    0.1 * (1 - ndwi); // invert NDWI

  return Math.round(score * 100);
}

export async function POST(req: NextRequest) {
  // Log the incoming request
  console.log("[INDICES] Incoming request to /api/indices");
  const bodyRaw = await req.text();
  console.log("[INDICES] Request body:", bodyRaw);
  const { fieldId, from, to } = JSON.parse(bodyRaw);

  /* 1️⃣ Load geometry */
  const geoRes = await pool.query(
    `SELECT ST_AsGeoJSON(geom) AS geom FROM fields WHERE id=$1`,
    [fieldId]
  );

  if (!geoRes.rows.length) {
    return NextResponse.json({ error: "Field not found" }, { status: 404 });
  }

  const geometry = JSON.parse(geoRes.rows[0].geom);

  // Use provided dates or default to last 90 days
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const dateFrom = from ?? threeMonthsAgo.toISOString();
  const dateTo = to ?? now.toISOString();

  console.log("📅 DATE RANGE:", dateFrom, "→", dateTo);

  let token;
  try {
    token = await getSentinelToken();
  } catch (err) {
    console.error("Failed to get Sentinel token:", err);
    return NextResponse.json({ error: "Sentinel authentication failed" }, { status: 500 });
  }

  const sentinelBody = {
    input: {
      bounds: {
        geometry,
        properties: {
          crs: "http://www.opengis.net/def/crs/EPSG/0/4326",
        },
      },
      data: [
        {
          type: "sentinel-2-l2a",
          dataFilter: {
            timeRange: {
              from: dateFrom,
              to: dateTo,
            },
            mosaickingOrder: "leastCC",
          },
        },
      ],
    },
    aggregation: {
      timeRange: {
        from: dateFrom,
        to: dateTo,
      },
      aggregationInterval: { of: "P1W" },
      resolution: { x: 10, y: 10 },
      evalscript: `
        //VERSION=3
        function setup() {
          return {
            input: [
              "B02","B03","B04","B05","B08","dataMask"
            ],
            output: [
              { id: "ndvi", bands: 1 },
              { id: "ndre", bands: 1 },
              { id: "evi",  bands: 1 },
              { id: "ndwi", bands: 1 },
              { id: "savi", bands: 1 },
              { id: "dataMask", bands: 1 }
            ]
          };
        }

        function evaluatePixel(s) {
          if (s.dataMask === 0) {
            return {
              ndvi:  [0],
              ndre:  [0],
              evi:   [0],
              ndwi:  [0],
              savi:  [0],
              dataMask: [0]
            };
          }

          const ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
          const ndre = (s.B08 - s.B05) / (s.B08 + s.B05);
          const evi  = 2.5 * (s.B08 - s.B04) /
                       (s.B08 + 6*s.B04 - 7.5*s.B02 + 1);
          const ndwi = (s.B03 - s.B08) / (s.B03 + s.B08);
          const savi = 1.5 * (s.B08 - s.B04) /
                       (s.B08 + s.B04 + 0.5);

          return {
            ndvi:  [ndvi],
            ndre:  [ndre],
            evi:   [evi],
            ndwi:  [ndwi],
            savi:  [savi],
            dataMask: [s.dataMask]
          };
        }
      `,
    },
  };
  console.log("[INDICES] SentinelHub request body:", JSON.stringify(sentinelBody, null, 2));
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

  const statsText = await sentinelRes.text();
  console.log("[INDICES] SentinelHub response status:", sentinelRes.status);
  console.log("[INDICES] SentinelHub response body:", statsText);
  let stats;
  try {
    stats = JSON.parse(statsText);
  } catch (e) {
    stats = {};
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    // Verify field still exists before processing
    const fieldCheck = await client.query(
      `SELECT id FROM fields WHERE id = $1`,
      [fieldId]
    );
    
    if (!fieldCheck.rows.length) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: "Field no longer exists" }, { status: 404 });
    }
    
    const series: any[] = [];

    /* 3️⃣ Parse statistics → DB */
    for (const bucket of stats.data ?? []) {
      const date = bucket.interval.from.slice(0, 10);

      const ndvi = readMean(bucket, "ndvi");
      if (ndvi == null) continue;

      const ndre = readMean(bucket, "ndre");
      const evi = readMean(bucket, "evi");
      const ndwi = readMean(bucket, "ndwi");
      const savi = readMean(bucket, "savi");

      /* Insert satellite scene */
      const sceneRes = await client.query(
        `
        INSERT INTO satellite_scenes (
          field_id, satellite, scene_date, source
        )
        VALUES ($1, 'SENTINEL_2', $2, 'sentinel-hub')
        ON CONFLICT (field_id, satellite, scene_date)
        DO UPDATE SET scene_date = EXCLUDED.scene_date
        RETURNING id
        `,
        [fieldId, date]
      );

      const sceneId = sceneRes.rows[0].id;

      /* Insert vegetation indices */
      await client.query(
        `
        INSERT INTO vegetation_indices (
          scene_id, ndvi, ndre, evi, ndwi, savi
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (scene_id)
        DO UPDATE SET
          ndvi = EXCLUDED.ndvi,
          ndre = EXCLUDED.ndre,
          evi  = EXCLUDED.evi,
          ndwi = EXCLUDED.ndwi,
          savi = EXCLUDED.savi
        `,
        [sceneId, ndvi, ndre, evi, ndwi, savi]
      );

      series.push({ date, ndvi, ndre, evi, ndwi, savi });
    }

    /* ✅ UPDATE FIELD HEALTH */
    if (series.length) {
      const score = computeHealthScore(series);

      await client.query(
        `
        INSERT INTO field_health (
          field_id, last_scene_id, health_score, interpretation
        )
        VALUES (
          $1,
          (SELECT id FROM satellite_scenes
           WHERE field_id = $1
           ORDER BY scene_date DESC
           LIMIT 1),
          $2,
          CASE
            WHEN $2 >= 75 THEN 'Excellent'
            WHEN $2 >= 55 THEN 'Good'
            WHEN $2 >= 35 THEN 'Moderate'
            ELSE 'Poor'
          END
        )
        ON CONFLICT (field_id)
        DO UPDATE SET
          health_score = EXCLUDED.health_score,
          interpretation = EXCLUDED.interpretation,
          updated_at = now()
        `,
        [fieldId, score]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({
      fieldId,
      scenesProcessed: series.length,
      series,
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error("Indices processing error:", err);
    
    // Handle foreign key violations gracefully (field was deleted during processing)
    if (err.code === '23503') {
      return NextResponse.json({ error: "Field was deleted during processing" }, { status: 404 });
    }
    
    return NextResponse.json({ error: "Failed to process indices" }, { status: 500 });
  } finally {
    client.release();
  }
}
