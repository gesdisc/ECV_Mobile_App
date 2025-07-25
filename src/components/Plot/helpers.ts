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
  dataArray: TimeSeriesDataRow[]
) => {
  return dataArray.filter(
    (d) =>
      new Date(d.timestamp).getTime() >= new Date(startDate).getTime() &&
      new Date(d.timestamp).getTime() <= new Date(endDate).getTime()
  );
};

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
