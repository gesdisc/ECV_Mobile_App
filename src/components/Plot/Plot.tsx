import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonAlert,
  IonIcon,
  RangeCustomEvent,
  IonCol,
  IonGrid,
  IonRow,
} from "@ionic/react";
import { server } from "ionicons/icons";
// import { Network } from "@capacitor/network";
import { useLocation } from "react-router-dom";

import {
  TimeSeriesDataRow,
  TimeSeriesMetadata,
  DataParams,
} from "../../types/time-series.types";
import { useDataParams } from "../../store/DataParamsContext";
import { DefaultParams } from "../../constants/time-series";
import { convertToLocalDate } from "../../utils/date";

import TerraTimeSeries, {
  TerraTimeSeriesDataChangeEvent,
} from "@nasa-terra/components/dist/react/time-series";
import TerraTimeAverageMap from "@nasa-terra/components/dist/react/time-average-map";
import Slider from "./Slider";
import StorageManager from "./Storage/StorageManager";
import Banner from "../UI/Banner";

import "./Plot.css";

const Visuals: React.FC = () => {
  const [stateData, setStateData] = useState<TimeSeriesDataRow[]>([]);
  const [stateMetadata, setStateMetaData] = useState<
    TimeSeriesMetadata | undefined
  >(undefined);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(0);

  const {
    latitude: selectedLat,
    longitude: selectedLon,
    beginTime: selectedBeginTime,
    endTime: selectedEndTime,
    variable: selectedVariable,
    setVariable,
    setLatitude,
    setLongitude,
    setBeginTime,
    setEndTime,
  } = useDataParams();

  const location = useLocation();
  const categoryPageVariable = location.state;

  /**
   *
   * will only work when the user selects a variable on the catalog page
   * Uses default parameters and user selected variable
   *
   */
  useEffect(() => {
    if (!categoryPageVariable) return;

    handlePlotData({
      lat: DefaultParams.LATITUDE,
      lon: DefaultParams.LONGITUDE,
      begin_time: DefaultParams.BEGIN_TIME,
      end_time: DefaultParams.END_TIME,
      variable: categoryPageVariable as string,
    });
  }, [categoryPageVariable]);

  const handlePlotData = ({
    lat,
    lon,
    begin_time,
    end_time,
    variable,
  }: DataParams) => {
    // const status = await Network.getStatus();
    // const isOffline = !status.connected;

    // TODO: Check internet connection before setting data parameters
    // if (isOffline) {
    //   setAlertMessage(
    //     "You are offline and no cached data is available to plot."
    //   );
    //   return;
    // }

    setLatitude(lat);
    setLongitude(lon);
    setVariable(variable);
    setBeginTime(begin_time);
    setEndTime(end_time);
  };

  const sliderValueChangeHandler = (e: RangeCustomEvent) => {
    if (!stateData.length) return;
    const activeIndex = Number(e.detail.value);
    setSliderValue(activeIndex);
  };

  const sliderLeftBtnHandler = () => {
    if (stateData.length === 0) return;
    if (sliderValue === 0) return;
    setSliderValue((prevNum) => prevNum - 1);
  };

  const sliderRightBtnHandler = () => {
    if (stateData.length === 0) return;
    if (sliderValue === stateData.length - 1) return;
    setSliderValue((prevNum) => prevNum + 1);
  };

  const plotCachedItemHandler = (newParams: DataParams) => {
    handlePlotData({
      lat: newParams.lat,
      lon: newParams.lon,
      begin_time: newParams.begin_time,
      end_time: newParams.end_time,
      variable: newParams.variable,
    });
  };

  // Emitted whenever time series data has been fetched from Giovanni. Or zoomed in/out.
  const timeSeriesDataChangeHandler = (e: TerraTimeSeriesDataChangeEvent) => {
    console.log(e);
    setStateData(e.detail.data.data);
    setStateMetaData(e.detail.data.metadata);
  };

  // Emitted whenever the date range is modified
  const timeSeriesDateRangeChangeHandler = (e: CustomEvent) => {
    console.log(e);
  };

  return (
    <IonPage>
      <IonContent fullscreen={true}>
        <Banner>
          <IonButton slot="end" size="small" id="storage-manager">
            <IonIcon aria-hidden="true" size="medium" icon={server} />
          </IonButton>
        </Banner>
        <div className="ion-padding">
          <StorageManager onPlot={plotCachedItemHandler} />
          {alertMessage && (
            <IonAlert
              isOpen={!!alertMessage}
              header="Oops!"
              message={alertMessage}
              buttons={["OK"]}
              onDidDismiss={() => setAlertMessage(null)}
            />
          )}
          <IonGrid fixed>
            <IonRow>
              {/* <IonCol size="12">
                <TerraTimeAverageMap
                  style={{
                    height: "300px",
                  }}
                ></TerraTimeAverageMap>
              </IonCol> */}

              <IonCol size="12">
                <TerraTimeSeries
                  onTerraDateRangeChange={timeSeriesDateRangeChangeHandler}
                  onTerraTimeSeriesDataChange={timeSeriesDataChangeHandler}
                  variableEntryId={selectedVariable}
                  start-date={selectedBeginTime.replace(
                    /(\d{4})-(\d{2})-(\d{2}).*/,
                    "$2/$3/$1"
                  )}
                  end-date={selectedEndTime.replace(
                    /(\d{4})-(\d{2})-(\d{2}).*/,
                    "$2/$3/$1"
                  )}
                  location={`${selectedLat},${selectedLon}`}
                ></TerraTimeSeries>
              </IonCol>
              <IonCol
                size="12"
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {stateData.length !== 0 && (
                  <Slider
                    onLeftBtnClick={sliderLeftBtnHandler}
                    onRightBtnClick={sliderRightBtnHandler}
                    value={sliderValue}
                    max={stateData.length - 1}
                    min={0}
                    onValueChange={sliderValueChangeHandler}
                    pinFormatter={(index: number) =>
                      stateData[index]?.timestamp
                        ? `${convertToLocalDate(stateData[index].timestamp)}, ${
                            stateData[index].value
                          }`
                        : "Oops!"
                    }
                    disabled={!stateData.length}
                  />
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonButton
            expand="block"
            onClick={() =>
              handlePlotData({
                lat: selectedLat,
                lon: selectedLon,
                begin_time: selectedBeginTime,
                end_time: selectedEndTime,
                variable: selectedVariable,
              })
            }
          >
            {"Plot Data"}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Visuals;
