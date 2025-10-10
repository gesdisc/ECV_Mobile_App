import React, { createContext, useContext, useState, ReactNode } from "react";
import { DataParams, TimeSeriesMetadata } from "../types/time-series.types";
import { DefaultParams } from "../constants/time-series";

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
    lat: DefaultParams.LATITUDE,
    lon: DefaultParams.LONGITUDE,
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
  const [params, setParams] = useState<DataParams>({
    variable: "",
    begin_time: DefaultParams.BEGIN_TIME,
    end_time: DefaultParams.END_TIME,
    lat: DefaultParams.LATITUDE,
    lon: DefaultParams.LONGITUDE,
  });
  const [staged, setStaged] = useState<Partial<DataParams>>({});
  const [metadata, setMetadata] = useState<Partial<TimeSeriesMetadata>>({});

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
