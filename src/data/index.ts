import React, { useEffect } from "react";
import { Network } from "@capacitor/network";

import { storeDataByKey, IndexedDbStores, getDataByKey } from "./localforage";
import { fetchCatalog } from "../services/api/time-series";
import { Variable } from "./browse-variables.types";
import { addMissingProperties, cacheAllProductDetails } from "./helpers";
import { GET_PREDEFINED_VARIABLES } from "./queries";

const SYNC_TTL = 30 * 60 * 1000; // 30 minutes

// Fetches and caches catalog data on app bootstrap and every SYNC_TTL interval
export default function AppBootstrap() {
  useEffect(() => {
    const fetchAndCacheCatalog = async () => {
      try {
        const now = Date.now();
        const status = await Network.getStatus();
        const isOffline = !status.connected;

        if (isOffline) {
          console.warn("Device is offline, skipping catalog fetch.");
          return;
        }

        const cachedLast: { timestamp: number } = await getDataByKey(
          IndexedDbStores.LAST_SYNC,
          "cachedAt"
        );

        if (
          !cachedLast ||
          !cachedLast.timestamp ||
          now - cachedLast.timestamp > SYNC_TTL
        ) {
          const data = await fetchCatalog(GET_PREDEFINED_VARIABLES);

          const list: Variable[] = data?.data?.getVariables?.variables;

          const modifiedList = addMissingProperties(list);

          if (data.length === 0) return;

          await cacheAllProductDetails(modifiedList);

          await storeDataByKey(IndexedDbStores.LAST_SYNC, "cachedAt", {
            timestamp: now,
          });
        }
      } catch (error) {
        console.error("Error fetching catalog:", error);
      }
    };
    fetchAndCacheCatalog();
  }, []);

  return null;
}
