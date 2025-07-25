import React, { useEffect, useState, useRef } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
  IonRange,
  RangeCustomEvent,
  isPlatform,
  getPlatforms,
} from "@ionic/react";
import { Network } from "@capacitor/network";
// import { useLocation } from "react-router-dom";
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
import useCheckIndexedDBUsage from "../../hooks/useCheckIndexedDBUsage";
import {
  getMiddleIndex,
  filterDataBetweenDates,
  cacheTimeSeriesData,
  getCachedData,
} from "./helpers";
import { RECENT_DATA_CACHE_KEY } from "../../constants/time-series";
import { schema, MARGIN_INLINE } from "./plotSchema";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import catalog from "../Catalog/catalog.json";

import Header from "../Layout/Header";
import TimeSeriesPlot from "./TimeSeriesPlot";
import Slider from "./Slider";
import OpenLayersMap from "./OLMap/OLMap";

import "./Plot.css";

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
  // const location = useLocation();
  // const catPageVar = location.state;
  // console.log("catPageVar: ", catPageVar);
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
  // const [dataRangeMin, setDataRangeMin] = useState<number>(0);
  const PLOT_DATA_CACHE_KEY = `CapacitorStorage.plotData*${selectedVariable}*${selectedBeginTime}*${selectedEndTime}*${selectedLat}*${selectedLon}`;

  const { height, width } = useWindowDimensions();
  // console.log("screen width: ", width);
  // console.log("screen Owidth: ", height);
  const [plotState, setPlotState] = useState<{
    data: Partial<Plotly.Data>[];
    layout: Partial<Plotly.Layout>;
    // frames: Partial<Plotly.Frame>;
    // config: Partial<Plotly.Config>;
  }>({
    data: [schema.data],
    layout: schema.layout,
  });

  const {
    totalSpace,
    usedSpace,
    error: indexedDBUsageError,
  } = useCheckIndexedDBUsage();

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
  // console.log(stateMetadata);
  /**
   * If user selected var on the first page...
   */
  // useEffect(() => {
  //   const getData = async () => {
  //     try {
  //       await handlePlotData({
  //         lat: latitude,
  //         lon: longitude,
  //         begin_time: beginTime,
  //         end_time: endTime,
  //         variable: variable,
  //       });
  //     } catch (error) {
  //       console.log("ERROR FROM FIRST PLOT______: ", error);
  //     }
  //   };

  //   getData();
  // }, []);

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

      if (!Array.isArray(data) || !data.length) {
        setAlertMessage(
          "Your request was successful but there is no enough data to plot."
        );
        return;
      }

      cacheTimeSeriesData(
        { metadata, data },
        PLOT_DATA_CACHE_KEY,
        RECENT_DATA_CACHE_KEY
      );
      setStateMetaData(metadata);
      setStateData(data);
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [PLOT_DATA_CACHE_KEY]);

  /**
   * Update Plot State when data (stateData) is changed
   */
  useEffect(() => {
    if (stateData.length === 0) return;
    // const trace1 = {
    //   x: stateData.map((d) => d.timestamp).slice(0, 10),
    //   y: stateData.map((d) => d.value),
    //   type: "scatter",
    //   // mode: "lines+markers",
    //   mode: "lines",
    //   line: { color: "blue" },
    //   name: stateMetadata?.param_short_name || "",
    // };
    const plotData: Partial<Plotly.Data>[] = [
      {
        x: stateData.map((d) => d.timestamp),
        y: stateData.map((d) => d.value),
        type: "scatter",
        // mode: "lines+markers",
        mode: "lines",
        line: { color: "blue" },
        // name: stateMetadata?.param_short_name || "",
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
        y1: "300", // y top
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
      width: width,
      // title: stateMetadata?.param_name
      //   ? `${stateMetadata?.param_name} (${stateMetadata?.prod_name})`
      //   : "Select a variable to plot.",
      // sliders: [newSlider],
      shapes: [verticalLine],
      xaxis: {
        ...plotState.layout.xaxis,
        title: "Date & Time",
      },
      // yaxis: {
      //   title: stateMetadata?.param_short_name
      //     ? `${stateMetadata?.param_short_name} (${stateMetadata?.unit})`
      //     : "",
      // },
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

      const cachedData = await getCachedData(
        PLOT_DATA_CACHE_KEY,
        RECENT_DATA_CACHE_KEY
      );
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
  const fetchMoreData = async (newBeginTime: string, newEndTime: string) => {
    if (!stateMetadata) return;
    const currentBeginTime = new Date(stateData[0].timestamp).getTime();
    const currentEndTime = new Date(
      stateData[stateData.length - 1].timestamp
    ).getTime();
    const convertedNewBeginTime = new Date(newBeginTime).getTime();
    const convertedNewEndTime = new Date(newEndTime).getTime();

    // Check if the variable have data within new range
    // const currentVariableMetadataFromCatalog =

    // check if it's actually a new begin/end date
    // if (
    //   convertedNewBeginTime < currentBeginTime ||
    //   currentEndTime > convertedNewEndTime
    // )
    //   return;
    try {
      setIsLoading(true);
      setError(null);
      abortController.current = new AbortController();

      // LEFT
      if (currentBeginTime > convertedNewBeginTime) {
        const csvData = await fetchData(
          {
            lat: stateMetadata.lat,
            lon: stateMetadata.lon,
            begin_time: new Date(newBeginTime).toISOString().slice(0, -1),
            end_time: new Date(stateMetadata.end_time)
              .toISOString()
              .slice(0, -1),
            variable: `${stateMetadata?.prod_name}`
              .replaceAll(".", "_")
              .concat(`_${stateMetadata?.param_short_name}`),
          },
          abortController.current.signal
        );

        // FIXME: using wrong variable
        if (!workerRef.current) {
          throw new Error("Something went wrong. Can't process the data!");
        }
        workerRef.current.postMessage(csvData);
        return;
      }

      // RIGHT
      if (currentEndTime < convertedNewEndTime) {
        const csvData = await fetchData(
          {
            lat: stateMetadata.lat,
            lon: stateMetadata.lon,
            begin_time: new Date(stateMetadata.begin_time)
              .toISOString()
              .slice(0, -1),
            end_time: new Date(newEndTime).toISOString().slice(0, -1),
            variable: `${stateMetadata?.prod_name}`
              .replaceAll(".", "_")
              .concat(`_${stateMetadata?.param_short_name}`),
          },
          abortController.current.signal
        );

        if (!workerRef.current) {
          throw new Error("Something went wrong. Can't process the data!");
        }
        workerRef.current.postMessage(csvData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const adjustVLine = (newData: TimeSeriesDataRow[], activeIndex: number) => {
    if (plotState.layout.shapes === undefined) return;
    const newVerticalLine: Partial<Plotly.Shape> = {
      ...plotState.layout?.shapes[0],
      visible: true,
      x0: newData[activeIndex].timestamp,
      x1: newData[activeIndex].timestamp,
      // x0: activeIndex,
      // x1: activeIndex,
      y0: "-100", // y bottom
      y1: "300", // y top
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
  // console.log(plotRef.current);
  const plotRelayoutHandler = (e: any) => {
    // console.log("plotRelayoutHandler: ", e);
    const newLeftPoint = e["xaxis.range[0]"];
    const newRightPoint = e["xaxis.range[1]"];
    console.log(e);

    // if it's not in the range load more

    if (newLeftPoint && newRightPoint) {
      // fetchMoreData(e["xaxis.range[0]"], e["xaxis.range[1]"]);

      const filteredData = filterDataBetweenDates(
        newLeftPoint,
        newRightPoint,
        stateData
      );
      // if (filteredData.length <= 6) return; // LIMIT ZOOM AND PAN?
      if (filteredData.length === 0) return;

      const newLeftPointIndex = stateData.findIndex(
        (data) => data.timestamp === filteredData[0].timestamp
      );
      const newRightPointIndex = stateData.findIndex(
        (data) =>
          data.timestamp === filteredData[filteredData.length - 1].timestamp
      );
      const newMiddleIndex = stateData.findIndex(
        (data) =>
          data.timestamp ===
          filteredData[getMiddleIndex(filteredData)].timestamp
      );

      // if(plotState.layout !== undefined){
      //   console.log("shape x: " plotState.layout.shapes[0].x0);

      // }
      // TODO: update the slider steps
      adjustVLine(filteredData, getMiddleIndex(filteredData));
      setSliderRange([newLeftPointIndex, newRightPointIndex]);
      setSliderValue(newMiddleIndex);
      // geotiffURLhandler(newMiddleIndex);
    }

    // if (plotRef.current) {
    //   const gd = (plotRef.current as any).el; // Get the raw Plotly DOM element
    //   const fullLayout = gd._fullLayout;
    //   const fullData = gd._fullData;
    //   // console.log("here we go");
    //   if (fullLayout && fullData) {
    //     const newPixelCoords: any = [];
    //     const xPxCoords: any = [];
    //     fullData.forEach((trace: any) => {
    //       if (trace.x && trace.y && fullLayout.xaxis && fullLayout.yaxis) {
    //         const xaxis = fullLayout.xaxis;
    //         const yaxis = fullLayout.yaxis;
    //         const l = fullLayout.margin.l;
    //         const t = fullLayout.margin.t;

    //         for (let i = 0; i < trace.x.length; i++) {
    //           const xData = trace.x[i];
    //           const yData = trace.y[i];
    //           // Convert data coordinates to pixel coordinates
    //           const xPx = xaxis.l2p(new Date(xData).getTime()) + l; // Add left margin offset
    //           const yPx = yaxis.l2p(yData) + t; // Add top margin offset
    //           xPxCoords.push(xPx);

    //           newPixelCoords.push({
    //             x: xPx,
    //             y: yPx,
    //             traceIndex: trace.index,
    //             pointIndex: i,
    //           });
    //         }
    //       }
    //     });
    //     // console.log(newPixelCoords);
    //     // console.log(xPxCoords);
    //     // setPixelCoords(newPixelCoords);
    //   }
    // }
  };

  //   const geotiffURLhandler = (activeIndex: number) => {
  //   const date = new Date(stateData[activeIndex]?.timestamp || "2025-01-01")
  //     .toISOString()
  //     .slice(0, 10)
  //     .replaceAll("-", "");
  //   const tif_location = "/assets/geotifs/";
  //   const tif_base = "GIOVANNI-timeAvgMap.M2T1NXAER_5_12_4_BCCMASS.";
  //   const tif_date = "20250101-20250101";
  //   const tif_tail = ".45W_13S_126E_51N.tif";

  //   // React state manages this for us?
  //   if (geoTiffUrl === `${tif_location}${tif_base}${date}-${date}${tif_tail}`)
  //     return;
  //   setGeoTiffUrl(`${tif_location}${tif_base}${date}-${date}${tif_tail}`);
  // };

  const sliderValueChangeHandler = (e: RangeCustomEvent) => {
    if (!stateData.length) return;
    const activeIndex = Number(e.detail.value);
    adjustVLine(stateData, activeIndex);
    setSliderValue(activeIndex);
    // geotiffURLhandler(activeIndex);
    //  setSliderRange(filteredData.length - 1);
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
      const currentDatediff = currentEndTime - currentBeginTime;
      const newBeginTime = currentBeginTime - currentDatediff;

      fetchMoreData(
        new Date(newBeginTime).toISOString(),
        new Date(currentEndTime).toISOString()
      );
      return;
    }

    // No more data in the visible area of Plot -- display the next portion
    if (stateData[nextIndex] !== undefined && nextIndex < sliderRange[0]) {
      console.log("we are here");
      return;
    }

    setSliderValue((prevNum) => prevNum - 1);
    adjustVLine(stateData, sliderValue - 1);
    // setSliderRange(filteredData.length - 1);
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
      const currentDatediff = currentEndTime - currentBeginTime;
      const newEndTime = currentEndTime + currentDatediff;

      console.log("loading more data!!!");
      fetchMoreData(
        new Date(currentBeginTime).toISOString(),
        new Date(newEndTime).toISOString()
      );
      return;
    }

    // No more data in the visible area of Plot -- display the next portion
    if (stateData[nextIndex] !== undefined && nextIndex > sliderRange[1]) {
      console.log("we are here");
      return;
    }

    setSliderValue((prevNum) => prevNum + 1);
    adjustVLine(stateData, nextIndex);
    // geotiffURLhandler(nextIndex);
  };

  // const nextChunkHandler = () => {
  //   // if (stateData.length < NUM_DATA_TO_SHOW) return;
  //   // setDataRangeMin((prevNum) => {
  //   //   console.log(
  //   //     "math min: ",
  //   //     Math.min(stateData.length, prevNum + NUM_DATA_TO_SHOW)
  //   //   );
  //   //   return Math.min(stateData.length, prevNum + NUM_DATA_TO_SHOW);
  //   // });

  //   // setDataRangeMin((prevNum) => prevNum + NUM_DATA_TO_SHOW);
  // };

  // NUM_DATA_TO_SHOW = 50
  // 49 - (49 % 50) = 49
  // const prevChunkHandler = () => {
  //   // if (stateData.length < NUM_DATA_TO_SHOW) return;
  //   // if (dataRangeMin === 0) return;
  //   // setDataRangeMin((prevNum) =>
  //   //   Math.max(
  //   //     NUM_DATA_TO_SHOW,
  //   //     prevNum % NUM_DATA_TO_SHOW === 0
  //   //       ? prevNum - NUM_DATA_TO_SHOW
  //   //       : prevNum - (prevNum % NUM_DATA_TO_SHOW)
  //   //   )
  //   // );
  //   // 10, 20
  //   // setDataRangeMin(
  //   //   (prevNum) =>
  //   //     // Math.max(NUM_DATA_TO_SHOW, prevNum - NUM_DATA_TO_SHOW)
  //   //     prevNum - NUM_DATA_TO_SHOW
  //   // );
  // };

  // useEffect(() => {
  //   setDataRangeMin(
  //     stateData.length >= NUM_DATA_TO_SHOW ? NUM_DATA_TO_SHOW : stateData.length
  //   );
  // }, [stateData.length]);
  // console.log(plotRef.current);
  // let sliderWidth = 400;
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (plotRef.current !== null) {
  //       sliderWidth =
  //         (plotRef.current as any).el.getBoundingClientRect().width -
  //         MARGIN_INLINE * 2;
  //       // console.log((plotRef.current as any).el.getBoundingClientRect().width);
  //       // console.log((plotRef.current as any).el.querySelector(".nsewdrag.drag"));
  //     }
  //   };
  //   // console.log(sliderWidth);
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  // useEffect(() => {
  //   if (plotRef.current) {
  //     const gd = (plotRef.current as any).el; // Get the raw Plotly DOM element
  //     const fullLayout = gd._fullLayout;
  //     const fullData = gd._fullData;
  //     console.log("here we go");
  //     if (fullLayout && fullData) {
  //       const newPixelCoords: any = [];
  //       const xPxCoords: any = [];
  //       fullData.forEach((trace: any) => {
  //         if (trace.x && trace.y && fullLayout.xaxis && fullLayout.yaxis) {
  //           const xaxis = fullLayout.xaxis;
  //           const yaxis = fullLayout.yaxis;
  //           const l = fullLayout.margin.l;
  //           const t = fullLayout.margin.t;
  //           for (let i = 0; i < trace.x.length; i++) {
  //             const xData = trace.x[i];
  //             const yData = trace.y[i];
  //             // Convert data coordinates to pixel coordinates
  //             const xPx = xaxis.l2p(new Date(xData).getTime()) + l; // Add left margin offset
  //             const yPx = yaxis.l2p(yData) + t; // Add top margin offset
  //             xPxCoords.push(xPx);
  //             newPixelCoords.push({
  //               x: xPx,
  //               y: yPx,
  //               traceIndex: trace.index,
  //               pointIndex: i,
  //             });
  //           }
  //         }
  //       });
  //       console.log(newPixelCoords);
  //       console.log(xPxCoords);
  //       // setPixelCoords(newPixelCoords);
  //     }
  //   }
  // }, [plotRef.current]);

  return (
    <IonPage>
      <Header title="Time Series Data" />
      <IonContent className="ion-padding">
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
            header="Alert"
            message={alertMessage}
            buttons={["OK"]}
            onDidDismiss={() => setAlertMessage(null)}
          />
        )}
        <OpenLayersMap
          width={
            plotState.layout.width === undefined
              ? 500
              : plotState.layout.width - MARGIN_INLINE * 2
          }
        />
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
        <Slider
          onLeftBtnClick={sliderLeftBtnHandler}
          onRightBtnClick={sliderRightBtnHandler}
          value={sliderValue}
          max={sliderRange[1]}
          // prettier-ignore
          width={
            plotState.layout.width === undefined
              ? 500
              : plotState.layout.width - (MARGIN_INLINE * 2)
          }
          min={sliderRange[0]}
          // prettier-ignore
          onValueChange={sliderValueChangeHandler}
          // pinFormatter={(index: number) => `${stateData[index]?.timestamp}`}
          pinFormatter={
            (index: number) => `${stateData[index]?.timestamp}`
            // stateData[index]?.timestamp &&
            // `${new Date(stateData[index]?.timestamp).toLocaleDateString(
            //   "en-US"
            // )}`
          }
          disabled={!stateData.length}
        />
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton
                expand="block"
                fill="outline"
                // onClick={() =>
                //   handlePlotData({
                //     lat: latitude,
                //     lon: longitude,
                //     begin_time: beginTime,
                //     end_time: endTime,
                //     variable,
                //   })
                // }
                disabled={isLoading}
              >
                {isLoading ? "Wait..." : "Plot Data"}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid>
          <IonRow>
            <IonCol>
              <h3>Selected Parameters:</h3>
              <div>Variable: {selectedVariable}</div>
              <div>Begin time: {formatDate(selectedBeginTime)}</div>
              <div>End time: {formatDate(selectedEndTime)}</div>
              <div>
                Coordiantes: {selectedLat}, {selectedLon}
              </div>
            </IonCol>
            <IonCol>
              <h3>Currently Visualizing:</h3>
              <div>Variable: {stateMetadata?.prod_name}</div>
              {stateMetadata?.begin_time && (
                <div>Begin time: {formatDate(stateMetadata.begin_time)}</div>
              )}
              {stateMetadata?.end_time && (
                <div>End time: {formatDate(stateMetadata.end_time)}</div>
              )}
              {stateMetadata?.lat && (
                <div>
                  Coordiantes: {stateMetadata.lat}, {stateMetadata.lon}
                </div>
              )}
              <div>
                Approx. used space:{" "}
                {(usedSpace &&
                  totalSpace &&
                  ((usedSpace / totalSpace) * 100).toFixed(10)) ||
                  indexedDBUsageError}
                %
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Visuals;
