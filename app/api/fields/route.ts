import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * GET /api/fields
 * Returns all fields as GeoJSON with health score
 */
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        f.id,
        f.name,
        f.crop_type,
        f.area_ha,
        ST_AsGeoJSON(f.geom) AS geometry,
        h.health_score
      FROM fields f
      LEFT JOIN field_health h ON h.field_id = f.id
      ORDER BY f.created_at DESC
    `);

    return NextResponse.json({
      type: "FeatureCollection",
      features: result.rows.map((row: any) => ({
        type: "Feature",
        geometry: JSON.parse(row.geometry),
        properties: {
          id: row.id,
          name: row.name,
          cropType: row.crop_type,
          area: row.area_ha,
          health_score: row.health_score, // ✅ keep null if processing
        },
      })),
    });
  } catch (err) {
    console.error("Fields API GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch fields" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fields
 * Insert a new field polygon
 */
export async function POST(req: Request) {
  try {
    const {
      name,
      farmerName,
      cropType,
      season,
      sowingDate,
      geometry,
    } = await req.json();

    if (!geometry) {
      return NextResponse.json(
        { error: "Geometry is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      INSERT INTO fields (
        name,
        farmer_name,
        crop_type,
        season,
        sowing_date,
        geom
      )
      VALUES (
        $1, $2, $3, $4, $5,
        ST_SetSRID(ST_GeomFromGeoJSON($6), 4326)
      )
      RETURNING id
      `,
      [
        name ?? "Field",
        farmerName ?? null,
        cropType ?? null,
        season ?? null,
        sowingDate ?? null,
        JSON.stringify(geometry),
      ]
    );

    return NextResponse.json({
      id: result.rows[0].id,
    });
  } catch (err) {
    console.error("Fields API POST error:", err);
    return NextResponse.json(
      { error: "Failed to save field" },
      { status: 500 }
    );
  }
}
