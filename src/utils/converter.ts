export function convertToFixedFloat(
  num: number | string,
  decimalPlaces: number
) {
  const floatValue = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(floatValue)) return NaN;
  return parseFloat(floatValue.toFixed(decimalPlaces));
}
