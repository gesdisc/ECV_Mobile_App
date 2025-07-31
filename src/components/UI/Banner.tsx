import React from "react";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonTitle,
  IonItemDivider,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { server } from "ionicons/icons";

// import styles from "./Banner.module.css";

interface BannerProps {
  children?: React.ReactNode;
}

const Banner: React.FC<BannerProps> = ({ children }) => {
  return (
    <IonHeader className="ion-no-border">
      <IonToolbar color="primary">
        <div
          style={{ display: "flex", justifyContent: "space-between" }}
          className="ion-padding"
        >
          <div style={{ display: "flex" }}>
            <img
              src="/assets/icon/Icon-96.png"
              style={{ width: "50px", height: "50px", display: "block" }}
              alt="GES DISC Logo"
            />

            <IonTitle size="large">
              <span style={{ color: "#90CBEF" }}>GES </span>
              <span style={{ color: "#466CB4" }}>DISC</span>
            </IonTitle>
          </div>
          {children}
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default Banner;
