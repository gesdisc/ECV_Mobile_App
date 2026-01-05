import type {
  MaybeBearerToken,
  DataParams,
} from "../../types/time-series.types";

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
    errorMessage = `Failed to fetch time series data ${statusCode}.`;
  }

  return errorMessage;
};

/**
 *
 * Returns time-series CSV file using Cloud Giovanni API
 *
 * @param dataParams - {variable, lat, lon, begin_time, end_time}
 * @param signal - signal to cancel the request
 * @returns CSV file
 *
 *
 * FIXME: The CSV file may contain an error message instead of data, even if the request is successful (with status code 200).
 * Ex. `{"message": "Internal server error"}` OR `Data, GPM_3IMERGM_07_precipitation, is currently unavailable.`
 * In this scenario the app will display the error message `request was successful but there is no enough data to plot.`
 *
 */
export const fetchData = async (
  dataParams: DataParams,
  signal?: AbortSignal
) => {
  const bearerToken: MaybeBearerToken = null;
  const { variable, lat, lon, begin_time, end_time } = dataParams;

  // URL https://8weebb031a.execute-api.us-east-1.amazonaws.com/SIT/?data=M2T1NXSLV_5_12_4_V50M&lat=40&lon=120&time_start=2024-03-05T00%3A00%3A00&time_end=2024-03-06T00%3A00%3A00
  const url = `https://8weebb031a.execute-api.us-east-1.amazonaws.com/SIT/?data=${variable}&lat=${lat}&lon=${lon}&time_start=${begin_time}&time_end=${end_time}`;

  try {
    const response = await fetch(url, {
      mode: "cors",
      signal,
      headers: {
        Accept: "application/json",
        ...(bearerToken ? { Authorization: `Bearer: ${bearerToken}` } : {}),
      },
    });

    if (!response.ok) throw new Error(handleApiError(response));
    const csvData = await response.text();

    return csvData;
  } catch (error) {
    if (error instanceof Error) {
      throw Error(
        error.name === "AbortError" ? "Request canceled." : error.message
      );
    }
  }
};
