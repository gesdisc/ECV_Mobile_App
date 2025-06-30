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

import {
  setItem,
  getItem,
  clearOldCache,
  removeItem,
  setRecentDataKey,
  getRecentDataKey,
} from "../../services/indexDBService";
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
import useCheckIndexedDBUsage from "../../hooks/useCheckIndexedDBUsage";

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
  const workerRef = useRef<Worker | null>(null);
  const [stateData, setStateData] = useState<TimeSeriesDataRow[]>([]);
  const [stateMetadata, setStateMetaData] = useState<
    TimeSeriesMetadata | undefined
  >(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const RECENT_DATA_CACHE_KEY = `CapacitorStorage.plotData_recent_data`;
  const PLOT_DATA_CACHE_KEY = `CapacitorStorage.plotData_${variable}_${beginTime}_${endTime}_${latitude}_${longitude}_data`;
  const currentVariableData = catalog.find(
    (data) => data.dataFieldId === variable
  );

  const {
    totalSpace,
    usedSpace,
    error: indexedDBUsageError,
  } = useCheckIndexedDBUsage();
  console.log(
    "Approx used space %:",
    usedSpace && totalSpace && (usedSpace / totalSpace) * 100,
    "%"
  );
  const cancelRequest = () =>
    abortController.current && abortController.current.abort();

  const beginDateUpdateHandler = (selectedDate: string) =>
    setBeginTime(selectedDate);

  const endDateUpdateHandler = (selectedDate: string) =>
    setEndTime(selectedDate);

  const replaceRecentCachedData = (cachedData: TimeSeriesData) => {
    setStateMetaData(cachedData.metadata);
    setStateData(cachedData.data);
    setRecentDataKey(RECENT_DATA_CACHE_KEY, PLOT_DATA_CACHE_KEY).then(() => {
      console.log("successfluy replaced old 'Recent Data'");
    });
  };

  const handlePlotData = async (useCache = true) => {
    const status = await Network.getStatus();
    const isOffline = !status.connected;

    // should check the recent data first
    if (useCache || isOffline) {
      const cachedData = await getItem(PLOT_DATA_CACHE_KEY);

      if (cachedData) {
        replaceRecentCachedData(cachedData);
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

    // setStateData([]);
    // setStateMetaData(undefined);
    setIsLoading(true);
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

      // if (csvData) {
      //   const { metadata, data } = parseTimeSeriesCsv(csvData);
      //   await setItem(cacheKey, { metadata, data });
      //   setStateData(data);
      //   setStateMetaData(metadata);
      // }

      // caching newely received data??
      // this takes care of state update??
      if (workerRef.current) {
        console.log("data posted using workerRef: ", csvData);
        workerRef.current.postMessage(csvData);
      }
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
  useEffect(() => {
    const checkCacheOnMount = async () => {
      const recentCachedDataKey = await getRecentDataKey(RECENT_DATA_CACHE_KEY);
      const recentCachedData =
        recentCachedDataKey && (await getItem(recentCachedDataKey));

      if (recentCachedData) {
        setStateData(recentCachedData.data);
        setStateMetaData(recentCachedData.metadata);
      } else {
        console.log("No cached data found.");
      }
    };

    checkCacheOnMount();
  }, []);

  /**
   * this has to work iff new data is requested using CG API
   */
  useEffect(() => {
    if (typeof Worker !== "undefined") {
      workerRef.current = new Worker(
        new URL("./dataWorker.ts", import.meta.url)
      );

      /**
       * dataWorker.js formats CSV data in the background using Web Worker
       * more: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
       */
      workerRef.current.onmessage = (e) => {
        const { metadata, data } = e.data;

        if (!Array.isArray(data) || !data.length) {
          setError(
            "Your request was seuccessful. There is no enough data to plot."
          );
          return;
        }

        setItem(PLOT_DATA_CACHE_KEY, { metadata, data }).then(() => {
          console.log("successfluy stored new data");
        });
        replaceRecentCachedData({ metadata, data });
      };

      return () => {
        if (workerRef.current) {
          workerRef.current.terminate();
        }
      };
    }
  }, []);

  // removeItem(
  //   "CapacitorStorage.plotData_GPM_3IMERGM_07_precipitation_2019-01-01T00:00:00_2020-01-01T00:00:00_38.8951_-77.0364_data"
  // );

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
            <IonCol>
              <h3>Currently Visualizing:</h3>
              <div>Variable: {stateMetadata?.prod_name}</div>
              {/* <div>Begin time: {formatDate(stateMetadata?.beginTime)}</div>
              <div>End time: {formatDate(endTime)}</div>
              <div>
                Coordiantes: {latitude}, {longitude}
              </div> */}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Visuals;
