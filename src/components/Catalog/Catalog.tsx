import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";

import { useDataParams } from "../../store/DataParamsContext";

// import Header from "../Layout/Header";
import Banner from "../UI/Banner";
import Variables from "./Variables";
import { TabMenuLabels } from "../../constants/ui";

const Catalog: React.FC = () => {
  const { setVariable } = useDataParams();
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
          <Variables onVariableChange={variableChangeHandler} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Catalog;
