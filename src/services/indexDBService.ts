import localforage from "localforage";
import {
  TimeSeriesData,
  TimeSeriesMetadata,
  VariableDbEntry,
} from "../types/time-series.types";

/**
 * IndexDB API: a low-level API for client-side storage of significant amounts of structured data
 * https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 *
 * LocalForage uses IndexedDB as its primary storage backend.
 * IndexedDB offers more complex features and larger storage capacity than localStorage.
 * localForage provides a user-friendly layer over IndexedDB, making it easier to work with.
 * It offers a simple API that mimics the ease of use of localStorage.
 */

const timeSeriesDB = localforage.createInstance({
  name: "terra", // DB name
  storeName: "time-series", // storeName
});

export const clearCache = async () => {
  try {
    await timeSeriesDB.clear();
  } catch (err) {
    if (err instanceof Error) {
      throw new Error("Error clearing old cache: ", err);
    }
  }
};

export const setItem = async (key: string, value: TimeSeriesData) => {
  try {
    await localforage.setItem(key, value);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error("Error setting data in IndexedDB: ", err);
    }
  }
};

export const getItem = async (key: string) => {
  try {
    const value: TimeSeriesData | null = await timeSeriesDB.getItem(key);
    return value;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error("Error getting data from IndexedDB: ", err);
    }
  }
};

export const removeItem = async (key: string) => {
  try {
    await timeSeriesDB.removeItem(key);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error("Error removing item from IndexedDB: ", err);
    }
  }
};

export const setRecentDataKey = async (key: string, recentDataKey: string) => {
  try {
    await localforage.setItem(key, recentDataKey);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error("Error setting recent data key in IndexedDB: ", err);
    }
  }
};

export const getRecentDataKey = async (key: string) => {
  try {
    const recentCachedDataKey: string | null = await localforage.getItem(key);
    return recentCachedDataKey;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error("Error getting recent data key from IndexedDB: ", err);
    }
  }
};

export const getAllItems = async () => {
  const items: Partial<VariableDbEntry>[] = [];

  try {
    await timeSeriesDB.iterate(function (value: VariableDbEntry) {
      items.push({
        data: value.data,
        metadata: value.metadata,
        variableEntryId: value.variableEntryId,
        key: value.key,
      });
    });
    return items;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error("Error retrieving data from IndexedDB: ", err);
    }
  }
};
