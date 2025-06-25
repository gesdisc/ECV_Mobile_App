export type TimeSeriesData = {
    metadata: TimeSeriesMetadata
    data: TimeSeriesDataRow[]
}

export type TimeSeriesDataRow = {
    timestamp: string
    value: string
}

export type TimeSeriesMetadata = {
    prod_name: string
    param_short_name: string
    param_name: string
    unit: string
    begin_time: string
    end_time: string
    lat: number
    lon: number
    [key: string]: string | number
}

export type MaybeBearerToken = string | null

export interface CacheData  {
  data: { date: string; value: number }[];
  metaData: TimeSeriesMetadata;
}

export interface LocationState {
  variable: string | undefined
}

export type DataParams = {
  variable: string | LocationState 
  begin_time: string
  end_time: string
  lat: number
  lon: number
}