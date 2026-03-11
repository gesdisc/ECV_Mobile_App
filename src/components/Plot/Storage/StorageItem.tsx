import React from "react";
import { IonButton, IonIcon, IonItem, IonLabel, IonText } from "@ionic/react";
import { trash } from "ionicons/icons";

import {
  DataParams,
  VariableDbEntry,
  SpatialAreaType,
} from "../../../types/time-series.types";
import { extractLatLonFromCacheKey } from "../helpers";
import { toLocalShortDateTime } from "../../../utils/date";
import catalog from "../../../data/catalog.json";

import ItemDateTime from "./ItemDateTime";
import ItemCoords from "./ItemCoords";

import styles from "./StorageItem.module.css";

interface StorageItemProps {
  item: Partial<VariableDbEntry>;
  onDelete: (key: string) => void;
  onPlot: (cachedItem: DataParams) => void;
}

const StorageItem: React.FC<StorageItemProps> = ({
  item,
  onDelete,
  onPlot,
}) => {
  const itemMetadataFromCatalog = catalog.find(
    (data) => data.dataFieldId === item.variableEntryId
  );

  const plotCachedItemHandler = () => {
    if (!item.key) return;
    if (!item.metadata || !item.variableEntryId) return;

    const coords = extractLatLonFromCacheKey(item.key, item.variableEntryId);
    if (!coords) return;

    let cachedDataParams = {} as Partial<DataParams>;

    // point
    if (coords.length === 2) {
      const [lat, lon] = coords;

      cachedDataParams = {
        begin_time: item.startDate || item.metadata.begin_time,
        end_time: item.endDate || item.metadata.end_time,
        spatialArea: {
          type: SpatialAreaType.COORDINATES,
          value: {
            lat: `${lat}`,
            lng: `${lon}`,
          },
        },
      };
    }

    // bbox
    if (coords.length === 4) {
      const [w, s, e, n] = coords;

      cachedDataParams = {
        begin_time:
          item.startDate || item.metadata["User Start Date:"].toString(),
        end_time: item.endDate || item.metadata["User End Date:"].toString(),
        spatialArea: {
          type: SpatialAreaType.BOUNDING_BOX,
          value: {
            west: `${w}`,
            south: `${s}`,
            east: `${e}`,
            north: `${n}`,
          },
        },
      };
    }

    onPlot({
      ...cachedDataParams,
      variable: item.variableEntryId,
    } as DataParams);
  };

  return (
    <IonItem>
      <IonLabel className="ion-padding-top">
        <IonText>
          <h2 className={styles["item-label"]}>
            {itemMetadataFromCatalog?.label}
          </h2>
          {item.metadata?.Request_time && (
            <p>Timestamp: {toLocalShortDateTime(item.metadata.Request_time)}</p>
          )}
          <ItemDateTime item={item} />
          <ItemCoords item={item} />
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
