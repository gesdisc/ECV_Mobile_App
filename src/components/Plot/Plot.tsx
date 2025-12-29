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
import dayjs from "dayjs";
import { isEmpty } from "lodash";

import { TimeSeriesDataRow, DataParams } from "../../types/time-series.types";
import { TimeIntervalKey } from "../../constants/time-series";
import { useDataParams } from "../../store/DataParamsContext";
import { toLocalShortDateTime } from "../../utils/date";
import {
  getMiddleIndex,
  convertTimeInterval,
  getDefaultDateRange,
  extractLatLonFromCacheKey,
} from "./helpers";
import {
  getLatestCachedData,
  IndexedDbStores,
} from "../../services/indexDBService";

import TerraTimeSeries, {
  TerraTimeSeriesDataChangeEvent,
} from "@nasa-terra/components/dist/react/time-series";
import Slider from "./Slider";
import StorageManager from "./Storage/StorageManager";
import Banner from "../UI/Banner";
import TimeInterval from "./TimeInterval";

import "./Plot.css";
import useSelectedProductDetails, {
  SelectedProductDetailsType,
} from "../../hooks/useSelectedProductDetails";

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

  // Plot latest cached data
  useEffect(() => {
    if (!isEmpty(metadata)) return;

    getLatestCached();
  }, []);

  const getLatestCached = async () => {
    try {
      const data = await getLatestCachedData(IndexedDbStores.TIME_SERIES);

      if (isEmpty(data)) return;

      const coords = extractLatLonFromCacheKey(data.key);

      if (!coords) return;

      updateParams({
        lat: coords.lat,
        lon: coords.lon,
        begin_time: data.metadata.begin_time,
        end_time: data.metadata.end_time,
        variable: data.variableEntryId,
      });
    } catch (error) {
      console.error("ERROR: ", error);
    }
  };

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

    const { startDate: defaultStartDate, endDate: defaultEndDate } =
      getDefaultDateRange(
        dayjs(selectedProductDetails?.dataProductBeginDateTime),
        dayjs(selectedProductDetails?.dataProductEndDateTime),
        selectedProductDetails?.dataProductTimeInterval as TimeIntervalKey
      );

    updateParams({
      begin_time: defaultStartDate,
      end_time: defaultEndDate,
      // begin_time: "2019-10-01T00:00:00Z",
      // end_time: "2019-12-01T00:00:00Z",
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
              <IonCol size="12">
                <Slider
                  onLeftBtnClick={sliderLeftBtnHandler}
                  onRightBtnClick={sliderRightBtnHandler}
                  value={sliderValue}
                  max={stateData.length - 1}
                  min={0}
                  onValueChange={sliderValueChangeHandler}
                  pinFormatter={(index: number) =>
                    stateData[index]?.timestamp
                      ? `${toLocalShortDateTime(stateData[index].timestamp)}, ${
                          stateData[index].value
                        }`
                      : ""
                  }
                  disabled={isEmpty(metadata) && stateData.length === 0}
                  startDate={toLocalShortDateTime(stateData[0]?.timestamp)}
                  endDate={toLocalShortDateTime(
                    stateData[stateData.length - 1]?.timestamp
                  )}
                />
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
