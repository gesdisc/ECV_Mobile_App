import {
  setItem,
  getItem,
  setRecentDataKey,
} from "../../services/indexDBService";
import { TimeSeriesData } from "../../types/time-series.types";

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
 * @param cachedData time series data that has to be cached
 * @param dataCacheKey storage key for time series data
 * @param recentDataCacheKey storage key for recently fetched data
 */
export const cacheTimeSeriesData = async (
  cachedData: TimeSeriesData,
  dataCacheKey: string,
  recentDataCacheKey: string
) => {
  try {
    await setItem(dataCacheKey, cachedData);
    await setRecentDataKey(recentDataCacheKey, dataCacheKey);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Something went wrong while caching data: ${error.message}`
      );
    }
  }
};

/**
 *
 * @param dataCacheKey storage key for time series data
 * @param recentDataCacheKey storage key for recently fetched data
 * @returns cached data (TimeSeriesData) OR undefined
 *
 * @summary checks if data with a key (dataCacheKey) exists in the storage.
 * If yes, returns the cached data and replaces the recently cached data value with the returned data (cachedData) key.
 */
export const getCachedData = async (
  dataCacheKey: string,
  recentDataCacheKey: string
): Promise<TimeSeriesData | undefined> => {
  try {
    const cachedData = await getItem(dataCacheKey);

    if (!cachedData) return;
    await setRecentDataKey(recentDataCacheKey, dataCacheKey);

    return cachedData;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Something went wrong while fetching data from IndexedDB: ${error.message}`
      );
    }
  }
};

/**
 *
 * @param key string
 * @returns lat, lon
 *
 * Extracts Lat and Lon values from cache key.
 *
 * Why not use lat and lon values from metadata?
 * - The lat and lon coords in cache key doesn't match the values metadata
 *
 */
export const extractLatLonFromCacheKey = (key: string) => {
  // Decode URL-encoded characters like %20 → space
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
