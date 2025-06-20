import React from "react";
import { IonGrid, IonRow, IonCol } from "@ionic/react";

const Banner: React.FC = () => {
  return (
    <IonGrid>
      <IonRow>
        <IonCol size="2" style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/assets/gesDiscLogo.png"
            alt="gesDisc Logo"
            style={{ width: "50px" }}
          />
        </IonCol>
        <IonCol
          size="10"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "left",
            }}
          >
            GES DISC
          </div>
          <div style={{ fontSize: "14px", textAlign: "left" }}>
            Giovanni Mobile
          </div>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default Banner;
