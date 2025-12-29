export const DefaultParams = {
  LATITUDE: 38.8951, // Default to Washington, DC
  LONGITUDE: -77.0364, // Default to Washington, DC
  VARIABLE: "GPM_3IMERGHH_07_precipitation",
  BEGIN_TIME: "2019-12-01T00:00:00",
  END_TIME: "2020-01-01T00:00:00",
};

export const RECENT_DATA_CACHE_KEY = `CapacitorStorage.plotData_recent_data`;

export type TimeIntervalKey = keyof typeof TimeIntervals;
export const TimeIntervals = {
  "half-hourly": 0.5,
  "hourly": 1,
  "3-hourly": 3,
  "daily": 24,
  "weekly": 168, // 24 * 7
  "monthly": 720, // 24 * 30
} as const;
