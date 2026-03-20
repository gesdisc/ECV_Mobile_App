import React, { useEffect } from "react";

import useDeviceLocation from "../../hooks/useDeviceLocation";
import { convertToFixedFloat } from "../../utils/converter";
import { SpatialAreaType } from "../../types/time-series.types";
import { useDataParams } from "../../store/DataParamsContext";

/**
 *
 * @returns null
 *
 * @summary This component is responsible for getting the device location and updating the data params context with the device location. It does not render anything.
 *
 */
const DeviceLocation: React.FC = () => {
  const {
    latitude: deviceLat,
    longitude: deviceLon,
    error: permissionError,
    getLocation,
    loading,
  } = useDeviceLocation();
  const { updateParams } = useDataParams();

  useEffect(() => {
    const getDeviceLocation = async () => {
      try {
        await getLocation();

        if (permissionError) return;

        if (!deviceLat || !deviceLon) return;

        updateParams({
          spatialArea: {
            type: SpatialAreaType.COORDINATES,
            value: {
              lat: convertToFixedFloat(deviceLat, 4).toString(),
              lng: convertToFixedFloat(deviceLon, 4).toString(),
            },
          },
        });
      } catch (error) {
        console.error(error);
      }
    };
    getDeviceLocation();
  }, [getLocation, deviceLat, deviceLon]);

  return null;
};

export default DeviceLocation;
