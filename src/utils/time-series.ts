import type {
    TimeSeriesData,
    TimeSeriesDataRow,
    TimeSeriesMetadata,
} from '../services/api/time-series.types';

export const parseTimeSeriesCsv = (text: string) => {
    const lines = text.split('\n')

    // dates only
    const dateLines = lines.slice(lines.indexOf("")+2);

    const metadata: Partial<TimeSeriesMetadata> = {}
    const data: TimeSeriesDataRow[] = []

    dateLines.forEach(line => {
        if (line.includes('=')) {
            const [key, value] = line.split('=')
            metadata[key] = value
        } else if (line.includes(',')) {
            const [timestamp, value] = line.split(',')
            if (timestamp && value) {
                data.push({ timestamp, value })
            }
        }
    })

    return { metadata, data } as TimeSeriesData;
}