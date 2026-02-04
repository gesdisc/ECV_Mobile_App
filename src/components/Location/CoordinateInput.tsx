import React from "react";
import {
  IonFooter,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
} from "@ionic/react";

import styles from "./Location.module.css";

interface CoordinateInputProps {
  latitude: number;
  longitude: number;
  onLatChange: (e: CustomEvent) => void;
  onLngChange: (e: CustomEvent) => void;
}

const CoordinateInput: React.FC<CoordinateInputProps> = ({
  latitude,
  longitude,
  onLatChange,
  onLngChange,
}) => {
  return (
    <IonFooter id="location-footer">
      <IonToolbar>
        <div className={`${styles["input-container"]}`}>
          <IonItem>
            <IonLabel position="floating">Latitude:</IonLabel>
            <IonInput
              type="number"
              value={latitude}
              onIonChange={onLatChange}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Longitude:</IonLabel>
            <IonInput
              type="number"
              value={longitude}
              onIonChange={onLngChange}
            />
          </IonItem>
        </div>
      </IonToolbar>
    </IonFooter>
  );
};

export default CoordinateInput;
