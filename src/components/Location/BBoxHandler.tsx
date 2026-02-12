import React, { useRef } from "react";
import { useMap, useMapEvents, Rectangle } from "react-leaflet";
import L from "leaflet";

import { useDataParams } from "../../store/DataParamsContext";
import { SpatialAreaType } from "../../types/time-series.types";
import { convertToFixedFloat } from "../../utils/converter";

const BBoxHandler: React.FC = () => {
  const map = useMap();
  const startRef = useRef<L.LatLng | null>(null);
  const drawingRef = useRef(false);
  const { params: ctxParams, staged, requestUpdateParams } = useDataParams();

  useMapEvents({
    // TODO: pointerdown not working?
    mousedown(e: any) {
      //   if (mode !== "bbox") return;

      drawingRef.current = true;
      startRef.current = e.latlng;
      map.dragging.disable();
    },

    // TODO: replace type any
    mousemove(e: any) {
      if (!drawingRef.current || !startRef.current) return;

      const bounds = L.latLngBounds(startRef.current, e.latlng);

      requestUpdateParams({
        spatialArea: {
          type: SpatialAreaType.BOUNDING_BOX,
          value: {
            west: convertToFixedFloat(bounds.getWest(), 4).toString(),
            south: convertToFixedFloat(bounds.getSouth(), 4).toString(),
            east: convertToFixedFloat(bounds.getEast(), 4).toString(),
            north: convertToFixedFloat(bounds.getNorth(), 4).toString(),
          },
        },
      });
    },

    mouseup() {
      if (!drawingRef.current) return;

      drawingRef.current = false;
      startRef.current = null;
      map.dragging.enable();
    },
  });

  if (staged.spatialArea?.type === SpatialAreaType.BOUNDING_BOX) {
    return (
      <Rectangle
        bounds={[
          [
            parseFloat(staged.spatialArea?.value.south),
            parseFloat(staged.spatialArea?.value.west),
          ],
          [
            parseFloat(staged.spatialArea?.value.north),
            parseFloat(staged.spatialArea?.value.east),
          ],
        ]}
      />
    );
  }

  if (ctxParams.spatialArea.type === SpatialAreaType.BOUNDING_BOX) {
    return (
      <Rectangle
        bounds={[
          [
            parseFloat(ctxParams.spatialArea.value.south),
            parseFloat(ctxParams.spatialArea.value.west),
          ],
          [
            parseFloat(ctxParams.spatialArea.value.north),
            parseFloat(ctxParams.spatialArea.value.east),
          ],
        ]}
      />
    );
  }

  return null;
};

export default BBoxHandler;
