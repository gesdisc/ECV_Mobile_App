import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import localforage from "localforage";
import { queryClient } from "./queryClient";

export const reactQueryStorage = localforage.createInstance({
  name: "react-query-cache",
  storeName: "query-cache",
});

export function setupQueryPersistence() {
  const persister = createAsyncStoragePersister({
    storage: reactQueryStorage,
  });

  persistQueryClient({
    queryClient,
    persister,
    maxAge: Infinity,
  });
}
