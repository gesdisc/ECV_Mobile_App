import React, { useEffect } from "react";
import { useMap } from "react-leaflet";

import { useDataParams } from "../../store/DataParamsContext";

/**
 *
 * @returns null
 *
 * This component must be used inside map container (MapContainer).
 * Doesn't render any DOM elements and always returns null.
 * Fixes react-leaflet gray/not fully loaded tile problem.
 */
const MapResizer: React.FC = () => {
  const { latitude, longitude } = useDataParams();
  const map = useMap();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    map.setView([latitude, longitude], map.getZoom(), {
      animate: true,
    });
    return () => clearTimeout(timeoutId);
  }, [map, latitude, longitude]);
  return null;
};

export default MapResizer;
