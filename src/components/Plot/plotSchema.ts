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
    // width: 500,
    height: 300,
    plot_bgcolor: "white", // Light gray for the plot area
    paper_bgcolor: "transparent", // White for the entire chart container
    autosize: true,
    margin: {
      l: MARGIN_INLINE,
      r: MARGIN_INLINE,
      // b: 100,
      // t: 100,
      // pad: 4,
    },
    legend: { x: 0, y: 1 },
    // title: "Select a variable to plot.",
    hovermode: "x",
    shapes: [
      {
        visible: false,
        type: "line",
        opacity: 1,
        x0: 0,
        x1: 0,
        y0: 0, // y bottom
        y1: 0, // y top
        yref: "paper",
        // xref: "paper",
        ysizemode: "pixel",
        // xsizemode: "pixel",
        line: {
          color: "rgb(228, 24, 24)",
          width: 2,
          dash: "longdash",
        },
      },
    ],
    // updatemenus: [
    //   {
    //     showactive: false,
    //     type: "buttons",
    //     xanchor: "left",
    //     yanchor: "middle",
    //     x: 0,
    //     y: -0.5,
    //     direction: "right",
    //     font: {
    //       family: "FontAwesome",
    //       size: 20,
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
    yaxis: {
      // title: "",
    },
    annotations: [
      {
        // xref: "x",
        // yref: "y",
        // xshift: 30,
        // x: "2019-12-02",
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
    // margin: { t: 40, b: 60 },
  },
};
