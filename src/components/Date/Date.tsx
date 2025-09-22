import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonPage, IonGrid, IonRow, IonCol } from "@ionic/react";

import catalog from "../Catalog/catalog.json";
import { useDataParams } from "../../store/DataParamsContext";
import { useToast } from "../../store/ToastContext";
import { TabMenuLabels } from "../../constants/ui";

import DatePicker from "../UI/DatePicker";
import Banner from "../UI/Banner";

import styles from "./Date.module.css";

/**
 *
 * The component restricts selecting a start date that is after the end date
 * AND end date that is before the start date
 *
 * Minimum allowed date of a variable can be found in catalog.json
 *
 */
const Date = () => {
  const { beginTime, endTime, variable, setEndTime, setBeginTime } =
    useDataParams();
  const { showToast } = useToast();
  const history = useHistory();

  const currentVariableData = catalog.find(
    (data) => data.dataFieldId === variable
  );

  const beginDateUpdateHandler = (selectedDate: string) =>
    setBeginTime(selectedDate);

  // const beginDateUpdateHandler = (selectedDate: string) => {
  //   if (selectedDate.split("T")[0] !== beginTime.split("T")[0]) {
  //     showToast({
  //       isOpen: true,
  //       message: "Date Change detected",
  //       color: "primary",
  //       buttons: [
  //         {
  //           text: "Replot",
  //           role: "confirm",
  //           handler: () => setBeginTime(selectedDate),
  //         },
  //         {
  //           text: "Dismiss",
  //           role: "cancel",
  //         },
  //       ],
  //     });
  //   }
  // };

  const endDateUpdateHandler = (selectedDate: string) => {
    if (selectedDate.split("T")[0] !== endTime.split("T")[0]) {
      showToast({
        isOpen: true,
        message: "Date Change detected",
        color: "primary",
        buttons: [
          {
            text: "Replot",
            role: "confirm",
            handler: () => {
              setEndTime(selectedDate);
              history.push(`/${TabMenuLabels.PLOT}`);
            },
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ],
      });
    }
  };

  return (
    <IonPage>
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
