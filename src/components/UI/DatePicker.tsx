import React, { useState } from "react";
import { IonDatetime, IonButton, IonCol } from "@ionic/react";

interface DatePickerProps {
  label: string;
  defaultDate: string;
  containerClass?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  defaultDate,
  containerClass = "",
}) => {
  const [date, setDate] = useState<string>(new Date(defaultDate).toISOString());
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <IonCol className={containerClass}>
      <IonButton
        color="primary"
        onClick={() => setShowDatePicker((prevState) => !prevState)}
      >
        {label}
      </IonButton>
      {showDatePicker && (
        <IonDatetime
          presentation="date"
          value={date}
          onIonChange={(e) => {
            setDate(e.detail.value as string);
            setShowDatePicker(false);
          }}
        />
      )}
    </IonCol>
  );
};

export default DatePicker;
