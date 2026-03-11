import dayjs, { Dayjs } from "dayjs";
import minMax from "dayjs/plugin/minMax";

import { TimeIntervals, TimeIntervalKey } from "../../constants/time-series";
import { getUTCStartOfDay } from "../../utils/date";

dayjs.extend(minMax);

/**
 *
 * @param arr Array with any values
 * @returns middle index of the array
 */
export const getMiddleIndex = (arr: Array<any>) => {
  if (arr.length === 0) return 0;
  if (arr.length % 2 !== 0) {
    return Math.floor(arr.length / 2);
  }
  return Math.floor(arr.length / 2) - 1;
};

export const filterDataBetweenDates = (
  startDate: string | number | Date,
  endDate: string | number | Date,
  dateArray: string[]
) => {
  return dateArray.filter(
    (date) =>
      new Date(date).getTime() >= new Date(startDate).getTime() &&
      new Date(date).getTime() <= new Date(endDate).getTime()
  );
};

/**
 * Extracts coordinates from a cache key using the variableId prefix.
 *
 * @param key Cache key string
 * @param variableId variable id used as the key prefix
 * @returns [lat, lon] for point, [w, s, e, n] for bbox, or null if parsing fails
 *
 *
 * Ex. If key is "GPM_3IMERGHH_07_precipitation_38.90,%20-77.04_prod"
 * The output will be [38.90, -77.04]
 *
 */
export const extractLatLonFromCacheKey = (key: string, variableId: string) => {
  // Decode URL-encoded characters like %20 (space)
  const decodedStr = decodeURIComponent(key);

  // remove the variableId prefix
  const remainder = decodedStr.replace(`${variableId}_`, "");

  // take the first segment after variableId (before any suffix like _prod)
  const coordPart = remainder.split("_")[0];

  const nums = coordPart.split(",").map((n) => parseFloat(n.trim()));

  if (nums.length === 2 || nums.length === 4) return nums;

  return null; // return null if no coordinates found
};

/**
 *
 * @summary Converts a base time interval (starting at value=1)
 * into its equivalent in another time interval.
 * Example: from="half-hour", to="week" -> 336 half-hours fit into 1 week -> returns 336
 *
 * @param from "half-hourly" | "hourly" | "3-hourly" | "daily" | "weekly" | "monthly"
 * @param to "half-hourly" | "hourly" | "3-hourly" | "daily" | "weekly" | "monthly"
 * @returns the number of source intervals ("from") that fit inside one target ("to") interval
 *
 */
export const convertTimeInterval = (
  from: TimeIntervalKey,
  to: TimeIntervalKey
) => {
  // Unsupported time interval
  if (!TimeIntervals[from] || !TimeIntervals[to]) {
    return TimeIntervals[from];
  }

  const fromHours = TimeIntervals[from];
  const toHours = TimeIntervals[to];

  return toHours / fromHours;
};

/**
 *
 * Given time interval, product end date and start date. Return default date range in
 * "YYYY-MM-DD" format.
 *
 * TODO: Date range should end with the most recently available data. Since we don't
 * have the most recently available "dataProductEndDateTime", we will use dayjs() to
 * get the current date and time for now.
 *
 */
export const getDefaultDateRange = (
  minAvailableDate: Dayjs,
  maxAvailableDate: Dayjs,
  timeInterval: TimeIntervalKey
) => {
  let months = 1; // will go back a month

  switch (timeInterval) {
    // case "half-hourly":
    // case "hourly":
    // case "3-hourly":
    case "daily":
      months = 2;
      break;
    case "weekly":
      months = 12;
      break;
    case "monthly":
      months = 60;
      break;
    default:
      months = 1;
  }

  const start = dayjs.max(
    minAvailableDate,
    maxAvailableDate.subtract(months, "month")
  );

  return {
    startDate: getUTCStartOfDay(start),
    endDate: getUTCStartOfDay(dayjs(maxAvailableDate)),
  };
};
