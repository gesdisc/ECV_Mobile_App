import { SpatialAreaType } from "../../types/time-series.types";

export interface ValidateCoordinates {
  coords: number[];
  error: string | null;
}

export const ERROR_EMPTY = "Input cannot be empty";
export const ERROR_NOT_NUMERIC =
  "All parts of the input string must be valid numbers.";
export const ERROR_INCORRECT_LENGTH =
  "Input must contain exactly 2 or 4 numbers";
export const ERROR_OUT_OF_RANGE =
  "Coordinates must be within valid range (lat: -90 to 90, lng: -180 to 180)";

export const validateCoordinates = (
  val: string,
  drawingOption: string
): ValidateCoordinates => {
  let errMsg = null;

  if (!val) {
    errMsg = ERROR_EMPTY;
  }

  const coords = val.split(",").map((v) => Number(v.trim()));

  // Check numeric
  if (coords.some((v) => isNaN(v))) {
    errMsg = ERROR_NOT_NUMERIC;
  }

  // Check number of values
  const expectedLength = drawingOption === SpatialAreaType.COORDINATES ? 2 : 4;
  if (coords.length !== expectedLength) {
    errMsg = ERROR_INCORRECT_LENGTH;
  }

  // Check latitude ranges
  if (drawingOption === SpatialAreaType.COORDINATES) {
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

  //   onError(errMsg);
  return { coords, error: errMsg };
};
