import React from "react";
import Plot from "react-plotly.js";
import {
  TimeSeriesDataRow,
  TimeSeriesMetadata,
  TimeSeriesData,
} from "../../services/api/time-series.types";

interface TimeSeriesProps {
  metadata: TimeSeriesMetadata | undefined;
  data: TimeSeriesDataRow[];
}

/**
 * if metadata/data is undefined, labels on the plot will print undefined
 */
const TimeSeriesPlot: React.FC<TimeSeriesProps> = ({ metadata, data }) => {
  return (
    <Plot
      data={[
        {
          x: data.map((d) => d.timestamp),
          y: data.map((d) => d.value),
          type: "scatter",
          mode: "lines",
          line: { color: "blue" },
          name: metadata?.param_short_name,
        },
      ]}
      layout={{
        title: `${metadata?.param_name} (${metadata?.prod_name})`,
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
          title: `${metadata?.param_short_name} (${metadata?.unit})`,
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
            text: `Lat: ${metadata?.lat}, Lon: ${metadata?.lon}`,
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

export default TimeSeriesPlot;
