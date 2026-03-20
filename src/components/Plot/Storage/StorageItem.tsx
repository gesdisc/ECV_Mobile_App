import React from "react";
import { IonButton, IonIcon, IonItem, IonLabel, IonText } from "@ionic/react";
import { trash, informationCircleOutline } from "ionicons/icons";

import { DataParams, VariableDbEntry } from "../../../types/time-series.types";
import { extractLatLonFromCacheKey } from "../helpers";
import { toLocalShortDateTime } from "../../../utils/date";
import catalog from "../../../data/catalog.json";

import styles from "./StorageItem.module.css";

interface StorageItemProps {
  item: Partial<VariableDbEntry>;
  onDelete: (key: string) => void;
  onPlot: ({ lat, lon, begin_time, end_time, variable }: DataParams) => void;
  onRequestInfo: (dataFieldId: string) => void;
}

const StorageItem: React.FC<StorageItemProps> = ({
  item,
  onDelete,
  onPlot,
  onRequestInfo,
}) => {
  const itemMetadataFromCatalog = catalog.find(
    (data) => data.dataFieldId === item.variableEntryId
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

  const infoButtonHandler = () => {
    if (!itemMetadataFromCatalog) return;
    onRequestInfo(itemMetadataFromCatalog.dataFieldId);
  };

  return (
    <IonItem>
      <IonLabel className="ion-padding-top">
        <IonText>
          <h2 className={styles["item-label"]}>
            {itemMetadataFromCatalog?.label}
            <IonButton size="small" fill="clear" onClick={infoButtonHandler}>
              <IonIcon
                aria-hidden="true"
                size="large"
                icon={informationCircleOutline}
              />
            </IonButton>
          </h2>
          {item.metadata?.Request_time && (
            <p>Timestamp: {toLocalShortDateTime(item.metadata.Request_time)}</p>
          )}
          {item.metadata?.begin_time && (
            <p>Begin Time: {toLocalShortDateTime(item.metadata.begin_time)}</p>
          )}
          {item.metadata?.end_time && (
            <p>End Time: {toLocalShortDateTime(item.metadata.end_time)}</p>
          )}
          <p>Latitude: {item.metadata?.lat}</p>
          <p>Longitude: {item.metadata?.lon}</p>
        </IonText>
        <div className={`${styles["button-group"]} ion-margin-top`}>
          <IonButton
            size="default"
            expand="block"
            className={styles.button}
            onClick={plotCachedItemHandler}
          >
            <IonLabel>Plot</IonLabel>
          </IonButton>
          <IonButton
            size="default"
            color="danger"
            expand="block"
            className={styles.button}
            onClick={() => item.key && onDelete(item.key)}
          >
            <IonIcon aria-hidden="true" icon={trash} />
          </IonButton>
        </div>
      </IonLabel>
    </IonItem>
  );
};

export default StorageItem;
