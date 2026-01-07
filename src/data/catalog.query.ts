import { getCatalog } from "../services/api/graphql";
import { addMissingProperties } from "./helpers";

export const catalogQuery = {
  queryKey: ["catalog"],
  queryFn: getCatalog,
  select: addMissingProperties, // transform data before caching
  enabled: true,
};
