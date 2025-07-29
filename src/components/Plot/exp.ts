// const plotData: Plotly.Data = {
//     x: data.map((d) => d.timestamp),
//     y: data.map((d) => d.value),
//     type: "scatter",
//     // mode: "lines+markers",
//     mode: "lines",
//     line: { color: "blue" },
//     name: metadata?.param_short_name || "",
//   };

//   const slider: Partial<Plotly.Slider> = {
//     // lenmode: "pixels",
//     // minorticklen: 20,
//     // tickcolor: "red",
//     // ticklen: 19,
//     active: getMiddleIndex(data),
//     pad: { t: 30, r: -10, l: -10 }, // negative values to match the Plot width
//     // currentvalue: {
//     //   xanchor: "left",
//     //   prefix: "color: ",
//     //   font: {
//     //     color: "#888",
//     //     size: 20,
//     //   },
//     //   // visible: false,
//     // },
//     steps: data.map((d) => {
//       return {
//         label: d.timestamp,
//         execute: false,
//         method: "relayout",
//         args: ["shapes[0].x0", d.timestamp, "shapes[0].x1", d.timestamp],
//       };
//     }),
//   };

//   const verticalLine: Partial<Plotly.Shape> = {
//     visible: true,
//     type: "line",
//     opacity: 1,
//     x0: data[getMiddleIndex(data)]?.timestamp, // x bottom
//     x1: data[getMiddleIndex(data)]?.timestamp, // x top
//     y0: "-100", // y bottom
//     y1: "200", // y top
//     yref: "paper",
//     ysizemode: "pixel",
//     // xsizemode: "pixel",
//     line: {
//       color: "rgb(228, 24, 24)",
//       width: 2,
//       dash: "longdash",
//     },
//     // showlegend: true,
//     // label: {
//     //   texttemplate: "x0: %{x0}",
//     //   // text: "Price drop",
//     //   font: { size: 12, color: "blue" },
//     //   // textposition: "start",
//     //   xanchor: "right",
//     //   yanchor: "bottom",
//     // },
//   };

//   const layout: Partial<Plotly.Layout> = {
//     // dragmode: "pan",
//     legend: { x: 0, y: 1 },
//     title: metadata?.param_name
//       ? `${metadata?.param_name} (${metadata?.prod_name})`
//       : "Select a variable to plot.",
//     // hoverdistance: 10,
//     hovermode: "x",
//     // dragmode: false, // Disables panning and zooming
//     sliders: [slider],
//     shapes: data.length ? [verticalLine] : [],
//     updatemenus: [
//       {
//         showactive: false,
//         // pad: { t: 60 },
//         type: "buttons",
//         xanchor: "left",
//         yanchor: "middle",
//         x: 0,
//         y: -0.5,
//         direction: "right",
//         font: {
//           family: "FontAwesome",
//           size: 20,
//         },
//         // buttons: [
//         //   {
//         //     name: "left",
//         //     // method: "relayout",
//         //     label: "<",
//         //     args: [],
//         //     // args: [
//         //     //   "shapes[0].x0",
//         //     //   data[4]?.timestamp,
//         //     //   // "shapes[0].x1",
//         //     //   // data[4]?.timestamp,
//         //     // ],
//         //     execute: false,
//         //   },
//         //   {
//         //     name: "right",
//         //     // method: "relayout",
//         //     label: ">",
//         //     args: [],
//         //     // args: [
//         //     //   "shapes[0].x0",
//         //     //   data[5]?.timestamp,
//         //     //   "shapes[0].x1",
//         //     //   data[0]?.timestamp,
//         //     // ],
//         //     execute: false,
//         //   },
//         // ],
//       },
//     ],
//     xaxis: {
//       title: "Date & Time",
//       // rangeslider: { visible: true, bgcolor: "blue" },
//       showline: true,
//       showspikes: true,
//       // spikesnap: "category",
//       spikesnap: "cursor",
//       spikemode: "across",
//       spikedash: "solid",
//       spikecolor: "#000000",
//       spikethickness: 2,
//       // rangeselector: {
//       //   buttons: [
//       //     {
//       //       count: 1,
//       //       label: "1m",
//       //       step: "month",
//       //       stepmode: "backward",
//       //     },
//       //     {
//       //       count: 6,
//       //       label: "6m",
//       //       step: "month",
//       //       stepmode: "backward",
//       //     },
//       //     { step: "all" },
//       //   ],
//       // },
//     },
//     yaxis: {
//       title: metadata?.param_short_name
//         ? `${metadata?.param_short_name} (${metadata?.unit})`
//         : "",
//     },
//     annotations: [
//       {
//         xref: "paper",
//         yref: "paper",
//         x: 0,
//         xanchor: "left",
//         y: 1,
//         yanchor: "bottom",
//         text:
//           metadata?.lat && metadata?.lon
//             ? `Lat: ${metadata?.lat}, Lon: ${metadata?.lon}`
//             : "",
//         showarrow: false,
//       },
//     ],
//     margin: { t: 40, b: 60 },
//   };

// const largestYValue: any = Math.max(...data.map((d) => Number(d.value)));
// const smallestYValue: any = Math.min(...data.map((d) => Number(d.value)));
// const plotRef = useRef(null);
// const PLOT_DIV_ID = "PLOT_DIV_ID";

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

// const plotRelayoutHandler = (e: any) => {
//   // console.log("plotRelayoutHandler: ", e);
//   const newLeftPoint = e["xaxis.range[0]"];
//   const newRightPoint = e["xaxis.range[1]"];

//   // if (
//   //   e["xaxis.range[0]"] !== undefined ||
//   //   e["yaxis.range[0]"] !== undefined
//   // ) {
//   //   setSliderMax(2);
//   //   console.log("Pan or zoom detected!");
//   // }

//   if (newLeftPoint && newRightPoint) {
//     // const filteredData = data.filter(
//     //   (d) =>
//     //     new Date(d.timestamp).getTime() >= new Date(newLeftPoint).getTime() &&
//     //     new Date(d.timestamp).getTime() <= new Date(newRightPoint).getTime()
//     // );
//     // if (filteredData.length === 0) return;
//     // setSliderMax(filteredData.length);
//     // Plotly.newPlot(PLOT_DIV_ID, [plotData], {
//     //   ...layout,
//     //   shapes: [
//     //     {
//     //       ...verticalLine,
//     //       x0: filteredData[getMiddleIndex(filteredData)].timestamp,
//     //       x1: filteredData[getMiddleIndex(filteredData)].timestamp,
//     //       // x0: filteredData[0].timestamp,
//     //       // x1: filteredData[0].timestamp,
//     //     },
//     //   ],
//     //   sliders: [
//     //     {
//     //       ...slider,
//     //       steps: filteredData.map((d) => {
//     //         return {
//     //           label: d?.timestamp,
//     //           execute: false,
//     //           method: "relayout",
//     //           args: [
//     //             "shapes[0].x0",
//     //             d?.timestamp,
//     //             "shapes[0].x1",
//     //             d?.timestamp,
//     //           ],
//     //         };
//     //       }),
//     //     },
//     //   ],
//     // });
//     // Plotly.relayout(PLOT_DIV_ID, {
//     //   shapes: [
//     //     {
//     //       ...verticalLine,
//     //       x0: filteredData[getMiddleIndex(filteredData)].timestamp,
//     //       x1: filteredData[getMiddleIndex(filteredData)].timestamp,
//     //     },
//     //   ],
//     //   // sliders: [
//     //   //   {
//     //   //     ...slider,
//     //   //     steps: filteredData.map((d) => {
//     //   //       return {
//     //   //         label: d?.timestamp,
//     //   //         execute: false,
//     //   //         method: "relayout",
//     //   //         args: ["shapes[0].x0", d?.timestamp],
//     //   //       };
//     //   //     }),
//     //   //   },
//     //   // ],
//     // });
//   }
// };

export interface expType {
  myType: string;
}

// const sliderChangeHandler = (e: any) => {
// const activeIndex = e.slider.active;
// setSliderValue(activeIndex);
// const newVerticalLine: Partial<Plotly.Shape> = {
//   visible: true,
//   type: "line",
//   opacity: 1,
//   x0: stateData[activeIndex].timestamp,
//   x1: stateData[activeIndex].timestamp,
//   y0: "-100", // y bottom
//   y1: "200", // y top
//   yref: "paper",
//   ysizemode: "pixel",
//   line: {
//     color: "rgb(228, 24, 24)",
//     width: 2,
//     dash: "longdash",
//   },
// };
// setPlotState((prevState) => {
//   return {
//     data: prevState.data,
//     layout: {
//       ...prevState.layout,
//       shapes: [newVerticalLine],
//     },
//   };
// });
// };

// const newSlider: Partial<Plotly.Slider> = {
//   active: getMiddleIndex(stateData),
//   pad: { t: 30, r: -10, l: -10 }, // negative values to match the Plot width
//   steps: stateData.map((d) => {
//     return {
//       label: d.timestamp,
//       execute: false,
//       method: "relayout",
//       args: ["shapes[0].x0", d.timestamp, "shapes[0].x1", d.timestamp],
//     };
//   }),
// };

/**
 * pixel based vertical line
 */
// if (plotRef.current) {
// const gd = (plotRef.current as any).el; // Get the raw Plotly DOM element
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
