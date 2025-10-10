/**
 *
 * @param arr Array with any values
 * @returns middle index of the array
 */
export const getMiddleIndex = (arr: Array<any>) => {
  if (arr.length === 0) return 0;
  if (arr.length % 2 !== 0) {
    return Math.floor(arr.length / 2);
  }
  return Math.floor(arr.length / 2) - 1;
};

export const filterDataBetweenDates = (
  startDate: string | number | Date,
  endDate: string | number | Date,
  dateArray: string[]
) => {
  return dateArray.filter(
    (date) =>
      new Date(date).getTime() >= new Date(startDate).getTime() &&
      new Date(date).getTime() <= new Date(endDate).getTime()
  );
};

/**
 *
 * @param key string
 * @returns lat, lon
 *
 * Extracts Lat and Lon values from cache key.
 * Ex. If key is "GPM_3IMERGHH_07_precipitation_38.90,%20-77.04_prod"
 * The output will be {38.90, -77.04}
 *
 * Why not use lat and lon values from metadata?
 * - The lat and lon coords in cache key doesn't match the values metadata
 *
 */
export const extractLatLonFromCacheKey = (key: string) => {
  // Decode URL-encoded characters like %20 (space)
  const decodedStr = decodeURIComponent(key);

  // Match any number (with optional sign and decimals) before and after a comma
  const regex = /([+-]?\d+(\.\d+)?),\s*([+-]?\d+(\.\d+)?)/;
  const match = decodedStr.match(regex);

  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[3]);
    return { lat, lon };
  } else {
    return null; // return null if no coordinates found
  }
};
