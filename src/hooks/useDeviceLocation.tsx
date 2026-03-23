import { useState, useCallback } from "react";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor, PermissionState } from "@capacitor/core";

const ERROR_PERMISSION_DENIED = `Location permission denied. Please enable it in your ${
  Capacitor.isNativePlatform() ? "device" : "browser"
} settings.`;
const ERROR_FAILED_TO_DETECT = "Failed to get location";

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  permission: PermissionState | "unknown";
  error?: string | undefined;
  loading?: boolean;
}

/**
 *
 * Detects current permission status.
 *
 * Note: There isn’t a single universal API that checks geolocation permissions across web + native. We need to manually check for both.
 *
 */
export const checkPermission = async (): Promise<PermissionState> => {
  try {
    // if the platform is native (ios/android), use capacitor
    if (Capacitor.isNativePlatform()) {
      const status = await Geolocation.checkPermissions();
      return status.location;
    }

    // if the platform is Web, use browser Permissions API
    if ("permissions" in navigator) {
      const result = await navigator.permissions.query({
        name: "geolocation",
      });
      return result.state as PermissionState;
    }

    // if platform is Web but the browser doesn't support the API
    return "prompt";
  } catch {
    return "prompt";
  }
};

// request permission where possible
export const requestPermission = async (): Promise<boolean> => {
  try {
    // if the platform is native (ios/android), we need to manually ask for permission
    if (Capacitor.isNativePlatform()) {
      const result = await Geolocation.requestPermissions();
      return result.location === "granted";
    }
    // Browser will prompt automatically on first use
    return true;
  } catch {
    return false;
  }
};

export const getDeviceLocation = async () => {
  try {
    // we can use the browser API here to detect the location if Capacitor is not installed

    const pos = await Geolocation.getCurrentPosition(); // use capacitor
    const coords: { latitude: number; longitude: number } = pos.coords;
    return coords;
  } catch {
    return null;
  }
};

/**
 *
 * Detects device's location.
 *
 * Capacitor/geolocation detects location regardless of platform (ios/android/web).
 * Read more: https://capacitorjs.com/docs/v6/apis/geolocation (TODO: check iOS requirements)
 *
 */
const useDeviceLocation = () => {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    permission: "unknown",
    error: undefined,
    loading: false,
  });

  const getLocation = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const permission = await checkPermission();

      if (permission === "denied") {
        setState({
          latitude: null,
          longitude: null,
          permission,
          error: ERROR_PERMISSION_DENIED,
        });
        return;
      }

      if (permission === "prompt") {
        const granted = await requestPermission();
        if (!granted) {
          setState({
            latitude: null,
            longitude: null,
            permission: "denied",
            error: ERROR_PERMISSION_DENIED,
          });
          return;
        }
      }

      const coords = await getDeviceLocation();

      if (coords === null) throw new Error();

      setState({
        latitude: coords.latitude,
        longitude: coords.longitude,
        permission: "granted",
      });
    } catch (err) {
      setState({
        latitude: null,
        longitude: null,
        permission: "granted",
        error: (err instanceof Error && err.message) || ERROR_FAILED_TO_DETECT,
      });
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  return {
    ...state,
    getLocation,
  };
};

export default useDeviceLocation;
