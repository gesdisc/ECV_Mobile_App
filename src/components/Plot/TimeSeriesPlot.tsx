import React, { useRef, useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Plotly from "plotly.js-dist-min";

import {
  TimeSeriesDataRow,
  TimeSeriesMetadata,
} from "../../types/time-series.types";

import {
  IonButton,
  IonIcon,
  IonRange,
  IonRow,
  IonCol,
  IonGrid,
} from "@ionic/react";
// import {
//   heart,
//   logoApple,
//   settingsSharp,
//   star,
//   caretForwardOutline,
// } from "ionicons/icons";

const getMiddleIndex = (arr: Array<any>) => {
  if (arr.length === 0) return 0;
  if (arr.length % 2 !== 0) {
    return Math.floor(arr.length / 2);
  }
  return Math.floor(arr.length / 2) - 1;
};

const filterDataBetweenDates = (
  startDate: string,
  endDate: string,
  dataArray: TimeSeriesDataRow[]
) => {
  return dataArray.filter(
    (d) =>
      new Date(d.timestamp).getTime() >= new Date(startDate).getTime() &&
      new Date(d.timestamp).getTime() <= new Date(endDate).getTime()
  );
};

interface TimeSeriesProps {
  metadata: TimeSeriesMetadata | undefined;
  data: TimeSeriesDataRow[];
  // minRange?: number;
  // maxRange?: number;
}

interface Figure {
  data: Plotly.Data[];
  layout: Partial<Plotly.Layout>;
  frames?: Partial<Plotly.Frame>[];
}

const TimeSeriesPlot: React.FC<TimeSeriesProps> = ({
  metadata,
  data,
  // minRange,
  // maxRange,
}) => {
  // const largestYValue: any = Math.max(...data.map((d) => Number(d.value)));
  // const smallestYValue: any = Math.min(...data.map((d) => Number(d.value)));
  // const [plotWidth, setPlotWidth] = useState(0);
  // const [sliderValue, setSliderValue] = useState(0);
  // const [plotState, setPlotState] = useState<{
  //   data: Plotly.Data[];
  //   layout: Partial<Plotly.Layout>;
  // }>({
  //   data: [],
  //   layout: {},
  // });

  const [sliderMax, setSliderMax] = useState(0);
  const plotRef = useRef(null);
  const PLOT_DIV_ID = "PLOT_DIV_ID";

  const plotData: Plotly.Data = {
    x: data.map((d) => d.timestamp),
    y: data.map((d) => d.value),
    type: "scatter",
    // mode: "lines+markers",
    mode: "lines",
    line: { color: "blue" },
    name: metadata?.param_short_name || "",
  };

  const slider: Partial<Plotly.Slider> = {
    // lenmode: "pixels",
    // minorticklen: 20,
    // tickcolor: "red",
    // ticklen: 19,
    active: getMiddleIndex(data),
    pad: { t: 30, r: -10, l: -10 }, // negative values to match the Plot width
    // currentvalue: {
    //   xanchor: "left",
    //   prefix: "color: ",
    //   font: {
    //     color: "#888",
    //     size: 20,
    //   },
    //   // visible: false,
    // },
    steps: data.map((d) => {
      return {
        label: d.timestamp,
        execute: false,
        method: "relayout",
        args: ["shapes[0].x0", d.timestamp, "shapes[0].x1", d.timestamp],
      };
    }),
  };

  const verticalLine: Partial<Plotly.Shape> = {
    visible: true,
    type: "line",
    opacity: 1,
    x0: data[getMiddleIndex(data)]?.timestamp, // x bottom
    x1: data[getMiddleIndex(data)]?.timestamp, // x top
    y0: "-100", // y bottom
    y1: "200", // y top
    yref: "paper",
    ysizemode: "pixel",
    // xsizemode: "pixel",
    line: {
      color: "rgb(228, 24, 24)",
      width: 2,
      dash: "longdash",
    },
    // showlegend: true,
    // label: {
    //   texttemplate: "x0: %{x0}",
    //   // text: "Price drop",
    //   font: { size: 12, color: "blue" },
    //   // textposition: "start",
    //   xanchor: "right",
    //   yanchor: "bottom",
    // },
  };

  const layout: Partial<Plotly.Layout> = {
    // dragmode: "pan",
    legend: { x: 0, y: 1 },
    title: metadata?.param_name
      ? `${metadata?.param_name} (${metadata?.prod_name})`
      : "Select a variable to plot.",
    // hoverdistance: 10,
    hovermode: "x",
    // dragmode: false, // Disables panning and zooming
    sliders: [slider],
    shapes: [verticalLine],
    updatemenus: [
      {
        showactive: false,
        // pad: { t: 60 },
        type: "buttons",
        xanchor: "left",
        yanchor: "middle",
        x: 0,
        y: -0.5,
        direction: "right",
        font: {
          family: "FontAwesome",
          size: 20,
        },
        // buttons: [
        //   {
        //     name: "left",
        //     // method: "relayout",
        //     label: "<",
        //     args: [],
        //     // args: [
        //     //   "shapes[0].x0",
        //     //   data[4]?.timestamp,
        //     //   // "shapes[0].x1",
        //     //   // data[4]?.timestamp,
        //     // ],
        //     execute: false,
        //   },
        //   {
        //     name: "right",
        //     // method: "relayout",
        //     label: ">",
        //     args: [],
        //     // args: [
        //     //   "shapes[0].x0",
        //     //   data[5]?.timestamp,
        //     //   "shapes[0].x1",
        //     //   data[0]?.timestamp,
        //     // ],
        //     execute: false,
        //   },
        // ],
      },
    ],
    xaxis: {
      title: "Date & Time",
      // rangeslider: { visible: true, bgcolor: "blue" },
      showline: true,
      showspikes: true,
      // spikesnap: "category",
      spikesnap: "cursor",
      spikemode: "across",
      spikedash: "solid",
      spikecolor: "#000000",
      spikethickness: 2,
      // rangeselector: {
      //   buttons: [
      //     {
      //       count: 1,
      //       label: "1m",
      //       step: "month",
      //       stepmode: "backward",
      //     },
      //     {
      //       count: 6,
      //       label: "6m",
      //       step: "month",
      //       stepmode: "backward",
      //     },
      //     { step: "all" },
      //   ],
      // },
    },
    yaxis: {
      title: metadata?.param_short_name
        ? `${metadata?.param_short_name} (${metadata?.unit})`
        : "",
    },
    annotations: [
      {
        xref: "paper",
        yref: "paper",
        x: 0,
        xanchor: "left",
        y: 1,
        yanchor: "bottom",
        text:
          metadata?.lat && metadata?.lon
            ? `Lat: ${metadata?.lat}, Lon: ${metadata?.lon}`
            : "",
        showarrow: false,
      },
    ],
    margin: { t: 40, b: 60 },
  };

  // const btnClickHandler = (e: any) => {
  //   // console.log("btnClickHandler: ", e);
  //   const activeIndex = plotRef.current.el.layout.sliders[0].active;
  //   // left button
  //   if (e.button.name === "left") {
  //     if (data[activeIndex - 1] === undefined) return;
  //     Plotly.relayout(PLOT_DIV_ID, {
  //       shapes: [
  //         {
  //           ...verticalLine,
  //           x0: data[activeIndex - 1].timestamp,
  //           x1: data[activeIndex - 1].timestamp,
  //         },
  //       ],
  //     });
  //     return;
  //   }
  //   // right button
  //   if (e.button.name === "right") {
  //     if (data[activeIndex + 1] === undefined) return;
  //     Plotly.relayout(PLOT_DIV_ID, {
  //       shapes: [
  //         {
  //           ...verticalLine,
  //           x0: data[activeIndex + 1].timestamp,
  //           x1: data[activeIndex + 1].timestamp,
  //         },
  //       ],
  //     });
  //   }
  // };

  const sliderChangeHandler = (e: any) => {
    const activeIndex = e.slider.active;
    Plotly.relayout(PLOT_DIV_ID, {
      shapes: [
        {
          ...verticalLine,
          x0: data[activeIndex].timestamp,
          x1: data[activeIndex].timestamp,
        },
      ],
    });
  };

  const plotRelayoutHandler = (e: any) => {
    // console.log("plotRelayoutHandler: ", e);
    const newLeftPoint = e["xaxis.range[0]"];
    const newRightPoint = e["xaxis.range[1]"];
    setSliderMax(newLeftPoint);

    if (newLeftPoint && newRightPoint) {
      const filteredData = data.filter(
        (d) =>
          new Date(d.timestamp).getTime() >= new Date(newLeftPoint).getTime() &&
          new Date(d.timestamp).getTime() <= new Date(newRightPoint).getTime()
      );

      if (filteredData.length === 0) return;

      // setSliderMax(filteredData.length);

      // Plotly.newPlot(PLOT_DIV_ID, [plotData], {
      //   ...layout,
      //   shapes: [
      //     {
      //       ...verticalLine,
      //       x0: filteredData[getMiddleIndex(filteredData)].timestamp,
      //       x1: filteredData[getMiddleIndex(filteredData)].timestamp,
      //       // x0: filteredData[0].timestamp,
      //       // x1: filteredData[0].timestamp,
      //     },
      //   ],
      //   sliders: [
      //     {
      //       ...slider,
      //       steps: filteredData.map((d) => {
      //         return {
      //           label: d?.timestamp,
      //           execute: false,
      //           method: "relayout",

      //           args: [
      //             "shapes[0].x0",
      //             d?.timestamp,
      //             "shapes[0].x1",
      //             d?.timestamp,
      //           ],
      //         };
      //       }),
      //     },
      //   ],
      // });

      Plotly.relayout(PLOT_DIV_ID, {
        ...layout,
        shapes: [
          {
            ...verticalLine,
            x0: filteredData[getMiddleIndex(filteredData)].timestamp,
            x1: filteredData[getMiddleIndex(filteredData)].timestamp,
          },
        ],
        sliders: [
          {
            ...slider,
            steps: filteredData.map((d) => {
              return {
                label: d?.timestamp,
                execute: false,
                method: "relayout",
                args: [
                  "shapes[0].x0",
                  d?.timestamp,
                  // "shapes[0].x1",
                ],
              };
            }),
          },
        ],
      });
    }
  };

  // const triggerHover = (data: any) => {
  //   if (plotRef.current) {
  //     console.log("triggerHover", data);
  //     // console.log("ref: ", plotRef.current);
  //     // console.log(
  //     //   "active index: ",
  //     //   plotRef.current.el.layout.sliders[0].active
  //     // );
  //   }
  // };

  // calling setState inside Plot onUpdate causes infinite state change
  // const plotUpdateHandler = (figure: Figure, graphDiv: HTMLElement) => {
  //   console.log("plotUpdateHandler_______figure", figure);
  //   console.log("plotUpdateHandler_______graphDiv", graphDiv);
  //   if (figure.layout.xaxis) {
  //     const newLeftPoint = figure.layout;
  //     const newRightPoint = figure.layout.xaxis.range[1];
  //   }
  // };

  // const syncPlotHandler = (e: any) => {
  //   const activeIndex = e.detail.value;
  //   // if (activeIndex === 0 || activeIndex === sliderMax) return;
  //   // console.log("Data at index: ", activeIndex, data[activeIndex]);
  //   // console.log("activeIndex: ", activeIndex);
  //   Plotly.relayout(PLOT_DIV_ID, {
  //     shapes: [
  //       {
  //         ...verticalLine,
  //         x0: data[activeIndex].timestamp,
  //         x1: data[activeIndex].timestamp,
  //       },
  //     ],
  //   });
  // };

  // const sliderLeftBtnHandler = (e: any) => {
  //   console.log("left btn clicked: ", sliderValue);
  //   if (data[sliderValue - 1] === undefined) return;

  //   Plotly.relayout(PLOT_DIV_ID, {
  //     shapes: [
  //       {
  //         ...verticalLine,
  //         x0: data[sliderValue - 1].timestamp,
  //         x1: data[sliderValue - 1].timestamp,
  //       },
  //     ],
  //   });

  //   setSliderValue(sliderValue - 1);
  // };

  // const sliderRightBtnHandler = (e: any) => {
  //   console.log("right btn clicked: ", sliderValue);
  //   if (data[sliderValue + 1] === undefined) return;

  //   Plotly.relayout(PLOT_DIV_ID, {
  //     shapes: [
  //       {
  //         ...verticalLine,
  //         x0: data[sliderValue + 1].timestamp,
  //         x1: data[sliderValue + 1].timestamp,
  //       },
  //     ],
  //   });

  //   setSliderValue(sliderValue + 1);
  // };
  // console.log("sliderValue: ________", sliderValue);
  // const ionSliderChange = (e: any) => {
  //   setSliderValue(sliderValue);
  //   console.log("ionSliderChange: ", e.detail.value);
  // };

  return (
    <IonRow>
      <IonCol
        style={{
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <Plot
          ref={plotRef}
          divId={PLOT_DIV_ID}
          // onButtonClicked={btnClickHandler}
          onSliderChange={sliderChangeHandler}
          onRelayout={plotRelayoutHandler}
          // onUpdate={plotUpdateHandler}
          // onClick={}
          // onHover={plotHoverHandler}
          useResizeHandler={true}
          data={[plotData]}
          layout={layout}
          // layout={layout}
          style={{ width: "100%", height: "400px" }}
          config={{ responsive: true, displayModeBar: false }}
        />
        <IonGrid style={{ width: "100%" }}>
          <IonCol>
            <IonRow>
              {/* <IonButton size="small" onClick={sliderLeftBtnHandler}>
                {"<"}
              </IonButton> */}
              {/* <IonRange
                style={{ maxWidth: "230px" }}
                step={1}
                min={0}
                // max={sliderMax}
                max={data.length - 1}
                value={sliderValue}
                pin={true}
                // pinFormatter={(index: number) => `${data[index].timestamp}`}
                // onIonChange={ionSliderChange}
                // debounce={500}
                onIonInput={syncPlotHandler}
                ticks={true}
                snaps={true}
              /> */}
              {/* <IonButton size="small" onClick={sliderRightBtnHandler}>
                {">"}
              </IonButton> */}
            </IonRow>
          </IonCol>
        </IonGrid>
      </IonCol>
    </IonRow>
  );
};

export default TimeSeriesPlot;
