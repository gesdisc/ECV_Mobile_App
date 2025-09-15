export const MARGIN_INLINE = 40;
export const schema: {
  data: Partial<Plotly.Data>;
  layout: Partial<Plotly.Layout>;
} = {
  data: {
    x: [],
    y: [],
    type: "scatter",
    mode: "lines",
    line: { color: "blue" },
    name: "plot name",
  },
  layout: {
    height: 300,
    plot_bgcolor: "white", // the plot area
    paper_bgcolor: "transparent", // the entire chart container
    autosize: true,
    margin: {
      l: MARGIN_INLINE,
      r: MARGIN_INLINE,
    },
    legend: { x: 0, y: 1 },
    hovermode: "x",
    // shapes: [
    //   {
    //     visible: false,
    //     type: "line",
    //     opacity: 1,
    //     x0: 0,
    //     x1: 0,
    //     y0: 0, // y bottom
    //     y1: 0, // y top
    //     yref: "paper",
    //     ysizemode: "pixel",
    //     line: {
    //       color: "rgb(228, 24, 24)",
    //       width: 2,
    //       dash: "longdash",
    //     },
    //   },
    // ],
    xaxis: {
      title: "",
      showline: true,
      tickmode: "auto",
      // showline: true,
      // showspikes: true,
      // spikesnap: "category",
      // spikesnap: "cursor",
      // spikemode: "across",
      // spikedash: "solid",
      // spikecolor: "#000000",
      // spikethickness: 2,
      // nticks: 2,
      // dtick: `${
      //   new Date(stateData[4]?.timestamp).getTime() -
      //   new Date(stateData[0]?.timestamp).getTime()
      // }`,
      // rangeslider: {},
    },
    // yaxis: {
    //   // title: "",
    // },
    annotations: [
      {
        // xref: "x",
        // yref: "y",
        xref: "paper",
        yref: "paper",
        x: 0,
        xanchor: "left",
        y: 1,
        yanchor: "bottom",
        text: "",
        showarrow: false,
      },
    ],
  },
};
