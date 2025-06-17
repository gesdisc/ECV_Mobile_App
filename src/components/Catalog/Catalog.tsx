import React from "react";
import { IonContent, IonPage } from "@ionic/react";

import { useDataParams } from "../../store/DataParamsContext";

import Header from "../Layout/Header";
import Banner from "./Banner";
import Variables from "./Variables";

const Catalog: React.FC = () => {
  const { setVariable } = useDataParams();

  const variableChangeHandler = (variable: string) => {
    setVariable(variable);
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
