import { useQuery } from "@tanstack/react-query";
import { catalogQuery } from "./catalog.query";

export function useCatalogQuery() {
  return useQuery(catalogQuery);
}
