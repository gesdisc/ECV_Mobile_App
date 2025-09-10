import React, { useRef, useEffect, useState } from "react";
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
  IonIcon,
} from "@ionic/react";
import {
  DataParams,
  TimeSeriesMetadata,
} from "../../../types/time-series.types";

import {
  clearCache,
  removeItem,
  getAllItems,
  // getRecentDataKey,
} from "../../../services/indexDBService";
// import { RECENT_DATA_CACHE_KEY } from "../../../constants/time-series";
import useCheckIndexedDBUsage from "../../../hooks/useCheckIndexedDBUsage";

import StorageItem from "./StorageItem";
import { refreshOutline } from "ionicons/icons";

interface StorageManagerProps {
  onPlot: (newParams: DataParams) => void;
}

const StorageManager: React.FC<StorageManagerProps> = ({ onPlot }) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const page = useRef(null);
  const [presentingElement, setPresentingElement] =
    useState<HTMLElement | null>(null);

  // Note: This doesn't calculate the space used by this storage. It includes all or some of the other cached assets by the app.
  // To replicate, delete all items and see that the usedSpace isn't 0%.
  const {
    totalSpace,
    usedSpace,
    error: indexedDBUsageError,
  } = useCheckIndexedDBUsage();

  const [cachedItems, setCachedItems] = useState<
    { metadata: TimeSeriesMetadata; cachekey: string }[]
  >([]);
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  const getAllCachedItems = async () => {
    try {
      const data = await getAllItems();
      if (!data) return;
      console.log(data);
      setCachedItems(data);
    } catch (error) {
      toastPresenter(
        "Something went wrong while retrieving cached data!",
        "top",
        "danger"
      );
    }
  };

  useEffect(() => {
    setPresentingElement(page.current);
  }, []);

  useEffect(() => {
    getAllCachedItems();
  }, []);

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
      swipeGesture: "vertical",
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

  const dismiss = () => {
    modal.current?.dismiss();
  };

  const canDismiss = async (data?: any, role?: string) => {
    return role !== "gesture";
  };

  // TODO: check for edge cases like deleting the latest cached item.
  // TODO: the system should remove the plotted data (update the state) when currently visualized item is deleted.
  const deleteCachedItemHandler = async (key: string) => {
    try {
      // const recentCachedDataKey = await getRecentDataKey(RECENT_DATA_CACHE_KEY);

      // TODO: set new data as recent??
      // if (recentCachedDataKey === key) {
      //   console.log("recentCachedDataKey: ", recentCachedDataKey);
      // }
      await removeItem(key);
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

  // TODO: the system should remove the plotted data (update the state) when all items are deleted
  const deleteAllItemsHandler = async () => {
    try {
      await clearCache();
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
          key={item.cachekey}
          item={item}
          onPlot={() => {
            dismiss();
            // onPlot(newParams);
          }}
          onDelete={() => {
            alertPresenter(
              "Delete item?",
              undefined,
              undefined,
              undefined,
              () => deleteCachedItemHandler(item.cachekey)
            );
          }}
        />
      );
    });
  };

  return (
    <>
      <IonModal
        ref={modal}
        trigger="storage-manager"
        canDismiss={canDismiss}
        presentingElement={presentingElement!}
      >
        <IonHeader id="storage-header">
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={getAllCachedItems}>
                <IonIcon
                  aria-hidden="true"
                  size="medium"
                  icon={refreshOutline}
                />
              </IonButton>
            </IonButtons>

            <IonTitle>Storage</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => dismiss()}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonCol>
            {usedSpace && totalSpace && (
              <div>
                Used space: {((usedSpace / totalSpace) * 100).toFixed(7)}%
              </div>
            )}
            <IonList>{displayCachedItems()}</IonList>
            {cachedItems.length !== 0 && (
              <IonButton
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
    </>
  );
};

export default StorageManager;
