export type TimeSeriesData = {
  metadata: TimeSeriesMetadata;
  data: TimeSeriesDataRow[];
};

export type TimeSeriesDataRow = {
  timestamp: string;
  value: string;
};

export type TimeSeriesMetadata = {
  prod_name: string;
  param_short_name: string;
  param_name: string;
  unit: string;
  begin_time: string;
  end_time: string;
  lat: number;
  lon: number;
  [key: string]: string | number;
};

export type MaybeBearerToken = string | null;

export type DataParams = {
  variable: string;
  begin_time: string;
  end_time: string;
  spatialArea: SpatialArea;
};

export type TimeAvgDataRow = {
  timestamp: string;
  value: string;
};

export type TimeAvgMetadata = {
  user_start_date: string;
  user_end_date: string;
  user_bounding_box: string;
  fill_value: string;
  [key: string]: string | number;
};

export type TimeAvgData = {
  metadata: TimeAvgMetadata;
  data: TimeAvgDataRow[];
};

export type VariableDbEntry = TimeSeriesData & {
  variableEntryId: string;
  startDate: string;
  endDate: string;
  /** unique key to identify unique record */
  key: string;
  /** environment used when fetching the data */
  environment?: string;
  /** timestamp when the data was cached */
  cachedAt: number;
};

export enum SpatialAreaType {
  GLOBAL = "global",
  COORDINATES = "coordinates",
  BOUNDING_BOX = "bounding_box",
}

export type Coordinates = { lat: string; lng: string };

export type BoundingBox = {
  west: string;
  south: string;
  east: string;
  north: string;
};

export type SpatialArea =
  // | { type: SpatialAreaType.GLOBAL }
  | { type: SpatialAreaType.COORDINATES; value: Coordinates }
  | {
      type: SpatialAreaType.BOUNDING_BOX;
      value: BoundingBox;
    };
