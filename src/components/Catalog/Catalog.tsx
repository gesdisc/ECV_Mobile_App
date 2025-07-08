import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";

import { useDataParams } from "../../store/DataParamsContext";

import Header from "../Layout/Header";
import Banner from "./Banner";
import Variables from "./Variables";
import { TabMenuLabels } from "../../constants/ui";

const Catalog: React.FC = () => {
  const { setVariable } = useDataParams();
  const history = useHistory();

  const variableChangeHandler = (variable: string) => {
    setVariable(variable);
    history.push(`/${TabMenuLabels.PLOT}`);
  };

  return (
    <IonPage>
      <Header title="My app" />
      <IonContent className="ion-padding">
        <Banner />
        <Variables onVariableChange={variableChangeHandler} />
      </IonContent>
    </IonPage>
  );
};

export default Catalog;
