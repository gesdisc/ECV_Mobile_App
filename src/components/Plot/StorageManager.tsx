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
} from "../../services/indexDBService";
import useCheckIndexedDBUsage from "../../hooks/useCheckIndexedDBUsage";

interface StorageManagerProps {
  metadata: TimeSeriesMetadata;
}

const StorageManager: React.FC = () => {
  const modal = useRef<HTMLIonModalElement>(null);
  // const page = useRef(null);

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
  const [itemKeyToDelete, setItemKeyToDelete] = useState("");
  // useEffect(() => {
  //   setPresentingElement(page.current);
  // }, []);

  function dismiss() {
    modal.current?.dismiss();
  }

  async function canDismiss(data?: any, role?: string) {
    return role !== "gesture";
  }

  useEffect(() => {
    // console.log("RUN");
    const getAllCachedItems = async () => {
      try {
        console.log("loading");
        const data = await getAllItems();
        if (!data || data.length === 0) return;

        setCachedItems(data);

        // console.log("useef data: ", data);
      } catch (error) {
        console.log("error");
      } finally {
        console.log("loaded");
      }
    };
    getAllCachedItems();
  }, []);
  // console.log(...cachedItems);

  const deleteCachedItemHandler = async (role: string | undefined) => {
    if (!role) return;
    if (role === "confirm") {
      console.log("confirmed, deleting item: ", itemKeyToDelete);
      // try {
      // console.log("deleting...")
      //   await removeItem(itemKeyToDelete);
      // } catch (error) {
      //   console.log(error);
      // }
    }
    setItemKeyToDelete("");
  };

  const clearAllItemsHandler = async () => {
    try {
      console.log("clearing");
      // await clearCache();
      console.log("DONE");
    } catch (error) {
      console.log(error);
    }
  };

  const displayCachedItems = () => {
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
            id="delete-item-alert"
            onClick={() => setItemKeyToDelete(item.cachekey)}
          >
            <IonIcon aria-hidden="true" size="medium" icon={trash} />
          </IonButton>
        </IonItem>
      );
    });
  };

  return (
    <>
      <IonButton size="default" id="storage-manager">
        <IonIcon aria-hidden="true" size="medium" icon={server} />
      </IonButton>

      <IonModal
        ref={modal}
        trigger="storage-manager"
        canDismiss={canDismiss}
        presentingElement={presentingElement!}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Storage</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => dismiss()}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonCol>
            {/* <h3>Currently Visualizing:</h3> */}
            {/* <div>Variable: {stateMetadata?.prod_name}</div>
              {stateMetadata?.begin_time && (
                <div>Begin time: {formatDate(stateMetadata.begin_time)}</div>
              )}
              {stateMetadata?.end_time && (
                <div>End time: {formatDate(stateMetadata.end_time)}</div>
              )}
              {stateMetadata?.lat && (
                <div>
                  Coordiantes: {stateMetadata.lat}, {stateMetadata.lon}
                </div>
              )} */}
            <div>
              Approx. used space:{" "}
              {(usedSpace &&
                totalSpace &&
                ((usedSpace / totalSpace) * 100).toFixed(10)) ||
                indexedDBUsageError}
              %
            </div>
            <IonList>
              <IonListHeader>
                <IonLabel>Cached Data</IonLabel>
              </IonListHeader>
              {displayCachedItems()}
            </IonList>
            <IonButton
              expand="block"
              // fill="outline"
              color="danger"
              onClick={clearAllItemsHandler}
              // disabled={isLoading}
            >
              Delete All Data
              {/* {isLoading ? "Wait..." : "Plot Data"} */}
            </IonButton>
          </IonCol>
        </IonContent>
      </IonModal>
      <IonAlert
        header="Delete item?"
        subHeader="subheader"
        message="message"
        // trigger="delete-item-alert"
        isOpen={itemKeyToDelete ? true : false}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              console.log("canceled");
            },
          },
          {
            text: "OK",
            role: "confirm",
            handler: () => {
              console.log("Alert confirmed");
            },
          },
        ]}
        onDidDismiss={
          ({ detail }) => deleteCachedItemHandler(detail.role)
          // console.log(`Dismissed with role: ${detail.role}`)
        }
      ></IonAlert>
    </>
  );
};

export default StorageManager;
