import React, { useState } from "react";
import {
  IonDatetime,
  // IonButton,
  IonCol,
  DatetimeChangeEventDetail,
} from "@ionic/react";

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
  // const [showDatePicker, setShowDatePicker] = useState(true);

  const datePickHandler = (event: CustomEvent<DatetimeChangeEventDetail>) => {
    const selectedDate = event.detail.value as string;
    onDateUpdate(selectedDate);
    setDate(selectedDate);
    // setShowDatePicker(false);
  };

  return (
    //  <IonButton
    //   color="primary"
    //   onClick={() => setShowDatePicker((prevState) => !prevState)}
    // >
    //   {label}
    // </IonButton>
    // {showDatePicker && (
    //   <IonDatetime
    //     presentation="date"
    //     value={date}
    //     onIonChange={datePickHandler}
    //     max={maxDatetimeAllowed}
    //     min={minDatetimeAllowed}
    //   />
    // )}
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
