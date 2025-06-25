
import { parseTimeSeriesCsv } from '../../helpers/time-series';
import type {
    MaybeBearerToken,
    DataParams,
} from '../../types/time-series.types'

const handleApiError = (response: Response): string => {
    const statusCode = response.status;
    let errorMessage = "";

    if (statusCode >= 400 && statusCode < 500) {
        // Client-side errors
        switch (statusCode) {
            case 403:
                errorMessage = `Forbidden (${statusCode}): You don't have permission to access this resource.`;
                break;
            case 404:
                errorMessage = `Not Found (${statusCode}): The requested resource could not be found.`;
                break;
            case 429:
                errorMessage = `Too many requests (${statusCode}): Please try again later.`;
                break;
            default:
                errorMessage = `Client Error (${statusCode}).`;
        }
    } else if (statusCode >= 500 && statusCode < 600) {
        // Server-side errors (5xx range)
        errorMessage = `Server Error (${statusCode}): Please try again later.`;
    } else {
        // Other unexpected status codes
        errorMessage = `Failed to fetch time series data ${statusCode}.`
    }

    return errorMessage;
}

export const fetchData = async (dataParams: DataParams, signal: AbortSignal) => {
    const bearerToken: MaybeBearerToken = null;
    const { variable, lat, lon, begin_time, end_time } = dataParams;
    // URL https://8weebb031a.execute-api.us-east-1.amazonaws.com/SIT/?data=M2T1NXSLV_5_12_4_V50M&lat=40&lon=120&time_start=2024-03-05T00%3A00%3A00&time_end=2024-03-06T00%3A00%3A00
    const url = `https://8weebb031a.execute-api.us-east-1.amazonaws.com/SIT/?data=${variable}&lat=${lat}&lon=${lon}&time_start=${begin_time}&time_end=${end_time}`;

    try {
        const response = await fetch(url, {
            mode: 'cors',
            signal,
            headers: {
                Accept: 'application/json',
                ...(bearerToken
                    ? { Authorization: `Bearer: ${bearerToken}` }
                    : {}),
            },
        }
        )

        if (!response.ok) throw new Error(handleApiError(response))

        const csvData = await response.text();
        const parsedData = parseTimeSeriesCsv(csvData);

        return parsedData;

    } catch (error) {
        if (error instanceof Error) {
            throw Error(error.name === "AbortError" ? "Request canceled." : error.message)
        }
    }
}

/**
 * fetching graphql data
 */
// pass variable id
// {"query":"{\n  getVariables(variableEntryIds: [\"OMAERUVd_003_FinalAerosolAbsOpticalDepth388\"]) { variables { dataFieldId, dataFieldLongName } } }"}
// export const fetchCatalog = async () => {
//     const url =
//       "https://u2u5qu332rhmxpiazjcqz6gkdm.appsync-api.us-east-1.amazonaws.com/graphql";
//     const query = `
//                 query {
//                     getVariables {
//                     variables {
//                         dataFieldId
//                         dataFieldLongName
//                     }
//                     }
//                 }
//                 `;
//     const requestOptions = {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-key": "",
//       },
//       // body: "query":"{\n  getVariables { variables { dataFieldId, dataFieldLongName } } }",
//       body: JSON.stringify({ query }),
//     };

//     try {
//       console.log("loading catalog data...");

//       const response = await fetch(
//         url,
//         requestOptions
//       );
//       // const response = await axios.post(url, requestOptions);
//       // const data = await response.json();
//       console.log(response);
//     } catch (error) {
//       console.log("Catalog error: ", error);
//     } finally {
//       // console.log("catalog data loaded...");
//     }
//   };