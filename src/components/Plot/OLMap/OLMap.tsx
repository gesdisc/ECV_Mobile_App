import React, { useEffect, useRef, useState } from "react";
import { IonIcon, IonButton, IonModal, IonRange } from "@ionic/react";
import { settingsSharp } from "ionicons/icons";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";

import { MARGIN_INLINE } from "../plotSchema";

import TiffLayer from "./TiffLayer";

import "ol/ol.css";
import styles from "./OLMap.module.css";

interface OLMapProps {
  width?: number;
  tifURL?: string;
}

const OLMap: React.FC<OLMapProps> = ({ tifURL }) => {
  const mapRef = useRef<HTMLDivElement>(null); // Ref for the map container
  const [stateMap, setStateMap] = useState<Map>();
  const modal = useRef<HTMLIonModalElement>(null);
  const [layerOpacity, setLayerOpacity] = useState(0.8);

  const layerOpacityHandler = (e: any) => {
    setLayerOpacity(Number(e.detail.value.toFixed(2)));
  };

  const OSMsource = new OSM();
  const mapView = new View({
    center: [0, 0],
    zoom: 2,
  });
  const defaultLayer = new TileLayer({
    source: OSMsource,
  });

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [defaultLayer],
      view: mapView,
    });
    setStateMap(map);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return (
    <>
      <div
        ref={mapRef}
        style={{
          width: `calc(100% - ${MARGIN_INLINE * 2}px)`,
        }}
        className={styles["map-container"]}
      >
        <TiffLayer map={stateMap} tifURL={tifURL} opacity={layerOpacity} />
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
            label="Tiff layer opacity"
            min={0}
            step={0.01}
            max={1}
            pin={true}
            pinFormatter={(value: number) =>
              `${Number((value * 100).toFixed(2))}%`
            }
            value={layerOpacity}
            onIonInput={layerOpacityHandler}
          ></IonRange>
        </div>
      </IonModal>
    </>
  );
};

export default OLMap;
