import React from "react";
import { IonHeader, IonToolbar } from "@ionic/react";

import styles from "./Banner.module.css";

interface BannerProps {
  children?: React.ReactNode;
}

const Banner: React.FC<BannerProps> = ({ children }) => {
  return (
    <IonHeader className="ion-no-border">
      <IonToolbar color="primary">
        <div className={`ion-padding ${styles["banner-wrapper"]}`}>
          <div className={`${styles["banner-container"]}`}>
            <img
              src="/assets/icon/Icon-96.png"
              className={styles["banner-icon"]}
              alt="GES DISC Logo"
            />

            <div className={styles["banner-text-container"]}>
              <h1 className={styles["banner-title"]}>
                <span style={{ color: "#90CBEF" }}>Giovanni </span>
                <span style={{ color: "#466CB4" }}>Mobile</span>
              </h1>
              <span className={styles["banner-subtitle"]}>
                The Bridge Between Data and Science
              </span>
            </div>
          </div>
          {children}
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default Banner;
