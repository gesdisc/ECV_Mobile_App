import { openDB, IDBPDatabase } from "idb";
import { VariableWithLabel } from "./browse-variables.types";

export const DB_NAME = "gmobile";
export enum IndexedDbStores {
  CATALOG = "catalog",
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

/**
 *
 * @returns database found in the IndexedDB
 *
 */
export async function getDb() {
  return await openDB(DB_NAME, 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore(IndexedDbStores.CATALOG, {
          keyPath: "key",
        });
      }
    },
  });
}

export function storeDataByKey<T>(
  store: IndexedDbStores,
  key: string,
  data: T
) {
  return withDb(async (db) => {
    await db.put(store, {
      key,
      ...data,
    });
  });
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

export async function getAllData(
  store: IndexedDbStores
): Promise<VariableWithLabel[]> {
  return withDb(async (db) => {
    try {
      if (!db.objectStoreNames.contains(store)) return [];
      const items = await db.getAll(store);
      return items;
    } catch (error) {
      console.error("Error from getAllData: ", error);
      throw error;
    }
  });
}

export async function deleteAllData(store: IndexedDbStores) {
  return withDb(async (db) => {
    if (!db.objectStoreNames.contains(store)) return;
    await db.clear(store);
  });
}

// export async function getLatestCachedData(
//   store: IndexedDbStores
// ): Promise<VariableDbEntry> {
//   return withDb(async (db) => {
//     if (!db.objectStoreNames.contains(store)) return {};

//     const items = await db.getAll(store);

//     return items.sort((a, b) => b.cachedAt - a.cachedAt)[0];
//   });
// }
