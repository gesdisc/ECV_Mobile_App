import React from "react";
import { useMapEvents, Marker } from "react-leaflet";

import { useDataParams } from "../../store/DataParamsContext";
import { convertToFixedFloat } from "../../utils/converter";

const LocationMarker: React.FC = () => {
  const { params: ctxParams, staged, requestUpdateParams } = useDataParams();

  useMapEvents({
    click(e) {
      requestUpdateParams({
        lat: convertToFixedFloat(e.latlng.lat, 4),
        lon: convertToFixedFloat(e.latlng.lng, 4),
      });
    },
  });

  return (
    <Marker
      position={[staged.lat || ctxParams.lat, staged.lon || ctxParams.lon]}
    ></Marker>
  );
};

export default LocationMarker;
