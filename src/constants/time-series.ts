export const DefaultParams = {
  LATITUDE: 38.8951, // Default to Washington, DC
  LONGITUDE: -77.0364, // Default to Washington, DC
  VARIABLE: "GPM_3IMERGHH_07_precipitation", // returns 17k+ lines  (daily - GPM_3IMERGDF_07_precipitation)
  BEGIN_TIME: "2019-01-01T00:00:00",
  // BEGIN_TIME: "2010-01-01T00:00:00", // Testing edge cases
  END_TIME: "2020-01-01T00:00:00"
  // END_TIME: "2023-02-01T23:59:59" // Testing edge cases
};


export const TabMenuLabels = {
  CATALOG: "Catalog", 
  LOCATION: "Location", 
  DATE: "Date", 
  VISUALS: "Visuals", 
};
