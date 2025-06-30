import React, { useEffect, useState, useRef } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { Network } from "@capacitor/network";

import { setItem, getItem, clearOldCache } from "../../services/indexDBService";
import {
  TimeSeriesDataRow,
  TimeSeriesMetadata,
  TimeSeriesData,
  DataParams,
} from "../../types/time-series.types";
import { useDataParams } from "../../store/DataParamsContext";
import { fetchData } from "../../services/api/time-series";
import { formatDate } from "../../utils/date";
import catalog from "../Catalog/catalog.json";

import Header from "../Layout/Header";
import DatePicker from "../UI/DatePicker";
import TimeSeriesPlot from "./TimeSeriesPlot";

import "./Plot.css";

import { parseTimeSeriesCsv } from "../../helpers/time-series";

/**
 * IndexDB API: a low-level API for client-side storage of significant amounts of structured data
 * https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 *
 * LocalForage uses IndexedDB as its primary storage backend.
 * IndexedDB offers more complex features and larger storage capacity than localStorage.
 * localForage provides a user-friendly layer over IndexedDB, making it easier to work with.
 * It offers a simple API that mimics the ease of use of localStorage.
 */
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
  const [stateData, setStateData] = useState<TimeSeriesDataRow[]>([]);
  const [stateMetadata, setStateMetaData] = useState<
    TimeSeriesMetadata | undefined
  >(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const currentVariableData = catalog.find(
    (data) => data.dataFieldId === variable
  );

  const cancelRequest = () =>
    abortController.current && abortController.current.abort();

  const beginDateUpdateHandler = (selectedDate: string) =>
    setBeginTime(selectedDate);

  const endDateUpdateHandler = (selectedDate: string) =>
    setEndTime(selectedDate);

  const getChunkOfData = (
    data: TimeSeriesDataRow[]
  ): Array<TimeSeriesDataRow> => {
    let chunkOfData: TimeSeriesDataRow[] = [];
    chunkOfData = data.filter(
      (varData) =>
        new Date(varData.timestamp).getTime() >=
          new Date(beginTime).getTime() &&
        new Date(varData.timestamp).getTime() <= new Date(endTime).getTime()
    );

    return chunkOfData;
  };

  /**
   * Plot Data clicked
   * check if variable exists
   *    if yes check if date range exists in the variable
   *      if yes vis the data
   *      if not send API request and get the chunk of data that doesn't exist in variable and store the new data
   *    if not store with variable id and vis
   *
   * Plot Data clicked
   *    check if variable exists in the storage
   *        if yes vis. the data based on selected date range
   *        if not fetch the entire dataset, store the data and vis. the selected date range
   *
   */
  const handlePlotData = async (useCache = true) => {
    const status = await Network.getStatus();
    const isOffline = !status.connected;

    const cacheKey = `CapacitorStorage.plotData_${beginTime}_${endTime}_${latitude}_${longitude}_data`;

    if (useCache || isOffline) {
      // console.log("Checking local storage for cached data with key:", cacheKey);
      const cachedData = await getItem(cacheKey);
      // console.log(cachedData);
      // if (cachedData) {
      //   setStateData(getChunkOfData(cachedData.data));
      //   setStateMetaData(cachedData.metadata);
      //   return;
      // }

      /**
       *
       */

      if (cachedData) {
        console.log("Using cached data with cachekey: ", cacheKey);
        setStateData(cachedData.data);
        setStateMetaData(cachedData.metadata);
        return;
      } else {
        console.log("No cached data found.");
        if (isOffline) {
          setAlertMessage(
            "You are offline and no cached data is available to plot."
          );
        }
      }
    }

    if (isOffline) {
      return;
    }

    setIsLoading(true);
    setStateData([]);
    setStateMetaData(undefined);
    setError(null);

    try {
      abortController.current = new AbortController();

      const selectedParameters: DataParams = {
        lat: latitude,
        lon: longitude,
        begin_time: beginTime,
        end_time: endTime,
        variable,
      };

      const csvData = await fetchData(
        selectedParameters,
        abortController.current.signal
      );

      if (csvData) {
        const { metadata, data } = parseTimeSeriesCsv(csvData);
        await setItem(cacheKey, { metadata, data });
        let chunkOfData: TimeSeriesDataRow[] = [];
        // timestamp is between the selected dates
        chunkOfData = data.filter(
          (varData) =>
            varData.timestamp >= beginTime && varData.timestamp <= endTime
        );
        setStateData(chunkOfData);
        setStateMetaData(metadata);
      }

      // caching newely received data??
      // if (workerRef.current) {
      //   console.log("data posted using workerRef: ", csvData);
      //   workerRef.current.postMessage(csvData);
      // }

      //       const plotData = data?.data;
      //       const meta = data?.metadata;

      //       if (!Array.isArray(plotData) || !plotData.length) {
      //         throw new Error("Couldn't Find Data!");
      //       }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        console.error("Unexpected error", error);
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Plot the latest cached data
   */
  // useEffect(() => {
  //   const checkCacheOnMount = async () => {
  //     const cacheKey = `CapacitorStorage.plotData_recent_data`;
  //     // console.log("Checking cache on mount with key:", cacheKey);

  //     const cachedData = await getItem(cacheKey);

  //     if (cachedData) {
  //       setStateData(cachedData.data);
  //       setStateMetaData(cachedData.metadata);
  //     } else {
  //       console.log("No cached data found.");
  //     }
  //   };

  //   /**
  //    * dataWorker.js formats CSV data in the background using Web Worker
  //    * more: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
  //    */
  //   if (typeof Worker !== "undefined") {
  //     workerRef.current = new Worker(
  //       new URL("./dataWorker.ts", import.meta.url)
  //     );

  //     workerRef.current.onmessage = (e) => {
  //       const { metadata, data } = e.data;

  //       setStateMetaData(metadata);
  //       setStateData(data);
  //       const cacheKey = `CapacitorStorage.plotData_recent_data`;
  //       clearOldCache().then(() => {
  //         setItem(cacheKey, { metadata, data });
  //       });
  //     };

  //     checkCacheOnMount();

  //     return () => {
  //       if (workerRef.current) {
  //         workerRef.current.terminate();
  //       }
  //     };
  //   }
  // }, []);

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
        {alertMessage && (
          <IonAlert
            isOpen={!!alertMessage}
            header="Alert"
            message={alertMessage}
            buttons={["OK"]}
            onDidDismiss={() => setAlertMessage(null)}
          />
        )}
        {<TimeSeriesPlot metadata={stateMetadata} data={stateData} />}
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
                onClick={() => handlePlotData(true)}
                disabled={isLoading}
              >
                {isLoading ? "Wait..." : "Plot Data"}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid>
          <IonRow>
            <IonCol>
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
