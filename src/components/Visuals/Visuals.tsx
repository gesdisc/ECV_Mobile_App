import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  IonContent,
  IonPage,
  IonButton,
  IonLoading,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { useDataParams } from "../../store/DataParamsContext";
import { setItem, getItem, clearOldCache } from "../../services/indexDBService";
import { Network } from "@capacitor/network";

import { fetchData } from "../../services/api/time-series";

import {
  TimeSeriesDataRow,
  TimeSeriesData,
  TimeSeriesMetadata,
  CacheData,
  LocationState,
} from "../../services/api/time-series.types";
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
  // const workerRef = useRef<Worker | null>(null);
  // const [plotReady, setPlotReady] = useState<boolean>(false);
  // const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // const [timeSeriesData, setTimeSeriesData] = useState<
  //   TimeSeriesDataRow[] | undefined
  // >([]);

  const currentVariableData = catalog.find(
    (data) => data.dataFieldId === variable
  );

  // const fetchData = async (start: Date, end: Date, useCache = true) => {
  //   const cacheKey = `CapacitorStorage.plotData_${start.toISOString()}_${end.toISOString()}_${
  //     latitude || defaultLatitude
  //   }_${longitude || defaultLongitude}_data`;

  //   console.log("Checking network status...");
  //   const status = await Network.getStatus();
  //   const isOffline = !status.connected;

  //   if (useCache || isOffline) {
  //     console.log("Checking local storage for cached data with key:", cacheKey);
  //     const cachedData = await getItem(cacheKey);
  //     if (cachedData) {
  //       console.log("Using cached data.");
  //       setData(cachedData.data);
  //       setMetaData(cachedData.metaData);
  //       // setPlotReady(true);
  //       return;
  //     } else {
  //       console.log("No cached data found.");
  //       if (isOffline) {
  //         setAlertMessage(
  //           "You are offline and no cached data is available to plot."
  //         );
  //       }
  //     }
  //   }

  //   if (isOffline) {
  //     return;
  //   }

  //   console.log("Fetching data with the following parameters:");
  //   console.log("Latitude:", latitude || defaultLatitude);
  //   console.log("Longitude:", longitude || defaultLongitude);
  //   console.log("Start Date:", start.toISOString());
  //   console.log("End Date:", end.toISOString());

  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     const url = "http://localhost:9000/hydro1/daac-bin/access/timeseries.cgi";
  //     const params = {
  //       variable: "GPM:GPM_3IMERGHH_06:precipitationCal",
  //       startDate: start.toISOString().split("T")[0] + "T00",
  //       endDate: end.toISOString().split("T")[0] + "T00",
  //       location: `GEOM:POINT(${longitude || defaultLongitude},%20${
  //         latitude || defaultLatitude
  //       })`,
  //       type: "asc2",
  //     };

  //     const fullRequestUrl = `${url}?variable=${params.variable}&startDate=${params.startDate}&endDate=${params.endDate}&location=${params.location}&type=${params.type}`;
  //     // console.log('Request URL:', fullRequestUrl);

  //     const response = await axios.get(fullRequestUrl);
  //     // console.log('API response:', response.data);

  //     if (
  //       response.data.includes(
  //         "Metadata for Requested Time Series: prod_name=GPM_3IMERGHH_06 param_short_name=precipitationCal param_name= unit="
  //       )
  //     ) {
  //       setData([]);
  //       setMetaData(undefined);
  //     } else if (workerRef.current) {
  //       workerRef.current.postMessage(response.data);
  //     }
  //   } catch (err) {
  //     if (err instanceof Error) {
  //       console.error("Error fetching data:", err);
  //       setError(err.message);
  //     } else {
  //       console.error("Unexpected error", err);
  //       setError("An unexpected error occurred");
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   const checkCacheOnMount = async () => {
  //     const cacheKey = `CapacitorStorage.plotData_recent_data`;
  //     console.log("Checking cache on mount with key:", cacheKey);

  //     const cachedData = await getItem(cacheKey);
  //     if (cachedData) {
  //       console.log("Using cached data on mount.");
  //       setData(cachedData.data);
  //       setMetaData(cachedData.metaData);
  //       // setPlotReady(true);
  //     } else {
  //       console.log("No cached data found.");
  //     }
  //   };

  //   if (typeof Worker !== "undefined") {
  //     workerRef.current = new Worker(
  //       new URL("./dataWorker.js", import.meta.url)
  //     );
  //     workerRef.current.onmessage = (e) => {
  //       const { metaData, data } = e.data;
  //       // console.log('Worker data:', data);
  //       // console.log('Worker metaData:', metaData);
  //       setMetaData(metaData);
  //       setData(data);
  //       const cacheKey = `CapacitorStorage.plotData_recent_data`;
  //       clearOldCache().then(() => {
  //         setItem(cacheKey, { data, metaData });
  //         // setPlotReady(true);
  //       });
  //     };
  //   }

  //   checkCacheOnMount();

  //   return () => {
  //     if (workerRef.current) {
  //       workerRef.current.terminate();
  //     }
  //   };
  // }, []);

  // const abortRequestHandler = () => {
  //   controller.abort();
  //   console.log("canceled");
  // };
  // const controller = new AbortController();

  const cancelRequest = () =>
    abortController.current && abortController.current.abort();

  const plotDataHandler = async () => {
    // console.log("Using: _________");
    // console.log("variable: ", variable);
    // console.log("enddate: ", endTime);
    // console.log("begin time: ", beginTime);
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

      console.log("data in visuals: ", data);
      const plotData = data?.data;
      const meta = data?.metadata;

      // if (controller.signal.aborted) {
      //   console.log("aborted");
      //   return;
      // }

      if (!Array.isArray(plotData) || !plotData.length) {
        throw new Error("Couldn't Find Data!");
      }

      setMetaData(meta);
      setData(plotData);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.log("Request canceled by User");
        }

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
        {/* <IonLoading
          isOpen={isLoading}
          message={"Loading..."}
          spinner="circles"
          cssClass="custom-loading"
        /> */}
        <IonAlert
          isOpen={isLoading}
          // header="Loading..."
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
          onDidDismiss={({ detail }) =>
            console.log(`Dismissed with role: ${detail.role}`)
          }
        ></IonAlert>
        {error && (
          <IonAlert
            isOpen={!!error}
            header="Error!"
            message={error}
            buttons={["OK"]}
            onDidDismiss={() => setError(null)}
          />
        )}
        {/* {alertMessage && (
          <IonAlert
            isOpen={!!alertMessage}
            header="Alert"
            message={alertMessage}
            buttons={["OK"]}
            onDidDismiss={() => setAlertMessage(null)}
          />
        )} */}
        {/* {plotReady && metaData && data.length > 0 && (
          < TimeSeriesPlot />
        )} */}
        {data && <TimeSeriesPlot metadata={metaData} data={data} />}
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
