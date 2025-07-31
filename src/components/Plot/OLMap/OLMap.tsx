import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import {
  IonRow,
  IonCol,
  IonGrid,
  IonIcon,
  IonButton,
  IonModal,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonPage,
  IonRange,
} from "@ionic/react";
import { settingsSharp } from "ionicons/icons";

import TiffLayer from "./TiffLayer";

import "ol/ol.css";

// const colormaps = [
//   "jet",
//   "hsv",
//   "hot",
//   "cool",
//   "spring",
//   "summer",
//   "autumn",
//   "winter",
//   "bone",
//   "copper",
//   "greys",
//   "YIGnBu",
//   "greens",
//   "YIOrRd",
//   "bluered",
//   "RdBu",
//   "picnic",
//   "rainbow",
//   "portland",
//   "blackbody",
//   "earth",
//   "electric",
//   "viridis",
//   "inferno",
//   "magma",
//   "plasma",
//   "warm",
//   "cool",
//   "bathymetry",
//   "cdom",
//   "chlorophyll",
//   "density",
//   "fressurface-blue",
//   "freesurface-red",
//   "oxygen",
//   "par",
//   "phase",
//   "salinity",
//   "temperature",
//   "turbidity",
//   "velocity-blue",
//   "velocity-green",
//   "cubhelix",
// ];

interface OLMapProps {
  width?: number;
  tifURL?: string;
}

const OLMap: React.FC<OLMapProps> = ({ width, tifURL }) => {
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
      <IonGrid style={{ display: "flex", justifyContent: "center" }}>
        <IonRow class="ion-justify-content-center">
          <IonCol>
            {/* <MapView width={width} tifURL={currentGeoTIFF} /> */}
            <div
              ref={mapRef}
              style={{ width: width, height: "250px", position: "relative" }}
            >
              <TiffLayer
                map={stateMap}
                tifURL={tifURL}
                opacity={layerOpacity}
              />
              <IonButton
                // disabled={disabled}
                size="small"
                // onClick={settingsBtnHandler}
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  zIndex: 100,
                }}
                id="open-modal"
              >
                <IonIcon
                  aria-hidden="true"
                  size="medium"
                  icon={settingsSharp}
                />
              </IonButton>
            </div>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonModal
        ref={modal}
        trigger="open-modal"
        initialBreakpoint={0.25}
        breakpoints={[0, 1]}
      >
        <div className="block ion-padding">
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
