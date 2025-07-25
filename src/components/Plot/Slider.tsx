import React, { useEffect } from "react";
import {
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonRange,
  IonIcon,
} from "@ionic/react";
import { caretForwardSharp, caretBackSharp } from "ionicons/icons";

import styles from "./Slider.module.css";

interface SliderProps {
  onLeftBtnClick: (event: any) => void;
  onRightBtnClick: (event: any) => void;
  onValueChange: (event: any) => void;
  pinFormatter?: (index: number) => string;
  value: number;
  max?: number;
  min?: number;
  width?: number;
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
  width,
  disabled = false,
}) => {
  // useEffect(() => {
  //   if (plotRef !== null && plotRef.current !== null) {
  //     console.log(plotRef.current.el.getBoundingClientRect().width);
  //     // console.log(plotRef.current.el.querySelector(".nsewdrag.drag").width);
  //     // console.log(plotRef.current.el.querySelector(".nsewdrag.drag"));
  //   }
  //   // const checkWidth = () => {
  //   //   if (document.querySelector(".nsewdrag.drag") !== null) {
  //   //     const rect = document
  //   //       .querySelector(".nsewdrag.drag")!
  //   //       .getBoundingClientRect();
  //   //     console.log("x coord", rect.x);
  //   //   }
  //   // };
  //   // checkWidth();
  // }, [plotRef]);

  // useEffect(() => {
  //   if (plotRef.current !== null) {
  //     console.log((plotRef.current as any).el.getBoundingClientRect().width);
  //     console.log((plotRef.current as any).el.querySelector(".nsewdrag.drag"));
  //   }
  // }, []);

  return (
    <IonGrid style={{ display: "flex", justifyContent: "center" }}>
      <IonRow
        style={{
          width: width,
        }}
        class="ion-justify-content-center"
      >
        <IonCol>
          <IonRange
            className={styles["ion-range"]}
            // style={{ maxWidth: "500px", width: width }}
            step={1}
            min={min}
            max={max}
            value={value}
            pin={true}
            pinFormatter={pinFormatter}
            onIonInput={onValueChange}
            disabled={disabled}
            ticks={true}
            snaps={true}
          ></IonRange>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <IonButton
              disabled={disabled}
              size="default"
              onClick={onLeftBtnClick}
            >
              <IonIcon aria-hidden="true" size="medium" icon={caretBackSharp} />
            </IonButton>
            <IonButton
              disabled={disabled}
              size="default"
              onClick={onRightBtnClick}
            >
              <IonIcon
                aria-hidden="true"
                size="medium"
                icon={caretForwardSharp}
              />
            </IonButton>
          </div>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default Slider;
