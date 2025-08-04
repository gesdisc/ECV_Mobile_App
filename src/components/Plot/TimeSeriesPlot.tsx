import React, { useEffect, useRef } from "react";
import Plot from "react-plotly.js";
import Plotly from "plotly.js-dist-min";

import { IonRow, IonCol, IonGrid, IonButton, IonIcon } from "@ionic/react";
import { settingsSharp } from "ionicons/icons";

interface TimeSeriesProps {
  plotData: Partial<Plotly.Data>[];
  layout: Partial<Plotly.Layout>;
  onPlotRelayout?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
  plotRef?: any;
  // onSliderChange?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
  // minRange?: number;
  // maxRange?: number;
}

const TimeSeriesPlot: React.FC<TimeSeriesProps> = ({
  plotData,
  layout,
  onPlotRelayout,
  plotRef = null,
  // onSliderChange,
  // minRange,
  // maxRange,
}) => {
  // useEffect(() => {
  //   const asyncF = async () => {
  //     Plotly.newPlot("divId", [{ x: [0, 102, 4] }]).then((gd) => {
  //       // console.log("works");
  //       // console.log("gd:", gd);
  //       gd.on("plotly_click", (d) => {
  //         console.log(d.event.clientX, d.event.clientY);
  //       });
  //     });
  //   };

  //   asyncF();
  // }, []);

  // useEffect(() => {
  //   Plotly.Plots.resize("divId");
  // }, []);

  const clickHandler = (data: any) => {
    console.log(data);
    if (data.points && data.points.length > 0) {
      // If a data point was clicked, you can access its coordinates
      console.log("Clicked data point:", data.points[0].x, data.points[0].y);
    } else if (data.points === undefined && data.event) {
      // If a shape or empty area was clicked, use the event object for raw coordinates
      const x = data.event.x; // Raw x-coordinate in pixels
      const y = data.event.y; // Raw y-coordinate in pixels

      // To convert raw pixel coordinates to plot-relative coordinates,
      // you need to consider the plot's layout and axis ranges.
      // This conversion can be complex and may require manual calculation
      // based on the plot's dimensions and axis ranges.
      console.log("Clicked raw coordinates (pixels):", x, y);
    }
  };

  // useEffect(() => {
  //   Plotly.relayout("plotly_hover", function (eventdata: any) {
  //     const points = eventdata.points[0],
  //       pointNum = points.pointNumber;

  //     plotRef.current.Fx.hover("myDiv", [
  //       { curveNumber: 0, pointNumber: pointNum },
  //       { curveNumber: 1, pointNumber: pointNum },
  //       { curveNumber: 2, pointNumber: pointNum },
  //     ]);
  //   });
  // }, []);

  const hoverHandler = (event: any) => {
    // console.log(event);
    // const points = event.points[0],
    //   pointNum = points.pointNumber;
    // plotRef.current.Fx.hover("myDiv", [
    //   { curveNumber: 0, pointNumber: pointNum },
    //   { curveNumber: 1, pointNumber: pointNum },
    //   { curveNumber: 2, pointNumber: pointNum },
    // ]);
    // (Plotly as any).Fx.hover("divId", [{ curveNumber: 0, pointNumber: 0 }]);
  };

  // useEffect(() => {
  //   if (plotRef.current) {
  //     const gd = (plotRef.current as any).el; // Get the raw Plotly DOM element
  //     const fullLayout = gd._fullLayout;
  //     const fullData = gd._fullData;
  //     console.log("here we go");
  //     if (fullLayout && fullData) {
  //       const newPixelCoords: any = [];
  //       const xPxCoords: any = [];
  //       fullData.forEach((trace: any) => {
  //         if (trace.x && trace.y && fullLayout.xaxis && fullLayout.yaxis) {
  //           const xaxis = fullLayout.xaxis;
  //           const yaxis = fullLayout.yaxis;
  //           const l = fullLayout.margin.l;
  //           const t = fullLayout.margin.t;
  //           for (let i = 0; i < trace.x.length; i++) {
  //             const xData = trace.x[i];
  //             const yData = trace.y[i];
  //             // Convert data coordinates to pixel coordinates
  //             const xPx = xaxis.l2p(new Date(xData).getTime()) + l; // Add left margin offset
  //             const yPx = yaxis.l2p(yData) + t; // Add top margin offset
  //             xPxCoords.push(xPx);
  //             newPixelCoords.push({
  //               x: xPx,
  //               y: yPx,
  //               traceIndex: trace.index,
  //               pointIndex: i,
  //             });
  //           }
  //         }
  //       });
  //       console.log(newPixelCoords);
  //       console.log(xPxCoords);
  //       // setPixelCoords(newPixelCoords);
  //     }
  //   }
  // }, [plotRef.current]);
  return (
    // <IonGrid style={{ display: "flex", justifyContent: "center" }}>
    //   <IonRow class="ion-justify-content-center">
    //     <IonCol
    //       style={{
    //         display: "flex",
    //         justifyContent: "center",
    //       }}
    //     >
    <Plot
      ref={plotRef}
      divId={"divId"}
      // onSliderChange={onSliderChange}
      onRelayout={onPlotRelayout}
      // onRelayouting={onRel}
      useResizeHandler={true}
      onClick={clickHandler}
      // onRestyle={restyleHandler}
      onHover={hoverHandler}
      data={plotData}
      layout={layout}
      style={{ width: "100%", height: "100%" }}
      config={{ responsive: true, displayModeBar: false }}
    />
    //     </IonCol>
    //   </IonRow>
    // </IonGrid>
  );
};

export default TimeSeriesPlot;
