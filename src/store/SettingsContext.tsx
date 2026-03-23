import React, { createContext, useContext, useState, useEffect } from "react";
import { isPlatform } from "@ionic/react";

import useDeviceLocation from "../hooks/useDeviceLocation";
import { convertToFixedFloat } from "../utils/converter";
import { Coordinates } from "../types/time-series.types";

export const SETTINGS_KEY = "GM-app-settings";

/** Device / App Preferences */
export type AppSettings = {
  device: {
    isMobile: boolean;
    location:
      | Coordinates
      | {
          lat: null;
          lng: null;
        };
  };
};

type SettingsState = {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateLocation: (lat: string, lng: string) => void;
  resetSettings: () => void;
};

const defaultSettings: AppSettings = {
  device: {
    isMobile: false,
    location: {
      lat: null,
      lng: null,
    },
  },
};

const SettingsContext = createContext<SettingsState | null>(null);

/**
 *
 * @description
 * The SettingsProvider is responsible for managing global application settings, including device information and user preferences. It detects if the user is on a mobile device and attempts to get their location using the useDeviceLocation hook. The settings are persisted in localStorage to maintain state across sessions. The provider exposes functions to update settings, update location, and reset settings to defaults. This allows for a centralized management of app-wide settings that can be accessed from any component via the useSettings hook.
 *
 *
 */
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : defaultSettings;
  });
  const {
    latitude: deviceLat,
    longitude: deviceLon,
    error: permissionError,
    getLocation,
  } = useDeviceLocation();

  /** Persist to localStorage */
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  /** Dedicated location updater */
  const updateLocation = (lat: string, lng: string) => {
    setSettings((prev) => ({
      ...prev,
      location: { lat, lng },
    }));
  };

  const resetSettings = () => {
    localStorage.removeItem(SETTINGS_KEY);
    setSettings(defaultSettings);
  };

  /** Detect device once */
  useEffect(() => {
    const initDevice = async () => {
      try {
        const isMobile =
          isPlatform("ios") || isPlatform("android") || isPlatform("mobile");

        setSettings((prev) => ({
          ...prev,
          device: {
            ...prev.device,
            isMobile,
          },
        }));
      } catch (e) {
        console.warn("Device detection failed", e);
      }
    };

    initDevice();
  }, []);

  // FIXME: Figure out why this is not working on mobile - permissions are granted but location is not updating sometimes
  /** Get device location on load if permission is granted */
  // useEffect(() => {
  //   getLocation();
  // }, [getLocation]);

  // TODO: We should listen for persmission changes and update location accordingly.
  /** Update location settings when device location is available */
  // useEffect(() => {
  //   if (permissionError) return;
  //   if (!deviceLat || !deviceLon) return;

  //   setSettings((prev) => ({
  //     ...prev,
  //     location: {
  //       lat: convertToFixedFloat(deviceLat, 4).toString(),
  //       lng: convertToFixedFloat(deviceLon, 4).toString(),
  //     },
  //   }));
  // }, [deviceLat, deviceLon, permissionError]);

  const value: SettingsState = {
    settings,
    updateSettings,
    updateLocation,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context)
    throw new Error("useSettings must be used inside SettingsProvider");
  return context;
};
