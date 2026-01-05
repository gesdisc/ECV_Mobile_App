import dayjs from "dayjs";

export function toLocalShortDateTime(str: string | number | Date): string {
  return dayjs(str).format("YYYY-MM-DD HH:mm");
}

export function toStartOfDay(str: string | number | Date): string {
  return dayjs(str).startOf("day").format("YYYY-MM-DD[T]HH:mm:ss");
}

export function getDate(str: string | number | Date): string {
  return dayjs(str).format("YYYY-MM-DD");
}
