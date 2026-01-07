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
import { isEmpty } from "lodash";

import { TimeSeriesDataRow, DataParams } from "../../types/time-series.types";
import { useDataParams } from "../../store/DataParamsContext";
import { DefaultParams, TimeIntervalKey } from "../../constants/time-series";
import { toLocalShortDateTime } from "../../utils/date";
import { getMiddleIndex, convertTimeInterval } from "./helpers";
import useSelectedProductDetails, {
  SelectedProductDetailsType,
} from "../../hooks/useSelectedProductDetails";

import TerraTimeSeries, {
  TerraTimeSeriesDataChangeEvent,
} from "@nasa-terra/components/dist/react/time-series";
import Slider from "./Slider";
import StorageManager from "./Storage/StorageManager";
import Banner from "../UI/Banner";
import TimeInterval from "./TimeInterval";

import "./Plot.css";

const Plot: React.FC = () => {
  const [stateData, setStateData] = useState<TimeSeriesDataRow[]>([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [selectedTimeInterval, setSelectedTimeInterval] =
    useState<TimeIntervalKey>("half-hourly");
  const {
    params: ctxParams,
    updateParams,
    setMetadata,
    metadata,
  } = useDataParams();
  const selectedProductDetails: SelectedProductDetailsType =
    useSelectedProductDetails();
  const location = useLocation();
  const catalogPageVariable = location.state;

  const currentProductTimeInterval =
    selectedProductDetails?.dataProductTimeInterval;

  useEffect(() => {
    if (!selectedProductDetails) return;
    setSelectedTimeInterval(
      selectedProductDetails?.dataProductTimeInterval as TimeIntervalKey
    );
  }, [selectedProductDetails]);

  useEffect(() => {
    setSliderValue(getMiddleIndex(stateData));
  }, [stateData]);

  /**
   *
   * This will only work when user selects a variable on the catalog page.
   * It uses default parameters and user selected variable.
   *
   */
  useEffect(() => {
    if (!catalogPageVariable) return;

    updateParams({
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

  /* FIXME: Slider buttons don't work when plot fully zoomed in -- check stateData */
  const sliderLeftBtnHandler = () => {
    if (stateData.length === 0) return;
    if (sliderValue === 0) return;

    setSliderValue((prevNum) =>
      Math.max(
        0,
        prevNum -
          convertTimeInterval(
            currentProductTimeInterval as TimeIntervalKey,
            selectedTimeInterval
          )
      )
    );
  };

  const sliderRightBtnHandler = () => {
    if (stateData.length === 0) return;
    if (sliderValue === stateData.length - 1) return;

    setSliderValue((prevNum) =>
      Math.min(
        stateData.length - 1,
        prevNum +
          convertTimeInterval(
            currentProductTimeInterval as TimeIntervalKey,
            selectedTimeInterval
          )
      )
    );
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
    /* FIXME: plot data disappears when fully zoomed in and then zoomed out -- setStateData causes the bug */
    setStateData(e.detail.data.data);
    setMetadata(e.detail.data.metadata);
  };

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
              <IonCol size="12">
                <TerraTimeSeries
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
              <IonCol size="12">
                {!isEmpty(metadata) && stateData.length !== 0 && (
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
                        : ""
                    }
                    disabled={!stateData.length}
                    startDate={toLocalShortDateTime(stateData[0]?.timestamp)}
                    endDate={toLocalShortDateTime(
                      stateData[stateData.length - 1]?.timestamp
                    )}
                  />
                )}
              </IonCol>
              {!isEmpty(metadata) && stateData.length !== 0 && (
                <TimeInterval
                  onIntervalChange={(intervalOption) =>
                    setSelectedTimeInterval(intervalOption as TimeIntervalKey)
                  }
                  currentProductTimeInterval={
                    currentProductTimeInterval as TimeIntervalKey
                  }
                  selectedOption={selectedTimeInterval}
                />
              )}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Plot;
