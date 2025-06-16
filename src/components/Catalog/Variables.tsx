import React from "react";
import {
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
} from "@ionic/react";

import catalog from "./catalog.json";

interface VariablesProps {
  onVariableChange: (value: string) => void;
}

// const topics = [
//   { group: "Atmosphere", subgroups: ["Surface", "Atmospheric Composition"] },
//   { group: "Land", subgroup: ["Hydrology", "Cryosphere", "Biology"] },
//   { group: "Ocean", subgroup: "" },
// ];
const topics = ["Atmosphere", "Land", "Ocean"];

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
                  onClick={handleClick.bind(null, data.dataFieldId)}
                  key={data.label}
                  color="light"
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
