import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCatalog, updateCatalog } from "../services/api/graphql";
import { Variable, VariableWithLabel } from "./browse-variables.types";
import { addMissingProperties } from "./helpers";

export function useCatalogQuery() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["catalog"],
    queryFn: async () => {
      const cached = queryClient.getQueryData<VariableWithLabel[]>(["catalog"]);

      // Full catalog fetch on first launch
      if (!cached || cached.length === 0) {
        return await getCatalog();
      }

      // Partial update (only dataProductEndDateTime of catalog variables) if catalog exists
      const updates = await updateCatalog();

      // Update dataProductEndDateTime of existing (cached) catalog variables
      return cached.map((prod) => {
        const update = updates.find(
          (u: Variable) => u.dataFieldId === prod.dataFieldId,
        );
        return update
          ? { ...prod, dataProductEndDateTime: update.dataProductEndDateTime }
          : prod;
      });
    },
    select: addMissingProperties, // transforms data before caching (add labels)
    enabled: window.navigator.onLine,
  });
}
