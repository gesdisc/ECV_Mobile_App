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

  // TODO: ADD THIS CONDITIONS IN Location.tsx????
  if (ctxParams.spatialArea.type !== SpatialAreaType.COORDINATES) return null;
  if (staged.spatialArea?.type !== SpatialAreaType.COORDINATES) return null;

  return (
    <Marker
      position={[
        parseFloat(
          staged.spatialArea.value.lat || ctxParams.spatialArea.value.lat,
        ),
        parseFloat(
          staged.spatialArea.value.lng || ctxParams.spatialArea.value.lng,
        ),
      ]}
    ></Marker>
  );
};

export default LocationMarker;
