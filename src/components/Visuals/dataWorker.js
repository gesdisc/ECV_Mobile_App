self.onmessage = function (e) {
  const rawData = e.data;
  const lines = rawData.split('\n').map((line) => line.trim()).filter((line) => line);
  const dataIndex = lines.findIndex((line) => line.startsWith('Date&Time'));

  const metaDataLines = lines.slice(1, dataIndex);
  const parsedMetaData = {};
  metaDataLines.forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      parsedMetaData[key.trim()] = value.trim();
    }
  });

  const dataLines = lines.slice(dataIndex + 1);
  const parsedData = dataLines
    .map((line) => {
      const [date, value] = line.split(/\s+/);
      const parsedValue = parseFloat(value);
      return { date, value: isNaN(parsedValue) ? null : parsedValue };
    })
    .filter((item) => item.value !== null);

  self.postMessage({ metaData: parsedMetaData, data: parsedData });
};
