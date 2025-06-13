import React, { useState } from "react";
import {
  IonDatetime,
  IonButton,
  IonCol,
  DatetimeChangeEventDetail,
} from "@ionic/react";

interface DatePickerProps {
  label: string;
  defaultDate: string;
  containerClass?: string;
  onDateUpdate: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  defaultDate,
  containerClass = "",
  onDateUpdate,
}) => {
  const [date, setDate] = useState<string>(new Date(defaultDate).toISOString());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const datePickHandler = (event: CustomEvent<DatetimeChangeEventDetail>) => {
    // TODO: check type
    const selectedDate = event.detail.value as string;
    onDateUpdate(selectedDate);
    setDate(selectedDate);
    setShowDatePicker(false);
  };

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
          onIonChange={datePickHandler}
        />
      )}
    </IonCol>
  );
};

export default DatePicker;
