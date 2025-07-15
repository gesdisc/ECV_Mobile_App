import React, { useRef, useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Plotly from "plotly.js-dist-min";

import {
  TimeSeriesDataRow,
  TimeSeriesMetadata,
} from "../../types/time-series.types";
// import { IonButton, IonIcon, IonRange, IonRow, IonCol } from "@ionic/react";
// import {
//   heart,
//   logoApple,
//   settingsSharp,
//   star,
//   caretForwardOutline,
// } from "ionicons/icons";
interface TimeSeriesProps {
  metadata: TimeSeriesMetadata | undefined;
  data: TimeSeriesDataRow[];
  // minRange?: number;
  // maxRange?: number;
}
// console.log(Plotly);
const getMiddleIndex = (arr: Array<any>) => {
  if (arr.length === 0) return 0;
  if (arr.length % 2 !== 0) {
    return Math.floor(arr.length / 2);
  }
  return Math.floor(arr.length / 2) - 1;
};

const TimeSeriesPlot: React.FC<TimeSeriesProps> = ({
  metadata,
  data,
  // minRange,
  // maxRange,
}) => {
  // const largestYValue: any = Math.max(...data.map((d) => Number(d.value)));
  // const smallestYValue: any = Math.min(...data.map((d) => Number(d.value)));
  const plotRef = useRef<any>(null);

  const plotData: any = {
    x: data.map((d) => d.timestamp),
    y: data.map((d) => d.value),
    type: "scatter",
    // mode: "lines+markers",
    mode: "lines",
    line: { color: "blue" },
    name: metadata?.param_short_name || "",
  };

  const slider: any = {
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
        // label: d.timestamp,
        execute: false,
        method: "relayout",
        args: ["shapes[0].x0", d.timestamp, "shapes[0].x1", d.timestamp],
      };
    }),
  };

  const verticalLine: any = {
    visible: true,
    type: "line",
    opacity: 1,
    x0: data[getMiddleIndex(data)]?.timestamp, // x bottom
    x1: data[getMiddleIndex(data)]?.timestamp, // x top
    // y0: 0, // y bottom
    // y1: largestYValue || 10000, // y top
    // yref: "paper",
    // layer: "above",

    // TESTING WITH PIXELS
    // x0: "10",
    // x1: "10", // x top
    y0: "-100", // y bottom
    y1: "200", // y top
    yref: "paper",
    // xref: "paper",
    ysizemode: "pixel",
    // xsizemode: "pixel",
    // TESTING WITH PIXELS

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

  const layout: any = {
    // dragmode: "pan",
    legend: { x: 0, y: 1 },
    title: metadata?.param_name
      ? `${metadata?.param_name} (${metadata?.prod_name})`
      : "Select a variable to plot.",
    // hoverdistance: 10,
    hovermode: "x",
    // dragmode: false, // Disables panning and zooming
    sliders: [slider],
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
          showactive: true,
          family: "FontAwesome",
          size: 20,
        },
        buttons: [
          {
            name: "left",
            // method: "relayout",
            label: "<",
            args: [],
            // args: [
            //   "shapes[0].x0",
            //   data[4]?.timestamp,
            //   // "shapes[0].x1",
            //   // data[4]?.timestamp,
            // ],
            execute: false,
          },
          {
            name: "right",
            // method: "relayout",
            label: ">",
            args: [],
            // args: [
            //   "shapes[0].x0",
            //   data[5]?.timestamp,
            //   "shapes[0].x1",
            //   data[0]?.timestamp,
            // ],
            execute: false,
          },
        ],
      },
    ],
    shapes: [verticalLine],

    xaxis: {
      title: "Date & Time",
      // range: [data[minRange]?.timestamp, data[maxRange]?.timestamp],
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

  const btnClickHandler = (e: any) => {
    // console.log("btnClickHandler: ", e);
    const activeIndex = plotRef.current.el.layout.sliders[0].active;
    // left button
    if (e.button.name === "left") {
      if (data[activeIndex - 1] === undefined) return;
      Plotly.relayout("divId", {
        shapes: [
          {
            ...verticalLine,
            x0: data[activeIndex - 1].timestamp,
            x1: data[activeIndex - 1].timestamp,
          },
        ],
      });
      return;
    }
    // right button
    if (e.button.name === "right") {
      if (data[activeIndex + 1] === undefined) return;
      Plotly.relayout("divId", {
        shapes: [
          {
            ...verticalLine,
            x0: data[activeIndex + 1].timestamp,
            x1: data[activeIndex + 1].timestamp,
          },
        ],
      });
    }
  };

  const sliderChangeHandler = (e: any) => {
    const activeIndex = e.slider.active;
    Plotly.relayout("divId", {
      shapes: [
        {
          ...verticalLine,
          x0: data[activeIndex].timestamp,
          x1: data[activeIndex].timestamp,
        },
      ],
    });
  };

  const sliderRelHandler = (e: any) => {
    // console.log("sliderRelHandler: ", e);
    // if (e["xaxis.range[0]"]) {
    //   console.log("sliderRelHandler: ", e["xaxis.range[0]"]);
    //   console.log("sliderRelHandler: ", e["xaxis.range[1]"]);
    //   const newData = data.slice(
    //     data.indexOf(e["xaxis.range[0]"]),
    //     data.indexOf(e["xaxis.range[1]"])
    //   );
    //   console.log(newData);
    //   console.log(data);
    //   console.log(data.findIndex((d) => d.timestamp === e["xaxis.range[0]"]));
    // }
    // Plotly.relayout("divId", {
    //   // shapes: [
    //   //   {
    //   //     ...verticalLine,
    //   //     x0: data[activeIndex - 1].timestamp,
    //   //     x1: data[activeIndex - 1].timestamp,
    //   //   },
    //   // ],
    //   sliders: [
    //     {
    //       ...slider,
    //       steps: e.layout.xaxis.map((d: any) => {
    //         return {
    //           // label: d.timestamp,
    //           execute: false,
    //           method: "relayout",
    //           args: ["shapes[0].x0", d.timestamp, "shapes[0].x1", d.timestamp],
    //         };
    //       }),
    //     },
    //   ],
    // });
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

  // const updateHandler = (figure: any, graphDiv: any) => {
  //   // This function is called when the plot updates (including layout changes)
  //   // console.log("Plot updated! ", figure);
  //   // console.log("Updated layout: ", figure.layout);
  //   // console.log("graphDiv: ", graphDiv);
  //   // figure.layout.shapes.opacity = 0.5;
  //   // setShapeOpacity(0.5);
  //   // You can perform actions based on the updated layout here
  // };

  // const handleRelayout = () => {
  //   if (plotRef.current && plotRef.current.el) {
  //     const graphDiv = plotRef.current.el; // Get the DOM element
  //     const update = {
  //       // title: "New Plot Title",
  //       "xaxis.range": [0, 10], // Example: update x-axis range
  //     };
  //     Plotly.relayout(graphDiv, update);
  //   }
  // };

  const plotUpdateHandler = (e: any) => {
    console.log("plotUpdateHandler", e);
    // Plotly.relayout("divId", {
    //   // shapes: [
    //   //   {
    //   //     ...verticalLine,
    //   //     x0: data[activeIndex - 1].timestamp,
    //   //     x1: data[activeIndex - 1].timestamp,
    //   //   },
    //   // ],
    //   sliders: [
    //     {
    //       ...slider,
    //       steps: e.layout.xaxis.map((d: any) => {
    //         return {
    //           // label: d.timestamp,
    //           execute: false,
    //           method: "relayout",
    //           args: ["shapes[0].x0", d.timestamp, "shapes[0].x1", d.timestamp],
    //         };
    //       }),
    //     },
    //   ],
    // });
  };

  return (
    <>
      <Plot
        ref={plotRef}
        divId="divId"
        // onHover={triggerHover}
        onButtonClicked={btnClickHandler}
        onSliderChange={sliderChangeHandler}
        // onRelayout={sliderRelHandler}
        onUpdate={plotUpdateHandler}
        // onUpdate={(figure: any, graphDiv: any) =>
        //   updateHandler(figure, graphDiv)
        // }
        // onClick={plotHoverHandler}
        // onHover={plotHoverHandler}
        data={[plotData]}
        layout={layout}
        style={{ width: "100%", height: "400px" }}
        config={{ responsive: true, displayModeBar: false }}
      />
      {/* <IonRow>
        <IonCol>
          <IonButton size="small" onClick={ionicButtonHandler}>
            {"<"}
          </IonButton>
          <IonButton size="small" onClick={ionicButtonHandler}>
            {">"}
          </IonButton>
          <IonRange
            step={1}
            min={0}
            max={data.length}
            // value={rangeValue}
            // pin={true}
            // pinFormatter={(index: number) => `${data[index].timestamp}`}
            // onIonChange={(e) => setRangeValue(e.detail.value)}
            // debounce={500}
            onIonInput={syncPlotHandler}
          />
        </IonCol>
      </IonRow> */}
    </>
  );
};

export default TimeSeriesPlot;
