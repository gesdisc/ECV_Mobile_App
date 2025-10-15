import React from "react";
import { IonButton, IonRange, IonIcon, RangeCustomEvent } from "@ionic/react";
import { caretForwardSharp, caretBackSharp } from "ionicons/icons";

import styles from "./Slider.module.css";

interface SliderProps {
  onLeftBtnClick: (
    event: React.MouseEvent<HTMLIonButtonElement, MouseEvent>
  ) => void;
  onRightBtnClick: (
    event: React.MouseEvent<HTMLIonButtonElement, MouseEvent>
  ) => void;
  onValueChange: (event: RangeCustomEvent) => void;
  pinFormatter?: (index: number) => string;
  value: number;
  max?: number;
  min?: number;
  disabled?: boolean;
  startDate: string;
  endDate: string;
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
  startDate,
  endDate,
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
      >
        <span slot="end" className={styles["date-range"]}>
          {startDate}
        </span>
        <span slot="start" className={styles["date-range"]}>
          {endDate}
        </span>
      </IonRange>
      <div className={styles.buttons}>
        <IonButton
          disabled={disabled}
          size="default"
          onClick={onLeftBtnClick}
          fill="clear"
        >
          <IonIcon
            aria-hidden="true"
            size="large"
            icon={caretBackSharp}
            slot="icon-only"
          />
        </IonButton>
        <IonButton
          disabled={disabled}
          size="default"
          onClick={onRightBtnClick}
          fill="clear"
        >
          <IonIcon
            aria-hidden="true"
            size="large"
            icon={caretForwardSharp}
            slot="icon-only"
          />
        </IonButton>
      </div>
    </>
  );
};

export default Slider;
