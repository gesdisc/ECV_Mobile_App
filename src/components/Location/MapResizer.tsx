import React, { useEffect } from "react";
import { useMap } from "react-leaflet";

import { useDataParams } from "../../store/DataParamsContext";
import { SpatialAreaType } from "../../types/time-series.types";

/**
 *
 * @returns null
 *
 * This component must be used inside map container (MapContainer).
 * Doesn't render any DOM elements and always returns null.
 * Fixes react-leaflet gray/not fully loaded tile problem.
 */
const MapResizer: React.FC = () => {
  const { params: ctxParams } = useDataParams();
  const map = useMap();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    // TODO: SUPPORT STAGED PARAMS???
    // TODO: SUPPORT BBOX???
    if (ctxParams.spatialArea.type === SpatialAreaType.COORDINATES) {
      map.setView(
        [
          parseFloat(ctxParams.spatialArea.value.lat),
          parseFloat(ctxParams.spatialArea.value.lng),
        ],
        // map.getZoom(), // FIXME: PRODUCED ERROR (use fixed integer instead)
        2,
        {
          animate: true,
        },
      );
    }
    map.setZoom(map.getZoom());

    return () => clearTimeout(timeoutId);
  }, [map]);

  return null;
};

export default MapResizer;
