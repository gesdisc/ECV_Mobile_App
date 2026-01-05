import { getCatalog } from "../services/api/catalog";
import { addMissingProperties } from "./helpers";

export const catalogQuery = {
  queryKey: ["catalog"],
  queryFn: getCatalog,
  select: addMissingProperties,
};
