import React, { useEffect, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";

import { VariableWithLabel } from "../../data/browse-variables.types";
import { TabMenuLabels } from "../../constants/ui";
import { getDate } from "../../utils/date";
import { getAllData, IndexedDbStores } from "../../data/localforage";

import Banner from "../UI/Banner";
import Variables from "./Variables";
import InfoPanel from "../UI/InfoPanel";

const Catalog: React.FC = () => {
  const [variableId, setVariableId] = useState("");
  const [filteredVariables, setFilteredVariables] = useState<
    VariableWithLabel[]
  >([]);
  const history = useHistory();
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const currentVariable = filteredVariables.find(
    (data) => data.dataFieldId === variableId
  );

  const variableChangeHandler = (variable: string) =>
    history.push(`/${TabMenuLabels.PLOT}`, variable);

  const variableInfoHandler = (dataFieldId: string) =>
    setVariableId(dataFieldId);

  const afterInfoPanelDismiss = () => setVariableId("");

  useEffect(() => {
    const getCatalog = async () => {
      try {
        setIsLoadingCatalog(true);

        const cachedItems = await getAllData(IndexedDbStores.CATALOG);

        setFilteredVariables(cachedItems);
      } catch (error) {
        console.error("Error fetching catalog from IndexedDB:", error);
      } finally {
        setIsLoadingCatalog(false);
      }
    };
    getCatalog();
  }, []);

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
        label: "Product Name",
        value: currentVariable?.dataProductShortName ?? "",
      },
      {
        label: "Product Version",
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
          {/* TODO: USE LOADING SPINNER */}
          {isLoadingCatalog && <p>Loading catalog...</p>}
          {!isLoadingCatalog && filteredVariables.length === 0 ? (
            <p>Couldn&apos;t Find Catalog!</p>
          ) : (
            <Variables
              onVariableChange={variableChangeHandler}
              onRequestInfo={variableInfoHandler}
              catalog={filteredVariables}
            />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Catalog;
