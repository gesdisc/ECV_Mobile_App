import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import WebGLTile from "ol/layer/WebGLTile";
import OSM from "ol/source/OSM";
import GeoTIFF from "ol/source/GeoTIFF";
import colormap from "colormap";
import Draw from "ol/interaction/Draw";

import "ol/ol.css";

const OpenLayersMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null); // Ref for the map container

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

  useEffect(() => {
    if (!mapRef.current) return;
    const tifSource = new GeoTIFF({
      sources: [
        {
          url: "/assets/GIOVANNI-g4.timeAvgMap.GLDAS_NOAH025_3H_2_0_Snowf_tavg.20050101-20050104.121W_54N_113W_61N.tif",
        },
      ],
    });
    const tifLayer = new WebGLTile({
      source: tifSource,
      opacity: 0.5,
      style: {
        color: [
          "interpolate",
          ["linear"],
          ndvi,
          // color ramp for NDVI values
          ...getColorStops("blackbody", -0.5, 1, 10, true),
        ],
      },
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

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "400px" }} />;
};

export default OpenLayersMap;
