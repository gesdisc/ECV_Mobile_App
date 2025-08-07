import {
  setItem,
  getItem,
  setRecentDataKey,
  getRecentDataKey,
} from "../../services/indexDBService";
import {
  TimeSeriesDataRow,
  TimeSeriesData,
} from "../../types/time-series.types";

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
  startDate: string,
  endDate: string,
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
