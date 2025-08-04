import React from "react";
import { IonTitle, IonHeader, IonToolbar } from "@ionic/react";

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
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <img
              src="/assets/icon/Icon-96.png"
              style={{ width: "35px", height: "35px", display: "block" }}
              alt="GES DISC Logo"
            />

            <div style={{ height: "100%" }}>
              <h1
                style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  paddingInline: "5px",
                  margin: "0",
                }}
              >
                <span style={{ color: "#90CBEF" }}>Giovanni </span>
                <span style={{ color: "#466CB4" }}>Mobile</span>
              </h1>
              <span
                style={{
                  fontSize: "12px",
                  display: "flex",
                  paddingInline: "5px",
                }}
              >
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
