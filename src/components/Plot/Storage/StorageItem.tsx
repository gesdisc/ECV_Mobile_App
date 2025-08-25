import React from "react";
import { IonButton, IonIcon, IonItem, IonLabel } from "@ionic/react";
import { trash } from "ionicons/icons";

import {
  DataParams,
  TimeSeriesMetadata,
} from "../../../types/time-series.types";
import catalog from "../../Catalog/catalog.json";

import styles from "./StorageItem.module.css";

interface StorageItemProps {
  item: {
    metadata: TimeSeriesMetadata;
    cachekey: string;
  };
  onDelete: (key: string) => void;
  onPlot: ({ lat, lon, begin_time, end_time, variable }: DataParams) => void;
}

const SorageItem: React.FC<StorageItemProps> = ({ item, onDelete, onPlot }) => {
  const currentVariableData = catalog.find(
    (data) =>
      data.dataFieldId ===
      `${item.metadata.prod_name}`
        .replaceAll(".", "_")
        .concat(`_${item.metadata.param_short_name}`)
  );

  const plotCachedItemHandler = () => {
    const cachedDataParams = {
      lat: item.metadata.lat,
      lon: item.metadata.lon,
      begin_time: new Date(item.metadata.begin_time).toISOString().slice(0, -5),
      end_time: new Date(item.metadata.end_time).toISOString().slice(0, -5),
      variable: `${item.metadata.prod_name}`
        .replaceAll(".", "_")
        .concat(`_${item.metadata.param_short_name}`),
    };
    onPlot(cachedDataParams);
  };

  return (
    <IonItem>
      <IonLabel className={`ion-padding-vertical ${styles["storage-item"]}`}>
        <p className={styles["item-label"]}>{currentVariableData?.label}</p>
        <p>
          Begin Time:
          {new Date(item.metadata.begin_time).toLocaleDateString()}
        </p>
        <p>End Time: {new Date(item.metadata.end_time).toLocaleDateString()}</p>
        <p>Latitude: {item.metadata.lat}</p>
        <p>Longitude: {item.metadata.lon}</p>
      </IonLabel>
      <IonButton size="default" onClick={plotCachedItemHandler}>
        <IonLabel>Plot</IonLabel>
      </IonButton>
      <IonButton
        size="default"
        color={"danger"}
        onClick={() => onDelete(item.cachekey)}
      >
        <IonIcon aria-hidden="true" icon={trash} />
      </IonButton>
    </IonItem>
  );
};

export default SorageItem;
