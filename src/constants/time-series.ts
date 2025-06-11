export const DefaultParams = {
  Latitude: 38.8951, // Default to Washington, DC
  Longitude: -77.0364, // Default to Washington, DC
  Variable: "GPM_3IMERGDF_07_precipitation",
  Begin_time: "2019-01-01T00:00:00",
  End_time: "2020-01-01T00:00:00"
} as const;

export type DefaultParams = typeof DefaultParams[keyof typeof DefaultParams];