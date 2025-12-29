import React from "react";
import { IonContent, IonPage, IonGrid, IonRow, IonCol } from "@ionic/react";
import { IonDatetime, DatetimeChangeEventDetail } from "@ionic/react";

import catalog from "../Catalog/catalog.json";
import { useDataParams } from "../../store/DataParamsContext";
import { toStartOfDay } from "../../utils/date";

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
  const {
    params: ctxParams,
    staged: stagedParams,
    requestUpdateParams,
  } = useDataParams();

  const currentVariableData = catalog.find(
    (data) => data.dataFieldId === ctxParams.variable
  );

  const beginDateUpdateHandler = (
    event: CustomEvent<DatetimeChangeEventDetail>
  ) => {
    requestUpdateParams({ begin_time: event.detail.value as string });
  };

  const endDateUpdateHandler = (
    event: CustomEvent<DatetimeChangeEventDetail>
  ) => {
    requestUpdateParams({ end_time: event.detail.value as string });
  };

  return (
    <IonPage>
      <Banner />
      <IonContent className="ion-padding" fullscreen={true}>
        <IonGrid fixed className={styles["date-picker-container"]}>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" size-sm="6">
              <IonDatetime
                presentation="date"
                value={toStartOfDay(
                  stagedParams.begin_time || ctxParams.begin_time
                )}
                onIonChange={beginDateUpdateHandler}
                min={currentVariableData?.dataProductBeginDateTime}
                max={toStartOfDay(stagedParams.end_time || ctxParams.end_time)}
                style={{ width: "100%" }}
              >
                <span slot="title">Select Start Date</span>
              </IonDatetime>
            </IonCol>
            <IonCol size="12" size-sm="6">
              <IonDatetime
                presentation="date"
                value={toStartOfDay(
                  stagedParams.end_time || ctxParams.end_time
                )}
                onIonChange={endDateUpdateHandler}
                min={toStartOfDay(
                  stagedParams.begin_time || ctxParams.begin_time
                )}
                style={{ width: "100%" }}
              >
                <span slot="title">Select End Date</span>
              </IonDatetime>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Date;
