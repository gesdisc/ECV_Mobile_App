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
  //  const map = useMap();
  // const group = useGroup();

  const tifSource = new GeoTIFF({
    sources: [
      {
        // url: "/assets/geotifs/GIOVANNI-timeAvgMap.M2T1NXAER_5_12_4_BCCMASS.20250101-20250101.45W_13S_126E_51N.tif",
        // url: `${tif_location}${tif_base}${tif_date}${tif_tail}`,
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
    // tifLayer.updateStyleVariables({ opacity: opacity });
  }, [opacity]);
  // Update map view to match the GeoTIFF extent (optional)
  // tifSource.getView().then((viewOptions) => {
  //   map?.setView(new View(viewOptions));
  // });

  // useEffect(() => {
  // if (!map && !group) return;
  // if (!map) return;

  // const layer = layerRef.current; // same instance every time
  // props.name && layer.set("name", props.name);
  // const target = group || map;
  // const target = map;

  // if (target) {
  //   if (target instanceof Map) {
  //     target.addLayer(layer);
  //   } else {
  //     // target.getLayers().push(layer);
  //     console.log("this should happen 1");
  //   }
  // }

  // return () => {
  //   if (target) {
  //     if (target instanceof Map) {
  //       target.removeLayer(layer);
  //     } else {
  //       // target.getLayers().remove(layer);
  //       console.log("this should happen 2");
  //     }
  //   }
  // };
  // }, [map]); // add group
  // const tifLayer = new WebGLTileLayer({
  //   source: tifSource,
  //   // opacity: opacity,
  //   visible: false,
  // });
  layerRef.current.setStyle(updateGtStyle());
  useEffect(() => {
    if (!map || !layerRef.current) return;
    layerRef.current.setSource(tifSource);
    map.addLayer(layerRef.current);
    layerRef.current.setVisible(true);

    // center the map to the tiff
    // tifSource.getView().then((sourceView) => {
    //   const view = map.getView();

    //   if (!sourceView.center) return;
    //   // transform the image center to view coorindates
    //   const center = transform(
    //     sourceView.center,
    //     sourceView.projection,
    //     view.getProjection()
    //   );

    //   // update the view to show the image
    //   view.setCenter(center);
    // });

    // map.removeLayer(tifLayer);
    // stateMap.getLayers().forEach((layer) => {
    //   console.log("___________layer: ", layer);
    // });

    // tifSource.refresh();
    // map
    //   .getLayers()
    //   .getArray()
    //   .filter(
    //     (layer) => layer
    //   )
    //   .forEach((layer) => map.removeLayer(layer));
    // map.addLayer(tifLayer);

    return () => {
      layerRef.current.setVisible(false);
      map.removeLayer(layerRef.current);
    };
  }, [tifURL]);

  // after GeoTIFF metadata has been read, recenter the map to show the image

  return null;
};

export default TiffLayer;
