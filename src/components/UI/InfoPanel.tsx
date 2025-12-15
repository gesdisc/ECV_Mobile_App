import React, { useRef } from "react";

import { IonContent, IonItem, IonLabel, IonList, IonModal } from "@ionic/react";

interface ListItem {
  label: string;
  value?: string | number;
  link?: string;
}

interface List {
  title: string;
  list: ListItem[];
}

interface InfoPanelProps {
  dataList: List;
  isOpen?: boolean;
  afterDismiss?: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  dataList,
  isOpen,
  afterDismiss,
}) => {
  const dataInfoModal = useRef<HTMLIonModalElement>(null);

  const displayList = () => {
    return dataList.list.map((item) => {
      const value =
        item.value === "" || item.value === undefined ? "N/A" : item.value;

      if (item.link) {
        return (
          <IonItem key={item.label}>
            <IonLabel>
              <a href={item.link} rel="noopener noreferrer" target="_blank">
                {item.label}
              </a>
            </IonLabel>
          </IonItem>
        );
      }

      return (
        <IonItem key={item.label}>
          <IonLabel>
            <span style={{ fontWeight: "bold" }}>{item.label}: </span>
            {value}
          </IonLabel>
        </IonItem>
      );
    });
  };

  return (
    <IonModal
      ref={dataInfoModal}
      initialBreakpoint={0.5}
      breakpoints={[0, 1]}
      isOpen={isOpen}
      onDidDismiss={afterDismiss}
    >
      <IonContent className="ion-padding">
        <IonList>
          <IonItem slot="header" color="primary">
            <IonLabel>{dataList.title}</IonLabel>
          </IonItem>
          {displayList()}
        </IonList>
      </IonContent>
    </IonModal>
  );
};

export default InfoPanel;
