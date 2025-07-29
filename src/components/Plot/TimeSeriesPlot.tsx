import React from "react";
import Plot from "react-plotly.js";
import Plotly from "plotly.js-dist-min";

import { IonRow, IonCol, IonGrid } from "@ionic/react";

interface TimeSeriesProps {
  plotData: Partial<Plotly.Data>[];
  layout: Partial<Plotly.Layout>;
  onPlotRelayout?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
  plotRef?: any;
}

const TimeSeriesPlot: React.FC<TimeSeriesProps> = ({
  plotData,
  layout,
  onPlotRelayout,
  plotRef = null,
}) => {
  return (
    <IonGrid style={{ display: "flex", justifyContent: "center" }}>
      <IonRow class="ion-justify-content-center">
        <IonCol
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
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
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default TimeSeriesPlot;
