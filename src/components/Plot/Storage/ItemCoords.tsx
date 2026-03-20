import React from "react";

import { VariableDbEntry } from "../../../types/time-series.types";
import { extractLatLonFromCacheKey } from "../helpers";

interface ItemCoordsProps {
  item: Partial<VariableDbEntry>;
}

const ItemCoords: React.FC<ItemCoordsProps> = ({ item }) => {
  if (!item.key || !item.variableEntryId) return null;

  const coords = extractLatLonFromCacheKey(item.key, item.variableEntryId);
  if (!coords) return null;

  // point
  if (coords.length === 2) {
    const [lat, lon] = coords;
    return (
      <>
        <p>Latitude: {lat}</p>
        <p>Longitude: {lon}</p>
      </>
    );
  }

  // bbox
  if (coords.length === 4) {
    const [w, s, e, n] = coords;
    return (
      <>
        <p>West: {w}</p>
        <p>South: {s}</p>
        <p>East: {e}</p>
        <p>North: {n}</p>
      </>
    );
  }

  return null;
};

export default ItemCoords;
