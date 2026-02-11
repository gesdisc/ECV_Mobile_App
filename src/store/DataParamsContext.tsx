import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  DataParams,
  TimeSeriesMetadata,
  SpatialAreaType,
} from "../types/time-series.types";
import { DefaultParams } from "../constants/time-series";
import { convertToFixedFloat } from "../utils/converter";
import { isValidUTC } from "../utils/date";
import useDeviceLocation from "../hooks/useDeviceLocation";

interface DataParamsContextType {
  params: DataParams;
  staged: Partial<DataParams>;
  metadata: Partial<TimeSeriesMetadata>;
  setMetadata: (metadata: TimeSeriesMetadata) => void;
  updateParams: (newParams: Partial<DataParams>) => void;
  requestUpdateParams: (newParams: Partial<DataParams>) => void;
  cancelRequest: () => void;
}

const initialContextValue: DataParamsContextType = {
  params: {
    variable: "",
    begin_time: DefaultParams.BEGIN_TIME,
    end_time: DefaultParams.END_TIME,
    spatialArea: {
      type: SpatialAreaType.COORDINATES,
      value: {
        lat: DefaultParams.LATITUDE.toString(),
        lng: DefaultParams.LONGITUDE.toString(),
      },
    },
    // lat: DefaultParams.LATITUDE,
    // lon: DefaultParams.LONGITUDE,
  },
  staged: {},
  metadata: {},
  setMetadata: () => {
    console.log("empty function!");
  },
  updateParams: () => {
    console.log("empty function!");
  },
  requestUpdateParams: () => {
    console.log("empty function!");
  },
  cancelRequest: () => {
    console.log("empty function!");
  },
};

const DataParamsContext =
  createContext<DataParamsContextType>(initialContextValue);

export const DataParamsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const {
    latitude: deviceLat,
    longitude: deviceLon,
    error: permissionError,
    getLocation,
  } = useDeviceLocation();
  const [params, setParams] = useState<DataParams>({
    variable: "",
    begin_time: DefaultParams.BEGIN_TIME,
    end_time: DefaultParams.END_TIME,
    spatialArea: {
      type: SpatialAreaType.COORDINATES,
      value: {
        lat: DefaultParams.LATITUDE.toString(),
        lng: DefaultParams.LONGITUDE.toString(),
      },
    },
  });
  const [staged, setStaged] = useState<Partial<DataParams>>({});
  const [metadata, setMetadata] = useState<Partial<TimeSeriesMetadata>>({});

  // Get device's location
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

  // immediate update
  const updateParams = (newParams: Partial<DataParams>) => {
    checkDateFormat(newParams, "params");
    setParams((prev) => ({ ...prev, ...newParams }));
    setStaged({});
  };

  // request confirmation before updating
  const requestUpdateParams = (newParams: Partial<DataParams>) => {
    checkDateFormat(newParams, "staged");
    setStaged((prev) => ({ ...prev, ...newParams }));
  };

  const cancelRequest = () => {
    setStaged({});
  };

  const contextValue: DataParamsContextType = {
    params,
    staged,
    metadata,
    setMetadata,
    updateParams,
    requestUpdateParams,
    cancelRequest,
  };

  return (
    <DataParamsContext.Provider value={contextValue}>
      {children}
    </DataParamsContext.Provider>
  );
};

export const useDataParams = () => {
  const context = useContext(DataParamsContext);
  if (context === undefined) {
    throw new Error("useDataParams must be used within a DataParamsProvider");
  }
  return context;
};

const checkDateFormat = (param: Partial<DataParams>, store?: string) => {
  if (process.env.NODE_ENV !== "development") return;

  if (param.begin_time && !isValidUTC(param.begin_time)) {
    console.error(`${store} has invalid date: ${param.begin_time}`);
  }

  if (param.end_time && !isValidUTC(param.end_time)) {
    console.error(`${store} has invalid date: ${param.end_time}`);
  }
};
