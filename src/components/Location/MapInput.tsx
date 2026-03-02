import React, { useEffect, useState } from "react";
import {
  IonFooter,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonToolbar,
} from "@ionic/react";

import { SpatialAreaType } from "../../types/time-series.types";

interface CoordinateInputProps {
  mapOption: SpatialAreaType;
  value: string;
  onChange: (nums: number[]) => void;
}

const regexCoordinate =
  /^-?(90(\.0+)?|[1-8]?\d(\.\d+)?),\s*-?(180(\.0+)?|(1[0-7]\d|[1-9]?\d)(\.\d+)?)$/;

const regexBBox =
  /^-?(90(\.0+)?|[1-8]?\d(\.\d+)?),\s*-?(180(\.0+)?|(1[0-7]\d|[1-9]?\d)(\.\d+)?),\s*-?(90(\.0+)?|[1-8]?\d(\.\d+)?),\s*-?(180(\.0+)?|(1[0-7]\d|[1-9]?\d)(\.\d+)?)$/;

// FIXME: Input doesn't work properly: error appears when typing a valid value
// FIXME: typing is messed up
// TODO: FINISH IMPLEMENTING THE INPUT
const CoordinateInput: React.FC<CoordinateInputProps> = ({
  mapOption,
  value,
  onChange,
}) => {
  // const [isTouched, setIsTouched] = useState(false);
  const [isValid, setIsValid] = useState<boolean>();

  const validateInput = (val: string) => {
    if (!val) return undefined;

    if (mapOption === SpatialAreaType.COORDINATES) {
      return regexCoordinate.test(val);
    } else {
      return regexBBox.test(val);
    }
  };

  // trigers after clicking outside of input
  const handleInput = (event: CustomEvent) => {
    const val = (event.target as HTMLInputElement).value;
    const valid = validateInput(val);
    setIsValid(valid);
    const nums = val.split(",").map((v) => Number(v.trim()));
    if (valid) onChange(nums);
  };

  // const markTouched = () => setIsTouched(true);

  // trigers on input change
  const handleChange = (event: any) => {
    const val = (event.target as HTMLInputElement).value;
    const valid = validateInput(val);
    const nums = val.split(",").map((v) => Number(v.trim()));
    if (valid) onChange(nums);
  };

  useEffect(() => {
    const valid = validateInput(value);
    setIsValid(valid);
  }, [value]);

  return (
    <IonFooter id="location-footer">
      <IonToolbar>
        <IonItem>
          <IonLabel position="floating">
            {mapOption === SpatialAreaType.COORDINATES
              ? "Lat, Lng"
              : "West, South, East, North "}
          </IonLabel>
          <IonInput
            value={value}
            onIonChange={handleInput}
            onIonInput={handleChange}
            // onIonBlur={markTouched}
            className={`${isValid ? "ion-valid" : ""} ${
              isValid === false ? "ion-invalid" : ""
            }`}
            placeholder={
              mapOption === SpatialAreaType.COORDINATES
                ? "e.g. 34.1234, -118.1234"
                : "e.g. 33.0, -119.0, 35.0, -117.0"
            }
            inputMode="decimal"
            fill="solid"
          />
          {isValid === false && (
            <IonText color="danger">Invalid {mapOption} input</IonText>
          )}
        </IonItem>
      </IonToolbar>
    </IonFooter>
  );
};

export default CoordinateInput;
