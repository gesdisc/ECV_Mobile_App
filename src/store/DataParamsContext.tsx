import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  // useEffect,
} from "react";
import { DefaultParams } from "../constants/time-series";
// import catalog from "../components/Catalog/catalog.json";

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
  setLatitude: () => {
    console.log("empty function!");
  },
  setLongitude: () => {
    console.log("empty function!");
  },
  setVariable: () => {
    console.log("empty function!");
  },
  setBeginTime: () => {
    console.log("empty function!");
  },
  setEndTime: () => {
    console.log("empty function!");
  },
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

  // const currentVariableData = catalog.find(
  //   (data) => data.dataFieldId === variable
  // );

  /**
   * @BUG
   * 1. select date
   * 2. change variable
   * 3. Date-picker UI will reflect the change and update the date
   * 4. Context provider will not detect the change
   *  The system will not detect that the new variable doesn't have data within the currenctly selected date,
   * and it will send request with the selected dates resulting in an error
   * 5. The code below fixes this behavior but causes another bug (check below!)
   *
   */

  /**
   * @Check if default begin time is before the selected (or default) variable begin time
   */
  // const defaultBeginTime = (
  //   new Date(DefaultParams.BEGIN_TIME) <
  //   new Date(`${currentVariableData?.dataProductBeginDateTime}`)
  //     ? currentVariableData?.dataProductBeginDateTime
  //     : DefaultParams.BEGIN_TIME
  // ) as string;

  /**
   * @Check if default end time is after the selected (or default) variable end time
   */
  // const defaultEndTime = (
  //   new Date(DefaultParams.END_TIME) >
  //   new Date(`${currentVariableData?.dataProductEndDateTime}`)
  //     ? currentVariableData?.dataProductEndDateTime
  //     : DefaultParams.END_TIME
  // ) as string;
  // console.log("correct Time: __________");
  // console.log("Begin Time: ", defaultBeginTime);
  // console.log("End Time: ", defaultEndTime);
  // console.log("correct Time: __________");

  /**
   * @BUG
   * 1. select date
   * 2. change variable
   * selected date remains the same in date-picker UI
   * selected date changed back to the default date in context which is used to send API request
   *
   */

  // useEffect(() => {
  //   const checkDateRange = () => {
  //     setEndTime(defaultEndTime);
  //     setBeginTime(defaultBeginTime);
  //   };
  //   checkDateRange();
  // }, []); // Empty dependency array means it runs once on mount

  /**
   * DON'T NEED TO CHECK -- date-picker UI widget will not let user select a start date that is after the end date
   */
  // if (start > end) {
  //   // "Your start-date cannot be after the end-date."
  //   // return;
  // }

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
