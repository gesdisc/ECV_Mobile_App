import { useQuery } from "@tanstack/react-query";
import { fetchCatalog } from "../services/api/time-series";
import { VariableWithLabel } from "../data/browse-variables.types";
import { GET_PREDEFINED_VARIABLES } from "./queries";
import { addMissingProperties } from "./helpers";

export function useCatalogQuery() {
  return useQuery<VariableWithLabel[]>({
    queryKey: ["catalog"],
    queryFn: () => fetchCatalog(GET_PREDEFINED_VARIABLES),
    select: addMissingProperties,
  });
}
