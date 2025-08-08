import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import GeoTIFF from "ol/source/GeoTIFF";
import colormap from "colormap";
import WebGLTileLayer from "ol/layer/WebGLTile";
import RasterSource from "ol/source/Raster";

import "ol/ol.css";

function vgi(pixel: any) {
  const r = pixel[0] / 255;
  const g = pixel[1] / 255;
  const b = pixel[2] / 255;
  return (2 * g - r - b) / (2 * g + r + b);
}

/**
 * Summarize values for a histogram.
 * @param {number} value A VGI value.
 * @param {Object} counts An object for keeping track of VGI counts.
 */
function summarize(value: number, counts: any) {
  const min = counts.min;
  const max = counts.max;
  const num = counts.values.length;
  if (value < min) {
    // do nothing
  } else if (value >= max) {
    counts.values[num - 1] += 1;
  } else {
    const index = Math.floor((value - min) / counts.delta);
    counts.values[index] += 1;
  }
}

function createCounts(min: number, max: number, num: number) {
  const values = new Array(num);
  for (let i = 0; i < num; ++i) {
    values[i] = 0;
  }
  return {
    min: min,
    max: max,
    values: values,
    delta: (max - min) / num,
  };
}

const OpenLayersMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null); // Ref for the map container
  const [info, setInfo] = useState(null);
  const minVgi = 0;
  const maxVgi = 0.5;
  const bins = 10;

  const ndvi = [
    "/",
    ["-", ["band", 2], ["band", 1]],
    ["+", ["band", 2], ["band", 1]],
  ];
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

  // const featureOverlay = new VectorLayer({
  //   source: new VectorSource(),
  //   map: mapRef,
  //   style: {
  //     "stroke-color": "rgba(255, 255, 255, 0.7)",
  //     "stroke-width": 2,
  //   },
  // });
  let highlight: any;
  const displayFeatureInfo = function (pixel: any, map: any) {
    const feature = map.forEachFeatureAtPixel(pixel, function (feature: any) {
      return feature;
    });

    if (feature) {
      console.log(feature.get("ECO_NAME") || "&nbsp;");
    } else {
      console.log("&nbsp;");
    }

    // if (feature !== highlight) {
    //   if (highlight) {
    //     featureOverlay.getSource().removeFeature(highlight);
    //   }
    //   if (feature) {
    //     featureOverlay.getSource().addFeature(feature);
    //   }
    //   highlight = feature;
    // }
  };

  const pointerPixelHandler = (evt: any, layer: any) => {
    if (evt.dragging) {
      return;
    }
    // console.log(layer.getData(evt.pixel));
    // displayFeatureInfo(evt.pixel, mapRef.current);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const tifSource = new GeoTIFF({
      sources: [
        {
          url: "/assets/GIOVANNI-g4.timeAvgMap.GLDAS_NOAH025_3H_2_0_Snowf_tavg.20050101-20050104.121W_54N_113W_61N.tif",
          // url: "https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif",
        },
      ],
    });

    const tifLayer = new WebGLTileLayer({
      source: tifSource,
      opacity: 0.5,
      // style: {
      //   color: [
      //     "interpolate",
      //     ["linear"],
      //     ndvi,
      //     // color ramp for NDVI values
      //     ...getColorStops("blackbody", -0.5, 1, 10, true),
      //   ],
      // },
    });
    const source = new OSM();
    const map = new Map({
      target: mapRef.current,
    });
    const layer = new TileLayer({ source: source });
    const mapView = new View({
      center: [0, 0],
      zoom: 2,
    });

    map.setView(mapView);
    map.addLayer(layer);
    map.addLayer(tifLayer);

    map.on("pointermove", (evt) => {
      pointerPixelHandler(evt, tifLayer);
    });

    const raster = new RasterSource({
      sources: [tifSource],
      /**
       * Run calculations on pixel data.
       * @param {Array} pixels List of pixels (one per source).
       * @param {Object} data User data object.
       * @return {Array} The output pixel.
       */
      operation: function (pixels: any, data: any) {
        const pixel = pixels[0];
        const value = vgi(pixel);
        summarize(value, data.counts);
        if (value >= data.threshold) {
          pixel[0] = 0;
          pixel[1] = 255;
          pixel[2] = 0;
          pixel[3] = 128;
        } else {
          pixel[3] = 0;
        }
        return pixel;
      },
      lib: {
        vgi: vgi,
        summarize: summarize,
      },
    });
    raster.set("threshold", 0.25);

    const getView = async () => {
      // const image = await tifSource.getImage();
      const view = await tifSource.getView();
      // tifLayer.getResolution();
      const props = tifSource.getProperties();
      // const image = await tifLayer.getData();

      // console.log("view: ", view);
      // console.log("image: ", image);
      // console.log("props: ", props);
    };
    getView();

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "400px" }} />;
};

export default OpenLayersMap;
