import { Variable, VariableWithLabel } from "./browse-variables.types";
import { storeDataByKey, IndexedDbStores } from "./localforage";
import catalog from "./catalog.json";

/**
 *
 * @summary Modifies the list of variables by adding labels and grouping information from the catalog.
 * @param list - Array of Variable objects to be modified.
 * @returns Array of VariableWithLabel objects with added label, group, and subgroup properties.
 *
 */
export function addMissingProperties(list: Variable[]): VariableWithLabel[] {
  return list.map((item) => {
    const catalogItem = catalog.find(
      (catItem) => catItem.dataFieldId === item.dataFieldId
    );
    // TODO: if we decide to let users add/search for variables not in the catalog, we need to handle the case where label/group/subgroup are missing
    return {
      ...item,
      label: catalogItem?.label || "N/A",
      group: catalogItem?.group || "unknown",
      subgroup: catalogItem?.subgroup || "unknown",
    };
  });
}

export async function cacheAllProductDetails(items: VariableWithLabel[]) {
  // eslint-disable-next-line no-useless-catch
  try {
    await Promise.all(
      items.map(async (item) =>
        storeDataByKey(IndexedDbStores.CATALOG, item.dataFieldId, item)
      )
    );
  } catch (error) {
    throw error;
  }
}
