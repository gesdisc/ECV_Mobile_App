import localforage from "localforage";
import {
  TimeSeriesDataRow,
  TimeSeriesData,
  TimeSeriesMetadata,
} from "../types/time-series.types";

localforage.config({
  driver: localforage.INDEXEDDB, // Force IndexedDB; same as using setDriver()
  name: "myApp",
  version: 1.0,
  storeName: "keyvaluepairs", // Should be alphanumeric, with underscores.
  description: "some description",
});

export const clearOldCache = async () => {
  try {
    await localforage.clear();
    console.log("Old cache cleared");
  } catch (err) {
    console.error("Error clearing old cache:", err);
  }
};

export const setItem = async (key: string, value: TimeSeriesData) => {
  try {
    await localforage.setItem(key, value);
    console.log(`Data with key "${key}" has been set in IndexedDB`);
  } catch (err) {
    console.error("Error setting data in IndexedDB:", err);
  }
};

export const getItem = async (
  key: string
): Promise<TimeSeriesData | undefined | null> => {
  try {
    const value: TimeSeriesData | undefined | null = await localforage.getItem(
      key
    );
    if (value) {
      console.log(`Data with key "${key}" has been retrieved from IndexedDB`);
    }
    return value;
  } catch (err) {
    console.error("Error getting data from IndexedDB:", err);
  }
};

/**
 * Using array to store the data
 */
// export const setArrayItem = async (key: string, value: TimeSeriesData) => {
//   try {
//     const storedData: TimeSeriesData[] = (await localforage.getItem(key)) || [];

//     // check if exists return
//     const isVariableStored = storedData.find(
//       (v) => v.metadata.dataFieldId === value.metadata.dataFieldId
//     );
//     console.log(
//       isVariableStored ? "variable exists" : "variable doesn't exist"
//     );
//     if (isVariableStored) return;

//     storedData.push(value);
//     localforage.setItem(key, storedData);

//     console.log(
//       `Data with id "${value.metadata.dataFieldId}" has been set in IndexedDB`
//     );
//   } catch (err) {
//     console.error("Error setting data in IndexedDB:", err);
//   }
// };

// export const getArrayItem = async (
//   key: string,
//   variableId: string
// ): Promise<TimeSeriesData | undefined> => {
//   try {
//     const storedData: TimeSeriesData[] = (await localforage.getItem(key)) || [];

//     const item = storedData.find((v) => v.metadata.dataFieldId === variableId);
//     console.log(
//       `Data with id "${variableId}" has been retrieved from IndexedDB`
//     );
//     return item;
//   } catch (err) {
//     console.error("Error getting data from IndexedDB:", err);
//   }
// };
