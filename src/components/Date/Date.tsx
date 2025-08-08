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

import DatePicker from "../UI/DatePicker";
import { useDataParams } from "../../store/DataParamsContext";
import Header from "../Layout/Header";

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
      <Header title="Date Picker" />
      <IonContent className="ion-padding">
        <IonRow>
          <IonCol>
            <DatePicker
              label="Select Start Date"
              defaultDate={beginTime}
              onDateUpdate={beginDateUpdateHandler}
              minDatetimeAllowed={currentVariableData?.dataProductBeginDateTime}
              maxDatetimeAllowed={endTime}
            />
          </IonCol>
          <IonCol>
            <DatePicker
              label="Select End Date"
              containerClass="ion-text-end"
              defaultDate={endTime}
              onDateUpdate={endDateUpdateHandler}
              minDatetimeAllowed={beginTime}
              maxDatetimeAllowed={currentVariableData?.dataProductEndDateTime}
            />
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default Date;
