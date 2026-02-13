import React from "react";
import {
  IonFooter,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
} from "@ionic/react";

import { SpatialAreaType } from "../../types/time-series.types";

import styles from "./Location.module.css";

interface CoordinateInputProps {
  latitude: number;
  longitude: number;
  onLatChange: (e: CustomEvent) => void;
  onLngChange: (e: CustomEvent) => void;
  mapOption?: SpatialAreaType;
}

const CoordinateInput: React.FC<CoordinateInputProps> = ({
  latitude,
  longitude,
  onLatChange,
  onLngChange,
  mapOption,
}) => {
  return (
    <IonFooter id="location-footer">
      <IonToolbar>
        <div className={`${styles["input-container"]}`}>
          <IonItem>
            <IonLabel position="floating">
              {mapOption === SpatialAreaType.COORDINATES
                ? "Latitude:"
                : "South:"}
            </IonLabel>
            <IonInput
              type="number"
              value={latitude}
              onIonChange={onLatChange}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">
              {mapOption === SpatialAreaType.COORDINATES
                ? "Longitude:"
                : "west:"}
            </IonLabel>
            <IonInput
              type="number"
              value={longitude}
              onIonChange={onLngChange}
              clearOnEdit={true}
            />
          </IonItem>
          {mapOption === SpatialAreaType.BOUNDING_BOX && (
            <>
              <IonItem>
                <IonLabel position="floating">north:</IonLabel>
                <IonInput
                  type="number"
                  value={longitude}
                  onIonChange={onLngChange}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">east:</IonLabel>
                <IonInput
                  type="number"
                  value={longitude}
                  onIonChange={onLngChange}
                />
              </IonItem>
            </>
          )}
        </div>
      </IonToolbar>
    </IonFooter>
  );
};

export default CoordinateInput;
