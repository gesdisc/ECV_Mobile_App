import React from "react";
import { IonButton, IonIcon, IonItem, IonLabel } from "@ionic/react";
import { trash } from "ionicons/icons";

import {
  DataParams,
  TimeSeriesMetadata,
} from "../../../types/time-series.types";
import { useDataParams } from "../../../store/DataParamsContext";
import catalog from "../../Catalog/catalog.json";

import styles from "./StorageItem.module.css";

// TODO: explain
// Regex to match latitude and longitude with any number of decimals
const extractLatLon = (key: string) => {
  // Decode URL-encoded characters like %20 → space
  const decodedStr = decodeURIComponent(key);

  // Match any number (with optional sign and decimals) before and after a comma
  const regex = /([+-]?\d+(\.\d+)?),\s*([+-]?\d+(\.\d+)?)/;
  const match = decodedStr.match(regex);

  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[3]);
    return { lat, lon };
  } else {
    return null; // return null if no coordinates found
  }
};

interface StorageItemProps {
  item: {
    metadata: TimeSeriesMetadata;
    cachekey: string;
  };
  onDelete: (key: string) => void;
  // onPlot: ({ lat, lon, begin_time, end_time, variable }: DataParams) => void;
  onPlot: () => void;
}

const StorageItem: React.FC<StorageItemProps> = ({
  item,
  onDelete,
  onPlot,
}) => {
  const { setLatitude, setLongitude, setVariable, setBeginTime, setEndTime } =
    useDataParams();

  const currentVariableData = catalog.find(
    (data) =>
      data.dataFieldId ===
      `${item.metadata.prod_name}`
        .replaceAll(".", "_")
        .concat(`_${item.metadata.param_short_name}`)
  );

  // FIXME: cached item key lat,lon doesn't match with the metadata.lat/lon
  const plotCachedItemHandler = () => {
    // const cachedDataParams = {
    //   lat: item.metadata.lat,
    //   lon: item.metadata.lon,
    //   begin_time: new Date(item.metadata.begin_time).toISOString().slice(0, -5),
    //   end_time: new Date(item.metadata.end_time).toISOString().slice(0, -5),
    //   variable: `${item.metadata.prod_name}`
    //     .replaceAll(".", "_")
    //     .concat(`_${item.metadata.param_short_name}`),
    // };
    // // for Terra Map use the code below to plot cached items
    // console.log("storage item", cachedDataParams);
    console.log(item);
    // const coords = extractLatLon(item.cachekey);
    // if (coords !== null) {
    //   setLatitude(coords.lat);
    //   setLongitude(coords.lon);
    //   setVariable(
    //     `${item.metadata.prod_name}`
    //       .replaceAll(".", "_")
    //       .concat(`_${item.metadata.param_short_name}`)
    //   );
    //   setBeginTime(item.metadata.begin_time);
    //   setEndTime(item.metadata.end_time);
    //   onPlot();
    // }
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

export default StorageItem;
