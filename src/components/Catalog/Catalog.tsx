import React from "react";
import {
  IonAccordion,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import { useHistory } from "react-router-dom";

import { useDataParams } from "../../store/DataParamsContext";
import { usePlotType, PLOT_TYPES } from "../../store/PlotTypeContext";
import { TabMenuLabels } from "../../constants/ui";

// import Header from "../Layout/Header";
import Banner from "../UI/Banner";
import Variables from "./Variables";
import { analyticsOutline } from "ionicons/icons";

const Catalog: React.FC = () => {
  const { setVariable } = useDataParams();
  const { plotType, setPlotType } = usePlotType();
  const history = useHistory();

  const variableChangeHandler = (variable: string) => {
    setVariable(variable);
    history.push(`/${TabMenuLabels.PLOT}`, variable);
  };

  return (
    <IonPage>
      {/* <Header title="My app" /> */}
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
              <IonItem
                button
                // onClick={() => onVariableChange(data.dataFieldId)}
              >
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
