import type {
  TimeSeriesData,
  TimeSeriesDataRow,
  TimeSeriesMetadata,
  TimeAvgDataRow,
  TimeAvgMetadata,
  TimeAvgData,
} from "../types/time-series.types";

/**
 *
 * @param csvData Data in CSV format
 * @returns Object with metadata and data
 * @summary This function will break down the CSV data into 2 parts
 * the first part (from 1st element to 'Timestamp (UTC),Data') is the metadata
 * the part that comes after 'Timestamp (UTC),Data' is the data in {timestamp, value} format
 */
export const parseTimeSeriesCsv = (csvData: string) => {
  const metadata: Partial<TimeSeriesMetadata> = {};
  const data: TimeSeriesDataRow[] = [];
  const lines = csvData.split("\n");

  if (lines.includes("Timestamp (UTC),Data")) {
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
      if (value === metadata.undef) {
        return;
      }

      if (timestamp && value !== undefined) {
        data.push({ timestamp, value });
      }
    });
  }

  return { metadata, data } as TimeSeriesData;
};

/**
 *
 * @param csv Data in CSV format
 * @returns Object with metadata and data
 *
 * @summary This function will break down the CSV data into 2 parts
 * the first part (from 1st element to 'time') is the metadata
 * the part that comes after 'time' is the data in {timestamp, value} format
 */
export const timeAvgCsvParser = (csv: string) => {
  const metadata: Partial<TimeAvgMetadata> = {};
  const data: TimeAvgDataRow[] = [];
  const lines = csv.split("\n");

  const isValid = lines.find((line) => line.startsWith("time"));
  if (isValid) {
    const splitIndex = lines.findIndex((line) => line.startsWith("time"));
    const metadataLines = lines.slice(0, splitIndex);
    const dataLines = lines.slice(splitIndex + 1);

    metadataLines.forEach((line) => {
      const [key, value] = line.split(":,");
      if (key && value !== undefined) {
        metadata[key.trim().toLowerCase().replaceAll(" ", "_")] = value.trim();
      }
    });

    dataLines.forEach((line) => {
      const [timestamp, value] = line.split(",");
      if (value === metadata.fill_value) {
        return;
      }
      if (timestamp && value !== undefined) {
        data.push({ timestamp, value });
      }
    });
  }

  return { metadata, data } as TimeAvgData;
};
