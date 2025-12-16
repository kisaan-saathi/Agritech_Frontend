/** Supported vegetation index layers */
export type LayerKey = "ndvi" | "ndre" | "evi" | "ndwi" | "savi";

/** Array of all supported layers for iteration */
export const SUPPORTED_LAYERS: LayerKey[] = ["ndvi", "ndre", "evi", "ndwi", "savi"];

/** Layer display names */
export const LAYER_NAMES: Record<LayerKey, string> = {
  ndvi: "NDVI - Normalized Difference Vegetation Index",
  ndre: "NDRE - Normalized Difference Red Edge",
  evi: "EVI - Enhanced Vegetation Index",
  savi: "SAVI - Soil Adjusted Vegetation Index",
  ndwi: "NDWI - Normalized Difference Water Index",
};

/** Properties of a field polygon */
export interface FieldProperties {
  id: string;
  name?: string;
  farmer_name?: string;
  crop_type?: string;
  season?: string;
  sowing_date?: string;
  health_score?: number;
  area?: number;
}

/** A selected field with its geometry */
export interface SelectedField {
  id: string;
  properties: FieldProperties;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

/** GeoJSON Feature for a field */
export interface FieldFeature {
  type: "Feature";
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  properties: FieldProperties;
}

/** GeoJSON FeatureCollection of fields */
export interface FieldCollection {
  type: "FeatureCollection";
  features: FieldFeature[];
}

/** Hover tooltip information */
export interface HoverInfo {
  x: number;
  y: number;
  value: number;
  label: string;
  color: string;
}

/** Health score interpretation */
export interface HealthLabel {
  label: string;
  color: string;
}

/** Response from POST /api/fields */
export interface CreateFieldResponse {
  id: string;
}

/** Response from DELETE /api/fields/[id] */
export interface DeleteFieldResponse {
  success: boolean;
  deletedId: string;
}

/** Response from POST /api/indices */
export interface IndicesResponse {
  fieldId: string;
  scenesProcessed: number;
  series: IndexDataPoint[];
}

/** Single data point from indices calculation */
export interface IndexDataPoint {
  date: string;
  ndvi: number;
  ndre: number;
  evi: number;
  ndwi: number;
  savi: number;
}
