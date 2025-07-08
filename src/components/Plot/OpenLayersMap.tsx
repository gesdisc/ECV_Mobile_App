import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import WebGLTile from "ol/layer/WebGLTile";
import OSM from "ol/source/OSM";
import GeoTIFF from "ol/source/GeoTIFF";

import "ol/ol.css";

const OpenLayersMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null); // Ref for the map container

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
      opacity: 0.8,
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
