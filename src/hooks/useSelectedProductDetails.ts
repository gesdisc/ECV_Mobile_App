import { useState, useEffect } from "react";

import { useDataParams } from "../store/DataParamsContext";
import { getDataByKey, IndexedDbStores } from "../data/localforage";
import { VariableWithLabel } from "../data/browse-variables.types";

export type SelectedProductDetailsType =
  | VariableWithLabel
  | Record<string, never>;

const useSelectedProductDetails = (): SelectedProductDetailsType => {
  const [selectedProductDetails, setSelectedProductDetails] =
    useState<SelectedProductDetailsType>({});
  const { params: ctxParams } = useDataParams();

  useEffect(() => {
    const getCurrentVariableData = async () => {
      if (ctxParams.variable === "") return;
      const productDetails: VariableWithLabel = await getDataByKey(
        IndexedDbStores.CATALOG,
        ctxParams.variable
      );

      if (productDetails) {
        setSelectedProductDetails(productDetails);
      } else {
        setSelectedProductDetails({});
        console.warn(
          `No product details found for variable: ${ctxParams.variable}`
        );
      }
    };
    getCurrentVariableData();
  }, [ctxParams.variable]);

  return selectedProductDetails;
};

export default useSelectedProductDetails;
