export const DefaultParams = {
  Latitude: 33.9375,
  Longitude: -86.9375,
  Variable: "GPM:GPM_3IMERGHH_06:precipitationCal",
  Date_start: "2009-03-27T00",
  Date_end: "2010-11-23T00"
} as const;

export type DefaultParams = typeof DefaultParams[keyof typeof DefaultParams];