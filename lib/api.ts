/**
 * API client functions for field operations
 */

import type { FieldCollection, SelectedField, CreateFieldResponse } from "./types";



const API_BASE = "/api";

/** Fetch all fields from the API */
export async function fetchFields(): Promise<FieldCollection> {
  const response = await fetch(`${API_BASE}/fields`);
  if (!response.ok) {
    throw new Error(`Failed to fetch fields: ${response.status}`);
  }
  return response.json();
}

/**
 * Create a new field
 * @param data - Field creation data
 * @returns Created field ID
 */
export async function createField(data: {
  name: string;
  farmerName?: string;
  cropType?: string;
  season?: string;
  sowingDate?: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}): Promise<CreateFieldResponse> {
  const response = await fetch(`${API_BASE}/fields`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Failed to create field: ${response.status}`);
  }

  return response.json();
}

/**
 * Delete a field by ID
 * @param fieldId - UUID of field to delete
 */
export async function deleteField(fieldId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/fields/${fieldId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Failed to delete field: ${response.status}`);
  }
}

/**
 * Update a field's properties
 * @param fieldId - UUID of field to update
 * @param data - Properties to update
 */
export async function updateField(
  fieldId: string,
  data: {
    name?: string;
    cropType?: string;
    season?: string;
    sowingDate?: string;
  }
): Promise<void> {
  const response = await fetch(`${API_BASE}/fields/${fieldId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Failed to update field: ${response.status}`);
  }
}

/** Fetch heatmap image URL for a field */
export async function fetchHeatmap(
  fieldId: string,
  options: {
    layer: string;
    width: number;
    height: number;
    toDate: string;
  }
): Promise<string> {
  const params = new URLSearchParams({
    layer: options.layer,
    width: options.width.toString(),
    height: options.height.toString(),
    to: options.toDate,
  });

  const response = await fetch(
    `${API_BASE}/fields/${fieldId}/heatmap?${params}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch heatmap: ${response.status}`);
  }
  console.log("Fetching heatmap with URL:", response);

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/** Trigger vegetation indices calculation for a field */
export async function calculateIndices(fieldId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/indices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fieldId }),
  });

  if (!response.ok) {
    console.error("Indices calculation failed:", response.status);
  }
}

export interface SatelliteScene {
  date: string;
  cloudCover: number | null;
  id?: string;
}

export interface ScenesResponse {
  scenes: SatelliteScene[];
  source: "sentinel-hub" | "fallback";
  nextImage?: string;
  message?: string;
}

/** Fetch available satellite scenes for a field from Sentinel Hub Catalog */
export async function fetchScenes(
  fieldId: string,
  options?: {
    maxCloudCover?: number;
    fromDate?: string;
    toDate?: string;
  }
): Promise<ScenesResponse> {
  const params = new URLSearchParams();
  
  if (options?.maxCloudCover !== undefined) {
    params.set("maxCloud", options.maxCloudCover.toString());
  }
  if (options?.fromDate) {
    params.set("from", options.fromDate);
  }
  if (options?.toDate) {
    params.set("to", options.toDate);
  }

  const url = `${API_BASE}/fields/${fieldId}/scenes${params.toString() ? `?${params}` : ""}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    // Return fallback dates on error
    return generateFallbackScenes();
  }

  return response.json();
}

/**
 * Generate fallback scenes when API is unavailable
 */
function generateFallbackScenes(): ScenesResponse {
  const scenes: SatelliteScene[] = [];
  const today = new Date();
  const start = new Date(today);
  start.setMonth(start.getMonth() - 3);

  const current = new Date(start);
  while (current <= today) {
    scenes.push({
      date: current.toISOString().split("T")[0],
      cloudCover: null,
    });
    current.setDate(current.getDate() + 5);
  }

  // Calculate next image
  const nextImage = new Date(today);
  nextImage.setDate(nextImage.getDate() + 5);

  return {
    scenes,
    source: "fallback",
    nextImage: nextImage.toISOString().split("T")[0],
    message: "Using estimated dates",
  };
}
