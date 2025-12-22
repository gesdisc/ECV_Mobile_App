import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";

import { TabMenuLabels } from "../../constants/ui";

import Banner from "../UI/Banner";
import Variables from "./Variables";

const Catalog: React.FC = () => {
  const history = useHistory();

  const variableChangeHandler = (variable: string) => {
    history.push(`/${TabMenuLabels.PLOT}`, variable);
  };

  return (
    <IonPage>
      <IonContent>
        <Banner />
        <div className="ion-padding">
          <Variables onVariableChange={variableChangeHandler} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Catalog;
