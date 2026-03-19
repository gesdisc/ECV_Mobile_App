import React, { useEffect, useRef } from "react";
import { IonIcon, IonButton, IonModal, IonRange } from "@ionic/react";
import { settingsSharp } from "ionicons/icons";

import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import TileWMS from "ol/source/TileWMS";
import { transformExtent } from "ol/proj";
import Graticule from "ol/layer/Graticule";
import Stroke from "ol/style/Stroke";
import dayjs from "dayjs";

import { useDataParams } from "../../../store/DataParamsContext";
import { SpatialAreaType } from "../../../types/time-series.types";
import useProductDetails, {
  SelectedProductDetailsType,
} from "../../../hooks/useProductDetails";

import "ol/ol.css";
import styles from "./OLMap.module.css";

const GIBS_WMS_URL =
  "https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi";

const INITIAL_OPACITY = 0.8;

interface OLMapProps {
  width?: number;
  tifURL?: string;
  date: string;
}

const OLMap: React.FC<OLMapProps> = ({ date }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const modal = useRef<HTMLIonModalElement>(null);
  const { params: ctxParams } = useDataParams();
  const productDetails: SelectedProductDetailsType = useProductDetails(
    ctxParams.variable
  );

  const gibsLayerRef = useRef<TileLayer<TileWMS> | null>(null);

  const layerOpacityHandler = (e: CustomEvent) => {
    gibsLayerRef.current?.setOpacity(Number(e.detail.value.toFixed(2)));
  };

  const coastlineLayers = new TileLayer({
    source: new TileWMS({
      url: GIBS_WMS_URL,
      params: {
        LAYERS: "Coastlines_15m,Reference_Features_15m",
        FORMAT: "image/png",
        TRANSPARENT: true,
      },
      crossOrigin: "anonymous",
    }),
    opacity: 0.5,
  });

  const graticuleLayer = new Graticule({
    strokeStyle: new Stroke({
      color: "rgba(0, 0, 0, 0.7)",
      width: 1,
      lineDash: [0.5, 4],
    }),
    showLabels: true,
    wrapX: false,
  });

  useEffect(() => {
    if (!mapRef.current) return;
    if (!productDetails.gibsProductId) return;

    if (ctxParams.spatialArea.type !== SpatialAreaType.BOUNDING_BOX) return;

    const bbox3857 = transformExtent(
      [
        parseFloat(ctxParams.spatialArea.value.west),
        parseFloat(ctxParams.spatialArea.value.south),
        parseFloat(ctxParams.spatialArea.value.east),
        parseFloat(ctxParams.spatialArea.value.north),
      ],
      "EPSG:4326",
      "EPSG:3857"
    );

    const OSMsource = new OSM();
    const mapView = new View({
      projection: "EPSG:3857",
      center: [0, 0],
      zoom: 2,
    });

    const defaultLayer = new TileLayer({
      source: OSMsource,
    });

    const gibsLayer = new TileLayer({
      source: new TileWMS({
        url: GIBS_WMS_URL,
        params: {
          LAYERS: productDetails.gibsProductId,
          FORMAT: "image/png",
          TRANSPARENT: true,
          // TILED: true,
          TIME: date,
        },
        transition: 0,
        crossOrigin: "anonymous",
      }),
      extent: bbox3857,
      opacity: INITIAL_OPACITY,
    });

    gibsLayerRef.current = gibsLayer;

    const map = new Map({
      target: mapRef.current,
      layers: [defaultLayer, gibsLayer, coastlineLayers, graticuleLayer],
      view: mapView,
    });

    mapView.fit(bbox3857, {
      maxZoom: 4,
      padding: [40, 40, 40, 40],
      duration: 0,
    });

    return () => {
      map.setTarget(undefined);
    };
  }, [productDetails]);

  // Update TIME
  useEffect(() => {
    // YYYY-MM-DD or YYYY-MM-DDThh:mm:ssZ
    gibsLayerRef.current?.getSource()?.updateParams({
      TIME: dayjs(date).utc().format("YYYY-MM-DDTHH:mm:ss[Z]"),
    });
  }, [date]);

  if (!productDetails.gibsProductId) {
    return (
      <p>
        <b>{productDetails.label}</b> Map visualization is not available.
      </p>
    );
  }

  return (
    <>
      <div ref={mapRef} className={styles["map-container"]}>
        <IonButton
          size="small"
          className={styles["map-settings"]}
          id="open-modal"
        >
          <IonIcon aria-hidden="true" size="medium" icon={settingsSharp} />
        </IonButton>
      </div>

      <IonModal
        ref={modal}
        trigger="open-modal"
        initialBreakpoint={0.25}
        breakpoints={[0, 1]}
      >
        <div className="ion-padding">
          <IonRange
            labelPlacement="start"
            label="Opacity:"
            min={0}
            step={0.01}
            max={1}
            pin={true}
            pinFormatter={(value: number) =>
              `${Number((value * 100).toFixed(2))}%`
            }
            value={INITIAL_OPACITY}
            onIonInput={layerOpacityHandler}
          ></IonRange>
        </div>
      </IonModal>
    </>
  );
};

export default OLMap;
