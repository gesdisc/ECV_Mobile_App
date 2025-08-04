import React, { useEffect, useState, useRef } from "react";
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
import { download, informationCircle, server } from "ionicons/icons";
import { Network } from "@capacitor/network";
import { useLocation } from "react-router-dom";
import Plotly from "plotly.js-dist-min";
import { getItem, getRecentDataKey } from "../../services/indexDBService";
import {
  TimeSeriesDataRow,
  TimeSeriesMetadata,
  TimeSeriesData,
  DataParams,
} from "../../types/time-series.types";
import { useDataParams } from "../../store/DataParamsContext";
import { fetchData } from "../../services/api/time-series";
import { formatDate } from "../../utils/date";
import {
  getMiddleIndex,
  filterDataBetweenDates,
  cacheTimeSeriesData,
  getCachedData,
} from "./helpers";
import {
  RECENT_DATA_CACHE_KEY,
  DefaultParams,
} from "../../constants/time-series";
import { schema, MARGIN_INLINE } from "./plotSchema";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { PLOT_TYPES, usePlotType } from "../../store/PlotTypeContext";
import catalog from "../Catalog/catalog.json";

import Header from "../Layout/Header";
import TimeSeriesPlot from "./TimeSeriesPlot";
import Slider from "./Slider";
import OLMap from "./OLMap/OLMap";
import InfoPanel from "./InfoPanel";
import StorageManager from "./Storage/StorageManager";

import styles from "./Plot.module.css";
import Banner from "../UI/Banner";

const NUM_DATA_TO_SHOW = 10;

const Visuals: React.FC = () => {
  const {
    latitude: selectedLat,
    longitude: selectedLon,
    beginTime: selectedBeginTime,
    endTime: selectedEndTime,
    variable: selectedVariable,
  } = useDataParams();
  const abortController = useRef<AbortController | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const location = useLocation();
  const categoryPageVariable = location.state;
  const [stateData, setStateData] = useState<TimeSeriesDataRow[]>([]);
  const [stateMetadata, setStateMetaData] = useState<
    TimeSeriesMetadata | undefined
  >(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(MARGIN_INLINE * -2);
  const [sliderRange, setSliderRange] = useState([0, 10]);
  const plotRef = useRef<Plotly.PlotlyHTMLElement | HTMLElement | null>(null);
  // const { height, width } = useWindowDimensions();
  const { plotType } = usePlotType();
  // const PLOT_DATA_CACHE_KEY = `CapacitorStorage.plotData*${selectedVariable}*${selectedBeginTime}*${selectedEndTime}*${selectedLat}*${selectedLon}`;
  const [plotState, setPlotState] = useState<{
    data: Partial<Plotly.Data>[];
    layout: Partial<Plotly.Layout>;
  }>({
    data: [schema.data],
    layout: schema.layout,
  });

  const cancelRequest = () =>
    abortController.current && abortController.current.abort();

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
   * This will fetch data everytime user selects a new variable on the catalog page
   * It will use default parameters and user selected variable
   *
   * FIXME: Runs on page refresh
   * FIXME: Cancel not working!
   */
  useEffect(() => {
    if (!categoryPageVariable) return;
    const getData = async () => {
      console.log("FETCHING SELECTED VARIABLE!!!");
      try {
        await handlePlotData({
          lat: DefaultParams.LATITUDE,
          lon: DefaultParams.LONGITUDE,
          begin_time: DefaultParams.BEGIN_TIME,
          end_time: DefaultParams.END_TIME,
          variable: categoryPageVariable as string,
        });
      } catch (error) {
        console.log("ERROR FROM FIRST PLOT______: ", error);
      }
    };

    getData();
  }, [categoryPageVariable]);

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
      // console.log("Worker: ", metadata.end_time);
      // console.log(
      //   "Worker: ",
      //   new Date(metadata.end_time).toISOString().slice(0, -5)
      // );
      const newDataParams = {
        lat: metadata?.lat,
        lon: metadata?.lon,
        begin_time: new Date(metadata?.begin_time).toISOString().slice(0, -5),
        end_time: new Date(metadata?.end_time).toISOString().slice(0, -5),
        variable: `${metadata?.prod_name}`
          .replaceAll(".", "_")
          .concat(`_${metadata?.param_short_name}`),
      };
      const cacheKey = `CapacitorStorage.plotData*${newDataParams.variable}*${newDataParams.begin_time}*${newDataParams.end_time}*${newDataParams.lat}*${newDataParams.lon}`;
      // console.log("metadata from web worker", cacheKey);
      if (!Array.isArray(data) || !data.length) {
        setAlertMessage(
          "Your request was successful but there is no enough data to plot."
        );
        return;
      }

      cacheTimeSeriesData({ metadata, data }, cacheKey, RECENT_DATA_CACHE_KEY);
      setStateMetaData(metadata);
      setStateData(data);
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  /**
   * Update Plot State when data (stateData) is changed
   */
  useEffect(() => {
    if (stateData.length === 0) return;

    const plotData: Partial<Plotly.Data>[] = [
      {
        x: stateData.map((d) => d.timestamp),
        y: stateData.map((d) => d.value),
        type: "scatter",
        // mode: "lines+markers",
        mode: "lines",
        line: { color: "blue" },
        name: stateMetadata?.param_short_name || "",
        // connectgaps: false,
      },
    ];

    let verticalLine: Partial<Plotly.Shape> = {};
    if (plotState.layout.shapes !== undefined) {
      verticalLine = {
        ...plotState.layout?.shapes[0],
        visible: stateData.length ? true : false,
        x0: stateData[getMiddleIndex(stateData)]?.timestamp, // x bottom
        x1: stateData[getMiddleIndex(stateData)]?.timestamp, // x top
        // x0: MARGIN_INLINE * -2, // x bottom
        // x1: MARGIN_INLINE * -2, // x top
        y0: "-100", // y bottom
        y1: "150", // y top
      };
    }

    let plotAnnotation: Partial<Plotly.Annotations> = {};
    if (plotState.layout.annotations !== undefined) {
      plotAnnotation = {
        ...plotState.layout.annotations[0],
        text:
          stateMetadata?.lat && stateMetadata?.lon
            ? `Lat: ${stateMetadata?.lat}, Lon: ${stateMetadata?.lon}`
            : "",
      };
    }
    // document.querySelector(".nsewdrag.drag").width.baseVal.value;
    const plotLayout: Partial<Plotly.Layout> = {
      ...plotState.layout,
      // width: width,
      // title: stateMetadata?.param_name
      //   ? `${stateMetadata?.param_name} (${stateMetadata?.prod_name})`
      //   : "Select a variable to plot.",
      // sliders: [newSlider],
      shapes: [verticalLine],
      xaxis: {
        ...plotState.layout.xaxis,
        type: "date",
        title: "Date & Time",
      },
      yaxis: {
        title: stateMetadata?.param_short_name
          ? `${stateMetadata?.param_short_name} (${stateMetadata?.unit})`
          : "",
      },
      annotations: [plotAnnotation],
    };

    setPlotState({ data: plotData, layout: plotLayout }); // get prevSt
    setSliderValue(getMiddleIndex(stateData));
    setSliderRange([0, stateData.length - 1]);
  }, [stateData]);

  const handlePlotData = async ({
    lat,
    lon,
    begin_time,
    end_time,
    variable,
  }: DataParams) => {
    try {
      const status = await Network.getStatus();
      const isOffline = !status.connected;

      // Using wrong params for caching??
      const cacheKey = `CapacitorStorage.plotData*${variable}*${begin_time}*${end_time}*${lat}*${lon}`;

      const cachedData = await getCachedData(cacheKey, RECENT_DATA_CACHE_KEY);
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

      abortController.current = new AbortController();

      // check variables??
      const csvData = await fetchData(
        {
          lat,
          lon,
          begin_time,
          end_time,
          variable,
        },
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

  // FIXME: caching should update the dates in the name
  // TODO: load more data instead of loading the entire data again
  const fetchMoreData = async (
    newBeginTime: string | number,
    newEndTime: string | number
  ) => {
    if (!stateMetadata) return;
    const currentBeginTime = new Date(stateData[0].timestamp).getTime();
    const currentEndTime = new Date(
      stateData[stateData.length - 1].timestamp
    ).getTime();
    const convertedNewBeginTime = new Date(newBeginTime).getTime();
    const convertedNewEndTime = new Date(newEndTime).getTime();

    // Check if the variable has data within new range
    // if not... get the most available date
    const newDataParams = {
      lat: stateMetadata.lat,
      lon: stateMetadata.lon,
      begin_time: new Date(
        currentBeginTime > convertedNewBeginTime
          ? newBeginTime
          : stateMetadata.begin_time
      )
        .toISOString()
        .slice(0, -5),
      end_time: new Date(
        currentEndTime < convertedNewEndTime
          ? newEndTime
          : stateMetadata.end_time
      )
        .toISOString()
        .slice(0, -5),
      variable: `${stateMetadata?.prod_name}`
        .replaceAll(".", "_")
        .concat(`_${stateMetadata?.param_short_name}`),
    };

    handlePlotData(newDataParams);
  };

  const adjustVLine = (newXrange: string[], activeIndex: number) => {
    if (plotState.layout.shapes === undefined) return;
    const newVerticalLine: Partial<Plotly.Shape> = {
      ...plotState.layout?.shapes[0],
      visible: true,
      x0: newXrange[activeIndex],
      x1: newXrange[activeIndex],
      // x0: activeIndex,
      // x1: activeIndex,
      y0: "-100", // y bottom
      y1: "150", // y top
    };

    setPlotState((prevState) => {
      return {
        data: prevState.data,
        layout: {
          ...prevState.layout,
          shapes: [newVerticalLine],
        },
      };
    });
  };

  const plotRelayoutHandler = (e: any) => {
    if (stateData.length === 0) return;
    const plotLeftPoint = e["xaxis.range[0]"];
    const plotRightPoint = e["xaxis.range[1]"];
    const currentBeginTime = new Date(stateData[0].timestamp).getTime();
    const currentEndTime = new Date(
      stateData[stateData.length - 1].timestamp
    ).getTime();
    const currentDateDiff = currentEndTime - currentBeginTime;
    const newEndTime = currentEndTime + currentDateDiff;
    const newBeginTime = currentBeginTime - currentDateDiff;
    let plotLeftPointIndex: number | null = null;
    let plotRightPointIndex: number | null = null;
    let plotMiddlePointIndex: number | null = null;

    if (plotLeftPoint && plotRightPoint) {
      const filteredDates = filterDataBetweenDates(
        plotLeftPoint,
        plotRightPoint,
        [...stateData.map((d) => d.timestamp)]
      );

      // Load more data on Plot pan event
      if (new Date(e["xaxis.range[1]"]).getTime() > currentEndTime) {
        fetchMoreData(currentBeginTime, newEndTime);
        console.log("We can load more data Right!!");
        // adjustVLine(filteredDates, getMiddleIndex(filteredDates));
        // setSliderRange([plotLeftPointIndex, plotRightPointIndex]);
        // setSliderValue(plotMiddlePointIndex);
        return;
      }

      if (new Date(e["xaxis.range[0]"]).getTime() < currentBeginTime) {
        fetchMoreData(newBeginTime, currentEndTime);
        console.log("We can load more data LEFT!!");
        // adjustVLine(filteredDates, getMiddleIndex(filteredDates));
        // setSliderRange([plotLeftPointIndex, plotRightPointIndex]);
        // setSliderValue(plotMiddlePointIndex);
        return;
      }

      // if (filteredDates.length <= 6) return; // LIMIT ZOOM AND PAN?
      // no data in the visible area of Plot
      // Plot zoom
      if (filteredDates.length === 0) return;

      plotLeftPointIndex = stateData.findIndex(
        (data) => data.timestamp === filteredDates[0]
      );
      plotRightPointIndex = stateData.findIndex(
        (data) => data.timestamp === filteredDates[filteredDates.length - 1]
      );
      plotMiddlePointIndex = stateData.findIndex(
        (data) =>
          data.timestamp === filteredDates[getMiddleIndex(filteredDates)]
      );

      // TODO: update the slider steps
      adjustVLine(filteredDates, getMiddleIndex(filteredDates));
      setSliderRange([plotLeftPointIndex, plotRightPointIndex]);
      setSliderValue(plotMiddlePointIndex);
      // geotiffURLhandler(plotMiddlePointIndex);
    } else {
      // adjustVLine(filteredDates, getMiddleIndex(filteredDates));
      setSliderRange([0, stateData.length - 1]);
      // setSliderValue();
    }
  };

  const sliderValueChangeHandler = (e: RangeCustomEvent) => {
    if (!stateData.length) return;
    const activeIndex = Number(e.detail.value);
    adjustVLine([...stateData.map((d) => d.timestamp)], activeIndex);
    setSliderValue(activeIndex);
    // geotiffURLhandler(activeIndex);
    //  setSliderRange(filteredDates.length - 1);
    (Plotly as any).Fx.hover("divId", [
      { curveNumber: 0, pointNumber: activeIndex },
      // { curveNumber: 1, pointNumber: activeIndex },
    ]);
  };

  const sliderLeftBtnHandler = () => {
    if (stateData.length === 0) return;
    const nextIndex = sliderValue - 1;

    if (stateData[nextIndex] === undefined) {
      const currentBeginTime = new Date(stateData[0].timestamp).getTime();
      const currentEndTime = new Date(
        stateData[stateData.length - 1].timestamp
      ).getTime();
      const currentDateDiff = currentEndTime - currentBeginTime;
      const newBeginTime = currentBeginTime - currentDateDiff;

      fetchMoreData(newBeginTime, currentEndTime);
      return;
    }

    // No more data in the visible area of Plot -- display the next portion
    if (stateData[nextIndex] !== undefined && nextIndex < sliderRange[0]) {
      console.log("we are here");
      return;
    }

    setSliderValue((prevNum) => prevNum - 1);
    adjustVLine([...stateData.map((d) => d.timestamp)], sliderValue - 1);

    (Plotly as any).Fx.hover("divId", [
      { curveNumber: 0, pointNumber: nextIndex },
      // { curveNumber: 1, pointNumber: activeIndex },
    ]);
    // setSliderRange(filteredDates.length - 1);
    // geotiffURLhandler(sliderValue - 1);
  };

  const sliderRightBtnHandler = () => {
    if (stateData.length === 0) return;
    const nextIndex = sliderValue + 1;
    // No more data to display -- load new chunk of data
    if (stateData[nextIndex] === undefined) {
      const currentBeginTime = new Date(stateData[0].timestamp).getTime();
      const currentEndTime = new Date(
        stateData[stateData.length - 1].timestamp
      ).getTime();
      const currentDateDiff = currentEndTime - currentBeginTime;
      const newEndTime = currentEndTime + currentDateDiff;

      console.log("loading more data!!!");
      fetchMoreData(currentBeginTime, newEndTime);
      return;
    }

    // No more data in the visible area of Plot -- display the next portion
    if (stateData[nextIndex] !== undefined && nextIndex > sliderRange[1]) {
      console.log("we are here");
      return;
    }

    setSliderValue((prevNum) => prevNum + 1);
    adjustVLine([...stateData.map((d) => d.timestamp)], nextIndex);
    (Plotly as any).Fx.hover("divId", [
      { curveNumber: 0, pointNumber: nextIndex },
      // { curveNumber: 1, pointNumber: activeIndex },
    ]);
    // geotiffURLhandler(nextIndex);
  };

  const downloadPlotImage = () => {
    Plotly.downloadImage("divId", {
      format: "png",
      filename: "my_plot",
      height: 500,
      width: 700,
    });
  };

  const currentVariableData = catalog.find(
    (data) =>
      data.dataFieldId ===
      `${stateMetadata?.prod_name}`
        .replaceAll(".", "_")
        .concat(`_${stateMetadata?.param_short_name}`)
  );

  const plotChachedItemHandler = (newParams: DataParams) => {
    handlePlotData({
      lat: newParams.lat,
      lon: newParams.lon,
      begin_time: newParams.begin_time,
      end_time: newParams.end_time,
      variable: newParams.variable,
    });
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
          {currentVariableData && (
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
          )}
          {stateMetadata && <InfoPanel metadata={stateMetadata} />}
          <StorageManager onPlot={plotChachedItemHandler} />
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
              header="Oops!"
              message={alertMessage}
              buttons={["OK"]}
              onDidDismiss={() => setAlertMessage(null)}
            />
          )}

          <IonGrid fixed>
            <IonRow>
              {plotType === PLOT_TYPES.TIME_AVG && (
                <IonCol
                  size="12"
                  style={{
                    minHeight: "200px",
                    // height: "200px",
                  }}
                >
                  <OLMap />
                </IonCol>
              )}
              <IonCol
                size="12"
                style={{
                  minHeight: "300px",
                  // height: "300px",
                }}
              >
                <TimeSeriesPlot
                  plotRef={plotRef}
                  // metadata={stateMetadata}
                  // data={stateData}
                  layout={plotState.layout}
                  // plotData={plotState.data}
                  plotData={[...plotState.data]}
                  onPlotRelayout={plotRelayoutHandler}
                  // onSliderChange={sliderChangeHandler}
                  // data={stateData.slice(dataRangeMin, dataRangeMin + NUM_DATA_TO_SHOW)}
                  // minRange={plotMinRange}
                  // maxRange={plotMaxRange}
                />
              </IonCol>
              <IonCol
                size="12"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  // justifyContent: "center",
                }}
              >
                {stateData.length !== 0 && (
                  <Slider
                    onLeftBtnClick={sliderLeftBtnHandler}
                    onRightBtnClick={sliderRightBtnHandler}
                    value={sliderValue}
                    max={sliderRange[1]}
                    // prettier-ignore
                    // width={width - (MARGIN_INLINE * 2)}
                    min={sliderRange[0]}
                    // prettier-ignore
                    onValueChange={sliderValueChangeHandler}
                    // pinFormatter={(index: number) => `${stateData[index]?.timestamp}`}
                    pinFormatter={(index: number) =>
                      // `${stateData[index]?.timestamp}`
                      stateData[index]?.timestamp &&
                      `${new Date(
                        stateData[index]?.timestamp
                      ).toLocaleDateString()}`
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
            disabled={isLoading}
          >
            {isLoading ? "Wait..." : "Plot Data"}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Visuals;
