import type {
    TimeSeriesData,
    TimeSeriesDataRow,
    TimeSeriesMetadata,
} from '../services/api/time-series.types';

/**
 * 
 * @param text Data in CSV format
 * @returns Object with metadata and data
 * @summary This function will break down the CSV data into 2 parts
 * The point of break: 'Timestamp (UTC),Data'
 * the first part (from 1st element to 'Timestamp (UTC),Data') is the metadata
 * the part that comes after 'Timestamp (UTC),Data' is the data in {timestamp, value} format
 */
export const parseTimeSeriesCsv = (text: string) => {
    const metadata: Partial<TimeSeriesMetadata> = {}
    const data: TimeSeriesDataRow[] = []
    const lines = text.split('\n')
    const splitIndex = lines.indexOf("Timestamp (UTC),Data");
    const metadataPart = lines.slice(0, splitIndex); // from 1st element to "Timestamp (UTC),Data" 
    const datapart = lines.slice(splitIndex+1);

    metadataPart.forEach(line => {
        const [key, value] = line.split(',')
        if (key && value !== undefined) {
            metadata[key.trim()] = value.trim()
        }
    })

    datapart.forEach((line) => {
        const [timestamp, value] = line.split(',')
         if (timestamp && value !== undefined) {
            data.push({ timestamp, value})
         }
    })

    return { metadata, data } as TimeSeriesData;
}