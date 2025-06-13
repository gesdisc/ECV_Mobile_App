export const DefaultParams = {
  Latitude: 38.8951, // Default to Washington, DC
  Longitude: -77.0364, // Default to Washington, DC
  Variable: "GPM_3IMERGDF_07_precipitation", // GPM_3IMERGHH_07_precipitation half hourly
  Begin_time: "2019-01-01T00:00:00", // Data rods uses "Z" at the end
  End_time: "2020-01-01T00:00:00"
} as const;


export const TabMenuLabels = {
  Catalog: "Catalog", 
  Location: "Location", 
  Date: "Date", 
  Visuals: "Visuals", 
} as const;


export type DefaultParams = typeof DefaultParams[keyof typeof DefaultParams];
export type TabMenuLabels = typeof TabMenuLabels[keyof typeof TabMenuLabels];