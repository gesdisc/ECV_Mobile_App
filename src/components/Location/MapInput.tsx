import React, { useState } from "react";
import {
  IonFooter,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonToolbar,
} from "@ionic/react";
import {
  Coordinates,
  BoundingBox,
  SpatialAreaType,
} from "../../types/time-series.types";

interface CoordinateInputProps {
  mapOption: SpatialAreaType;
  value?: Coordinates | BoundingBox;
  onChange?: (nums: number[]) => void;
}

const CoordinateInput: React.FC<CoordinateInputProps> = ({
  mapOption,
  value,
  onChange,
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const [isValid, setIsValid] = useState<boolean>();

  // -------------------------------
  // Regex for validation
  // -------------------------------
  const regexCoordinate =
    /^-?(90(\.0+)?|[1-8]?\d(\.\d+)?),\s*-?(180(\.0+)?|(1[0-7]\d|[1-9]?\d)(\.\d+)?)$/;

  const regexBBox =
    /^-?(90(\.0+)?|[1-8]?\d(\.\d+)?),\s*-?(180(\.0+)?|(1[0-7]\d|[1-9]?\d)(\.\d+)?),\s*-?(90(\.0+)?|[1-8]?\d(\.\d+)?),\s*-?(180(\.0+)?|(1[0-7]\d|[1-9]?\d)(\.\d+)?)$/;

  const validateInput = (val: string) => {
    if (!val) return undefined;

    if (mapOption === SpatialAreaType.COORDINATES) {
      return regexCoordinate.test(val);
    } else {
      return regexBBox.test(val);
    }
  };

  const handleInput = (event: CustomEvent) => {
    const val = (event.target as HTMLInputElement).value;
    // setInputValue(val);

    const valid = validateInput(val);
    setIsValid(valid);

    if (valid && onChange) {
      const nums = val.split(",").map((v) => Number(v.trim()));
      onChange(nums);
    }
  };

  const markTouched = () => setIsTouched(true);

  return (
    <IonFooter id="location-footer">
      <IonToolbar>
        <IonItem>
          <IonLabel position="floating">
            {mapOption === SpatialAreaType.COORDINATES
              ? "Lat, Lng"
              : "South, West, North, East"}
          </IonLabel>
          <IonInput
            // value={value}
            onIonInput={handleInput}
            onIonBlur={markTouched}
            className={`${isValid ? "ion-valid" : ""} ${
              isValid === false ? "ion-invalid" : ""
            } ${isTouched ? "ion-touched" : ""}`}
            placeholder={
              mapOption === SpatialAreaType.COORDINATES
                ? "e.g. 34.1234, -118.1234"
                : "e.g. 33.0, -119.0, 35.0, -117.0"
            }
            inputMode="decimal"
            fill="solid"
          />
          {isTouched && isValid === false && (
            <IonText color="danger">Invalid {mapOption} input</IonText>
          )}
        </IonItem>
      </IonToolbar>
    </IonFooter>
  );
};

export default CoordinateInput;
