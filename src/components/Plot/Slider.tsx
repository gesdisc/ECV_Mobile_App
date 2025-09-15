import React from "react";
import { IonButton, IonRange, IonIcon } from "@ionic/react";
import { caretForwardSharp, caretBackSharp } from "ionicons/icons";

import { MARGIN_INLINE } from "./plotSchema";

import styles from "./Slider.module.css";

interface SliderProps {
  onLeftBtnClick: (event: any) => void;
  onRightBtnClick: (event: any) => void;
  onValueChange: (event: any) => void;
  pinFormatter?: (index: number) => string;
  value: number;
  max?: number;
  min?: number;
  disabled?: boolean;
}

const Slider: React.FC<SliderProps> = ({
  onLeftBtnClick,
  onRightBtnClick,
  onValueChange,
  pinFormatter,
  value,
  max,
  min,
  disabled = false,
}) => {
  return (
    <>
      <IonRange
        className={`ion-no-padding ${styles["ion-range"]}`}
        style={{
          width: `calc(100% - ${160}px)`,
        }}
        step={1}
        min={min}
        max={max}
        value={value}
        pin={true}
        pinFormatter={pinFormatter}
        onIonInput={onValueChange}
        disabled={disabled}
        // ticks={true}
        // snaps={true}
      ></IonRange>
      <div className={styles.buttons}>
        <IonButton disabled={disabled} size="small" onClick={onLeftBtnClick}>
          <IonIcon aria-hidden="true" size="default" icon={caretBackSharp} />
        </IonButton>
        <IonButton disabled={disabled} size="small" onClick={onRightBtnClick}>
          <IonIcon aria-hidden="true" size="default" icon={caretForwardSharp} />
        </IonButton>
      </div>
    </>
  );
};

export default Slider;
