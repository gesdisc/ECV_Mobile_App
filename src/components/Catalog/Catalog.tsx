import React from "react";
import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import { useHistory } from "react-router-dom";

import { TabMenuLabels } from "../../constants/ui";
import { usePlotType, PLOT_TYPES } from "../../store/PlotTypeContext";

import Banner from "../UI/Banner";
import Variables from "./Variables";

const Catalog: React.FC = () => {
  const { plotType, setPlotType } = usePlotType();
  const history = useHistory();

  const variableChangeHandler = (variable: string) => {
    history.push(`/${TabMenuLabels.PLOT}`, variable);
  };

  return (
    <IonPage>
      <IonContent>
        <Banner />
        <div className="ion-padding">
          <IonSegment
            value={plotType}
            style={{ marginBottom: "10px" }}
            onIonChange={(e: any) => setPlotType(e.detail.value)}
          >
            <IonSegmentButton value={PLOT_TYPES.POINT_BASED}>
              <IonLabel>Time Series</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value={PLOT_TYPES.TIME_AVG}>
              <IonLabel>Time Series + Map</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {plotType === PLOT_TYPES.POINT_BASED && (
            <Variables onVariableChange={variableChangeHandler} />
          )}
          {plotType === PLOT_TYPES.TIME_AVG && (
            <IonList slot="content">
              <IonItem button>
                <IonLabel>Black Carbon Mass Density</IonLabel>
                <IonNote>Demo</IonNote>
              </IonItem>
            </IonList>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Catalog;
