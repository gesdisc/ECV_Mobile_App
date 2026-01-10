import { VariableWithLabel } from "../data/browse-variables.types";
import { useCatalogQuery } from "../data/useCatalogQuery";

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
  const { data: catalog } = useCatalogQuery();

  const cachedItem = catalog?.find(
    (product) => product.dataFieldId === variable
  );

  return cachedItem ?? {};
};

export default useProductDetails;
