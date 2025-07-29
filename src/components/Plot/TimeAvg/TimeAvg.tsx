import React, { useEffect, useState, useRef } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import Plotly from "plotly.js-dist-min";

import {
  TimeSeriesDataRow,
  TimeSeriesMetadata,
  TimeAvgDataRow,
  TimeAvgMetadata,
} from "../../../types/time-series.types";
import { useDataParams } from "../../../store/DataParamsContext";
import { getMiddleIndex, filterDataBetweenDates } from "../helpers";
import { timeAvgCsvParser } from "../../../helpers/time-series";
import { schema, MARGIN_INLINE } from "../plotSchema";
import useWindowDimensions from "../../../hooks/useWindowDimensions";

import Header from "../../Layout/Header";
import Slider from "../Slider";
import OLMap from "../OLMap/OLMap";
import TimeSeriesPlot from "../TimeSeriesPlot";

import "../Plot.css";

const Visuals: React.FC = () => {
  const { latitude, longitude, beginTime, endTime, variable } = useDataParams();
  const abortController = useRef<AbortController | null>(null);
  const [stateData, setStateData] = useState<
    TimeSeriesDataRow[] | TimeAvgDataRow[]
  >([]);
  const [stateMetadata, setStateMetaData] = useState<
    TimeSeriesMetadata | TimeAvgMetadata | undefined
  >(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(MARGIN_INLINE * -2);
  const [sliderRange, setSliderRange] = useState([0, 10]);
  const plotRef = useRef<Plotly.PlotlyHTMLElement | HTMLElement | null>(null);
  const [geoTiffUrl, setGeoTiffUrl] = useState(
    "/assets/geotifs/GIOVANNI-timeAvgMap.M2T1NXAER_5_12_4_BCCMASS.20250101-20250101.45W_13S_126E_51N.tif"
  );

  const { height, width } = useWindowDimensions();

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
   * Update Plot State when data (stateData) is changed
   */
  useEffect(() => {
    if (stateData.length === 0) return;

    const plotData: Partial<Plotly.Data>[] = [
      {
        x: stateData.map((d) => d.timestamp),
        y: stateData.map((d) => d.value),
        type: "scatter",
        mode: "lines",
        line: { color: "blue" },
      },
    ];

    let verticalLine: Partial<Plotly.Shape> = {};
    if (plotState.layout.shapes !== undefined) {
      verticalLine = {
        ...plotState.layout?.shapes[0],
        visible: stateData.length ? true : false,
        x0: stateData[getMiddleIndex(stateData)]?.timestamp, // x bottom
        x1: stateData[getMiddleIndex(stateData)]?.timestamp, // x top
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

    const plotLayout: Partial<Plotly.Layout> = {
      ...plotState.layout,
      width: width,
      shapes: [verticalLine],
      xaxis: {
        ...plotState.layout.xaxis,
        title: "Date & Time",
      },
      annotations: [plotAnnotation],
    };

    setPlotState({ data: plotData, layout: plotLayout }); // get prevSt
    setSliderValue(getMiddleIndex(stateData));
    setSliderRange([0, stateData.length - 1]);
  }, [stateData]);

  const handlePlotData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const csvURL = "/assets/bccmass-20250101-20250110.csv";

      abortController.current = new AbortController();

      const response = await fetch(csvURL);
      const csvData = await response.text();
      const { metadata, data } = timeAvgCsvParser(csvData);

      setStateData(data);
      setStateMetaData(metadata);
    } catch (error) {
      error instanceof Error
        ? setError(error.message)
        : setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const adjustVLine = (newXrange: string[], activeIndex: number) => {
    if (plotState.layout.shapes === undefined) return;
    const newVerticalLine: Partial<Plotly.Shape> = {
      ...plotState.layout?.shapes[0],
      visible: true,
      x0: newXrange[activeIndex],
      x1: newXrange[activeIndex],
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

  const plotRelayoutHandler = (e: any) => {
    const newLeftPoint = e["xaxis.range[0]"];
    const newRightPoint = e["xaxis.range[1]"];

    if (newLeftPoint && newRightPoint) {
      const filteredDates = filterDataBetweenDates(
        newLeftPoint,
        newRightPoint,
        [...stateData.map((d) => d.timestamp)]
      );

      if (filteredDates.length === 0) return;

      const newLeftPointIndex = stateData.findIndex(
        (data) => data.timestamp === filteredDates[0]
      );
      const newRightPointIndex = stateData.findIndex(
        (data) => data.timestamp === filteredDates[filteredDates.length - 1]
      );
      const newMiddleIndex = stateData.findIndex(
        (data) =>
          data.timestamp === filteredDates[getMiddleIndex(filteredDates)]
      );

      adjustVLine(filteredDates, getMiddleIndex(filteredDates));
      setSliderRange([newLeftPointIndex, newRightPointIndex]);
      setSliderValue(newMiddleIndex);
      geotiffURLhandler(newMiddleIndex);
    }
  };

  const geotiffURLhandler = (activeIndex: number) => {
    const date = new Date(stateData[activeIndex]?.timestamp || "2025-01-01")
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "");
    const tif_location = "/assets/geotifs/";
    const tif_base = "GIOVANNI-timeAvgMap.M2T1NXAER_5_12_4_BCCMASS.";
    // const tif_date = "20250101-20250101";
    const tif_tail = ".45W_13S_126E_51N.tif";

    // React state manages this for us?
    if (geoTiffUrl === `${tif_location}${tif_base}${date}-${date}${tif_tail}`)
      return;
    setGeoTiffUrl(`${tif_location}${tif_base}${date}-${date}${tif_tail}`);
  };

  const sliderValueChangeHandler = (e: any) => {
    if (!stateData.length) return;
    const activeIndex = e.detail.value;
    console.log("activeIndex: ", activeIndex);
    adjustVLine([...stateData.map((d) => d.timestamp)], activeIndex);
    setSliderValue(activeIndex);
    geotiffURLhandler(activeIndex);
  };

  const sliderLeftBtnHandler = () => {
    if (stateData.length === 0) return;
    if (sliderValue === 0) return;
    setSliderValue((prevNum) => prevNum - 1);
    adjustVLine([...stateData.map((d) => d.timestamp)], sliderValue - 1);
    geotiffURLhandler(sliderValue - 1);
  };

  const sliderRightBtnHandler = () => {
    if (stateData.length === 0) return;
    setSliderValue((prevNum) => prevNum + 1);
    adjustVLine([...stateData.map((d) => d.timestamp)], sliderValue + 1);
    geotiffURLhandler(sliderValue + 1);
  };

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
        <OLMap
          width={
            plotState.layout.width === undefined
              ? 500
              : plotState.layout.width - MARGIN_INLINE * 2
          }
          tifURL={geoTiffUrl}
        />

        <TimeSeriesPlot
          plotRef={plotRef}
          layout={plotState.layout}
          plotData={[...plotState.data]}
          onPlotRelayout={plotRelayoutHandler}
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
          pinFormatter={(index: number) => `${stateData[index]?.timestamp}`}
          disabled={!stateData.length}
        />
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton
                expand="block"
                fill="outline"
                onClick={handlePlotData}
                disabled={isLoading}
              >
                {isLoading ? "Wait..." : "Plot Data"}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Visuals;
