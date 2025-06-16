import React from "react";
import Plot from "react-plotly.js";

import { TimeSeriesDataRow } from "../../services/api/time-series.types";

interface TimeSeriesProps {
  //   data: [],
  // metaData: MetaData;
  metaData: TimeSeriesDataRow[];
}

const TimeSeries: React.FC<TimeSeriesProps> = ({ metaData }) => {
  return (
    <Plot
      data={[
        {
          x: metaData.map((d) => d.timestamp),
          y: metaData.map((d) => d.value),
          type: "scatter",
          mode: "lines",
          line: { color: "blue" },
          // name: metaData.param_short_name || "Precipitation",
        },
      ]}
      layout={{
        // title: `${metaData.param_name || "Precipitation"} (${
        //   metaData.prod_name
        // })`,
        xaxis: {
          title: "Date & Time",
          rangeslider: { visible: true, bgcolor: "#000" },
          rangeselector: {
            buttons: [
              {
                count: 1,
                label: "1m",
                step: "month",
                stepmode: "backward",
              },
              {
                count: 6,
                label: "6m",
                step: "month",
                stepmode: "backward",
              },
              { step: "all" },
            ],
          },
        },
        yaxis: {
          // title: `${metaData.param_short_name || "Precipitation"} (${
          //   metaData.unit || "mm/hr"
          // })`,
        },
        showlegend: true,
        legend: { x: 0, y: 1 },
        annotations: [
          {
            xref: "paper",
            yref: "paper",
            x: 0,
            xanchor: "left",
            y: 1,
            yanchor: "bottom",
            // text: `Lat: ${metaData.lat}, Lon: ${metaData.lon}`,
            showarrow: false,
          },
        ],
        margin: { t: 40, b: 60 },
      }}
      style={{ width: "100%", height: "400px" }}
      config={{ responsive: true }}
    />
  );
};

export default TimeSeries;
