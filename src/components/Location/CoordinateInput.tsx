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
import { validateCoordinates } from "./helpers";

interface CoordinateInputProps {
  mapDrawingOption: SpatialAreaType;
  value: string;
  onChange: (nums: string) => void;
  error: string | null;
}

// FIXME: typing is messed up
// FIXME: when invalid data is entered, the input will restore the previous value and print error: WE NEED TO EITHER PRINT THE ERROR AND LEAVE THE USER ENTERED VALUES OR
// TODO: FINISH IMPLEMENTING THE INPUT
const CoordinateInput: React.FC<CoordinateInputProps> = ({
  mapDrawingOption,
  value,
  onChange,
  error,
}) => {
  // const [isTouched, setIsTouched] = useState(false);

  // trigers after clicking outside of input
  // const handleInput = (event: CustomEvent) => {
  //   const inputVal = (event.target as HTMLInputElement).value;
  //   console.log("after input change: ", inputVal);
  //   // const { coords, error } = validateCoordinates(inputVal, mapDrawingOption);

  //   onChange(inputVal);
  // };

  // const markTouched = () => setIsTouched(true);

  // trigers on input change
  const handleChange = (event: any) => {
    const inputVal = (event.target as HTMLInputElement).value;

    onChange(inputVal);
  };

  // useEffect(() => {
  //   const valid = validateInput(value);
  //   // setIsValid(valid);
  // }, []);
  // console.log("INPUT RENDER: ", error);
  return (
    <IonFooter id="location-footer">
      <IonToolbar>
        <IonItem>
          <IonLabel position="floating">
            {mapDrawingOption === SpatialAreaType.COORDINATES
              ? "Lat, Lng"
              : "West, South, East, North "}
          </IonLabel>
          <IonInput
            // clearInput FIXME: clears at second try
            value={value}
            // onIonChange={handleInput}
            onIonInput={handleChange}
            // onIonBlur={markTouched}
            className={`${error ? "ion-invalid" : "ion-valid"}`}
            placeholder={
              mapDrawingOption === SpatialAreaType.COORDINATES
                ? "e.g. 34.1234, -118.1234"
                : "e.g. 33.0, -119.0, 35.0, -117.0"
            }
            inputMode="decimal"
            fill="solid"
          />
          {error && <IonText color="danger">{error}</IonText>}
        </IonItem>
      </IonToolbar>
    </IonFooter>
  );
};

export default CoordinateInput;
