import React from "react";
import {
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
} from "@ionic/react";
import { analyticsOutline } from "ionicons/icons";

import catalog from "./catalog.json";
import { useDataParams } from "../../store/DataParamsContext";

interface VariablesProps {
  onVariableChange: (value: string) => void;
}

const topics = ["Atmosphere", "Land", "Ocean"];

const Variables: React.FC<VariablesProps> = ({ onVariableChange }) => {
  const { variable } = useDataParams();
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
                  // color="ligth"
                >
                  <IonLabel>{data.label}</IonLabel>
                  {/* {variable === data.dataFieldId && (
                    <IonIcon icon={analyticsOutline}></IonIcon>
                  )} */}
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
