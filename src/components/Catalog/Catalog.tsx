import React, { useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";

import { TabMenuLabels } from "../../constants/ui";
import { getDate } from "../../utils/date";
import catalog from "./catalog.json";

import Banner from "../UI/Banner";
import Variables from "./Variables";
import InfoPanel from "../UI/InfoPanel";

const Catalog: React.FC = () => {
  const [variableId, setVariableId] = useState("");
  const history = useHistory();

  const currentVariable = catalog.find(
    (data) => data.dataFieldId === variableId
  );

  const variableChangeHandler = (variable: string) =>
    history.push(`/${TabMenuLabels.PLOT}`, variable);

  const variableInfoHandler = (dataFieldId: string) =>
    setVariableId(dataFieldId);

  const afterInfoPanelDismiss = () => setVariableId("");

  const variableInfo = {
    title: currentVariable?.label || "Invalid label",
    list: [
      {
        label: "Longname",
        value: currentVariable?.dataFieldLongName ?? "",
      },
      {
        label: "Shortname",
        value: currentVariable?.dataFieldShortName ?? "",
      },
      {
        label: "Units",
        value: currentVariable?.dataFieldUnits ?? "",
      },
      {
        label: "Spatial Resolution",
        value: currentVariable?.dataProductSpatialResolution ?? "",
      },
      {
        label: "Data Product Name",
        value: currentVariable?.dataProductShortName ?? "",
      },
      {
        label: "Data Product Version",
        value: currentVariable?.dataProductVersion ?? "",
      },
      {
        label: "Begin Datetime",
        value: currentVariable?.dataProductBeginDateTime
          ? getDate(currentVariable?.dataProductBeginDateTime)
          : "",
      },
      {
        label: "End Datetime",
        value: currentVariable?.dataProductEndDateTime
          ? getDate(currentVariable?.dataProductEndDateTime)
          : "",
      },
      {
        label: "Dataset Information",
        link: currentVariable?.dataProductDescriptionUrl,
      },
    ],
  };

  return (
    <IonPage>
      <IonContent>
        <Banner />
        <InfoPanel
          dataList={variableInfo}
          isOpen={!!variableId}
          afterDismiss={afterInfoPanelDismiss}
        />
        <div className="ion-padding">
          <Variables
            onVariableChange={variableChangeHandler}
            onRequestInfo={variableInfoHandler}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Catalog;
