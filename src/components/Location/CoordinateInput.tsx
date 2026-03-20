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
import { useActionListener } from "../../hooks/useActionListener";
import { ActionType, useDataParams } from "../../store/DataParamsContext";

interface CoordinateInputProps {
  mapDrawingOption: SpatialAreaType;
  value: string;
  error: string | null;
  onChange: (nums: string) => void;
  onMapDrawingOptionChange: (option: SpatialAreaType) => void;
}

const CoordinateInput: React.FC<CoordinateInputProps> = ({
  mapDrawingOption,
  value,
  error,
  onChange,
  onMapDrawingOptionChange,
}) => {
  const [rawInput, setRawInput] = useState<string>(value);
  const [isFocused, setIsFocused] = useState(false);
  const { params: ctxParams } = useDataParams();

  // trigers on input change
  const handleChange = (event: CustomEvent) => {
    const inputVal = (event.target as HTMLInputElement).value;

    const parts = inputVal.split(",").map((v) => v.trim());
    const coords = parts.map((v) => Number(v));

    if (coords.length > 2) {
      // switch to bbox if user entered more than 2 coordinates
      onMapDrawingOptionChange(SpatialAreaType.BOUNDING_BOX);
    } else {
      // switch to coordinates if user entered 2 or less coordinates
      onMapDrawingOptionChange(SpatialAreaType.COORDINATES);
    }

    setRawInput(inputVal);
    onChange(inputVal);
  };

  const handleBlur = () => {
    // if input is empty, reset to last valid value
    if (rawInput.trim() === "") {
      setRawInput(value);
    }
    setIsFocused(false);
  };

  // listen to toast cancel action
  useActionListener(ActionType.CANCEL, () => {
    // Restore input value after user canceled modified parameters
    setRawInput(Object.values(ctxParams.spatialArea.value).join(","));
  });

  // Update value when external changes happen (eg. Map Drawing)
  useEffect(() => {
    if (isFocused) return;
    setRawInput(value);
  }, [value]);

  // TODO: When user clears bbox input, wrong error is shown. E.g. if user cleares the last two coordinates (east,north) of "-117.0703,-9.1021,86.1328,76.3519", leaving "-117.0703,-9.1021" in the input, error message "Input must contain exactly 2 or 4 numbers" is shown, which is wrong. In this case, the correct error message should be "Coordinates must be within valid range (lat: -90 to 90, lng: -180 to 180)" because the remaining coordiantes are out of range. No error if the remaining coordinates are valid.
  return (
    <IonFooter id="location-footer">
      <IonToolbar>
        <IonItem>
          <IonLabel position="floating">
            {mapDrawingOption === SpatialAreaType.COORDINATES
              ? "Lat, Lng"
              : "West, South, East, North"}
          </IonLabel>
          <IonInput
            clearInput
            value={rawInput}
            onIonInput={handleChange}
            onIonFocus={() => setIsFocused(true)}
            onIonBlur={handleBlur}
            className={`${error ? "ion-invalid" : "ion-valid"}`}
            placeholder={
              mapDrawingOption === SpatialAreaType.COORDINATES
                ? "e.g. 34.12, -18.12"
                : "e.g. 33.0, -19.0, 35.0, -17.0"
            }
            inputMode="text"
            fill="solid"
            pattern="[0-9.,\-]*"
          />
          {error && <IonText color="danger">{error}</IonText>}
        </IonItem>
      </IonToolbar>
    </IonFooter>
  );
};

export default CoordinateInput;
