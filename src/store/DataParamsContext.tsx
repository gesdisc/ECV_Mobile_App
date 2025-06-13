import React, { createContext, useContext, useState, ReactNode } from "react";
import { DefaultParams } from "../constants/time-series";

interface DataParamsContextType {
  latitude: number;
  longitude: number;
  variable: string;
  beginTime: string;
  endTime: string;
  setLatitude: (lat: number) => void;
  setLongitude: (lng: number) => void;
  setVariable: (variable: string) => void;
  setBeginTime: (beginTime: string) => void;
  setEndTime: (endTime: string) => void;
}

const initialContextValue: DataParamsContextType = {
  latitude: DefaultParams.Latitude,
  longitude: DefaultParams.Longitude,
  variable: DefaultParams.Variable,
  beginTime: DefaultParams.Begin_time,
  endTime: DefaultParams.End_time,
  setLatitude: () => {},
  setLongitude: () => {},
  setVariable: () => {},
  setBeginTime: () => {},
  setEndTime: () => {},
};

const DataParams = createContext<DataParamsContextType>(initialContextValue);

export const DataParamsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [latitude, setLatitude] = useState(initialContextValue.latitude);
  const [longitude, setLongitude] = useState(initialContextValue.longitude);
  const [variable, setVariable] = useState(initialContextValue.variable);
  const [beginTime, setBeginTime] = useState(initialContextValue.beginTime);
  const [endTime, setEndTime] = useState(initialContextValue.endTime);

  const contextValue: DataParamsContextType = {
    latitude,
    longitude,
    variable,
    beginTime,
    endTime,
    setLatitude,
    setLongitude,
    setVariable,
    setBeginTime,
    setEndTime,
  };

  return (
    <DataParams.Provider value={contextValue}>{children}</DataParams.Provider>
  );
};

export const useDataParams = () => {
  const context = useContext(DataParams);
  if (context === undefined) {
    throw new Error("useDataParams must be used within a DataParamsProvider");
  }
  return context;
};
