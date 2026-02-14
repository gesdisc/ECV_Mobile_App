import React, { useMemo } from "react";
import { IonFooter, IonToolbar } from "@ionic/react";

import { SpatialArea, SpatialAreaType } from "../../types/time-series.types";

import { IMaskInput } from "react-imask";

import styles from "./Location.module.css";

function formatSelection(sel: SpatialArea): string {
  if (!sel) return "";

  if (sel.type === SpatialAreaType.COORDINATES) {
    return `${sel.value.lat}, ${sel.value.lng}`;
  }

  return `${sel.value.west}, ${sel.value.south}, ${sel.value.east}, ${sel.value.north}`;
}

interface CoordinateInputProps {
  value: SpatialArea;
  onInputChange: (values: number[]) => void;
  mapOption?: SpatialAreaType;
}

const CoordinateInput: React.FC<CoordinateInputProps> = ({
  value,
  onInputChange,
  mapOption,
}) => {
  const maskConfig = useMemo(() => {
    const numberMask = {
      mask: Number,
      signed: true,
      scale: 4,
      radix: ".", // decimal is dot
      mapToRadix: ["."],
      thousandsSeparator: "", // disable 1,000 formatting
      normalizeZeros: true,
      padFractionalZeros: false,
    };

    if (mapOption === SpatialAreaType.COORDINATES) {
      return {
        mask: "lat, lon",
        blocks: {
          lat: { ...numberMask, min: -90, max: 90 },
          lon: { ...numberMask, min: -180, max: 180 },
        },
      };
    }

    return {
      mask: "south, west, north, east",
      blocks: {
        south: { ...numberMask, min: -90, max: 90 },
        west: { ...numberMask, min: -180, max: 180 },
        north: { ...numberMask, min: -90, max: 90 },
        east: { ...numberMask, min: -180, max: 180 },
      },
    };
  }, [mapOption]);

  // parse values
  const handleAccept = (value: string) => {
    const nums = value
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((v) => !Number.isNaN(v));

    console.log("nums: ", nums);

    // FIXME: when switching from COORD to BBOX, nums array has length 1 with value of 0, which causes NaN errors. This is a quick fix, but should be properly debugged and fixed.
    if (mapOption === SpatialAreaType.BOUNDING_BOX && nums.length !== 4) {
      onInputChange([-16, 2.0703, 47.9899, -19.3359]); // use default bbox values for now to prevent NaN errors
      return;
    }

    onInputChange(nums);
  };

  return (
    <IonFooter id="location-footer">
      <IonToolbar>
        <IMaskInput
          {...maskConfig}
          inputMode="decimal"
          pattern="[0-9.,-]*"
          placeholder={
            mapOption === SpatialAreaType.COORDINATES
              ? "lat, lon"
              : "south, west, north, east"
          }
          onAccept={handleAccept}
          className={styles["ion-like-input"]}
          value={formatSelection(value)}
        />
        {/* <div className={`${styles["input-container"]}`}>
          <IonItem>
            <IonLabel position="floating">
              {mapOption === SpatialAreaType.COORDINATES
                ? "Latitude:"
                : "South:"}
            </IonLabel>
            <IonInput
              type="number"
              value={
                mapOption === SpatialAreaType.COORDINATES
                  ? value.lat
                  : value.south
              }
              onIonChange={onInputChange}
              name={mapOption === SpatialAreaType.COORDINATES ? "lat" : "south"}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">
              {mapOption === SpatialAreaType.COORDINATES
                ? "Longitude:"
                : "West:"}
            </IonLabel>
            <IonInput
              type="number"
              value={value.lng}
              onIonChange={onInputChange}
              name={mapOption === SpatialAreaType.COORDINATES ? "lng" : "west"}
            />
          </IonItem>
          {mapOption === SpatialAreaType.BOUNDING_BOX && (
            <>
              <IonItem>
                <IonLabel position="floating">north:</IonLabel>
                <IonInput
                  type="number"
                  value={value.north}
                  onIonChange={onInputChange}
                  name="north"
                />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">east:</IonLabel>
                <IonInput
                  type="number"
                  value={value.east}
                  onIonChange={onInputChange}
                  name="east"
                />
              </IonItem>
            </>
          )}
        </div> */}
      </IonToolbar>
    </IonFooter>
  );
};

export default CoordinateInput;
