import React, { useEffect, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";

import { VariableWithLabel } from "../../data/browse-variables.types";
import { TabMenuLabels } from "../../constants/ui";
import { getDate } from "../../utils/date";
import { getAllData, IndexedDbStores } from "../../data/localforage";

// import { fetchAndCacheCatalog } from "../../data/queryClient";
import { useCatalogQuery } from "../../data/useCatalogQuery";

import Banner from "../UI/Banner";
import Variables from "./Variables";
import InfoPanel from "../UI/InfoPanel";

const Catalog: React.FC = () => {
  const [variableId, setVariableId] = useState("");
  const history = useHistory();
  const { data: catalog = [], isLoading, isFetching } = useCatalogQuery();
  console.log("Catalog data:", catalog);
  const currentVariable = catalog.find(
    (data) => data.dataFieldId === variableId
  );

  console.log("isFetching:", isFetching);
  console.log("isLoading:", isLoading);

  //   const getCatalog = async () => {
  //   try {
  //     setIsLoadingCatalog(true);

  //     const cachedItems = await getAllData(IndexedDbStores.CATALOG);
  //     console.log("Fetched catalog from IndexedDB:", cachedItems);
  //     setCatalog(cachedItems);
  //     setHydrated(true);
  //   } catch (error) {
  //     console.error("Error fetching catalog from IndexedDB:", error);
  //   } finally {
  //     setIsLoadingCatalog(false);
  //   }
  // };

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
          {isLoading && <p>Loading catalog...</p>}
          {!isLoading && catalog.length === 0 ? (
            <p>Couldn&apos;t Find Catalog!</p>
          ) : (
            <Variables
              onVariableChange={variableChangeHandler}
              onRequestInfo={variableInfoHandler}
              catalog={catalog}
            />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Catalog;
