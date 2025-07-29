import colormap from "colormap";

const colorMapName = "density";
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
