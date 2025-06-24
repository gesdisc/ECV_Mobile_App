import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonDatetime, IonButton, IonLoading, IonToast, IonAlert, IonGrid, IonRow, IonCol } from '@ionic/react';
import { useLocation } from '../UpdateLocation';
import { setItem, getItem, clearOldCache } from '../services/indexDBService';
import { Network } from '@capacitor/network';

interface MetaData {
  prod_name: string;
  param_short_name: string;
  param_name: string;
  unit: string;
  begin_time: string;
  end_time: string;
  lat: string;
  lon: string;
}

interface CacheData {
  data: { date: string; value: number }[];
  metaData: MetaData;
}

const Tab3: React.FC = () => {
  const { latitude, longitude } = useLocation();
  const defaultLatitude = 38.8951; // Default to Washington, DC
  const defaultLongitude = -77.0364; // Default to Washington, DC
  const [data, setData] = useState<{ date: string; value: number }[]>([]);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(new Date('2009-03-27').toISOString());
  const [endDate, setEndDate] = useState<string>(new Date('2010-11-23').toISOString());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const workerRef = useRef<Worker | null>(null);
  const [plotReady, setPlotReady] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const fetchData = async (start: Date, end: Date, useCache = true) => {
    const cacheKey = `CapacitorStorage.plotData_${start.toISOString()}_${end.toISOString()}_${latitude || defaultLatitude}_${longitude || defaultLongitude}_data`;

    console.log('Checking network status...');
    const status = await Network.getStatus();
    const isOffline = !status.connected;

    if (useCache || isOffline) {
      console.log('Checking local storage for cached data with key:', cacheKey);
      const cachedData = await getItem(cacheKey);
      if (cachedData) {
        console.log('Using cached data.');
        setData(cachedData.data);
        setMetaData(cachedData.metaData);
        setPlotReady(true);
        return;
      } else {
        console.log('No cached data found.');
        if (isOffline) {
          setAlertMessage("You are offline and no cached data is available to plot.");
        }
      }
    }

    if (isOffline) {
      return;
    }

    console.log('Fetching data with the following parameters:');
    console.log('Latitude:', latitude || defaultLatitude);
    console.log('Longitude:', longitude || defaultLongitude);
    console.log('Start Date:', start.toISOString());
    console.log('End Date:', end.toISOString());

    setLoading(true);
    setError(null);
    try {
      const url = 'http://localhost:9000/hydro1/daac-bin/access/timeseries.cgi';
      const params = {
        variable: 'GPM:GPM_3IMERGHH_07:precipitationCal',
        startDate: start.toISOString().split('T')[0] + 'T00',
        endDate: end.toISOString().split('T')[0] + 'T00',
        location: `GEOM:POINT(${longitude || defaultLongitude},%20${latitude || defaultLatitude})`,
        type: 'asc2',
      };

      const fullRequestUrl = `${url}?variable=${params.variable}&startDate=${params.startDate}&endDate=${params.endDate}&location=${params.location}&type=${params.type}`;
      console.log('Request URL:', fullRequestUrl);

      const response = await axios.get(fullRequestUrl);
      console.log('API response:', response.data);

      if (response.data.includes('Metadata for Requested Time Series: prod_name=GPM_3IMERGHH_07 param_short_name=precipitationCal param_name= unit=')) {
        setData([]);
        setMetaData(null);
      } else if (workerRef.current) {
        workerRef.current.postMessage(response.data);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } else {
        console.error('Unexpected error', err);
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkCacheOnMount = async () => {
      const cacheKey = `CapacitorStorage.plotData_recent_data`;
      console.log('Checking cache on mount with key:', cacheKey);

      const cachedData = await getItem(cacheKey);
      if (cachedData) {
        console.log('Using cached data on mount.');
        setData(cachedData.data);
        setMetaData(cachedData.metaData);
        setPlotReady(true);
      } else {
        console.log('No cached data found.');
      }
    };

    if (typeof Worker !== 'undefined') {
      workerRef.current = new Worker(new URL('./dataWorker.js', import.meta.url));
      workerRef.current.onmessage = (e) => {
        const { metaData, data } = e.data;
        console.log('Worker data:', data);
        console.log('Worker metaData:', metaData);
        setMetaData(metaData);
        setData(data);
        const cacheKey = `CapacitorStorage.plotData_recent_data`;
        clearOldCache().then(() => {
          setItem(cacheKey, { data, metaData });
          setPlotReady(true);
        });
      };
    }

    checkCacheOnMount();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const handlePlotData = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setAlertMessage("Your start-date cannot be after the end-date.");
      return;
    }

    console.log('Plot data clicked: Fetching data...');
    fetchData(start, end, false);
  };

  const formatDate = (isoDateString: string) => {
    const date = new Date(isoDateString);
    return date.toISOString().split('T')[0];
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ backgroundColor: '#0b3d91' }}>
          <IonTitle>Time Series Data</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading
          isOpen={loading}
          message={'Loading...'}
          spinner="circles"
          cssClass="custom-loading"
        />
        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || undefined}
          duration={5000}
          onDidDismiss={() => setToastMessage('')}
        />
        {alertMessage && (
          <IonAlert
            isOpen={!!alertMessage}
            header="Alert"
            message={alertMessage}
            buttons={['OK']}
            onDidDismiss={() => setAlertMessage(null)}
          />
        )}
        {plotReady && metaData && data.length > 0 && (
          <Plot
            data={[
              {
                x: data.map(d => d.date),
                y: data.map(d => d.value),
                type: 'scatter',
                mode: 'lines',
                line: { color: 'blue' },
                name: metaData.param_short_name || 'Precipitation',
              },
            ]}
            layout={{
              title: `${metaData.param_name || 'Precipitation'} (${metaData.prod_name})`,
              xaxis: { 
                title: 'Date & Time',
                rangeslider: { visible: false },
                rangeselector: {
                  buttons: [
                    {
                      count: 1,
                      label: '1m',
                      step: 'month',
                      stepmode: 'backward'
                    },
                    {
                      count: 6,
                      label: '6m',
                      step: 'month',
                      stepmode: 'backward'
                    },
                    { step: 'all' }
                  ]
                }
              },
              yaxis: { title: `${metaData.param_short_name || 'Precipitation'} (${metaData.unit || 'mm/hr'})` },
              showlegend: true,
              legend: { x: 0, y: 1 },
              annotations: [
                {
                  xref: 'paper',
                  yref: 'paper',
                  x: 0,
                  xanchor: 'left',
                  y: 1,
                  yanchor: 'bottom',
                  text: `Lat: ${metaData.lat}, Lon: ${metaData.lon}`,
                  showarrow: false,
                },
              ],
              margin: { t: 40, b: 60 }
            }}
            style={{ width: '100%', height: '400px' }}
            config={{ responsive: true }}
          />
        )}
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton color="primary" onClick={() => setShowStartDatePicker(true)}>Select Start Date</IonButton>
              {showStartDatePicker && (
                <IonDatetime
                  presentation="date"
                  value={startDate}
                  onIonChange={e => {
                    setStartDate(e.detail.value as string);
                    setShowStartDatePicker(false);
                  }}
                />
              )}
            </IonCol>
            <IonCol className="ion-text-end">
              <IonButton color="primary" onClick={() => setShowEndDatePicker(true)}>Select End Date</IonButton>
              {showEndDatePicker && (
                <IonDatetime
                  presentation="date"
                  value={endDate}
                  onIonChange={e => {
                    setEndDate(e.detail.value as string);
                    setShowEndDatePicker(false);
                  }}
                />
              )}
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonButton expand="block" fill="outline" onClick={handlePlotData}>Plot Data</IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
      <style>{`
        .custom-loading {
          --background: #e3edff;
          --spinner-color: #1c6dff;
          color: #1c6dff;
        }
        .ion-padding {
          --background: #ffffff;
        }
        ion-toolbar {
          --background: #0b3d91;
        }
        ion-title {
          --color: white;
        }
        ion-button {
          margin: 10px 0;
        }
      `}</style>
    </IonPage>
  );
};

export default Tab3;
