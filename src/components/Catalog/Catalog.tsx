import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonPage, IonLoading } from "@ionic/react";

import { fetchData } from "../../services/api/time-series-exp";

import Header from "../Layout/Header";
import Banner from "./Banner";
import Variables from "./Variables";

import "./Catalog.css";

// [
//     {
//         "topic": "Atmosphere",
//         "categories": ["Precipitation", "Water Vapor", "Aerosal Properties", "Cloud Properties", "Trace Gases"],
//         "variables": [

//         ]
//     }
// ]

const Catalog: React.FC = () => {
  const history = useHistory();

  const variableChangeHandler = (variable: string) => {
    history.push("/Plot", { variable });
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
