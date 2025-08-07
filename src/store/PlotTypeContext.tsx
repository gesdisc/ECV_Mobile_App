import React, { createContext, useContext, useState, ReactNode } from "react";

/**
 *
 * Note: This react context is only for demo/testing purposes to support the switching between time series and time series + map
 *
 */

export const PLOT_TYPES = {
  TIME_AVG: "TIME_AVG",
  POINT_BASED: "POINT_BASED",
};

interface PlotContextType {
  plotType: string;
  setPlotType: (plot: string) => void;
}

const initialContextValue: PlotContextType = {
  plotType: PLOT_TYPES.POINT_BASED,
  setPlotType: (plot: string) => {
    console.log("empty function!");
  },
};

const PlotType = createContext<PlotContextType>(initialContextValue);

export const PlotTypeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [plotType, setPlotType] = useState(PLOT_TYPES.POINT_BASED);

  const contextValue: PlotContextType = {
    plotType,
    setPlotType,
  };

  return <PlotType.Provider value={contextValue}>{children}</PlotType.Provider>;
};

export const usePlotType = () => {
  const context = useContext(PlotType);
  if (context === undefined) {
    throw new Error("usePlotType must be used within a PlotTypeProvider");
  }
  return context;
};
