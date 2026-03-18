import React from "react";

import { VariableDbEntry } from "../../../types/time-series.types";
import { extractLatLonFromCacheKey } from "../helpers";
import { toLocalShortDateTime } from "../../../utils/date";

interface ItemDateTimeProps {
  item: Partial<VariableDbEntry>;
}

const ItemDateTime: React.FC<ItemDateTimeProps> = ({ item }) => {
  if (!item.key || !item.variableEntryId || !item.metadata) return null;

  const coords = extractLatLonFromCacheKey(item.key, item.variableEntryId);
  if (!coords) return null;

  const beginTime = toLocalShortDateTime(
    item.startDate || coords.length === 2
      ? item.metadata.begin_time
      : item.metadata["User Start Date:"]
  );

  const endTime = toLocalShortDateTime(
    item.endDate || coords.length === 2
      ? item.metadata.end_time
      : item.metadata["User End Date:"]
  );

  return (
    <>
      <p>Begin Time: {beginTime}</p>
      <p>End Time: {endTime}</p>
    </>
  );
};

export default ItemDateTime;
