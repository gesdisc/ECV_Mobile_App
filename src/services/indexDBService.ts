import { IDBPDatabase, openDB } from "idb";
import { VariableDbEntry } from "../types/time-series.types";

/**
 *
 * The code below was copied from terra library:
 * https://github.com/nasa/terra-ui-components/blob/1ce1817676c1560b56147aa44fbced902ff7269e/src/internal/indexeddb.ts
 *
 *
 * ================ BEGIN COPIED CODE ================
 *
 */

export const DB_NAME = "terra";

export enum IndexedDbStores {
  TIME_SERIES = "time-series",
  TIME_AVERAGE_MAP = "time-average-map",
}

/**
 * a helper for wrapping code that depends on an active database connection
 * this function will open the database, run the callback, and then cleanly close the database
 */
export async function withDb<T>(callback: (db: IDBPDatabase) => Promise<T>) {
  const db = await getDb();

  try {
    return await callback(db);
  } finally {
    await db.close();
  }
}

export function getDataByKey<T>(
  store: IndexedDbStores,
  key: string
): Promise<T> {
  return withDb(async (db) => {
    return await db.get(store, key);
  });
}

export function deleteDataByKey(store: IndexedDbStores, key: string) {
  return withDb(async (db) => {
    await db.delete(store, key);
  });
}

// ================ END COPIED CODE ================

/**
 *
 * @returns database found in the IndexedDB
 *
 */
export async function getDb(): Promise<IDBPDatabase> {
  try {
    const db = await openDB(DB_NAME);
    return db;
  } catch (error) {
    console.error("Error opening DB:", error);
    throw error;
  }
}

export async function getAllData(
  store: IndexedDbStores
): Promise<Partial<VariableDbEntry>[]> {
  return withDb(async (db) => {
    const items = await db.getAll(store);

    return items.map((item) => ({
      metadata: item.metadata,
      variableEntryId: item.variableEntryId,
      key: item.key,
    }));
  });
}

export async function deleteAllData(store: IndexedDbStores) {
  return withDb(async (db) => {
    await db.clear(store);
  });
}
