import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonDatetime,
  IonButton,
  IonLoading,
  IonToast,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { useDataParams } from "../../store/DataParamsContext";
import { setItem, getItem, clearOldCache } from "../../services/indexDBService";
import { Network } from "@capacitor/network";

import { fetchData } from "../../services/api/time-series-exp";

import {
  TimeSeriesDataRow,
  TimeSeriesData,
  TimeSeriesMetadata,
  CacheData,
  LocationState,
} from "../../services/api/time-series.types";
import { formatDate } from "../utils/Date";

import Header from "../Layout/Header";
import DatePicker from "../UI/DatePicker";
import TimeSeries from "./TimeSeries";

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
    // setVariable,
  } = useDataParams();

  // const [data, setData] = useState<{ date: string; value: number }[]>([]);
  // const [metaData, setMetaData] = useState<TimeSeriesDataRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // const [toastMessage, setToastMessage] = useState<string>("");
  // const workerRef = useRef<Worker | null>(null);
  // const [plotReady, setPlotReady] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // experimental
  const [expData, setExpData] = useState<TimeSeriesDataRow[] | undefined>([]);

  // const fetchData = async (start: Date, end: Date, useCache = true) => {
  //   const cacheKey = `CapacitorStorage.plotData_${start.toISOString()}_${end.toISOString()}_${latitude || defaultLatitude}_${longitude || defaultLongitude}_data`;

  //   console.log('Checking network status...');
  //   const status = await Network.getStatus();
  //   const isOffline = !status.connected;

  //   if (useCache || isOffline) {
  //     console.log('Checking local storage for cached data with key:', cacheKey);
  //     const cachedData = await getItem(cacheKey);
  //     if (cachedData) {
  //       console.log('Using cached data.');
  //       setData(cachedData.data);
  //       setMetaData(cachedData.metaData);
  //       setPlotReady(true);
  //       return;
  //     } else {
  //       console.log('No cached data found.');
  //       if (isOffline) {
  //         setAlertMessage("You are offline and no cached data is available to plot.");
  //       }
  //     }
  //   }

  //   if (isOffline) {
  //     return;
  //   }

  //   console.log('Fetching data with the following parameters:');
  //   console.log('Latitude:', latitude || defaultLatitude);
  //   console.log('Longitude:', longitude || defaultLongitude);
  //   console.log('Start Date:', start.toISOString());
  //   console.log('End Date:', end.toISOString());

  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const url = 'http://localhost:9000/hydro1/daac-bin/access/timeseries.cgi';
  //     const params = {
  //       variable: 'GPM:GPM_3IMERGHH_06:precipitationCal',
  //       startDate: start.toISOString().split('T')[0] + 'T00',
  //       endDate: end.toISOString().split('T')[0] + 'T00',
  //       location: `GEOM:POINT(${longitude || defaultLongitude},%20${latitude || defaultLatitude})`,
  //       type: 'asc2',
  //     };

  //     const fullRequestUrl = `${url}?variable=${params.variable}&startDate=${params.startDate}&endDate=${params.endDate}&location=${params.location}&type=${params.type}`;
  //     // console.log('Request URL:', fullRequestUrl);

  //     // NEW API
  //     // https://api.giovanni.earthdata.nasa.gov/timeseries?data=GPM_3IMERGDF_07_precipitation&location=[29.75,-89.14]&time=2019-01-01T00:00:00/2020-01-01T00:00:00
  //     // const fullRequestUrl = `https://api.giovanni.earthdata.nasa.gov/proxy-timeseries?data=GPM_3IMERGDF_07_precipitation&location=[29.75,-89.14]&time=2019-01-01T00:00:00/2020-01-01T00:00:00`;
  //     const response = await axios.get(fullRequestUrl);
  //     // console.log('API response:', response.data);

  //     if (response.data.includes('Metadata for Requested Time Series: prod_name=GPM_3IMERGHH_06 param_short_name=precipitationCal param_name= unit=')) {
  //       setData([]);
  //       setMetaData(null);
  //     } else if (workerRef.current) {
  //       workerRef.current.postMessage(response.data);
  //     }
  //   } catch (err) {
  //     if (err instanceof Error) {
  //       console.error('Error fetching data:', err);
  //       setError(err.message);
  //     } else {
  //       console.error('Unexpected error', err);
  //       setError('An unexpected error occurred');
  //     }
  //   } finally {
  //     setLoading(false);
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
  //       setPlotReady(true);
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
  //         setPlotReady(true);
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

  const handlePlotData = async () => {
    // const start = new Date(startDate);
    // const end = new Date(endDate);

    // if (start > end) {
    //   setAlertMessage("Your start-date cannot be after the end-date.");
    //   return;
    // }

    // fetchData(start, end, false);
    setExpData([]);
    try {
      setLoading(true);
      // setError(null);
      const data = await fetchData({
        variable,
        begin_time: beginTime,
        end_time: endTime,
        lat: latitude,
        lon: longitude,
      });
      // console.log("visuals: ", data);
      // TODO: check if data is empty
      const displayData = data?.data;
      setExpData(displayData);
      // console.log(data?.data[0].timestamp);
    } catch (error) {
      //  setError(error.message);
      console.log("Tab 3 Err: ", error);
    } finally {
      setLoading(false);
    }
  };

  const beginDateUpdateHandler = (selectedDate: string) =>
    setBeginTime(selectedDate);
  const endDateUpdateHandler = (selectedDate: string) =>
    setEndTime(selectedDate);

  if (error) {
    return <div>Error: {error}</div>;
  }

  /**
   * @GraphQl
   */
  // POST u2u5qu332rhmxpiazjcqz6gkdm.appsync-api.us-east-1.amazonaws.com/graphql
  // Headers:
  // Content-Type: application/json
  // x-api-key: da2-hg7462xbijdjvocfgx2xlxuytq
  // Body
  // {"query":"{\n  getVariables { variables { dataFieldId, dataFieldLongName } } }"}
  // const fetchCatalog = async () => {
  //   // prettier-ignore
  //   const query = {
  //     "query": "{\n  getVariables { variables { dataFieldId, dataFieldLongName } } }",
  //   };
  //   const requestOptions = {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "x-api-key": "da2-hg7462xbijdjvocfgx2xlxuytq",
  //     },
  //     body: JSON.stringify({ query }),
  //   };

  //   try {
  //     console.log("loading catalog data...");
  //     // setError(null);
  //     const response = await fetch(
  //       "u2u5qu332rhmxpiazjcqz6gkdm.appsync-api.us-east-1.amazonaws.com/graphql",
  //       requestOptions
  //     );
  //     console.log(response);
  //   } catch (error) {
  //     console.log("Catalog error: ", error);
  //   } finally {
  //     console.log("catalog data loaded...");
  //   }
  // };

  /**
   * @Data_Rods
   */
  // const fetchCatalog = async () => {
  //   const requestOptions = {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   };

  //   try {
  //     console.log("loading catalog data...");
  //     // setError(null);
  //     const response = await fetch(
  //       "https://lb.gesdisc.eosdis.nasa.gov/windmill/api/r/website/data-rods-variables"
  //     );
  //     const data = await response.json();
  //     const newCatalogItem = data.response.docs.filter(
  //       (v) => v["Variable.Id"] == "M2T1NXSLV_5_12_4_SLP"
  //     );
  //     console.log(newCatalogItem);
  //     console.log(newCatalogItem[0]);
  //     // type catType = {
  //     //   topic: string;
  //     //   category: string;
  //     //   variable: string;
  //     //   description: string;
  //     // };
  //     // const jsonObj: catType[] = catalog;
  //     // const newJSONCatalog = catalog;
  //     // console.log(newJSONCatalog);
  //     // newJSONCatalog.push(newCatalogItem[0]);
  //     // console.log(newJSONCatalog);
  //   } catch (error) {
  //     console.log("Catalog error: ", error);
  //   } finally {
  //     console.log("catalog data loaded...");
  //   }
  // };

  return (
    <IonPage>
      <Header title="Time Series Data" />
      <IonContent className="ion-padding">
        <IonLoading
          isOpen={loading}
          message={"Loading..."}
          spinner="circles"
          cssClass="custom-loading"
        />
        {/* <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || undefined}
          duration={5000}
          onDidDismiss={() => setToastMessage("")}
        /> */}
        {alertMessage && (
          <IonAlert
            isOpen={!!alertMessage}
            header="Alert"
            message={alertMessage}
            buttons={["OK"]}
            onDidDismiss={() => setAlertMessage(null)}
          />
        )}
        {/* {plotReady && metaData && data.length > 0 && (
          < TimeSeries />
        )} */}
        {expData && <TimeSeries metaData={expData} />}
        <IonGrid>
          <IonRow>
            <DatePicker
              label="Select Start Date"
              defaultDate="2009-03-27"
              onDateUpdate={beginDateUpdateHandler}
            />
            <DatePicker
              label="Select End Date"
              containerClass="ion-text-end"
              defaultDate="2010-11-23"
              onDateUpdate={endDateUpdateHandler}
            />
          </IonRow>
          <IonRow>
            <IonCol>
              <IonButton expand="block" fill="outline" onClick={handlePlotData}>
                Plot Data
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonGrid>
          <IonRow>
            <IonCol
              // size="9"
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
