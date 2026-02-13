import React, { useRef } from "react";
import { useMap, useMapEvents, Rectangle } from "react-leaflet";
import L from "leaflet";

import { useDataParams } from "../../store/DataParamsContext";
import { SpatialAreaType } from "../../types/time-series.types";
import { convertToFixedFloat } from "../../utils/converter";

const BoundingBox: React.FC = () => {
  const map = useMap();

  /**
   * Starting coordinate of the drag.
   */
  const startRef = useRef<L.LatLng | null>(null);

  /**
   * Tracks whether we are currently drawing without triggering React renders on every pixel move.
   */
  const isDrawingRef = useRef(false);

  const { params: ctxParams, staged, requestUpdateParams } = useDataParams();

  useMapEvents({
    // TODO: pointerdown not working?
    mousedown(e: any) {
      //   if (mode !== "bbox") return;

      // Mark drawing session as started
      isDrawingRef.current = true;

      // Save the starting coordinate of the rectangle
      startRef.current = e.latlng;

      // Disable map panning while drawing
      map.dragging.disable();
    },

    // TODO: replace type any
    mousemove(e: any) {
      // If we are not actively drawing, ignore movement.
      if (!isDrawingRef.current || !startRef.current) return;

      // Leaflet automatically normalizes direction
      // (dragging any diagonal still produces valid bounds).
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
      // If drawing never started, do nothing.
      if (!isDrawingRef.current) return;

      // End drawing session
      isDrawingRef.current = false;

      // Clear stored starting coordinate
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

export default BoundingBox;
