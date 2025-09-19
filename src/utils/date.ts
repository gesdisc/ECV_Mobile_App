export const formatDate = (isoDateString: string) => {
  const date = new Date(isoDateString);
  return date.toISOString().split("T")[0];
};

export const convertToLocalDate = (
  input: string | number | Date,
  locale?: string | string[],
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = input instanceof Date ? input : new Date(input);

  return date.toLocaleString(
    locale,
    options ?? {
      dateStyle: "short",
      timeStyle: "short",
    }
  );
};
