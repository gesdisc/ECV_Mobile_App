import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { DefaultParams } from "../constants/time-series";

import { RECENT_DATA_CACHE_KEY } from "../constants/time-series";
import { getItem, getRecentDataKey } from "../services/indexDBService";

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
  latitude: DefaultParams.LATITUDE,
  longitude: DefaultParams.LONGITUDE,
  variable: DefaultParams.VARIABLE,
  beginTime: DefaultParams.BEGIN_TIME,
  endTime: DefaultParams.END_TIME,
  setLatitude: (lat: number) => {
    console.log("empty function!");
  },
  setLongitude: (lng: number) => {
    console.log("empty function!");
  },
  setVariable: (variable: string) => {
    console.log("empty function!");
  },
  setBeginTime: (beginTime: string) => {
    console.log("empty function!");
  },
  setEndTime: (endTime: string) => {
    console.log("empty function!");
  },
};
const extractDataParamsFromCacheKey = (key: string) => {
  const [cacheKey, variable, beginTime, endTime, lat, lon] = key.split("*");
  return { cacheKey, variable, beginTime, endTime, lat, lon };
};
const DataParams = createContext<DataParamsContextType>(initialContextValue);

export const DataParamsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [latitude, setLatitude] = useState(DefaultParams.LATITUDE);
  const [longitude, setLongitude] = useState(DefaultParams.LONGITUDE);
  const [variable, setVariable] = useState(DefaultParams.VARIABLE);
  const [beginTime, setBeginTime] = useState(DefaultParams.BEGIN_TIME);
  const [endTime, setEndTime] = useState(DefaultParams.END_TIME);

  // useEffect(() => {
  //   const getLatestCachedDataParams = async () => {
  //     const recentCachedDataKey = await getRecentDataKey(RECENT_DATA_CACHE_KEY);

  //     if (!recentCachedDataKey) return;

  //     const {
  //       variable: cachedVariable,
  //       beginTime: cachedBeginTime,
  //       endTime: cachedEndTime,
  //       lat: cachedLat,
  //       lon: cachedLon,
  //     } = extractDataParamsFromCacheKey(recentCachedDataKey);

  //     setLatitude(Number(cachedLat));
  //     setLongitude(Number(cachedLon));
  //     setVariable(cachedVariable);
  //     setBeginTime(cachedBeginTime);
  //     setEndTime(cachedEndTime);
  //   };
  //   getLatestCachedDataParams();
  // }, []);

  // const currentVariableData = catalog.find(
  //   (data) => data.dataFieldId === variable
  // );

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
