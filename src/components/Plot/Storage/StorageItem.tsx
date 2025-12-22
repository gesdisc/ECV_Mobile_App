import React from "react";
import { IonButton, IonIcon, IonItem, IonLabel } from "@ionic/react";
import { trash } from "ionicons/icons";

import { DataParams, VariableDbEntry } from "../../../types/time-series.types";
import { extractLatLonFromCacheKey } from "../helpers";
import { convertToLocalDate } from "../../../utils/date";
import catalog from "../../Catalog/catalog.json";

import styles from "./StorageItem.module.css";

interface StorageItemProps {
  item: Partial<VariableDbEntry>;
  onDelete: (key: string) => void;
  onPlot: ({ lat, lon, begin_time, end_time, variable }: DataParams) => void;
}

const StorageItem: React.FC<StorageItemProps> = ({
  item,
  onDelete,
  onPlot,
}) => {
  const currentVariableData = catalog.find(
    (data) =>
      data.dataFieldId ===
      `${item.metadata?.prod_name}`
        .replaceAll(".", "_")
        .concat(`_${item.metadata?.param_short_name}`)
  );

  const plotCachedItemHandler = () => {
    if (!item.key) return;

    const coords = extractLatLonFromCacheKey(item.key);

    if (!coords || !item.metadata || !item.variableEntryId) return;

    const cachedDataParams = {
      lat: coords.lat,
      lon: coords.lon,
      begin_time: item.metadata.begin_time,
      end_time: item.metadata.end_time,
      variable: item.variableEntryId,
    };

    onPlot(cachedDataParams);
  };

  return (
    <IonItem>
      <IonLabel className={`ion-padding-vertical ${styles["storage-item"]}`}>
        <p className={styles["item-label"]}>{currentVariableData?.label}</p>
        {item.metadata?.Request_time && (
          <p>Timestamp: {convertToLocalDate(item.metadata.Request_time)}</p>
        )}
        {item.metadata?.begin_time && (
          <p>Begin Time: {convertToLocalDate(item.metadata.begin_time)}</p>
        )}
        {item.metadata?.end_time && (
          <p>End Time: {convertToLocalDate(item.metadata.end_time)}</p>
        )}
        <p>Latitude: {item.metadata?.lat}</p>
        <p>Longitude: {item.metadata?.lon}</p>
      </IonLabel>
      <IonButton size="default" onClick={plotCachedItemHandler}>
        <IonLabel>Plot</IonLabel>
      </IonButton>
      <IonButton
        size="default"
        color={"danger"}
        onClick={() => item.key && onDelete(item.key)}
      >
        <IonIcon aria-hidden="true" icon={trash} />
      </IonButton>
    </IonItem>
  );
};

export default StorageItem;
