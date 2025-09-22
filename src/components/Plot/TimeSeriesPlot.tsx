import React from "react";
import Plot from "react-plotly.js";
import Plotly from "plotly.js-dist-min";

import TerraTimeSeries from "@nasa-terra/components/dist/react/time-series";

interface TimeSeriesProps {
  plotData: Partial<Plotly.Data>[];
  layout: Partial<Plotly.Layout>;
  onPlotRelayout?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
  plotRef?: any;
}

/**
 *
 * @summary Wrapper component for Plotly.js Plot component.
 * Plotly Plot must be a child component because of the way react plotly designed.
 * Read more about the issues with react plotly here: https://www.paigeniedringhaus.com/blog/persist-zoom-and-bounds-in-a-react-plotly-js-map
 * Official doc: https://github.com/plotly/react-plotly.js/
 *
 */
const TimeSeriesPlot: React.FC<TimeSeriesProps> = ({
  plotData,
  layout,
  onPlotRelayout,
  plotRef = null,
}) => {
  return (
    <Plot
      ref={plotRef}
      divId={"divId"}
      onRelayout={onPlotRelayout}
      useResizeHandler={true}
      data={plotData}
      layout={layout}
      style={{ width: "100%", height: "100%" }}
      config={{ responsive: true, displayModeBar: false }}
    />
  );
};

export default TimeSeriesPlot;
