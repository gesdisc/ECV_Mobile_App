import React, { useEffect, useRef, useLayoutEffect } from "react";
import { Map } from "ol";
import GeoTIFF from "ol/source/GeoTIFF";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { transform } from "ol/proj.js";

import { updateGtStyle } from "./helpers";

interface TiffLayerProps {
  tifURL?: string;
  map?: Map;
  opacity?: number;
}

const TiffLayer: React.FC<TiffLayerProps> = ({ map, tifURL, opacity = 1 }) => {
  const tifSource = new GeoTIFF({
    sources: [
      {
        // url: "/assets/geotifs/GIOVANNI-timeAvgMap.M2T1NXAER_5_12_4_BCCMASS.20250101-20250101.45W_13S_126E_51N.tif",
        url: tifURL,
        bands: [1],
        nodata: NaN,
        // metadata: [3],
      },
    ],
    interpolate: false,
    normalize: false,
  });

  const layerRef = useRef(
    new WebGLTileLayer({
      visible: false,
    })
  ); // single instance

  useEffect(() => {
    layerRef.current.setOpacity(opacity);
  }, [opacity]);

  layerRef.current.setStyle(updateGtStyle());

  useEffect(() => {
    if (!map || !layerRef.current) return;
    layerRef.current.setVisible(true);
    layerRef.current.setSource(tifSource);
    map.addLayer(layerRef.current);

    return () => {
      map.removeLayer(layerRef.current);
    };
  }, [tifURL]);

  return null;
};

export default TiffLayer;
