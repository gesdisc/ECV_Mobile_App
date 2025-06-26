import { parseTimeSeriesCsv } from '../../helpers/time-series';

self.onmessage = function (e) {
  const rawData = e.data;
  const {metadata, data} = parseTimeSeriesCsv(rawData); 
  console.log("parsed metaD: ", metadata)
  console.log("parsed Data: ", data)
  self.postMessage({ metadata, data });
};
