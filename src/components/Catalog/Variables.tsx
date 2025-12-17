import React from "react";
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
} from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";

import catalog from "./catalog.json";

interface VariablesProps {
  onVariableChange: (dataFieldId: string) => void;
  onRequestInfo: (dataFieldId: string) => void;
}

const topics = ["Atmosphere", "Land", "Ocean"];

const Variables: React.FC<VariablesProps> = ({
  onVariableChange,
  onRequestInfo,
}) => {
  const displayCatalog = topics.map((topic) => {
    return (
      <IonAccordion key={topic} value={topic}>
        <IonItem slot="header" color="primary">
          <IonLabel>{topic}</IonLabel>
        </IonItem>
        <IonList slot="content">
          {catalog
            .filter((data) => data.group === topic)
            .map((data) => {
              return (
                <IonItem
                  button
                  onClick={() => onVariableChange(data.dataFieldId)}
                  key={data.label}
                >
                  <IonLabel>{data.label}</IonLabel>
                  <IonButton
                    size="small"
                    fill="clear"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestInfo(data.dataFieldId);
                    }}
                  >
                    <IonIcon
                      aria-hidden="true"
                      size="large"
                      icon={informationCircleOutline}
                    />
                  </IonButton>
                </IonItem>
              );
            })}
        </IonList>
      </IonAccordion>
    );
  });

  return <IonAccordionGroup>{displayCatalog}</IonAccordionGroup>;
};

export default Variables;
