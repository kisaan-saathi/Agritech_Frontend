/**
 * Generate timeline dates dynamically
 * Creates weekly dates for the last 3 months from current date
 */
function generateTimelineDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  // Go back 90 days (approximately 3 months)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 90);
  
  // Round to the nearest previous Monday for consistent weekly intervals
  const dayOfWeek = startDate.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setDate(startDate.getDate() - daysToSubtract);
  
  // Generate weekly dates up to today
  const currentDate = new Date(startDate);
  while (currentDate <= today) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    
    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return dates;
}

/** Available satellite imagery dates (Sentinel-2) - auto-generated for last 3 months */
export const TIMELINE_DATES = generateTimelineDates();

/** Default selected date (most recent) */
export const DEFAULT_DATE = TIMELINE_DATES[TIMELINE_DATES.length - 1];

/** Default map center (India) */
export const DEFAULT_MAP_CENTER: [number, number] = [78.9629, 20.5937];

/** Default map zoom level */
export const DEFAULT_MAP_ZOOM = 5;

/** Mapbox style URL */
export const MAPBOX_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";

/** Maximum zoom when fitting to field bounds */
export const MAX_FIT_ZOOM = 17;

/** Padding for fitBounds */
export const FIT_BOUNDS_PADDING = 100;

/** Base resolution for heatmap images */
export const HEATMAP_BASE_SIZE = 512;

/** Heatmap opacity */
export const HEATMAP_OPACITY = 0.8;

/** Days of historical data to fetch */
export const DEFAULT_HISTORY_DAYS = 90;

/** Field outline color (unselected) */
export const FIELD_OUTLINE_COLOR = "#00ff88";

/** Field outline color (selected) */
export const FIELD_SELECTED_COLOR = "#00ffff";

/** Health score color thresholds */
export const HEALTH_COLORS = {
  excellent: "#22c55e",
  good: "#84cc16",
  moderate: "#eab308",
  poor: "#ef4444",
  processing: "#9ca3af",
} as const;

/** Thresholds for vegetation health classification */
export const VEGETATION_THRESHOLDS = {
  dense: 0.7,
  good: 0.5,
  moderate: 0.3,
  sparse: 0.15,
  bare: 0.0,
} as const;

/** NDWI thresholds (water content) */
export const NDWI_THRESHOLDS = {
  high: 0.3,
  moderate: 0.0,
  low: -0.3,
} as const;
