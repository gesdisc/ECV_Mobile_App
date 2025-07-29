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
    width: 500,
    height: 350,
    autosize: true,
    margin: {
      l: MARGIN_INLINE,
      r: MARGIN_INLINE,
    },
    legend: { x: 0, y: 1 },
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
        ysizemode: "pixel",
        line: {
          color: "rgb(228, 24, 24)",
          width: 2,
          dash: "longdash",
        },
      },
    ],
    xaxis: {
      title: "",
      showline: true,
      tickmode: "auto",
      showspikes: true,
      spikesnap: "cursor",
      spikemode: "across",
      spikedash: "solid",
      spikecolor: "#000000",
      spikethickness: 2,
    },
    yaxis: {
      title: "",
    },
    annotations: [
      {
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
