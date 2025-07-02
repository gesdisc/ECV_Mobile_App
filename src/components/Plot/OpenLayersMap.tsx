import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import WebGLTile from "ol/layer/WebGLTile";
import OSM from "ol/source/OSM";
import GeoTIFF from "ol/source/GeoTIFF"; // Import GeoTIFF source
import "ol/ol.css"; // Import OpenLayers CSS

import { useDataParams } from "../../store/DataParamsContext";

const OpenLayersMap: React.FC = () => {
  const { latitude, longitude } = useDataParams();
  const mapRef = useRef<HTMLDivElement>(null); // Ref for the map container

  useEffect(() => {
    if (!mapRef.current) return; // Ensure the ref is available

    const source = new GeoTIFF({
      sources: [
        {
          url: "https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif",
        },
      ],
    });

    const geoTiffLayer = new WebGLTile({
      source: source,
      opacity: 0.5,
    });

    const map = new Map({
      target: mapRef.current, // Target the div element
      layers: [
        new TileLayer({
          source: new OSM(), // Add a base map layer (e.g., OpenStreetMap)
        }),
      ],

      view: new View({
        center: [longitude, latitude], // Initial map center
        zoom: 2, // Initial zoom level
      }),

      //   view: source.getView(),
    });

    map.addLayer(geoTiffLayer);

    // Adjust view to fit the GeoTIFF extent (optional)
    source.getView().then((viewOptions) => {
      map.setView(new View(viewOptions));
    });

    // Clean up the map when the component unmounts
    return () => {
      map.setTarget(undefined);
    };
  }, []); // Empty dependency array ensures effect runs only once

  return <div ref={mapRef} style={{ width: "100%", height: "400px" }} />;
};

export default OpenLayersMap;
