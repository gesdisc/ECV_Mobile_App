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

const Variables: React.FC<VariablesProps> = ({ onVariableChange }) => {
  // const [expanded, setExpanded] = useState<string>("");
  const handleClick = (value: string) => {
    onVariableChange(value);
  };

  //   const handleItemClick = (value: string) => {
  //     setExpanded(expanded === value ? "" : value);
  //     if (value === "precipitation") {
  //       handleClick();
  //     }
  //   };

  const topics = ["Atmosphere", "Land"];

  const displayCatalog = topics.map((cat) => {
    return (
      <IonAccordion key={cat} value={cat}>
        <IonItem slot="header" color="primary">
          <IonLabel>{cat}</IonLabel>
        </IonItem>
        <IonList slot="content">
          {catalog
            .filter((obj) => obj.topic === cat)
            .map((obj) => {
              return (
                <IonItem
                  button
                  onClick={handleClick.bind(null, obj.variable)}
                  key={obj.label}
                  color="light"
                >
                  <IonLabel>{obj.label}</IonLabel>
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
