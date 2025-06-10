
import { format } from 'date-fns'

import type {
    Collection,
    EndDate,
    Location,
    MaybeBearerToken,
    StartDate,
    TimeSeriesData,
    TimeSeriesDataRow,
    TimeSeriesMetadata,
    Variable,
    VariableDbEntry,
} from './time-series.types'

// Shared by Amber
// https://8weebb031a.execute-api.us-east-1.amazonaws.com/SIT/?data=M2T1NXSLV_5_12_4_V50M&lat=40&lon=120&time_start=2024-03-05T00%3A00%3A00&time_end=2024-03-06T00%3A00%3A00
const url = `https://8weebb031a.execute-api.us-east-1.amazonaws.com/SIT/?data=M2T1NXSLV_5_12_4_V50M&lat=40&lon=120&time_start=2024-03-05T00%3A00%3A00&time_end=2024-03-06T00%3A00%3A00`;

/**
   * Navigates to a new pathname
   * @param text - ...
   */
const parseTimeSeriesCsv = (text: string) => {
    const lines = text.split('\n')
    const metadata: Partial<TimeSeriesMetadata> = {}
    const data: TimeSeriesDataRow[] = []

    lines.forEach(line => {
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
    console.log(metadata)
    console.log("data: ", data)

    return { metadata, data } as TimeSeriesData;
}

export const fetchData = async () => {
    const bearerToken: MaybeBearerToken = null;
    // bearerToken = bearerToken;
    // console.log("bearerToken", bearerToken);
    //    let collection: Collection;
    let variable: Variable;
    let startDate: string;
    let endDate: string;
    //    let location: Location;
    let lat: number;
    let lon: number;

    try {
        
        variable = "GPM_3IMERGDF_07_precipitation";
        startDate = "2019-01-01T00:00:00";
        endDate = "2020-01-01T00:00:00";
        lat  = 29.75;
        lon = -89.14;

        // fetch the time series as a CSV
        const response = await fetch(url, {
            mode: 'cors',
            // signal,
            headers: {
                Accept: 'application/json',
                ...(bearerToken
                    ? { Authorization: `Bearer: ${bearerToken}` }
                    : {}),
            },
        })

        if (!response.ok) {
            throw new Error(
                `Failed to fetch time series data: ${response.statusText}`
            )
        }

        const csvData = await response.text();
        const parsedData = parseTimeSeriesCsv(csvData);
        
        // return response;
        return parsedData;


    } catch (error) {
        console.log(error)
    }
}

