import React, { useRef, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";

import { useDataParams } from "../../store/DataParamsContext";
import { convertToFixedFloat } from "../../utils/converter";
import { SpatialAreaType } from "../../types/time-series.types";

// Import the marker images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import Banner from "../UI/Banner";
import MapResizer from "./MapResizer";
// import LocationMarker from "./LocationMarker";
import CoordinateInput from "./CoordinateInput";
// import BoundingBox from "./BoundingBox";
import DrawingFeatures from "./DrawingFeatures";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import styles from "./Location.module.css";
import {
  ERROR_EMPTY,
  ERROR_INCORRECT_LENGTH,
  validateCoordinates,
} from "./helpers";

// Fix default marker icon issues
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// FIXME: dropping a pointer outside of the map bounding box drops is not wokring properly (no bug when removing coordinate input )
// FIXME: map not dragging after switching mapDrawingOptions from COORD to BBOX
// TODO: Bring back inputs
// TODO: RESTRICT AREA COORDINATES???
const Location: React.FC = () => {
  const mapRef = useRef(null);
  const { params: ctxParams, staged, requestUpdateParams } = useDataParams();
  const [mapDrawingOption, setMapDrawingOption] = useState<SpatialAreaType>(
    staged.spatialArea?.type || ctxParams.spatialArea.type
  );
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (value: string) => {
    const { coords, error } = validateCoordinates(value, mapDrawingOption);
    console.log("ERROR ****** ", error);
    // if (error) {
    //   setError(error);
    //   // return;
    // }
    setError(error);
    // setError(null);

    if (error === ERROR_EMPTY || error === ERROR_INCORRECT_LENGTH) {
      return;
    }

    if (mapDrawingOption === SpatialAreaType.COORDINATES) {
      requestUpdateParams({
        spatialArea: {
          type: SpatialAreaType.COORDINATES,
          value: {
            lat: convertToFixedFloat(coords[0], 4).toString(),
            lng: convertToFixedFloat(coords[1], 4).toString(),
          },
        },
      });
      return;
    }

    if (mapDrawingOption === SpatialAreaType.BOUNDING_BOX) {
      requestUpdateParams({
        spatialArea: {
          type: SpatialAreaType.BOUNDING_BOX,
          value: {
            west: convertToFixedFloat(coords[0], 4).toString(),
            south: convertToFixedFloat(coords[1], 4).toString(),
            east: convertToFixedFloat(coords[2], 4).toString(),
            north: convertToFixedFloat(coords[3], 4).toString(),
          },
        },
      });
    }
  };

  const mapDrawingOptionChangeHandler = (option: SpatialAreaType) => {
    setMapDrawingOption(option);
  };

  const handleError = (err: string | null) => {
    setError(err);
  };

  // const getInitialCenter = () => {
  //   if (ctxParams.spatialArea.type === SpatialAreaType.COORDINATES) {
  //     const { lat, lng } = ctxParams.spatialArea.value;
  //     return [parseFloat(lat), parseFloat(lng)];
  //   }

  //   if (ctxParams.spatialArea.type === SpatialAreaType.BOUNDING_BOX) {
  //     const { west, south, east, north } = ctxParams.spatialArea.value;
  //     // center of bbox
  //     const centerLat = (parseFloat(south) + parseFloat(north)) / 2;
  //     const centerLng = (parseFloat(west) + parseFloat(east)) / 2;
  //     return [centerLat, centerLng];
  //   }

  //   return [0, 0];
  // };
  // console.log(getInitialCenter());
  return (
    <IonPage>
      <Banner />
      <IonContent scrollY={false} fullscreen={false}>
        <div className={styles["map-container"]}>
          <MapContainer
            center={[0, 0]}
            zoom={2}
            minZoom={2}
            maxZoom={19}
            zoomSnap={1}
            zoomDelta={1}
            worldCopyJump={false}
            maxBounds={[
              [-90, -180],
              [90, 180],
            ]}
            // maxBoundsViscosity={1.0}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              // noWrap={true}
              bounds={[
                [-90, -180],
                [90, 180],
              ]}
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // tile source
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' // attribution
            />
            <DrawingFeatures
              onMapDrawingOptionChange={mapDrawingOptionChangeHandler}
              onError={handleError}
            />
            <MapResizer />
          </MapContainer>
        </div>
      </IonContent>
      <CoordinateInput
        mapDrawingOption={mapDrawingOption}
        value={Object.values(
          staged.spatialArea?.value || ctxParams.spatialArea.value
        ).join(",")}
        onChange={handleInputChange}
        error={error}
      />
    </IonPage>
  );
};

export default Location;
