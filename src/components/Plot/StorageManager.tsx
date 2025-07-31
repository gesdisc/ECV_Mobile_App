import React, { useRef, useEffect, useState } from "react";
import {
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonCol,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonAlert,
  useIonToast,
  useIonAlert,
} from "@ionic/react";
import { server, trash } from "ionicons/icons";
import {
  TimeSeriesMetadata,
  TimeSeriesData,
} from "../../types/time-series.types";

import {
  clearCache,
  removeItem,
  getAllItems,
  getRecentDataKey,
} from "../../services/indexDBService";
import { RECENT_DATA_CACHE_KEY } from "../../constants/time-series";
import useCheckIndexedDBUsage from "../../hooks/useCheckIndexedDBUsage";

const StorageManager: React.FC = () => {
  const modal = useRef<HTMLIonModalElement>(null);
  const page = useRef(null);
  const [presentingElement, setPresentingElement] =
    useState<HTMLElement | null>(null);
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

  useEffect(() => {
    setPresentingElement(page.current);
  }, []);

  useEffect(() => {
    const getAllCachedItems = async () => {
      try {
        console.log("loading");
        const data = await getAllItems();
        if (!data || data.length === 0) return;

        // setCachedItems(data);
        setCachedItems([]);
        // console.log("useef data: ", data);
      } catch (error) {
        console.log("error");
      } finally {
        console.log("loaded");
      }
    };
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

  const deleteCachedItemHandler = async (key: string) => {
    try {
      // const recentCachedDataKey = await getRecentDataKey(RECENT_DATA_CACHE_KEY);

      // set new data as recent??
      // if (recentCachedDataKey === key) {
      //   console.log("recentCachedDataKey_____: ", recentCachedDataKey);
      // }
      await removeItem(key);
      setCachedItems((prevData) => prevData.filter((d) => d.cachekey !== key));
      toastPresenter("Successfully deleted!", "top", "success");
    } catch (error) {
      toastPresenter(
        "Something went wrong while deleting an item!",
        "top",
        "danger"
      );
    }
  };

  // check if the latest cache is deleted
  const deleteAllItemsHandler = async () => {
    try {
      console.log("clearing all items!!!");
      await clearCache();
      setCachedItems([]);
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
        <IonItem key={item.cachekey}>
          <IonCol
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <IonLabel>{item.metadata.param_name}</IonLabel>
            <IonLabel>
              Begin Time:
              {new Date(item.metadata.begin_time).toLocaleDateString()}
            </IonLabel>
            <IonLabel>
              End Time: {new Date(item.metadata.end_time).toLocaleDateString()}
            </IonLabel>
            Latitude: <IonLabel>{item.metadata.lat}</IonLabel>
            Longitude: <IonLabel>{item.metadata.lon}</IonLabel>
          </IonCol>

          {/* <IonButton
            size="small"
            // color={"primary"}
          >
            <IonLabel>Plot</IonLabel>
            <IonIcon aria-hidden="true" size="medium" icon={trash} />
          </IonButton> */}
          <IonButton
            size="small"
            color={"danger"}
            onClick={() => {
              alertPresenter(
                "Delete item?",
                undefined,
                undefined,
                undefined,
                () => deleteCachedItemHandler(item.cachekey)
              );
            }}
          >
            <IonIcon aria-hidden="true" size="medium" icon={trash} />
          </IonButton>
        </IonItem>
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
            <IonTitle>Storage</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => dismiss()}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonCol>
            <div>
              Approx. used space:{" "}
              {(usedSpace &&
                totalSpace &&
                ((usedSpace / totalSpace) * 100).toFixed(10)) ||
                indexedDBUsageError}
              %
            </div>
            <IonList>
              {/* <IonListHeader>
                <IonLabel>Cached Data</IonLabel>
              </IonListHeader> */}
              {displayCachedItems()}
            </IonList>
            <IonButton
              expand="block"
              // fill="outline"
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
              disabled={!!cachedItems}
            >
              Delete All
            </IonButton>
          </IonCol>
        </IonContent>
      </IonModal>
    </>
  );
};

export default StorageManager;
