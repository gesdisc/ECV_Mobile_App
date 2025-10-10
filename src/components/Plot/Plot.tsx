import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  RangeCustomEvent,
  IonCol,
  IonGrid,
  IonRow,
} from "@ionic/react";
import { server } from "ionicons/icons";

import { useLocation } from "react-router-dom";

import { TimeSeriesDataRow, DataParams } from "../../types/time-series.types";
import { useDataParams } from "../../store/DataParamsContext";
import { DefaultParams } from "../../constants/time-series";
import { toLocalShortDateTime } from "../../utils/date";

import TerraTimeSeries, {
  TerraTimeSeriesDataChangeEvent,
} from "@nasa-terra/components/dist/react/time-series";
// import TerraTimeAverageMap from "@nasa-terra/components/dist/react/time-average-map";
import Slider from "./Slider";
import StorageManager from "./Storage/StorageManager";
import Banner from "../UI/Banner";

import "./Plot.css";

const Plot: React.FC = () => {
  const [stateData, setStateData] = useState<TimeSeriesDataRow[]>([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const { params: ctxParams, updateParams, setMetadata } = useDataParams();
  const location = useLocation();
  const catalogPageVariable = location.state;

  /**
   *
   * will only work when the user selects a variable on the catalog page
   * Uses default parameters and user selected variable
   *
   */
  useEffect(() => {
    if (!catalogPageVariable) return;

    updateParams({
      lat: DefaultParams.LATITUDE,
      lon: DefaultParams.LONGITUDE,
      begin_time: DefaultParams.BEGIN_TIME,
      end_time: DefaultParams.END_TIME,
      variable: catalogPageVariable as string,
    });
  }, [catalogPageVariable]);

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
    updateParams({
      lat: newParams.lat,
      lon: newParams.lon,
      begin_time: newParams.begin_time,
      end_time: newParams.end_time,
      variable: newParams.variable,
    });
  };

  // Emitted whenever time series data has been fetched from Giovanni. Or zoomed in/out.
  const timeSeriesDataChangeHandler = (e: TerraTimeSeriesDataChangeEvent) => {
    setStateData(e.detail.data.data);
    setMetadata(e.detail.data.metadata);
  };

  // Emitted whenever the date range is modified
  // const timeSeriesDateRangeChangeHandler = (e: CustomEvent) => {
  // };

  return (
    <IonPage>
      <IonContent fullscreen={true}>
        <Banner>
          <IonButton
            slot="end"
            size="small"
            onClick={() => setIsStorageOpen(true)}
          >
            <IonIcon aria-hidden="true" size="medium" icon={server} />
          </IonButton>
        </Banner>
        <div className="ion-padding">
          <StorageManager
            onPlot={plotCachedItemHandler}
            isOpen={isStorageOpen}
            onModalClose={() => setIsStorageOpen(false)}
          />
          <IonGrid fixed>
            <IonRow>
              {/* <IonCol size="12">
                <TerraTimeAverageMap
                  style={{
                    height: "300px",
                  }}
                  collection="M2T1NXAER_5_12_4"
                  variable="BCCMASS"
                  start-date="01/01/2009"
                  end-date="01/05/2009"
                  location="62,5,95,40"
                  bearer-token="YOUR_BEARER_TOKEN"
                ></TerraTimeAverageMap>
              </IonCol> */}
              <IonCol size="12">
                <TerraTimeSeries
                  // onTerraDateRangeChange={timeSeriesDateRangeChangeHandler}
                  onTerraTimeSeriesDataChange={timeSeriesDataChangeHandler}
                  variableEntryId={ctxParams.variable}
                  start-date={ctxParams.begin_time.replace(
                    /(\d{4})-(\d{2})-(\d{2}).*/,
                    "$2/$3/$1"
                  )}
                  end-date={ctxParams.end_time.replace(
                    /(\d{4})-(\d{2})-(\d{2}).*/,
                    "$2/$3/$1"
                  )}
                  location={`${ctxParams.lat},${ctxParams.lon}`}
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
                        ? `${toLocalShortDateTime(
                            stateData[index].timestamp
                          )}, ${stateData[index].value}`
                        : "Oops!"
                    }
                    disabled={!stateData.length}
                  />
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Plot;
