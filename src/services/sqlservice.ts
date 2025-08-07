/**
 *
 * Note: The app uses IndexedDB instead of SQLite
 * This code is not used in the app
 *
 */

import { Capacitor } from "@capacitor/core";
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";

const sqlite = new SQLiteConnection(CapacitorSQLite);

export const ensureJeepSqliteIsAvailable = async () => {
  if (Capacitor.getPlatform() === "web") {
    await customElements.whenDefined("jeep-sqlite");
    const jeepSqliteEl = document.querySelector("jeep-sqlite");
    if (jeepSqliteEl != null) {
      await sqlite.initWebStore();
    }
  }
};

export const initializeDatabase = async (): Promise<SQLiteDBConnection> => {
  await ensureJeepSqliteIsAvailable();
  const db = await sqlite.createConnection(
    "plotData",
    false,
    "no-encryption",
    1,
    false
  );
  await db.open();
  const query = `
    CREATE TABLE IF NOT EXISTS plot_data (
      cacheKey TEXT PRIMARY KEY,
      data TEXT,
      metaData TEXT
    )
  `;
  await db.execute(query);
  return db;
};

export const setObject = async (
  cacheKey: string,
  data: { date: string; value: number }[],
  metaData: MetaData
) => {
  const db = await initializeDatabase();
  const dataString = JSON.stringify(data);
  const metaDataString = JSON.stringify(metaData);
  const query = `INSERT OR REPLACE INTO plot_data (cacheKey, data, metaData) VALUES (?, ?, ?)`;
  const values = [cacheKey, dataString, metaDataString];
  console.log("Setting data in SQLite with key:", cacheKey);
  console.log("Data:", dataString);
  console.log("MetaData:", metaDataString);
  await db.run(query, values);
  await db.close();
};

export const getObject = async (
  cacheKey: string
): Promise<{
  data: { date: string; value: number }[];
  metaData: MetaData;
} | null> => {
  const db = await initializeDatabase();
  const query = `SELECT data, metaData FROM plot_data WHERE cacheKey = ?`;
  const values = [cacheKey];
  const result = await db.query(query, values);
  await db.close();
  if (result.values && result.values.length > 0) {
    console.log("Retrieved cached data from SQLite with key:", cacheKey);
    console.log("Data:", result.values[0].data);
    console.log("MetaData:", result.values[0].metaData);
    return {
      data: JSON.parse(result.values[0].data),
      metaData: JSON.parse(result.values[0].metaData),
    };
  }
  return null;
};

interface MetaData {
  prod_name: string;
  param_short_name: string;
  param_name: string;
  unit: string;
  begin_time: string;
  end_time: string;
  lat: string;
  lon: string;
}
