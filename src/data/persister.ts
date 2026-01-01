import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import localforage from "localforage";
import { queryClient } from "./queryClient";

export const setupQueryPersistence = async () => {
  const persister = createAsyncStoragePersister({
    storage: localforage,
  });

  await persistQueryClient({
    queryClient,
    persister,
    maxAge: Infinity,
  });
};
