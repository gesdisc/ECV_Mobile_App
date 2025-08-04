import React, { useEffect } from "react";
import { useMap } from "react-leaflet";

import { useDataParams } from "../../store/DataParamsContext";

const MapResizer: React.FC = () => {
  const { latitude, longitude } = useDataParams();
  const map = useMap();
  map.setView([latitude, longitude], map.getZoom(), {
    animate: true,
  });
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
