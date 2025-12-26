import { useState, useEffect } from "react";

import { useDataParams } from "../store/DataParamsContext";
import { getDataByKey } from "../components/Catalog/localforage";
import { IndexedDbStores } from "../components/Catalog/localforage";
import { VariableWithLabel } from "../components/Catalog/browse-variables.types";

const useSelectedProductDetails = () => {
  const [selectedProductDetails, setSelectedProductDetails] = useState<
    VariableWithLabel | Record<string, never>
  >({});
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
