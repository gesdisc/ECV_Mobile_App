import { parseTimeSeriesCsv } from "../../helpers/time-series";

self.onmessage = function (e) {
  const rawData = e.data;
  const { metadata, data } = parseTimeSeriesCsv(rawData);
  self.postMessage({ metadata, data });
};
