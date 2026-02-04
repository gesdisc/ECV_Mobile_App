import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

type AllDateTypes = string | number | Date | Dayjs;

const NO_MILLIS_UTC_STRING = "YYYY-MM-DDTHH:mm:ss[Z]";
const UTC_STRING = "YYYY-MM-DDTHH:mm:ss.SSS[Z]";

export function toLocalShortDateTime(str: string | number | Date): string {
  return dayjs(str).format("YYYY-MM-DD HH:mm");
}

export function toStartOfDay(str: string | number | Date): string {
  return dayjs(str).startOf("day").format("YYYY-MM-DD[T]HH:mm:ss");
}

export function getDate(str: string | number | Date): string {
  return dayjs(str).format("YYYY-MM-DD");
}

export function getUTCStartOfDay(value: AllDateTypes): string {
  return dayjs(value).utc().startOf("day").format(NO_MILLIS_UTC_STRING);
}

export function isValidUTC(value: string): boolean {
  const formats = [NO_MILLIS_UTC_STRING, UTC_STRING];

  for (const format of formats) {
    if (dayjs.utc(value, format, true).isValid()) {
      const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
      if (regex.test(value)) return true;
    }
  }

  return false;
}
