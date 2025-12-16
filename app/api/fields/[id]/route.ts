import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/fields/[id]
 * Returns a single field by ID as GeoJSON
 */
export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    
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
      WHERE f.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Field not found" },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    return NextResponse.json({
      type: "Feature",
      geometry: JSON.parse(row.geometry),
      properties: {
        id: row.id,
        name: row.name,
        cropType: row.crop_type,
        area: row.area_ha,
        health_score: row.health_score,
      },
    });
  } catch (err) {
    console.error("Fields API GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch field" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/fields/[id]
 * Deletes a field by ID
 */
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    
    // Delete related records first (if any foreign key constraints)
    // Use try-catch for each to handle cases where tables might not exist
    try {
      await pool.query(`DELETE FROM field_health WHERE field_id = $1`, [id]);
    } catch (e) {
      console.log('field_health table may not exist, skipping');
    }
    
    try {
      await pool.query(`DELETE FROM vegetation_indices WHERE field_id = $1`, [id]);
    } catch (e) {
      console.log('vegetation_indices table may not exist, skipping');
    }
    
    // Delete the field
    const result = await pool.query(
      `DELETE FROM fields WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Field not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error("Fields API DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete field" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/fields/[id]
 * Updates a field's properties
 */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, cropType, season, sowingDate } = body;

    const result = await pool.query(`
      UPDATE fields 
      SET 
        name = COALESCE($2, name),
        crop_type = COALESCE($3, crop_type),
        season = COALESCE($4, season),
        sowing_date = COALESCE($5, sowing_date),
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, crop_type, season, sowing_date
    `, [id, name, cropType, season, sowingDate]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Field not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, field: result.rows[0] });
  } catch (err) {
    console.error("Fields API PATCH error:", err);
    return NextResponse.json(
      { error: "Failed to update field" },
      { status: 500 }
    );
  }
}
