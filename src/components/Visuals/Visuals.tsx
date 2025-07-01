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
import useCheckIndexedDBUsage from "../../hooks/useCheckIndexedDBUsage";
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

  const cancelRequest = () =>
    abortController.current && abortController.current.abort();

  const beginDateUpdateHandler = (selectedDate: string) =>
    setBeginTime(selectedDate);

  const endDateUpdateHandler = (selectedDate: string) =>
    setEndTime(selectedDate);

  const cacheTimeSeriesData = async (cachedData: TimeSeriesData) => {
    try {
      await setItem(PLOT_DATA_CACHE_KEY, cachedData);
      await setRecentDataKey(RECENT_DATA_CACHE_KEY, PLOT_DATA_CACHE_KEY);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Something went wrong while caching data: ${error.message}`
        );
      }
    }
  };

  const getCachedData = async (): Promise<TimeSeriesData | undefined> => {
    try {
      const cachedData = await getItem(PLOT_DATA_CACHE_KEY);

      if (!cachedData) return;
      await setRecentDataKey(RECENT_DATA_CACHE_KEY, PLOT_DATA_CACHE_KEY);

      return cachedData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Something went wrong while fetching data from IndexedDB: ${error.message}`
        );
      }
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

      if (!recentCachedData) return;
      setStateData(recentCachedData.data);
      setStateMetaData(recentCachedData.metadata);
    };
    checkCacheOnMount();
  }, []);

  /**
   *  workerRef.current.onmessage will work iff new data is requested using API
   *
   * dataWorker.js formats CSV data in the background using Web Worker
   * more: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
   */
  useEffect(() => {
    if (typeof Worker === "undefined") return;

    workerRef.current = new Worker(new URL("./dataWorker.ts", import.meta.url));
    workerRef.current.onmessage = (e) => {
      const { metadata, data } = e.data;

      if (!Array.isArray(data) || !data.length) {
        setAlertMessage(
          "Your request was successful but there is no enough data to plot."
        );
        return;
      }

      cacheTimeSeriesData({ metadata, data });
      setStateMetaData(metadata);
      setStateData(data);
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [PLOT_DATA_CACHE_KEY]);

  const handlePlotData = async () => {
    try {
      const status = await Network.getStatus();
      const isOffline = !status.connected;

      const cachedData = await getCachedData();
      if (cachedData) {
        setStateData(cachedData.data);
        setStateMetaData(cachedData.metadata);
        return;
      }

      if (isOffline) {
        setAlertMessage(
          "You are offline and no cached data is available to plot."
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      const selectedParameters: DataParams = {
        lat: latitude,
        lon: longitude,
        begin_time: beginTime,
        end_time: endTime,
        variable,
      };
      abortController.current = new AbortController();

      const csvData = await fetchData(
        selectedParameters,
        abortController.current.signal
      );

      if (!workerRef.current) {
        throw new Error("Something went wrong. Can't process the data!");
      }
      workerRef.current.postMessage(csvData);
    } catch (error) {
      error instanceof Error
        ? setError(error.message)
        : setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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
        <TimeSeriesPlot metadata={stateMetadata} data={stateData} />
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
            <IonCol>
              <h3>Default Parameters:</h3>
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
              <div>
                Approx. used space:{" "}
                {(usedSpace &&
                  totalSpace &&
                  ((usedSpace / totalSpace) * 100).toFixed(10)) ||
                  indexedDBUsageError}
                %
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Visuals;
