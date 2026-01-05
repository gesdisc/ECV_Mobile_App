import { useQueryClient } from "@tanstack/react-query";

import { useDataParams } from "../store/DataParamsContext";
import { VariableWithLabel } from "../data/browse-variables.types";
import { catalogQuery } from "../data/catalog.query";

export type SelectedProductDetailsType =
  | VariableWithLabel
  | Record<string, never>;

const useSelectedProductDetails = (): SelectedProductDetailsType => {
  const { params: ctxParams } = useDataParams();

  const queryClient = useQueryClient();

  const cachedCatalog =
    queryClient.getQueryData<VariableWithLabel[]>(catalogQuery.queryKey) ?? [];

  const cachedItem = cachedCatalog.find(
    (product) => product.dataFieldId === ctxParams.variable
  );

  return cachedItem ?? {};
};

export default useSelectedProductDetails;
