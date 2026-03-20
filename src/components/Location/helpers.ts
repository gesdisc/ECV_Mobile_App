import L from "leaflet";
import {
  BoundingBox,
  Coordinates,
  SpatialArea,
  SpatialAreaType,
} from "../../types/time-series.types";

export const ERROR_EMPTY = "Input cannot be empty";
export const ERROR_NOT_NUMERIC =
  "All parts of the input string must be valid numbers.";
export const ERROR_INCORRECT_LENGTH =
  "Input must contain exactly 2 or 4 numbers";
export const ERROR_OUT_OF_RANGE =
  "Coordinates must be within valid range (lat: -90 to 90, lng: -180 to 180)";

export interface ValidateCoordinates {
  coords: number[];
  error: string | null;
}

/**
 *
 * Validates coordinates based on the spatial area type
 *
 * @param val raw input string containing coordinates
 * @param spatialAreaType type of spatial area (COORDINATES or BOUNDING_BOX)
 * @returns { coords: number[]; error: string | null } - object with parsed coordinates and any validation error
 *
 */
export function validateCoordinates(
  val: string,
  spatialAreaType: SpatialAreaType
): ValidateCoordinates {
  let errMsg = null;
  const expectedLength =
    spatialAreaType === SpatialAreaType.COORDINATES ? 2 : 4;

  if (!val.trim()) {
    errMsg = ERROR_EMPTY;
  }

  const parts = val.split(",").map((v) => v.trim());
  const coords = parts.map((v) => Number(v));

  // Check numeric
  if (coords.some((v) => isNaN(v))) {
    errMsg = ERROR_NOT_NUMERIC;
  }

  // Check number of values
  if (coords.length !== expectedLength) {
    errMsg = ERROR_INCORRECT_LENGTH;
  }

  // Check latitude ranges
  if (spatialAreaType === SpatialAreaType.COORDINATES) {
    const [lat, lon] = coords;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      errMsg = ERROR_OUT_OF_RANGE;
    }
  } else {
    const [west, south, east, north] = coords;
    if (
      south < -90 ||
      south > 90 ||
      north < -90 ||
      north > 90 ||
      west < -180 ||
      west > 180 ||
      east < -180 ||
      east > 180
    ) {
      errMsg = ERROR_OUT_OF_RANGE;
    }
  }

  return { coords, error: errMsg };
}

/**
 *
 * @summary Clears existing layers and restores the spatial area (point or bounding box) on the map based on the provided spatialArea object. Validates coordinates before rendering and calls onError with any validation issues.
 *
 * @param featureGroup Leaflet feature group
 * @param spatialArea current spatial area to restore on the map
 * @param onError callback to set any validation error messages
 *
 */
export function restoreDefaultSpatial(
  featureGroup: L.FeatureGroup,
  spatialArea: SpatialArea,
  onError: (err: string | null) => void
) {
  // Clear any existing layers
  featureGroup.clearLayers();

  if (spatialArea.type === SpatialAreaType.COORDINATES) {
    const { lat, lng } = spatialArea.value as Coordinates;

    const stringifiedCoords = `${lat},${lng}`;

    const { coords, error } = validateCoordinates(
      stringifiedCoords,
      SpatialAreaType.COORDINATES
    );

    onError(error);

    const marker = L.marker([parseFloat(lat), parseFloat(lng)]);
    featureGroup.addLayer(marker);
  } else if (spatialArea.type === SpatialAreaType.BOUNDING_BOX) {
    const { west, south, east, north } = spatialArea.value as BoundingBox;

    const stringifiedBounds = `${west},${south},${east},${north}`;

    const { coords, error } = validateCoordinates(
      stringifiedBounds,
      SpatialAreaType.BOUNDING_BOX
    );

    onError(error);

    const rectangle = L.rectangle([
      [parseFloat(south), parseFloat(west)],
      [parseFloat(north), parseFloat(east)],
    ]);
    featureGroup.addLayer(rectangle);
  }
}
