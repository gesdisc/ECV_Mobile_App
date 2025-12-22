import React from "react";
import {
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonLabel,
  IonList,
} from "@ionic/react";

import catalog from "./catalog.json";

interface VariablesProps {
  onVariableChange: (value: string) => void;
}

const topics = ["Atmosphere", "Land", "Ocean"];

const Variables: React.FC<VariablesProps> = ({ onVariableChange }) => {
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
