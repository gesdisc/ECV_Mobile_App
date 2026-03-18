import React from "react";
import { useMapEvents, Marker } from "react-leaflet";

import { useDataParams } from "../../store/DataParamsContext";
import { convertToFixedFloat } from "../../utils/converter";
import { SpatialAreaType } from "../../types/time-series.types";

const LocationMarker: React.FC = () => {
  const { params: ctxParams, staged, requestUpdateParams } = useDataParams();

  useMapEvents({
    click(e) {
      requestUpdateParams({
        spatialArea: {
          type: SpatialAreaType.COORDINATES,
          value: {
            lat: convertToFixedFloat(e.latlng.lat, 4).toString(),
            lng: convertToFixedFloat(e.latlng.lng, 4).toString(),
          },
        },
      });
    },
  });

  if (staged.spatialArea?.type === SpatialAreaType.COORDINATES) {
    return (
      <Marker
        position={[
          parseFloat(staged.spatialArea.value.lat),
          parseFloat(staged.spatialArea.value.lng),
        ]}
      ></Marker>
    );
  }

  if (ctxParams.spatialArea.type === SpatialAreaType.COORDINATES) {
    return (
      <Marker
        position={[
          parseFloat(ctxParams.spatialArea.value.lat),
          parseFloat(ctxParams.spatialArea.value.lng),
        ]}
      ></Marker>
    );
  }

  return null;
};

export default LocationMarker;
