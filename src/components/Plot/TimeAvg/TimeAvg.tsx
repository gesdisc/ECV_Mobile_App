import React, { useEffect, useState, useRef } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
} from "@ionic/react";
import { server, informationCircle, download } from "ionicons/icons";
import Plotly from "plotly.js-dist-min";

import {
  TimeSeriesDataRow,
  TimeSeriesMetadata,
  TimeAvgDataRow,
  TimeAvgMetadata,
} from "../../../types/time-series.types";
import { getMiddleIndex, filterDataBetweenDates } from "../helpers";
import { timeAvgCsvParser } from "../../../helpers/time-series";
import { schema, MARGIN_INLINE } from "../plotSchema";

import Slider from "../Slider";
import OLMap from "../OLMap/OLMap";
import TimeSeriesPlot from "../TimeSeriesPlot";
import Banner from "../../UI/Banner";

// import styles from "./Plot.module.css";

/**
 * Note: This component is for demo/testing purposes. It should be either modifed or combined with Plot.tsx in the future.
 *
 * @Summary This is the same Plot.tsx component with limited functional.
 * Specifically made to support the time averaged (time series + map) feature.
 * It uses the local CSV (and tiffs) instead of fetching data from Cloud Giovanni API.
 * To interact with the map and geotiff layers on UI, navigate to ./pages/PlotPage.tsx and return TimeAvg component instead of Plot component.
 *
 */
const TimeAvg: React.FC = () => {
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

  /* GEOTIFF */
  const [geoTiffUrl, setGeoTiffUrl] = useState("");
  /* GEOTIFF */

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

    const plotLayout: Partial<Plotly.Layout> = {
      ...plotState.layout,
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
    // setGeoTiffUrl(
    //   "/assets/geotifs/GIOVANNI-timeAvgMap.M2T1NXAER_5_12_4_BCCMASS.20250101-20250101.45W_13S_126E_51N.tif"
    // );
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
      setGeoTiffUrl(
        "/assets/geotifs/GIOVANNI-timeAvgMap.M2T1NXAER_5_12_4_BCCMASS.20250101-20250101.45W_13S_126E_51N.tif"
      );
      //   workerRef.current.postMessage(csvData);
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
    if (stateData.length === 0) return;
    const plotLeftPoint = e["xaxis.range[0]"];
    const plotRightPoint = e["xaxis.range[1]"];
    let plotLeftPointIndex: number | null = null;
    let plotRightPointIndex: number | null = null;
    let plotMiddlePointIndex: number | null = null;

    if (plotLeftPoint && plotRightPoint) {
      const filteredDates = filterDataBetweenDates(
        plotLeftPoint,
        plotRightPoint,
        [...stateData.map((d) => d.timestamp)]
      );

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
      geotiffURLhandler(plotMiddlePointIndex);
    } else {
      setSliderRange([0, stateData.length - 1]);
    }
  };

  const geotiffURLhandler = (activeIndex: number) => {
    const date = stateData[activeIndex]?.timestamp;
    const formattedDate = date.slice(0, date.indexOf("T")).replaceAll("-", "");

    const tif_location = "/assets/geotifs/";
    const tif_base = "GIOVANNI-timeAvgMap.M2T1NXAER_5_12_4_BCCMASS.";
    // const tif_date = "20250101-20250101";
    // const tif_date = "20250101-20250101";
    const tif_tail = ".45W_13S_126E_51N.tif";

    setGeoTiffUrl(
      `${tif_location}${tif_base}${formattedDate}-${formattedDate}${tif_tail}`
    );
  };

  const sliderValueChangeHandler = (e: any) => {
    if (!stateData.length) return;
    const activeIndex = e.detail.value;

    adjustVLine([...stateData.map((d) => d.timestamp)], activeIndex);
    setSliderValue(activeIndex);
    geotiffURLhandler(activeIndex);
    (Plotly as any).Fx.hover("divId", [
      { curveNumber: 0, pointNumber: activeIndex },
    ]);
  };

  const sliderLeftBtnHandler = () => {
    if (stateData.length === 0) return;
    if (sliderValue === 0) return;
    const nextIndex = sliderValue - 1;
    if (stateData[nextIndex] === undefined) return;

    setSliderValue((prevNum) => prevNum - 1);
    adjustVLine([...stateData.map((d) => d.timestamp)], nextIndex);
    geotiffURLhandler(nextIndex);
    (Plotly as any).Fx.hover("divId", [
      { curveNumber: 0, pointNumber: nextIndex },
    ]);
  };

  const sliderRightBtnHandler = () => {
    if (stateData.length === 0) return;
    const nextIndex = sliderValue + 1;

    if (stateData[nextIndex] === undefined) return;
    setSliderValue((prevNum) => prevNum + 1);
    adjustVLine([...stateData.map((d) => d.timestamp)], nextIndex);
    geotiffURLhandler(nextIndex);
    adjustVLine([...stateData.map((d) => d.timestamp)], nextIndex);
    (Plotly as any).Fx.hover("divId", [
      { curveNumber: 0, pointNumber: nextIndex },
    ]);
  };

  const downloadPlotImage = () => {
    Plotly.downloadImage("divId", {
      format: "png",
      filename: "my_plot",
      height: 500,
      width: 700,
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>
              {stateData.length > 0 && "Black Carbon Mass Density"}
            </span>
            <div>
              <IonButton size="small" fill="clear">
                <IonIcon
                  aria-hidden="true"
                  size="large"
                  icon={download}
                  color="primary"
                  onClick={downloadPlotImage}
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
          <IonGrid fixed>
            <IonRow>
              <IonCol
                size="12"
                style={{
                  minHeight: "200px",
                }}
              >
                <OLMap tifURL={geoTiffUrl} />
              </IonCol>

              <IonCol
                size="12"
                style={{
                  minHeight: "300px",
                }}
              >
                <TimeSeriesPlot
                  plotRef={plotRef}
                  layout={plotState.layout}
                  plotData={[...plotState.data]}
                  onPlotRelayout={plotRelayoutHandler}
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
                    min={sliderRange[0]}
                    onValueChange={sliderValueChangeHandler}
                    pinFormatter={(index: number) =>
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
            onClick={handlePlotData}
            disabled={isLoading}
          >
            {isLoading ? "Wait..." : "Plot Data"}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TimeAvg;
