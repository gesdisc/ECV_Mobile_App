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
import { refreshOutline } from "ionicons/icons";
import { DataParams, VariableDbEntry } from "../../../types/time-series.types";

import {
  clearCache,
  removeItem,
  getAllItems,
} from "../../../services/indexDBService";
import useCheckIndexedDBUsage from "../../../hooks/useCheckIndexedDBUsage";

import StorageItem from "./StorageItem";

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

  const [cachedItems, setCachedItems] = useState<Partial<VariableDbEntry>[]>(
    []
  );
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  const getAllCachedItems = async () => {
    try {
      const data = await getAllItems();
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

  const deleteCachedItemHandler = async (key: string) => {
    try {
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
          key={item.key}
          item={item}
          onPlot={(newParams: DataParams) => {
            dismiss();
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
