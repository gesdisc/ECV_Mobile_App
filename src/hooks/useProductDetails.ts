import { useQueryClient } from "@tanstack/react-query";

import { VariableWithLabel } from "../data/browse-variables.types";
import { catalogQuery } from "../data/catalog.query";

export type SelectedProductDetailsType =
  | VariableWithLabel
  | Record<string, never>;

/**
 *
 * @param variable string
 * @returns Object containing variable info (e.g. dataFieldId, dataProductShortName, ...)
 *
 * Looks in the cached catalog and returns variable info of the provided variable (dataFieldId)
 *
 */
const useProductDetails = (variable: string): SelectedProductDetailsType => {
  const queryClient = useQueryClient();

  const cachedCatalog =
    queryClient.getQueryData<VariableWithLabel[]>(catalogQuery.queryKey) ?? [];

  const cachedItem = cachedCatalog.find(
    (product) => product.dataFieldId === variable
  );

  return cachedItem ?? {};
};

export default useProductDetails;
