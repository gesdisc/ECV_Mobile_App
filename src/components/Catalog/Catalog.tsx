import React from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonPage } from "@ionic/react";

import { TabMenuLabels } from "../../constants/time-series";
import { useDataParams } from "../../store/DataParamsContext";

import Header from "../Layout/Header";
import Banner from "./Banner";
import Variables from "./Variables";

import "./Catalog.css";

const Catalog: React.FC = () => {
  const { setVariable } = useDataParams();
  const history = useHistory();

  const variableChangeHandler = (variable: string) => {
    setVariable(variable);
    history.push(`/${TabMenuLabels.Visuals}`);
  };

  return (
    <IonPage>
      <Header title="My App" />
      <IonContent className="ion-padding">
        <Banner />
        <Variables onVariableChange={variableChangeHandler} />
      </IonContent>
    </IonPage>
  );
};

export default Catalog;
