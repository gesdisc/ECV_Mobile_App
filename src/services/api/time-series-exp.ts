
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
    dataParams
} from './time-series.types'



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

export const fetchData = async (dataParams: dataParams) => {
    const bearerToken: MaybeBearerToken = null;
    const {variable, lat, lon, begin_time, end_time} = dataParams;
  
    // Shared by Amber
    // https://8weebb031a.execute-api.us-east-1.amazonaws.com/SIT/?data=M2T1NXSLV_5_12_4_V50M&lat=40&lon=120&time_start=2024-03-05T00%3A00%3A00&time_end=2024-03-06T00%3A00%3A00
    // const url = `https://8weebb031a.execute-api.us-east-1.amazonaws.com/SIT/?data=M2T1NXSLV_5_12_4_V50M&lat=40&lon=120&time_start=2024-03-05T00%3A00%3A00&time_end=2024-03-06T00%3A00%3A00`;
    const url = `https://8weebb031a.execute-api.us-east-1.amazonaws.com/SIT/?data=${variable}&lat=${lat}&lon=${lon}&time_start=${begin_time}&time_end=${end_time}`;
 

    try {
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
        // const parsedData = parseTimeSeriesCsv(csvData);
        
        // return response;
        return csvData;
    } catch (error) {
        console.log(error)
    }
}

