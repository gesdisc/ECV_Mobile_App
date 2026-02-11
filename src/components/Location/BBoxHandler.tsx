import React, { useRef } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

interface BBoxHandlerProps {
  setSelection?: any;
}

const BBoxHandler: React.FC<BBoxHandlerProps> = ({ setSelection }) => {
  const map = useMap();
  const startRef = useRef<L.LatLng | null>(null);
  const drawingRef = useRef(false);

  useMapEvents({
    // TODO: // pointerdown not working?
    mousedown(e: any) {
      //   if (mode !== "bbox") return;

      drawingRef.current = true;
      startRef.current = e.latlng;
      map.dragging.disable();
    },

    mousemove(e: any) {
      if (!drawingRef.current || !startRef.current) return;

      const bounds = L.latLngBounds(startRef.current, e.latlng);

      console.log(bounds.getWest());
      console.log(bounds.getSouth());
      console.log(bounds.getEast());
      console.log(bounds.getNorth());
      setSelection({
        //   type: "bbox",
        minLng: bounds.getWest(),
        minLat: bounds.getSouth(),
        maxLng: bounds.getEast(),
        maxLat: bounds.getNorth(),
      });
    },

    mouseup() {
      if (!drawingRef.current) return;

      drawingRef.current = false;
      startRef.current = null;
      map.dragging.enable();
    },
  });

  return null;
};

export default BBoxHandler;
