import { fetchCatalog } from "../services/api/time-series";
import { GET_PREDEFINED_VARIABLES } from "./queries";
import { addMissingProperties } from "./helpers";

export const catalogQuery = {
  queryKey: ["catalog"],
  queryFn: () => fetchCatalog(GET_PREDEFINED_VARIABLES),
  select: addMissingProperties,
};
