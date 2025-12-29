import { openDB, IDBPDatabase } from "idb";
import { VariableWithLabel } from "./browse-variables.types";

export const DB_NAME = "gmobile";
export enum IndexedDbStores {
  CATALOG = "catalog",
  LAST_SYNC = "last_sync",
}
export async function withDb<T>(callback: (db: IDBPDatabase) => Promise<T>) {
  const db = await getDb();

  try {
    return await callback(db);
  } finally {
    await db.close();
  }
}

export async function getDb() {
  return await openDB(DB_NAME, 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore(IndexedDbStores.CATALOG, {
          keyPath: "key",
        });
      }

      if (oldVersion < 2) {
        db.createObjectStore(IndexedDbStores.LAST_SYNC, {
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
    if (!db.objectStoreNames.contains(store)) return null;
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
    // eslint-disable-next-line no-useless-catch
    try {
      if (!db.objectStoreNames.contains(store)) return [];
      const items = await db.getAll(store);
      return items;
    } catch (error) {
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
