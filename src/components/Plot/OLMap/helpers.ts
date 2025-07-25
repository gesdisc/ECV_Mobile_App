import colormap from "colormap";
// Set a default colormap
const colorMapName = "density";
// reverse the colormap?
const colorMapReverse = false;

const getColorStops = (
  name: string,
  min: number,
  max: number,
  steps: number,
  reverse: boolean
) => {
  const delta = (max - min) / (steps - 1);
  const stops = new Array(steps * 2);
  const colors = colormap({ colormap: name, nshades: steps, format: "rgba" });
  if (reverse) {
    colors.reverse();
  }
  for (let i = 0; i < steps; i++) {
    stops[i * 2] = min + i * delta;
    stops[i * 2 + 1] = colors[i];
  }
  return stops;
};

// Use this function when the colormap name is changed
// Set up a default style object using the colormap; make sure the second band array
// (i.e., ['band', 2]) is zeroed-out for the Cloud Giovanni COGs otherwise, we'll get a big bounding but
// blank tiles around the actual GeoTIFF data.
export const updateGtStyle = () => {
  return {
    color: [
      "case",
      ["==", ["band", 2], 0],
      [0, 0, 0, 0],
      [
        "interpolate",
        ["linear"],
        ["band", 1],
        ...getColorStops(colorMapName, 0, 0.000014, 72, colorMapReverse),
      ],
    ],
  };
};

// function vgi(pixel: any) {
//   const r = pixel[0] / 255;
//   const g = pixel[1] / 255;
//   const b = pixel[2] / 255;
//   return (2 * g - r - b) / (2 * g + r + b);
// }

/**
 * Summarize values for a histogram.
 * @param {number} value A VGI value.
 * @param {Object} counts An object for keeping track of VGI counts.
 */
// function summarize(value: number, counts: any) {
//   const min = counts.min;
//   const max = counts.max;
//   const num = counts.values.length;
//   if (value < min) {
//     // do nothing
//   } else if (value >= max) {
//     counts.values[num - 1] += 1;
//   } else {
//     const index = Math.floor((value - min) / counts.delta);
//     counts.values[index] += 1;
//   }
// }

// function createCounts(min: number, max: number, num: number) {
//   const values = new Array(num);
//   for (let i = 0; i < num; ++i) {
//     values[i] = 0;
//   }
//   return {
//     min: min,
//     max: max,
//     values: values,
//     delta: (max - min) / num,
//   };
// }
