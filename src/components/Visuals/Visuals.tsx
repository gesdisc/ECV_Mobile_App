import React, { useState, useRef } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";

import {
  TimeSeriesDataRow,
  TimeSeriesMetadata,
} from "../../types/time-series.types";
import { useDataParams } from "../../store/DataParamsContext";
import { fetchData } from "../../services/api/time-series";
import { formatDate } from "../../utils/date";
import catalog from "../Catalog/catalog.json";

import Header from "../Layout/Header";
import DatePicker from "../UI/DatePicker";
import TimeSeriesPlot from "./TimeSeriesPlot";

import "./Plot.css";

const Visuals: React.FC = () => {
  const {
    latitude,
    longitude,
    beginTime,
    endTime,
    variable,
    setEndTime,
    setBeginTime,
  } = useDataParams();
  const abortController = useRef<AbortController | null>(null);
  const [data, setData] = useState<TimeSeriesDataRow[]>([]);
  const [metaData, setMetaData] = useState<TimeSeriesMetadata | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentVariableData = catalog.find(
    (data) => data.dataFieldId === variable
  );

  const cancelRequest = () =>
    abortController.current && abortController.current.abort();

  const plotDataHandler = async () => {
    setIsLoading(true);
    setData([]);
    setMetaData(undefined);
    setError(null);
    abortController.current = new AbortController();

    try {
      const data = await fetchData(
        {
          variable,
          begin_time: beginTime,
          end_time: endTime,
          lat: latitude,
          lon: longitude,
        },
        abortController.current.signal
      );

      const plotData = data?.data;
      const meta = data?.metadata;

      if (!Array.isArray(plotData) || !plotData.length) {
        throw new Error("Couldn't Find Data!");
      }

      setMetaData(meta);
      setData(plotData);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const beginDateUpdateHandler = (selectedDate: string) =>
    setBeginTime(selectedDate);
  const endDateUpdateHandler = (selectedDate: string) =>
    setEndTime(selectedDate);

  return (
    <IonPage>
      <Header title="Time Series Data" />
      <IonContent className="ion-padding">
        <IonAlert
          isOpen={isLoading}
          trigger="present-alert"
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                cancelRequest();
              },
            },
          ]}
          message="Loading, please wait..."
          backdropDismiss={false}
        ></IonAlert>
        {error && (
          <IonAlert
            isOpen={abortController.current?.signal.aborted ? false : !!error}
            header="Error!"
            message={error}
            buttons={["OK"]}
            onDidDismiss={() => setError(null)}
          />
        )}
        {<TimeSeriesPlot metadata={metaData} data={data} />}
        <IonGrid>
          <IonRow>
            <DatePicker
              label="Select Start Date"
              defaultDate={beginTime}
              onDateUpdate={beginDateUpdateHandler}
              minDatetimeAllowed={currentVariableData?.dataProductBeginDateTime}
              maxDatetimeAllowed={endTime}
            />
            <DatePicker
              label="Select End Date"
              containerClass="ion-text-end"
              defaultDate={endTime}
              onDateUpdate={endDateUpdateHandler}
              minDatetimeAllowed={beginTime}
              maxDatetimeAllowed={currentVariableData?.dataProductEndDateTime}
            />
          </IonRow>
          <IonRow>
            <IonCol>
              <IonButton
                expand="block"
                fill="outline"
                onClick={plotDataHandler}
                disabled={isLoading}
              >
                {isLoading ? "Wait..." : "Plot Data"}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid>
          <IonRow>
            <IonCol
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <h3>Selected Parameters:</h3>
              <div>Variable: {variable}</div>
              <div>Begin time: {formatDate(beginTime)}</div>
              <div>End time: {formatDate(endTime)}</div>
              <div>
                Coordiantes: {latitude}, {longitude}
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Visuals;
