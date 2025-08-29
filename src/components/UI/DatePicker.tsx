import React, { useState } from "react";
import { IonDatetime, DatetimeChangeEventDetail } from "@ionic/react";

interface DatePickerProps {
  label: string;
  defaultDate: string;
  minDatetimeAllowed?: string;
  maxDatetimeAllowed?: string;
  onDateUpdate: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  defaultDate,
  minDatetimeAllowed = "",
  maxDatetimeAllowed = "",
  onDateUpdate,
}) => {
  const [date, setDate] = useState<string>(new Date(defaultDate).toISOString());

  const datePickHandler = (event: CustomEvent<DatetimeChangeEventDetail>) => {
    const selectedDate = event.detail.value as string;
    onDateUpdate(selectedDate);
    setDate(selectedDate);
  };

  return (
    <IonDatetime
      presentation="date"
      value={date}
      onIonChange={datePickHandler}
      max={maxDatetimeAllowed}
      min={minDatetimeAllowed}
      style={{ width: "100%" }}
    >
      <span slot="title">{label}</span>
    </IonDatetime>
  );
};

export default DatePicker;
