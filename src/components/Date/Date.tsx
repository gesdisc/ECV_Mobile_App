import React from "react";
import { IonContent, IonPage, IonGrid, IonRow, IonCol } from "@ionic/react";
import { IonDatetime, DatetimeChangeEventDetail } from "@ionic/react";
import dayjs from "dayjs";

import { useDataParams } from "../../store/DataParamsContext";
import { getUTCStartOfDay } from "../../utils/date";
import useProductDetails from "../../hooks/useProductDetails";

import Banner from "../UI/Banner";

import styles from "./Date.module.css";
/**
 *
 * The component restricts selecting a start date that is after the end date
 * AND end date that is before the start date
 *
 *
 */
const Date: React.FC = () => {
  const {
    params: ctxParams,
    staged: stagedParams,
    requestUpdateParams,
  } = useDataParams();

  const selectedProductDetails = useProductDetails(ctxParams.variable);

  const beginDateUpdateHandler = (
    event: CustomEvent<DatetimeChangeEventDetail>
  ) => {
    requestUpdateParams({
      begin_time: getUTCStartOfDay(event.detail.value as string),
    });
  };

  const endDateUpdateHandler = (
    event: CustomEvent<DatetimeChangeEventDetail>
  ) => {
    requestUpdateParams({
      end_time: getUTCStartOfDay(event.detail.value as string),
    });
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
                value={stagedParams.begin_time || ctxParams.begin_time}
                onIonChange={beginDateUpdateHandler}
                min={selectedProductDetails?.dataProductBeginDateTime}
                max={stagedParams.end_time || ctxParams.end_time}
                style={{ width: "100%" }}
              >
                <span slot="title">Select Start Date</span>
              </IonDatetime>
            </IonCol>
            <IonCol size="12" size-sm="6">
              <IonDatetime
                presentation="date"
                value={stagedParams.end_time || ctxParams.end_time}
                onIonChange={endDateUpdateHandler}
                min={stagedParams.begin_time || ctxParams.begin_time}
                max={getUTCStartOfDay(dayjs())}
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
