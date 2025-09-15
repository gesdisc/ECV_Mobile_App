import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
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
  IonRange,
} from "@ionic/react";
import { download, informationCircle, server } from "ionicons/icons";
import { Network } from "@capacitor/network";
import { useLocation } from "react-router-dom";
// import Plotly from "plotly.js-dist-min";

// import { getItem, getRecentDataKey } from "../../services/indexDBService";
import {
  TimeSeriesDataRow,
  TimeSeriesMetadata,
  DataParams,
} from "../../types/time-series.types";
import { useDataParams } from "../../store/DataParamsContext";
// import { fetchData } from "../../services/api/time-series";
// import {
//   getMiddleIndex,
//   filterDataBetweenDates,
//   cacheTimeSeriesData,
//   getCachedData,
// } from "./helpers";
// import {
//   RECENT_DATA_CACHE_KEY,
//   DefaultParams,
// } from "../../constants/time-series";
// import { schema, MARGIN_INLINE } from "./plotSchema";
// import { formatDate } from "../../utils/date";
// import { PLOT_TYPES, usePlotType } from "../../store/PlotTypeContext";
// import catalog from "../Catalog/catalog.json";

import TimeSeriesPlot from "./TimeSeriesPlot";
import TerraTimeSeries from "@nasa-terra/components/dist/react/time-series";
import TerraSkeleton from "@nasa-terra/components/dist/react/skeleton";
import TerraTimeAverageMap from "@nasa-terra/components/dist/react/time-average-map";
import Slider from "./Slider";
import OLMap from "./OLMap/OLMap";
import InfoPanel from "./InfoPanel";
import StorageManager from "./Storage/StorageManager";
import Banner from "../UI/Banner";

import "./Plot.css";

const Visuals: React.FC = () => {
  const {
    latitude: selectedLat,
    longitude: selectedLon,
    beginTime: selectedBeginTime,
    endTime: selectedEndTime,
    variable: selectedVariable,
  } = useDataParams();
  // const abortController = useRef<AbortController | null>(null);
  // const workerRef = useRef<Worker | null>(null);
  const location = useLocation();
  const categoryPageVariable = location.state;
  const [stateData, setStateData] = useState<TimeSeriesDataRow[]>([]);
  const [stateMetadata, setStateMetaData] = useState<
    TimeSeriesMetadata | undefined
  >(undefined);
  // const [error, setError] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  // const [alertMessage, setAlertMessage] = useState<string | null>(null);
  // const [sliderValue, setSliderValue] = useState(MARGIN_INLINE * -2);
  const [sliderValue, setSliderValue] = useState(0);
  // const [sliderRange, setSliderRange] = useState([0, 10]);
  // const plotRef = useRef<Plotly.PlotlyHTMLElement | HTMLElement | null>(null);
  const plotRef2 = useRef<null>(null);
  // const currentVariableData = catalog.find(
  //   (data) => data.dataFieldId === selectedVariable
  // );

  // const { plotType } = usePlotType();

  /**
   *
   * Plot the latest cached data
   *
   */
  // useEffect(() => {
  //   const checkCacheOnMount = async () => {
  //     const recentCachedDataKey = await getRecentDataKey(RECENT_DATA_CACHE_KEY);
  //     const recentCachedData =
  //       recentCachedDataKey && (await getItem(recentCachedDataKey));

  //     console.log("recentCachedDataKey ", recentCachedDataKey);
  //     console.log("recentCachedData ", recentCachedData);
  //     if (!recentCachedData) return;
  //     // setStateData(recentCachedData.data);
  //     // setStateMetaData(recentCachedData.metadata);
  //   };
  //   checkCacheOnMount();
  // }, []);

  // FIXME: Previously plotted data will be fetched again instead of retrieving it from browser's storage.
  // The function compares cache keys of stored and requested data but the keys never match (even if parameters are the same) because of how dates are formatted in the workerRef.current.onmessage above.
  // What we want: Before fetching the requested data from Cloud Giovanni, handlePlotData should check wheter the data already exists in the browser storage and retrieve it.
  // The cause: formatting the dates in workerRef.current.onmessage in useEffect causes the problem
  // Replicate: click the "plot data" button, after plotting, click the button again without changing the parameters.
  // const handlePlotData = async ({
  //   lat,
  //   lon,
  //   begin_time,
  //   end_time,
  //   variable,
  // }: DataParams) => {
  //   try {
  //     const status = await Network.getStatus();
  //     const isOffline = !status.connected;
  //     const cacheKey = `CapacitorStorage.plotData*${variable}*${begin_time}*${end_time}*${lat}*${lon}`;
  //     const cachedData = await getCachedData(cacheKey, RECENT_DATA_CACHE_KEY);
  //     if (cachedData) {
  //       setStateData(cachedData.data);
  //       setStateMetaData(cachedData.metadata);
  //       return;
  //     }
  //     if (isOffline) {
  //       setAlertMessage(
  //         "You are offline and no cached data is available to plot."
  //       );
  //       return;
  //     }
  //     setIsLoading(true);
  //     setError(null);
  //     abortController.current = new AbortController();
  //     const csvData = await fetchData(
  //       {
  //         lat,
  //         lon,
  //         begin_time,
  //         end_time,
  //         variable,
  //       },
  //       abortController.current.signal
  //     );

  //     if (!workerRef.current) {
  //       throw new Error("Something went wrong. Can't process the data!");
  //     }
  //     // console.log("Plot clicked...", csvData);
  //     workerRef.current.postMessage(csvData);
  //   } catch (error) {
  //     error instanceof Error
  //       ? setError(error.message)
  //       : setError("An unexpected error occurred");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const sliderValueChangeHandler = (e: RangeCustomEvent) => {
    if (!stateData.length) return;
    const activeIndex = Number(e.detail.value);
    // adjustVLine([...stateData.map((d) => d.timestamp)], activeIndex);
    setSliderValue(activeIndex);

    // (Plotly as any).Fx.hover("divId", [
    //   { curveNumber: 0, pointNumber: activeIndex },
    // ]);
  };

  const sliderLeftBtnHandler = () => {
    if (stateData.length === 0) return;
    const nextIndex = sliderValue - 1;

    // if there is no more data on the left, load new chunk of data using Cloud Giovanni API
    if (stateData[nextIndex] === undefined) {
      const currentBeginTime = new Date(stateData[0].timestamp).getTime();
      const currentEndTime = new Date(
        stateData[stateData.length - 1].timestamp
      ).getTime();
      const currentDateDiff = currentEndTime - currentBeginTime;
      const newBeginTime = currentBeginTime - currentDateDiff;

      // fetchMoreData(newBeginTime, currentEndTime);
      return;
    }

    // TODO: MAY BE? if there is no more data in the visible area of Plot, display the next portion (pan the plot)
    // if (stateData[nextIndex] !== undefined && nextIndex < sliderRange[0]) {
    //   return;
    // }

    setSliderValue((prevNum) => prevNum - 1);
    // adjustVLine([...stateData.map((d) => d.timestamp)], sliderValue - 1);

    // (Plotly as any).Fx.hover("divId", [
    //   { curveNumber: 0, pointNumber: nextIndex },
    // ]);
  };

  // TODO: uses a lot of the same code from sliderLeftBtnHandler. Create reusable chunks?
  const sliderRightBtnHandler = () => {
    if (stateData.length === 0) return;
    const nextIndex = sliderValue + 1;

    // if there is no more data on the right, load new chunk of data using Cloud Giovanni API
    if (stateData[nextIndex] === undefined) {
      const currentBeginTime = new Date(stateData[0].timestamp).getTime();
      const currentEndTime = new Date(
        stateData[stateData.length - 1].timestamp
      ).getTime();
      const currentDateDiff = currentEndTime - currentBeginTime;
      const newEndTime = currentEndTime + currentDateDiff;

      // fetchMoreData(currentBeginTime, newEndTime);
      return;
    }

    // TODO: MAY BE? if there is no more data in the visible area of Plot, display the next portion (pan the plot)
    // if (stateData[nextIndex] !== undefined && nextIndex > sliderRange[1]) {
    //   return;
    // }

    setSliderValue((prevNum) => prevNum + 1);
    // adjustVLine([...stateData.map((d) => d.timestamp)], nextIndex);
    // (Plotly as any).Fx.hover("divId", [
    //   { curveNumber: 0, pointNumber: nextIndex },
    // ]);
  };

  // newParams comes from Storage StorageManager.tsx
  const plotCachedItemHandler = (newParams: DataParams) => {
    // handlePlotData({
    //   lat: newParams.lat,
    //   lon: newParams.lon,
    //   begin_time: newParams.begin_time,
    //   end_time: newParams.end_time,
    //   variable: newParams.variable,
    // });
  };

  const timeSeriesDataChangeHandler = (e: any) => {
    setStateData(e.detail.data.data);
    setStateMetaData(e.detail.data.metadata);
  };

  // useEffect(() => {
  //   const handleResize = () => {
  //     const el = plotRef2.current;
  //     if (!el) return;
  //     setLoading(true);

  //     customElements.whenDefined("terra-plot").then(() => {
  //       const plotWidth = (el as any).shadowRoot
  //         ?.querySelector("terra-plot")
  //         ?.shadowRoot.querySelector(".nsewdrag.drag")
  //         ?.getBoundingClientRect().width;

  //       // console.log("plotWidth === sliderWidth", plotWidth === sliderWidth);

  //       if (plotWidth) {
  //         setSliderWidth(plotWidth);
  //       }
  //     });
  //     console.log("false");
  //     setLoading(false);
  //   };

  //   handleResize();
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);
  // console.log("loading ", loading);

  // useLayoutEffect(() => {
  //   let resizeTimer: any;

  //   const handleResize = () => {
  //     setIsResizing(true); // Show loading
  //     clearTimeout(resizeTimer);

  //     const el = plotRef2.current;
  //     if (!el) return;

  //     const plotWidth = (el as any).shadowRoot
  //       ?.querySelector("terra-plot")
  //       ?.shadowRoot.querySelector(".nsewdrag.drag")
  //       ?.getBoundingClientRect().width;
  //     console.log("plotWidth ", plotWidth);
  //     if (plotWidth) {
  //       setSliderWidth(plotWidth);
  //     }

  //     resizeTimer = setTimeout(() => {
  //       // Perform your expensive calculations/re-renders here
  //       setIsResizing(false); // Hide loading after a delay
  //     }, 200); // Debounce delay (e.g., 200ms)
  //   };

  //   window.addEventListener("resize", handleResize);
  //   handleResize();
  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //     clearTimeout(resizeTimer);
  //   };
  // }, []);

  return (
    <IonPage>
      <IonContent fullscreen={true}>
        <Banner>
          <IonButton slot="end" size="small" id="storage-manager">
            <IonIcon aria-hidden="true" size="medium" icon={server} />
          </IonButton>
        </Banner>
        <div className="ion-padding">
          {/* {currentVariableData && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                {currentVariableData.label}
              </span>
              <div>
                <IonButton
                  size="small"
                  fill="clear"
                  onClick={downloadPlotImage}
                >
                  <IonIcon
                    aria-hidden="true"
                    size="large"
                    icon={download}
                    color="primary"
                  />
                </IonButton>
                <IonButton size="small" id="data-info-modal" fill="clear">
                  <IonIcon
                    aria-hidden="true"
                    size="large"
                    icon={informationCircle}
                    color="warning"
                  />
                </IonButton>
              </div>
            </div>
          )} */}
          {/* {stateMetadata && <InfoPanel metadata={stateMetadata} />} */}
          <StorageManager onPlot={plotCachedItemHandler} />
          {/* <IonAlert
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
          ></IonAlert> */}
          {/* {error && (
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
              header="Oops!"
              message={alertMessage}
              buttons={["OK"]}
              onDidDismiss={() => setAlertMessage(null)}
            />
          )} */}
          <IonGrid fixed>
            <IonRow>
              {/* {plotType === PLOT_TYPES.TIME_AVG && ( */}
              <IonCol size="12">
                {/* <OLMap /> */}
                <TerraTimeAverageMap
                  style={{
                    height: "300px",
                  }}
                ></TerraTimeAverageMap>
              </IonCol>
              {/* )} */}

              <IonCol size="12">
                <TerraTimeSeries
                  onTerraTimeSeriesDataChange={timeSeriesDataChangeHandler}
                  // onTerraDateRangeChange={dateChangeHandler}
                  ref={plotRef2}
                  // dataProductShortName + dataProductVersion + dataFieldShortName
                  // collection="OMHCHOd_003"
                  // variable="key_science_data_column_amount"
                  // collection={
                  //   splitByLastUnderscore(selectedVariable)?.collection
                  // }
                  // variable={splitByLastUnderscore(selectedVariable)?.variable}
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

                  // style={{
                  //   height: "200px",
                  // }}
                  // collection="GPM_3IMERGHH_06"
                  // variable="precipitationCal"
                  // variableEntryId={"GPM_3IMERGHH_07_precipitation"}
                  // start-date="01/01/2019"
                  // end-date="09/01/2021"
                  // location="33.9375,-86.9375"
                ></TerraTimeSeries>

                {/* <TimeSeriesPlot
                  plotRef={plotRef}
                  layout={plotState.layout}
                  plotData={[...plotState.data]}
                  onPlotRelayout={plotRelayoutHandler}
                /> */}
              </IonCol>
              <IonCol
                size="12"
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {isResizing ? (
                  <TerraSkeleton
                    variableWidths={false}
                    effect="pulse"
                    rows={1}
                  ></TerraSkeleton>
                ) : (
                  stateData.length !== 0 && (
                    <Slider
                      onLeftBtnClick={sliderLeftBtnHandler}
                      onRightBtnClick={sliderRightBtnHandler}
                      value={sliderValue}
                      max={stateData.length - 1}
                      min={0}
                      onValueChange={sliderValueChangeHandler}
                      pinFormatter={(index: number) =>
                        stateData[index]?.timestamp
                          ? `${new Date(
                              stateData[index].timestamp
                            ).toLocaleString(undefined, {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}`
                          : "Oops!"
                      }
                      disabled={!stateData.length}
                    />
                  )
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
          {/* <IonButton
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
            disabled={isLoading}
          >
            {isLoading ? "Wait..." : "Plot Data"}
          </IonButton> */}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Visuals;
