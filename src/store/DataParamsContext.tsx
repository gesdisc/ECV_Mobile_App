import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { DataParams } from "../types/time-series.types";
import { DefaultParams } from "../constants/time-series";
import useDeviceLocation from "../hooks/useDeviceLocation";

interface DataParamsContextType {
  params: DataParams;
  staged: Partial<DataParams>;
  updateParams: (newParams: Partial<DataParams>) => void;
  requestUpdateParams: (newParams: Partial<DataParams>) => void;
  cancelRequest: () => void;
}

const initialContextValue: DataParamsContextType = {
  params: {
    variable: DefaultParams.VARIABLE,
    begin_time: DefaultParams.BEGIN_TIME,
    end_time: DefaultParams.END_TIME,
    lat: DefaultParams.LATITUDE,
    lon: DefaultParams.LONGITUDE,
  },
  staged: {},
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
    permission,
    error: permissionError,
    getLocation,
  } = useDeviceLocation();
  const [params, setParams] = useState<DataParams>({
    variable: DefaultParams.VARIABLE,
    begin_time: DefaultParams.BEGIN_TIME,
    end_time: DefaultParams.END_TIME,
    lat: DefaultParams.LATITUDE,
    lon: DefaultParams.LONGITUDE,
  });
  const [staged, setStaged] = useState<Partial<DataParams>>({});

  // Get device's location
  useEffect(() => {
    console.log("run");
    const getDeviceLocation = async () => {
      try {
        await getLocation();

        if (permissionError) return;

        if (!deviceLat || !deviceLon) return;

        updateParams({
          lat: deviceLat,
          lon: deviceLon,
        });
      } catch (error) {
        console.error(error);
      }
    };
    getDeviceLocation();
  }, [deviceLat, deviceLon]);

  // immediate update
  const updateParams = (newParams: Partial<DataParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
    setStaged({});
  };

  // request confirmation before updating
  const requestUpdateParams = (newParams: Partial<DataParams>) => {
    setStaged((prev) => ({ ...prev, ...newParams }));
  };

  const cancelRequest = () => {
    setStaged({});
  };

  const contextValue: DataParamsContextType = {
    params,
    staged,
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
