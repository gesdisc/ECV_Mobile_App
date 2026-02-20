import React, { useEffect, useState } from "react";
import {
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonCol,
  IonList,
  useIonToast,
  useIonAlert,
} from "@ionic/react";
import { DataParams, VariableDbEntry } from "../../../types/time-series.types";

import {
  getAllData,
  deleteAllData,
  IndexedDbStores,
  deleteDataByKey,
  getDataByKey,
} from "../../../services/indexDBService";
import useCheckIndexedDBUsage from "../../../hooks/useCheckIndexedDBUsage";
import { useCatalogQuery } from "../../../data/useCatalogQuery";
import { getDate } from "../../../utils/date";

import StorageItem from "./StorageItem";
import InfoPanel from "../../UI/InfoPanel";

interface StorageManagerProps {
  onPlot: (newParams: DataParams) => void;
  onModalClose: () => void;
  isOpen: boolean;
}

const StorageManager: React.FC<StorageManagerProps> = ({
  onPlot,
  onModalClose,
  isOpen,
}) => {
  // Note: This doesn't calculate the space used by this storage. It includes all or some of the other cached assets by the app.
  // To replicate, delete all items and see that the usedSpace isn't 0%.
  const {
    totalSpace,
    usedSpace,
    error: indexedDBUsageError,
  } = useCheckIndexedDBUsage();

  const [cachedItems, setCachedItems] = useState<Partial<VariableDbEntry>[]>(
    []
  );
  const [presentToast, dismissToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  const { data: catalog } = useCatalogQuery();
  const [infoPanelVariableId, setInfoPanelVariableId] = useState("");

  const currentVariable = catalog?.find(
    (data) => data.dataFieldId === infoPanelVariableId
  );

  const variableInfoHandler = (dataFieldId: string) =>
    setInfoPanelVariableId(dataFieldId);

  const variableInfo = {
    title: currentVariable?.label || "Invalid label",
    list: [
      {
        label: "Longname",
        value: currentVariable?.dataFieldLongName ?? "",
      },
      {
        label: "Shortname",
        value: currentVariable?.dataFieldShortName ?? "",
      },
      {
        label: "Units",
        value: currentVariable?.dataFieldUnits ?? "",
      },
      {
        label: "Spatial Resolution",
        value: currentVariable?.dataProductSpatialResolution ?? "",
      },
      {
        label: "Product Name",
        value: currentVariable?.dataProductShortName ?? "",
      },
      {
        label: "Product Version",
        value: currentVariable?.dataProductVersion ?? "",
      },
      {
        label: "Begin Datetime",
        value: currentVariable?.dataProductBeginDateTime
          ? getDate(currentVariable?.dataProductBeginDateTime)
          : "",
      },
      {
        label: "End Datetime",
        value: currentVariable?.dataProductEndDateTime
          ? getDate(currentVariable?.dataProductEndDateTime)
          : "",
      },
      {
        label: "Dataset Information",
        link: currentVariable?.dataProductDescriptionUrl,
      },
    ],
  };

  useEffect(() => {
    if (!isOpen) {
      // hide toast when storage is closed
      dismissToast();
      return;
    }
    getAllCachedItems();
  }, [isOpen]);

  const toastPresenter = (
    message: string,
    position: "top" | "middle" | "bottom",
    color: "success" | "danger"
  ) => {
    presentToast({
      message: message,
      duration: 2500,
      position: position,
      positionAnchor: "storage-header",
      color: color,
    });
  };

  const alertPresenter = (
    header: string,
    message?: string,
    subHeader?: string,
    cancel?: () => void,
    confirm?: (item?: string) => void
  ) => {
    presentAlert({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            cancel?.();
          },
        },
        {
          text: "Delete",
          role: "confirm",
          handler: () => {
            confirm?.();
          },
        },
      ],
    });
  };

  const getAllCachedItems = async () => {
    try {
      const data = await getAllData(IndexedDbStores.TIME_SERIES);
      if (!data) return;
      setCachedItems(data);
    } catch (error) {
      toastPresenter(
        "Something went wrong while retrieving cached data!",
        "top",
        "danger"
      );
    }
  };

  const deleteCachedItemHandler = async (key: string) => {
    try {
      const item = await getDataByKey(IndexedDbStores.TIME_SERIES, key);

      if (!item) throw Error;

      await deleteDataByKey(IndexedDbStores.TIME_SERIES, key);

      await getAllCachedItems();

      toastPresenter("Successfully deleted!", "top", "success");
    } catch (error) {
      toastPresenter(
        "Something went wrong while deleting an item!",
        "top",
        "danger"
      );
    }
  };

  const deleteAllItemsHandler = async () => {
    try {
      await deleteAllData(IndexedDbStores.TIME_SERIES);

      await getAllCachedItems();

      toastPresenter("Successfully deleted all items!", "top", "success");
    } catch (error) {
      toastPresenter(
        "Something went wrong while deleting items!",
        "top",
        "danger"
      );
    }
  };

  const displayCachedItems = () => {
    if (cachedItems.length === 0) {
      return <p>No data in storage!</p>;
    }

    return cachedItems.map((item) => {
      return (
        <StorageItem
          key={item.key}
          item={item}
          onPlot={(newParams: DataParams) => {
            onModalClose();
            onPlot(newParams);
          }}
          onDelete={() => {
            alertPresenter(
              "Delete item?",
              undefined,
              undefined,
              undefined,
              () => item.key && deleteCachedItemHandler(item.key)
            );
          }}
          onRequestInfo={variableInfoHandler}
        />
      );
    });
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onModalClose}>
      <IonHeader id="storage-header">
        <IonToolbar>
          <IonTitle>Storage</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onModalClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <InfoPanel
          dataList={variableInfo}
          isOpen={!!infoPanelVariableId}
          afterDismiss={() => setInfoPanelVariableId("")}
        />
        <IonCol>
          {usedSpace && totalSpace && (
            <div>
              Used space: {((usedSpace / totalSpace) * 100).toFixed(7)}%
            </div>
          )}
          <IonList>{displayCachedItems()}</IonList>
          {cachedItems.length !== 0 && (
            <IonButton
              className="ion-margin-top"
              expand="block"
              color="danger"
              onClick={() =>
                alertPresenter(
                  "Delete all items?",
                  undefined,
                  undefined,
                  undefined,
                  deleteAllItemsHandler
                )
              }
              disabled={!cachedItems.length}
            >
              Delete All
            </IonButton>
          )}
        </IonCol>
      </IonContent>
    </IonModal>
  );
};

export default StorageManager;
