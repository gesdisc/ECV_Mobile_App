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
// import { useLocation } from "../../UpdateLocation";
import { setItem, getItem, clearOldCache } from "../../services/indexDBService";
import { Network } from "@capacitor/network";

import { fetchData } from "../../services/api/time-series-exp";

import {
  TimeSeriesDataRow,
  TimeSeriesData,
  TimeSeriesMetadata,
  MetaData,
  CacheData,
} from "../../services/api/time-series.types";

import { DefaultParams } from "../../constants/time-series";

import Header from "../Layout/Header";
import DatePicker from "../UI/DatePicker";
// import TimeSeries from './TimeSeries';

import "./Plot.css";

const variable = "GPM_3IMERGDF_07_precipitation";
const begin_time = "2019-01-01T00:00:00";
const end_time = "2020-01-01T00:00:00";
const lat = 29.75;
const lon = -89.14;

// the system will use the deafult params
// the system will check the internet connection first
// if there is no internet connection, the system will use the latest/cached data (w/ default params if user never )
const Visuals: React.FC = () => {
  // const { latitude, longitude } = useLocation();
  const location = useLocation();
  const state = location.state;
  console.log(state);
  // const {variable} = location.state;
  const [data, setData] = useState<{ date: string; value: number }[]>([]);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // const [toastMessage, setToastMessage] = useState<string>("");
  const workerRef = useRef<Worker | null>(null);
  const [plotReady, setPlotReady] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

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

    try {
      setLoading(true);
      // setError(null);
      const data = await fetchData({
        variable,
        begin_time,
        end_time,
        lat,
        lon,
      });
      console.log(data);
      // console.log(data?.data[0].timestamp);
    } catch (error) {
      //  setError(error.message);
      console.log("Tab 3 Err: ", error);
    } finally {
      setLoading(false);
    }
  };

  // const formatDate = (isoDateString: string) => {
  //   const date = new Date(isoDateString);
  //   return date.toISOString().split('T')[0];
  // };

  if (error) {
    return <div>Error: {error}</div>;
  }

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
        {/* { plotReady && metaData && <TimeSeries data={data} metaData={metaData} />} */}
        <IonGrid>
          <IonRow>
            <DatePicker label="Select Start Date" defaultDate="2009-03-27" />
            <DatePicker
              label="Select End Date"
              containerClass="ion-text-end"
              defaultDate="2010-11-23"
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
      </IonContent>
    </IonPage>
  );
};

export default Visuals;
