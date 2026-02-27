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
  const { params: ctxParams, staged } = useDataParams();
  const map = useMap();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const spatial = staged.spatialArea ?? ctxParams.spatialArea;

    if (spatial.type === SpatialAreaType.COORDINATES) {
      const { lat, lng } = spatial.value;

      map.setView([parseFloat(lat), parseFloat(lng)], map.getZoom() ?? 2, {
        animate: true,
      });
    }

    if (spatial.type === SpatialAreaType.BOUNDING_BOX) {
      const { west, south, east, north } = spatial.value;

      map.fitBounds(
        [
          [parseFloat(south), parseFloat(west)],
          [parseFloat(north), parseFloat(east)],
        ],
        { animate: true }
      );
    }

    return () => clearTimeout(timeoutId);
  }, [map, ctxParams.spatialArea, staged.spatialArea]);

  return null;
};

export default MapResizer;
