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

/**
 * IndexDB API: a low-level API for client-side storage of significant amounts of structured data
 * https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 *
 * LocalForage uses IndexedDB as its primary storage backend. Think of it like this:
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
  const [data, setData] = useState<TimeSeriesDataRow[]>([]);
  const [metaData, setMetaData] = useState<TimeSeriesMetadata | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  // const [plotReady, setPlotReady] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  /**
   * Test caching
   */
  const defaultLatitude = 33.333;
  const defaultLongitude = 79.9;

  const currentVariableData = catalog.find(
    (data) => data.dataFieldId === variable
  );

  const fetchOldData = async (useCache = true) => {
    const cacheKey = `CapacitorStorage.plotData_${new Date(
      beginTime
    ).toISOString()}_${new Date(endTime).toISOString()}_${
      latitude || defaultLatitude
    }_${longitude || defaultLongitude}_data`;
    console.log("cacheKey: ", cacheKey);
    const status = await Network.getStatus();
    const isOffline = !status.connected;

    if (useCache || isOffline) {
      console.log("Checking local storage for cached data with key:", cacheKey);
      const cachedData = await getItem(cacheKey);
      if (cachedData) {
        console.log("Using cached data.");
        setData(cachedData.data);
        setMetaData(cachedData.metaData);
        // setPlotReady(true);
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

    // console.log("Fetching data with the following parameters:");
    // console.log("Latitude:", latitude || defaultLatitude);
    // console.log("Longitude:", longitude || defaultLongitude);
    // console.log("Start Date:", start.toISOString());
    // console.log("End Date:", end.toISOString());

    // Online???
    setIsLoading(true);
    setError(null);
    try {
      const bearerToken = null;
      // const { variable, lat, lon, begin_time, end_time } = dataParams;
      // URL https://8weebb031a.execute-api.us-east-1.amazonaws.com/SIT/?data=M2T1NXSLV_5_12_4_V50M&lat=40&lon=120&time_start=2024-03-05T00%3A00%3A00&time_end=2024-03-06T00%3A00%3A00
      const url = `https://8weebb031a.execute-api.us-east-1.amazonaws.com/SIT/?data=${variable}&lat=${latitude}&lon=${longitude}&time_start=${beginTime}&time_end=${endTime}`;

      const response = await fetch(url, {
        mode: "cors",
        // signal,
        headers: {
          Accept: "application/json",
          ...(bearerToken ? { Authorization: `Bearer: ${bearerToken}` } : {}),
        },
      });

      if (!response.ok) throw new Error("NEW API: failed to fetch");

      const csvData = await response.text();
      console.log(csvData);

      if (workerRef.current) {
        console.log("data posted using workerRef: ", csvData);
        workerRef.current.postMessage(csvData);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } else {
        console.error("Unexpected error", err);
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * The app should check the cached data first (on mount)
   * @BUG cachedData.data returns empty array
   *  cachedData.metadata has values
   *
   * Plot the latest cached data
   */
  useEffect(() => {
    const checkCacheOnMount = async () => {
      const cacheKey = `CapacitorStorage.plotData_recent_data`;
      // console.log("Checking cache on mount with key:", cacheKey);

      const cachedData = await getItem(cacheKey);
      console.log("cached data: ", cachedData);
      if (cachedData) {
        console.log("Using cached data on mount.");
        setData(cachedData.data);
        setMetaData(cachedData.metaData);
        // setPlotReady(true);
      } else {
        console.log("No cached data found.");
      }
    };

    /**
     * dataWorker.js formats CSV data in the background using Web Worker
     * more: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
     */

    if (typeof Worker !== "undefined") {
      workerRef.current = new Worker(
        new URL("./dataWorker.ts", import.meta.url)
      );
      console.log(workerRef.current);
      workerRef.current.onmessage = (e) => {
        console.log("Worker eeee:", e);

        const { metaData, data } = e.data;
        console.log("Worker data:", data);
        console.log("Worker metaData:", metaData);
        setMetaData(metaData);
        setData(data);
        const cacheKey = `CapacitorStorage.plotData_recent_data`;
        clearOldCache().then(() => {
          console.log("setting data: ", data);
          setItem(cacheKey, { data, metaData });
          // setPlotReady(true);
        });
      };

      checkCacheOnMount();

      return () => {
        if (workerRef.current) {
          workerRef.current.terminate();
        }
      };
    }
  }, []);

  const handlePlotData = () => {
    // const start = new Date(beginTime);
    // const end = new Date(endTime);

    // if (start > end) {
    //   setAlertMessage("Your start-date cannot be after the end-date.");
    //   return;
    // }

    console.log("Plot data clicked: Fetching data...");
    fetchOldData(false);
  };

  const cancelRequest = () =>
    abortController.current && abortController.current.abort();

  // const fetchOldData = async () => {
  //   const status = await Network.getStatus();
  //   const isOffline = !status.connected;
  //   setIsLoading(true);
  //   setData([]);
  //   setMetaData(undefined);
  //   setError(null);
  //   abortController.current = new AbortController();

  //   if (!isOffline) {
  //     try {
  //       const data = await fetchData(
  //         {
  //           variable,
  //           begin_time: beginTime,
  //           end_time: endTime,
  //           lat: latitude,
  //           lon: longitude,
  //         },
  //         abortController.current.signal
  //       );

  //       const plotData = data?.data;
  //       const meta = data?.metadata;

  //       if (!Array.isArray(plotData) || !plotData.length) {
  //         throw new Error("Couldn't Find Data!");
  //       }

  //       setMetaData(meta);
  //       setData(plotData);
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         setError(error.message);
  //       }
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }
  // };

  const beginDateUpdateHandler = (selectedDate: string) =>
    setBeginTime(selectedDate);
  const endDateUpdateHandler = (selectedDate: string) =>
    setEndTime(selectedDate);
  console.log("metaData: ", metaData);
  console.log("data: ", data);
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
                onClick={handlePlotData}
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
