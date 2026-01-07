import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import localforage from "localforage";

export const reactQueryStorage = localforage.createInstance({
  name: "react-query-cache",
  storeName: "query-cache",
});

export const persister = createAsyncStoragePersister({
  storage: reactQueryStorage,
});
