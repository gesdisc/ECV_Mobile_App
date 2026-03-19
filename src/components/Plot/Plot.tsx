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

import {
  TimeSeriesDataRow,
  DataParams,
  SpatialAreaType,
} from "../../types/time-series.types";
import { TimeIntervalKey } from "../../constants/time-series";
import { useDataParams } from "../../store/DataParamsContext";
import { toLocalShortDateTime } from "../../utils/date";
import {
  getMiddleIndex,
  convertTimeInterval,
  getDefaultDateRange,
  extractLatLonFromCacheKey,
} from "./helpers";
import useProductDetails, {
  SelectedProductDetailsType,
} from "../../hooks/useProductDetails";
import {
  getLatestCachedData,
  IndexedDbStores,
} from "../../services/indexDBService";
import { useAuth } from "../../store/AuthContext";

import TerraTimeSeries, {
  TerraTimeSeriesDataChangeEvent,
} from "@nasa-terra/components/dist/react/time-series";
import Slider from "./Slider";
import StorageManager from "./Storage/StorageManager";
import Banner from "../UI/Banner";
import TimeInterval from "./TimeInterval";

import "./Plot.css";
import OLMap from "./OLMap/OLMap";

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
  const { login, logout, user, token } = useAuth();

  const location = useLocation();
  const catalogPageVariable = location.state;

  // Get details of the variable selected by the user on the catalog page.
  const selectedProductDetails: SelectedProductDetailsType = useProductDetails(
    catalogPageVariable as string
  );

  // Get details of currently plotted variable
  const plottedProductDetails: SelectedProductDetailsType = useProductDetails(
    ctxParams.variable
  );

  const currentProductTimeInterval =
    plottedProductDetails?.dataProductTimeInterval;

  // FIXME: SEEMS LIKE THIS IS CAUSING A WEIRD BUG...THAT PREVENTS TIME-SERIES COMPONENT FROM PLOTTING
  // Plot latest cached data
  // useEffect(() => {
  //   if (!isEmpty(metadata)) return;

  //   getLatestCached();
  // }, []);

  // const getLatestCached = async () => {
  //   try {
  //     const data = await getLatestCachedData(IndexedDbStores.TIME_SERIES);

  //     if (isEmpty(data)) return;

  // TODO: WILL NOT WORK IN CASE OF BBOX AREA
  //     const coords = extractLatLonFromCacheKey(data.key);

  //     if (!coords) return;

  //     updateParams({
  //       lat: coords.lat,
  //       lon: coords.lon,
  //       begin_time: data.metadata.begin_time,
  //       end_time: data.metadata.end_time,
  //       variable: data.variableEntryId,
  //     });
  //   } catch (error) {
  //     console.error("ERROR: ", error);
  //   }
  // };

  useEffect(() => {
    if (!plottedProductDetails) return;
    setSelectedTimeInterval(
      plottedProductDetails?.dataProductTimeInterval as TimeIntervalKey
    );
  }, [plottedProductDetails]);

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
    updateParams(newParams);
  };

  // Emitted whenever time series data has been fetched from Giovanni. Or zoomed in/out.
  const timeSeriesDataChangeHandler = (e: TerraTimeSeriesDataChangeEvent) => {
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
        <div>
          <StorageManager
            onPlot={plotCachedItemHandler}
            isOpen={isStorageOpen}
            onModalClose={() => setIsStorageOpen(false)}
          />
          <IonGrid>
            <IonRow>
              {ctxParams.spatialArea.type === SpatialAreaType.BOUNDING_BOX && (
                <IonCol size="12">
                  <OLMap date={stateData[sliderValue]?.timestamp} />
                </IonCol>
              )}
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
                  location={Object.values(ctxParams.spatialArea.value).join(
                    ","
                  )}
                  bearerToken={token || ""}
                ></TerraTimeSeries>
              </IonCol>
              {!isEmpty(metadata) && stateData.length !== 0 && (
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
              )}
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
