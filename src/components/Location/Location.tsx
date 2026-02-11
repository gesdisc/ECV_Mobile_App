import React, { useMemo, useRef, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { MapContainer, Rectangle, TileLayer, useMap } from "react-leaflet";
// import { EditControl } from 'react-leaflet-draw';
import L, { LatLngBoundsExpression } from "leaflet";

import { useDataParams } from "../../store/DataParamsContext";
import { convertToFixedFloat } from "../../utils/converter";

// Import the marker images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import Banner from "../UI/Banner";
import MapResizer from "./MapResizer";
import LocationMarker from "./LocationMarker";
import CoordinateInput from "./CoordinateInput";

import "leaflet/dist/leaflet.css";
import styles from "./Location.module.css";
import BBoxHandler from "./BBoxHandler";
import { SpatialAreaType } from "../../types/time-series.types";

// const innerBounds: LatLngBoundsExpression = [
//   [49.505, -2.09],
//   [53.505, 2.09],
// ];
// const outerBounds: LatLngBoundsExpression = [
//   [50.505, -29.09],
//   [52.505, 29.09],
// ];

// const redColor = { color: "red" };
// const whiteColor = { color: "white" };

// function SetBoundsRectangles() {
//   const [bounds, setBounds] = useState(outerBounds);
//   const map = useMap();

//   const innerHandlers = useMemo(
//     () => ({
//       click() {
//         setBounds(innerBounds);
//         map.fitBounds(innerBounds);
//       },
//     }),
//     [map],
//   );
//   const outerHandlers = useMemo(
//     () => ({
//       click() {
//         setBounds(outerBounds);
//         map.fitBounds(outerBounds);
//       },
//     }),
//     [map],
//   );

//   return (
//     <>
//       <Rectangle
//         bounds={outerBounds}
//         eventHandlers={outerHandlers}
//         pathOptions={bounds === outerBounds ? redColor : whiteColor}
//       />
//       <Rectangle
//         bounds={innerBounds}
//         eventHandlers={innerHandlers}
//         pathOptions={bounds === innerBounds ? redColor : whiteColor}
//       />
//     </>
//   );
// }

// Fix default marker icon issues
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Location: React.FC = () => {
  const mapRef = useRef(null);
  const { params: ctxParams, staged, requestUpdateParams } = useDataParams();

  // const handleLatChange = (e: CustomEvent) => {
  //   const newLat = e.detail.value; // get new latitude
  //   // requestUpdateParams({ lat: convertToFixedFloat(newLat, 4) });
  //   requestUpdateParams({
  //     spatialArea: {
  //       type: SpatialAreaType.COORDINATES,
  //       value: {
  //         lat: convertToFixedFloat(newLat, 4).toString(),
  //         lng: convertToFixedFloat(
  //           ctxParams.spatialArea.value.lng,
  //           4,
  //         ).toString(),
  //       },
  //     },
  //   });
  // };

  // const handleLngChange = (e: CustomEvent) => {
  //   const newLng = e.detail.value; // get new longitude
  //   requestUpdateParams({ lon: convertToFixedFloat(newLng, 4) });
  // };

  const [selection, setSelection] = useState<any>();

  return (
    <IonPage>
      <Banner />
      <IonContent scrollY={false} fullscreen={false}>
        <div className={styles["map-container"]}>
          <MapContainer
            // center={[ctxParams.lat, ctxParams.lon]}
            zoom={8}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // tile source
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' // attribution
            />
            {/* <SetBoundsRectangles /> */}

            <BBoxHandler setSelection={setSelection} />

            {ctxParams.spatialArea.type === SpatialAreaType.COORDINATES && (
              <LocationMarker />
            )}
            <MapResizer />
            {ctxParams.spatialArea.type === SpatialAreaType.BOUNDING_BOX && (
              <Rectangle
                bounds={[
                  [selection.minLat, selection.minLng],
                  [selection.maxLat, selection.maxLng],
                ]}
                // eventHandlers={outerHandlers}
                // pathOptions={bounds === outerBounds ? redColor : whiteColor}
              />
            )}
          </MapContainer>
        </div>
      </IonContent>
      {/* <CoordinateInput
        latitude={staged.lat || ctxParams.lat}
        longitude={staged.lon || ctxParams.lon}
        onLatChange={handleLatChange}
        onLngChange={handleLngChange}
      /> */}
    </IonPage>
  );
};

export default Location;
