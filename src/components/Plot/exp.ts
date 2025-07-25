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
