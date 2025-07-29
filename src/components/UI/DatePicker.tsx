import React, { useState } from "react";
import { IonDatetime, IonCol, DatetimeChangeEventDetail } from "@ionic/react";

interface DatePickerProps {
  label: string;
  defaultDate: string;
  containerClass?: string;
  minDatetimeAllowed?: string;
  maxDatetimeAllowed?: string;
  onDateUpdate: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  defaultDate,
  minDatetimeAllowed = "",
  maxDatetimeAllowed = "",
  containerClass = "",
  onDateUpdate,
}) => {
  const [date, setDate] = useState<string>(new Date(defaultDate).toISOString());

  const datePickHandler = (event: CustomEvent<DatetimeChangeEventDetail>) => {
    const selectedDate = event.detail.value as string;
    onDateUpdate(selectedDate);
    setDate(selectedDate);
  };

  return (
    <IonCol className={containerClass}>
      <IonDatetime
        presentation="date"
        value={date}
        onIonChange={datePickHandler}
        max={maxDatetimeAllowed}
        min={minDatetimeAllowed}
      >
        <span slot="title">{label}</span>
      </IonDatetime>
    </IonCol>
  );
};

export default DatePicker;
