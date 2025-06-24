import { parseTimeSeriesCsv } from '../../utils/time-series';

self.onmessage = function (e) {
  const rawData = e.data;
  const {metadata, data} = parseTimeSeriesCsv(rawData); 
  self.postMessage({ metadata, data });
};
