import React from "react";
import { IonItem, IonList, IonSelect, IonSelectOption } from "@ionic/react";

import { TimeIntervals, TimeIntervalKey } from "../../constants/time-series";

interface TimeIntervalProps {
  onIntervalChange: (interval: string) => void;
  currentProductTimeInterval: TimeIntervalKey;
  selectedOption: TimeIntervalKey;
}

const TimeInterval: React.FC<TimeIntervalProps> = ({
  onIntervalChange,
  currentProductTimeInterval,
  selectedOption,
}) => {
  const timeIntervalOptions = () => {
    return Object.entries(TimeIntervals).map(([key, value]) => (
      <IonSelectOption
        key={key}
        disabled={value < TimeIntervals[currentProductTimeInterval]}
        value={key}
      >
        {key}
      </IonSelectOption>
    ));
  };

  return (
    <IonList className="ion-margin-top">
      <IonItem>
        <IonSelect
          interface="popover"
          placeholder="Time Interval"
          onIonChange={(e) => onIntervalChange(e.detail.value)}
          value={selectedOption}
        >
          {timeIntervalOptions()}
        </IonSelect>
      </IonItem>
    </IonList>
  );
};

export default TimeInterval;
