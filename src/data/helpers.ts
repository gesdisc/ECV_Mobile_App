import { Variable, VariableWithLabel } from "./browse-variables.types";
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
      gibsProductId: catalogItem?.gibsProductId || "",
    };
  });
}
