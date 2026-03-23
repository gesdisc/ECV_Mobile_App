import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useCallback,
  useEffect,
} from "react";
import {
  DataParams,
  TimeSeriesMetadata,
  SpatialAreaType,
} from "../types/time-series.types";
import { DefaultParams } from "../constants/time-series";
import { isValidUTC } from "../utils/date";
// import { useSettings } from "./SettingsContext";

export enum ActionType {
  CANCEL = "cancel",
  CONFIRM = "confirm",
  STAGED = "staged",
}

interface DataParamsContextType {
  params: DataParams;
  staged: Partial<DataParams>;
  metadata: Partial<TimeSeriesMetadata>;
  setMetadata: (metadata: TimeSeriesMetadata) => void;
  updateParams: (newParams: Partial<DataParams>) => void;
  requestUpdateParams: (newParams: Partial<DataParams>) => void;
  cancelRequest: () => void;
  subscribeToAction: (cb: (action: ActionType) => void) => () => void;
}

const initialContextValue: DataParamsContextType = {
  params: {
    variable: "",
    begin_time: DefaultParams.BEGIN_TIME,
    end_time: DefaultParams.END_TIME,
    spatialArea: {
      type: SpatialAreaType.COORDINATES,
      value: {
        lat: DefaultParams.LATITUDE,
        lng: DefaultParams.LONGITUDE,
      },
    },
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
  subscribeToAction: (cb: (action: ActionType) => void) => () => {
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
    spatialArea: {
      type: SpatialAreaType.COORDINATES,
      value: {
        lat: DefaultParams.LATITUDE,
        lng: DefaultParams.LONGITUDE,
      },
    },
  });
  const [staged, setStaged] = useState<Partial<DataParams>>({});
  const [metadata, setMetadata] = useState<Partial<TimeSeriesMetadata>>({});
  // const { settings } = useSettings();

  // FIXME: Disable device location for now until we can figure out why it's not working reliably. Using default coordiantes for now. Read more in SettingsContext.tsx.
  // useEffect(() => {
  //   const { lat: deviceLat, lng: deviceLon } = settings.device.location;

  //   if (!deviceLat || !deviceLon) return;
  //   if (deviceLat && deviceLon) {
  //     setParams((prev) => ({
  //       ...prev,
  //       spatialArea: {
  //         type: SpatialAreaType.COORDINATES,
  //         value: {
  //           lat: deviceLat,
  //           lng: deviceLon,
  //         },
  //       },
  //     }));
  //   }
  // }, [settings.device.location]);

  /**
   *
   * Set of all listeners for action events
   *
   * We intentionally DO NOT store user actions (cancel/confirm/etc)
   * in React state.
   *
   * Why?
   * ----
   * React state represents CURRENT state.
   * But button clicks are EVENTS — things that happen once in time.
   *
   */
  const actionListeners = useRef<Set<(action: ActionType) => void>>(new Set());

  /**
   *
   * Emit an action event to all current subscribers.
   *
   */
  const emitAction = useCallback((action: ActionType) => {
    Array.from(actionListeners.current).forEach((cb) => cb(action));
  }, []);

  // immediate update
  const updateParams = (newParams: Partial<DataParams>) => {
    checkDateFormat(newParams, "params");
    setParams((prev) => ({ ...prev, ...newParams }));
    setStaged({});
    emitAction(ActionType.CONFIRM);
  };

  // request confirmation before updating
  const requestUpdateParams = (newParams: Partial<DataParams>) => {
    checkDateFormat(newParams, "staged");
    setStaged((prev) => ({ ...prev, ...newParams }));
    emitAction(ActionType.STAGED);
  };

  const cancelRequest = () => {
    setStaged({});
    emitAction(ActionType.CANCEL);
  };

  /**
   *
   * Subscribe to action events.
   * Returns an unsubscribe function for cleanup.
   * Use this only inside "useActionListener".
   *
   */
  const subscribeToAction = useCallback((cb: (action: ActionType) => void) => {
    actionListeners.current.add(cb);

    return () => {
      actionListeners.current.delete(cb);
    };
  }, []);

  const contextValue: DataParamsContextType = {
    params,
    staged,
    metadata,
    setMetadata,
    updateParams,
    requestUpdateParams,
    cancelRequest,
    subscribeToAction,
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
