import React from "react";
import { useMapEvents, Marker } from "react-leaflet";

import { useDataParams } from "../../store/DataParamsContext";

const LocationMarker: React.FC = () => {
  const { params: ctxParams, staged, requestUpdateParams } = useDataParams();
  useMapEvents({
    click(e) {
      requestUpdateParams({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });

  return (
    <Marker
      position={[staged.lat || ctxParams.lat, staged.lon || ctxParams.lon]}
    ></Marker>
  );
};

export default LocationMarker;
