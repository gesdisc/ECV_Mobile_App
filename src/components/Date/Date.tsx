import React, { useEffect, useState, useRef } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
  IonRange,
} from "@ionic/react";

import catalog from "../Catalog/catalog.json";
import { useDataParams } from "../../store/DataParamsContext";

import DatePicker from "../UI/DatePicker";
// import Header from "../Layout/Header";
import Banner from "../UI/Banner";

import styles from "./Date.module.css";

const Date = () => {
  const { beginTime, endTime, variable, setEndTime, setBeginTime } =
    useDataParams();

  const currentVariableData = catalog.find(
    (data) => data.dataFieldId === variable
  );

  const beginDateUpdateHandler = (selectedDate: string) =>
    setBeginTime(selectedDate);

  const endDateUpdateHandler = (selectedDate: string) =>
    setEndTime(selectedDate);

  return (
    <IonPage>
      {/* <Header title="Date Picker" /> */}
      <Banner />
      <IonContent className="ion-padding" fullscreen={true}>
        <IonGrid fixed className={styles["date-picker-container"]}>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" size-sm="6">
              <DatePicker
                label="Select Start Date"
                defaultDate={beginTime}
                onDateUpdate={beginDateUpdateHandler}
                minDatetimeAllowed={
                  currentVariableData?.dataProductBeginDateTime
                }
                maxDatetimeAllowed={endTime}
              />
            </IonCol>
            <IonCol size="12" size-sm="6">
              <DatePicker
                label="Select End Date"
                containerClass="ion-text-end"
                defaultDate={endTime}
                onDateUpdate={endDateUpdateHandler}
                minDatetimeAllowed={beginTime}
                // maxDatetimeAllowed={currentVariableData?.dataProductEndDateTime}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Date;
