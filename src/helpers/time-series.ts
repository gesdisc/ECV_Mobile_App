import type {
  TimeSeriesData,
  TimeSeriesDataRow,
  TimeSeriesMetadata,
} from "../types/time-series.types";

/**
 *
 * @param csvData Data in CSV format
 * @returns Object with metadata and data
 * @summary This function will break down the CSV data into 2 parts
 * The index of break: 'Timestamp (UTC),Data'
 * the first part (from 1st element to 'Timestamp (UTC),Data') is the metadata
 * the part that comes after 'Timestamp (UTC),Data' is the data in {timestamp, value} format
 */
export const parseTimeSeriesCsv = (csvData: string) => {
  const metadata: Partial<TimeSeriesMetadata> = {};
  const data: TimeSeriesDataRow[] = [];
  const lines = csvData.split("\n");
  const splitIndex = lines.indexOf("Timestamp (UTC),Data");
  const metadataLines = lines.slice(0, splitIndex); // from 1st element to "Timestamp (UTC),Data"
  const dataLines = lines.slice(splitIndex + 1);

  metadataLines.forEach((line) => {
    const [key, value] = line.split(",");
    if (key && value !== undefined) {
      metadata[key.trim()] = value.trim();
    }
  });

  dataLines.forEach((line) => {
    const [timestamp, value] = line.split(",");
    if (timestamp && value !== undefined) {
      data.push({ timestamp, value });
    }
  });

  return { metadata, data } as TimeSeriesData;
};

export const getChunkOfDataBetweenDates = (
  data: TimeSeriesDataRow[],
  beginTime: string,
  endTime: string
): Array<TimeSeriesDataRow> => {
  let chunkOfData: TimeSeriesDataRow[] = [];
  chunkOfData = data.filter(
    (varData) =>
      new Date(varData.timestamp).getTime() >= new Date(beginTime).getTime() &&
      new Date(varData.timestamp).getTime() <= new Date(endTime).getTime()
  );

  return chunkOfData;
};
